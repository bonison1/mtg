// /app/delivery-rates/page.tsx

'use client'; // Add this line if page.tsx uses client-side features

import React from 'react';
import Contacts from './link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ContactsPage() {
  return (
    <div>
      <Header/>
      <Contacts />
      <Footer/>
    </div>
  );
}
