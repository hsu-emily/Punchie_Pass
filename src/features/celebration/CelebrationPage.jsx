import confetti from 'canvas-confetti';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { motion } from 'framer-motion';
import { Download, QrCode, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PunchCard, { getCardImageName, getCardImageUrl } from "@/features/punchpass/PunchCard";
import QRCodeModal from "@/ui/QRCodeModal";
import { storage } from "@/services/firebase";
import { getCardLayout } from "@/features/punchpass/cardLayouts.config";
import { downloadCard, generateShareableCard } from "@/services/shareCard";

export default function CelebrationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const habit = location.state?.habit;
  const cardRef = useRef(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrExpiresAt, setQrExpiresAt] = useState(null);
  const [storagePath, setStoragePath] = useState(null);
  const [confettiTriggered, setConfettiTriggered] = useState(false);
  const [cardImageUrl, setCardImageUrl] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(true);

  // Redirect if no habit data
  useEffect(() => {
    if (!habit) {
      navigate('/dashboard');
    }
  }, [habit, navigate]);

  const cardImageName = getCardImageName(habit);
  const punchCardImage = getCardImageUrl(cardImageName);
  const layout = cardImageName ? getCardLayout(cardImageName) : null;

  // Generate PNG image of the punch pass when card is rendered
  useEffect(() => {
    if (!habit || !punchCardImage || !layout) {
      console.log('Missing dependencies:', { habit: !!habit, punchCardImage: !!punchCardImage, layout: !!layout });
      return;
    }

    const generateCardImage = async () => {
      // Wait for the card to be rendered and visible
      let attempts = 0;
      const maxAttempts = 20; // Increased attempts
      while (attempts < maxAttempts && (!cardRef.current || cardRef.current.offsetWidth === 0)) {
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
      }
      
      if (!cardRef.current) {
        console.error('Card ref not available after', maxAttempts, 'attempts');
        setIsGeneratingImage(false);
        return;
      }

      try {
        setIsGeneratingImage(true);
        
        // Find the card element - try multiple selectors
        let cardElement = cardRef.current.querySelector('.punch-card-preview-container');
        if (!cardElement) {
          // Try finding by class or structure
          cardElement = cardRef.current.querySelector('div > div');
        }
        if (!cardElement) {
          cardElement = cardRef.current.firstElementChild;
        }
        if (!cardElement) {
          cardElement = cardRef.current;
        }

        console.log('Card element found:', {
          element: cardElement,
          tagName: cardElement?.tagName,
          className: cardElement?.className,
          dimensions: {
            width: cardElement?.offsetWidth,
            height: cardElement?.offsetHeight,
            scrollWidth: cardElement?.scrollWidth,
            scrollHeight: cardElement?.scrollHeight
          }
        });

        // Get actual dimensions from the rendered element
        // The card should maintain its aspect ratio based on the container
        const width = cardElement.offsetWidth || cardElement.scrollWidth;
        const height = cardElement.offsetHeight || cardElement.scrollHeight;

        console.log('Card dimensions from layout:', { width, height });

        if (width === 0 || height === 0) {
          console.error('Card element has zero dimensions');
          setIsGeneratingImage(false);
          return;
        }

        // Wait for all images to load
        const images = cardElement.querySelectorAll('img');
        console.log('Found', images.length, 'images to load');
        if (images.length > 0) {
          await Promise.all(
            Array.from(images).map((img, index) => {
              if (img.complete && img.naturalWidth > 0) {
                console.log(`Image ${index} already loaded`);
                return Promise.resolve();
              }
              return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                  console.warn(`Image ${index} load timeout`);
                  resolve();
                }, 5000);
                img.onload = () => {
                  console.log(`Image ${index} loaded`);
                  clearTimeout(timeout);
                  resolve();
                };
                img.onerror = () => {
                  console.warn(`Image ${index} failed to load`);
                  clearTimeout(timeout);
                  resolve(); // Continue even if image fails
                };
              });
            })
          );
          console.log('All images loaded or timed out');
        }

        // Wait for fonts to load - specifically the fonts from the layout
        console.log('Waiting for fonts to load...');
        const fontsToLoad = [];
        if (layout?.title?.fontFamily) {
          fontsToLoad.push(...layout.title.fontFamily.split(',').map(f => f.trim().replace(/['"]/g, '')));
        }
        if (layout?.description?.fontFamily) {
          fontsToLoad.push(...layout.description.fontFamily.split(',').map(f => f.trim().replace(/['"]/g, '')));
        }
        
        console.log('Fonts to load:', fontsToLoad);
        
        // Load fonts from Google Fonts if needed
        const uniqueFonts = [...new Set(fontsToLoad)];
        const fontPromises = uniqueFonts.map(fontName => {
          // Map font names to Google Fonts names
          const fontMap = {
            'Press Start 2P': 'Press+Start+2P',
            'Dancing Script': 'Dancing+Script',
            'Great Vibes': 'Great+Vibes',
            'Cinzel': 'Cinzel',
            'Instrument Sans': 'Instrument+Sans',
            'Playfair Display': 'Playfair+Display',
            'Allura': 'Allura',
            'Parisienne': 'Parisienne',
          };
          
          const googleFontName = fontMap[fontName] || fontName.replace(/\s+/g, '+');
          if (googleFontName && !document.querySelector(`link[href*="${googleFontName}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${googleFontName}&display=swap`;
            document.head.appendChild(link);
            console.log(`Loading font: ${fontName} (${googleFontName})`);
          }
          return Promise.resolve();
        });
        
        await Promise.all(fontPromises);
        
        // Wait for fonts to be ready
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
          console.log('All fonts loaded');
        } else {
          // Fallback: wait a bit for fonts
          await new Promise(resolve => setTimeout(resolve, 1500));
          console.log('Font loading timeout (using fallback)');
        }

        console.log('Starting html2canvas capture...');
        const blob = await generateShareableCard(cardElement, habit);
        if (blob && blob.size > 0) {
          console.log('Successfully generated blob, size:', blob.size, 'bytes');
          const imageUrl = URL.createObjectURL(blob);
          setCardImageUrl(imageUrl);
          console.log('Image URL created:', imageUrl.substring(0, 50) + '...');
        } else {
          console.error('generateShareableCard returned null or empty blob');
          throw new Error('Failed to generate image blob');
        }
      } catch (error) {
        console.error('Error generating card image:', error);
        console.error('Error details:', {
          message: error?.message,
          name: error?.name,
          stack: error?.stack,
          cardRef: !!cardRef.current,
          cardElement: !!cardRef.current?.querySelector('.punch-card-preview-container')
        });
        // Don't set isGeneratingImage to false here - let it show the fallback card
      } finally {
        setIsGeneratingImage(false);
      }
    };

    // Start generation after a delay to ensure card is rendered
    const timeoutId = setTimeout(generateCardImage, 1000);

    // Cleanup: revoke object URL when component unmounts or dependencies change
    return () => {
      clearTimeout(timeoutId);
      setCardImageUrl(prevUrl => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        return null;
      });
    };
  }, [habit, punchCardImage, layout]);

  // Trigger confetti animation on page load
  useEffect(() => {
    if (habit && !confettiTriggered) {
      setConfettiTriggered(true);
      
      // More vibrant pink/red confetti animation - continuous for celebration duration
      const duration = 5000;
      const animationEnd = Date.now() + duration;
      const defaults = { 
        startVelocity: 45, 
        spread: 360, 
        ticks: 100, 
        zIndex: 10001,
        gravity: 0.8,
        scalar: 1.2
      };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 80 * (timeLeft / duration);
        
        // Vibrant red/pink confetti from multiple positions
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FF0051', '#FF1744', '#FF4081', '#F50057', '#E91E63', '#FF69B4']
        });
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FF0051', '#FF1744', '#FF4081', '#F50057', '#E91E63', '#FF69B4']
        });

        // Center burst occasionally
        if (Math.random() > 0.7) {
          confetti({
            ...defaults,
            particleCount: particleCount * 1.5,
            origin: { x: 0.5, y: 0.3 },
            colors: ['#FF0051', '#FF1744', '#FF4081', '#F50057', '#E91E63', '#FF69B4']
          });
        }
      }, 200);

      return () => clearInterval(interval);
    }
  }, [habit, confettiTriggered]);

  const handleDownloadCard = async () => {
    if (cardImageUrl) {
      // Download the already generated image
      try {
        const response = await fetch(cardImageUrl);
        const blob = await response.blob();
        downloadCard(blob, habit.title, 'completed-punch-pass');
      } catch (error) {
        console.error('Error downloading card:', error);
        alert('Failed to download the punch pass. Please try again.');
      }
    } else if (cardRef.current) {
      // Fallback: generate on the fly
      try {
        const cardElement = cardRef.current.querySelector('.punch-card-preview-container') || cardRef.current;
        const blob = await generateShareableCard(cardElement, habit);
        if (blob) {
          downloadCard(blob, habit.title, 'completed-punch-pass');
        }
      } catch (error) {
        console.error('Error downloading card:', error);
        alert('Failed to download the punch pass. Please try again.');
      }
    }
  };

  const handleGenerateQRCode = async () => {
    let blob = null;
    
    try {
      // Use the already generated image if available
      if (cardImageUrl) {
        const response = await fetch(cardImageUrl);
        blob = await response.blob();
      } else if (cardRef.current) {
        // Fallback: generate on the fly
        const cardElement = cardRef.current.querySelector('.punch-card-preview-container') || cardRef.current;
        blob = await generateShareableCard(cardElement, habit);
      }
      
      if (!blob) {
        throw new Error('Failed to generate card image');
      }

      // Upload to Firebase Storage
      const timestamp = Date.now();
      const fileName = `${habit.id}-${timestamp}.png`;
      const storageRef = ref(storage, `punch-passes/${fileName}`);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Set expiration time (30 minutes from now)
      const expiresAt = Date.now() + (30 * 60 * 1000);
      
      // Generate QR code using qrtag.net API
      const qrCodeApiUrl = `https://qrtag.net/api/qr_8.png?url=${encodeURIComponent(downloadURL)}`;
      
      // Fetch the QR code image and convert to data URL
      const qrResponse = await fetch(qrCodeApiUrl);
      const qrBlob = await qrResponse.blob();
      const qrCodeDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(qrBlob);
      });
      
      setQrCodeData(qrCodeDataUrl);
      setQrExpiresAt(expiresAt);
      setStoragePath(`punch-passes/${fileName}`);
      setShowQRCode(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    }
  };

  const handleShareCard = async () => {
    let blob = null;
    try {
      if (cardImageUrl) {
        const response = await fetch(cardImageUrl);
        blob = await response.blob();
      } else if (cardRef.current) {
        const cardElement = cardRef.current.querySelector('.punch-card-preview-container') || cardRef.current;
        blob = await generateShareableCard(cardElement, habit);
      }
      if (!blob) throw new Error('Failed to generate card image');

      const fileName = `${habit.title || 'punch-pass'}-completed.png`.replace(/\s+/g, '-');
      if (navigator.share) {
        const file = new File([blob], fileName, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `I completed ${habit.title}!`,
            text: `Check out my habit tracking progress!`,
          });
          return;
        }
      }
      if (navigator.clipboard?.write && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        alert('Copied to clipboard!');
      } else {
        downloadCard(blob, habit.title, 'completed-punch-pass');
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error('Share failed:', err);
        alert('Failed to share. Please try again.');
      }
    }
  };

  const handleCreateMoreHabits = () => {
    navigate('/dashboard');
  };

  if (!habit) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 30%, #ffe4f0 0%, #fff 80%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 'clamp(1rem, 3vw, 2rem)',
        overflow: 'auto',
      }}
    >
      {/* Large Heading */}
      <motion.h1
        initial={{ scale: 0.8, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
          fontWeight: 'bold',
          color: '#FF1493',
          textAlign: 'center',
          marginBottom: '0.5rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        You Completed a Punchie Pass!
      </motion.h1>

      {/* Subheading - Reward Text */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
          color: '#61283B',
          fontWeight: '500',
          textAlign: 'center',
          marginBottom: '1.25rem',
        }}
      >
        {habit.reward 
          ? `Reward Yourself With ${habit.reward}!`
          : 'Congrats! Take a break and reward yourself!'}
      </motion.p>

      {/* Display: Show card while generating, then show PNG once ready */}
      {punchCardImage && layout && (
        <>
          {/* Show card component while generating PNG */}
          {isGeneratingImage && !cardImageUrl && (
            <motion.div
              ref={cardRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              style={{ width: '100%', maxWidth: 600, marginBottom: '1.5rem' }}
            >
              <PunchCard habit={habit} showCursor={false} />
            </motion.div>
          )}

          {/* Hidden card for PNG generation (only when we have the image URL) */}
          {cardImageUrl && (
            <div
              ref={cardRef}
              style={{
                position: 'absolute',
                left: '-9999px',
                visibility: 'hidden',
                width: 600,
              }}
            >
              <PunchCard habit={habit} showCursor={false} />
            </div>
          )}

          {/* Display the generated PNG image */}
          {cardImageUrl ? (
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              src={cardImageUrl}
              alt={`Completed ${habit.title} punch pass`}
              className="card-zoom-card"
              style={{
                width: '100%',
                maxWidth: 600,
                aspectRatio: '1004 / 591',
                height: 'auto',
                marginBottom: '1.5rem',
                display: 'block',
                objectFit: 'contain',
              }}
            />
          ) : !isGeneratingImage ? (
            // Fallback: Show the card component if PNG generation failed
            <motion.div
              ref={cardRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              style={{ width: '100%', maxWidth: 600, marginBottom: '1.5rem' }}
            >
              <PunchCard habit={habit} showCursor={false} />
            </motion.div>
          ) : null}
        </>
      )}

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
          onClick={handleDownloadCard}
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

        {/* Share Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          onClick={handleShareCard}
          style={{
            width: '200px',
            height: '48px',
            padding: '0.75rem 1rem',
            background: 'linear-gradient(to right, #9333EA, #C026D3)',
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
            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Share2 size={20} />
          Share
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
          onClick={handleCreateMoreHabits}
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

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRCode}
        onClose={() => {
          setShowQRCode(false);
          setQrCodeData(null);
          setQrExpiresAt(null);
          setStoragePath(null);
        }}
        qrCodeData={qrCodeData}
        expiresAt={qrExpiresAt}
        habitTitle={habit.title}
        storagePath={storagePath}
      />
    </div>
  );
}

