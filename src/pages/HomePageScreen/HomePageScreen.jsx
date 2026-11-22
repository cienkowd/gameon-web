import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import EventCard from '../../components/EventCard/EventCard';
import "react-datepicker/dist/react-datepicker.css";
import styles from './HomePageScreen.module.css';
import footballIcon from '../../assets/images/football.png';
import basketballIcon from '../../assets/images/basketball.png';
import tenisIcon from '../../assets/images/tenis.png';
import volleyballIcon from '../../assets/images/volleyball.png';
import handballIcon from '../../assets/images/handball.png';
import hockeyIcon from '../../assets/images/hokey.png';
import baseballIcon from '../../assets/images/baseball.png';
import runningIcon from '../../assets/images/running.png';
import rollerskatesIcon from '../../assets/images/rollerskates.png';
import skateboardIcon from '../../assets/images/skateboard.png';
import badmintonIcon from '../../assets/images/badminton.png';
import pingpongIcon from '../../assets/images/pingpong.png';
import questionmarkIcon from '../../assets/images/questionmark.png';
import martialSportsIcon from '../../assets/images/martial-sports.png';
import HeaderMain from '../../components/HeaderMain/HeaderMain';
import HeaderMainAdmin from '../../components/HeaderMainAdmin/HeaderMainAdmin';
import SettingsModal from '../SettingsScreen/SettingsScreen';
import { useNavigate } from 'react-router-dom';

const sports = [
    {name: 'Piłka nożna', icon: footballIcon},
    {name: 'Koszykówka', icon: basketballIcon},
    {name: 'Tenis ziemny', icon: tenisIcon},
    {name: 'Siatkówka', icon: volleyballIcon},
    {name: 'Piłka ręczna', icon: handballIcon},
    {name: 'Hokej', icon: hockeyIcon},
    {name: 'Sztuki walki', icon: martialSportsIcon},
    {name: 'Baseball', icon: baseballIcon},
    {name: 'Bieganie', icon: runningIcon},
    {name: 'Rolki', icon: rollerskatesIcon},
    {name: 'Skateboard', icon: skateboardIcon},
    {name: 'Badminton', icon: badmintonIcon},
    {name: 'Tenis stołowy', icon: pingpongIcon},
    {name: 'Inne', icon: questionmarkIcon}
];

// Map sport display names to backend eventType values
const sportNameToSportType = {
    'Piłka nożna': 'FOOTBALL',
    'Koszykówka': 'BASKETBALL',
    'Tenis ziemny': 'TENNIS',
    'Siatkówka': 'VOLLEYBALL',
    'Piłka ręczna': 'HANDBALL',
    'Baseball': 'BASEBALL',
    'Hokej': 'HOKEY',
    'Bieganie': 'RUNNING',
    'Sztuki walki': 'MARTIAL_ARTS',
    'Rolki': 'ROLLS',
    'Skateboard': 'SKATEBOARD',
    'Badminton': 'BADMINTON',
    'Tenis stołowy': 'TABLE_TENNIS',
    'Inne': 'OTHER'
};

const HomePageScreen = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [activeSport, setActiveSport] = useState(null);
    const [selectedSports, setSelectedSports] = useState([]);
    const [formSubmitted] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState(null);
    const [loadingRole, setLoadingRole] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [filters, setFilters] = useState({
        location: '',
        minFreeSlots: '',
        start_time: '',
        end_time: '',
        privacy: '',
        page: 0,
        size: 20,
        sportType: ''
    });
    const [selectedSport, setSelectedSport] = useState(null);
    const [facilities, setFacilities] = useState([]);
    const [loadingFacilities, setLoadingFacilities] = useState(false);
    const [errorFacilities, setErrorFacilities] = useState(null);
    const [fields, setFields] = useState([]);
    const [loadingFields, setLoadingFields] = useState(false);
    const [errorFields, setErrorFields] = useState(null);
    const [eventsPage, setEventsPage] = useState(0);
    const [eventsHasMore, setEventsHasMore] = useState(true);
    const [facilitiesPage, setFacilitiesPage] = useState(0);
    const [facilitiesHasMore, setFacilitiesHasMore] = useState(true);
    const [fieldsPage, setFieldsPage] = useState(0);
    const [fieldsHasMore, setFieldsHasMore] = useState(true);

    // Stan dla komunikatu o usunięciu wydarzenia
    const [showEventDeletedModal, setShowEventDeletedModal] = useState(false);
    const [deletedEventTitle, setDeletedEventTitle] = useState('');

    const observer = useRef();
    const lastEventRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setFilters(prev => ({ ...prev, page: prev.page + 1 }));
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const categoriesRef = useRef(null);
    const scrollCategories = (direction) => {
        if (categoriesRef.current) {
            categoriesRef.current.scrollBy({
                left: direction * 150,
                behavior: 'smooth'
            });
        }
    };

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserRole = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) {
                setError('Brak tokena autoryzacyjnego.');
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/users/role', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Błąd ${response.status}`);
                }

                const role = await response.text();
                setUserRole(role);
                
                // Reset stanu wydarzeń ownera przy zmianie roli
                if (role === 'OWNER') {
                    setOwnerEvents([]);
                    setOwnerEventsPage(0);
                    setOwnerEventsHasMore(true);
                    setOwnerEventsInitialized(false);
                }
            } catch (err) {
                setError(err.message);
            } finally {
            setLoadingRole(false);
            }
        };

        fetchUserRole();
    }, []);

    const handleSearch = () => {
        const finalLocation = filters.location ? capitalizeFirstLetter(filters.location) : "";
        setFilters(prev => ({ ...prev, page: 0 })); // reset page
        setAppliedFilters({
            ...filters,
            location: finalLocation,
            page: 0
        });
    };

    const toggleSportFilter = (sportName) => {
        setSelectedSport(prev => prev === sportName ? null : sportName);
        setFilters(prev => ({
            ...prev,
            sportType: prev.sportType === sportNameToSportType[sportName] ? '' : sportNameToSportType[sportName],
            page: 0
        }));
        setAppliedFilters(null); // wymuś ponowne pobranie
    };

    const handleDateChange = (date) => {
        setFilters((prev) => ({
            ...prev,
            start_time: date ? date.toISOString() : "",
        }));
    };

    const capitalizeFirstLetter = (text) => {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    const [debouncedLocation, setDebouncedLocation] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedLocation(filters.location ? capitalizeFirstLetter(filters.location) : "");
        }, 500);
        return () => clearTimeout(handler);
    }, [filters.location]);

    useEffect(() => {
        handleSearch();
    }, []);

    // Helper to get ownerId from JWT
    const getOwnerIdFromJWT = () => {
        const jwt = localStorage.getItem('jwt');
        if (!jwt) return null;
        try {
            const payload = JSON.parse(atob(jwt.split('.')[1]));
            return payload.id;
        } catch {
            return null;
        }
    };

    // OWNER EVENTS PAGINATION
    const [ownerEvents, setOwnerEvents] = useState([]);
    const [ownerEventsPage, setOwnerEventsPage] = useState(0);
    const [ownerEventsHasMore, setOwnerEventsHasMore] = useState(true);
    const [ownerEventsInitialized, setOwnerEventsInitialized] = useState(false);

    const fetchOwnerEvents = useCallback(async () => {
        if (userRole !== 'OWNER') return;
        
        // Zapobiegnij wielokrotnemu ładowaniu pierwszej strony
        if (ownerEventsPage === 0 && ownerEventsInitialized) {
            return;
        }
        
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('jwt');
        const ownerId = getOwnerIdFromJWT();
        if (!token || !ownerId) {
            setError('Brak tokena autoryzacyjnego lub ownerId.');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/events/upcoming-by-owner?ownerId=${ownerId}&page=${ownerEventsPage}&size=6`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error(`Błąd ${response.status}`);
            const data = await response.json();
            
            setOwnerEvents(prev => {
                if (ownerEventsPage === 0) {
                    setOwnerEventsInitialized(true);
                    return data.content || [];
                }
                // Deduplikacja - dodaj tylko wydarzenia, które jeszcze nie istnieją
                const newEvents = data.content || [];
                const existingIds = new Set(prev.map(event => event.id));
                const uniqueNewEvents = newEvents.filter(event => !existingIds.has(event.id));
                return [...prev, ...uniqueNewEvents];
            });
            
            setOwnerEventsHasMore(!data.last);
        } catch (err) {
            console.error('Error fetching owner events:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userRole, ownerEventsPage, ownerEventsInitialized]);

    useEffect(() => {
        fetchOwnerEvents();
    }, [fetchOwnerEvents]);

    // Memoized owner events to prevent duplicate rendering
    const memoizedOwnerEvents = useMemo(() => {
        return ownerEvents;
    }, [ownerEvents]);

    // USER EVENTS (original logic)
    useEffect(() => {
        if (userRole === 'OWNER') return;
        if (!appliedFilters) {
            setAppliedFilters({ ...filters, page: 0 });
            return;
        }
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('jwt');
            if (!token) {
                setError('Brak tokena autoryzacyjnego.');
                setLoading(false);
                return;
            }
            try {
                const queryParams = new URLSearchParams();
                if (appliedFilters.location && appliedFilters.location.length >= 3) {
                    queryParams.append("location", appliedFilters.location);
                }
                if (appliedFilters.sportType) {
                    queryParams.append('sportType', appliedFilters.sportType);
                }
                Object.keys(appliedFilters).forEach(key => {
                    if (key !== "location" && key !== "sportType" && appliedFilters[key] !== '' && appliedFilters[key] !== undefined) {
                        queryParams.append(key, appliedFilters[key]);
                    }
                });
                const response = await fetch(`http://localhost:8080/events/upcoming-events?${queryParams.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error(`Błąd ${response.status}`);
                const data = await response.json();
                setEvents(prev =>
                    appliedFilters.page === 0 ? data.content : [...prev, ...data.content]
                );
                setHasMore(!data.last);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [userRole, appliedFilters]);

    useEffect(() => {
        setAppliedFilters(prev => ({ ...prev, page: filters.page }));
    }, [filters.page]);

    const handleFilterChange = (e) => {
        const value = e.target.value;
        setFilters((prev) => ({
            ...prev,
            [e.target.name]: value === '' ? undefined : value
        }));
    };

    useEffect(() => {
        if (userRole !== 'OWNER') return;
        const fetchFacilities = async () => {
            setLoadingFacilities(true);
            setErrorFacilities(null);
            const token = localStorage.getItem('jwt');
            if (!token) {
                setErrorFacilities('Brak tokena autoryzacyjnego.');
                setLoadingFacilities(false);
                return;
            }
            try {
                const response = await fetch(`http://localhost:8080/facilities/my-facilities?page=${facilitiesPage}&size=2`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) throw new Error(`Błąd ${response.status}`);
                const data = await response.json();
                setFacilities(prev => facilitiesPage === 0 ? data.content : [...prev, ...data.content]);
                setFacilitiesHasMore(!data.last);
            } catch (err) {
                setErrorFacilities(err.message);
            } finally {
                setLoadingFacilities(false);
            }
        };
        fetchFacilities();
    }, [userRole, facilitiesPage]);

    useEffect(() => {
        if (userRole !== 'OWNER') return;
        const fetchFields = async () => {
            setLoadingFields(true);
            setErrorFields(null);
            const token = localStorage.getItem('jwt');
            if (!token) {
                setErrorFields('Brak tokena autoryzacyjnego.');
                setLoadingFields(false);
                return;
            }
            try {
                const response = await fetch(`http://localhost:8080/fields/my-fields?page=${fieldsPage}&size=4`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) throw new Error(`Błąd ${response.status}`);
                const data = await response.json();
                const fieldsArray = Array.isArray(data) ? data : (data.content || []);
                setFields(prev => fieldsPage === 0 ? fieldsArray : [...prev, ...fieldsArray]);
                setFieldsHasMore(!data.last);
            } catch (err) {
                setErrorFields(err.message);
                setFields([]);
            } finally {
                setLoadingFields(false);
            }
        };
        fetchFields();
    }, [userRole, fieldsPage]);

    const renderOwnerOnboardingBanner = () => {
        if (facilities.length > 0) return null;
        return (
            <div className={styles.onboardingBanner}>
                <div className={styles.onboardingBannerContent}>
                    <h3>Witaj w panelu właściciela!</h3>
                    <p>Aby w pełni korzystać z możliwości platformy, dodaj swój pierwszy obiekt sportowy.<br/>
                    Po dodaniu obiektu będziesz mógł nim zarządzać, dodawać boiska oraz śledzić wydarzenia organizowane przez użytkowników.<br/>
                    Sekcje z wydarzeniami i boiskami pojawią się automatycznie po utworzeniu pierwszego obiektu.</p>
                </div>
            </div>
        );
    };

    const renderOwnerContent = () => (
        <div className={styles.contentWrapper}>
            {renderOwnerOnboardingBanner()}
            <h2 className={styles.sectionTitle}>Najbliższe wydarzenia</h2>
            <div className={styles.eventsRow}>
                {facilities.length !== 0 && memoizedOwnerEvents.length === 0 ? (
                    <div className={styles.mockEventCard}>
                        <div className={styles.mockEventImagePlaceholder}></div>
                        <h3 className={styles.mockEventTitle}>Tutaj pojawiają się najbliższe wydarzenia na Twoich obiektach</h3>
                    </div>
                ) : memoizedOwnerEvents.map((event, index) => (
                    <EventCard 
                        key={`owner-event-${event.id}-${index}`}
                        event={{ 
                            ...event,
                            imageURL: event.field?.imageURL ? `http://localhost:8080/${event.field.imageURL}` : undefined,
                            sportType: event.field?.sportType || event.eventType
                        }} 
                        type="event" 
                    />
                ))}
            </div>
            {ownerEventsHasMore && memoizedOwnerEvents.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                    <button 
                        className={styles.loadMoreCentered} 
                        onClick={() => setOwnerEventsPage(prev => prev + 1)}
                        disabled={loading}
                    >
                        {loading ? '' : 'Załaduj więcej wydarzeń'}
                    </button>
                </div>
            )}

            <h2 className={styles.sectionTitle}>Obiekty</h2>
            <div className={styles.objectsRow}>
                {facilities.length === 0 ? (
                    <div className={styles.createFacilityCard} onClick={() => navigate('/create-object')}>
                        <div className={styles.createFacilityIcon}>+</div>
                        <div className={styles.createFacilityInfo}>
                            <div className={styles.createFacilityTitle}>Utwórz swój pierwszy obiekt</div>
                            <div className={styles.createFacilityDesc}>Kliknij, aby dodać nowy obiekt sportowy</div>
                        </div>
                    </div>
                ) : facilities.map((facility, index) => (
                    <EventCard
                        key={`facility-${facility.id}-${index}`}
                        event={{
                            ...facility,
                            imageURL: facility.imageURL ? `http://localhost:8080/${facility.imageURL}` : undefined,
                            sportType: facility.sportType
                        }}
                        type="facility"
                    />
                ))}
            </div>
            {facilitiesHasMore && facilities.length > 0 && (
                <button 
                    className={styles.loadMoreCentered} 
                    onClick={() => setFacilitiesPage(prev => prev + 1)}
                    disabled={loadingFacilities}
                >
                    {loadingFacilities ? '' : 'Załaduj więcej obiektów'}
                </button>
            )}

            <h2 className={styles.sectionTitle}>Boiska</h2>
            <div className={styles.fieldsRow}>
                {facilities.length !== 0 && fields.length === 0 ? (
                    <div className={styles.mockFieldCard}>
                        <div className={styles.mockFieldImagePlaceholder}></div>
                        <h3 className={styles.mockFieldTitle}>Tutaj pojawią się boiska z Twoich obiektów</h3>
                        <p className={styles.mockFieldDesc}>Po dodaniu obiektu i boisk zobaczysz je tutaj i będziesz mógł je konfigurować według własnych potrzeb.</p>
                        <p className={styles.mockFieldSport}>Typ sportu</p>
                        <p className={styles.mockFieldPlayers}>
                            <span style={{fontWeight: 'bold'}}>Liczba graczy</span>
                        </p>
                    </div>
                ) : fields.map((field, index) => (
                    <EventCard
                        key={`field-${field.id}-${index}`}
                        event={{
                            ...field,
                            imageURL: field.imageURL ? `http://localhost:8080/${field.imageURL}` : undefined,
                            sportType: field.sportType
                        }}
                        type="field"
                    />
                ))}
            </div>
            {fieldsHasMore && fields.length > 0 && (
                <button 
                    className={styles.loadMoreCentered} 
                    onClick={() => setFieldsPage(prev => prev + 1)}
                    disabled={loadingFields}
                >
                    {loadingFields ? '' : 'Załaduj więcej boisk'}
                </button>
            )}
        </div>
    );

    const renderUserContent = () => (
        <div className={styles.contentWrapper}>
            <div className={styles.categoriesWrapper}>
                <button
                    className={styles.scrollButton}
                    onClick={() => scrollCategories(-1)}
                    aria-label="Przewiń w lewo"
                >
                    &#8592;
                </button>
                <div className={styles.categories} ref={categoriesRef}>
                {sports.map((sport, index) => (
                    <div
                        key={index}
                        className={`${styles.sportItem} ${selectedSport === sport.name ? styles.active : ''}`}
                        onClick={() => toggleSportFilter(sport.name)}
                        onMouseEnter={() => setActiveSport(index)}
                        onMouseLeave={() => setActiveSport(null)}
                    >
                        <img src={sport.icon} alt={sport.name} className={styles.sportIcon} />
                        <span>{sport.name}</span>
                    </div>
                ))}
                </div>
                <button
                    className={styles.scrollButton}
                    onClick={() => scrollCategories(1)}
                    aria-label="Przewiń w prawo"
                >
                    &#8594;
                </button>
            </div>

            <div className={styles.eventsContainer}>
                {events.map((event, index) => {
                    const imageURL = event.field?.imageURL
                        ? `http://localhost:8080/${event.field.imageURL}`
                        : `https://source.unsplash.com/400x300/?sport,${encodeURIComponent(event.title || event.name || 'game')}`;
                    const card = <EventCard key={event.id} event={{ ...event, imageURL }} />;
                    return index === events.length - 1
                        ? <div ref={lastEventRef} key={event.id}>{card}</div>
                        : card;
                })}
                {loading && <p className={styles.loadingText}></p>}
            </div>
        </div>
    );

    const renderContent = () => {
        if (error) return <p className={styles.errorText}>{error}</p>;
        return userRole === 'OWNER' ? renderOwnerContent() : renderUserContent();
    };

    // Sprawdź czy wszystkie kluczowe dane zostały załadowane
    const isInitialDataLoaded = () => {
        if (loadingRole) return false;
        
        if (userRole === 'OWNER') {
            // Dla ownera sprawdź czy facilities zostały załadowane
            return !loadingFacilities || facilities.length > 0;
        } else {
            // Dla usera sprawdź czy eventy zostały załadowane  
            return !loading || events.length > 0;
        }
    };

    // Jeśli dane nie są jeszcze załadowane, pokaż loader
    if (!isInitialDataLoaded()) {
        return (
            <>
                {userRole === 'OWNER' ? (
                    <HeaderMainAdmin activeLink="Dashboard" />
                ) : userRole && (
                    <HeaderMain
                        filters={filters}
                        handleFilterChange={handleFilterChange}
                        handleDateChange={handleDateChange}
                        formSubmitted={formSubmitted}
                        onSearch={handleSearch}
                        onSettingsClick={() => setShowSettingsModal(true)}
                    />
                )}
                <div className={styles.loadingContainer}>
                    <p className={styles.loadingText}></p>
                </div>
            </>
        );
    }

    return (
        <>
            {userRole === 'OWNER' ? (
                <HeaderMainAdmin activeLink="Dashboard" />
            ) : (
                <HeaderMain
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                    handleDateChange={handleDateChange}
                    formSubmitted={formSubmitted}
                    onSearch={handleSearch}
                    onSettingsClick={() => setShowSettingsModal(true)}
                />
            )}
            <div>
                {renderContent()}
            </div>

            <SettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
            
            {/* Modal komunikatu o udanym usunięciu wydarzenia */}
            {showEventDeletedModal && (
                <div className={styles.modalOverlay} onClick={() => setShowEventDeletedModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Sukces!</h3>
                        <p className={styles.modalText}>
                            Wydarzenie "{deletedEventTitle}" zostało pomyślnie usunięte.
                        </p>
                        <div className={styles.modalButtons}>
                            <button 
                                className={styles.confirmButton}
                                onClick={() => setShowEventDeletedModal(false)}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HomePageScreen;
