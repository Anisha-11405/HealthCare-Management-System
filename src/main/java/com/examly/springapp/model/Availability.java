package com.examly.springapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "availability")
public class Availability {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @JsonBackReference
    private Doctor doctor;
    
    @Column(name = "day_of_week", nullable = false)
    private String day;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "availability_time_slots", 
                    joinColumns = @JoinColumn(name = "availability_id"))
    @Column(name = "time_slot")
    private List<String> timeSlots = new ArrayList<>();
    
    // Constructors
    public Availability() {}
    
    public Availability(Doctor doctor, String day, List<String> timeSlots) {
        this.doctor = doctor;
        this.day = day;
        this.timeSlots = new ArrayList<>(timeSlots != null ? timeSlots : new ArrayList<>());
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Doctor getDoctor() {
        return doctor;
    }
    
    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }
    
    public String getDay() {
        return day;
    }
    
    public void setDay(String day) {
        this.day = day;
    }
    
    public List<String> getTimeSlots() {
        return timeSlots;
    }
    
    public void setTimeSlots(List<String> timeSlots) {
        this.timeSlots = timeSlots;
    }
    
    @Override
    public String toString() {
        return "Availability{" +
                "id=" + id +
                ", day='" + day + '\'' +
                ", timeSlots=" + timeSlots +
                '}';
    }
}