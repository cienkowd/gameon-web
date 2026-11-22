import React, { useState } from "react";
import styles from "./OpeningHours.module.css";
import { Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { pl } from "date-fns/locale/pl";
import { format, startOfWeek, addDays, parseISO, isSameDay } from "date-fns";
import verificatedIcon from "../../assets/images/verificated-icon.svg";
import publicIcon from "../../assets/images/public-icon.svg";
import { Link, useNavigate } from "react-router-dom";

const HOURS_START = 8;
const HOURS_END = 22;
const HOUR_WIDTH = 60; // szerokość jednej godziny w pikselach
const GAP = 0; // px, przezroczysta przerwa z lewej i prawej
const RADIUS = 8; // px, zgodnie z CSS
const MIN_WIDTH = 16; // px, minimalna szerokość eventu
const EVENT_HEIGHT = 24; // px, wysokość pojedynczego eventu
const EVENT_MARGIN = 0; // px, margines między eventami
const MAX_ROWS = 3; // maksymalna liczba rzędów eventów

// Generowanie godzin dla timeline
const generateHours = () => {
  const hours = [];
  for (let i = HOURS_START; i <= HOURS_END; i++) {
    hours.push(`${i}:00`);
  }
  return hours;
};

const calculateEventPosition = (timeRange) => {
  const [startTime, endTime] = timeRange.split(" - ");
  const [startHour] = startTime.split(":").map(Number);
  const [endHour] = endTime.split(":").map(Number);
  
  const position = (startHour - HOURS_START) * HOUR_WIDTH;
  const width = (endHour - startHour) * HOUR_WIDTH;
  
  return { position, width };
};

const getEventPositionAndWidth = (startHour, startMinute, endHour, endMinute) => {
  const start = startHour + startMinute / 60;
  const end = endHour + endMinute / 60;
  const left = (start - HOURS_START) * HOUR_WIDTH;
  const width = (end - start) * HOUR_WIDTH;
  return { left, width };
};

const OpeningHours = ({ weekSlots, selectedDate, setSelectedDate, loading, error }) => {
  const today = new Date();
  const hours = generateHours();
  const timelineWidth = (HOURS_END - HOURS_START + 1) * HOUR_WIDTH;
  const navigate = useNavigate();

  const handleDateChange = (event) => {
    setSelectedDate(new Date(event.target.value));
  };

  // Przetwarzanie danych z backendu na format do renderowania
  const scheduleData = weekSlots.map((slot, i) => {
    const date = addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i);
    const day = format(date, 'EEEE', { locale: pl });
    const dateStr = format(date, 'd MMMM', { locale: pl });
    const hoursStr =
      slot &&
      slot.openingHour &&
      slot.closingHour &&
      typeof slot.openingHour.hour === 'number' &&
      typeof slot.openingHour.minute === 'number' &&
      typeof slot.closingHour.hour === 'number' &&
      typeof slot.closingHour.minute === 'number'
        ? `${slot.openingHour.hour.toString().padStart(2, '0')}:${slot.openingHour.minute.toString().padStart(2, '0')} - ${slot.closingHour.hour.toString().padStart(2, '0')}:${slot.closingHour.minute.toString().padStart(2, '0')}`
        : "Zamknięte";
    const reservations = (slot && slot.bookedTimes) ? slot.bookedTimes.map(ev => ({
      eventId: ev.eventId,
      eventName: ev.eventTitle,
      timeRange: `${format(new Date(ev.start), 'HH:mm')} - ${format(new Date(ev.end), 'HH:mm')}`,
      type: "public" // Możesz rozwinąć jeśli masz info o prywatności
    })) : [];
    return { day, date: dateStr, hours: hoursStr, reservations };
  });

  if (loading) return <div></div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.controls}>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={handleDateChange}
            className={styles.dateInput}
          />
        </div>
      </div>

      <div className={styles.scheduleList}>
        {/* Pasek godzin */}
        <div className={styles.hoursBar}>
          <div className={styles.dayInfo} /> {/* Pusty div dla wyrównania */}
          <div className={styles.timelineContainer}>
            <div className={styles.hoursContainer} style={{ width: timelineWidth }}>
              {hours.map((hour, index) => (
                <div key={index} className={styles.hourMark}>
                  {hour}
                </div>
              ))}
            </div>
          </div>
        </div>

        {scheduleData.map((item, index) => {
          const currentDate = addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), index);
          const isSelected = isSameDay(currentDate, selectedDate);
          return (
            <div
              key={index}
              className={`${styles.daySchedule} ${isSelected ? styles.selected : ''}`}
            >
              <div className={styles.dayInfo} style={{ position: 'sticky', left: 0, zIndex: 3, background: '#F8F8F8' }}>
                <div className={styles.dayName}>
                  {item.day}
                  {isSelected && isSameDay(currentDate, today) ? (
                    <span className={styles.selectedText}>(Dzisiaj)</span>
                  ) : isSelected ? (
                    <span className={styles.selectedText}>(Wybrany)</span>
                  ) : isSameDay(currentDate, today) ? (
                    <span className={styles.todayText}>(Dzisiaj)</span>
                  ) : null}
                </div>
                <div className={styles.dayDate}>{item.date}</div>
              </div>
              <div className={styles.timelineContainer}>
                <div
                  className={`${styles.timeline} ${item.hours === "Zamknięte" ? styles.timelineClosed : ""}`}
                  style={{ width: timelineWidth }}
                >
                  {item.reservations
                    .map((reservation, rIndex, arr) => ({
                      ...reservation,
                      rIndex,
                      start: Number(reservation.timeRange.split(' - ')[0].replace(':','.')),
                      end: Number(reservation.timeRange.split(' - ')[1].replace(':','.')),
                    }))
                    .sort((a, b) => a.start - b.start)
                    .map((reservation, rIndex, arr) => {
                      const [startTime, endTime] = reservation.timeRange.split(' - ');
                      const [startHour, startMinute] = startTime.split(':').map(Number);
                      const [endHour, endMinute] = endTime.split(':').map(Number);
                      const { left, width } = getEventPositionAndWidth(startHour, startMinute, endHour, endMinute);
                      
                      let row = 0;
                      let found = false;
                      while (!found && row < MAX_ROWS) {
                        found = true;
                        for (let i = 0; i < rIndex; i++) {
                          const prev = arr[i];
                          if (row === prev.row && 
                              ((reservation.start < prev.end && reservation.end > prev.start))) {
                            row++;
                            found = false;
                            break;
                          }
                        }
                      }
                      
                      reservation.row = row;
                      reservation.left = left;
                      reservation.width = width;
                      return reservation;
                    })
                    .map((reservation, rIndex) => {
                      const top = reservation.row * (EVENT_HEIGHT + EVENT_MARGIN);
                      return (
                        <div
                          key={rIndex}
                          className={styles.eventCard}
                          style={{
                            left: `${reservation.left}px`,
                            width: `${reservation.width}px`,
                            top: `${top}px`,
                            borderRadius: `${RADIUS}px`,
                            zIndex: 1,
                            cursor: 'pointer',
                            position: 'absolute'
                          }}
                          onClick={() => {
                            if (reservation.eventId) navigate(`/event-detail/${reservation.eventId}`);
                          }}
                          title={reservation.eventName}
                        />
                      );
                    })
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OpeningHours;