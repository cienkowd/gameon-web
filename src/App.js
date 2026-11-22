import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import './styles/App.module.css';
import './styles/custom-datepicker.css';
import MobileRedirectGuard from './components/MobileRedirectGuard';
import PageWrapper from './components/PageWrapper/PageWrapper';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// Lazy load all route components
const LoginScreen = React.lazy(() => import('./pages/LoginScreen/LoginScreen'));
const RegisterScreen = React.lazy(() => import('./pages/RegisterScreen/RegisterScreen'));
const UsersScreen = React.lazy(() => import('./pages/UsersScreen/Users'));
const EventsScreen = React.lazy(() => import('./pages/EventsScreen/Events'));
const UserRole = React.lazy(() => import('./pages/UserRole/UserRole'));
const EmailConfirmationScreen = React.lazy(() => import('./pages/UserRole/EmailConfirmationScreen'));
const PasswordRecoveryScreen = React.lazy(() => import('./pages/PasswordRecoveryScreen/PasswordRecoveryScreen'));
const NewPasswordScreen = React.lazy(() => import('./pages/NewPasswordScreen/NewPasswordScreen'));
const WelcomePageScreen = React.lazy(() => import('./pages/WelcomePageScreen/WelcomePageScreen'));
const NewEvent = React.lazy(() => import('./pages/NewEvent/NewEvent'));
const NewEventConfirmation = React.lazy(() => import('./pages/NewEventConfirmation/NewEventConfirmation'));
const HomePageScreen = React.lazy(() => import('./pages/HomePageScreen/HomePageScreen'));
const EventDetail = React.lazy(() => import('./pages/EventDetail/EventDetail'));
const FieldDetail = React.lazy(() => import('./pages/FieldDetail/FieldDetail'));
const ObjectDetail = React.lazy(() => import('./pages/ObjectDetail/ObjectDetail'));
const NewObject = React.lazy(() => import('./pages/NewObject/NewObject'));
const ObjectSummary = React.lazy(() => import('./pages/ObjectSummary/ObjectSummary'));
const CreateCourt = React.lazy(() => import('./pages/CreateCourt/CreateCourt'));
const UserAccountScreen = React.lazy(() => import('./pages/UserAccountScreen/UserAccountScreen'));
const MapScreen = React.lazy(() => import('./pages/MapScreen/MapScreen'));
const MobileAppRequiredScreen = React.lazy(() => import('./pages/MobileAppRequiredScreen/MobileAppRequiredScreen'));
const SettingsScreen = React.lazy(() => import('./pages/SettingsScreen'));
const FavouritesScreen = React.lazy(() => import('./pages/FavouritesScreen'));
const SelectFieldScreen = React.lazy(() => import('./pages/SelectFieldScreen'));

// Loading fallback component
const LoadingFallback = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#666'
    }}>
        Ładowanie...
    </div>
);

function App() {
    return (
        <Router>
            <MobileRedirectGuard>
                <ErrorBoundary>
                    <Suspense fallback={<LoadingFallback />}>
                <Routes>
                            <Route path="/" element={<PageWrapper><WelcomePageScreen/></PageWrapper>}/>
                            <Route path="/register" element={<PageWrapper><RegisterScreen/></PageWrapper>}/>
                            <Route path="/login" element={<PageWrapper><LoginScreen/></PageWrapper>}/>
                            <Route path="/users" element={<PageWrapper><UsersScreen/></PageWrapper>}/>
                            <Route path="/events" element={<PageWrapper><EventsScreen/></PageWrapper>}/>
                            <Route path="/user-role" element={<PageWrapper><UserRole/></PageWrapper>}/>
                            <Route path="/email-confirmation" element={<PageWrapper><EmailConfirmationScreen/></PageWrapper>}/>
                            <Route path="/password-recovery" element={<PageWrapper><PasswordRecoveryScreen/></PageWrapper>}/>
                            <Route path="/new-password" element={<PageWrapper><NewPasswordScreen/></PageWrapper>}/>
                            <Route path="/create-event" element={<PageWrapper><NewEvent/></PageWrapper>}/>
                            <Route path="/event-summary" element={<PageWrapper><NewEventConfirmation/></PageWrapper>} />
                            <Route path="/homepage" element={<PageWrapper><HomePageScreen /></PageWrapper>} />
                            <Route path="/event-detail/:id" element={<PageWrapper><EventDetail /></PageWrapper>} />
                            <Route path="/field-detail/:id" element={<PageWrapper><FieldDetail /></PageWrapper>} />
                            <Route path="/object-detail/:facilityId" element={<PageWrapper><ObjectDetail /></PageWrapper>} />
                            <Route path="/create-object" element={<PageWrapper><NewObject /></PageWrapper>} />
                            <Route path="/object-summary" element={<PageWrapper><ObjectSummary /></PageWrapper>} />
                            <Route path="/create-court" element={<PageWrapper><CreateCourt /></PageWrapper>} />
                            <Route path="/user-account/:userId" element={<PageWrapper><UserAccountScreen /></PageWrapper>} />
                            <Route path="/map" element={<PageWrapper><MapScreen /></PageWrapper>} />
                            <Route path="/mobile-app-required" element={<PageWrapper><MobileAppRequiredScreen /></PageWrapper>} />
                            <Route path="/settings" element={<PageWrapper><SettingsScreen /></PageWrapper>} />
                            <Route path="/favorites" element={<PageWrapper><FavouritesScreen /></PageWrapper>} />
                            <Route path="/select-field" element={<PageWrapper><SelectFieldScreen /></PageWrapper>} />
                </Routes>
                    </Suspense>
                </ErrorBoundary>
            </MobileRedirectGuard>
        </Router>
    );
}

export default App;

