import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapScreen.module.css';
// Import the custom marker icon from NewEvent (adjust path if needed)
import markerIconUrl from '../../assets/images/marker-icon.png';
import EventCard from '../../components/EventCard/EventCard';
import { useNavigate } from 'react-router-dom';

const customIcon = new L.Icon({
    iconUrl: markerIconUrl,
    iconSize: [24, 40],
    iconAnchor: [12, 40],
    popupAnchor: [1, -34],
});

const customIconLarge = new L.Icon({
    iconUrl: markerIconUrl,
    iconSize: [30, 50],
    iconAnchor: [15, 50],
    popupAnchor: [1, -34],
});

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

const MapScreen = () => {
    const [events, setEvents] = useState([]);
    const [visibleEvents, setVisibleEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mapRef = useRef();
    const navigate = useNavigate();
    const [hoveredEventId, setHoveredEventId] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('jwt');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const response = await fetch('http://localhost:8080/events/upcoming-events?page=0&size=100', {
                    method: 'GET',
                    headers,
                });
                if (!response.ok) throw new Error('Błąd pobierania wydarzeń');
                const data = await response.json();
                setEvents(data.content || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Default center (Poland)
    const center = [52.237049, 21.017532];

    // Filtruj eventy na podstawie bounds mapy
    const handleBoundsChange = (bounds) => {
        setVisibleEvents(
            events.filter(event => {
                const lat = event.field?.sportObject?.latitude;
                const lng = event.field?.sportObject?.longitude;
                if (lat && lng) {
                    return bounds.contains([lat, lng]);
                }
                return false;
            })
        );
    };

    // Po załadowaniu eventów, ustaw widoczne eventy na podstawie aktualnych bounds mapy
    useEffect(() => {
        if (mapRef.current && events.length > 0) {
            const map = mapRef.current;
            const bounds = map.getBounds();
            handleBoundsChange(bounds);
        }
    }, [events]);

    return (
        <div className={styles.mapLayout}>
            <div className={styles.eventsList}>
                {loading && <div className={styles.loading}></div>}
                {error && <div className={styles.error}>{error}</div>}
                {!loading && !error && visibleEvents.length === 0 && (
                    <div className={styles.noEventsMessage}>Brak wydarzeń w tym obszarze mapy.</div>
                )}
                {visibleEvents.map(event => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onMouseEnter={() => setHoveredEventId(event.id)}
                        onMouseLeave={() => setHoveredEventId(null)}
                    />
                ))}
            </div>
            <div className={styles.mapWrapper}>
                <MapContainer
                    center={center}
                    zoom={6}
                    style={{ height: '100vh', width: '100%' }}
                    whenCreated={mapInstance => { mapRef.current = mapInstance; }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
                    />
                    <MapBoundsListener onBoundsChange={handleBoundsChange} />
                    {events.map(event => {
                        const lat = event.field?.sportObject?.latitude;
                        const lng = event.field?.sportObject?.longitude;
                        if (lat && lng) {
                            return (
                                <Marker
                                    key={event.id}
                                    position={[lat, lng]}
                                    icon={hoveredEventId === event.id ? customIconLarge : customIcon}
                                >
                                    <Popup>
                                        <strong>{event.title}</strong><br/>
                                        {event.field?.sportObject?.name}<br/>
                                        {event.field?.sportObject?.city}
                                    </Popup>
                                </Marker>
                            );
                        }
                        return null;
                    })}
                </MapContainer>
                <button className={styles.fabHome} onClick={() => navigate('/homepage')} title="Wróć do strony głównej">
                    🏠
                </button>
            </div>
        </div>
    );
};

export default MapScreen; 