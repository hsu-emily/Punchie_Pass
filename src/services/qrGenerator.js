/**
 * Utility functions for QR code generation and download
 */

/**
 * Formats time remaining in milliseconds to a human-readable string
 * @param {number} milliseconds - Time remaining in milliseconds
 * @returns {string} Formatted time string (e.g., "25:30" for 25 minutes 30 seconds)
 */
export function formatTimeRemaining(milliseconds) {
  if (milliseconds <= 0) {
    return '00:00';
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Downloads a QR code image
 * @param {string} qrCodeDataUrl - Data URL of the QR code image
 * @param {string} filename - Filename for the downloaded file (without extension)
 */
export function downloadQRCode(qrCodeDataUrl, filename) {
  if (!qrCodeDataUrl) {
    console.error('No QR code data provided');
    return;
  }

  try {
    // Convert data URL to blob
    const byteString = atob(qrCodeDataUrl.split(',')[1]);
    const mimeString = qrCodeDataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    // Fallback: try direct download if it's already a URL
    if (qrCodeDataUrl.startsWith('http')) {
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = `${filename}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Failed to download QR code. Please try again.');
    }
  }
}

