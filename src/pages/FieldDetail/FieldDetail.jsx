import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./FieldDetail.module.css";
import OpeningHours from "./OpeningHours";
import HeaderMainAdmin from "../../components/HeaderMainAdmin/HeaderMainAdmin";
import HeaderUser from "../../components/HeaderUser/HeaderUser";
import deleteIcon from "../../assets/images/delete.svg";
import deleteHoverIcon from "../../assets/images/delete_hover.svg";
import EventCard from "../../components/EventCard/EventCard";
import Button from "../../components/Button/Button";
import { startOfWeek, addDays, format } from "date-fns";
import SettingsModal from '../SettingsScreen/SettingsScreen';

const FieldDetail = () => {
  const [fieldData, setFieldData] = useState(null);
  const { id } = useParams();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
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
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [fieldEvents, setFieldEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [weekSlots, setWeekSlots] = useState([]);
  const [openingHoursLoading, setOpeningHoursLoading] = useState(true);
  const [openingHoursError, setOpeningHoursError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bannerError, setBannerError] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);
  const [bannerImage, setBannerImage] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  const fetchImageWithAuth = async (imageURL) => {
    const token = localStorage.getItem('jwt');
    if (!token) return null;

    try {
      setImageLoading(true);
      const response = await fetch(`http://localhost:8080/${imageURL}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Błąd pobierania obrazka boiska:', response.status);
        return null;
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      return imageUrl;
    } catch (error) {
      console.error('Błąd podczas pobierania obrazka boiska:', error);
      return null;
    } finally {
      setImageLoading(false);
    }
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

  useEffect(() => {
    const fetchFieldDetails = async () => {
      const token = localStorage.getItem("jwt");
      if (!token || !id) return;

      try {
        const response = await fetch(`http://localhost:8080/fields/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Błąd ${response.status}`);
        }

        const data = await response.json();
        setFieldData(data);
      } catch (err) {
        console.error("Błąd podczas pobierania danych boiska:", err);
        setError("Nie udało się pobrać danych boiska.");
      } finally {
        setLoading(false);
      }
    };

    fetchFieldDetails();
  }, [id]);

  useEffect(() => {
    const fetchFieldEvents = async () => {
      const token = localStorage.getItem("jwt");
      if (!token || !id) return;
      setEventsLoading(true);
      setEventsError(null);
      try {
        const response = await fetch(`http://localhost:8080/events/upcoming-events-by-field?fieldId=${id}&page=0&size=4`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`Błąd ${response.status}`);
        const data = await response.json();
        setFieldEvents((data.content || data).slice(0, 4));
      } catch (err) {
        setEventsError("Nie udało się pobrać wydarzeń dla tego boiska.");
        setFieldEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchFieldEvents();
  }, [id]);

  useEffect(() => {
    const fetchWeekSlots = async () => {
      const token = localStorage.getItem("jwt");
      if (!token || !id) return;
      setOpeningHoursLoading(true);
      setOpeningHoursError(null);

      try {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const promises = Array.from({ length: 7 }, (_, i) => {
          const date = addDays(weekStart, i);
          const dateStr = format(date, "yyyy-MM-dd");
          return fetch(
            `http://localhost:8080/fields/booked-time-slots?fieldId=${id}&date=${dateStr}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ).then(res => res.ok ? res.json() : null);
        });
        const slots = await Promise.all(promises);
        setWeekSlots(slots);
      } catch (err) {
        setOpeningHoursError("Nie udało się pobrać godzin otwarcia.");
        setWeekSlots([]);
      } finally {
        setOpeningHoursLoading(false);
      }
    };

    fetchWeekSlots();
  }, [id, selectedDate]);

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
        }
      } catch {}
      setLoadingRole(false);
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (fieldData) {
    }
  }, [fieldData]);

  // Ładowanie obrazka bannera z autoryzacją
  useEffect(() => {
    const loadBannerImage = async () => {
      if (!fieldData) return;
      
      if (fieldData?.imageURL) {
        // Spróbuj pobrać obrazek boiska z autoryzacją
        const authorizedImageUrl = await fetchImageWithAuth(fieldData.imageURL);
        
        if (authorizedImageUrl) {
          setBannerImage(authorizedImageUrl);
          setBannerError(false);
          return;
        }
      }
      
      if (fieldData?.sportObject?.imageURL) {
        // Spróbuj pobrać obrazek obiektu sportowego z autoryzacją
        const authorizedImageUrl = await fetchImageWithAuth(fieldData.sportObject.imageURL);
        
        if (authorizedImageUrl) {
          setBannerImage(authorizedImageUrl);
          setBannerError(false);
          return;
        }
      }
      
      // Jeśli nie udało się pobrać żadnego obrazka, użyj placeholdera
      setBannerImage("");
      setBannerError(true);
    };

    loadBannerImage();
  }, [fieldData]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (bannerImage && bannerImage.startsWith('blob:')) {
        URL.revokeObjectURL(bannerImage);
      }
    };
  }, [bannerImage]);

  const handleModalClick = (e) => {
    if (e.target.className === styles.modalOverlay) {
      setShowDeleteConfirmation(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('Brak tokena autoryzacyjnego');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/fields/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Błąd podczas usuwania boiska');
      }

      // Przekieruj do strony głównej po pomyślnym usunięciu
      window.location.href = '/homepage';
    } catch (error) {
      console.error('Błąd podczas usuwania boiska:', error);
      // Można dodać obsługę błędu dla użytkownika
    }
    
    setShowDeleteConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Oblicz URL placeholdera
  const placeholderUrl = (() => {
    const type = (fieldData?.sportType || '').toUpperCase();
    const placeholders = {
      FOOTBALL: require('../../utils/placeholders/football-banner.png'),
      BASKETBALL: require('../../utils/placeholders/basketball-banner.png'),
      HANDBALL: require('../../utils/placeholders/handball-banner.png'),
      HOKEY: require('../../utils/placeholders/hokey-banner.png'),
      VOLLEYBALL: require('../../utils/placeholders/voleyball-banner.png'),
      TENNIS: require('../../utils/placeholders/tennis-banner.png'),
      BASEBALL: require('../../utils/placeholders/baseball-banner.png'),
      RUNNING: require('../../utils/placeholders/running-banner.png'),
      BADMINTON: require('../../utils/placeholders/badminton-banner.png'),
      TABLE_TENNIS: require('../../utils/placeholders/table-tennis-banner.png'),
      ROLLS: require('../../utils/placeholders/rolls-banner.png'),
      SKATEBOARD: require('../../utils/placeholders/skateboard-banner.png'),
      OTHER: require('../../utils/placeholders/other-banner.png'),
      MARTIAL_ARTS: require('../../utils/placeholders/martial-arts-banner.png'),
    };
    return placeholders[type] || require('../../utils/placeholders/other-banner.png');
  })();

  // Sprawdź czy wszystkie kluczowe dane zostały załadowane
  const isInitialDataLoaded = () => {
    if (loading) return false;
    if (loadingRole) return false;
    if (!fieldData) return false;
    return true;
  };

  // Jeśli dane nie są jeszcze załadowane, pokaż loader
  if (!isInitialDataLoaded()) {
    return (
      <>
        {userRole === 'OWNER' ? (
          <HeaderMainAdmin activeLink="Dashboard" />
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

  if (error) return <div>Błąd: {error}</div>;

  return (
    <>
      {userRole === 'OWNER' ? (
        <HeaderMainAdmin activeLink="Dashboard" />
      ) : (
        <HeaderUser 
          onSettingsClick={() => setShowSettingsModal(true)}
        />
      )}
      <div className={styles.objectPage}>
        {/* Field Banner */}
        <div
          className={styles.objectBanner}
          style={{
            backgroundImage: `url(${bannerImage || placeholderUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            overflow: 'hidden',
          }}
        >
          {imageLoading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontSize: '16px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
            }}>
            </div>
          )}
        </div>

        {/* Main Content Container */}
        <div className={styles.mainAndSidebar}>
          <div className={styles.mainContent}>
            {/* Field Info Section */}
            <div className={styles.objectInfo}>
              <h1 className={styles.sectionTitle}>{fieldData?.name || "Nazwa boiska"}</h1>
              <div className={styles.objectDetails}>
                <div className={styles.location}>
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/e535df198e3545749ccdc959bd451da8/84b221a78f7e863b8be829d8507ee5513cfc8522?placeholderIfAbsent=true"
                    alt="Location icon"
                    className={styles.icon}
                  />
                  <div>
                    {fieldData?.sportObject?.city}, {fieldData?.sportObject?.postalCode}, {fieldData?.sportObject?.street}
                  </div>
                </div>
                <div className={styles.playerLimit}>
                  Maksymalna ilość graczy: {fieldData?.maxPlayers}
                </div>
              </div>
            </div>

            {/* Field Description Section */}
            <div className={styles.objectDescription}>
              <h2 className={styles.sectionTitle}>Opis boiska</h2>
              <div className={styles.descriptionText}>
                {fieldData?.fieldDescription || "Brak opisu"}
              </div>

            </div>

            {/* Field Events Section */}
            <div className={styles.eventsSection}>
              <h2 className={styles.sectionTitle}>Wydarzenia na tym boisku</h2>
              <div className={styles.eventsRow}>
                {eventsLoading ? (
                  <div></div>
                ) : eventsError ? (
                  <div>{eventsError}</div>
                ) : fieldEvents.length === 0 ? (
                  <div>Brak wydarzeń na tym boisku.</div>
                ) : (
                  fieldEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={{
                        ...event,
                        imageURL: fieldData?.imageURL ? `http://localhost:8080/${fieldData.imageURL}` : undefined,
                        sportType: fieldData?.sportType
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Godziny otwarcia w lewej sekcji */}
            <div className={styles.scrollPageContainer}>
              <div className={styles.openingHoursSection}>
                <h2 className={styles.sectionTitle}>Godziny otwarcia</h2>
                <OpeningHours
                  weekSlots={weekSlots}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  loading={openingHoursLoading}
                  error={openingHoursError}
                />
              </div>
            </div>
          </div>

          {/* Organizer Card */}
          {/* USUNIĘTO KAFEL OWNER */}
        </div>
      </div>

      {showDeleteConfirmation && (
        <div 
          className={styles.modalOverlay}
          onClick={handleModalClick}
          tabIndex={0}
        >
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Potwierdzenie</h3>
            <p className={styles.modalText}>
              Czy na pewno chcesz usunąć to boisko?
            </p>
            <p className={styles.modalSubText}>
              Tej zmiany nie będzie można cofnąć
            </p>
            <div className={styles.modalButtons}>
              <Button
                text="Anuluj"
                onClick={handleCancelDelete}
                className={styles.cancelButton}
              />
              <Button
                text="Usuń"
                onClick={handleConfirmDelete}
                className={`${styles.confirmButton} ${styles.deleteConfirmButton}`}
              />
            </div>
          </div>
        </div>
      )}
      <SettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </>
  );
};

export default FieldDetail; 