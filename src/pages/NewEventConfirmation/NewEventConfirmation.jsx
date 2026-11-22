import React, {useState, useEffect} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './NewEventConfirmation.module.css';
import Button from '../../components/Button/Button';
import HeaderUser from '../../components/HeaderUser/HeaderUser';
import SettingsModal from '../SettingsScreen/SettingsScreen';

const getUserIdFromJWT = () => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) return null;
    try {
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        return payload.id;
    } catch {
        return null;
    }
};

const NewEventConfirmation = () => {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const { state } = useLocation();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        location: '',
        minFreeSlots: '',
        start_time: '',
        end_time: '',
        privacy: '',
        page: 0,
        size: 10
    });
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [userLogin, setUserLogin] = useState('<user-name>');
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    useEffect(() => {
        const fetchUserLogin = async () => {
            const userId = getUserIdFromJWT();
            if (!userId) return;
            const token = localStorage.getItem('jwt');
            try {
                const response = await fetch(`http://localhost:8080/users/user/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserLogin(data.login);
                }
            } catch {}
        };
        fetchUserLogin();
    }, []);

    const handleFilterChange = (e) => {
        const value = e.target.value;
        setFilters((prev) => ({
            ...prev,
            [e.target.name]: value === '' ? undefined : value
        }));
    };

    const handleDateChange = (date) => {
        setFilters((prev) => ({
            ...prev,
            start_time: date ? date.toISOString() : "",
        }));
    };

    const mapVisibility = (visibility) => {
    switch (visibility.toLowerCase()) {
        case 'publiczne':
            return 'PUBLIC';
        case 'prywatne':
            return 'PRIVATE';
        case 'zweryfikowane':
            return 'VERIFIED';
        default:
            return 'PUBLIC';
    }
};
    const mapSportToEventType = (sport) => {
    switch (sport.toLowerCase()) {
        case 'piłka nożna':
            return 'FOOTBALL';
        case 'koszykówka':
            return 'BASKETBALL';
        case 'badminton':
            return 'BADMINTON';
        case 'tenis stołowy':
            return 'TABLE_TENNIS';
        case 'piłka ręczna':
            return 'HANDBALL';
        case 'baseball':
            return 'BASEBALL';
        case 'sztuki walki':
            return 'MARTIAL_ARTS';
        case 'rolki':
            return 'ROLLS';
        case 'hokej':
            return 'HOKEY';
        case 'tenis':
            return 'TENNIS';
        case 'bieganie':
            return 'RUNNING';
        case 'siatkówka':
            return 'VOLLEYBALL';
        case 'deskorolka':
            return 'SKATEBOARD';
        default:
            return 'OTHER';
    }
};

    const {
        eventName = '',
        eventLocation = '',
        eventDescription = '',
        selectedSport = '',
        selectedDateFrom = null,
        selectedDateTo = null,
        minParticipants = '',
        maxParticipants = '',
        visibility = 'public',
        selectedField = null,
        selectedSlot = null,
        eventStartTime = null,
        eventEndTime = null
    } = state || {};

    const dateFrom = eventStartTime ? new Date(eventStartTime) : (selectedSlot ? new Date(selectedSlot.start) : new Date(selectedDateFrom));
    const dateTo = eventEndTime ? new Date(eventEndTime) : (selectedSlot ? new Date(selectedSlot.end) : new Date(selectedDateTo));

    const handleEdit = () => {
        navigate('/create-event', { state });
    };
    const toggleDescription = () => {
        setIsDescriptionExpanded((prev) => !prev);
    };

    const handleReject = () => {
        navigate('/homepage');
    };

    // Funkcja do formatu lokalnego ISO stringa bez przesunięcia strefy
    function toLocalISOString(date) {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    const handleCreate = async () => {
    try {
        const token = localStorage.getItem('jwt');

        const payload = {
            title: eventName,
            eventDescription: eventDescription,
            minPlayers: parseInt(minParticipants),
            maxPlayers: parseInt(maxParticipants),
            privacyStatus: mapVisibility(visibility),
            eventType: selectedField.sportType,
            startTime: toLocalISOString(dateFrom),
            endTime: toLocalISOString(dateTo),
            fieldId: selectedField.id
        };

        console.log('selectedField:', selectedField);
        console.log('eventType:', selectedField.sportType);
        console.log('fieldId:', selectedField.id);
        console.log('Payload wysyłany do API:', payload);
        console.log('token', localStorage.getItem('jwt'));

        const response = await fetch('http://localhost:8080/events/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Status:', response.status);
            console.error('Błąd z backendu:', errorText);
            throw new Error(`Błąd tworzenia wydarzenia: ${errorText}`);
        }

        const result = await response.json();
        console.log('Utworzone wydarzenie:', result);
        navigate('/homepage');
    } catch (error) {
        console.error('siemao',selectedField)
        console.error('Błąd przy tworzeniu wydarzenia:', error);
        alert('Wystąpił błąd przy tworzeniu wydarzenia.');
    }
};

    return (
        <>
        <HeaderUser
            onSettingsClick={() => setShowSettingsModal(true)}
        />
        <section className={styles.section}>

            <div className={styles.bottomRightStripe}></div>
            <div className={styles.container}>
                <div className={styles.intro}>
                    <h1 className={styles.heading}>Dziękujemy {userLogin}!</h1>
                    <h2 className={styles.summaryHeading}>Oto podsumowanie twojego wydarzenia</h2>
                    <a onClick={handleEdit} href="/create-event" className={styles.editLink}>Wróć do edycji</a>
                </div>
                <div className={styles.summary}>
                    <div className={styles.row}>
                        <span className={styles.label}>Nazwa sportu</span>
                        <span className={styles.value}>{selectedSport}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Nazwa wydarzenia</span>
                        <span className={styles.value}>{eventName}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Data rozpoczęcia</span>
                        <span className={styles.value}>
                            {eventStartTime ? new Date(eventStartTime).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                        </span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Data zakończenia</span>
                        <span className={styles.value}>
                            {eventEndTime ? new Date(eventEndTime).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                        </span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Minimalna liczba uczestników</span>
                        <span className={styles.value}>{minParticipants}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Maksymalna liczba uczestników</span>
                        <span className={styles.value}>{maxParticipants}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Boisko</span>
                        <span className={styles.value}>{selectedField ? selectedField.title || selectedField.name : eventLocation}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Widoczność wydarzenia</span>
                        <span className={styles.value}>{visibility}</span>
                    </div>
                    <div className={styles.row}>
                        {isDescriptionExpanded && (
                            <div className={styles.descriptionPopup}>
                                <p>{eventDescription}</p>
                            </div>
                        )}
                        <div>
                            <span className={styles.label}>Opis wydarzenia</span>

                        </div>
                        <button onClick={toggleDescription} className={styles.expandButton}>
                            {isDescriptionExpanded ? 'Zwiń' : 'Rozwiń'}
                        </button>
                    </div>
                </div>
                <div className={styles.buttonContainer}>
                    <Button
                        text="Odrzuć"
                        onClick={handleReject}
                        className={styles.rejectButton} // Przekazanie dodatkowej klasy
                    />
                    <Button
                        text="Utwórz wydarzenie"
                        onClick={handleCreate}
                    />
                </div>
            </div>
        </section>
        </>
    );
};

export default NewEventConfirmation;
