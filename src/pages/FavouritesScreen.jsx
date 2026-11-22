import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard/EventCard';
import styles from './HomePageScreen/HomePageScreen.module.css';
import favouritesStyles from './FavouritesScreen.module.css';
import HeaderUser from '../components/HeaderUser/HeaderUser';
import HeaderMainAdmin from '../components/HeaderMainAdmin/HeaderMainAdmin';
import SettingsModal from './SettingsScreen/SettingsScreen';

const FavouritesScreen = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [filters, setFilters] = useState({
        page: 0,
        size: 20
    });
    const observer = useRef();
    const lastEventRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new window.IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setFilters(prev => ({ ...prev, page: prev.page + 1 }));
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        const fetchUserRole = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) return;
            try {
                const response = await fetch('http://localhost:8080/users/role', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.ok) {
                    const role = await response.text();
                    setUserRole(role);
                }
            } catch {}
        };
        fetchUserRole();
    }, []);

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

    useEffect(() => {
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
                const userId = getUserIdFromJWT();
                const params = new URLSearchParams({
                    userId,
                    page: filters.page,
                    size: filters.size
                });
                const response = await fetch(`http://localhost:8080/events/attended-by-user?${params.toString()}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error(`Błąd ${response.status}`);
                const data = await response.json();
                setEvents(prev => filters.page === 0 ? data.content : [...prev, ...data.content]);
                setHasMore(!data.last);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [filters.page]);

    // Sprawdź czy wszystkie kluczowe dane zostały załadowane
    const isInitialDataLoaded = () => {
        if (!userRole) return false;
        if (loading && filters.page === 0) return false;
        return true;
    };

    // Jeśli dane nie są jeszcze załadowane, pokaż loader
    if (!isInitialDataLoaded()) {
        return (
            <>
                {userRole === 'OWNER' ? (
                    <HeaderMainAdmin activeLink="Uczestnictwo" />
                ) : userRole && (
                    <HeaderUser 
                        onSettingsClick={() => setShowSettingsModal(true)}
                    />
                )}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '50vh',
                    fontSize: '18px',
                    color: '#666'
                }}>
                </div>
            </>
        );
    }

    return (
        <div>
            {userRole === 'OWNER' ? (
                <HeaderMainAdmin activeLink="Uczestnictwo" />
            ) : (
                <HeaderUser 
                    onSettingsClick={() => setShowSettingsModal(true)}
                />
            )}
            <div className={styles.contentWrapper}>
                <h2 className={styles.sectionTitle}>Wydarzenia, w których uczestniczysz</h2>
                <div className={styles.eventsContainer}>
                    {events.length === 0 && !loading ? (
                        <div className={favouritesStyles.singleCardContainer}>
                            <div className={favouritesStyles.userActionCard} onClick={() => navigate('/homepage')}>
                                <div className={favouritesStyles.userActionIcon}>🔍</div>
                                <h3 className={favouritesStyles.userActionTitle}>Dołącz do wydarzenia</h3>
                                <p className={favouritesStyles.userActionDesc}>
                                    Nie bierzesz jeszcze udziału w żadnym wydarzeniu. Przeglądaj dostępne wydarzenia i dołącz do gry w swojej okolicy
                                </p>
                            </div>
                        </div>
                    ) : (
                        events.map((event, index) => {
                            const card = <EventCard key={event.id} event={event} />;
                            return index === events.length - 1
                                ? <div ref={lastEventRef} key={event.id}>{card}</div>
                                : card;
                        })
                    )}
                    {loading && <p className={styles.loadingText}></p>}
                    {error && <p className={styles.errorText}>{error}</p>}
                </div>
            </div>
            <SettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
        </div>
    );
};

export default FavouritesScreen; 