import React from 'react';

/**
 * MapOverlay
 * - Reusable absolute-positioned overlay for map segments
 * Props: left, right, top, bottom (strings with CSS units), className, children
 */
export default function MapOverlay({ left, right, top, bottom, className = '', children }) {
  const style = {
    position: 'absolute',
    left: left !== undefined ? left : undefined,
    right: right !== undefined ? right : undefined,
    top: top !== undefined ? top : undefined,
    bottom: bottom !== undefined ? bottom : undefined,
    zIndex: 40,
  };

  return (
    <div style={style} className={`map-overlay pointer-events-auto ${className}`}>
      {children}
    </div>
  );
}
