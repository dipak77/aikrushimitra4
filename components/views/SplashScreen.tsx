
import React, { useEffect, useRef, useState } from 'react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    // 1. Determine Source based on device form factor
    // This runs once on mount to lock the decision.
    const isMobile = window.innerWidth <= 768; 
    const isPortrait = window.innerHeight > window.innerWidth;
    
    // Logic: 
    // - Mobile devices (width <= 768) -> splash-v.mp4
    // - Portrait tablets/desktops -> splash-v.mp4
    // - Landscape Desktop/Tablets -> splash-h.mp4
    const src = (isMobile || isPortrait) ? "/splash-v.mp4" : "/splash-h.mp4";
    setVideoSrc(src);
  }, []);

  useEffect(() => {
    // Only run if we have a source
    if (!videoSrc) return;

    const video = videoRef.current;
    if (!video) return;

    // 2. Safety Timeout
    // If video stalls, network fails, or format is unsupported, force exit after 8s
    const safetyTimer = setTimeout(() => {
        onComplete();
    }, 8000);

    // 3. Programmatic Play
    // React's autoPlay attribute is good, but explicit play() catches browser policy rejections
    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.catch((e) => {
             // Autoplay blocked or interrupted - skip splash
             console.warn("Splash Play Error:", e);
             onComplete();
        });
    }

    return () => clearTimeout(safetyTimer);
  }, [videoSrc, onComplete]);

  // Initial render: black screen while determining source
  if (!videoSrc) return <div className="fixed inset-0 bg-black z-[9999]" />;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
       {/* 
          Robust Video Player
          - `key={videoSrc}` is CRITICAL. It forces React to destroy the old video element 
             and create a completely fresh one when the source is decided. 
             This prevents "stuck" loading states common when swapping `src` dynamically.
          - `object-cover` ensures the video fills the screen without black bars.
       */}
       <video 
          key={videoSrc} 
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover relative z-10"
          muted 
          playsInline
          autoPlay
          preload="auto"
          onEnded={onComplete}
          onError={() => {
              // If video 404s or format is wrong, immediately go to app
              onComplete();
          }}
       />
    </div>
  );
};
