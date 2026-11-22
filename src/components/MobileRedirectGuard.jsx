import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MOBILE_PATH = '/mobile-app-required';
const LAST_PATH_KEY = 'lastNonMobilePath';

const MobileRedirectGuard = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 700 && location.pathname !== MOBILE_PATH) {
        // Zapamiętaj ostatnią stronę
        localStorage.setItem(LAST_PATH_KEY, location.pathname + location.search);
        navigate(MOBILE_PATH, { replace: true });
      } else if (window.innerWidth >= 700 && location.pathname === MOBILE_PATH) {
        // Wróć na zapamiętaną stronę lub homepage
        const lastPath = localStorage.getItem(LAST_PATH_KEY) || '/homepage';
        navigate(lastPath, { replace: true });
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [location.pathname, location.search, navigate]);

  return children;
};

export default MobileRedirectGuard; 