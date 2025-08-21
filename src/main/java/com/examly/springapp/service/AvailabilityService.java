package com.examly.springapp.service;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.examly.springapp.model.Doctor;
import com.examly.springapp.model.DoctorAvailability;
import com.examly.springapp.repository.DoctorAvailabilityRepository;
import com.examly.springapp.repository.DoctorRepository;

@Service
public class AvailabilityService {

    @Autowired
    private DoctorAvailabilityRepository availabilityRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * Check if doctor is available on a specific day and time
     */
    public boolean isAvailable(String doctorId, String dayOfWeek, String timeSlot) {
        try {
            Long docId = Long.parseLong(doctorId);
            Doctor doctor = doctorRepository.findById(docId).orElse(null);
            
            if (doctor == null) {
                return false;
            }

            // Find availability for the specific day
            Optional<DoctorAvailability> availability = availabilityRepository
                .findByDoctorAndDayOfWeek(doctor, dayOfWeek.toUpperCase());

            if (availability.isEmpty() || !availability.get().getIsActive()) {
                return false;
            }

            // Check if the time slot is available
            List<String> timeSlots = availability.get().getTimeSlots();
            
            // Convert time to standard format for comparison
            String formattedTime = formatTimeForComparison(timeSlot);
            
            return timeSlots != null && timeSlots.contains(formattedTime);
            
        } catch (Exception e) {
            System.err.println("Error checking availability: " + e.getMessage());
            return false;
        }
    }

    /**
     * Get all available time slots for a doctor on a specific day
     */
    public List<String> getAvailableTimeSlots(Long doctorId, String dayOfWeek) {
        try {
            Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
            
            if (doctor == null) {
                return List.of();
            }

            Optional<DoctorAvailability> availability = availabilityRepository
                .findByDoctorAndDayOfWeek(doctor, dayOfWeek.toUpperCase());

            if (availability.isEmpty() || !availability.get().getIsActive()) {
                return List.of();
            }

            return availability.get().getTimeSlots();
            
        } catch (Exception e) {
            System.err.println("Error getting available time slots: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Get doctor's complete availability schedule
     */
    public List<DoctorAvailability> getDoctorAvailability(Long doctorId) {
        try {
            Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
            if (doctor == null) {
                return List.of();
            }
            return availabilityRepository.findByDoctorAndIsActive(doctor, true);
        } catch (Exception e) {
            System.err.println("Error getting doctor availability: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Set/Update doctor's availability schedule
     */
    @Transactional
    public List<DoctorAvailability> setDoctorAvailability(String doctorId, List<AvailabilityData> availabilityList) {
        try {
            Long docId = Long.parseLong(doctorId);
            Doctor doctor = doctorRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with ID: " + doctorId));

            // Delete existing availability for this doctor
            List<DoctorAvailability> existingAvailability = availabilityRepository.findByDoctor(doctor);
            availabilityRepository.deleteAll(existingAvailability);

            // Create new availability records
            List<DoctorAvailability> newAvailability = new ArrayList<>();
            
            for (AvailabilityData data : availabilityList) {
                if (data.getTimeSlots() != null && !data.getTimeSlots().isEmpty()) {
                    DoctorAvailability availability = new DoctorAvailability();
                    availability.setDoctor(doctor);
                    availability.setDayOfWeek(data.getDayOfWeek().toUpperCase());
                    availability.setTimeSlots(data.getTimeSlots());
                    availability.setIsActive(data.isActive());
                    
                    newAvailability.add(availability);
                }
            }

            return availabilityRepository.saveAll(newAvailability);
            
        } catch (Exception e) {
            System.err.println("Error setting doctor availability: " + e.getMessage());
            throw new RuntimeException("Failed to update availability: " + e.getMessage());
        }
    }

    /**
     * Get doctor ID by email
     */
    public String getDoctorIdByEmail(String email) {
        try {
            Optional<Doctor> doctor = doctorRepository.findByEmail(email);
            return doctor.map(d -> d.getId().toString()).orElse(null);
        } catch (Exception e) {
            System.err.println("Error getting doctor by email: " + e.getMessage());
            return null;
        }
    }

    /**
     * Delete doctor's availability
     */
    @Transactional
    public void deleteDoctorAvailability(String doctorId) {
        try {
            Long docId = Long.parseLong(doctorId);
            Doctor doctor = doctorRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with ID: " + doctorId));

            List<DoctorAvailability> availability = availabilityRepository.findByDoctor(doctor);
            availabilityRepository.deleteAll(availability);
            
        } catch (Exception e) {
            System.err.println("Error deleting doctor availability: " + e.getMessage());
            throw new RuntimeException("Failed to delete availability: " + e.getMessage());
        }
    }

    /**
     * Check if doctor owns the availability (for security)
     */
    public boolean isDoctorOwner(String doctorId, String email) {
        try {
            String ownerDoctorId = getDoctorIdByEmail(email);
            return doctorId.equals(ownerDoctorId);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get available doctors for a specific day and time slot
     */
    public List<Doctor> getAvailableDoctors(String dayOfWeek, String timeSlot) {
        try {
            List<DoctorAvailability> availabilities = availabilityRepository
                .findByDayOfWeekAndIsActive(dayOfWeek.toUpperCase(), true);

            return availabilities.stream()
                .filter(availability -> availability.getTimeSlots().contains(formatTimeForComparison(timeSlot)))
                .map(DoctorAvailability::getDoctor)
                .distinct()
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            System.err.println("Error getting available doctors: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Format time string for consistent comparison
     */
    private String formatTimeForComparison(String timeSlot) {
        try {
            // Handle different time formats
            if (timeSlot.contains(":")) {
                String[] parts = timeSlot.split(":");
                int hour = Integer.parseInt(parts[0]);
                int minute = Integer.parseInt(parts[1]);
                return String.format("%02d:%02d", hour, minute);
            }
            return timeSlot;
        } catch (Exception e) {
            return timeSlot;
        }
    }

    // Inner class for availability data transfer
    public static class AvailabilityData {
        private String dayOfWeek;
        private List<String> timeSlots;
        private boolean isActive;

        // Constructors
        public AvailabilityData() {}

        public AvailabilityData(String dayOfWeek, List<String> timeSlots, boolean isActive) {
            this.dayOfWeek = dayOfWeek;
            this.timeSlots = timeSlots;
            this.isActive = isActive;
        }

        // Getters and Setters
        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

        public List<String> getTimeSlots() { return timeSlots; }
        public void setTimeSlots(List<String> timeSlots) { this.timeSlots = timeSlots; }

        public boolean isActive() { return isActive; }
        public void setIsActive(boolean active) { isActive = active; }
    }
}