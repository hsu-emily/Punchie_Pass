// Utility for generating shareable PNG cards
// Note: You'll need to install html2canvas: npm install html2canvas

export async function generateShareableCard(cardElement, habit) {
  try {
    console.log('generateShareableCard called with element:', cardElement);
    
    // Dynamic import to avoid issues if html2canvas isn't installed
    const html2canvas = (await import('html2canvas')).default;
    console.log('html2canvas imported successfully');
    
    // Get element dimensions
    const width = cardElement.offsetWidth || cardElement.scrollWidth || 500;
    const height = cardElement.offsetHeight || cardElement.scrollHeight || 300;
    
    console.log('Element dimensions:', { width, height });

    // Ensure element is visible for html2canvas
    const originalStyle = {
      position: cardElement.style.position,
      left: cardElement.style.left,
      top: cardElement.style.top,
      opacity: cardElement.style.opacity,
      visibility: cardElement.style.visibility,
      zIndex: cardElement.style.zIndex,
      display: cardElement.style.display,
    };

    // Temporarily make element visible for capture if needed
    const needsVisibilityFix = cardElement.offsetWidth === 0 || 
                               cardElement.offsetHeight === 0 ||
                               cardElement.style.visibility === 'hidden' ||
                               cardElement.style.opacity === '0';
    
    if (needsVisibilityFix) {
      console.log('Making element visible for capture');
      cardElement.style.position = 'fixed';
      cardElement.style.left = '0px';
      cardElement.style.top = '0px';
      cardElement.style.opacity = '1';
      cardElement.style.visibility = 'visible';
      cardElement.style.zIndex = '9999';
      cardElement.style.display = 'block';
      
      // Wait a bit for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Calling html2canvas with options:', {
      width,
      height,
      scale: 2, // Reduced from 3 for better compatibility
      backgroundColor: null,
      useCORS: true,
      allowTaint: true,
    });

    const canvas = await html2canvas(cardElement, {
      backgroundColor: null, // Transparent background to preserve card design
      scale: 2, // Reduced scale for better compatibility
      logging: true, // Enable logging to debug
      useCORS: true,
      allowTaint: true,
      width: width,
      height: height,
      windowWidth: width,
      windowHeight: height,
      fontEmbedCSS: true, // Embed fonts in the canvas
      onclone: (clonedDoc, element) => {
        console.log('html2canvas onclone called');
        // Ensure cloned element is visible and has correct size
        const clonedElement = clonedDoc.querySelector('.punch-card-preview-container') || 
                             element || 
                             clonedDoc.body.firstElementChild;
        if (clonedElement) {
          clonedElement.style.visibility = 'visible';
          clonedElement.style.opacity = '1';
          clonedElement.style.width = width + 'px';
          clonedElement.style.height = height + 'px';
          clonedElement.style.position = 'relative';
          
          // Extract font families from the element's computed styles
          const titleElement = clonedElement.querySelector('h2');
          const descElement = clonedElement.querySelector('p');
          
          const fonts = new Set();
          if (titleElement) {
            const titleFont = window.getComputedStyle(titleElement).fontFamily;
            fonts.add(titleFont);
          }
          if (descElement) {
            const descFont = window.getComputedStyle(descElement).fontFamily;
            fonts.add(descFont);
          }
          
          // Build Google Fonts URL with all needed fonts
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
          
          const fontFamilies = Array.from(fonts)
            .flatMap(f => f.split(',').map(ff => ff.trim().replace(/['"]/g, '')))
            .filter(f => fontMap[f])
            .map(f => fontMap[f])
            .filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
          
          if (fontFamilies.length > 0) {
            const fontUrl = `https://fonts.googleapis.com/css2?${fontFamilies.map(f => `family=${f}`).join('&')}&display=swap`;
            const style = clonedDoc.createElement('style');
            style.textContent = `@import url('${fontUrl}');`;
            clonedDoc.head.appendChild(style);
            console.log('Added fonts to cloned document:', fontFamilies);
          }
        }
      }
    });

    console.log('Canvas created:', { width: canvas.width, height: canvas.height });

    // Restore original styles
    Object.keys(originalStyle).forEach(key => {
      if (originalStyle[key] !== undefined && originalStyle[key] !== '') {
        cardElement.style[key] = originalStyle[key];
      } else {
        cardElement.style.removeProperty(key);
      }
    });

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          console.log('Blob created, size:', blob.size);
          resolve(blob);
        } else {
          console.error('Failed to create blob from canvas');
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/png', 1.0); // Maximum quality
    });
  } catch (error) {
    console.error('Error generating shareable card:', error);
    console.error('Error stack:', error.stack);
    throw error; // Re-throw to let caller handle it
  }
}

export function downloadCard(blob, habitTitle, suffix = 'progress') {
  if (!blob) return;
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  // If habitTitle already ends with .png, use it as-is, otherwise add suffix
  const filename = habitTitle.endsWith('.png') 
    ? habitTitle 
    : `${habitTitle.replace(/\s+/g, '-')}-${suffix}.png`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function shareCard(blob, habit) {
  if (!blob) return;
  
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], `${habit.title}-progress.png`, { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      navigator.share({
        title: `My ${habit.title} Progress`,
        text: `I've completed ${habit.currentPunches}/${habit.targetPunches} punches! 🎉`,
        files: [file]
      }).catch(() => {
        // Fallback to download
        downloadCard(blob, habit.title);
      });
    } else {
      downloadCard(blob, habit.title);
    }
  } else {
    downloadCard(blob, habit.title);
  }
}

