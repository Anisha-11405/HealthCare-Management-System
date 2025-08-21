package com.examly.springapp.dto;

import java.util.List;

public class AvailabilityDto {
    private List<AvailabilityItemDto> availability;

    // Constructors
    public AvailabilityDto() {}

    public AvailabilityDto(List<AvailabilityItemDto> availability) {
        this.availability = availability;
    }

    // Getters and Setters
    public List<AvailabilityItemDto> getAvailability() {
        return availability;
    }

    public void setAvailability(List<AvailabilityItemDto> availability) {
        this.availability = availability;
    }

    @Override
    public String toString() {
        return "AvailabilityDto{" +
                "availability=" + availability +
                '}';
    }

    // Inner class for individual availability items
    public static class AvailabilityItemDto {
        private String dayOfWeek;
        private List<String> timeSlots;
        private boolean isActive;

        // Constructors
        public AvailabilityItemDto() {}

        public AvailabilityItemDto(String dayOfWeek, List<String> timeSlots, boolean isActive) {
            this.dayOfWeek = dayOfWeek;
            this.timeSlots = timeSlots;
            this.isActive = isActive;
        }

        // Getters and Setters
        public String getDayOfWeek() {
            return dayOfWeek;
        }

        public void setDayOfWeek(String dayOfWeek) {
            this.dayOfWeek = dayOfWeek;
        }

        public List<String> getTimeSlots() {
            return timeSlots;
        }

        public void setTimeSlots(List<String> timeSlots) {
            this.timeSlots = timeSlots;
        }

        public boolean isActive() {
            return isActive;
        }

        public void setIsActive(boolean active) {
            isActive = active;
        }

        @Override
        public String toString() {
            return "AvailabilityItemDto{" +
                    "dayOfWeek='" + dayOfWeek + '\'' +
                    ", timeSlots=" + timeSlots +
                    ", isActive=" + isActive +
                    '}';
        }
    }
}