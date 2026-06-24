import { useEffect, useState, useRef } from 'react';
import { getSettings } from '../utils/api';

export default function Layout({ children }) {
  const [music, setMusic] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const audioRef = useRef(null);

  // Music source – pehle local file check karo, agar nahi hai toh fallback
  const getMusicSrc = () => {
    // Agar aap ne public/music mein file daali hai toh uska path daalo
    // const localFile = '/music/bg-music.mp3';
    // temporary fallback – yeh URL kaam karta hai (SoundHelix)
    return '/music/music.mp3';
  };

  useEffect(() => {
    getSettings().then(res => {
      if (res.data?.music_enabled !== undefined) {
        setMusic(res.data.music_enabled);
      }
    }).catch(() => {});
  }, []);

  const handleFirstInteraction = () => {
    if (!userInteracted && music && audioRef.current) {
      audioRef.current.play().catch(err => console.log("Play error:", err));
      setUserInteracted(true);
    }
  };

  const toggleMusic = () => {
    const newState = !music;
    setMusic(newState);
    if (audioRef.current) {
      if (newState) {
        audioRef.current.play().catch(err => console.log("Play error:", err));
      } else {
        audioRef.current.pause();
      }
    }
    if (!userInteracted) setUserInteracted(true);
  };

  useEffect(() => {
    if (userInteracted && music && audioRef.current) {
      audioRef.current.play().catch(err => console.log("Auto-play error:", err));
    }
  }, [userInteracted, music]);

  return (
    <div 
      className="relative min-h-screen overflow-x-hidden"
      onClick={handleFirstInteraction}
      onTouchStart={handleFirstInteraction}
    >
      {/* Particles & Sparkles (same as before) */}
      <div id="particles" className="fixed inset-0 pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="particle w-2 h-2 bg-rose/30 rounded-full" style={{
            left: Math.random() * 100 + '%',
            animationDuration: (Math.random() * 20 + 15) + 's',
            animationDelay: (Math.random() * 10) + 's',
            width: (Math.random() * 6 + 2) + 'px',
            height: (Math.random() * 6 + 2) + 'px',
          }} />
        ))}
      </div>
      <div className="sparkle-container fixed inset-0 pointer-events-none z-1">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="sparkle" style={{
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animationDelay: (Math.random() * 5) + 's',
            width: (Math.random() * 8 + 4) + 'px',
            height: (Math.random() * 8 + 4) + 'px',
          }} />
        ))}
      </div>

      {/* Audio element with working URL */}
      <audio
        ref={audioRef}
        src={getMusicSrc()}
        loop
        preload="auto"
        className="hidden"
      />

      <button
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full glass flex items-center justify-center text-2xl shadow-xl hover:scale-110 transition"
      >
        {music ? '🔊' : '🔇'}
      </button>

      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}