import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download } from 'lucide-react';
import QRCodeModal from "@/ui/QRCodeModal";
import { downloadQRCode, formatTimeRemaining } from "@/services/qrGenerator";

export default function TestCelebration() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrExpiresAt, setQrExpiresAt] = useState(null);
  const [mockHabit, setMockHabit] = useState({
    id: 'test-habit-1',
    title: 'Test Habit',
    description: 'This is a test habit for development',
    reward: 'BOBA!',
    currentPunches: 10,
    targetPunches: 10,
    punchCardImage: 'WindowsGreen.png',
    icon1: '1.png',
    icon2: '2.png',
    timeWindow: 'daily'
  });

  const handleGenerateQRCode = async () => {
    try {
      // Use a test URL - you can replace this with an actual Firebase Storage URL
      const testUrl = 'https://example.com/test-punch-pass.png';
      
      // Generate QR code using qrtag.net API
      const qrCodeApiUrl = `https://qrtag.net/api/qr_8.png?url=${encodeURIComponent(testUrl)}`;
      
      // Fetch the QR code image and convert to data URL
      const qrResponse = await fetch(qrCodeApiUrl);
      const qrBlob = await qrResponse.blob();
      const qrCodeDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(qrBlob);
      });
      
      // Set expiration time (30 minutes from now)
      const expiresAt = Date.now() + (30 * 60 * 1000);
      
      setQrCodeData(qrCodeDataUrl);
      setQrExpiresAt(expiresAt);
      setShowQRCode(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, rgba(255, 182, 193, 0.3), rgba(255, 192, 203, 0.3))',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#FF1493', 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Celebration & QR Code Test Page
        </h1>

        {/* Controls */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            Test Controls
          </h2>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <button
              onClick={() => setShowCelebration(!showCelebration)}
              style={{
                padding: '0.75rem 1.5rem',
                background: showCelebration 
                  ? 'linear-gradient(to right, #FF69B4, #FF1493)' 
                  : 'linear-gradient(to right, #4169E1, #1E90FF)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {showCelebration ? 'Hide' : 'Show'} Celebration Overlay
            </button>

            <button
              onClick={handleGenerateQRCode}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(to right, #4169E1, #1E90FF)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <QrCode size={20} />
              Generate QR Code
            </button>
          </div>

          {/* Mock Habit Editor */}
          <div style={{ 
            borderTop: '2px solid #f0f0f0', 
            paddingTop: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
              Edit Mock Habit Data
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Habit Title:
                </label>
                <input
                  type="text"
                  value={mockHabit.title}
                  onChange={(e) => setMockHabit({ ...mockHabit, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Reward Text:
                </label>
                <input
                  type="text"
                  value={mockHabit.reward}
                  onChange={(e) => setMockHabit({ ...mockHabit, reward: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Description:
                </label>
                <textarea
                  value={mockHabit.description}
                  onChange={(e) => setMockHabit({ ...mockHabit, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Celebration Overlay Preview */}
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(255, 182, 193, 0.95), rgba(255, 192, 203, 0.95))',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem',
              overflow: 'auto',
            }}
          >
            {/* Large Heading */}
            <motion.h1
              initial={{ scale: 0.8, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#FF1493',
                textAlign: 'center',
                marginBottom: '1rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              You Completed a Punchie Pass!
            </motion.h1>

            {/* Subheading - Reward Text */}
            {mockHabit.reward && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: '1.5rem',
                  color: '#8B4513',
                  fontWeight: '500',
                  textAlign: 'center',
                  marginBottom: '2rem',
                }}
              >
                Reward Yourself With {mockHabit.reward}!
              </motion.p>
            )}

            {/* Mock Card Preview */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              style={{
                width: '100%',
                maxWidth: '500px',
                marginBottom: '2rem',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                background: 'white',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>
                {mockHabit.title}
              </div>
              <div style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>
                {mockHabit.description}
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#999',
                fontStyle: 'italic'
              }}>
                (Mock card preview - actual card would show here)
              </div>
            </motion.div>

            {/* Three Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              {/* Download PNG Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => alert('Download PNG clicked!')}
                style={{
                  width: '200px',
                  height: '48px',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(to right, #FF69B4, #FF1493)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(255, 20, 147, 0.3)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Download size={20} />
                Download PNG
              </motion.button>

              {/* Generate QR Code Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={handleGenerateQRCode}
                style={{
                  width: '200px',
                  height: '48px',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(to right, #4169E1, #1E90FF)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(65, 105, 225, 0.3)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <QrCode size={20} />
                Generate QR Code
              </motion.button>

              {/* Create More Habits Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={() => setShowCelebration(false)}
                style={{
                  width: '200px',
                  height: '48px',
                  padding: '0.75rem 1rem',
                  background: 'white',
                  color: '#FF1493',
                  border: '2px solid #FF1493',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FF1493';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#FF1493';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Create More Habits
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* QR Code Modal */}
        <QRCodeModal
          isOpen={showQRCode}
          onClose={() => {
            setShowQRCode(false);
            setQrCodeData(null);
            setQrExpiresAt(null);
          }}
          qrCodeData={qrCodeData}
          expiresAt={qrExpiresAt}
          habitTitle={mockHabit.title}
          storagePath={null}
        />
      </div>
    </div>
  );
}

