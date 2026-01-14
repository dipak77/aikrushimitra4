
import React, { useEffect, useRef, useState } from 'react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>("");

  useEffect(() => {
    // Dynamic Source Logic: Choose best video based on aspect ratio & width
    const checkOrientation = () => {
        // If width < 768 (mobile breakpoint) OR height > width (portrait mode)
        // We prioritize the vertical video for better mobile experience
        const isMobileOrPortrait = window.innerWidth <= 768 || window.innerHeight > window.innerWidth;
        const newSrc = isMobileOrPortrait ? "/splash-v.mp4" : "/splash-h.mp4";
        setVideoSrc(newSrc);
    };

    checkOrientation();
    // We intentionally do not attach a resize listener to avoid restarting the video 
    // while the user is watching the splash screen.
  }, []);

  useEffect(() => {
    if (!videoSrc) return;

    const video = videoRef.current;
    
    // Safety Net: Max duration 8s
    const safetyTimer = setTimeout(() => {
        onComplete();
    }, 8000);

    if (video) {
        // Ensure the video loads the new source
        video.load();
        
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                 onComplete();
            });
        }
    }

    return () => clearTimeout(safetyTimer);
  }, [onComplete, videoSrc]);

  // Prevent rendering video tag until source is determined to avoid flash of wrong content
  if (!videoSrc) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
       {/* 
          Dynamic Video Player
          - Loads splash-v.mp4 for Mobile/Portrait
          - Loads splash-h.mp4 for Desktop/Landscape
       */}
       <video 
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover relative z-10"
          muted 
          playsInline
          autoPlay
          preload="auto"
          onEnded={onComplete}
          onError={() => {
              // Silently fail to dashboard if video cannot be loaded/played
              onComplete();
          }}
          onCanPlay={() => setIsVideoReady(true)}
       />
       
       {/* Simple Loader while video initializes */}
       {!isVideoReady && (
         <div className="absolute inset-0 flex items-center justify-center bg-black z-0">
             <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
         </div>
       )}
    </div>
  );
};
