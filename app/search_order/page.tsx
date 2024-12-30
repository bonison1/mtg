'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

type MessageData = {
  order_id: string;
  message: string;
  created_at: string;
  status: string;
};

const SearchOrderPage = () => {
  const [orderId, setOrderId] = useState<string>('');
  const [messageData, setMessageData] = useState<MessageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!orderId) {
      setError('Order ID is required.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessageData(null);

    try {
      const { data, error } = await supabase
        .from('message_data')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setMessageData(data as MessageData);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-semibold mb-4">Search Order</h1>

      <div className="flex flex-col items-center">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter Order ID"
          className="border border-gray-300 rounded-md p-2 mb-4 w-80 text-lg"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`px-6 py-2 text-lg font-medium rounded-md text-white ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 transition'
          }`}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <div className="text-red-500 mt-4">{error}</div>}

      {messageData && (
        <div className="mt-6 p-4 border rounded-md bg-gray-100">
          <h2 className="text-xl font-semibold mb-2">Message Details</h2>
          <p>
            <strong>Order ID:</strong> {messageData.order_id}
          </p>
          <p>
            <strong>Message:</strong> {messageData.message}
          </p>
          <p>
            <strong>Status:</strong> {messageData.status}
          </p>
          <p>
            <strong>Created At:</strong>{' '}
            {new Date(messageData.created_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchOrderPage;
