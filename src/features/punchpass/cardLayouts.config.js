// Card Layout Configurations
// Single layout values used for both carousel and zoom modal

// Base layout configuration
const baseLayout = {
  title: {
    top: '5%',
    left: '7%',
    textAlign: 'left',
    color: '#333',
    fontSize: '1.3rem',
    fontFamily: 'Press Start 2P, monospace',
    fontWeight: 'bold',
    width: '80%'
  },
  description: {
    top: '20%',
    left: '7%',
    textAlign: 'left',
    color: '#555',
    fontSize: '.9rem',
    fontFamily: 'Press Start 2P, monospace',
    width: '80%'
  },
  punchGrid: {
    top: '34%',
    left: '50%',
    transform: 'translateX(-50%)',
    punchCircleSize: '80px',
    punchIconSize: '80px',
    punchHorizontalGap: '13px',
    punchVerticalGap: '15px',
    numRows: 2,
    punchesPerRow: 5
  }
};

// Default layout configurations for each punch card
export const cardLayouts = {
  'WindowsGreen.png': {
    ...baseLayout,
    title: { ...baseLayout.title, color: '#0b693c', fontFamily: 'Press Start 2P, monospace' },
    description: { ...baseLayout.description, color: '#0b693c', fontFamily: 'Press Start 2P, monospace' }
  },
  'WindowsPink.png': {
    ...baseLayout,
    title: { ...baseLayout.title, color: '#f677a2', fontFamily: 'Press Start 2P, monospace' },
    description: { ...baseLayout.description, color: '#f677a2', fontFamily: 'Press Start 2P, monospace' }
  },
  'WindowsPurple.png': {
    ...baseLayout,
    title: { ...baseLayout.title, color: '#8c52ff', fontFamily: 'Press Start 2P, monospace' },
    description: { ...baseLayout.description, color: '#8c52ff', fontFamily: 'Press Start 2P, monospace' }
  },
  'LacePink.png': {
    ...baseLayout,
    title: {
      top: '14%',
      left: '0%',
      textAlign: 'center',
      color: '#f677a2',
      fontSize: '3.2rem',
      fontFamily: 'Great Vibes, Playfair Display, Allura, Parisienne, cursive',
      fontWeight: 'normal',
      width: '100%'
    },
    description: {
      top: '28%',
      left: '0%',
      textAlign: 'center',
      color: '#f677a2',
      fontSize: '1rem',
      fontFamily: 'Dancing Script, Great Vibes, cursive',
      width: '100%'
    },
    punchGrid: {
      top: '42%',
      left: '50%',
      transform: 'translateX(-50%)',
      punchCircleSize: '75px',
      punchIconSize: '75px',
      punchHorizontalGap: '4px',
      punchVerticalGap: '0px',
      numRows: 2,
      punchesPerRow: 5
    }
  },
  'LaceRed.png': {
    ...baseLayout,
    title: {
      top: '14%',
      left: '0%',
      textAlign: 'center',
      color: '#ffffff',
      fontSize: '1.8rem',
      fontFamily: 'Great Vibes, Playfair Display, Allura, Parisienne, cursive',
      fontWeight: 'bold',
      width: '100%'
    },
    description: {
      top: '23%',
      left: '8%',
      textAlign: 'center',
      color: '#ffffff',
      fontSize: '1rem',
      fontFamily: 'Dancing Script, Great Vibes, cursive',
      width: '80%'
    },
    punchGrid: {
      top: '37%',
      left: '50%',
      transform: 'translateX(-50%)',
      punchCircleSize: '78px',
      punchIconSize: '78px',
      punchHorizontalGap: '0px',
      punchVerticalGap: '5px',
      numRows: 2,
      punchesPerRow: 5
    }
  },
  'PlaidBlue.png': {
    ...baseLayout,
    title: {
      top: '15%',
      left: '0%',
      textAlign: 'center',
      color: '#2563EB',
      fontSize: '2rem',
      fontFamily: 'Cinzel, serif',
      fontWeight: 'bold',
      width: '100%'
    },
    description: {
      top: '30%',
      left: '0%',
      textAlign: 'center',
      color: '#3B82F6',
      fontSize: '1.1rem',
      fontFamily: 'Dancing Script, Great Vibes, cursive',
      width: '100%'
    },
    punchGrid: {
      top: '42%',
      left: '50%',
      transform: 'translateX(-50%)',
      punchCircleSize: '67px',
      punchIconSize: '67px',
      punchHorizontalGap: '7px',
      punchVerticalGap: '0px',
      numRows: 2,
      punchesPerRow: 5
    }
  },
  'PlaidGreen.png': {
    ...baseLayout,
    title: {
      top: '15%',
      left: '0%',
      textAlign: 'center',
      color: '#0b693c',
      fontSize: '2rem',
      fontFamily: 'Cinzel, serif',
      fontWeight: 'bold',
      width: '100%'
    },
    description: {
      top: '30%',
      left: '0%',
      textAlign: 'center',
      color: '#0b693c',
      fontSize: '1.1rem',
      fontFamily: 'Dancing Script, Great Vibes, cursive',
      width: '100%'
    },
    punchGrid: {
      top: '42%',
      left: '50%',
      transform: 'translateX(-50%)',
      punchCircleSize: '67px',
      punchIconSize: '67px',
      punchHorizontalGap: '7px',
      punchVerticalGap: '0px',
      numRows: 2,
      punchesPerRow: 5
    }
  },
  'DigiCam.png': {
    ...baseLayout,
    title: {
      top: '12%',
      left: '-2%',
      textAlign: 'center',
      color: '#ffffff',
      fontSize: '1rem',
      fontFamily: 'Press Start 2P, monospace',
      fontWeight: 'bold',
      width: '80%'
    },
    description: {
      top: '22%',
      left: '9%',
      textAlign: 'center',
      color: '#ffffff',
      fontSize: '.7rem',
      fontFamily: 'Press Start 2P, monospace',
      width: '60%'
    },
    punchGrid: {
      top: '40%',
      left: '38%',
      transform: 'translateX(-50%)',
      punchCircleSize: '70px',
      punchIconSize: '70px',
      punchHorizontalGap: '7px',
      punchVerticalGap: '10px',
      numRows: 2,
      punchesPerRow: 5
    }
  },
  'FilmCam.png': {
    ...baseLayout,
    title: {
      top: '9%',
      left: '0%',
      textAlign: 'center',
      color: '#f3d279',
      fontSize: '1.7rem',
      fontFamily: 'Press Start 2P, monospace',
      fontWeight: 'bold',
      width: '100%'
    },
    description: {
      top: '20%',
      left: '15%',
      textAlign: 'center',
      color: '#ffffff',
      fontSize: '0.8rem',
      fontFamily: 'Press Start 2P, monospace',
      width: '70%'
    },
    punchGrid: {
      top: '39%',
      left: '50%',
      transform: 'translateX(-50%)',
      punchCircleSize: '75px',
      punchIconSize: '75px',
      punchHorizontalGap: '0px',
      punchVerticalGap: '5px',
      numRows: 2,
      punchesPerRow: 5
    }
  }
};

// Get layout for a specific card image filename
export const getCardLayout = (cardImageFilename) => {
  return cardLayouts[cardImageFilename] || cardLayouts['WindowsGreen.png'];
};
