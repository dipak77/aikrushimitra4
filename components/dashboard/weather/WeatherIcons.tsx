import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { WeatherAtmosphericIconKind } from "./utils";

type IconProps = {
  size?: number;
  animated?: boolean;
  className?: string;
  intensity?: number;
};

const SunIcon = ({ size = 100, animated }: IconProps) => (
  <motion.div
    style={{
      width: size,
      height: size,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {/* Sun Core */}
    <motion.div
      animate={animated ? {
        scale: [1, 1.1, 1],
        opacity: [0.8, 1, 0.8],
      } : {}}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{
        width: "50%",
        height: "50%",
        borderRadius: "50%",
        background: "radial-gradient(circle, #FFF7C2 0%, #FFD700 50%, #FF8C00 100%)",
        boxShadow: "0 0 40px #FFD700, 0 0 80px #FF8C00",
      }}
    />
    {/* Sun Rays */}
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        animate={animated ? {
          rotate: [i * 45, i * 45 + 360],
          opacity: [0.3, 0.6, 0.3],
        } : { rotate: i * 45 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: "100%",
          height: "2px",
          background: "linear-gradient(90deg, transparent 60%, #FFD700 80%, transparent 100%)",
        }}
      />
    ))}
  </motion.div>
);

const MoonIcon = ({ size = 100, animated }: IconProps) => (
  <motion.div
    style={{
      width: size,
      height: size,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <motion.div
      animate={animated ? {
        rotate: [-5, 5, -5],
      } : {}}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      style={{
        width: "60%",
        height: "60%",
        borderRadius: "50%",
        background: "#E2E8F0",
        boxShadow: "inset -10px -10px 20px rgba(0,0,0,0.2), 0 0 30px rgba(148,163,184,0.4)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-10%",
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background: "#020617",
      }} />
    </motion.div>
    {/* Stars */}
    {Array.from({ length: 4 }).map((_, i) => (
      <motion.div
        key={i}
        animate={animated ? {
          opacity: [0.2, 1, 0.2],
          scale: [0.8, 1.2, 0.8],
        } : {}}
        transition={{ duration: 2 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
        style={{
          position: "absolute",
          width: 2,
          height: 2,
          background: "white",
          borderRadius: "50%",
          top: `${20 + i * 20}%`,
          left: `${10 + i * 25}%`,
          boxShadow: "0 0 4px white",
        }}
      />
    ))}
  </motion.div>
);

const CloudIcon = ({ size = 100, animated, color = "rgba(255,255,255,0.8)" }: IconProps & { color?: string }) => (
  <motion.div
    animate={animated ? {
      y: [0, -5, 0],
    } : {}}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    style={{
      width: size,
      height: size * 0.6,
      position: "relative",
    }}
  >
    <div style={{
      position: "absolute",
      bottom: "10%",
      left: "10%",
      width: "40%",
      height: "60%",
      borderRadius: "50%",
      background: color,
      filter: "blur(4px)",
    }} />
    <div style={{
      position: "absolute",
      bottom: "20%",
      left: "30%",
      width: "50%",
      height: "70%",
      borderRadius: "50%",
      background: color,
      filter: "blur(4px)",
    }} />
    <div style={{
      position: "absolute",
      bottom: "10%",
      right: "10%",
      width: "40%",
      height: "60%",
      borderRadius: "50%",
      background: color,
      filter: "blur(4px)",
    }} />
    <div style={{
      position: "absolute",
      bottom: "10%",
      left: "20%",
      width: "60%",
      height: "40%",
      borderRadius: "20px",
      background: color,
      filter: "blur(4px)",
    }} />
  </motion.div>
);

const RainIcon = ({ size = 100, animated, intensity = 1 }: IconProps) => (
  <div style={{ width: size, height: size, position: "relative", overflow: "hidden" }}>
    {Array.from({ length: Math.round(10 * intensity) }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: -20, x: Math.random() * size }}
        animate={animated ? {
          y: size + 20,
        } : {}}
        transition={{
          duration: 0.5 + Math.random() * 0.5,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 2,
        }}
        style={{
          position: "absolute",
          width: 1,
          height: 15,
          background: "linear-gradient(to bottom, transparent, #60A5FA)",
          opacity: 0.6,
        }}
      />
    ))}
  </div>
);

const SnowIcon = ({ size = 100, animated, intensity = 1 }: IconProps) => (
  <div style={{ width: size, height: size, position: "relative", overflow: "hidden" }}>
    {Array.from({ length: Math.round(15 * intensity) }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: -10, x: Math.random() * size }}
        animate={animated ? {
          y: size + 10,
          x: (Math.random() * size) + (Math.sin(i) * 20),
        } : {}}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 2,
        }}
        style={{
          position: "absolute",
          width: 4,
          height: 4,
          background: "white",
          borderRadius: "50%",
          opacity: 0.8,
          filter: "blur(1px)",
        }}
      />
    ))}
  </div>
);

const BoltIcon = ({ size = 100, animated }: IconProps) => (
  <motion.div
    animate={animated ? {
      opacity: [0, 1, 0, 1, 0],
    } : {}}
    transition={{
      duration: 0.2,
      repeat: Infinity,
      repeatDelay: 3,
    }}
    style={{
      position: "absolute",
      width: size * 0.4,
      height: size * 0.6,
      top: "40%",
      left: "30%",
    }}
  >
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </motion.div>
);

const WindIcon = ({ size = 100, animated }: IconProps) => (
  <div style={{ width: size, height: size, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
    {Array.from({ length: 3 }).map((_, i) => (
      <motion.div
        key={i}
        animate={animated ? {
          x: [-20, 20, -20],
          opacity: [0, 0.5, 0],
        } : {}}
        transition={{
          duration: 3 + i,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.5,
        }}
        style={{
          position: "absolute",
          width: "80%",
          height: 2,
          background: "rgba(255,255,255,0.3)",
          borderRadius: 1,
          top: `${30 + i * 20}%`,
        }}
      />
    ))}
  </div>
);

export const WeatherAtmosphericIcon = ({
  kind,
  size = 180,
  animated = true,
  intensity = 1,
  className,
}: IconProps & { kind: WeatherAtmosphericIconKind }) => {
  const content = useMemo(() => {
    switch (kind) {
      case "clearDay":
        return <SunIcon size={size} animated={animated} />;
      case "clearNight":
        return <MoonIcon size={size} animated={animated} />;
      case "cloudy":
        return <CloudIcon size={size} animated={animated} color="rgba(203,213,225,0.8)" />;
      case "partlyCloudyDay":
        return (
          <div style={{ position: "relative", width: size, height: size }}>
            <div style={{ position: "absolute", top: 0, right: 0 }}><SunIcon size={size * 0.6} animated={animated} /></div>
            <div style={{ position: "absolute", bottom: 0, left: 0 }}><CloudIcon size={size * 0.8} animated={animated} /></div>
          </div>
        );
      case "partlyCloudyNight":
        return (
          <div style={{ position: "relative", width: size, height: size }}>
            <div style={{ position: "absolute", top: 0, right: 0 }}><MoonIcon size={size * 0.6} animated={animated} /></div>
            <div style={{ position: "absolute", bottom: 0, left: 0 }}><CloudIcon size={size * 0.8} animated={animated} /></div>
          </div>
        );
      case "rain":
        return (
          <div style={{ position: "relative", width: size, height: size }}>
            <div style={{ position: "absolute", top: 0, left: "10%" }}><CloudIcon size={size * 0.9} animated={animated} color="rgba(148,163,184,0.9)" /></div>
            <div style={{ position: "absolute", bottom: 0, left: 0 }}><RainIcon size={size} animated={animated} intensity={intensity} /></div>
          </div>
        );
      case "storm":
        return (
          <div style={{ position: "relative", width: size, height: size }}>
            <div style={{ position: "absolute", top: 0, left: "10%" }}><CloudIcon size={size * 0.9} animated={animated} color="rgba(71,85,105,1)" /></div>
            <BoltIcon size={size} animated={animated} />
            <div style={{ position: "absolute", bottom: 0, left: 0 }}><RainIcon size={size} animated={animated} intensity={intensity * 1.5} /></div>
          </div>
        );
      case "snow":
        return (
          <div style={{ position: "relative", width: size, height: size }}>
            <div style={{ position: "absolute", top: 0, left: "10%" }}><CloudIcon size={size * 0.9} animated={animated} color="rgba(241,245,249,0.9)" /></div>
            <div style={{ position: "absolute", bottom: 0, left: 0 }}><SnowIcon size={size} animated={animated} intensity={intensity} /></div>
          </div>
        );
      case "fog":
        return (
          <div style={{ position: "relative", width: size, height: size, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <CloudIcon size={size * 0.8} animated={animated} color="rgba(203,213,225,0.6)" />
            <motion.div
              animate={animated ? { x: [-10, 10, -10] } : {}}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "80%", height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, marginTop: 4 }}
            />
            <motion.div
              animate={animated ? { x: [10, -10, 10] } : {}}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "60%", height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, marginTop: 4 }}
            />
          </div>
        );
      case "windyDay":
        return (
          <div style={{ position: "relative", width: size, height: size }}>
            <div style={{ position: "absolute", top: 0, right: 0 }}><SunIcon size={size * 0.6} animated={animated} /></div>
            <div style={{ position: "absolute", bottom: 0, left: 0 }}><WindIcon size={size} animated={animated} /></div>
          </div>
        );
      case "windyNight":
        return (
          <div style={{ position: "relative", width: size, height: size }}>
            <div style={{ position: "absolute", top: 0, right: 0 }}><MoonIcon size={size * 0.6} animated={animated} /></div>
            <div style={{ position: "absolute", bottom: 0, left: 0 }}><WindIcon size={size} animated={animated} /></div>
          </div>
        );
      case "rainWind":
        return (
          <div style={{ position: "relative", width: size, height: size }}>
            <div style={{ position: "absolute", top: 0, left: "10%" }}><CloudIcon size={size * 0.9} animated={animated} color="rgba(148,163,184,0.9)" /></div>
            <WindIcon size={size} animated={animated} />
            <div style={{ position: "absolute", bottom: 0, left: 0 }}><RainIcon size={size} animated={animated} intensity={intensity} /></div>
          </div>
        );
      case "stormWind":
        return (
          <div style={{ position: "relative", width: size, height: size }}>
            <div style={{ position: "absolute", top: 0, left: "10%" }}><CloudIcon size={size * 0.9} animated={animated} color="rgba(71,85,105,1)" /></div>
            <BoltIcon size={size} animated={animated} />
            <WindIcon size={size} animated={animated} />
            <div style={{ position: "absolute", bottom: 0, left: 0 }}><RainIcon size={size} animated={animated} intensity={intensity * 1.5} /></div>
          </div>
        );
      default:
        return <CloudIcon size={size} animated={animated} />;
    }
  }, [kind, size, animated, intensity]);

  return (
    <div className={className} style={{ width: size, height: size }}>
      {content}
    </div>
  );
};
