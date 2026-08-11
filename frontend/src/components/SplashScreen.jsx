import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show splash for 2.5 seconds then fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Navigate after fade animation
      setTimeout(() => {
        navigate("/landing");
      }, 600);
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#00B330] transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Logo Container with Animation */}
      <div className="relative">
        {/* Outer ring pulse */}
        <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />

        {/* Logo Circle */}
        <div className="relative w-28 h-28 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center animate-bounce-in">
          <div className="flex flex-col items-center">
            {/* Main Icon - Interlocking hands/people */}
            <svg
              className="w-14 h-14 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>
      </div>

      {/* Brand Name */}
      <div className="mt-6 text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight animate-slide-up">
          ISDP
        </h1>
        <p className="mt-2 text-sm text-white/70 font-light tracking-[0.15em] animate-slide-up-delay">
          Invisible Skills Discovery Platform
        </p>
      </div>

      {/* Loading Bar */}
      <div className="mt-12 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full w-0 bg-white rounded-full animate-loading-bar" />
      </div>

      {/* Version */}
      <p className="absolute bottom-8 text-xs text-white/40">v1.0.0</p>
    </div>
  );
}