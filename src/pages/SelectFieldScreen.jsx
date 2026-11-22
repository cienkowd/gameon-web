import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard/EventCard';
import Button from '../components/Button/Button';
import styles from './HomePageScreen/HomePageScreen.module.css';

const areSlotsAdjacent = (slots, newSlot) => {
  if (slots.length === 0) return true;
  // Zamieniamy sloty na liczby (minuty od północy)
  const toMinutes = slot => {
    const [start, end] = slot.split('-');
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return [sh * 60 + sm, eh * 60 + em];
  };
  const all = [...slots, newSlot].map(toMinutes).sort((a, b) => a[0] - b[0]);
  // Sprawdzamy czy wszystkie sloty są ciągłe
  for (let i = 1; i < all.length; i++) {
    if (all[i][0] !== all[i - 1][1]) return false;
  }
  return true;
};

const SelectFieldScreen = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [fieldsTimeSlots, setFieldsTimeSlots] = useState({});
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);

  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          facilityId: state.facilityId,
          date: state.date,
          sportType: state.sportType,
        });
        const token = localStorage.getItem('jwt');
        const response = await fetch(`http://localhost:8080/facilities/get-fields-for-reservation?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Błąd pobierania boisk');
        const data = await response.json();
        // Filtruj boiska po maxPlayers
        const filteredFields = data.filter(field => field.maxPlayers >= parseInt(state.maxParticipants, 10));
        setFields(filteredFields);
        // Pobierz sloty czasowe dla każdego boiska
        const timeSlotsObj = {};
        await Promise.all(filteredFields.map(async (field) => {
          try {
            const url = `http://localhost:8080/fields/available-time-slots?fieldId=${field.id}&date=${state.date}`;
            const res = await fetch(url, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const slots = await res.json();
              timeSlotsObj[field.id] = slots;
            } else {
              timeSlotsObj[field.id] = null;
            }
          } catch {
            timeSlotsObj[field.id] = null;
          }
        }));
        
        setFieldsTimeSlots(timeSlotsObj);
      } catch (err) {
        setError(err.message);
        setFields([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, [state.facilityId, state.date, state.sportType, state.maxParticipants]);

  // Funkcja pomocnicza do wyciągania slotów i godzin otwarcia
  const getTimeSlotsInfo = (fieldId) => {
    const slotsData = fieldsTimeSlots[fieldId];
    if (!slotsData) return null;
    // Godziny otwarcia
    const pad = n => (typeof n === 'number' ? n.toString().padStart(2, '0') : '00');
    const opening = slotsData.openingHour ? `${pad(slotsData.openingHour.hour)}:${pad(slotsData.openingHour.minute)}` : null;
    const closing = slotsData.closingHour ? `${pad(slotsData.closingHour.hour)}:${pad(slotsData.closingHour.minute)}` : null;
    // Sloty
    const availableSlots = Array.isArray(slotsData.availableTimes) ? slotsData.availableTimes.map(slot => {
      const start = new Date(slot.start);
      const end = new Date(slot.end);
      return `${pad(start.getHours())}:${pad(start.getMinutes())}-${pad(end.getHours())}:${pad(end.getMinutes())}`;
    }) : [];
    return {
      opening,
      closing,
      availableSlots
    };
  };

  // Zwraca wybrane sloty na podstawie rangeStart i rangeEnd
  const getSelectedSlots = (slots) => {
    if (!rangeStart) return [];
    if (!rangeEnd) return [rangeStart];
    const startIdx = slots.indexOf(rangeStart);
    const endIdx = slots.indexOf(rangeEnd);
    if (startIdx === -1 || endIdx === -1) return [rangeStart];
    const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
    return slots.slice(from, to + 1);
  };

  const handleSlotSelect = (slot, slots) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(slot);
      setRangeEnd(null);
      return;
    }
    if (rangeStart && !rangeEnd) {
      if (slot === rangeStart) {
        setRangeStart(null);
        setRangeEnd(null);
      } else {
        setRangeEnd(slot);
      }
    }
  };

  const handleNext = () => {
    const slots = getTimeSlotsInfo(selectedField?.id)?.availableSlots || [];
    const selectedSlots = getSelectedSlots(slots);
    if (!selectedField || selectedSlots.length === 0) return;
    // Wyciągnij start i end slotu
    const [startSlot, endSlot] = [selectedSlots[0], selectedSlots[selectedSlots.length - 1]];
    // Parsuj do daty
    const parseSlot = slot => {
      const [start, end] = slot.split('-');
      return {
        start,
        end
      };
    };
    const startTime = parseSlot(startSlot).start;
    const endTime = parseSlot(endSlot).end;
    // Przekaż jako ISO stringi (przyjmujemy, że data = state.date)
    const eventDate = state.date;
    const toISO = (time) => {
      // time: "HH:mm"
      const [h, m] = time.split(':');
      return new Date(`${eventDate}T${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`).toISOString();
    };
    navigate('/event-summary', {
      state: {
        ...state,
        selectedField,
        selectedSlots,
        eventStartTime: toISO(startTime),
        eventEndTime: toISO(endTime),
      },
    });
  };

  return (
    <div className={styles.contentWrapper}>
      <h2 className={styles.sectionTitle}>Wybierz boisko w wybranym obiekcie</h2>
      {loading && <div></div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div className={styles.fieldsRow}>
        {fields.map(field => {
          const slotsInfo = getTimeSlotsInfo(field.id);
          const availableSlots = slotsInfo?.availableSlots || [];
          const selectedSlots = selectedField && selectedField.id === field.id ? getSelectedSlots(availableSlots) : [];
          return (
            <div
              key={field.id}
              onClick={() => {
                setSelectedField(field);
                setRangeStart(null);
                setRangeEnd(null);
              }}
            >
              <EventCard 
                event={{ 
                  id: field.id,
                  title: field.name,
                  eventDescription: field.fieldDescription,
                  maxPlayers: field.maxPlayers,
                  sportType: field.sportType,
                }} 
                type="field" 
                onSelect={() => {
                  setSelectedField(field);
                  setRangeStart(null);
                  setRangeEnd(null);
                }}
                selected={selectedField && selectedField.id === field.id}
                timeSlotsInfo={slotsInfo}
                selectedSlots={selectedSlots}
                onSlotSelect={slot => {
                  setSelectedField(field);
                  handleSlotSelect(slot, availableSlots);
                }}
              />
            </div>
          );
        })}
      </div>
      <Button text="Dalej" onClick={handleNext} disabled={!selectedField || getSelectedSlots(getTimeSlotsInfo(selectedField?.id)?.availableSlots || []).length === 0} style={{ marginTop: 32 }} />
    </div>
  );
};

export default SelectFieldScreen; 