'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import styles from '../../styles/TeamSummary.module.css';

export default function TeamSummaryPage() {
  const [teamsData, setTeamsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // For searching team email
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]); // Filtered team data
  const router = useRouter();

  useEffect(() => {
    const fetchTeamsData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('order_data')
          .select('team, cid');

        if (ordersError) {
          throw new Error(ordersError.message);
        }

        // Group teams and calculate total CID
        const groupedTeams = ordersData.reduce((acc: any, order: { team: string; cid: number }) => {
          const email = order.team;
          const cidValue = Number(order.cid) || 0;

          if (!acc[email]) {
            acc[email] = { email, totalCID: 0 };
          }

          acc[email].totalCID += cidValue;

          return acc;
        }, {});

        const teamList = Object.values(groupedTeams);
        setTeamsData(teamList);
        setFilteredTeams(teamList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamsData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchTerm(query);
    const filtered = teamsData.filter((team) =>
      team.email.toLowerCase().includes(query)
    );
    setFilteredTeams(filtered);
  };

  const handleTeamClick = async (email: string) => {
    if (!email) {
      alert('Invalid team email.');
      return;
    }

    setLoading(true);

    // Check if the team has data
    const { data: teamData, error } = await supabase
      .from('order_data')
      .select('id')
      .eq('team', email)
      .limit(1);

    setLoading(false);

    if (error) {
      alert('Error fetching team data. Please try again later.');
      return;
    }

    if (!teamData || teamData.length === 0) {
      alert(`No data available for team: ${email}`);
      return;
    }

    // Navigate to the correct URL with encoded email
    router.push(`/admin/components/TeamCommissions/${encodeURIComponent(email)}`);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Teams Summary</h2>

      {error && <p className={styles.error}>{error}</p>}

      {/* Search Team Email */}
      <div className={styles.searchContainer}>
        <label htmlFor="team-search">Search Team Email:</label>
        <input
          id="team-search"
          type="text"
          placeholder="Search by team email"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <p>Loading team data...</p>
      ) : filteredTeams.length > 0 ? (
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Team Email</th>
              <th>Total CID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team) => (
              <tr key={team.email}>
                <td>{team.email}</td>
                <td>{team.totalCID}</td>
                <td>
                  <button
                    className={styles.viewButton}
                    onClick={() => handleTeamClick(team.email)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No teams found.</p>
      )}
    </div>
  );
}
