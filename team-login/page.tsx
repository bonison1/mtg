"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient"; // Import Supabase client
import { useRouter } from "next/navigation";
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TeamLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // Handle login logic
  const handleLogin = async () => {
    try {
      // Query the 'team_users' table for the user's credentials
      const { data, error } = await supabase
        .from("team_users")
        .select("*")
        .eq("email", email);

      if (error) {
        throw new Error(error.message);
      }

      if (data.length === 0) {
        // No user found
        setErrorMessage("User not found");
        return;
      }

      if (data.length > 1) {
        // Multiple users found with the same email (this should not happen if the email is unique)
        setErrorMessage("Multiple accounts found with the same email");
        return;
      }

      const user = data[0]; // Since we are expecting only one row, take the first item from the array

      // Check if the password matches (you may need a hashed password comparison in real-world applications)
      if (user.password === password) {
        // Successful login: Store team data in sessionStorage
        sessionStorage.setItem("team_user", JSON.stringify(user));

        // Redirect to the orders page to show matching orders for this team
        router.push("/team_dashboard"); 
      } else {
        setErrorMessage("Invalid email or password");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div>
      <Header/>
      <h2>Team Login</h2>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button onClick={handleLogin}>Log In</button>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <Link href="/team-singup">
          Sign Up if you&apos;re a new user
        </Link>
      </div>
      <Footer/>
    </div>
  );
}
