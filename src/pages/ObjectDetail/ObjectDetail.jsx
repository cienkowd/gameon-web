import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./ObjectDetail.module.css";
import HeaderMainAdmin from "../../components/HeaderMainAdmin/HeaderMainAdmin";
import HeaderUser from "../../components/HeaderUser/HeaderUser";
import deleteIcon from "../../assets/images/delete.svg";
import deleteHoverIcon from "../../assets/images/delete_hover.svg";
import Button from "../../components/Button/Button";
import EventCard from "../../components/EventCard/EventCard";
import SettingsModal from '../SettingsScreen/SettingsScreen';

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

const ObjectDetail = () => {
  const { facilityId } = useParams();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [objectData, setObjectData] = useState(null);
  const [fieldsDetails, setFieldsDetails] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
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
  const [bannerImage, setBannerImage] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

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
    const fetchUserRole = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Brak tokena autoryzacyjnego.');
        setLoading(false);
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchObjectData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Brak tokena autoryzacyjnego.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:8080/facilities/${facilityId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error(`Błąd ${response.status}`);
        const data = await response.json();
        setObjectData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (facilityId) fetchObjectData();
  }, [facilityId]);

  useEffect(() => {
    const fetchFieldsDetails = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) return;
      try {
        const response = await fetch('http://localhost:8080/fields/my-fields', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) return;
        const data = await response.json();
        const fieldsArray = Array.isArray(data) ? data : (data.content || []);
        setFieldsDetails(fieldsArray);
      } catch (err) {
        setFieldsDetails([]); // fallback na pustą tablicę
      }
    };
    fetchFieldsDetails();
  }, []);

  useEffect(() => {
    const loadBannerImage = async () => {
      if (!objectData?.imageURL) {
        setBannerImage("");
        return;
      }
      
      // Spróbuj pobrać obrazek z autoryzacją
      const authorizedImageUrl = await fetchImageWithAuth(objectData.imageURL);
      
      if (authorizedImageUrl) {
        setBannerImage(authorizedImageUrl);
      } else {
        setBannerImage("");
      }
    };

    loadBannerImage();
  }, [objectData]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (bannerImage && bannerImage.startsWith('blob:')) {
        URL.revokeObjectURL(bannerImage);
      }
    };
  }, [bannerImage]);

  // Funkcja do pobierania obrazka z autoryzacją
  const fetchImageWithAuth = async (imageURL) => {
    const token = localStorage.getItem('jwt');
    if (!token) return null;

    try {
      setImageLoading(true);
      const response = await fetch(`http://localhost:8080/${imageURL.replace(/^\/+/,'')}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Błąd pobierania obrazka obiektu:', response.status);
        return null;
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      return imageUrl;
    } catch (error) {
      console.error('Błąd podczas pobierania obrazka obiektu:', error);
      return null;
    } finally {
      setImageLoading(false);
    }
  };

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
      const response = await fetch(`http://localhost:8080/facilities/${facilityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Błąd podczas usuwania obiektu');
      }

      // Przekieruj do strony głównej po pomyślnym usunięciu
      window.location.href = '/homepage';
    } catch (error) {
      console.error('Błąd podczas usuwania obiektu:', error);
      // Można dodać obsługę błędu dla użytkownika
    }
    
    setShowDeleteConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Sprawdź czy wszystkie kluczowe dane zostały załadowane
  const isInitialDataLoaded = () => {
    if (loading) return false;
    if (!objectData) return false;
    if (!userRole) return false;
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
        {/* Object Banner */}
        <div className={styles.objectBanner} style={{
          backgroundImage: bannerImage ? `url(${bannerImage})` : undefined
        }}>
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
          {/* Tymczasowo ukryte przyciski edycji i usuwania */}
          {userRole === 'OWNER' && (
            <div className={styles.ownerActions} style={{ display: 'none' }}>
              <button className={styles.editButton} onClick={() => window.location.href = '/edit-object'}>
                Edytuj obiekt
              </button>
              <div className={styles.deleteIconWrapper}>
                <img 
                  src={deleteIcon} 
                  alt="Usuń" 
                  className={styles.deleteIcon} 
                  onClick={handleDelete}
                />
                <img 
                  src={deleteHoverIcon} 
                  alt="Usuń" 
                  className={styles.deleteIconHover} 
                  onClick={handleDelete}
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Content Container */}
        <div className={styles.contentContainer}>
          <div className={styles.mainContent}>
            {/* Object Info Section */}
            <div className={styles.objectInfo}>
              <h1 className={styles.sectionTitle}>{objectData?.name}</h1>
              <div className={styles.objectDetails}>
                <div className={styles.location}>
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/e535df198e3545749ccdc959bd451da8/84b221a78f7e863b8be829d8507ee5513cfc8522?placeholderIfAbsent=true"
                    alt="Location icon"
                    className={styles.icon}
                  />
                  <div>{objectData?.city}{objectData?.street ? `, ${objectData.street}` : ''}{objectData?.postalCode ? `, ${objectData.postalCode}` : ''}</div>
                </div>
              </div>
            </div>

            {/* Object Description Section */}
            <div className={styles.objectDescription}>
              <h2 className={styles.sectionTitle}>Opis obiektu</h2>
              <div className={styles.descriptionText}>
                {objectData?.objectDescription}
              </div>
            </div>

            {/* Fields Section */}
            <div className={styles.fieldsSection}>
              <h2 className={styles.sectionTitle}>Boiska na tym obiekcie</h2>
              <div className={styles.fieldsRow}>
                {objectData?.fields && objectData.fields.length > 0 ? (
                  objectData.fields.map(field => {
                    const details = Array.isArray(fieldsDetails) ? fieldsDetails.find(f => f.id === field.id) : undefined;
                    const mergedField = { ...field, ...details };
                    return <EventCard
                      key={field.id}
                      event={{
                        ...mergedField,
                        imageURL: mergedField.imageURL
                          ? `http://localhost:8080/${mergedField.imageURL.replace(/^\/+/,'')}`
                          : `https://source.unsplash.com/400x300/?sport,field`
                      }}
                      type="field"
                    />;
                  })
                ) : (
                  <div>Brak boisk</div>
                )}
              </div>
            </div>

            {/* Owners Section */}
            <div className={styles.fieldsSection}>
              <h2 className={styles.sectionTitle}>Właściciele obiektu</h2>
              <div>
                {objectData?.owners && objectData.owners.length > 0 ? (
                  objectData.owners.map(owner => (
                    <div key={owner.id} style={{marginBottom: 8}}>
                      <b>{owner.firstName} {owner.lastName}</b> ({owner.email})
                    </div>
                  ))
                ) : (
                  <div>Brak właścicieli</div>
                )}
              </div>
            </div>
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
                Czy na pewno chcesz usunąć ten obiekt?
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
      </div>
      <SettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </>
  );
};

export default ObjectDetail; 