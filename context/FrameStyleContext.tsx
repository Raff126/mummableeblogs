'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { FrameStyle, FRAME_STYLES, DEFAULT_FRAME_STYLE, FrameStyleConfig } from '../utils/frameStyles';

interface FrameStyleContextType {
  frameStyle: FrameStyle;
  setFrameStyle: (style: FrameStyle) => void;
  currentConfig: FrameStyleConfig;
}

const FrameStyleContext = createContext<FrameStyleContextType>({
  frameStyle: DEFAULT_FRAME_STYLE,
  setFrameStyle: () => {},
  currentConfig: FRAME_STYLES[DEFAULT_FRAME_STYLE],
});

export const FRAME_STYLE_STORAGE_KEY = 'mummabee_frame_style';
export const FRAME_STYLE_EVENT = 'mummabee_frame_style_updated';

export function FrameStyleProvider({ children }: { children: React.ReactNode }) {
  const [frameStyle, setFrameStyleState] = useState<FrameStyle>(DEFAULT_FRAME_STYLE);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(FRAME_STYLE_STORAGE_KEY) as FrameStyle;
      if (stored && FRAME_STYLES[stored]) {
        setFrameStyleState(stored);
      }
    } catch (_) {}

    const handleStyleChange = (e: any) => {
      if (e.detail?.style && FRAME_STYLES[e.detail.style as FrameStyle]) {
        setFrameStyleState(e.detail.style as FrameStyle);
      }
    };

    window.addEventListener(FRAME_STYLE_EVENT, handleStyleChange);
    return () => {
      window.removeEventListener(FRAME_STYLE_EVENT, handleStyleChange);
    };
  }, []);

  const setFrameStyle = (style: FrameStyle) => {
    setFrameStyleState(style);
    try {
      localStorage.setItem(FRAME_STYLE_STORAGE_KEY, style);
      window.dispatchEvent(new CustomEvent(FRAME_STYLE_EVENT, { detail: { style } }));
    } catch (_) {}
  };

  const currentConfig = useMemo(() => FRAME_STYLES[frameStyle] || FRAME_STYLES[DEFAULT_FRAME_STYLE], [frameStyle]);

  return (
    <FrameStyleContext.Provider value={{ frameStyle, setFrameStyle, currentConfig }}>
      {children}
    </FrameStyleContext.Provider>
  );
}

export function useFrameStyle() {
  return useContext(FrameStyleContext);
}
