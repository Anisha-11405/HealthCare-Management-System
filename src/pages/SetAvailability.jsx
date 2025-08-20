import React, { useState, useEffect, useCallback } from "react";

// Mock user context for demo
const useUser = () => ({
  user: { id: 'doc123', role: 'DOCTOR', name: 'Dr. Smith' }
});

// Mock API for demo
const api = {
  post: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('Saving availability:', data);
    return { success: true };
  }
};

const SetAvailability = () => {
  const { user } = useUser();
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [saving, setSaving] = useState(false);

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const initializeAvailability = useCallback(() => {
    const defaultSlots = daysOfWeek.map(day => ({
      day: day.key,
      dayLabel: day.label,
      timeSlots: [],
      isAvailable: false
    }));
    setAvailabilitySlots(defaultSlots);
  }, []);

  useEffect(() => {
    initializeAvailability();
  }, [initializeAvailability]);

  const toggleDayAvailability = (dayKey) => {
    setAvailabilitySlots(prev => 
      prev.map(slot => 
        slot.day === dayKey 
          ? { 
              ...slot, 
              isAvailable: !slot.isAvailable,
              timeSlots: !slot.isAvailable ? [] : slot.timeSlots
            }
          : slot
      )
    );
  };

  const toggleTimeSlot = (dayKey, timeSlot) => {
    setAvailabilitySlots(prev => 
      prev.map(slot => {
        if (slot.day === dayKey) {
          const newTimeSlots = slot.timeSlots.includes(timeSlot)
            ? slot.timeSlots.filter(t => t !== timeSlot)
            : [...slot.timeSlots, timeSlot].sort();
          
          return {
            ...slot,
            timeSlots: newTimeSlots,
            isAvailable: newTimeSlots.length > 0
          };
        }
        return slot;
      })
    );
  };

  const handleQuickSet = (dayKey, type) => {
    let selectedSlots = [];
    
    switch(type) {
      case 'morning':
        selectedSlots = timeSlots.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour >= 9 && hour < 12;
        });
        break;
      case 'afternoon':
        selectedSlots = timeSlots.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour >= 14 && hour < 17;
        });
        break;
      case 'evening':
        selectedSlots = timeSlots.filter(slot => {
          const hour = parseInt(slot.split(':')[0]);
          return hour >= 17;
        });
        break;
      case 'all':
        selectedSlots = [...timeSlots];
        break;
      default:
        selectedSlots = [];
    }

    setAvailabilitySlots(prev => 
      prev.map(slot => 
        slot.day === dayKey 
          ? { 
              ...slot, 
              timeSlots: selectedSlots,
              isAvailable: selectedSlots.length > 0
            }
          : slot
      )
    );
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      
      const availabilityData = {
        doctorId: user.id,
        availability: availabilitySlots.filter(slot => slot.isAvailable && slot.timeSlots.length > 0)
      };

      await api.post(`/api/doctors/${user.id}/availability`, availabilityData);
      alert("Availability updated successfully!");
      
    } catch (error) {
      console.error('Failed to save availability:', error);
      alert("Failed to save availability. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'DOCTOR') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Access Denied: Only doctors can set availability.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
          Set Availability
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Manage your weekly availability
        </p>
      </div>

      {/* Weekly Availability Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', margin: 0 }}>
            🗓️ Weekly Availability
          </h2>
          <button
            onClick={saveAvailability}
            disabled={saving}
            style={{
              backgroundColor: saving ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            {saving ? 'Saving...' : '💾 Save Availability'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {availabilitySlots.map(daySlot => (
            <div key={daySlot.day} style={{
              border: `2px solid ${daySlot.isAvailable ? '#007bff' : '#dee2e6'}`,
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: daySlot.isAvailable ? '#f8f9fa' : 'white',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={daySlot.isAvailable}
                    onChange={() => toggleDayAvailability(daySlot.day)}
                    style={{ width: '18px', height: '18px', accentColor: '#007bff' }}
                  />
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: daySlot.isAvailable ? '#007bff' : '#6c757d', margin: 0 }}>
                    {daySlot.dayLabel}
                  </h3>
                  {daySlot.timeSlots.length > 0 && (
                    <span style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {daySlot.timeSlots.length} slots
                    </span>
                  )}
                </div>

                {daySlot.isAvailable && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['morning', 'afternoon', 'evening', 'all', 'clear'].map((type, index) => {
                      const colors = ['#ffc107', '#17a2b8', '#6f42c1', '#28a745', '#dc3545'];
                      const labels = ['Morning', 'Afternoon', 'Evening', 'All Day', 'Clear'];
                      return (
                        <button
                          key={type}
                          onClick={() => handleQuickSet(daySlot.day, type)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: colors[index],
                            color: index === 0 ? '#333' : 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s'
                          }}
                          onMouseOver={e => e.target.style.opacity = '0.8'}
                          onMouseOut={e => e.target.style.opacity = '1'}
                        >
                          {labels[index]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {daySlot.isAvailable && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                  {timeSlots.map(timeSlot => (
                    <button
                      key={timeSlot}
                      onClick={() => toggleTimeSlot(daySlot.day, timeSlot)}
                      style={{
                        padding: '8px 4px',
                        fontSize: '14px',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        backgroundColor: daySlot.timeSlots.includes(timeSlot) ? '#007bff' : 'white',
                        color: daySlot.timeSlots.includes(timeSlot) ? 'white' : '#333',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontWeight: daySlot.timeSlots.includes(timeSlot) ? '500' : 'normal'
                      }}
                      onMouseOver={e => {
                        if (!daySlot.timeSlots.includes(timeSlot)) {
                          e.target.style.borderColor = '#007bff';
                          e.target.style.backgroundColor = '#f8f9fa';
                        }
                      }}
                      onMouseOut={e => {
                        if (!daySlot.timeSlots.includes(timeSlot)) {
                          e.target.style.borderColor = '#dee2e6';
                          e.target.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      {timeSlot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SetAvailability;
