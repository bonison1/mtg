'use client';  // Ensure this is added for client-side rendering

import { FC, useState } from 'react';
import QRCode from 'react-qr-code';  // Ensure correct import for default export

const QRCodePage: FC = () => {
  const [link, setLink] = useState<string>('');
  const [qrLink, setQrLink] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLink(event.target.value);
  };

  const handleGenerateClick = () => {
    setQrLink(link);  // Set the URL for QR code generation
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Generate QR Code</h1>
      <input
        type="text"
        value={link}
        onChange={handleInputChange}
        placeholder="Enter a URL"
        style={{
          padding: '10px',
          width: '80%',
          maxWidth: '400px',
          fontSize: '16px',
          marginBottom: '20px',
        }}
      />
      <button
        onClick={handleGenerateClick}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Generate QR Code
      </button>

      {qrLink && (
        <div style={{ marginTop: '20px' }}>
          <h3>Your QR Code</h3>
          {/* Render QRCode component */}
          <QRCode value={qrLink} size={256} />
        </div>
      )}
    </div>
  );
};

export default QRCodePage;
