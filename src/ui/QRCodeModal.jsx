import { AnimatePresence, motion } from 'framer-motion';
import { Download, QrCode, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { downloadQRCode, formatTimeRemaining } from "@/services/qrGenerator";

export default function QRCodeModal({ 
  isOpen, 
  onClose, 
  qrCodeData, 
  expiresAt, 
  habitTitle,
  storagePath 
}) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!isOpen || !expiresAt) return;

    // Calculate initial time remaining
    const updateTimeRemaining = () => {
      const now = Date.now();
      const remaining = expiresAt - now;
      
      if (remaining <= 0) {
        setTimeRemaining(0);
        setIsExpired(true);
      } else {
        setTimeRemaining(remaining);
        setIsExpired(false);
      }
    };

    // Update immediately
    updateTimeRemaining();

    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [isOpen, expiresAt]);

  const handleDownloadQR = () => {
    if (qrCodeData && !isExpired) {
      const filename = `${habitTitle}-qr-code`.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      downloadQRCode(qrCodeData, filename);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="qr-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem',
        }}
      >
        <motion.div
          className="qr-modal-content"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(to bottom, #FFF5F7, #FFFFFF)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            textAlign: 'center',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#999',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FFE6F0';
              e.currentTarget.style.color = '#FF1493';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#999';
            }}
            aria-label="Close"
          >
            <X size={24} />
          </button>

          {/* Icon */}
          <div
            style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #FF69B4, #FF1493)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <QrCode size={32} color="white" />
          </div>

          {/* Heading */}
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: '#FF1493',
              marginBottom: '0.5rem',
            }}
          >
            Scan to View Punch Pass
          </h2>

          {/* Timer */}
          <div
            style={{
              fontSize: '1rem',
              color: isExpired ? '#EF4444' : '#8B4513',
              fontWeight: '600',
              marginBottom: '1.5rem',
            }}
          >
            {isExpired ? (
              <span style={{ color: '#EF4444' }}>⚠️ QR Code Expired</span>
            ) : (
              <>
                ⏱️ Expires in: <span style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </>
            )}
          </div>

          {/* QR Code Display */}
          {qrCodeData && (
            <div
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                display: 'inline-block',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                opacity: isExpired ? 0.4 : 1,
                filter: isExpired ? 'grayscale(100%)' : 'none',
                transition: 'all 0.3s',
              }}
            >
              <img
                src={qrCodeData}
                alt="QR Code"
                style={{
                  width: '300px',
                  height: '300px',
                  display: 'block',
                }}
              />
            </div>
          )}

          {/* Description */}
          <p
            style={{
              fontSize: '0.9rem',
              color: '#666',
              marginBottom: '1.5rem',
              lineHeight: '1.5',
            }}
          >
            {isExpired 
              ? 'This QR code has expired. Generate a new one to share your punch pass.'
              : 'Share this QR code with others to show off your completed punch pass! The code expires in 30 minutes.'}
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleDownloadQR}
              disabled={isExpired}
              style={{
                padding: '0.75rem 1.5rem',
                background: isExpired 
                  ? '#CCC' 
                  : 'linear-gradient(to right, #FF69B4, #FF1493)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isExpired ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: isExpired 
                  ? 'none' 
                  : '0 4px 12px rgba(255, 20, 147, 0.3)',
                transition: 'all 0.2s',
                opacity: isExpired ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isExpired) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 20, 147, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isExpired) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 20, 147, 0.3)';
                }
              }}
            >
              <Download size={20} />
              Download QR Code
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#FF1493',
                border: '2px solid #FF1493',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
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
              Close
            </button>
          </div>

          {/* Help Text */}
          <p
            style={{
              fontSize: '0.75rem',
              color: '#999',
              marginTop: '1rem',
              fontStyle: 'italic',
            }}
          >
            💡 Tip: The QR code links directly to your completed punch pass image
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

