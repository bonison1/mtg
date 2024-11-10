"use client";
import { MatengContent } from "./Content"; // Import the Content component from the same folder
import Header from '../components/Header';
import Footer from '../components/Footer';


export default function AboutUsPage() {
  return (
    <div>
      <Header/>
      <MatengContent />
      <Footer/>
    </div>
  );
}
