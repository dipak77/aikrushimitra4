
import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [videoSrc, setVideoSrc] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    const selectVideoSource = () => {
      const isMobile = window.innerWidth < 768;
      // Use absolute root path instead of import.meta.env.BASE_URL
      setVideoSrc(`/${isMobile ? 'splash-v.mp4' : 'splash-h.mp4'}`);
    };

    selectVideoSource();
    window.addEventListener('resize', selectVideoSource);

    // Safety fallback (prevents infinite loader)
    const timeout = setTimeout(() => {
      if (!isVideoLoaded) {
        console.warn('Splash video timeout fallback');
        exitSplash();
      }
    }, 6000);

    return () => {
      window.removeEventListener('resize', selectVideoSource);
      clearTimeout(timeout);
    };
  }, [isVideoLoaded]);

  const exitSplash = () => {
    setIsExiting(true);
    setTimeout(onComplete, 800);
  };

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[9999] bg-[#000501] flex items-center justify-center overflow-hidden transition-all duration-700',
        isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'
      )}
    >
      {!isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {videoSrc && (
        <video
          key={videoSrc}
          src={videoSrc}
          autoPlay
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setIsVideoLoaded(true)}
          onEnded={exitSplash}
          onError={() => {
            console.error('Splash video failed to load');
            exitSplash();
          }}
          className={clsx(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}

      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
    </div>
  );
};
