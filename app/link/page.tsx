'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

type UserLinks = {
  user_id: string;
  link1: string | null;
  link2: string | null;
  link3: string | null;
};

export default function Contacts() {
  const [userLinks, setUserLinks] = useState<UserLinks | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUserLinks();
  }, []);

  const fetchUserLinks = async () => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) return;

    const user = JSON.parse(userJson);

    const { data, error } = await supabase
      .from('user_links')
      .select('user_id, link1, link2, link3')
      .eq('user_id', user.user_id)
      .single();  // Use .single() since we're assuming a 1-to-1 relationship between user and their links

    if (error) {
      console.error('Error fetching user links:', error.message);
      return;
    }

    if (data) {
      setUserLinks(data);  // Store the user links in state
    }
  };

  const handleRedirect = (link: string | null) => {
    if (link) {
      window.location.href = link;  // Redirect to the link if it exists
    }
  };

  return (
    <div>
      <div>
        <h1>My Links</h1>

        {/* Search Field for Links */}
        <input
          type="text"
          placeholder="Search links"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Links List */}
        {userLinks ? (
          <ul>
            {/* Specific Button for link1 */}
            {userLinks.link1 && (
              <li key="link1">
                <button
                  onClick={() => handleRedirect(userLinks.link1)}
                >
                  Go to Link 1
                </button>
              </li>
            )}
            
            {/* Button for link2 */}
            {userLinks.link2 && (
              <li key="link2">
                <button
                  onClick={() => handleRedirect(userLinks.link2)}
                >
                  Go to Link 2
                </button>
              </li>
            )}

            {/* Button for link3 */}
            {userLinks.link3 && (
              <li key="link3">
                <button
                  onClick={() => handleRedirect(userLinks.link3)}
                >
                  Go to Link 3
                </button>
              </li>
            )}
          </ul>
        ) : (
          <p>No links found.</p>
        )}
      </div>
    </div>
  );
}
