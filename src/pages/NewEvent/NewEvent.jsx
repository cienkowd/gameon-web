import React, {useEffect, useState, useCallback, useRef} from 'react';
import styles from './NewEvent.module.css';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Select from '../../components/Select/Select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
import {pl} from 'date-fns/locale/pl';
import publicImage from '../../assets/images/public.svg';
import privateImage from '../../assets/images/private.svg';
import verificatedImage from '../../assets/images/verificated.svg';
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from '../../assets/images/marker-icon.png';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { AlertCircle } from 'lucide-react';
import HeaderUser from '../../components/HeaderUser/HeaderUser';
import MapViewSetter from '../../components/MapViewSetter/MapViewSetter';
import { useMapEvents } from 'react-leaflet';
import SettingsModal from '../SettingsScreen/SettingsScreen';

const defaultIcon = L.icon({
    iconUrl: markerIcon,
    iconSize: [24, 40],
    iconAnchor: [12, 40],
    popupAnchor: [1, -34],
});

const visibilityDescriptions = {
    Publiczne: "Każda osoba może dołączyć do wydarzenia. Liczba miejsc ograniczona, decyduje kolejność zgłoszeń.",
    Weryfikowane: "Organizator sam zatwierdza uczestników. Prośby wygasają automatycznie po 24 godzinach.",
    Prywatne: "Uczestnicy są zapraszani przez organizatora. Tylko zaproszone osoby mogą wziąć udział w wydarzeniu."
};

// Komponent do nasłuchiwania na zmianę bounds mapy
function MapBoundsListener({ onBoundsChange }) {
    useMapEvents({
        moveend: (e) => {
            const bounds = e.target.getBounds();
            onBoundsChange(bounds);
        },
        zoomend: (e) => {
            const bounds = e.target.getBounds();
            onBoundsChange(bounds);
        }
    });
    return null;
}

const sportOptions = [
    { value: 'FOOTBALL', label: 'Piłka nożna' },
    { value: 'BASKETBALL', label: 'Koszykówka' },
    { value: 'TENNIS', label: 'Tenis ziemny' },
    { value: 'VOLLEYBALL', label: 'Siatkówka' },
    { value: 'HANDBALL', label: 'Piłka ręczna' },
    { value: 'BASEBALL', label: 'Baseball' },
    { value: 'HOKEY', label: 'Hokej' },
    { value: 'RUNNING', label: 'Bieganie' },
    { value: 'MARTIAL_ARTS', label: 'Sztuki walki' },
    { value: 'ROLLS', label: 'Wrotki' },
    { value: 'SKATEBOARD', label: 'Skateboard' },
    { value: 'BADMINTON', label: 'Badminton' },
    { value: 'TABLE_TENNIS', label: 'Tenis stołowy' },
    { value: 'OTHER', label: 'Inne' },
];

// Funkcja do generowania slotów co 15 minut
function getTimeSlots(start, end, intervalMinutes = 15) {
    if (!start || !end) return [];
    const slots = [];
    let current = new Date(start);
    while (current <= end) {
        slots.push(new Date(current));
        current.setMinutes(current.getMinutes() + intervalMinutes);
    }
    return slots;
}

// Funkcja do pobierania lokalnej daty w formacie YYYY-MM-DD
function getLocalDateString(date) {
    const pad = n => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const NewEvent = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [eventName, setEventName] = useState(state?.eventName || '');
    const [eventNameError, setEventNameError] = useState('');
    const [eventLocation, setEventLocation] = useState(state?.eventLocation || '');
    const [locationCoords, setLocationCoords] = useState([52.2297, 21.0122]); // Domyślnie Warszawa
    const [eventDescription, setEventDescription] = useState(state?.eventDescription || '');
    const [descriptionLength, setDescriptionLength] = useState(state?.eventDescription?.length || 0);
    const [minParticipants, setMinParticipants] = useState(state?.minParticipants || '');
    const [maxParticipants, setMaxParticipants] = useState(state?.maxParticipants || '');
    const [participantsError, setParticipantsError] = useState('');
    const [selectedSport, setSelectedSport] = useState(state?.selectedSport || '');
    const [selectedSportError, setSelectedSportError] = useState('');
    const [selectedDateFrom, setSelectedDateFrom] = useState(state?.selectedDateFrom || null);
    const [selectedDateTo, setSelectedDateTo] = useState(state?.selectedDateTo || null);
    const [error, setError] = useState('');
    const [visibility, setVisibility] = useState(state?.visibility || '');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [sports, setSports] = useState([]);
    const [showManualMarker, setShowManualMarker] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const mapRef = useRef();

    const [filters, setFilters] = useState({
        location: '',
        minFreeSlots: '',
        start_time: '',
        end_time: '',
        privacy: '',
        page: 0,
        size: 10
    });

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

    const fetchCoordinates = async (address) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const location = data[0];
                setLocationCoords([parseFloat(location.lat), parseFloat(location.lon)]);
                setShowManualMarker(false); // <== to powoduje brak markera
            } else {
                setError('Nie znaleziono lokalizacji.');
            }
        } catch (error) {
            console.error('Błąd podczas pobierania współrzędnych:', error);
            setError('Wystąpił problem z pobraniem lokalizacji.');
        }
    };

    const [fields, setFields] = useState([]);
    const [filteredFields, setFilteredFields] = useState([]);
    const [fieldQuery, setFieldQuery] = useState('');
    const [selectedField, setSelectedField] = useState(null);

    useEffect(() => {
        const fetchFields = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) return;

            try {
                const response = await fetch(`http://localhost:8080/fields/browse?latitudeA=51&longitudeA=20&latitudeB=53&longitudeB=23`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setFields(data);
                } else {
                    console.error('Błąd przy pobieraniu boisk:', response.status);
                }
            } catch (error) {
                console.error('Błąd:', error);
            }
        };

        fetchFields();
    }, []);

    useEffect(() => {
        const query = fieldQuery.toLowerCase();
        if (query.length === 0) {
            setFilteredFields([]);
        } else {
            setFilteredFields(fields.filter(field =>
                field.name.toLowerCase().includes(query) ||
                field.sportObject.name.toLowerCase().includes(query) ||
                field.sportObject.city.toLowerCase().includes(query)
            ));
        }
    }, [fieldQuery, fields]);

    const handleLocationChange = (e) => {
        const address = e.target.value;
        setEventLocation(address);
        setError('');

        if (address.length > 3) {
            fetchCoordinates(address);
        }
    };

    const handleLocationChangeCombined = (e) => {
        const address = e.target.value;
        setEventLocation(address);
        handleLocationChange(e);
    };

    const validateSelectedSport = (sport) => {
        if (!sport) {
            setSelectedSportError('Musisz wybrać rodzaj sportu');
            return false;
        } else if (!sportOptions.some(opt => opt.value === sport)) {
            setSelectedSportError('Wybierz sport z listy');
            return false;
        } else {
            setSelectedSportError('');
            return true;
        }
    };

    const validateEventName = (name) => {
        if (!name.trim()) {
            setEventNameError('Podaj nazwę wydarzenia');
            return false;
        } else if (name.length > 100) {
            setEventNameError('Nazwa wydarzenia może mieć maksymalnie 100 znaków');
            return false;
        } else if (name.length < 3) {
            setEventNameError('Nazwa wydarzenia musi mieć minimum 3 znaki');
            return false;
        } else {
            setEventNameError('');
            return true;
        }
    };

    const validateParticipants = (minValue, maxValue) => {
        const minNum = parseInt(minValue, 10);
        const maxNum = parseInt(maxValue, 10);

        if (!minNum || !maxNum) {
            setParticipantsError('Podaj minimalną i maksymalną liczbę uczestników');
            return false;
        }
        if (minNum < 2) {
            setParticipantsError('Minimalna liczba uczestników nie może być mniejsza niż 2');
            return false;
        }
        if (maxNum > 100) {
            setParticipantsError('Maksymalna liczba uczestników nie może być większa niż 100');
            return false;
        }
        if (minNum > maxNum) {
            setParticipantsError('Minimalna liczba uczestników nie może być większa od maksymalnej');
            return false;
        }

        setParticipantsError('');
        return true;
    };

    const handleFacilityMarkerClick = (facility) => {
        setSelectedFacility(facility);
        if (mapRef.current) {
            mapRef.current.setView([facility.latitude, facility.longitude], 17, { animate: true });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);

        const isSportValid = validateSelectedSport(selectedSport);
        const isNameValid = validateEventName(eventName);
        const isParticipantsValid = validateParticipants(minParticipants, maxParticipants);

        if (!isSportValid || !isNameValid || !eventDescription || !selectedDateFrom || !isParticipantsValid || !visibility) {
            return;
        }

        navigate('/select-field', {
            state: {
                eventName,
                eventLocation,
                eventDescription,
                selectedSport,
                selectedDateFrom,
                minParticipants,
                maxParticipants,
                visibility,
                facilityId: selectedFacility?.id,
                date: selectedDateFrom instanceof Date ? getLocalDateString(selectedDateFrom) : '',
                sportType: selectedSport,
            },
        });
    };

    useEffect(() => {
        if (formSubmitted) {
            validateSelectedSport(selectedSport);
            validateEventName(eventName);
            validateParticipants(minParticipants, maxParticipants);
        }
    }, [formSubmitted, selectedSport, eventName, minParticipants, maxParticipants]);

    useEffect(() => {
        const fetchSportTypes = async () => {
            try {
                const token = localStorage.getItem('jwt');
                if (!token) {
                    console.error('Brak tokena. Użytkownik nie jest zalogowany.');
                    return;
                }

                const response = await fetch('http://localhost:8080/events/types', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Błąd API: ${response.status}`);
                }

                const data = await response.json();

                const translatedOptions = data.map(type => sportOptions.find(opt => opt.value === type)?.label || type);
                setSports(translatedOptions);
            } catch (error) {
                console.error('Błąd pobierania typów sportów:', error);
            }
        };

        fetchSportTypes();
    }, []);

    const [facilities, setFacilities] = useState([]);
    const [facilitiesLoading, setFacilitiesLoading] = useState(false);
    const [facilitiesError, setFacilitiesError] = useState(null);
    const [mapBounds, setMapBounds] = useState(null);
    const [availableFacilities, setAvailableFacilities] = useState([]);

    // Funkcja pobierająca facilities i sprawdzająca dostępne boiska
    const fetchFacilities = useCallback(async (date, sportType, bounds) => {
        if (!date || !sportType || !bounds) return;
        setFacilitiesLoading(true);
        setFacilitiesError(null);
        try {
            // 1. Pobierz wszystkie facilities w zasięgu mapy
            const params = new URLSearchParams({
                date,
                sportType,
                latitudeA: bounds.getSouthWest().lat,
                longitudeA: bounds.getSouthWest().lng,
                latitudeB: bounds.getNorthEast().lat,
                longitudeB: bounds.getNorthEast().lng,
            });
            const token = localStorage.getItem('jwt');
            const response = await fetch(`http://localhost:8080/facilities/browse?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Błąd pobierania dostępnych obiektów');
            const facilitiesData = await response.json();

            // 2. Dla każdego facility sprawdź dostępne boiska
            const availableFacilitiesPromises = facilitiesData.map(async (facility) => {
                const fieldsParams = new URLSearchParams({
                    facilityId: facility.id,
                    date: date,
                    sportType: sportType,
                });
                const fieldsResponse = await fetch(`http://localhost:8080/facilities/get-fields-for-reservation?${fieldsParams.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!fieldsResponse.ok) return null;
                const fields = await fieldsResponse.json();
                
                // Filtruj boiska po maxPlayers
                const suitableFields = fields.filter(field => 
                    field.maxPlayers >= parseInt(maxParticipants, 10)
                );
                
                // Jeśli są odpowiednie boiska, zwróć facility
                return suitableFields.length > 0 ? facility : null;
            });

            const availableFacilities = (await Promise.all(availableFacilitiesPromises)).filter(Boolean);
            setAvailableFacilities(availableFacilities);
            setFacilities(facilitiesData);
        } catch (err) {
            setFacilitiesError(err.message);
            setFacilities([]);
            setAvailableFacilities([]);
        } finally {
            setFacilitiesLoading(false);
        }
    }, [maxParticipants]);

    // Fetchuj facilities przy zmianie daty, sportu lub bounds
    useEffect(() => {
        if (selectedDateFrom && selectedSport && mapBounds) {
            const dateStr = selectedDateFrom instanceof Date ? getLocalDateString(selectedDateFrom) : '';
            fetchFacilities(dateStr, selectedSport, mapBounds);
        }
    }, [selectedDateFrom, selectedSport, mapBounds, fetchFacilities]);

    const slotsToHighlight = selectedDateFrom && selectedDateTo
        ? getTimeSlots(selectedDateFrom, selectedDateTo)
        : [];

    const [showSettingsModal, setShowSettingsModal] = useState(false);

    return (
        <div>
            <HeaderUser
                onSettingsClick={() => setShowSettingsModal(true)}
            />
            <div className={styles.bottomRightStripe}></div>
            <h1 className={styles.heading}>Nowe wydarzenie</h1>
            <form className={styles.formContainer} onSubmit={handleSubmit}>
                <div className={styles.leftColumn}>
                    <div>
                        <label className={styles.selectLabel}>
                            Wpisz rodzaj sportu lub wybierz z listy
                            {formSubmitted && selectedSportError && (
                                <Tippy content={selectedSportError} placement="right" theme="custom">
                                    <AlertCircle size={20} className={styles.errorIcon}/>
                                </Tippy>
                            )}
                        </label>
                        <Select
                            options={sportOptions.map(opt => opt.label)}
                            value={sportOptions.find(opt => opt.value === selectedSport)?.label || ''}
                            onChange={label => {
                                const found = sportOptions.find(opt => opt.label === label);
                                setSelectedSport(found ? found.value : '');
                            }}
                            hasError={!!selectedSportError}
                        />
                    </div>
                    <p className={styles.subtitle}>
                        Wprowadź unikalną nazwę wydarzenia
                        {formSubmitted && eventNameError && (
                            <Tippy content={eventNameError} placement="right" theme="custom">
                                <AlertCircle size={20} className={styles.errorIcon}/>
                            </Tippy>
                        )}
                    </p>
                    <Input
                        type="text"
                        placeholder="Nazwa wydarzenia"
                        value={eventName}
                        onChange={(e) => {
                            const value = e.target.value;
                            setEventName(value);
                        }}
                        style={{
                            border: '1px solid #e54a23',
                            borderRadius: '20px',
                            maxWidth: '460px',
                            paddingRight: '5px',
                        }}
                        hasError={formSubmitted && !!eventNameError}
                    />
                    <p className={styles.subtitle}>
                        Opisz wydarzenie
                        {formSubmitted && !eventDescription && (
                            <Tippy content="Dodaj opis wydarzenia" placement="right" theme="custom">
                                <AlertCircle size={20} className={styles.errorIcon}/>
                            </Tippy>
                        )}
                    </p>
                    <div className={styles.textareaContainer}>
                        <textarea
                            placeholder="Podaj dodatkowe informacje o wydarzeniu dla uczestników"
                            value={eventDescription}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 500) {
                                    setEventDescription(value);
                                    setDescriptionLength(value.length);
                                }
                            }}
                            className={`${styles.textarea} ${formSubmitted && !eventDescription ? styles.errorField : ''}`}
                        ></textarea>
                        <div
                            className={`${styles.textareaCounter} ${
                                descriptionLength === 500 ? styles.limitReached : ''
                            }`}
                        >
                            {descriptionLength}/500
                        </div>
                    </div>
                    <p className={styles.subtitle}>
                        Kiedy?
                    </p>

                    <div className={styles.inputsContainer}>
                        <div className={styles.inputWithIcon}>
                            <span className={styles.calendar}></span>
                            <DatePicker
                                selected={selectedDateFrom}
                                onChange={(date) => {
                                    setSelectedDateFrom(date);
                                }}
                                placeholderText="Data rozpoczęcia"
                                dateFormat="dd.MM.yyyy"
                                minDate={new Date()}
                                locale={pl}
                                className={`${styles.datePicker} ${formSubmitted && !selectedDateFrom ? styles.errorField : ''}`}
                                fixedHeight
                                onFocus={(e) => e.target.blur()}
                                onKeyDown={(e) => e.preventDefault()}
                                highlightDates={[]}
                            />
                        </div>
                    </div>

                    <p className={styles.subtitle}>
                        Wybierz minimalną i maksymalną liczbę uczestników
                        {formSubmitted && participantsError && (
                            <Tippy content={participantsError} placement="right" theme="custom">
                                <AlertCircle size={20} className={styles.errorIcon}/>
                            </Tippy>
                        )}
                    </p>
                    <div className={styles.inputsContainer}>
                        <Input
                            type="text"
                            placeholder="Minimalna liczba"
                            value={minParticipants}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setMinParticipants(value);
                                validateParticipants(value);
                            }}
                            style={{
                                border: '1px solid #e54a23',
                                borderRadius: '20px',
                                width: '100%',
                                paddingRight: '0px',
                                textAlign: 'center',
                                paddingLeft: '0px',
                                paddingTop: '17px',
                                paddingBottom: '17px',
                            }}
                            hasError={formSubmitted && !!participantsError}
                        />
                        <Input
                            type="text"
                            placeholder="Maksymalna liczba"
                            value={maxParticipants}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setMaxParticipants(value);
                                validateParticipants(value);
                            }}
                            style={{
                                border: '1px solid #e54a23',
                                borderRadius: '20px',
                                width: '100%',
                                paddingRight: '0px',
                                textAlign: 'center',
                                paddingLeft: '0px',
                                paddingTop: '17px',
                                paddingBottom: '17px',
                            }}
                            hasError={formSubmitted && !!participantsError}
                        />
                    </div>
                </div>
                <div className={styles.rightColumn}>
                    <p className={styles.subtitle}>
                        Wybierz miejscowość
                    </p>
                    <div className={styles.fieldSelectionContainer}>
                        <Input
                            type="text"
                            placeholder="Wpisz miejscowość"
                            value={eventLocation}
                            onChange={(e) => handleLocationChange(e)}
                            style={{
                                border: '1px solid #e54a23',
                                borderRadius: '20px',
                                width: '100%',
                                padding: '15px 10px',
                                maxWidth: 'unset',
                                boxSizing: 'border-box'
                            }}
                            hasError={formSubmitted && !eventLocation}
                        />

                        {filteredFields.length > 0 && !selectedField && (
                            <ul className={styles.fieldList}>
                                {filteredFields.slice(0, 10).map(field => (
                                    <li
                                        key={field.id}
                                        className={`${styles.fieldListItem} ${selectedField?.id === field.id ? styles.selectedFieldItem : ''}`}
                                        onClick={() => {
                                            setSelectedField(field);
                                            setFieldQuery(`${field.name}, ${field.sportObject.city}`);
                                            setLocationCoords([field.sportObject.latitude, field.sportObject.longitude]);
                                            setEventLocation(`${field.sportObject.street}, ${field.sportObject.city}`);
                                        }}
                                    >
                                        {field.name} – {field.sportObject.name} ({field.sportObject.city})
                                    </li>

                                ))}
                            </ul>
                        )}
                    </div>

                   <div className={styles.map}>
                        <MapContainer
                            center={locationCoords}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            whenCreated={mapInstance => {
                                setMapBounds(mapInstance.getBounds());
                                mapRef.current = mapInstance;
                            }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                            <MapViewSetter coords={locationCoords} />
                            <MapBoundsListener onBoundsChange={setMapBounds} />

                            {/* Marker dla wybranej lokalizacji */}
                            {showManualMarker && (
                                <Marker position={locationCoords} icon={defaultIcon}>
                                    <Popup>Lokalizacja wydarzenia</Popup>
                                </Marker>
                            )}
                            {/* Markery tylko dla obiektów z dostępnymi boiskami */}
                            {availableFacilities.map(facility => (
                                <Marker
                                    key={facility.id}
                                    position={[facility.latitude, facility.longitude]}
                                    icon={selectedFacility && selectedFacility.id === facility.id ? L.icon({
                                        iconUrl: markerIcon,
                                        iconSize: [32, 48],
                                        iconAnchor: [16, 48],
                                        popupAnchor: [1, -34],
                                        className: 'selected-marker',
                                    }) : defaultIcon}
                                    eventHandlers={{
                                        click: () => handleFacilityMarkerClick(facility)
                                    }}
                                >
                                    <Popup>
                                        <strong>{facility.name}</strong><br />
                                        {facility.address}<br />
                                        {facility.sportType}
                                    </Popup>
                                </Marker>
                            ))}
                            {/* Wyróżniony marker po wybraniu pola (jeśli chcesz zostawić) */}
                            {selectedField && (
                                <Marker position={[selectedField.sportObject.latitude, selectedField.sportObject.longitude]} icon={defaultIcon}>
                                    <Popup>
                                        <strong>{selectedField.name}</strong><br />
                                        {selectedField.sportObject.street}, {selectedField.sportObject.city}
                                    </Popup>
                                </Marker>
                            )}
                        </MapContainer>
                        {facilitiesLoading && <div className={styles.loading}></div>}
                        {facilitiesError && <div className={styles.error}>{facilitiesError}</div>}
                    </div>

                    <p className={styles.subtitle}>
                        Widoczność wydarzenia
                        {formSubmitted && !visibility && (
                            <Tippy content="Wybierz rodzaj widoczności" placement="right" theme="custom">
                                <AlertCircle size={20} className={styles.errorIcon}/>
                            </Tippy>
                        )}
                    </p>
                    <div className={styles.visibilityContainer}>
                        {['Publiczne', 'Weryfikowane', 'Prywatne'].map((type, index) => (
                            <Tippy content={visibilityDescriptions[type]} placement="bottom" theme="visibility-tooltip"
                                   key={index}>
                                <div
                                    className={`${styles.visibilityButton} ${visibility === type ? styles.activeButton : ''} ${
                                        formSubmitted && !visibility ? styles.errorField : ''
                                    }`}
                                    onClick={() => setVisibility(type)}
                                >
                                    <img
                                        src={
                                            type === 'Publiczne'
                                                ? publicImage
                                                : type === 'Weryfikowane'
                                                    ? verificatedImage
                                                    : privateImage
                                        }
                                        alt={type}
                                    />
                                </div>
                            </Tippy>
                        ))}
                    </div>
                    <Button text="Przejdź dalej" type="submit"/>
                </div>
            </form>
            <SettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
        </div>
    );
};

export default NewEvent;
