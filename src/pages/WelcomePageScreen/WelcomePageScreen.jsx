import React from 'react';
import {useNavigate} from 'react-router-dom';
import mainLogo from "../../assets/images/mainbackgroundimageorange.png";
import Button from '../../components/Button/Button';
import styles from "../LoginScreen/LoginScreen.module.css";


const WelcomeScreen = () => {
    const navigate = useNavigate();
    const handleSubmit = async () => {
        navigate('/register');
    }
    return (
        <div className={styles.welcomeContainer}>
            <div className={styles.welcomeContent}>
                <img src={mainLogo} alt="GameOn Logo" className={styles.welcomeLogo}/>
                <div className={styles.welcomeTextSection}>
                    <h1>Witaj!</h1>
                    <h2>W aplikacji GameOn</h2>
                    <p>
                        GameOn to nowoczesna aplikacja, która pozwala Ci zorganizować wydarzenia
                        sportowe, znaleźć uczestników i dzielić się pasją do sportu z innymi.
                    </p>
                    <Button className={styles.welcomeButton} text="Stwórz konto" onClick={handleSubmit}/>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
