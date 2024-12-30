'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation';
import styles from '../../teams/TeamsLogin.module.css';
import Link from 'next/link';

export default function TeamsSignup() {
    const [teamName, setTeamName] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleSignup = async () => {
        setErrorMessage(null);

        try {
            const { error } = await supabase.from('teams').insert({
                team_name: teamName,
                password,
            });

            if (error) throw new Error(error.message);

            alert('Team signup successful!');
            router.push('/teams');
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error signing up:', error.message);
                setErrorMessage(error.message);
            } else {
                console.error('Unknown error:', error);
                setErrorMessage('An unexpected error occurred during signup.');
            }
        }
    };

    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <h1>Team Signup</h1>
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
                <button onClick={handleSignup} className={styles.loginButton}>
                    Sign Up
                </button>
                <div className={styles.linkContainer}>
                    <Link href="/teams/forgot-password" className={styles.link}>
                        Forgot Password?
                    </Link>
                    <br /><br />
                    <Link href="/teams" className={styles.link}>
                        Login if you&apos;re a existing account
                    </Link>
                </div>

                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
            </main>
        </div>
    );
}
