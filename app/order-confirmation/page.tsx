// pages/order-confirmation.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Use for query params

function OrderConfirmationContent() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const searchParams = useSearchParams(); // Get query parameters from the URL

  useEffect(() => {
    // Get the orderId from the query parameter
    const id = searchParams.get('orderId');
    if (id) {
      setOrderId(id);
    }
  }, [searchParams]);

  return (
    <div>
      <h1>Order Confirmation</h1>
      {orderId ? (
        <div>
          <h2>Your Order ID is: {orderId}</h2>
          <p>Thank you for your message. We will process it shortly.</p>
        </div>
      ) : (
        <p>Order ID not found.</p>
      )}
    </div>
  );
}

export default function OrderConfirmation() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
