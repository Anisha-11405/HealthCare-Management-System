package com.examly.springapp.controller;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.examly.springapp.model.Appointment;
import com.examly.springapp.model.AppointmentStatus;
import com.examly.springapp.model.Doctor;
import com.examly.springapp.service.AppointmentService;
import com.examly.springapp.service.DoctorService;
import com.examly.springapp.service.PatientService;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    
    @Autowired
    private AppointmentService appointmentService;
    
    @Autowired
    private DoctorService doctorService;
    
    @Autowired
    private PatientService patientService;

    // ============== DEBUG ENDPOINT ==============
    
    /**
     * Debug endpoint to test doctor data fetching
     */
    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/debug/my-data")
    public ResponseEntity<Map<String, Object>> getMyDebugData(Authentication authentication) {
        try {
            String email = authentication.getName();
            System.out.println("DEBUG: Doctor email from auth: " + email);
            
            // Check authentication details
            System.out.println("DEBUG: Authorities: " + authentication.getAuthorities());
            
            // Get doctor
            Doctor doctor = doctorService.getDoctorByEmail(email);
            System.out.println("DEBUG: Doctor found: " + (doctor != null ? doctor.getName() + " (ID: " + doctor.getId() + ")" : "NULL"));
            
            if (doctor == null) {
                return ResponseEntity.status(404).body(Map.of(
                    "error", "Doctor not found",
                    "email", email,
                    "authorities", authentication.getAuthorities().toString()
                ));
            }
            
            // Get appointments
            List<Appointment> appointments = appointmentService.getAppointmentsByDoctor(doctor);
            System.out.println("DEBUG: Found " + appointments.size() + " appointments");
            
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("status", "success");
            debugInfo.put("timestamp", LocalDateTime.now().toString());
            debugInfo.put("doctorInfo", Map.of(
                "id", doctor.getId(),
                "name", doctor.getName(),
                "email", doctor.getEmail(),
                "specialization", doctor.getSpecialization() != null ? doctor.getSpecialization() : "None"
            ));
            debugInfo.put("appointmentsCount", appointments.size());
            debugInfo.put("authInfo", Map.of(
                "email", email,
                "authorities", authentication.getAuthorities().toString()
            ));
            
            // Add sample appointment details
            if (!appointments.isEmpty()) {
                Appointment sampleAppointment = appointments.get(0);
                debugInfo.put("sampleAppointment", Map.of(
                    "id", sampleAppointment.getId(),
                    "patientName", sampleAppointment.getPatient() != null ? sampleAppointment.getPatient().getName() : "NULL",
                    "date", sampleAppointment.getAppointmentDate().toString(),
                    "status", sampleAppointment.getStatus().toString()
                ));
            }
            
            return ResponseEntity.ok(debugInfo);
            
        } catch (Exception e) {
            System.err.println("DEBUG ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", e.getMessage(),
                "timestamp", LocalDateTime.now().toString()
            ));
        }
    }

    // ============== PATIENT ENDPOINTS ==============
    
    /**
     * Patient views their own appointments
     */
    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/my/patient")
    public ResponseEntity<List<Appointment>> getMyPatientAppointments(Authentication authentication) {
        try {
            String email = authentication.getName();
            System.out.println("Fetching appointments for patient: " + email);
            List<Appointment> appointments = patientService.getMyAppointments(email);
            System.out.println("Found " + appointments.size() + " appointments for patient");
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            System.err.println("Error fetching patient appointments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
    
    /**
     * Patient views their appointments by status
     */
    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/my/patient/status/{status}")
    public ResponseEntity<List<Appointment>> getMyPatientAppointmentsByStatus(
            @PathVariable String status, Authentication authentication) {
        try {
            String email = authentication.getName();
            AppointmentStatus appointmentStatus = AppointmentStatus.valueOf(status.toUpperCase());
            List<Appointment> appointments = patientService.getMyAppointmentsByStatus(email, appointmentStatus);
            return ResponseEntity.ok(appointments);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            System.err.println("Error fetching patient appointments by status: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    // ============== DOCTOR ENDPOINTS ==============

    /**
     * Doctor views their appointments (patients who booked with them) - ENHANCED VERSION
     */
    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/my/doctor")
    public ResponseEntity<List<Appointment>> getMyDoctorAppointments(Authentication authentication) {
        try {
            String email = authentication.getName();
            System.out.println("Fetching appointments for doctor: " + email);
            
            Doctor doctor = doctorService.getDoctorByEmail(email);
            
            if (doctor == null) {
                System.err.println("Doctor not found with email: " + email);
                return ResponseEntity.status(404).body(null);
            }
            
            System.out.println("Found doctor: " + doctor.getName() + " (ID: " + doctor.getId() + ")");
            
            List<Appointment> appointments = appointmentService.getAppointmentsByDoctor(doctor);
            System.out.println("Found " + appointments.size() + " appointments for doctor");
            
            // Enhanced logging for debugging
            appointments.forEach(apt -> {
                System.out.println("  Appointment ID: " + apt.getId() + 
                    ", Patient: " + (apt.getPatient() != null ? apt.getPatient().getName() : "NULL") +
                    ", Date: " + apt.getAppointmentDate() + 
                    ", Status: " + apt.getStatus());
            });
            
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            System.err.println("Error fetching doctor appointments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
    
    /**
     * Doctor approves an appointment
     */
    @PreAuthorize("hasRole('DOCTOR')")
    @PatchMapping("/{id}/approve")
    public ResponseEntity<String> approveAppointment(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            System.out.println("Doctor " + email + " approving appointment " + id);
            String result = appointmentService.approveAppointment(id, email, false);
            System.out.println("Appointment approval result: " + result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error approving appointment " + id + ": " + e.getMessage());
            return ResponseEntity.status(500).body("Failed to approve appointment: " + e.getMessage());
        }
    }
    
    /**
     * Doctor rejects an appointment
     */
    @PreAuthorize("hasRole('DOCTOR')")
    @PatchMapping("/{id}/reject")
    public ResponseEntity<String> rejectAppointment(
            @PathVariable Long id, 
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            String reason = body.get("reason");
            System.out.println("Doctor " + email + " rejecting appointment " + id + " with reason: " + reason);
            String result = appointmentService.rejectAppointment(id, email, false, reason);
            System.out.println("Appointment rejection result: " + result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error rejecting appointment " + id + ": " + e.getMessage());
            return ResponseEntity.status(500).body("Failed to reject appointment: " + e.getMessage());
        }
    }

    // ============== EXISTING ENDPOINTS (Enhanced) ==============

    /**
     * Get appointments for the logged-in doctor (Alternative endpoint)
     */
    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/my-appointments")
    public ResponseEntity<List<Appointment>> getMyAppointments(Authentication authentication) {
        return getMyDoctorAppointments(authentication);
    }

    /**
     * Confirm appointment
     */
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<String> confirmAppointment(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
            
            String result = appointmentService.confirmAppointment(id, email, isAdmin);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to confirm appointment: " + e.getMessage());
        }
    }

    /**
     * Complete appointment
     */
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @PatchMapping("/{id}/complete")
    public ResponseEntity<String> completeAppointment(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
            
            System.out.println("Completing appointment " + id + " by " + email);
            String result = appointmentService.completeAppointment(id, email, isAdmin);
            System.out.println("Appointment completion result: " + result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error completing appointment " + id + ": " + e.getMessage());
            return ResponseEntity.status(500).body("Failed to complete appointment: " + e.getMessage());
        }
    }
    
    /**
     * View all appointments (Admin only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        try {
            List<Appointment> appointments = appointmentService.getAllAppointments();
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * Get appointment by ID (with role-based access control)
     */
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id, Authentication authentication) {
        try {
            Appointment appointment = appointmentService.getAppointmentById(id);
            
            // Check if user has access to this appointment
            String email = authentication.getName();
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            boolean isDoctor = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_DOCTOR"));
            boolean isPatient = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_PATIENT"));
            
            // Admin can view all appointments
            if (isAdmin) {
                return ResponseEntity.ok(appointment);
            }
            
            // Doctor can view their own appointments
            if (isDoctor && appointment.getDoctor().getEmail().equals(email)) {
                return ResponseEntity.ok(appointment);
            }
            
            // Patient can view their own appointments
            if (isPatient && appointment.getPatient().getEmail().equals(email)) {
                return ResponseEntity.ok(appointment);
            }
            
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            
        } catch (Exception e) {
            return ResponseEntity.status(404)
                .body(Map.of("error", "Appointment not found with ID: " + id));
        }
    }
    
    /**
     * Book new appointment
     */
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @PostMapping
    public ResponseEntity<?> bookAppointment(@RequestBody Map<String, Object> body, Authentication authentication) {
        try {
            String email = authentication.getName();
            System.out.println("Booking appointment for user: " + email);
            
            // Check if user has required role
            boolean isPatient = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_PATIENT"));
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            
            System.out.println("Is Patient: " + isPatient + ", Is Admin: " + isAdmin);
            
            if (!isPatient && !isAdmin) {
                return ResponseEntity.status(403).body(Map.of("error", "Access Denied: Insufficient permissions to book appointments"));
            }
            
            Long patientId;
            
            // Determine patientId based on user role
            if (isAdmin && body.containsKey("patientId") && body.get("patientId") != null) {
                // Admin can specify any patient
                patientId = Long.parseLong(body.get("patientId").toString());
                System.out.println("Admin booking for patient ID: " + patientId);
            } else if (isPatient) {
                // Patient can only book for themselves
                try {
                    patientId = patientService.getPatientIdByEmail(email);
                    System.out.println("Patient ID found: " + patientId);
                } catch (IllegalArgumentException e) {
                    System.out.println("Patient not found for email: " + email);
                    return ResponseEntity.status(403).body(Map.of("error", "Access Denied: Patient not found with email: " + email));
                }
            } else {
                return ResponseEntity.status(400).body(Map.of("error", "Patient ID is required for admin users"));
            }

            // Validate required fields
            if (!body.containsKey("doctorId") || body.get("doctorId") == null) {
                return ResponseEntity.status(400).body(Map.of("error", "Doctor ID is required"));
            }
            if (!body.containsKey("appointmentDate") || body.get("appointmentDate") == null) {
                return ResponseEntity.status(400).body(Map.of("error", "Appointment date is required"));
            }
            if (!body.containsKey("appointmentTime") || body.get("appointmentTime") == null) {
                return ResponseEntity.status(400).body(Map.of("error", "Appointment time is required"));
            }
            if (!body.containsKey("reason") || body.get("reason") == null) {
                return ResponseEntity.status(400).body(Map.of("error", "Reason is required"));
            }

            Long doctorId = Long.parseLong(body.get("doctorId").toString());
            LocalDate date = LocalDate.parse(body.get("appointmentDate").toString());
            LocalTime time = LocalTime.parse(body.get("appointmentTime").toString());
            String reason = body.get("reason").toString();

            System.out.println("Booking details - Patient: " + patientId + ", Doctor: " + doctorId + ", Date: " + date + ", Time: " + time);

            Appointment appointment = appointmentService.bookAppointment(patientId, doctorId, date, time, reason);
            System.out.println("Appointment booked successfully with ID: " + appointment.getId());
            
            return ResponseEntity.status(201).body(appointment);
            
        } catch (IllegalStateException e) {
            System.out.println("Booking conflict: " + e.getMessage());
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            System.out.println("Invalid argument: " + e.getMessage());
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Failed to book appointment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to book appointment: " + e.getMessage()));
        }
    }
    
    /**
     * Update appointment status
     */
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            AppointmentStatus status = AppointmentStatus.valueOf(body.get("status"));
            Appointment updated = appointmentService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Cancel appointment
     */
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<String> cancelAppointmentByAuth(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
            
            String result = appointmentService.cancelAppointment(id, email, isAdmin);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to cancel appointment: " + e.getMessage());
        }
    }
    
    /**
     * Delete appointment (Admin only)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok(Map.of("message", "Appointment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
    
    // ============== LEGACY ENDPOINTS (Maintained for compatibility) ==============
    
    /**
     * View appointments by patient (Legacy - use /my/patient instead)
     */
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @GetMapping("/patient/{id}")
    public ResponseEntity<?> getByPatient(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            
            List<Appointment> appointments = appointmentService.getByPatientId(id);
            return ResponseEntity.ok(appointments);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * View appointments by doctor (Legacy - use /my/doctor instead)
     */
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @GetMapping("/doctor/{id}")
    public ResponseEntity<?> getByDoctor(@PathVariable Long id) {
        try {
            List<Appointment> appointments = appointmentService.getByDoctorId(id);
            return ResponseEntity.ok(appointments);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // ============== DASHBOARD ENDPOINTS ==============

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            List<Appointment> allAppointments = appointmentService.getAllAppointments();
            String today = LocalDate.now().toString();
            
            Map<String, Object> stats = new HashMap<>();
            
            // Basic counts
            stats.put("totalAppointments", allAppointments.size());
            stats.put("todayAppointments", allAppointments.stream()
                .mapToInt(apt -> apt.getAppointmentDate().toString().equals(today) ? 1 : 0)
                .sum());
            stats.put("pendingAppointments", allAppointments.stream()
                .mapToInt(apt -> (apt.getStatus() == AppointmentStatus.PENDING || 
                                 apt.getStatus() == AppointmentStatus.SCHEDULED) ? 1 : 0)
                .sum());
            stats.put("completedAppointments", allAppointments.stream()
                .mapToInt(apt -> apt.getStatus() == AppointmentStatus.COMPLETED ? 1 : 0)
                .sum());
            
            // Revenue calculation (this month)
            LocalDate firstOfMonth = LocalDate.now().withDayOfMonth(1);
            int monthlyRevenue = allAppointments.stream()
                .filter(apt -> apt.getStatus() == AppointmentStatus.COMPLETED)
                .filter(apt -> !apt.getAppointmentDate().isBefore(firstOfMonth))
                .mapToInt(apt -> 150) // Default fee, adjust based on your fee structure
                .sum();
            stats.put("monthlyRevenue", monthlyRevenue);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error getting dashboard stats: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Get appointments by status for charts
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dashboard/status-distribution")
    public ResponseEntity<List<Map<String, Object>>> getStatusDistribution() {
        try {
            List<Appointment> allAppointments = appointmentService.getAllAppointments();
            
            Map<AppointmentStatus, Long> statusCounts = allAppointments.stream()
                .collect(Collectors.groupingBy(
                    Appointment::getStatus,
                    Collectors.counting()
                ));
            
            List<Map<String, Object>> distribution = statusCounts.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> statusData = new HashMap<>();
                    statusData.put("status", entry.getKey().toString());
                    statusData.put("count", entry.getValue());
                    return statusData;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(distribution);
        } catch (Exception e) {
            System.err.println("Error getting status distribution: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Get today's hourly appointment data
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dashboard/hourly-trends")
    public ResponseEntity<List<Map<String, Object>>> getHourlyTrends() {
        try {
            String today = LocalDate.now().toString();
            List<Appointment> todayAppointments = appointmentService.getAllAppointments()
                .stream()
                .filter(apt -> apt.getAppointmentDate().toString().equals(today))
                .collect(Collectors.toList());
            
            Map<String, Map<String, Integer>> hourlyData = new HashMap<>();
            
            // Initialize hourly slots
            for (int hour = 8; hour <= 18; hour++) {
                String timeSlot = String.format("%02d:00", hour);
                Map<String, Integer> slotData = new HashMap<>();
                slotData.put("scheduled", 0);
                slotData.put("completed", 0);
                slotData.put("pending", 0);
                hourlyData.put(timeSlot, slotData);
            }
            
            // Fill with actual data
            todayAppointments.forEach(apt -> {
                if (apt.getAppointmentTime() != null) {
                    String hour = apt.getAppointmentTime().toString().substring(0, 2);
                    String timeSlot = hour + ":00";
                    
                    if (hourlyData.containsKey(timeSlot)) {
                        Map<String, Integer> slotData = hourlyData.get(timeSlot);
                        slotData.put("scheduled", slotData.get("scheduled") + 1);
                        
                        if (apt.getStatus() == AppointmentStatus.COMPLETED) {
                            slotData.put("completed", slotData.get("completed") + 1);
                        } else if (apt.getStatus() == AppointmentStatus.PENDING || 
                                  apt.getStatus() == AppointmentStatus.SCHEDULED) {
                            slotData.put("pending", slotData.get("pending") + 1);
                        }
                    }
                }
            });
            
            List<Map<String, Object>> trends = hourlyData.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> trendData = new HashMap<>();
                    trendData.put("time", entry.getKey());
                    trendData.putAll(entry.getValue());
                    return trendData;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            System.err.println("Error getting hourly trends: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Get weekly appointment and revenue trends
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dashboard/weekly-stats")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyStats() {
        try {
            List<Appointment> allAppointments = appointmentService.getAllAppointments();
            LocalDate startOfWeek = LocalDate.now().with(DayOfWeek.MONDAY);
            
            List<Map<String, Object>> weeklyData = new ArrayList<>();
            String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
            
            for (int i = 0; i < 7; i++) {
                LocalDate day = startOfWeek.plusDays(i);
                String dayStr = days[i];
                
                long dayAppointments = allAppointments.stream()
                    .filter(apt -> apt.getAppointmentDate().equals(day))
                    .count();
                
                int dayRevenue = allAppointments.stream()
                    .filter(apt -> apt.getAppointmentDate().equals(day))
                    .filter(apt -> apt.getStatus() == AppointmentStatus.COMPLETED)
                    .mapToInt(apt -> 150) // Adjust based on your fee structure
                    .sum();
                
                Map<String, Object> dayData = new HashMap<>();
                dayData.put("day", dayStr);
                dayData.put("appointments", dayAppointments);
                dayData.put("revenue", dayRevenue);
                weeklyData.add(dayData);
            }
            
            return ResponseEntity.ok(weeklyData);
        } catch (Exception e) {
            System.err.println("Error getting weekly stats: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Get recent system activity for dashboard
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dashboard/recent-activity")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivity() {
        try {
            List<Map<String, Object>> activities = new ArrayList<>();
            
            // Get recent appointments
            List<Appointment> recentAppointments = appointmentService.getAllAppointments()
                .stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .limit(3)
                .collect(Collectors.toList());
            
            for (Appointment apt : recentAppointments) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", "apt-" + apt.getId());
                activity.put("type", "appointment");
                activity.put("message", "New appointment scheduled");
                activity.put("details", String.format("%s with %s", 
                    apt.getPatient() != null ? apt.getPatient().getName() : "Patient",
                    apt.getDoctor() != null ? apt.getDoctor().getName() : "Doctor"));
                activity.put("time", getRelativeTime(apt.getCreatedAt()));
                activity.put("status", "info");
                activities.add(activity);
            }
            
            // Add system maintenance activity (you can customize this)
            Map<String, Object> systemActivity = new HashMap<>();
            systemActivity.put("id", "system-1");
            systemActivity.put("type", "warning");
            systemActivity.put("message", "System maintenance scheduled");
            systemActivity.put("details", "Planned downtime: 2:00 AM - 4:00 AM");
            systemActivity.put("time", "2h ago");
            systemActivity.put("status", "warning");
            activities.add(systemActivity);
            
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            System.err.println("Error getting recent activity: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    // Helper method for relative time calculation
    private String getRelativeTime(LocalDateTime timestamp) {
        if (timestamp == null) return "Just now";
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(timestamp, now);
        
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + "m ago";
        if (minutes < 1440) return (minutes / 60) + "h ago";
        return (minutes / 1440) + "d ago";
    }
}