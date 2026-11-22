export const validateRegisterForm = ({username, email, password, confirmPassword}) => {
    const errors = {};

    // Walidacja nazwy uzytkownika (username)
    if (!username) {
        errors.username = "Nazwa użytkownika jest wymagana.";
    } else if (username.length < 4) {
        errors.username = "Nazwa użytkownika musi mieć co najmniej 4 znaki.";
    } else if (username.length > 50) {
        errors.username = "Nazwa użytkownika może mieć maksymalnie 50 znaków.";
    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
        errors.username = "Nazwa użytkownika musi się składać ze znaków alfanumerycznych.";
    }

    // Walidacja emaila
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        errors.email = "Adres e-mail jest wymagany.";
    } else if (!emailRegex.test(email)) {
        errors.email = "Podaj prawidłowy adres e-mail.";
    } else if (email.length > 50) {
        errors.email = "Adres email może mieć maksymalnie 50 znaków.";
    }

    // Walidacja hasła
    const passwordRequirements = [
        password.length >= 8,
        /[0-9]/.test(password),
        /[!@#$%^&*(),.?":{}|<>]/.test(password),
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
    ];

    if (!password) {
        errors.password = "Hasło jest wymagane.";
    } else if (passwordRequirements.some((req) => !req)) {
        errors.password =
            "Hasło musi mieć minimum 8 znaków, 1 małą literę, 1 wielką literę, 1 cyfrę i 1 znak specjalny.";
    }

    // Walidacja potwierdzenia hasła
    if (!confirmPassword) {
        errors.confirmPassword = "Potwierdzenie hasła jest wymagane.";
    } else if (password !== confirmPassword) {
        errors.confirmPassword = "Podane hasła nie są zgodne.";
    }

    return errors;
};
