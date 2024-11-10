// /app/delivery-rates/page.tsx

'use client'; // Add this line if page.tsx uses client-side features

import React from 'react';
import DeliveryRates from './DeliveryRates';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function DeliveryRatesPage() {
  return (
    <div>
      <Header/>
      <DeliveryRates />
      <Footer/>
    </div>
  );
}
