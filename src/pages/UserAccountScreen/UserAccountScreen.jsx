import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './UserAccountScreen.module.css';
import UserProfile from '../../components/user/UserProfile';
import UserInfo from '../../components/user/UserInfo';
import EventCard from '../../components/EventCard/EventCard';
import HeaderUser from '../../components/HeaderUser/HeaderUser';
import HeaderMainAdmin from '../../components/HeaderMainAdmin/HeaderMainAdmin';
import Button from '../../components/Button/Button';
import SettingsModal from '../SettingsScreen/SettingsScreen';

const UserAccountScreen = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [loadingRole, setLoadingRole] = useState(true);
    const [userData, setUserData] = useState({
        name: '',
        login: '',
        participationCount: 0,
        eventsCount: 0,
        avatarUrl: '',
        description: '',
    });
    const [userEvents, setUserEvents] = useState([]);
    const [userEventsPage, setUserEventsPage] = useState(0);
    const [userEventsHasMore, setUserEventsHasMore] = useState(true);
    const [joinedEvents, setJoinedEvents] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({
        location: '',
        minFreeSlots: '',
        start_time: '',
        end_time: '',
        privacy: '',
        page: 0,
        size: 3
    });
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [facilities, setFacilities] = useState([]);
    const [loadingFacilities, setLoadingFacilities] = useState(false);
    const [errorFacilities, setErrorFacilities] = useState(null);
    const [fields, setFields] = useState([]);
    const [loadingFields, setLoadingFields] = useState(false);
    const [errorFields, setErrorFields] = useState(null);
    const [facilitiesPage, setFacilitiesPage] = useState(0);
    const [facilitiesHasMore, setFacilitiesHasMore] = useState(true);
    const [fieldsPage, setFieldsPage] = useState(0);
    const [fieldsHasMore, setFieldsHasMore] = useState(true);
    const [facilitiesCount, setFacilitiesCount] = useState(0);
    const [showFacilitiesContent, setShowFacilitiesContent] = useState(false);
    const [minLoadingComplete, setMinLoadingComplete] = useState(false);
    const [loadingUserEvents, setLoadingUserEvents] = useState(false);
    const [loadingJoinedEvents, setLoadingJoinedEvents] = useState(false);
    const [loadingMoreUserEvents, setLoadingMoreUserEvents] = useState(false);
    const [loadingMoreJoinedEvents, setLoadingMoreJoinedEvents] = useState(false);
    const [loadingMoreFacilities, setLoadingMoreFacilities] = useState(false);
    const [showUserEventsContent, setShowUserEventsContent] = useState(false);
    const [showJoinedEventsContent, setShowJoinedEventsContent] = useState(false);
    const [minUserEventsLoadingComplete, setMinUserEventsLoadingComplete] = useState(false);
    const [minJoinedEventsLoadingComplete, setMinJoinedEventsLoadingComplete] = useState(false);

    const fetchUserData = async () => {
        if (!userId) return;
        const jwt = localStorage.getItem('jwt');
            try {
                const response = await fetch(`http://localhost:8080/users/user/${userId}`, {
                    method: 'GET',
                    headers: jwt ? { 'Authorization': `Bearer ${jwt}` } : {}
                });
                if (!response.ok) throw new Error(`Błąd ${response.status}`);
                const data = await response.json();
            
            // Sprawdź czy firstName i lastName nie są null
            const displayName = (data.firstName && data.lastName && data.firstName !== 'null' && data.lastName !== 'null') 
                ? `${data.firstName} ${data.lastName}`
                : data.login;
            
                setUserData(prev => ({
                    ...prev,
                name: displayName,
                login: data.login,
                    avatarUrl: data.imageURL
                        ? `http://localhost:8080/${data.imageURL.replace(/^\/+/, '')}`
                        : '',
                    description: data.userDescription || 'Brak opisu',
                }));
            } catch (err) {
                console.log('Błąd pobierania danych użytkownika:', err);
            }
        };

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    useEffect(() => {
        const fetchUserRole = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) { setLoadingRole(false); return; }
            try {
                const response = await fetch('http://localhost:8080/users/role', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.ok) {
                    const role = await response.text();
                    setUserRole(role);
                    
                    // Reset stanów ładowania dla nowej roli
                    if (role === 'OWNER') {
                        setMinLoadingComplete(false);
                        setShowFacilitiesContent(false);
                    }
                }
            } catch {}
            setLoadingRole(false);
        };
        fetchUserRole();
    }, []);

    // Pobierz wydarzenia, w których bierze udział
    useEffect(() => {
        if (!userId || userRole === 'OWNER') return;
        
        const jwt = localStorage.getItem('jwt');
        const fetchAttendedEvents = async () => {
            if (page === 0) {
                setLoadingJoinedEvents(true);
            } else {
                setLoadingMoreJoinedEvents(true);
            }
            try {
                const params = new URLSearchParams({
                    userId: userId,
                    page: page,
                    size: 9
                });
                const response = await fetch(`http://localhost:8080/events/attended-by-user?${params.toString()}`, {
                    method: 'GET',
                    headers: jwt ? { 'Authorization': `Bearer ${jwt}` } : {}
                });
                if (!response.ok) throw new Error(`Błąd ${response.status}`);
                const data = await response.json();
                if (page === 0) {
                    setJoinedEvents(data.content || []);
                } else {
                    setJoinedEvents(prev => [...prev, ...(data.content || [])]);
                }
                setUserData(prev => ({
                    ...prev,
                    participationCount: data.totalElements || 0
                }));
                setHasMore(data.content && data.content.length > 0 && !data.last);
            } catch (err) {
                console.log('Błąd pobierania danych z /events/attended-by-user:', err);
            } finally {
                if (page === 0) {
                    setLoadingJoinedEvents(false);
                } else {
                    setLoadingMoreJoinedEvents(false);
                }
            }
        };
        fetchAttendedEvents();
    }, [userId, page, userRole]);

    // Pobierz wydarzenia organizowane przez użytkownika
    useEffect(() => {
        const jwt = localStorage.getItem('jwt');
        if (!jwt || !userId || userRole === 'OWNER') return;
        
        const fetchUserEvents = async () => {
            if (userEventsPage === 0) {
                setLoadingUserEvents(true);
            } else {
                setLoadingMoreUserEvents(true);
            }
            try {
                const params = new URLSearchParams({
                    userId: userId,
                    page: userEventsPage,
                    size: 3
                });
                const response = await fetch(`http://localhost:8080/events/user-events?${params.toString()}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${jwt}` }
                });
                if (!response.ok) throw new Error(`Błąd ${response.status}`);
                const data = await response.json();
                if (userEventsPage === 0) {
                    setUserEvents(data.content || []);
                } else {
                    setUserEvents(prev => [...prev, ...(data.content || [])]);
                }
                setUserEventsHasMore(data.content && data.content.length > 0 && !data.last);
                setUserData(prev => ({
                    ...prev,
                    eventsCount: data.totalElements || 0
                }));
            } catch (err) {
                console.log('Błąd pobierania danych z /events/user-events:', err);
            } finally {
                if (userEventsPage === 0) {
                    setLoadingUserEvents(false);
                } else {
                    setLoadingMoreUserEvents(false);
                }
            }
        };
        fetchUserEvents();
    }, [userEventsPage, userId, userRole]);

    useEffect(() => {
        if (userRole !== 'OWNER') return;
        const fetchFacilities = async () => {
            if (facilitiesPage === 0) {
                setLoadingFacilities(true);
            } else {
                setLoadingMoreFacilities(true);
            }
            setErrorFacilities(null);
            const token = localStorage.getItem('jwt');
            if (!token) {
                setErrorFacilities('Brak tokena autoryzacyjnego.');
                if (facilitiesPage === 0) {
                    setLoadingFacilities(false);
                } else {
                    setLoadingMoreFacilities(false);
                }
                return;
            }
            try {
                const response = await fetch(`http://localhost:8080/facilities/my-facilities?page=${facilitiesPage}&size=9`, {
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
                if (typeof data.totalElements === 'number') {
                    setFacilitiesCount(data.totalElements);
                }
            } catch (err) {
                setErrorFacilities(err.message);
            } finally {
                if (facilitiesPage === 0) {
                    setLoadingFacilities(false);
                } else {
                    setLoadingMoreFacilities(false);
                }
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
                const response = await fetch(`http://localhost:8080/fields/my-fields?page=${fieldsPage}&size=12`, {
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

    useEffect(() => {
        if (userRole !== 'OWNER') return;
        
        // Minimum czas ładowania (800ms)
        const minLoadingTimer = setTimeout(() => {
            setMinLoadingComplete(true);
        }, 800);

        return () => clearTimeout(minLoadingTimer);
    }, [userRole]);

    // Kontrola pokazywania zawartości obiektów
    useEffect(() => {
        if (userRole !== 'OWNER') return;
        
        // Pokaż zawartość tylko gdy:
        // 1. Dane zostały załadowane (!loadingFacilities)
        // 2. Minimalny czas ładowania minął (minLoadingComplete)
        if (!loadingFacilities && minLoadingComplete) {
            // Małe dodatkowe opóźnienie dla płynności
            const showContentTimer = setTimeout(() => {
                setShowFacilitiesContent(true);
            }, 200);
            
            return () => clearTimeout(showContentTimer);
        } else {
            setShowFacilitiesContent(false);
        }
    }, [userRole, loadingFacilities, minLoadingComplete]);

    useEffect(() => {
        if (userRole === 'OWNER') return;
        
        // Minimum czas ładowania dla wydarzeń użytkownika (800ms)
        const minUserEventsTimer = setTimeout(() => {
            setMinUserEventsLoadingComplete(true);
        }, 800);

        return () => clearTimeout(minUserEventsTimer);
    }, [userRole]);

    useEffect(() => {
        if (userRole === 'OWNER') return;
        
        // Minimum czas ładowania dla wydarzeń w których uczestniczy (800ms) 
        const minJoinedEventsTimer = setTimeout(() => {
            setMinJoinedEventsLoadingComplete(true);
        }, 800);

        return () => clearTimeout(minJoinedEventsTimer);
    }, [userRole]);

    // Kontrola pokazywania zawartości wydarzeń użytkownika
    useEffect(() => {
        if (userRole === 'OWNER') return;
        
        if (!loadingUserEvents && minUserEventsLoadingComplete) {
            const showUserEventsTimer = setTimeout(() => {
                setShowUserEventsContent(true);
            }, 200);
            
            return () => clearTimeout(showUserEventsTimer);
        } else {
            setShowUserEventsContent(false);
        }
    }, [userRole, loadingUserEvents, minUserEventsLoadingComplete]);

    // Kontrola pokazywania zawartości wydarzeń w których uczestniczy
    useEffect(() => {
        if (userRole === 'OWNER') return;
        
        if (!loadingJoinedEvents && minJoinedEventsLoadingComplete) {
            const showJoinedEventsTimer = setTimeout(() => {
                setShowJoinedEventsContent(true);
            }, 200);
            
            return () => clearTimeout(showJoinedEventsTimer);
        } else {
            setShowJoinedEventsContent(false);
        }
    }, [userRole, loadingJoinedEvents, minJoinedEventsLoadingComplete]);

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };
    const handleLoadMoreUserEvents = () => {
        setUserEventsPage(prev => prev + 1);
    };

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

    const handleProfileUpdate = () => {
        // Odśwież dane użytkownika po aktualizacji profilu
        fetchUserData();
    };

    // Helper function to get current user ID from JWT
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

    // Check if this is the current user's own profile
    const isOwnProfile = () => {
        const currentUserId = getUserIdFromJWT();
        return currentUserId && currentUserId.toString() === userId;
    };

    if (loadingRole) return null;

    return (
        <div>
            {userRole === 'OWNER' ? (
                <HeaderMainAdmin activeLink="Dashboard" />
            ) : (
                <HeaderUser
                    onSettingsClick={() => setShowSettingsModal(true)}
                />
            )}
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.leftColumn}>
                        <UserProfile
                            name={userData.name}
                            participationCount={userRole === 'OWNER' ? undefined : userData.participationCount}
                            eventsCount={userRole === 'OWNER' ? facilitiesCount : userData.eventsCount}
                            avatarUrl={userData.avatarUrl}
                            onEditProfile={() => setShowSettingsModal(true)}
                            isOwner={userRole === 'OWNER'}
                        />
                    </div>

                    <div className={styles.rightColumn}>
                        <div className={styles.infoAndEvents}>
                            <UserInfo
                                name={userData.name}
                                description={userData.description}
                            />

                            {userRole === 'OWNER' ? (
                                <>
                                    <div className={styles.eventsSection}>
                                        <h2 className={styles.eventsTitle}>
                                            {isOwnProfile() ? 'Obiekty, których jesteś właścicielem:' : 'Obiekty właściciela:'}
                                        </h2>
                                        {(loadingFacilities || !minLoadingComplete) ? (
                                            <div className={styles.facilitiesLoading}>
                                                <div className={styles.loadingSpinner}></div>
                                                Ładowanie obiektów...
                                            </div>
                                        ) : (
                                            <div className={`${styles.facilitiesContent} ${showFacilitiesContent ? styles.visible : ''}`}>
                                                {facilities.length === 0 ? (
                                                    <div className={styles.noObjectsCard} onClick={() => navigate('/create-object')}>
                                                        <div className={styles.noObjectsIcon}></div>
                                                        <h3 className={styles.noObjectsTitle}>Nie masz jeszcze żadnego obiektu</h3>
                                                        <p className={styles.noObjectsDesc}>
                                                            Kliknij tutaj, aby utworzyć swój pierwszy obiekt sportowy i rozpocząć zarządzanie boiskami oraz wydarzeniami
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                        <div className={styles.eventsWrapper}>
                                            <div className={styles.eventsContainer}>
                                                {facilities.map((facility) => (
                                                    <EventCard
                                                        key={facility.id}
                                                        event={{
                                                            ...facility,
                                                            imageURL: facility.imageURL ? `http://localhost:8080/${facility.imageURL}` : undefined,
                                                            sportType: facility.sportType
                                                        }}
                                                        type="facility"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {facilitiesHasMore && facilities.length > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                                                <Button
                                                    text={loadingMoreFacilities ? "Ładowanie..." : "Załaduj więcej"}
                                                    onClick={() => setFacilitiesPage(prev => prev + 1)}
                                                    className={styles.loadMoreCentered}
                                                    disabled={loadingMoreFacilities}
                                                />
                                            </div>
                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={styles.eventsSection}>
                                        <h2 className={styles.eventsTitle}>
                                            {isOwnProfile() ? 'Wydarzenia, których jesteś organizatorem:' : 'Wydarzenia organizowane:'}
                                        </h2>
                                        {(loadingUserEvents || !minUserEventsLoadingComplete) ? (
                                            <div className={styles.facilitiesLoading}>
                                                <div className={styles.loadingSpinner}></div>
                                                Ładowanie wydarzeń...
                                            </div>
                                        ) : (
                                            <div className={`${styles.facilitiesContent} ${showUserEventsContent ? styles.visible : ''}`}>
                                                {userEvents.length === 0 ? (
                                                    <div className={styles.singleCardContainer}>
                                                        <div className={styles.userActionCard} onClick={() => navigate('/create-event')}>
                                                            <div className={styles.userActionIcon}>📝</div>
                                                            <h3 className={styles.userActionTitle}>Utwórz wydarzenie</h3>
                                                            <p className={styles.userActionDesc}>
                                                                Organizuj własne wydarzenia sportowe i znajdź graczy do gry
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                        <div className={styles.eventsWrapper}>
                                            <div className={styles.eventsContainer}>
                                                {userEvents.map((event) => (
                                                    <EventCard key={event.id} event={event} />
                                                ))}
                                            </div>
                                        </div>
                                                        {userEventsHasMore && userEvents.length > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                                                <Button
                                                    text={loadingMoreUserEvents ? "Ładowanie..." : "Załaduj więcej"}
                                                    onClick={handleLoadMoreUserEvents}
                                                    className={styles.loadMoreCentered}
                                                    disabled={loadingMoreUserEvents}
                                                />
                                            </div>
                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.eventsSection}>
                                        <h2 className={styles.eventsTitle}>
                                            {isOwnProfile() ? 'Wydarzenia, w których bierzesz udział:' : 'Wydarzenia z udziałem:'}
                                        </h2>
                                        {(loadingJoinedEvents || !minJoinedEventsLoadingComplete) ? (
                                            <div className={styles.facilitiesLoading}>
                                                <div className={styles.loadingSpinner}></div>
                                                Ładowanie wydarzeń...
                                            </div>
                                        ) : (
                                            <div className={`${styles.facilitiesContent} ${showJoinedEventsContent ? styles.visible : ''}`}>
                                                {joinedEvents.length === 0 ? (
                                                    <div className={styles.singleCardContainer}>
                                                        <div className={styles.userActionCard} onClick={() => navigate('/homepage')}>
                                                            <div className={styles.userActionIcon}>🔍</div>
                                                            <h3 className={styles.userActionTitle}>Dołącz do wydarzenia</h3>
                                                            <p className={styles.userActionDesc}>
                                                                Przeglądaj dostępne wydarzenia i dołącz do gry w swojej okolicy
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                        <div className={styles.eventsWrapper}>
                                            <div className={styles.eventsContainer}>
                                                {joinedEvents.map((event) => (
                                                    <EventCard key={event.id} event={event} />
                                                ))}
                                            </div>
                                        </div>
                                                        {hasMore && joinedEvents.length > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                                                <Button
                                                    text={loadingMoreJoinedEvents ? "Ładowanie..." : "Załaduj więcej"}
                                                    onClick={handleLoadMore}
                                                    className={styles.loadMoreCentered}
                                                    disabled={loadingMoreJoinedEvents}
                                                />
                                            </div>
                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <SettingsModal 
                open={showSettingsModal} 
                onClose={() => setShowSettingsModal(false)}
                onProfileUpdate={handleProfileUpdate}
            />
        </div>
    );
};

export default UserAccountScreen;


