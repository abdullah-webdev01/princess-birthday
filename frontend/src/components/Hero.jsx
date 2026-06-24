import { useState, useEffect } from 'react';
import { getSettings } from '../utils/api';

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [heroImage, setHeroImage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Fetch hero image from settings
  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const res = await getSettings();
        if (res.data && res.data.hero_image_url) {
          setHeroImage(res.data.hero_image_url);
        }
      } catch (error) {
        console.error('Error fetching hero image:', error);
      }
    };
    fetchHeroImage();
  }, []);

  const happyLetters = "HAPPY".split("");
  const birthdayLetters = "BIRTHDAY".split("");

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#fdf6f0] via-[#fce4ec] to-[#fdf6f0] flex flex-col items-center justify-start px-4 pt-4 pb-8">

      {/* ===== BACKGROUND SOFT GLOW ===== */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[60%] rounded-full bg-rose-100/40 blur-2xl" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[50%] rounded-full bg-[#f5d6a8]/30 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] rounded-full bg-white/5 blur-2xl" />
      </div>

      {/* ===== BALLOON CLUSTERS ===== */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute left-1 sm:left-3 md:left-6 top-8 flex flex-col gap-0.5 sm:gap-1">
          {[...Array(6)].map((_, i) => (
            <div key={`left-${i}`} className="flex flex-wrap gap-0.5 sm:gap-1 justify-center">
              {[...Array(i % 3 + 2)].map((_, j) => {
                const colors = ['#f8bbd0', '#fce4ec', '#fdf6f0', '#f5d6a8', '#ffffff'];
                const color = colors[(i + j) % colors.length];
                const size = 16 + (i * 2) + (j * 2);
                return (
                  <div
                    key={`b-${i}-${j}`}
                    className="balloon rounded-full shadow-md"
                    style={{
                      width: `clamp(${size}px, ${size * 0.6}vw, ${size * 1.4}px)`,
                      height: `clamp(${size * 1.2}px, ${size * 0.7}vw, ${size * 1.6}px)`,
                      backgroundColor: color,
                      animationDelay: `${(i + j) * 0.15}s`,
                      transform: `rotate(${(i % 3 - 1) * 8}deg)`,
                      border: `1px solid ${i % 2 === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(245,214,168,0.3)'}`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="absolute right-1 sm:right-3 md:right-6 top-8 flex flex-col gap-0.5 sm:gap-1">
          {[...Array(7)].map((_, i) => (
            <div key={`right-${i}`} className="flex flex-wrap gap-0.5 sm:gap-1 justify-end">
              {[...Array(i % 3 + 2)].map((_, j) => {
                const colors = ['#fce4ec', '#f8bbd0', '#fdf6f0', '#f5d6a8', '#ffffff'];
                const color = colors[(i + j + 1) % colors.length];
                const size = 14 + (i * 2) + (j * 2);
                return (
                  <div
                    key={`br-${i}-${j}`}
                    className="balloon rounded-full shadow-md"
                    style={{
                      width: `clamp(${size}px, ${size * 0.6}vw, ${size * 1.4}px)`,
                      height: `clamp(${size * 1.2}px, ${size * 0.7}vw, ${size * 1.6}px)`,
                      backgroundColor: color,
                      animationDelay: `${(i + j) * 0.12}s`,
                      transform: `rotate(${(i % 3 - 1) * 10}deg)`,
                      border: `1px solid ${i % 2 === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(245,214,168,0.3)'}`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="absolute top-0 left-0 w-full flex justify-center gap-0.5 sm:gap-2 px-4 pointer-events-none">
          {[...Array(8)].map((_, i) => {
            const colors = ['#f8bbd0', '#fce4ec', '#fdf6f0', '#f5d6a8'];
            const color = colors[i % colors.length];
            const size = 18 + (i % 4) * 3;
            return (
              <div
                key={`top-${i}`}
                className="balloon rounded-full shadow-md"
                style={{
                  width: `clamp(${size}px, ${size * 0.6}vw, ${size * 1.5}px)`,
                  height: `clamp(${size * 1.2}px, ${size * 0.7}vw, ${size * 1.8}px)`,
                  backgroundColor: color,
                  animationDelay: `${i * 0.1}s`,
                  transform: `rotate(${(i % 2 === 0 ? 5 : -5)}deg)`,
                  border: `1px solid ${i % 2 === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(245,214,168,0.3)'}`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ===== BANNER ===== */}
      <div className="relative z-10 w-full max-w-3xl mt-2 px-4">
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 w-full">
          {happyLetters.map((letter, index) => (
            <div
              key={`happy-${index}`}
              className={`bunting-flag ${isLoaded ? 'animate-banner-drop' : 'opacity-0'}`}
              style={{
                animationDelay: `${index * 0.08}s, ${3 + index * 0.06}s`,
                background: index % 2 === 0 ? '#f8bbd0' : '#ffffff',
                color: index % 2 === 0 ? '#ffffff' : '#d4a5a5',
                padding: '6px 12px sm:px-6 sm:py-3',
                borderRadius: '4px 4px 12px 12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                fontSize: 'clamp(1.2rem, 6vw, 3.5rem)',
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                border: '1px solid rgba(255,215,0,0.2)',
                transformOrigin: 'top center',
                minWidth: 'clamp(24px, 5vw, 60px)',
                textAlign: 'center',
                display: 'inline-block',
                letterSpacing: '0.08em',
                marginBottom: '4px',
                flex: '1 0 auto',
                maxWidth: 'clamp(30px, 8vw, 80px)',
              }}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 w-full max-w-4xl mt-1 px-4">
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 w-full">
          {birthdayLetters.map((letter, index) => (
            <div
              key={`birthday-${index}`}
              className={`bunting-flag ${isLoaded ? 'animate-banner-drop' : 'opacity-0'}`}
              style={{
                animationDelay: `${(index + 10) * 0.08}s, ${3 + (index + 10) * 0.06}s`,
                background: index % 2 === 0 ? '#f8bbd0' : '#ffffff',
                color: index % 2 === 0 ? '#ffffff' : '#d4a5a5',
                padding: '6px 12px sm:px-6 sm:py-3',
                borderRadius: '4px 4px 12px 12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                fontSize: 'clamp(1rem, 5vw, 3rem)',
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                border: '1px solid rgba(255,215,0,0.2)',
                transformOrigin: 'top center',
                minWidth: 'clamp(20px, 4vw, 50px)',
                textAlign: 'center',
                display: 'inline-block',
                letterSpacing: '0.08em',
                marginBottom: '4px',
                flex: '1 0 auto',
                maxWidth: 'clamp(26px, 7vw, 70px)',
              }}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>

      {/* ===== PHOTO FRAME ===== */}
      <div className={`relative z-10 mt-8 sm:mt-12 md:mt-16 ${isLoaded ? 'animate-frame-in' : 'opacity-0 scale-90'}`} style={{ animationDuration: '0.8s', animationDelay: '0.3s' }}>
        <div className="absolute -inset-4 bg-[#ffb6c1]/60 blur-2xl rounded-full pointer-events-none" />
        <div className="absolute -inset-2 bg-[#ffb6c1]/80 blur-xl rounded-full pointer-events-none" />
        <div className="absolute -inset-1 bg-[#ffc0cb]/90 blur-lg rounded-full pointer-events-none" />

        <div 
          className="relative w-[180px] sm:w-[280px] md:w-[360px] mx-auto aspect-[3/4]"
          style={{
            filter: 'drop-shadow(0 0 40px rgba(255, 182, 193, 0.7))',
          }}
        >
          <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-[3px] border-[#f5d6a8] bg-white/10 p-1.5">
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-b from-rose-50 to-white">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt="Birthday Girl"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-rose-300 text-sm bg-rose-50/20">
                  No image
                </div>
              )}
            </div>
          </div>
          <div className="absolute -inset-1 rounded-full border border-gold/20 blur-sm pointer-events-none" />
        </div>
      </div>

      {/* ===== INVITATION TEXT ===== */}
      <div className={`relative z-10 text-center mt-12 sm:mt-16 md:mt-24 ${isLoaded ? 'animate-fade-up' : 'opacity-0 translate-y-10'}`} style={{ animationDelay: '0.6s' }}>
        <p className="font-cinzel text-sm sm:text-base md:text-xl text-[#d4a5a5]/80 tracking-[0.5em] uppercase font-medium">
          You are invited to
        </p>
      </div>
      <div className={`relative z-10 text-center mt-2 sm:mt-3 ${isLoaded ? 'animate-fade-up' : 'opacity-0 translate-y-10'}`} style={{ animationDelay: '0.8s' }}>
        <p className="font-playfair text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-[#2d1b1b] font-bold leading-tight tracking-wide drop-shadow-sm">
          Meeram Danish's
        </p>
        <p className="font-playfair text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-[#d4a5a5] font-bold leading-tight tracking-wider mt-1 drop-shadow-sm">
          1st Birthday Celebration
        </p>
      </div>

      {/* ===== PINK STARS ===== */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(18)].map((_, i) => {
          const angle = Math.random() * 2 * Math.PI;
          const radius = 30 + Math.random() * 55;
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle) * 0.6;
          const size = 14 + Math.random() * 18;
          const delay = Math.random() * 5;
          const duration = 2 + Math.random() * 3;
          return (
            <div
              key={i}
              className="pink-star"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                fontSize: `${size}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
                color: Math.random() > 0.3 ? '#ffb6c1' : '#f8bbd0',
                textShadow: `0 0 ${10 + Math.random() * 30}px rgba(255, 182, 193, ${0.3 + Math.random() * 0.5})`,
              }}
            >
              ★
            </div>
          );
        })}
      </div>
    </section>
  );
}