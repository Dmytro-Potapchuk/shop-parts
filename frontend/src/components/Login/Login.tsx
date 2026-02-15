// src/components/Login.tsx
import React, { useState } from "react";
import { login } from "../../services";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AuthForm.module.css";
import { User } from "../../types.tsx";

interface LoginProps {
    onLoginSuccess: (role: User['role']) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const loggedInUser = await login(username, password);
            onLoginSuccess(loggedInUser.role);
            navigate(loggedInUser.role === "admin" ? "/admin" : "/parts");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Błąd logowania. Sprawdź dane.");
            }

            console.error("Błąd logowania:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginPageContainer}>
            <div className={styles.graphicSide}>
                <div className={styles.circleYellow}></div>
                <div className={styles.circleBlue}></div>
            </div>
            <div className={styles.loginFormSide}>
                <div className={styles.loginBox}>
                    <h2 className={styles.loginTitle}>LOGIN</h2>
                    <form onSubmit={handleLogin}>
                        <div className={styles.inputGroup}>
                            {/* Usunięto label, placeholder pełni jego rolę w tym designie */}
                            <input
                                type="text"
                                id="username"
                                placeholder="Login" // Zmieniono placeholder
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={styles.inputField} // Użyjemy dedykowanej klasy
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            {/* Usunięto label */}
                            <input
                                type="password"
                                id="password"
                                placeholder="Hasło" // Zmieniono placeholder
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.inputField} // Użyjemy dedykowanej klasy
                                required
                            />
                        </div>
                        {error && <p className={styles.errorText}>{error}</p>}
                        <button type="submit" className={styles.button} disabled={isLoading}>
                            {isLoading ? "LOGOWANIE..." : "LOGIN"}
                        </button>
                    </form>
                    <p className={styles.link}>
                        Nie masz konta? <a href="/register">Zarejestruj się</a>
                    </p>
                </div>
            </div>
        </div>
    );
};