import { Check, ChevronDown, ChevronUp, Copy, Download, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import PunchCardPreview from "@/features/punchpass/PunchCardPreview";

// Load punch card PNGs
const punchCardModules = import.meta.glob("@/assets/punch_cards/*.png", { eager: true });
const punchCardMap = {};
for (const path in punchCardModules) {
  const filename = path.split('/').pop();
  punchCardMap[filename] = punchCardModules[path].default;
}

// Load icon PNGs
const iconModules = import.meta.glob("@/assets/icons/*.png", { eager: true });
const iconMap = {};
for (const path in iconModules) {
  const filename = path.split('/').pop();
  iconMap[filename] = iconModules[path].default;
}

const cardNames = Object.keys(punchCardMap);
const iconNames = Object.keys(iconMap);

// Default layout template
const defaultLayout = {
  title: { top: '4%', left: '7%', textAlign: 'left', color: '#333', fontSize: '1.4rem', fontWeight: 'bold', width: '80%' },
  description: { top: '20%', left: '7%', textAlign: 'left', color: '#555', fontSize: '1rem', width: '80%' },
  punchGrid: { top: '33%', left: '50%', transform: 'translateX(-50%)', punchCircleSize: '85px', punchIconSize: '85px', punchHorizontalGap: '8px', punchVerticalGap: '10px', numRows: 2, punchesPerRow: 5 }
};

export default function CardLayoutEditor() {
  const [selectedCard, setSelectedCard] = useState(cardNames[0] || '');
  const [selectedIcon1, setSelectedIcon1] = useState(iconNames[0] || '');
  const [selectedIcon2, setSelectedIcon2] = useState(iconNames[1] || iconNames[0] || '');
  const [currentPunches, setCurrentPunches] = useState(3);
  const [targetPunches, setTargetPunches] = useState(10);
  const [editingSize, setEditingSize] = useState('medium'); // 'medium' or 'large'
  
  // Refs for measuring dimensions
  const mediumPreviewRef = useRef(null);
  const largePreviewRef = useRef(null);
  const [mediumDimensions, setMediumDimensions] = useState({ width: 0, height: 0 });
  const [largeDimensions, setLargeDimensions] = useState({ width: 0, height: 0 });

  // Medium size settings
  const [titleTopMedium, setTitleTopMedium] = useState(defaultLayout.title.top);
  const [titleLeftMedium, setTitleLeftMedium] = useState(defaultLayout.title.left);
  const [titleTextAlignMedium, setTitleTextAlignMedium] = useState(defaultLayout.title.textAlign);
  const [titleColorMedium, setTitleColorMedium] = useState(defaultLayout.title.color);
  const [titleFontSizeMedium, setTitleFontSizeMedium] = useState(defaultLayout.title.fontSize);
  const [titleFontFamilyMedium, setTitleFontFamilyMedium] = useState(defaultLayout.title.fontFamily || 'Arial');
  const [titleWidthMedium, setTitleWidthMedium] = useState(defaultLayout.title.width);

  const [descTopMedium, setDescTopMedium] = useState(defaultLayout.description.top);
  const [descLeftMedium, setDescLeftMedium] = useState(defaultLayout.description.left);
  const [descTextAlignMedium, setDescTextAlignMedium] = useState(defaultLayout.description.textAlign);
  const [descColorMedium, setDescColorMedium] = useState(defaultLayout.description.color);
  const [descFontSizeMedium, setDescFontSizeMedium] = useState(defaultLayout.description.fontSize);
  const [descFontFamilyMedium, setDescFontFamilyMedium] = useState(defaultLayout.description.fontFamily || 'Arial');
  const [descWidthMedium, setDescWidthMedium] = useState(defaultLayout.description.width);

  const [gridTopMedium, setGridTopMedium] = useState(defaultLayout.punchGrid.top);
  const [gridLeftMedium, setGridLeftMedium] = useState(defaultLayout.punchGrid.left);
  const [gridTransformMedium, setGridTransformMedium] = useState(defaultLayout.punchGrid.transform);
  const [punchCircleSizeMedium, setPunchCircleSizeMedium] = useState(defaultLayout.punchGrid.punchCircleSize);
  const [punchIconSizeMedium, setPunchIconSizeMedium] = useState(defaultLayout.punchGrid.punchIconSize);
  const [punchHorizontalGapMedium, setPunchHorizontalGapMedium] = useState(defaultLayout.punchGrid.punchHorizontalGap);
  const [punchVerticalGapMedium, setPunchVerticalGapMedium] = useState(defaultLayout.punchGrid.punchVerticalGap);
  const [numRows, setNumRows] = useState(defaultLayout.punchGrid.numRows);
  const [punchesPerRow, setPunchesPerRow] = useState(defaultLayout.punchGrid.punchesPerRow);

  // Large size settings (initialize with medium values)
  const [titleTopLarge, setTitleTopLarge] = useState(defaultLayout.title.top);
  const [titleLeftLarge, setTitleLeftLarge] = useState(defaultLayout.title.left);
  const [titleTextAlignLarge, setTitleTextAlignLarge] = useState(defaultLayout.title.textAlign);
  const [titleColorLarge, setTitleColorLarge] = useState(defaultLayout.title.color);
  const [titleFontSizeLarge, setTitleFontSizeLarge] = useState('2rem');
  const [titleFontFamilyLarge, setTitleFontFamilyLarge] = useState(defaultLayout.title.fontFamily || 'Arial');
  const [titleWidthLarge, setTitleWidthLarge] = useState(defaultLayout.title.width);

  const [descTopLarge, setDescTopLarge] = useState(defaultLayout.description.top);
  const [descLeftLarge, setDescLeftLarge] = useState(defaultLayout.description.left);
  const [descTextAlignLarge, setDescTextAlignLarge] = useState(defaultLayout.description.textAlign);
  const [descColorLarge, setDescColorLarge] = useState(defaultLayout.description.color);
  const [descFontSizeLarge, setDescFontSizeLarge] = useState('1.5rem');
  const [descFontFamilyLarge, setDescFontFamilyLarge] = useState(defaultLayout.description.fontFamily || 'Arial');
  const [descWidthLarge, setDescWidthLarge] = useState(defaultLayout.description.width);

  const [gridTopLarge, setGridTopLarge] = useState(defaultLayout.punchGrid.top);
  const [gridLeftLarge, setGridLeftLarge] = useState(defaultLayout.punchGrid.left);
  const [gridTransformLarge, setGridTransformLarge] = useState(defaultLayout.punchGrid.transform);
  const [punchCircleSizeLarge, setPunchCircleSizeLarge] = useState('120px');
  const [punchIconSizeLarge, setPunchIconSizeLarge] = useState('120px');
  const [punchHorizontalGapLarge, setPunchHorizontalGapLarge] = useState('12px');
  const [punchVerticalGapLarge, setPunchVerticalGapLarge] = useState('15px');

  // Get current values based on editing size
  const getCurrentValue = (medium, large) => editingSize === 'large' ? large : medium;
  const setCurrentValue = (mediumSetter, largeSetter, value) => {
    if (editingSize === 'large') {
      largeSetter(value);
    } else {
      mediumSetter(value);
    }
  };

  // Helper function to parse and adjust percentage values
  const adjustPercentage = (value, delta) => {
    const match = value.match(/^([\d.]+)(%)?$/);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2] || '';
      const newValue = Math.max(0, Math.min(100, num + delta));
      return `${newValue}${unit}`;
    }
    return value;
  };

  // Helper function to parse and adjust pixel values
  const adjustPixels = (value, delta) => {
    const match = value.match(/^([\d.]+)(px|rem|em)?$/);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2] || '';
      const newValue = Math.max(0, num + delta);
      return `${newValue}${unit}`;
    }
    return value;
  };

  // Font options
  const fontOptions = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
    'Press Start 2P',
    'Press to Play',
    'Arcade Gamer',
    'Dancing Script',
    'Great Vibes',
    'Cinzel',
    'Moontime',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Playfair Display',
    'Merriweather',
    'Oswald',
    'Raleway',
    'Ubuntu',
  ];

  // Computed layout objects
  const layoutMedium = useMemo(() => ({
    title: {
      top: titleTopMedium,
      left: titleLeftMedium,
      textAlign: titleTextAlignMedium,
      color: titleColorMedium,
      fontSize: titleFontSizeMedium,
      fontFamily: titleFontFamilyMedium,
      fontWeight: defaultLayout.title.fontWeight,
      width: titleWidthMedium,
    },
    description: {
      top: descTopMedium,
      left: descLeftMedium,
      textAlign: descTextAlignMedium,
      color: descColorMedium,
      fontSize: descFontSizeMedium,
      fontFamily: descFontFamilyMedium,
      width: descWidthMedium,
    },
    punchGrid: {
      top: gridTopMedium,
      left: gridLeftMedium,
      transform: gridTransformMedium,
      punchCircleSize: punchCircleSizeMedium,
      punchIconSize: punchIconSizeMedium,
      punchHorizontalGap: punchHorizontalGapMedium,
      punchVerticalGap: punchVerticalGapMedium,
      numRows,
      punchesPerRow,
    },
  }), [
    titleTopMedium, titleLeftMedium, titleTextAlignMedium, titleColorMedium, titleFontSizeMedium, titleFontFamilyMedium, titleWidthMedium,
    descTopMedium, descLeftMedium, descTextAlignMedium, descColorMedium, descFontSizeMedium, descFontFamilyMedium, descWidthMedium,
    gridTopMedium, gridLeftMedium, gridTransformMedium, punchCircleSizeMedium, punchIconSizeMedium,
    punchHorizontalGapMedium, punchVerticalGapMedium, numRows, punchesPerRow,
  ]);

  const layoutLarge = useMemo(() => ({
    title: {
      top: titleTopLarge,
      left: titleLeftLarge,
      textAlign: titleTextAlignLarge,
      color: titleColorLarge,
      fontSize: titleFontSizeLarge,
      fontFamily: titleFontFamilyLarge,
      fontWeight: defaultLayout.title.fontWeight,
      width: titleWidthLarge,
    },
    description: {
      top: descTopLarge,
      left: descLeftLarge,
      textAlign: descTextAlignLarge,
      color: descColorLarge,
      fontSize: descFontSizeLarge,
      fontFamily: descFontFamilyLarge,
      width: descWidthLarge,
    },
    punchGrid: {
      top: gridTopLarge,
      left: gridLeftLarge,
      transform: gridTransformLarge,
      punchCircleSize: punchCircleSizeLarge,
      punchIconSize: punchIconSizeLarge,
      punchHorizontalGap: punchHorizontalGapLarge,
      punchVerticalGap: punchVerticalGapLarge,
      numRows,
      punchesPerRow,
    },
  }), [
    titleTopLarge, titleLeftLarge, titleTextAlignLarge, titleColorLarge, titleFontSizeLarge, titleFontFamilyLarge, titleWidthLarge,
    descTopLarge, descLeftLarge, descTextAlignLarge, descColorLarge, descFontSizeLarge, descFontFamilyLarge, descWidthLarge,
    gridTopLarge, gridLeftLarge, gridTransformLarge, punchCircleSizeLarge, punchIconSizeLarge,
    punchHorizontalGapLarge, punchVerticalGapLarge, numRows, punchesPerRow,
  ]);

  // Generate JSON output with both sizes
  const jsonOutput = useMemo(() => {
    return JSON.stringify({
      title: {
        topMedium: titleTopMedium,
        topLarge: titleTopLarge,
        leftMedium: titleLeftMedium,
        leftLarge: titleLeftLarge,
        textAlign: titleTextAlignMedium, // Same for both
        colorMedium: titleColorMedium,
        colorLarge: titleColorLarge,
        fontSizeMedium: titleFontSizeMedium,
        fontSizeLarge: titleFontSizeLarge,
        fontFamilyMedium: titleFontFamilyMedium,
        fontFamilyLarge: titleFontFamilyLarge,
        fontWeight: defaultLayout.title.fontWeight,
        widthMedium: titleWidthMedium,
        widthLarge: titleWidthLarge,
      },
      description: {
        topMedium: descTopMedium,
        topLarge: descTopLarge,
        leftMedium: descLeftMedium,
        leftLarge: descLeftLarge,
        textAlign: descTextAlignMedium,
        colorMedium: descColorMedium,
        colorLarge: descColorLarge,
        fontSizeMedium: descFontSizeMedium,
        fontSizeLarge: descFontSizeLarge,
        fontFamilyMedium: descFontFamilyMedium,
        fontFamilyLarge: descFontFamilyLarge,
        widthMedium: descWidthMedium,
        widthLarge: descWidthLarge,
      },
      punchGrid: {
        topMedium: gridTopMedium,
        topLarge: gridTopLarge,
        leftMedium: gridLeftMedium,
        leftLarge: gridLeftLarge,
        transform: gridTransformMedium,
        punchCircleSizeMedium: punchCircleSizeMedium,
        punchCircleSizeLarge: punchCircleSizeLarge,
        punchIconSizeMedium: punchIconSizeMedium,
        punchIconSizeLarge: punchIconSizeLarge,
        punchHorizontalGapMedium: punchHorizontalGapMedium,
        punchHorizontalGapLarge: punchHorizontalGapLarge,
        punchVerticalGapMedium: punchVerticalGapMedium,
        punchVerticalGapLarge: punchVerticalGapLarge,
        numRows,
        punchesPerRow,
      },
    }, null, 2);
  }, [layoutMedium, layoutLarge, numRows, punchesPerRow]);

  const [copiedType, setCopiedType] = useState(null);
  const [importError, setImportError] = useState('');
  const [importText, setImportText] = useState('');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput);
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyAsCode = () => {
    const code = `  '${selectedCard}': {
    title: { 
      topMedium: '${titleTopMedium}', 
      topLarge: '${titleTopLarge}',
      leftMedium: '${titleLeftMedium}', 
      leftLarge: '${titleLeftLarge}',
      textAlign: '${titleTextAlignMedium}', 
      colorMedium: '${titleColorMedium}', 
      colorLarge: '${titleColorLarge}',
      fontSizeMedium: '${titleFontSizeMedium}', 
      fontSizeLarge: '${titleFontSizeLarge}',
      fontFamilyMedium: '${titleFontFamilyMedium}', 
      fontFamilyLarge: '${titleFontFamilyLarge}',
      fontWeight: 'bold',
      widthMedium: '${titleWidthMedium}', 
      widthLarge: '${titleWidthLarge}'
    },
    description: { 
      topMedium: '${descTopMedium}', 
      topLarge: '${descTopLarge}',
      leftMedium: '${descLeftMedium}', 
      leftLarge: '${descLeftLarge}',
      textAlign: '${descTextAlignMedium}',
      colorMedium: '${descColorMedium}', 
      colorLarge: '${descColorLarge}',
      fontSizeMedium: '${descFontSizeMedium}', 
      fontSizeLarge: '${descFontSizeLarge}',
      fontFamilyMedium: '${descFontFamilyMedium}', 
      fontFamilyLarge: '${descFontFamilyLarge}',
      widthMedium: '${descWidthMedium}', 
      widthLarge: '${descWidthLarge}'
    },
    punchGrid: { 
      topMedium: '${gridTopMedium}', 
      topLarge: '${gridTopLarge}',
      leftMedium: '${gridLeftMedium}', 
      leftLarge: '${gridLeftLarge}',
      transform: '${gridTransformMedium}',
      punchCircleSizeMedium: '${punchCircleSizeMedium}', 
      punchCircleSizeLarge: '${punchCircleSizeLarge}',
      punchIconSizeMedium: '${punchIconSizeMedium}', 
      punchIconSizeLarge: '${punchIconSizeLarge}',
      punchHorizontalGapMedium: '${punchHorizontalGapMedium}', 
      punchHorizontalGapLarge: '${punchHorizontalGapLarge}',
      punchVerticalGapMedium: '${punchVerticalGapMedium}', 
      punchVerticalGapLarge: '${punchVerticalGapLarge}',
      numRows: ${numRows}, 
      punchesPerRow: ${punchesPerRow}
    }
  }`;
    navigator.clipboard.writeText(code);
    setCopiedType('code');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyAsFullEntry = () => {
    const code = `'${selectedCard}': {
    ...baseLayout,
    title: { 
      ...baseLayout.title, 
      topMedium: '${titleTopMedium}', 
      topLarge: '${titleTopLarge}',
      leftMedium: '${titleLeftMedium}', 
      leftLarge: '${titleLeftLarge}',
      textAlign: '${titleTextAlignMedium}', 
      colorMedium: '${titleColorMedium}', 
      colorLarge: '${titleColorLarge}',
      fontSizeMedium: '${titleFontSizeMedium}', 
      fontSizeLarge: '${titleFontSizeLarge}',
      fontFamilyMedium: '${titleFontFamilyMedium}', 
      fontFamilyLarge: '${titleFontFamilyLarge}',
      fontWeight: 'bold',
      widthMedium: '${titleWidthMedium}', 
      widthLarge: '${titleWidthLarge}'
    },
    description: { 
      ...baseLayout.description,
      topMedium: '${descTopMedium}', 
      topLarge: '${descTopLarge}',
      leftMedium: '${descLeftMedium}', 
      leftLarge: '${descLeftLarge}',
      textAlign: '${descTextAlignMedium}',
      colorMedium: '${descColorMedium}', 
      colorLarge: '${descColorLarge}',
      fontSizeMedium: '${descFontSizeMedium}', 
      fontSizeLarge: '${descFontSizeLarge}',
      fontFamilyMedium: '${descFontFamilyMedium}', 
      fontFamilyLarge: '${descFontFamilyLarge}',
      widthMedium: '${descWidthMedium}', 
      widthLarge: '${descWidthLarge}'
    },
    punchGrid: { 
      ...baseLayout.punchGrid,
      topMedium: '${gridTopMedium}', 
      topLarge: '${gridTopLarge}',
      leftMedium: '${gridLeftMedium}', 
      leftLarge: '${gridLeftLarge}',
      transform: '${gridTransformMedium}',
      punchCircleSizeMedium: '${punchCircleSizeMedium}', 
      punchCircleSizeLarge: '${punchCircleSizeLarge}',
      punchIconSizeMedium: '${punchIconSizeMedium}', 
      punchIconSizeLarge: '${punchIconSizeLarge}',
      punchHorizontalGapMedium: '${punchHorizontalGapMedium}', 
      punchHorizontalGapLarge: '${punchHorizontalGapLarge}',
      punchVerticalGapMedium: '${punchVerticalGapMedium}', 
      punchVerticalGapLarge: '${punchVerticalGapLarge}',
      numRows: ${numRows}, 
      punchesPerRow: ${punchesPerRow}
    }
  }`;
    navigator.clipboard.writeText(code);
    setCopiedType('full');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleImport = (text) => {
    try {
      const parsed = JSON.parse(text);
      
      // Try to extract values from the parsed JSON
      if (parsed.title) {
        if (parsed.title.topMedium) setTitleTopMedium(parsed.title.topMedium);
        if (parsed.title.topLarge) setTitleTopLarge(parsed.title.topLarge);
        if (parsed.title.leftMedium) setTitleLeftMedium(parsed.title.leftMedium);
        if (parsed.title.leftLarge) setTitleLeftLarge(parsed.title.leftLarge);
        if (parsed.title.textAlign) {
          setTitleTextAlignMedium(parsed.title.textAlign);
          setTitleTextAlignLarge(parsed.title.textAlign);
        }
        if (parsed.title.colorMedium) setTitleColorMedium(parsed.title.colorMedium);
        if (parsed.title.colorLarge) setTitleColorLarge(parsed.title.colorLarge);
        if (parsed.title.fontSizeMedium) setTitleFontSizeMedium(parsed.title.fontSizeMedium);
        if (parsed.title.fontSizeLarge) setTitleFontSizeLarge(parsed.title.fontSizeLarge);
        if (parsed.title.fontFamilyMedium) setTitleFontFamilyMedium(parsed.title.fontFamilyMedium);
        if (parsed.title.fontFamilyLarge) setTitleFontFamilyLarge(parsed.title.fontFamilyLarge);
        if (parsed.title.widthMedium) setTitleWidthMedium(parsed.title.widthMedium);
        if (parsed.title.widthLarge) setTitleWidthLarge(parsed.title.widthLarge);
      }
      
      if (parsed.description) {
        if (parsed.description.topMedium) setDescTopMedium(parsed.description.topMedium);
        if (parsed.description.topLarge) setDescTopLarge(parsed.description.topLarge);
        if (parsed.description.leftMedium) setDescLeftMedium(parsed.description.leftMedium);
        if (parsed.description.leftLarge) setDescLeftLarge(parsed.description.leftLarge);
        if (parsed.description.textAlign) {
          setDescTextAlignMedium(parsed.description.textAlign);
          setDescTextAlignLarge(parsed.description.textAlign);
        }
        if (parsed.description.colorMedium) setDescColorMedium(parsed.description.colorMedium);
        if (parsed.description.colorLarge) setDescColorLarge(parsed.description.colorLarge);
        if (parsed.description.fontSizeMedium) setDescFontSizeMedium(parsed.description.fontSizeMedium);
        if (parsed.description.fontSizeLarge) setDescFontSizeLarge(parsed.description.fontSizeLarge);
        if (parsed.description.fontFamilyMedium) setDescFontFamilyMedium(parsed.description.fontFamilyMedium);
        if (parsed.description.fontFamilyLarge) setDescFontFamilyLarge(parsed.description.fontFamilyLarge);
        if (parsed.description.widthMedium) setDescWidthMedium(parsed.description.widthMedium);
        if (parsed.description.widthLarge) setDescWidthLarge(parsed.description.widthLarge);
      }
      
      if (parsed.punchGrid) {
        if (parsed.punchGrid.topMedium) setGridTopMedium(parsed.punchGrid.topMedium);
        if (parsed.punchGrid.topLarge) setGridTopLarge(parsed.punchGrid.topLarge);
        if (parsed.punchGrid.leftMedium) setGridLeftMedium(parsed.punchGrid.leftMedium);
        if (parsed.punchGrid.leftLarge) setGridLeftLarge(parsed.punchGrid.leftLarge);
        if (parsed.punchGrid.transform) {
          setGridTransformMedium(parsed.punchGrid.transform);
          setGridTransformLarge(parsed.punchGrid.transform);
        }
        if (parsed.punchGrid.punchCircleSizeMedium) setPunchCircleSizeMedium(parsed.punchGrid.punchCircleSizeMedium);
        if (parsed.punchGrid.punchCircleSizeLarge) setPunchCircleSizeLarge(parsed.punchGrid.punchCircleSizeLarge);
        if (parsed.punchGrid.punchIconSizeMedium) setPunchIconSizeMedium(parsed.punchGrid.punchIconSizeMedium);
        if (parsed.punchGrid.punchIconSizeLarge) setPunchIconSizeLarge(parsed.punchGrid.punchIconSizeLarge);
        if (parsed.punchGrid.punchHorizontalGapMedium) setPunchHorizontalGapMedium(parsed.punchGrid.punchHorizontalGapMedium);
        if (parsed.punchGrid.punchHorizontalGapLarge) setPunchHorizontalGapLarge(parsed.punchGrid.punchHorizontalGapLarge);
        if (parsed.punchGrid.punchVerticalGapMedium) setPunchVerticalGapMedium(parsed.punchGrid.punchVerticalGapMedium);
        if (parsed.punchGrid.punchVerticalGapLarge) setPunchVerticalGapLarge(parsed.punchGrid.punchVerticalGapLarge);
        if (parsed.punchGrid.numRows) setNumRows(parsed.punchGrid.numRows);
        if (parsed.punchGrid.punchesPerRow) setPunchesPerRow(parsed.punchGrid.punchesPerRow);
      }
      
      setImportError('');
      alert('Layout imported successfully!');
    } catch (error) {
      setImportError('Invalid JSON format. Please check your input.');
      console.error('Import error:', error);
    }
  };

  const icon1 = selectedIcon1 ? iconMap[selectedIcon1] : null;
  const icon2 = selectedIcon2 ? iconMap[selectedIcon2] : null;
  const cardImage = selectedCard ? punchCardMap[selectedCard] : null;

  // Track dimensions of preview cards
  useEffect(() => {
    const updateDimensions = () => {
      if (mediumPreviewRef.current) {
        const rect = mediumPreviewRef.current.getBoundingClientRect();
        setMediumDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
      if (largePreviewRef.current) {
        const rect = largePreviewRef.current.getBoundingClientRect();
        setLargeDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Use ResizeObserver for more accurate tracking
    const observers = [];
    if (mediumPreviewRef.current) {
      const observer = new ResizeObserver(updateDimensions);
      observer.observe(mediumPreviewRef.current);
      observers.push(observer);
    }
    if (largePreviewRef.current) {
      const observer = new ResizeObserver(updateDimensions);
      observer.observe(largePreviewRef.current);
      observers.push(observer);
    }
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      observers.forEach(obs => obs.disconnect());
    };
  }, [cardImage, layoutMedium, layoutLarge]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4 text-pink-600">Card Layout Editor</h1>
        
        {/* Top Controls Bar */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Size Toggle */}
            <div>
              <label className="block text-sm font-medium mb-2">Editing Size:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingSize('medium')}
                  className={`flex-1 px-4 py-2 rounded text-sm font-medium ${editingSize === 'medium' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setEditingSize('large')}
                  className={`flex-1 px-4 py-2 rounded text-sm font-medium ${editingSize === 'large' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Large
                </button>
              </div>
            </div>
            
            {/* Card Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Card Image:</label>
              <select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              >
                {cardNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Icon 1:</label>
              <select
                value={selectedIcon1}
                onChange={(e) => setSelectedIcon1(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              >
                {iconNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Icon 2:</label>
              <select
                value={selectedIcon2}
                onChange={(e) => setSelectedIcon2(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              >
                {iconNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Punches */}
          <div className="grid grid-cols-2 gap-4 mt-4 max-w-xs">
            <div>
              <label className="block text-sm font-medium mb-2">Current Punches:</label>
              <input
                type="number"
                value={currentPunches}
                onChange={(e) => setCurrentPunches(parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded text-sm"
                min="0"
                max={targetPunches}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Punches:</label>
              <input
                type="number"
                value={targetPunches}
                onChange={(e) => setTargetPunches(parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded text-sm"
                min="1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Preview Section - Column View */}
          <div className="xl:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Live Preview</h2>
            
            {/* Preview Cards - Column View */}
            <div className="grid grid-cols-1 gap-8">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-between mb-3 w-full max-w-[600px]">
                  <h3 className="text-base font-semibold text-pink-600">Medium Size (Carousel)</h3>
                  <span className="text-sm text-gray-500">600px max-width</span>
                </div>
                <div className="relative w-full flex justify-center">
                  <div 
                    ref={mediumPreviewRef}
                    className="border-4 border-pink-200 rounded-lg overflow-hidden" 
                    style={{ aspectRatio: '1004/591', width: '600px', maxWidth: '100%' }}
                  >
                    {cardImage && (
                      <PunchCardPreview
                        name="Sample Title"
                        description="This is a sample description text"
                        icon1={icon1}
                        icon2={icon2}
                        cardImage={cardImage}
                        isDailyPunch={false}
                        titlePlacement={layoutMedium.title}
                        descriptionPlacement={layoutMedium.description}
                        punchGridPlacement={layoutMedium.punchGrid}
                        currentPunches={currentPunches}
                        targetPunches={targetPunches}
                        size="medium"
                      />
                    )}
                  </div>
                  {mediumDimensions.width > 0 && mediumDimensions.height > 0 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm border-2 border-pink-300 rounded-md px-2 py-1 text-xs font-semibold text-pink-600 shadow-md">
                      {mediumDimensions.width} × {mediumDimensions.height} px
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-between mb-3 w-full" style={{ maxWidth: 'calc(350px * 1004 / 591)' }}>
                  <h3 className="text-base font-semibold text-purple-600">Large Size (Zoom Modal)</h3>
                  <span className="text-sm text-gray-500">350px max-height</span>
                </div>
                <div className="relative w-full flex justify-center">
                  <div 
                    ref={largePreviewRef}
                    className="border-4 border-purple-200 rounded-lg overflow-hidden" 
                    style={{ aspectRatio: '1004/591', height: '350px', maxWidth: '100%' }}
                  >
                    {cardImage && (
                      <PunchCardPreview
                        name="Sample Title"
                        description="This is a sample description text"
                        icon1={icon1}
                        icon2={icon2}
                        cardImage={cardImage}
                        isDailyPunch={false}
                        titlePlacement={layoutLarge.title}
                        descriptionPlacement={layoutLarge.description}
                        punchGridPlacement={layoutLarge.punchGrid}
                        currentPunches={currentPunches}
                        targetPunches={targetPunches}
                        size="large"
                      />
                    )}
                  </div>
                  {largeDimensions.width > 0 && largeDimensions.height > 0 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm border-2 border-purple-300 rounded-md px-2 py-1 text-xs font-semibold text-purple-600 shadow-md">
                      {largeDimensions.width} × {largeDimensions.height} px
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <div className="sticky top-0 bg-white pb-3 mb-6 border-b-2 border-gray-200 z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingSize === 'large' ? 'Large' : 'Medium'} Size Controls
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Adjust values for {editingSize === 'large' ? 'zoom modal' : 'carousel'} view
              </p>
            </div>

            {/* Title Controls */}
            <div className="mb-6 p-5 bg-purple-50 rounded-lg border-2 border-purple-200">
              <h3 className="font-bold mb-4 text-lg text-purple-800">Title Settings ({editingSize})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Top Position:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setTitleTopMedium, setTitleTopLarge, adjustPercentage(getCurrentValue(titleTopMedium, titleTopLarge), -0.5))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="text" 
                      value={getCurrentValue(titleTopMedium, titleTopLarge)} 
                      onChange={(e) => setCurrentValue(setTitleTopMedium, setTitleTopLarge, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      placeholder="4%"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setTitleTopMedium, setTitleTopLarge, adjustPercentage(getCurrentValue(titleTopMedium, titleTopLarge), 0.5))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Left Position:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setTitleLeftMedium, setTitleLeftLarge, adjustPercentage(getCurrentValue(titleLeftMedium, titleLeftLarge), -0.5))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="text" 
                      value={getCurrentValue(titleLeftMedium, titleLeftLarge)} 
                      onChange={(e) => setCurrentValue(setTitleLeftMedium, setTitleLeftLarge, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      placeholder="7%"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setTitleLeftMedium, setTitleLeftLarge, adjustPercentage(getCurrentValue(titleLeftMedium, titleLeftLarge), 0.5))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Text Align:</label>
                  <select 
                    value={getCurrentValue(titleTextAlignMedium, titleTextAlignLarge)} 
                    onChange={(e) => {
                      setTitleTextAlignMedium(e.target.value);
                      setTitleTextAlignLarge(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="left">left</option>
                    <option value="center">center</option>
                    <option value="right">right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Color:</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={getCurrentValue(titleColorMedium, titleColorLarge)} 
                      onChange={(e) => setCurrentValue(setTitleColorMedium, setTitleColorLarge, e.target.value)} 
                      className="w-16 h-10 border-2 border-gray-300 rounded cursor-pointer" 
                    />
                    <input
                      type="text"
                      value={getCurrentValue(titleColorMedium, titleColorLarge)}
                      onChange={(e) => setCurrentValue(setTitleColorMedium, setTitleColorLarge, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-base font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="#333333"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Font Size:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setTitleFontSizeMedium, setTitleFontSizeLarge, adjustPixels(getCurrentValue(titleFontSizeMedium, titleFontSizeLarge), -0.1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="text" 
                      value={getCurrentValue(titleFontSizeMedium, titleFontSizeLarge)} 
                      onChange={(e) => setCurrentValue(setTitleFontSizeMedium, setTitleFontSizeLarge, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      placeholder="1.4rem"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setTitleFontSizeMedium, setTitleFontSizeLarge, adjustPixels(getCurrentValue(titleFontSizeMedium, titleFontSizeLarge), 0.1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Font Family:</label>
                  <select
                    value={getCurrentValue(titleFontFamilyMedium, titleFontFamilyLarge)}
                    onChange={(e) => setCurrentValue(setTitleFontFamilyMedium, setTitleFontFamilyLarge, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {fontOptions.map(font => (
                      <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Width:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setTitleWidthMedium, setTitleWidthLarge, adjustPercentage(getCurrentValue(titleWidthMedium, titleWidthLarge), -1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="text" 
                      value={getCurrentValue(titleWidthMedium, titleWidthLarge)} 
                      onChange={(e) => setCurrentValue(setTitleWidthMedium, setTitleWidthLarge, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      placeholder="80%"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setTitleWidthMedium, setTitleWidthLarge, adjustPercentage(getCurrentValue(titleWidthMedium, titleWidthLarge), 1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Controls */}
            <div className="mb-6 p-5 bg-pink-50 rounded-lg border-2 border-pink-200">
              <h3 className="font-bold mb-4 text-lg text-pink-800">Description Settings ({editingSize})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Top Position:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setDescTopMedium, setDescTopLarge, adjustPercentage(getCurrentValue(descTopMedium, descTopLarge), -0.5))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="text" 
                      value={getCurrentValue(descTopMedium, descTopLarge)} 
                      onChange={(e) => setCurrentValue(setDescTopMedium, setDescTopLarge, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                      placeholder="20%"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setDescTopMedium, setDescTopLarge, adjustPercentage(getCurrentValue(descTopMedium, descTopLarge), 0.5))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Left Position:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setDescLeftMedium, setDescLeftLarge, adjustPercentage(getCurrentValue(descLeftMedium, descLeftLarge), -0.5))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="text" 
                      value={getCurrentValue(descLeftMedium, descLeftLarge)} 
                      onChange={(e) => setCurrentValue(setDescLeftMedium, setDescLeftLarge, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                      placeholder="7%"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setDescLeftMedium, setDescLeftLarge, adjustPercentage(getCurrentValue(descLeftMedium, descLeftLarge), 0.5))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Text Align:</label>
                  <select 
                    value={getCurrentValue(descTextAlignMedium, descTextAlignLarge)} 
                    onChange={(e) => {
                      setDescTextAlignMedium(e.target.value);
                      setDescTextAlignLarge(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="left">left</option>
                    <option value="center">center</option>
                    <option value="right">right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Color:</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={getCurrentValue(descColorMedium, descColorLarge)} 
                      onChange={(e) => setCurrentValue(setDescColorMedium, setDescColorLarge, e.target.value)} 
                      className="w-16 h-10 border-2 border-gray-300 rounded cursor-pointer" 
                    />
                    <input
                      type="text"
                      value={getCurrentValue(descColorMedium, descColorLarge)}
                      onChange={(e) => setCurrentValue(setDescColorMedium, setDescColorLarge, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-base font-mono focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="#555555"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Font Size:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setDescFontSizeMedium, setDescFontSizeLarge, adjustPixels(getCurrentValue(descFontSizeMedium, descFontSizeLarge), -0.1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="text" 
                      value={getCurrentValue(descFontSizeMedium, descFontSizeLarge)} 
                      onChange={(e) => setCurrentValue(setDescFontSizeMedium, setDescFontSizeLarge, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                      placeholder="1rem"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setDescFontSizeMedium, setDescFontSizeLarge, adjustPixels(getCurrentValue(descFontSizeMedium, descFontSizeLarge), 0.1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Font Family:</label>
                  <select
                    value={getCurrentValue(descFontFamilyMedium, descFontFamilyLarge)}
                    onChange={(e) => setCurrentValue(setDescFontFamilyMedium, setDescFontFamilyLarge, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {fontOptions.map(font => (
                      <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Width:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setDescWidthMedium, setDescWidthLarge, adjustPercentage(getCurrentValue(descWidthMedium, descWidthLarge), -1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="text" 
                      value={getCurrentValue(descWidthMedium, descWidthLarge)} 
                      onChange={(e) => setCurrentValue(setDescWidthMedium, setDescWidthLarge, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                      placeholder="80%"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setDescWidthMedium, setDescWidthLarge, adjustPercentage(getCurrentValue(descWidthMedium, descWidthLarge), 1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Punch Grid Controls */}
            <div className="mb-6 p-5 bg-blue-50 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold mb-4 text-lg text-blue-800">Punch Grid Settings ({editingSize})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Top Position:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setGridTopMedium, setGridTopLarge, adjustPercentage(getCurrentValue(gridTopMedium, gridTopLarge), -0.5))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="text" 
                      value={getCurrentValue(gridTopMedium, gridTopLarge)} 
                      onChange={(e) => setCurrentValue(setGridTopMedium, setGridTopLarge, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="33%"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setGridTopMedium, setGridTopLarge, adjustPercentage(getCurrentValue(gridTopMedium, gridTopLarge), 0.5))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Left Position:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setGridLeftMedium, setGridLeftLarge, adjustPercentage(getCurrentValue(gridLeftMedium, gridLeftLarge), -0.5))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="text" 
                      value={getCurrentValue(gridLeftMedium, gridLeftLarge)} 
                      onChange={(e) => setCurrentValue(setGridLeftMedium, setGridLeftLarge, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="50%"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setGridLeftMedium, setGridLeftLarge, adjustPercentage(getCurrentValue(gridLeftMedium, gridLeftLarge), 0.5))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Transform:</label>
                  <input 
                    type="text" 
                    value={getCurrentValue(gridTransformMedium, gridTransformLarge)} 
                    onChange={(e) => {
                      setGridTransformMedium(e.target.value);
                      setGridTransformLarge(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="translateX(-50%)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Circle Size:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setPunchCircleSizeMedium, setPunchCircleSizeLarge, adjustPixels(getCurrentValue(punchCircleSizeMedium, punchCircleSizeLarge), -1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="text" 
                      value={getCurrentValue(punchCircleSizeMedium, punchCircleSizeLarge)} 
                      onChange={(e) => setCurrentValue(setPunchCircleSizeMedium, setPunchCircleSizeLarge, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="85px"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setPunchCircleSizeMedium, setPunchCircleSizeLarge, adjustPixels(getCurrentValue(punchCircleSizeMedium, punchCircleSizeLarge), 1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Icon Size:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setPunchIconSizeMedium, setPunchIconSizeLarge, adjustPixels(getCurrentValue(punchIconSizeMedium, punchIconSizeLarge), -1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="text" 
                      value={getCurrentValue(punchIconSizeMedium, punchIconSizeLarge)} 
                      onChange={(e) => setCurrentValue(setPunchIconSizeMedium, setPunchIconSizeLarge, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="85px"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setPunchIconSizeMedium, setPunchIconSizeLarge, adjustPixels(getCurrentValue(punchIconSizeMedium, punchIconSizeLarge), 1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Horizontal Gap:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setPunchHorizontalGapMedium, setPunchHorizontalGapLarge, adjustPixels(getCurrentValue(punchHorizontalGapMedium, punchHorizontalGapLarge), -1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="text" 
                      value={getCurrentValue(punchHorizontalGapMedium, punchHorizontalGapLarge)} 
                      onChange={(e) => setCurrentValue(setPunchHorizontalGapMedium, setPunchHorizontalGapLarge, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="8px"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setPunchHorizontalGapMedium, setPunchHorizontalGapLarge, adjustPixels(getCurrentValue(punchHorizontalGapMedium, punchHorizontalGapLarge), 1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Vertical Gap:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setPunchVerticalGapMedium, setPunchVerticalGapLarge, adjustPixels(getCurrentValue(punchVerticalGapMedium, punchVerticalGapLarge), -1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="text" 
                      value={getCurrentValue(punchVerticalGapMedium, punchVerticalGapLarge)} 
                      onChange={(e) => setCurrentValue(setPunchVerticalGapMedium, setPunchVerticalGapLarge, e.target.value)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="10px"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentValue(setPunchVerticalGapMedium, setPunchVerticalGapLarge, adjustPixels(getCurrentValue(punchVerticalGapMedium, punchVerticalGapLarge), 1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Number of Rows:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setNumRows(Math.max(1, numRows - 1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="number" 
                      value={numRows} 
                      onChange={(e) => setNumRows(parseInt(e.target.value) || 1)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      min="1" 
                    />
                    <button
                      type="button"
                      onClick={() => setNumRows(numRows + 1)}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Punches Per Row:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPunchesPerRow(Math.max(1, punchesPerRow - 1))}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-l border border-gray-300 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <input 
                      type="number" 
                      value={punchesPerRow} 
                      onChange={(e) => setPunchesPerRow(parseInt(e.target.value) || 1)} 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-none text-base text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      min="1" 
                    />
                    <button
                      type="button"
                      onClick={() => setPunchesPerRow(punchesPerRow + 1)}
                      className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-gray-300 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="mb-4 border-t pt-4">
              <h3 className="text-lg font-bold mb-3 text-gray-800">Export & Import</h3>
              
              {/* Copy Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                    copiedType === 'json' 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md'
                  }`}
                >
                  {copiedType === 'json' ? <Check size={16} /> : <Copy size={16} />}
                  {copiedType === 'json' ? 'Copied!' : 'Copy JSON'}
                </button>
                <button
                  onClick={copyAsCode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                    copiedType === 'code' 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'bg-pink-600 text-white hover:bg-pink-700 hover:shadow-md'
                  }`}
                >
                  {copiedType === 'code' ? <Check size={16} /> : <Copy size={16} />}
                  {copiedType === 'code' ? 'Copied!' : 'Copy Code'}
                </button>
                <button
                  onClick={copyAsFullEntry}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                    copiedType === 'full' 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                  }`}
                >
                  {copiedType === 'full' ? <Check size={16} /> : <Copy size={16} />}
                  {copiedType === 'full' ? 'Copied!' : 'Copy Full Entry'}
                </button>
              </div>
              
              {/* Import Section */}
              <div className="mb-4 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  <Upload size={16} className="inline mr-1" />
                  Import Layout (Paste JSON here)
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    setImportError('');
                  }}
                  placeholder='Paste JSON layout here, e.g.: {"title": {"topMedium": "4%", ...}}'
                  className="w-full p-2 border-2 border-gray-300 rounded text-xs font-mono h-24 mb-2 focus:border-blue-500 focus:outline-none bg-white"
                />
                <button
                  onClick={() => {
                    if (importText.trim()) {
                      handleImport(importText);
                    } else {
                      setImportError('Please paste JSON data first');
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm font-medium shadow-sm transition-all"
                >
                  Import Layout
                </button>
                {importError && (
                  <div className="mt-2 text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200">
                    ⚠️ {importError}
                  </div>
                )}
              </div>
              
              {/* Output Textarea */}
              <div className="relative">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  <Download size={16} className="inline mr-1" />
                  Layout Output (Click to select all, then copy)
                </label>
                <textarea
                  value={jsonOutput}
                  readOnly
                  onClick={(e) => e.target.select()}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg text-sm font-mono h-80 bg-white focus:border-purple-500 focus:outline-none shadow-inner"
                  style={{ resize: 'vertical', minHeight: '320px' }}
                />
                <div className="absolute top-12 right-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
                  {jsonOutput.length} chars
                </div>
              </div>
              
              {/* Instructions */}
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 font-medium mb-1">💡 How to use:</p>
                <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1">
                  <li>Adjust the layout controls above</li>
                  <li>Click "Copy Code" or "Copy Full Entry" to get the format for cardLayouts.js</li>
                  <li>Paste the output into your cardLayouts.js file</li>
                  <li>Or use "Import Layout" to load existing JSON layouts</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
