package com.examly.springapp.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.model.Appointment;
import com.examly.springapp.model.AppointmentStatus;
import com.examly.springapp.model.Doctor;
import com.examly.springapp.model.Doctor.ProfileStatus;
import com.examly.springapp.model.DoctorAvailability;
import com.examly.springapp.service.AppointmentService;
import com.examly.springapp.service.DoctorService;
import com.examly.springapp.service.DoctorService.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {
    
    @Autowired
    private DoctorService doctorService;
    
    @Autowired
    private AppointmentService appointmentService;

    // =============================================================================
    // FR2: Admin Features for Doctor Profile Management
    // =============================================================================

    /**
     * Admin creates new doctor profile with complete information
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/profile")
    public ResponseEntity<?> createDoctorProfile(@Valid @RequestBody CreateDoctorProfileRequest request) {
        try {
            Doctor createdDoctor = doctorService.createDoctorProfile(request);
            return new ResponseEntity<>(createdDoctor, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create doctor profile: " + e.getMessage());
        }
    }

    /**
     * Admin updates existing doctor profile
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateDoctorProfile(@PathVariable Long id, @RequestBody UpdateDoctorProfileRequest request) {
        try {
            Doctor updatedDoctor = doctorService.updateDoctorProfile(id, request);
            return ResponseEntity.ok(updatedDoctor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update doctor profile: " + e.getMessage());
        }
    }

    /**
     * Admin links doctor profile to existing user account
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{doctorId}/link-user/{userId}")
    public ResponseEntity<?> linkDoctorToUser(@PathVariable Long doctorId, @PathVariable Long userId) {
        try {
            Doctor updatedDoctor = doctorService.linkDoctorToUser(doctorId, userId);
            return ResponseEntity.ok(updatedDoctor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to link doctor to user: " + e.getMessage());
        }
    }

    /**
     * Admin gets all doctor profiles with filtering
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/profiles")
    public ResponseEntity<List<Doctor>> getAllDoctorProfiles(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) ProfileStatus status,
            @RequestParam(required = false) String clinicName) {
        try {
            DoctorFilterRequest filter = new DoctorFilterRequest();
            filter.setSpecialization(specialization);
            filter.setStatus(status);
            filter.setClinicName(clinicName);
            
            List<Doctor> doctorList = doctorService.getAllDoctorProfiles(filter);
            return ResponseEntity.ok(doctorList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // =============================================================================
    // FR2: Doctor Features for Own Profile Management
    // =============================================================================

    /**
     * Doctor views their own complete profile
     */
    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            Doctor doctor = doctorService.getMyProfile(email);
            return ResponseEntity.ok(doctor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get profile: " + e.getMessage());
        }
    }

    /**
     * Doctor updates their own profile information
     */
    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/my-profile")
    public ResponseEntity<?> updateMyProfile(@RequestBody UpdateMyProfileRequest request, Authentication authentication) {
        try {
            String email = authentication.getName();
            Doctor updatedDoctor = doctorService.updateMyProfile(email, request);
            return ResponseEntity.ok(updatedDoctor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update profile: " + e.getMessage());
        }
    }

    // =============================================================================
    // Enhanced existing endpoints
    // =============================================================================

    /**
     * Get doctor profile by ID with full details
     */
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @GetMapping("/{id}/profile")
    public ResponseEntity<Doctor> getDoctorProfile(@PathVariable Long id) {
        try {
            Doctor doctor = doctorService.getDoctorById(id);
            return doctor != null ? ResponseEntity.ok(doctor) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search doctors by clinic name
     */
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @GetMapping("/clinic/{clinicName}")
    public ResponseEntity<List<Doctor>> getDoctorsByClinic(@PathVariable String clinicName) {
        try {
            DoctorFilterRequest filter = new DoctorFilterRequest();
            filter.setClinicName(clinicName);
            List<Doctor> doctorList = doctorService.getAllDoctorProfiles(filter);
            return ResponseEntity.ok(doctorList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // =============================================================================
    // Existing endpoints from your current controller
    // =============================================================================

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@Valid @RequestBody Doctor doctor) {
        try {
            Doctor createdDoctor = doctorService.createDoctor(doctor);
            return new ResponseEntity<>(createdDoctor, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        try {
            System.out.println("🔍 Loading all doctors...");
            List<Doctor> doctorList = doctorService.getAllDoctors();
            System.out.println("✅ Found " + doctorList.size() + " doctors");
            return new ResponseEntity<>(doctorList, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("❌ Error loading doctors: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        try {
            Doctor doctor = doctorService.getDoctorById(id);
            return doctor != null ? ResponseEntity.ok(doctor) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/docdelete/{id}")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long id) {
        try {
            String result = doctorService.deleteDoctor(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete doctor");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor doctor) {
        try {
            Doctor updated = doctorService.updateDoctor(id, doctor);
            return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @PostMapping("/{id}/availability")
    public ResponseEntity<String> setDoctorAvailability(@PathVariable Long id, @RequestBody AvailabilityRequest availabilityRequest, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            boolean isOwnProfile = doctorService.isDoctorOwner(id, userEmail);
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin && !isOwnProfile) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only set your own availability");
            }

            String result = doctorService.setDoctorAvailability(id, availabilityRequest);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error setting availability: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update availability: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @GetMapping("/{id}/availability")
    public ResponseEntity<List<DoctorAvailability>> getDoctorAvailability(@PathVariable Long id) {
        try {
            List<DoctorAvailability> availability = doctorService.getDoctorAvailability(id);
            return ResponseEntity.ok(availability);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialization(@PathVariable String specialization) {
        try {
            List<Doctor> doctorList = doctorService.getDoctorsBySpecialization(specialization);
            return ResponseEntity.ok(doctorList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @GetMapping("/specializations")
    public ResponseEntity<List<String>> getAvailableSpecializations() {
        try {
            List<String> specializations = doctorService.getAvailableSpecializations();
            return ResponseEntity.ok(specializations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/me")
    public ResponseEntity<Doctor> getMyBasicProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            Doctor doctor = doctorService.getDoctorByEmail(email);
            return doctor != null ? ResponseEntity.ok(doctor) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // =============================================================================
    // New endpoints for doctor-specific appointments
    // =============================================================================

    /**
     * Doctor gets their own appointments
     */
    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/{id}/appointments")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            Doctor doctor = doctorService.getDoctorById(id);
            if (doctor == null || !doctor.getEmail().equals(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            List<Appointment> appointments = appointmentService.getMyDoctorAppointments(email);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Doctor approves an appointment
     */
    @PreAuthorize("hasRole('DOCTOR')")
    @PatchMapping("/{id}/appointments/{appointmentId}/approve")
    public ResponseEntity<String> approveDoctorAppointment(@PathVariable Long id, @PathVariable Long appointmentId, Authentication authentication) {
        try {
            String email = authentication.getName();
            Doctor doctor = doctorService.getDoctorById(id);
            if (doctor == null || !doctor.getEmail().equals(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only approve your own appointments");
            }
            String result = appointmentService.approveAppointment(appointmentId, email, false);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Doctor rejects an appointment
     */
    @PreAuthorize("hasRole('DOCTOR')")
    @PatchMapping("/{id}/appointments/{appointmentId}/reject")
    public ResponseEntity<String> rejectDoctorAppointment(@PathVariable Long id, @PathVariable Long appointmentId, 
            @RequestParam(required = false) String reason, Authentication authentication) {
        try {
            String email = authentication.getName();
            Doctor doctor = doctorService.getDoctorById(id);
            if (doctor == null || !doctor.getEmail().equals(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only reject your own appointments");
            }
            String result = appointmentService.rejectAppointment(appointmentId, email, false, reason);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    
   

    /**
     * Get doctor dashboard statistics
     */
    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/dashboard/my-stats")
    public ResponseEntity<Map<String, Object>> getMyDoctorStats(Authentication authentication) {
        try {
            String email = authentication.getName();
            Doctor doctor = doctorService.getDoctorByEmail(email);
            
            if (doctor == null) {
                return ResponseEntity.status(404).body(null);
            }
            
            List<Appointment> myAppointments = appointmentService.getAppointmentsByDoctor(doctor);
            String today = LocalDate.now().toString();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalAppointments", myAppointments.size());
            stats.put("pendingAppointments", myAppointments.stream()
                .mapToInt(apt -> (apt.getStatus() == AppointmentStatus.PENDING ||
                                 apt.getStatus() == AppointmentStatus.SCHEDULED) ? 1 : 0)
                .sum());
            stats.put("todayAppointments", myAppointments.stream()
                .mapToInt(apt -> apt.getAppointmentDate().toString().equals(today) ? 1 : 0)
                .sum());
            stats.put("completedToday", myAppointments.stream()
                .mapToInt(apt -> (apt.getAppointmentDate().toString().equals(today) &&
                                 apt.getStatus() == AppointmentStatus.COMPLETED) ? 1 : 0)
                .sum());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error getting doctor stats: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    // Add these methods to your DoctorController.java

/**
 * Get doctor statistics for admin dashboard
 */
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/dashboard/doctor-stats")
public ResponseEntity<Map<String, Object>> getDoctorStats() {
    try {
        List<Doctor> allDoctors = doctorService.getAllDoctors();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDoctors", allDoctors.size());
        
        // Count by specialization
        Map<String, Long> specializationCounts = allDoctors.stream()
            .filter(d -> d.getSpecialization() != null)
            .collect(Collectors.groupingBy(
                Doctor::getSpecialization,
                Collectors.counting()
            ));
        stats.put("specializationDistribution", specializationCounts);
        
        // Count active doctors (those with recent appointments)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        long activeDoctors = allDoctors.stream()
            .filter(doctor -> {
                try {
                    List<Appointment> doctorAppointments = appointmentService.getAppointmentsByDoctor(doctor);
                    return doctorAppointments.stream()
                        .anyMatch(apt -> !apt.getAppointmentDate().isBefore(thirtyDaysAgo));
                } catch (Exception e) {
                    return false;
                }
            })
            .count();
        stats.put("activeDoctors", activeDoctors);
        
        // Calculate average appointments per doctor
        double avgAppointments = allDoctors.stream()
            .mapToInt(doctor -> {
                try {
                    return appointmentService.getAppointmentsByDoctor(doctor).size();
                } catch (Exception e) {
                    return 0;
                }
            })
            .average()
            .orElse(0.0);
        stats.put("avgAppointmentsPerDoctor", Math.round(avgAppointments * 100.0) / 100.0);
        
        return ResponseEntity.ok(stats);
    } catch (Exception e) {
        System.err.println("Error getting doctor stats: " + e.getMessage());
        return ResponseEntity.status(500).body(null);
    }
}

/**
 * Get top performing doctors by appointment count
 */
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/dashboard/top-doctors")
public ResponseEntity<List<Map<String, Object>>> getTopDoctors(@RequestParam(defaultValue = "5") int limit) {
    try {
        List<Doctor> allDoctors = doctorService.getAllDoctors();
        
        List<Map<String, Object>> topDoctors = allDoctors.stream()
            .map(doctor -> {
                int appointmentCount = 0;
                int completedCount = 0;
                try {
                    List<Appointment> appointments = appointmentService.getAppointmentsByDoctor(doctor);
                    appointmentCount = appointments.size();
                    completedCount = (int) appointments.stream()
                        .filter(apt -> apt.getStatus() == AppointmentStatus.COMPLETED)
                        .count();
                } catch (Exception e) {
                    // Handle error silently
                }
                
                Map<String, Object> doctorStats = new HashMap<>();
                doctorStats.put("id", doctor.getId());
                doctorStats.put("name", doctor.getName());
                doctorStats.put("specialization", doctor.getSpecialization());
                doctorStats.put("totalAppointments", appointmentCount);
                doctorStats.put("completedAppointments", completedCount);
                doctorStats.put("completionRate", appointmentCount > 0 ? 
                    Math.round((completedCount / (double)appointmentCount) * 100) : 0);
                
                return doctorStats;
            })
            .sorted((a, b) -> Integer.compare((Integer)b.get("totalAppointments"), (Integer)a.get("totalAppointments")))
            .limit(limit)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(topDoctors);
    } catch (Exception e) {
        System.err.println("Error getting top doctors: " + e.getMessage());
        return ResponseEntity.status(500).body(null);
    }
}
}