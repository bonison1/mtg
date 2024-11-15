// app/search_order/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

type MessageData = {
  order_id: string
  message: string
  created_at: string
}

const SearchOrderPage = () => {
  const [orderId, setOrderId] = useState<string>('')
  const [messageData, setMessageData] = useState<MessageData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSearch = async () => {
    if (!orderId) {
      setError('Order ID is required.')
      return
    }

    setLoading(true)
    setError(null)
    setMessageData(null)

    try {
      // Fixing type argument issue here:
      const { data, error } = await supabase
        .from('message_data')  // Table name as a string argument
        .select('*')
        .eq('order_id', orderId)
        .single() // Since we expect only a single result

      if (error) {
        setError(error.message)
      } else {
        setMessageData(data as MessageData) // Type assertion here
      }
  
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Search Order</h1>

      <div>
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter Order ID"
          style={{
            padding: '8px',
            fontSize: '16px',
            width: '300px',
            marginBottom: '10px',
            display: 'block',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'inline-block',
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

      {messageData && (
        <div style={{ marginTop: '20px' }}>
          <h2>Message Details</h2>
          <p><strong>Order ID:</strong> {messageData.order_id}</p>
          <p><strong>Message:</strong> {messageData.message}</p>
          <p><strong>Created At:</strong> {new Date(messageData.created_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}

export default SearchOrderPage