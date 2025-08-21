package com.examly.springapp.repository;

import com.examly.springapp.model.Availability;
import com.examly.springapp.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    
    /**
     * Find all availability slots for a specific doctor
     */
    List<Availability> findByDoctorId(Long doctorId);
    
    /**
     * Find availability for a specific doctor on a specific day
     */
    List<Availability> findByDoctorIdAndDay(Long doctorId, String day);
    
    /**
     * Delete all availability slots for a specific doctor
     */
    @Modifying
    @Transactional
    void deleteByDoctorId(Long doctorId);
    
    /**
     * Delete availability for a specific doctor on a specific day
     */
    @Modifying
    @Transactional
    void deleteByDoctorIdAndDay(Long doctorId, String day);
    
    /**
     * Check if doctor has availability on a specific day and time
     */
    @Query("SELECT COUNT(a) > 0 FROM Availability a JOIN a.timeSlots ts " +
           "WHERE a.doctor.id = :doctorId AND a.day = :day AND ts = :timeSlot")
    boolean existsByDoctorIdAndDayAndTimeSlot(@Param("doctorId") Long doctorId, 
                                            @Param("day") String day, 
                                            @Param("timeSlot") String timeSlot);
    
    /**
     * Find all doctors who are available on a specific day and time
     */
    @Query("SELECT DISTINCT a.doctor FROM Availability a JOIN a.timeSlots ts " +
           "WHERE a.day = :day AND ts = :timeSlot")
    List<Doctor> findDoctorsAvailableAt(@Param("day") String day, @Param("timeSlot") String timeSlot);
}