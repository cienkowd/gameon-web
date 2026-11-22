import React from 'react';
import {useNavigate} from 'react-router-dom';
import styles from './EventCard.module.css';
import footballPlaceholder from '../../utils/placeholders/football-placeholder.png';
import basketballPlaceholder from '../../utils/placeholders/basketball-placeholder.png';
import handballPlaceholder from '../../utils/placeholders/handball-placeholder.png';
import hokeyPlaceholder from '../../utils/placeholders/hokey-placeholder.png';
import voleyballPlaceholder from '../../utils/placeholders/voleyball-placeholder.png';
import tennisPlaceholder from '../../utils/placeholders/tennis-placeholder.png';
import baseballPlaceholder from '../../utils/placeholders/baseball-placeholder.png';
import runningPlaceholder from '../../utils/placeholders/running-placeholder.png';
import badmintonPlaceholder from '../../utils/placeholders/badminton-placeholder.png';
import tableTennisPlaceholder from '../../utils/placeholders/table-tennis-placeholder.png';
import rollsPlaceholder from '../../utils/placeholders/rolls-placeholder.png';
import skateboardPlaceholder from '../../utils/placeholders/skateboard-placeholder.png';
import otherPlaceholder from '../../utils/placeholders/other-placeholder.png';
import martialArtsPlaceholder from '../../utils/placeholders/martial-arts-placeholder.png';

const sportTypeToPlaceholder = {
    FOOTBALL: footballPlaceholder,
    BASKETBALL: basketballPlaceholder,
    HANDBALL: handballPlaceholder,
    HOKEY: hokeyPlaceholder,
    VOLLEYBALL: voleyballPlaceholder,
    TENNIS: tennisPlaceholder,
    BASEBALL: baseballPlaceholder,
    RUNNING: runningPlaceholder,
    BADMINTON: badmintonPlaceholder,
    TABLE_TENNIS: tableTennisPlaceholder,
    ROLLS: rollsPlaceholder,
    SKATEBOARD: skateboardPlaceholder,
    OTHER: otherPlaceholder,
    MARTIAL_ARTS: martialArtsPlaceholder,
};

// Mapa tłumaczeń typów sportów na polski
const sportTypeToPolish = {
    FOOTBALL: 'Piłka nożna',
    BASKETBALL: 'Koszykówka',
    HANDBALL: 'Piłka ręczna',
    HOKEY: 'Hokej',
    VOLLEYBALL: 'Siatkówka',
    TENNIS: 'Tenis ziemny',
    BASEBALL: 'Baseball',
    RUNNING: 'Bieganie',
    BADMINTON: 'Badminton',
    TABLE_TENNIS: 'Tenis stołowy',
    ROLLS: 'Rolki',
    SKATEBOARD: 'Skateboard',
    OTHER: 'Inne',
    MARTIAL_ARTS: 'Sztuki walki',
};

const EventCard = ({ event, type = 'event', onSelect, selected, openingHours, timeSlotsInfo, onSlotSelect, selectedSlot, selectedSlots = [], onMouseEnter, onMouseLeave }) => {
    const navigate = useNavigate();
    const [imgError, setImgError] = React.useState(false);

    const handleClick = () => {
        if (!event.id) return;
        if (type === 'event') {
            navigate(`/event-detail/${event.id}`);
        } else if (type === 'facility') {
            navigate(`/object-detail/${event.id}`);
        } else if (type === 'field') {
            navigate(`/field-detail/${event.id}`);
        }
    };

    return (
        <div 
            className={styles.eventCard}
            onClick={onSelect ? onSelect : handleClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={selected ? { border: '3px solid #e54a23', borderRadius: '16px', boxSizing: 'border-box' } : {}}
        >
            <div className={styles.imagePlaceholder}>
                {type === 'facility' ? (
                    event.imageURL ? (
                    <img
                            src={event.imageURL}
                            alt={event.name || 'obiekt'}
                            className={styles.eventImage}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                            onError={e => {
                                e.target.onerror = null;
                                const placeholder = sportTypeToPlaceholder[(event.sportType || '').toUpperCase()] || 'https://source.unsplash.com/400x300/?building,sport';
                                e.target.src = placeholder;
                            }}
                        />
                    ) : (
                        <img
                            src={sportTypeToPlaceholder[(event.sportType || '').toUpperCase()] || 'https://source.unsplash.com/400x300/?building,sport'}
                        alt={event.name || 'obiekt'}
                        className={styles.eventImage}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                    />
                    )
                ) : type === 'field' ? (
                    event.imageURL ? (
                    <img
                            src={event.imageURL.startsWith('http') ? event.imageURL : `http://localhost:8080/${event.imageURL.replace(/^\/+/, '')}`}
                            alt={event.name || 'boisko'}
                            className={styles.eventImage}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                            onError={e => {
                                e.target.onerror = null;
                                const placeholder = sportTypeToPlaceholder[(event.sportType || '').toUpperCase()] || `https://source.unsplash.com/400x300/?sport,field`;
                                e.target.src = placeholder;
                            }}
                        />
                    ) : (
                        <img
                            src={sportTypeToPlaceholder[(event.sportType || '').toUpperCase()] || `https://source.unsplash.com/400x300/?sport,field`}
                        alt={event.name || 'boisko'}
                        className={styles.eventImage}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                    />
                    )
                ) : event.imageURL && !imgError ? (
                    <img 
                        src={event.imageURL} 
                        alt={event.title || event.name || 'obrazek'} 
                        className={styles.eventImage} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} 
                        onError={e => {
                            setImgError(true);
                        }}
                    />
                ) : (
                    <img
                        src={
                            sportTypeToPlaceholder[
                                (event.field?.sportType || event.sportType || event.eventType || 'OTHER').toUpperCase()
                            ]
                        }
                        alt="placeholder"
                        className={styles.eventImage}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                    />
                )}
                {event.privacyStatus && (
                    <div className={styles.privateLabel}>
                        {event.privacyStatus === 'PUBLIC' && 'Publiczne'}
                        {event.privacyStatus === 'VERIFIED' && 'Weryfikowane'}
                        {event.privacyStatus === 'PRIVATE' && 'Prywatne'}
                    </div>
                )}
            </div>

            {type === 'facility' ? (
                <>
                    <h3 className={styles.eventTitle}>{event.name}</h3>
                    <p className={styles.eventDescription}>{event.objectDescription}</p>
                    <p className={styles.eventDate}>{event.city}{event.city && event.street ? ', ' : ''}{event.street}</p>
                </>
            ) : type === 'field' ? (
                <>
                    <h3 className={styles.eventTitle}>{event.name}</h3>
                    <p className={styles.eventDescription}>{event.fieldDescription}</p>
                    <p className={styles.eventDate}>{sportTypeToPolish[event.sportType] || event.sportType}</p>
                    <p className={styles.eventPlayers}>
                        <span className={styles.eventPlayersPlayer}>
                            {(() => {
                                const min = event.minPlayers || 1;
                                const max = event.maxPlayers;
                                if (min === max) {
                                    if (min === 1) return '1 gracz';
                                    return `${max} graczy`;
                                }
                                return `${min} - ${max} graczy`;
                            })()}
                        </span>
                    </p>
                </>
            ) : (
                <>
            <h3 className={styles.eventTitle}>{event.title}</h3>
            <p className={styles.eventDescription}>{event.eventDescription}</p>
            <p className={styles.eventDate}>
                    {event.startTime ? new Date(event.startTime).toLocaleDateString('pl-PL') : ''}
            </p>
            <p className={styles.eventPlayers}>
                <span className={styles.eventPlayersPlayer}>
                    {typeof event.participationsCount === 'number' && typeof event.maxPlayers === 'number'
                        ? `${event.participationsCount}/${event.maxPlayers}`
                        : event.maxPlayers}
                </span> graczy
            </p>
                </>
            )}
            {timeSlotsInfo && (
                <div className={styles.eventOpeningHours} style={{ marginTop: 8 }}>
                    {Array.isArray(timeSlotsInfo.availableSlots) && timeSlotsInfo.availableSlots.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {timeSlotsInfo.availableSlots.map((slot, idx) => {
                                const isSelected = selectedSlots.includes(slot);
                                return (
                                    <button
                                        key={slot + idx}
                                        type="button"
                                        style={{
                                            background: isSelected ? '#e54a23' : '#fff',
                                            color: isSelected ? '#fff' : '#e54a23',
                                            border: '1px solid #e54a23',
                                            borderRadius: 8,
                                            padding: '4px 12px',
                                            cursor: 'pointer',
                                            fontWeight: isSelected ? 'bold' : 'normal',
                                            marginBottom: 4
                                        }}
                                        onClick={e => {
                                            e.stopPropagation();
                                            if (onSlotSelect) onSlotSelect(slot);
                                        }}
                                    >
                                        {slot}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ color: '#e54a23' }}>Brak dostępnych slotów</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventCard;
