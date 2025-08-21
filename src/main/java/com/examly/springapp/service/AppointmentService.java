package com.examly.springapp.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.examly.springapp.model.Appointment;
import com.examly.springapp.model.AppointmentStatus;
import com.examly.springapp.model.Doctor;
import com.examly.springapp.model.Patient;
import com.examly.springapp.repository.AppointmentRepository;
import com.examly.springapp.repository.DoctorRepository;
import com.examly.springapp.repository.PatientRepository;

@Service
@Transactional
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AvailabilityService availabilityService; // NEW: service to check doctor availability

    // ------------------ BOOK APPOINTMENT ------------------
    public Appointment bookAppointment(Long patientId, Long doctorId, LocalDate date, LocalTime time, String reason) {
        if (patientId == null || doctorId == null || date == null || time == null || reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("All appointment details are required");
        }

        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot book appointment for past dates");
        }

        if (date.equals(LocalDate.now()) && time.isBefore(LocalTime.now())) {
            throw new IllegalArgumentException("Cannot book appointment for past time today");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + patientId));

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with ID: " + doctorId));

        // ------------------ AVAILABILITY CHECK ------------------
        // ------------------ AVAILABILITY CHECK ------------------



        // Check if doctor already has an appointment at this time
        boolean exists = appointmentRepository.existsByDoctorAndAppointmentDateAndAppointmentTime(doctor, date, time);
        if (exists) {
            throw new IllegalStateException("This time slot has already been booked for doctor " + doctor.getName());
        }

        // Create appointment
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(date)
                .appointmentTime(time)
                .reason(reason.trim())
                .status(AppointmentStatus.SCHEDULED) // Initial status
                .createdAt(LocalDateTime.now())
                .build();

        return appointmentRepository.save(appointment);
    }

    // ------------------ GET APPOINTMENTS BY DOCTOR ------------------
    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByDoctor(Doctor doctor) {
        return appointmentRepository.findByDoctor(doctor);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getMyDoctorAppointments(String doctorEmail) {
        Doctor doctor = doctorRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found with email: " + doctorEmail));
        return appointmentRepository.findByDoctor(doctor);
    }

    // ------------------ APPROVE / REJECT / CONFIRM / COMPLETE / CANCEL ------------------
    public String approveAppointment(Long appointmentId, String userEmail, boolean isAdmin) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isEmpty()) return "Appointment not found";

        Appointment appointment = appointmentOpt.get();
        if (!isAdmin && !appointment.getDoctor().getEmail().equals(userEmail)) return "You can only approve your own appointments";

        if (appointment.getStatus() != AppointmentStatus.SCHEDULED && appointment.getStatus() != AppointmentStatus.PENDING) {
            return "Only scheduled/pending appointments can be approved";
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(appointment);
        return "Appointment approved successfully";
    }

    public String rejectAppointment(Long appointmentId, String userEmail, boolean isAdmin, String rejectionReason) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isEmpty()) return "Appointment not found";

        Appointment appointment = appointmentOpt.get();
        if (!isAdmin && !appointment.getDoctor().getEmail().equals(userEmail)) return "You can only reject your own appointments";

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) return "Cannot reject a completed appointment";

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setReason(rejectionReason); // optional: save rejection reason
        appointmentRepository.save(appointment);
        return "Appointment rejected successfully";
    }

    public String confirmAppointment(Long appointmentId, String userEmail, boolean isAdmin) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isEmpty()) return "Appointment not found";

        Appointment appointment = appointmentOpt.get();
        if (!isAdmin && !appointment.getDoctor().getEmail().equals(userEmail)) return "You can only confirm your own appointments";

        if (appointment.getStatus() != AppointmentStatus.PENDING && appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            return "Only pending/scheduled appointments can be confirmed";
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(appointment);
        return "Appointment confirmed successfully";
    }

    public String completeAppointment(Long appointmentId, String userEmail, boolean isAdmin) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isEmpty()) return "Appointment not found";

        Appointment appointment = appointmentOpt.get();
        if (!isAdmin && !appointment.getDoctor().getEmail().equals(userEmail)) return "You can only complete your own appointments";

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) return "Only confirmed appointments can be completed";

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);
        return "Appointment completed successfully";
    }

    public String cancelAppointment(Long appointmentId, String userEmail, boolean isAdmin) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isEmpty()) return "Appointment not found";

        Appointment appointment = appointmentOpt.get();
        boolean canCancel = isAdmin || appointment.getDoctor().getEmail().equals(userEmail) || appointment.getPatient().getEmail().equals(userEmail);
        if (!canCancel) return "You don't have permission to cancel this appointment";

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) return "Cannot cancel a completed appointment";

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
        return "Appointment cancelled successfully";
    }

    // ------------------ OTHER CRUD METHODS ------------------
    @Transactional(readOnly = true)
    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAllWithDetails();
    }

    @Transactional(readOnly = true)
    public List<Appointment> getByPatientId(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + patientId));
        return appointmentRepository.findByPatient(patient);
    }

    public Appointment updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + id));
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new IllegalArgumentException("Appointment not found with ID: " + id);
        }
        appointmentRepository.deleteById(id);
    }

    public List<Appointment> getByDoctorId(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getByDoctorId'");
    }
}
