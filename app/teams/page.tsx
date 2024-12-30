'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../teams/TeamsLogin.module.css';

export default function TeamsLogin() {
    const [teamName, setTeamName] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async () => {
        setErrorMessage(null);

        try {
            const { data: teams, error } = await supabase
                .from('teams')
                .select('id, team_name, owner_id')
                .eq('team_name', teamName)
                .eq('password', password);

            if (error) throw new Error(error.message);

            if (teams && teams.length > 0) {
                const team = teams[0];

                // Store the entire team object
                sessionStorage.setItem('team', JSON.stringify(team));

                alert('Team login successful!');

                // Emit a custom event to notify Header about login
                window.dispatchEvent(new Event('loginStatusChange'));

                router.push('/teams/dashboard');
            } else {
                setErrorMessage('Invalid team name or password');
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error logging in:', error.message);
                setErrorMessage(error.message);
            } else {
                console.error('Unknown error:', error);
                setErrorMessage('An unexpected error occurred during login.');
            }
        }
    };

    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <h1>Team Login</h1>
                <input
                    type="text"
                    placeholder="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className={styles.inputField}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.inputField}
                />
                <button onClick={handleLogin} className={styles.loginButton}>
                    Log In
                </button>

                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

                <div className={styles.linkContainer}>
                    <Link href="/teams/forgot-password" className={styles.link}>
                        Forgot Password?
                    </Link>
                    <br /><br />
                    <Link href="/teams/signup" className={styles.link}>
                        Sign Up if you&apos;re a new team
                    </Link>
                </div>
            </main>
        </div>
    );
}
