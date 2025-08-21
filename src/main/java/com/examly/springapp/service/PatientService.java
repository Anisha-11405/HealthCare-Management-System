package com.examly.springapp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examly.springapp.model.Appointment;
import com.examly.springapp.model.Patient;
import com.examly.springapp.repository.AppointmentRepository;
import com.examly.springapp.repository.DoctorRepository;
import com.examly.springapp.repository.PatientRepository;

@Service
public class PatientService {
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id).orElse(null);
    }
    
    public Patient getPatientByEmail(String email) {
        return patientRepository.findByEmail(email).orElse(null);
    }

    public Patient updatePatient(Long id, Patient updatedPatient) {
        Patient existing = patientRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setName(updatedPatient.getName());
            existing.setEmail(updatedPatient.getEmail());
            existing.setPhoneNumber(updatedPatient.getPhoneNumber());
            existing.setDateOfBirth(updatedPatient.getDateOfBirth());
            return patientRepository.save(existing);
        }
        return null;
    }

    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }

    public Long getPatientIdByEmail(String email) {
        return patientRepository.findByEmail(email)
                .map(Patient::getId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with email: " + email));
    }
    
    // New method: Get patient's appointments
    public List<Appointment> getMyAppointments(String email) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found with email: " + email));
        return appointmentRepository.findByPatient(patient);
    }
    
    // New method: Get patient's appointments by status
    public List<Appointment> getMyAppointmentsByStatus(String email, com.examly.springapp.model.AppointmentStatus status) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found with email: " + email));
        return appointmentRepository.findByPatientAndStatus(patient, status);
    }
    
    // New method: Check if patient owns an appointment
    public boolean isPatientOwner(Long appointmentId, String email) {
        try {
            Patient patient = patientRepository.findByEmail(email).orElse(null);
            if (patient == null) return false;
            
            return appointmentRepository.findById(appointmentId)
                    .map(appointment -> appointment.getPatient().getId().equals(patient.getId()))
                    .orElse(false);
        } catch (Exception e) {
            return false;
        }
    }

    public List<Patient> getPatientsForDoctor(String doctorEmail) {
    var doctor = doctorRepository.findByEmail(doctorEmail)
            .orElseThrow(() -> new RuntimeException("Doctor not found"));

    List<Appointment> appointments = appointmentRepository.findByDoctor(doctor);

    return appointments.stream()
            .map(Appointment::getPatient)
            .distinct()
            .toList();
}
}