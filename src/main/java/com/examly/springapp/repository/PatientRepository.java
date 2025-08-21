package com.examly.springapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.examly.springapp.model.Patient;

public interface PatientRepository extends JpaRepository<Patient,Long>{
    Optional<Patient> findByEmail(String email);
    List<Patient> findDistinctByAppointments_Doctor_Email(String doctorEmail);

    @Query("SELECT DISTINCT a.patient FROM Appointment a WHERE a.doctor.id = :doctorId")
    List<Patient> findPatientsByDoctorId(@Param("doctorId") Long doctorId);
}
