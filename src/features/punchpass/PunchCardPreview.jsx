import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import holePunchCursor from "@/assets/cursors/holePunch.png";
import holePunchClickCursor from "@/assets/cursors/holePunchClick.png";
import defaultPunchIcon from "@/assets/icons/punch.png";

// Card layouts in cardLayouts.config.js (font sizes, punch circle sizes, gaps)
// were calibrated against this rendered card size. The inner stage is rendered
// at these dimensions and then transform-scaled to whatever the container is,
// so a 80px circle stays at the same proportion of the card on every screen.
const DESIGN_WIDTH = 600;
const DESIGN_HEIGHT = 600 * 591 / 1004; // ≈ 353.19, matches card aspect ratio

export default function PunchCardPreview({
  name,
  description,
  icon1,
  icon2,
  cardImage,
  isDailyPunch = false,
  titlePlacement = {},
  descriptionPlacement = {},
  punchGridPlacement = {},
  currentPunches = 0,
  targetPunches = 10,
  size = 'medium', // 'medium' or 'large' - kept for compatibility but not used
}) {
  const [isClicking, setIsClicking] = useState(false);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w <= 0 || h <= 0) return;
      // Use the smaller of width/height ratios so the design always fits inside
      // the container without overflow even if the parent's aspect ratio is off.
      setScale(Math.min(w / DESIGN_WIDTH, h / DESIGN_HEIGHT));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stagePixelWidth = DESIGN_WIDTH * scale;
  const stagePixelHeight = DESIGN_HEIGHT * scale;

  // Track mouse down/up for cursor change
  useEffect(() => {
    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Use values directly from placement objects (no Medium/Large distinction)

  const getPunchIcon = (index) => {
    const icon = (index % 2 === 0 ? icon1 : icon2);
    if (!icon) return defaultPunchIcon;
    return icon;
  };

  // Use values from punchGridPlacement, with fallbacks for defaults
  const currentPunchGrid = {
    top: punchGridPlacement.top || '40%',
    left: punchGridPlacement.left || '50%',
    transform: punchGridPlacement.transform || 'translateX(-50%)',
    punchCircleSize: punchGridPlacement.punchCircleSize || '48px',
    punchIconSize: punchGridPlacement.punchIconSize || '32px',
    punchHorizontalGap: punchGridPlacement.punchHorizontalGap || '24px',
    punchVerticalGap: punchGridPlacement.punchVerticalGap || '24px',
    numRows: punchGridPlacement.numRows || 2,
    punchesPerRow: punchGridPlacement.punchesPerRow || 4,
  };

  // Calculate total punches needed
  const totalPunches = currentPunchGrid.numRows * currentPunchGrid.punchesPerRow;
  const actualTargetPunches = Math.min(targetPunches, totalPunches);

  const rows = Array(currentPunchGrid.numRows)
    .fill(0)
    .map((_, rowIdx) =>
      Array(currentPunchGrid.punchesPerRow)
        .fill(0)
        .map((_, colIdx) => {
          const index = rowIdx * currentPunchGrid.punchesPerRow + colIdx;
          const isFilled = index < currentPunches && index < actualTargetPunches;
          return {
            icon: getPunchIcon(index),
            isFilled,
            index
          };
        })
    );

  // Create title and description styles using direct values from cardLayouts
  // Use useMemo to recalculate styles when titlePlacement or descriptionPlacement changes
  // This ensures fonts update properly when switching cards
  const titleStyle = useMemo(() => ({
    top: titlePlacement.top,
    left: titlePlacement.left,
    textAlign: titlePlacement.textAlign,
    color: titlePlacement.color,
    fontSize: titlePlacement.fontSize,
    // Use fontFamily directly from cardLayouts - explicitly set to ensure it updates
    fontFamily: titlePlacement.fontFamily || 'Arial',
    fontWeight: titlePlacement.fontWeight,
    width: titlePlacement.width,
  }), [titlePlacement]);

  const descStyle = useMemo(() => ({
    top: descriptionPlacement.top,
    left: descriptionPlacement.left,
    textAlign: descriptionPlacement.textAlign,
    color: descriptionPlacement.color,
    fontSize: descriptionPlacement.fontSize,
    // Use fontFamily directly from cardLayouts - explicitly set to ensure it updates
    fontFamily: descriptionPlacement.fontFamily || 'Arial',
    width: descriptionPlacement.width,
  }), [descriptionPlacement]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-2xl overflow-hidden punch-card-preview-container"
      style={{
        border: 'none',
        boxShadow: '0 4px 24px rgba(248, 187, 208, 0.5)',
        cursor: `url(${isClicking ? holePunchClickCursor : holePunchCursor}) 32 32, auto`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <div
        className="punch-card-preview-stage"
        style={{
          position: 'relative',
          width: `${DESIGN_WIDTH}px`,
          height: `${DESIGN_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        }}
      >
      {/* Card background image — sits inside the stage so it scales together
          with the punches, keeping painted holes aligned with punch slots. */}
      <img
        src={cardImage}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      />
      {/* Title - Absolute Positioned: Fully controlled by titlePlacement */}
      <h2
        className="absolute punch-card-title-text"
        style={{
          ...titleStyle,
          zIndex: 10,
        }}
      >
        {name || 'Punch Pass Title'}
      </h2>

      {/* Description - Absolute Positioned: Fully controlled by descriptionPlacement */}
      <p
        className="absolute punch-card-description-text"
        style={{
          ...descStyle,
          zIndex: 10,
        }}
      >
        {description || 'Your description will appear here.'}
      </p>

      {/* Punch Grid - Absolute Positioned: Now correctly sizes and positions itself */}
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{
          top: currentPunchGrid.top,
          left: currentPunchGrid.left,
          transform: currentPunchGrid.transform,
          // Removed width and height from here.
          // The grid's width will be determined by its content (punch circles + gaps).
          zIndex: 5,
          gap: currentPunchGrid.punchVerticalGap, // Vertical gap between rows
          // Ensure it doesn't wrap onto multiple lines if not intended
          flexWrap: 'nowrap', // Added this to prevent unwanted wrapping if there's enough space
        }}
      >
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex justify-center items-center"
            style={{ 
              gap: currentPunchGrid.punchHorizontalGap, // Horizontal gap between punches
              width: '100%',
            }}
          >
            {row.map((punch, i) => {
              const punchIndex = punch.index;
              const showPunch = punchIndex < actualTargetPunches;
              
              if (!showPunch) return null;
              
              return (
                <div
                  key={i}
                  className={`flex items-center justify-center rounded-full transition-all ${
                    punch.isFilled ? 'opacity-100' : 'opacity-30'
                  }`}
                  style={{
                    width: currentPunchGrid.punchCircleSize,
                    height: currentPunchGrid.punchCircleSize,
                    minWidth: currentPunchGrid.punchCircleSize,
                    minHeight: currentPunchGrid.punchCircleSize,
                    flexShrink: 0,
                  }}
                >
                  {typeof punch.icon === 'string' && (punch.icon.includes('.png') || punch.icon.includes('.svg') || punch.icon.startsWith('http') || punch.icon.startsWith('/')) ? (
                    <img
                      src={punch.icon}
                      alt=""
                      className="object-contain"
                      style={{ 
                        width: currentPunchGrid.punchIconSize, 
                        height: currentPunchGrid.punchIconSize,
                        maxWidth: '100%',
                        maxHeight: '100%',
                      }}
                    />
                  ) : (
                    <span 
                      style={{ 
                        fontSize: currentPunchGrid.punchIconSize,
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {punch.icon || '○'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}