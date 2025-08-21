package com.examly.springapp.controller;

import com.examly.springapp.dto.AvailabilityDto;
import com.examly.springapp.model.Doctor;
import com.examly.springapp.model.DoctorAvailability;
import com.examly.springapp.service.AvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    // Get doctor's availability for a specific date - accessible to all authenticated users
    @GetMapping("/doctors/{doctorId}/availability")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<?> getDoctorAvailability(
            @PathVariable String doctorId,
            @RequestParam String date) {
        try {
            LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
            String dayOfWeek = localDate.getDayOfWeek().toString(); // MONDAY, TUESDAY...
            
            Long docId = Long.parseLong(doctorId);
            List<String> timeSlots = availabilityService.getAvailableTimeSlots(docId, dayOfWeek);
            
            return ResponseEntity.ok(timeSlots);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid doctor ID format"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch availability: " + e.getMessage()));
        }
    }

    // Get doctor's complete availability schedule - accessible to all authenticated users
    @GetMapping("/doctors/{doctorId}/availability/schedule")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<?> getDoctorSchedule(@PathVariable String doctorId) {
        try {
            Long docId = Long.parseLong(doctorId);
            List<DoctorAvailability> availability = availabilityService.getDoctorAvailability(docId);
            return ResponseEntity.ok(availability);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid doctor ID format"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch doctor schedule: " + e.getMessage()));
        }
    }

    // Get availability for a specific day - accessible to all authenticated users
    @GetMapping("/doctors/{doctorId}/availability/{day}")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<?> getDoctorAvailabilityForDay(
            @PathVariable String doctorId,
            @PathVariable String day) {
        try {
            Long docId = Long.parseLong(doctorId);
            List<String> timeSlots = availabilityService.getAvailableTimeSlots(docId, day.toUpperCase());
            return ResponseEntity.ok(timeSlots);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid doctor ID format"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch availability for day: " + e.getMessage()));
        }
    }

    // Check if doctor is available - accessible to all authenticated users
    @GetMapping("/doctors/{doctorId}/availability/check")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR', 'ROLE_ADMIN')")
    public ResponseEntity<?> checkAvailability(
            @PathVariable String doctorId,
            @RequestParam String appointmentDate,
            @RequestParam String timeSlot) {
        try {
            // Parse the date to get day of week
            LocalDate localDate = LocalDate.parse(appointmentDate, DateTimeFormatter.ISO_DATE);
            String dayOfWeek = localDate.getDayOfWeek().toString();
            
            boolean isAvailable = availabilityService.isAvailable(doctorId, dayOfWeek, timeSlot);
            return ResponseEntity.ok(Map.of(
                    "available", isAvailable,
                    "doctorId", doctorId,
                    "appointmentDate", appointmentDate,
                    "timeSlot", timeSlot,
                    "dayOfWeek", dayOfWeek
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to check availability: " + e.getMessage()));
        }
    }

    // Note: The following endpoints would require additional service methods that aren't currently implemented
    
    // Set/Update doctor's availability - only the doctor themselves or admin
    @PostMapping("/doctors/{doctorId}/availability")
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_DOCTOR') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> setDoctorAvailability(
            @PathVariable String doctorId,
            @RequestBody AvailabilityDto availabilityDto,
            Authentication authentication) {
        
        System.out.println("🔍 POST /api/doctors/" + doctorId + "/availability called");
        System.out.println("🔑 Authentication: " + authentication.getName());
        System.out.println("🔑 Authorities: " + authentication.getAuthorities());
        System.out.println("📊 Request body: " + availabilityDto);
        
        try {
            // If user is DOCTOR, they can only update their own availability
            if (authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_DOCTOR"))) {
                
                // Get current user's ID from the database to verify
                String currentUserEmail = authentication.getName();
                String currentDoctorId = availabilityService.getDoctorIdByEmail(currentUserEmail);
                
                System.out.println("👤 Current user email: " + currentUserEmail);
                System.out.println("👤 Current doctor ID: " + currentDoctorId);
                System.out.println("📋 Requested doctor ID: " + doctorId);
                
                if (!doctorId.equals(currentDoctorId)) {
                    System.out.println("❌ Access denied: Doctor ID mismatch");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "You can only update your own availability"));
                }
            }
            
            // Convert DTO to service format
            List<AvailabilityService.AvailabilityData> availabilityData = availabilityDto.getAvailability()
                .stream()
                .map(dto -> new AvailabilityService.AvailabilityData(
                    dto.getDayOfWeek(), 
                    dto.getTimeSlots(), 
                    dto.isActive()
                ))
                .collect(java.util.stream.Collectors.toList());
            
            List<DoctorAvailability> savedAvailability = availabilityService.setDoctorAvailability(
                    doctorId, availabilityData);
            
            System.out.println("✅ Availability saved successfully");
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Availability updated successfully",
                    "data", savedAvailability
            ));
        } catch (IllegalArgumentException e) {
            System.out.println("❌ Bad request: " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.out.println("❌ Internal error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save availability: " + e.getMessage()));
        }
    }

    // Delete doctor's availability - only admin or the doctor themselves
    @DeleteMapping("/doctors/{doctorId}/availability")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or (hasAuthority('ROLE_DOCTOR') and @availabilityService.isDoctorOwner(#doctorId, authentication.name))")
    public ResponseEntity<?> deleteDoctorAvailability(@PathVariable String doctorId) {
        try {
            availabilityService.deleteDoctorAvailability(doctorId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Availability deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete availability: " + e.getMessage()));
        }
    }

    // Get all available doctors - accessible to patients and admins
    @GetMapping("/availability/doctors")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_ADMIN')")
    public ResponseEntity<?> getAvailableDoctors(
            @RequestParam String day,
            @RequestParam String timeSlot) {
        try {
            List<Doctor> availableDoctors = availabilityService.getAvailableDoctors(day, timeSlot);
            return ResponseEntity.ok(availableDoctors);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch available doctors: " + e.getMessage()));
        }
    }
}