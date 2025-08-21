package com.examly.springapp.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.examly.springapp.model.Appointment;
import com.examly.springapp.model.AppointmentStatus;
import com.examly.springapp.model.Doctor;
import com.examly.springapp.model.Patient;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    boolean existsByDoctorAndAppointmentDateAndAppointmentTime(Doctor doctor, LocalDate date, LocalTime time);
    
    // CRITICAL: Add JOIN FETCH to ensure doctor and patient data is loaded
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.patient = :patient")
    List<Appointment> findByPatient(@Param("patient") Patient patient);
    
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.doctor = :doctor")
    List<Appointment> findByDoctor(@Param("doctor") Doctor doctor);
    
    // THIS IS THE KEY METHOD - it loads all appointments WITH doctor and patient details
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor")
    List<Appointment> findAllWithDetails();
    
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.appointmentDate BETWEEN :startDate AND :endDate")
    List<Appointment> findByAppointmentDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.patient = :patient AND a.status = :status")
    List<Appointment> findByPatientAndStatus(@Param("patient") Patient patient, @Param("status") AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.doctor = :doctor AND a.status = :status")
    List<Appointment> findByDoctorAndStatus(@Param("doctor") Doctor doctor, @Param("status") AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.status = :status")
    List<Appointment> findByStatus(@Param("status") AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.doctor = :doctor AND a.appointmentDate >= :date")
    List<Appointment> findByDoctorAndAppointmentDateGreaterThanEqual(@Param("doctor") Doctor doctor, @Param("date") LocalDate date);
    
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.patient = :patient AND a.appointmentDate >= :date")
    List<Appointment> findByPatientAndAppointmentDateGreaterThanEqual(@Param("patient") Patient patient, @Param("date") LocalDate date);
}