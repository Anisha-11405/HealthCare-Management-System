package com.examly.springapp.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examly.springapp.model.Appointment;
import com.examly.springapp.model.AppointmentStatus;
import com.examly.springapp.model.Doctor;
import com.examly.springapp.model.Patient;
import com.examly.springapp.repository.PatientRepository;
import com.examly.springapp.service.DoctorService;
import com.examly.springapp.service.PatientService;

import org.springframework.security.core.Authentication;


import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/patients")
public class PatientController {
    
    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private PatientRepository patientRepository;

    
    // Regular patient creation - Anyone can register as patient via /auth/register
    @PostMapping
    public ResponseEntity<Patient> createPatient(@Valid @RequestBody Patient patient) {
        Patient saved = patientService.createPatient(patient);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
    
    // ✅ View all patients - ONLY Admin
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }
    
    // View individual patient details - Patients can view their own, Doctors and Admins can view all
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        // TODO: Add logic to ensure patients can only view their own profile
        // and doctors/admins can view any patient
        Patient patient = patientService.getPatientById(id);
        return patient != null ? ResponseEntity.ok(patient) : ResponseEntity.notFound().build();
    }
    
    // Manage My Profile - Patients can update their own profile
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient patient) {
        // TODO: Add logic to ensure patients can only update their own profile
        Patient updated = patientService.updatePatient(id, patient);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
    
    // Only Admins can delete patients
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
    
    // Admin-only patient creation (for administrative purposes)
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Patient> createPatientAsAdmin(@RequestBody Patient patient) {
        return ResponseEntity.ok(patientService.createPatient(patient));
    }
    
    // Secure patient access - Only Doctors and Admins
    @GetMapping("/secure/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Patient> getPatientSecure(@PathVariable Long id) {
        Patient patient = patientService.getPatientById(id);
        return patient != null ? ResponseEntity.ok(patient) : ResponseEntity.notFound().build();
    }

    // ✅ View only patients who booked with this doctor
    @GetMapping("/my")  // ✅ CORRECT - this creates /api/patients/my
@PreAuthorize("hasRole('DOCTOR')")  // Add security annotation
public ResponseEntity<List<Patient>> getMyPatients(Authentication authentication) {
    try {
        Doctor doctor = doctorService.getDoctorByEmail(authentication.getName());
        if (doctor == null) {
            return ResponseEntity.status(404).body(null);
        }
        
        List<Patient> patients = patientRepository.findPatientsByDoctorId(doctor.getId());
        return ResponseEntity.ok(patients);
    } catch (Exception e) {
        System.err.println("Error fetching doctor's patients: " + e.getMessage());
        return ResponseEntity.status(500).body(null);
    }
}

@PreAuthorize("hasRole('PATIENT')")
@GetMapping("/dashboard/my-stats")
public ResponseEntity<Map<String, Object>> getMyPatientStats(Authentication authentication) {
    try {
        String email = authentication.getName();
        List<Appointment> myAppointments = patientService.getMyAppointments(email);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAppointments", myAppointments.size());
        stats.put("upcomingAppointments", myAppointments.stream()
            .mapToInt(apt -> (apt.getStatus() == AppointmentStatus.CONFIRMED || 
                             apt.getStatus() == AppointmentStatus.SCHEDULED ||
                             apt.getStatus() == AppointmentStatus.PENDING) ? 1 : 0)
            .sum());
        stats.put("completedAppointments", myAppointments.stream()
            .mapToInt(apt -> apt.getStatus() == AppointmentStatus.COMPLETED ? 1 : 0)
            .sum());
        stats.put("pendingAppointments", myAppointments.stream()
            .mapToInt(apt -> (apt.getStatus() == AppointmentStatus.PENDING ||
                             apt.getStatus() == AppointmentStatus.SCHEDULED) ? 1 : 0)
            .sum());
        
        return ResponseEntity.ok(stats);
    } catch (Exception e) {
        System.err.println("Error getting patient stats: " + e.getMessage());
        return ResponseEntity.status(500).body(null);
    }
}


// Add these methods to your PatientController.java

/**
 * Get patient registration trends for admin dashboard
 */
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/dashboard/registration-trends")
public ResponseEntity<Map<String, Object>> getPatientRegistrationTrends() {
    try {
        List<Patient> allPatients = patientService.getAllPatients();
        
        // Count registrations in different time periods
        LocalDate now = LocalDate.now();
        LocalDate thirtyDaysAgo = now.minusDays(30);
        LocalDate sevenDaysAgo = now.minusDays(7);
        LocalDate today = now;
        
        long totalPatients = allPatients.size();
        long newThisMonth = allPatients.stream()
            .filter(p -> {
                LocalDate regDate = getRegistrationDate(p);
                return regDate != null && !regDate.isBefore(thirtyDaysAgo);
            })
            .count();
        
        long newThisWeek = allPatients.stream()
            .filter(p -> {
                LocalDate regDate = getRegistrationDate(p);
                return regDate != null && !regDate.isBefore(sevenDaysAgo);
            })
            .count();
        
        long newToday = allPatients.stream()
            .filter(p -> {
                LocalDate regDate = getRegistrationDate(p);
                return regDate != null && regDate.equals(today);
            })
            .count();
        
        Map<String, Object> trends = new HashMap<>();
        trends.put("totalPatients", totalPatients);
        trends.put("newThisMonth", newThisMonth);
        trends.put("newThisWeek", newThisWeek);
        trends.put("newToday", newToday);
        trends.put("growthRate", newThisMonth > 0 ? 
            String.format("%.1f%%", (newThisMonth / (double)Math.max(totalPatients - newThisMonth, 1)) * 100) : "0%");
        
        return ResponseEntity.ok(trends);
    } catch (Exception e) {
        System.err.println("Error getting patient registration trends: " + e.getMessage());
        return ResponseEntity.status(500).body(null);
    }
}

// Helper method to get registration date from patient
private LocalDate getRegistrationDate(Patient patient) {
    if (patient.getCreatedAt() != null) {
        return patient.getCreatedAt().toLocalDate();
    }
    if (patient.getRegistrationDate() != null) {
        return patient.getRegistrationDate();
    }
    return null;
}




}
