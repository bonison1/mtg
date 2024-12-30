'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import styles from '../../teams/TeamsLogin.module.css';
import Link from 'next/link';

export default function TeamsForgotPassword() {
    const [teamName, setTeamName] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleResetPassword = async () => {
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const { data: team, error } = await supabase
                .from('teams')
                .select('id')
                .eq('team_name', teamName);

            if (error) throw new Error(error.message);

            if (team && team.length > 0) {
                // Simulate password reset process
                setSuccessMessage('Password reset link sent to team owner email.');
            } else {
                setErrorMessage('Team not found');
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error resetting password:', error.message);
                setErrorMessage(error.message);
            } else {
                console.error('Unknown error:', error);
                setErrorMessage('An unexpected error occurred during password reset.');
            }
        }
    };

    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <h1>Forgot Password</h1>
                <input
                    type="text"
                    placeholder="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className={styles.inputField}
                />
                <Link href="/teams" className={styles.link}>
                        Back to Login
                    </Link>

                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
            </main>
        </div>
    );
}
