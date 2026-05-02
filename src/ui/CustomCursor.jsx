import { useEffect, useState } from 'react';
import { getCursor, DEFAULT_CURSOR_ID } from "@/assets/cursors/cursors";

export default function CustomCursor({
  cursorType = DEFAULT_CURSOR_ID,
  icon,
  clickIcon,
  size = 35
}) {
  const resolved = getCursor(cursorType);
  const defaultIcon = icon || resolved?.cursor;
  const clickIconFinal = clickIcon || resolved?.click;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationFrameId;

    const isClickableElement = (element) => {
      if (!element) return false;
      
      // Exclude the custom cursor itself
      if (element.closest('[style*="pointer-events: none"]')) {
        return false;
      }
      
      // Check if element or any parent is clickable
      let current = element;
      while (current && current !== document.body && current !== document.documentElement) {
        const tagName = current.tagName?.toLowerCase();
        
        // First check: if explicitly marked as non-clickable, return false immediately
        if (
          current.getAttribute('data-clickable') === 'false' ||
          current.classList.contains('non-clickable') ||
          current.classList.contains('no-cursor-hover')
        ) {
          return false;
        }
        
        // Check for truly interactive HTML elements first (most specific)
        if (
          tagName === 'a' ||
          tagName === 'button' ||
          tagName === 'input' ||
          tagName === 'select' ||
          tagName === 'textarea'
        ) {
          // Make sure it's not disabled
          if (current.disabled || current.getAttribute('aria-disabled') === 'true') {
            return false;
          }
          // Links without href are not clickable
          if (tagName === 'a' && !current.href && !current.getAttribute('href')) {
            return false;
          }
          return true;
        }
        
        // Check for explicit ARIA roles
        const role = current.getAttribute('role');
        if (role === 'button' || role === 'link' || role === 'menuitem' || role === 'tab') {
          if (current.getAttribute('aria-disabled') === 'true') {
            return false;
          }
          return true;
        }
        
        // Check for explicit clickable markers
        if (
          current.getAttribute('data-clickable') === 'true' ||
          current.classList.contains('clickable')
        ) {
          return true;
        }
        
        // Check for tabindex only if it's a positive number (0 or greater)
        const tabIndex = current.getAttribute('tabindex');
        if (tabIndex !== null && tabIndex !== '-1') {
          const tabIndexNum = parseInt(tabIndex, 10);
          if (!isNaN(tabIndexNum) && tabIndexNum >= 0) {
            return true;
          }
        }
        
        // For all other elements (div, span, p, etc.), they are NOT clickable by default
        // Only continue checking parent if we haven't found anything yet
        current = current.parentElement;
      }
      
      return false;
    };

    const updateCursor = (e) => {
      // Use requestAnimationFrame for smoother updates
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
        setIsVisible(true);
        
        // Check if hovering over a clickable element
        const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
        
        // Skip if element is null or is the cursor itself
        if (!elementUnderCursor || elementUnderCursor.closest('[style*="pointer-events: none"]')) {
          setIsHovering(false);
        } else {
          setIsHovering(isClickableElement(elementUnderCursor));
        }
      });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', updateCursor, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('mousemove', updateCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
        willChange: 'transform',
      }}
    >
      <img
        src={isClicking ? clickIconFinal : (isHovering ? clickIconFinal : defaultIcon)}
        alt="cursor"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          userSelect: 'none',
          draggable: false,
          display: 'block',
        }}
      />
    </div>
  );
}
