import React from 'react';
import EventCard from '../components/EventCard/EventCard';
import styles from './HomePageScreen/HomePageScreen.module.css';

const mockFields = [
  {
    id: 1,
    title: 'Boisko A',
    eventDescription: 'Sztuczna nawierzchnia, oświetlenie',
    startTime: new Date().toISOString(),
    maxPlayers: 10,
    privacyStatus: 'PUBLIC',
  },
  {
    id: 2,
    title: 'Boisko B',
    eventDescription: 'Naturalna trawa, trybuny',
    startTime: new Date().toISOString(),
    maxPlayers: 12,
    privacyStatus: 'PRIVATE',
  },
  {
    id: 3,
    title: 'Boisko C',
    eventDescription: 'Hala, parkiet',
    startTime: new Date().toISOString(),
    maxPlayers: 8,
    privacyStatus: 'VERIFIED',
  },
];

const AvailableFieldsScreen = () => {
  return (
    <div className={styles.contentWrapper}>
      <h2 className={styles.sectionTitle}>Dostępne boiska w wybranym obiekcie</h2>
      <div className={styles.fieldsRow}>
        {mockFields.map(field => (
          <EventCard key={field.id} event={field} type="field" />
        ))}
      </div>
    </div>
  );
};

export default AvailableFieldsScreen; 