import { useState, useEffect } from 'react';
import { getSettings } from '../utils/api';

export default function Countdown() {
  const [targetDate, setTargetDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch event date from Supabase
  useEffect(() => {
    const fetchDate = async () => {
      try {
        const res = await getSettings();
        if (res.data && res.data.event_date && res.data.event_time) {
          const dateStr = res.data.event_date; // "2026-06-21"
          const timeStr = res.data.event_time; // "18:00:00"
          const dateObj = new Date(`${dateStr}T${timeStr}`);
          setTargetDate(dateObj);
        } else {
          // Default fallback
          const defaultDate = new Date('2026-06-21T18:00:00');
          setTargetDate(defaultDate);
        }
      } catch (error) {
        console.error('Error fetching event date:', error);
        const defaultDate = new Date('2026-06-21T18:00:00');
        setTargetDate(defaultDate);
      } finally {
        setLoading(false);
      }
    };
    fetchDate();
  }, []);

  // Update countdown every second
  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, targetDate - now);
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="text-rose-400 font-poppins text-sm">Loading countdown...</div>
      </div>
    );
  }

  const items = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <section className="py-12 sm:py-16 px-4 bg-gradient-to-b from-[#fdf6f0] to-[#fce4ec]">
      <div className="max-w-3xl mx-auto text-center">
        {/* Instagram-style header */}
        <div className="mb-6">
          <span className="inline-block text-xs font-cinzel text-[#d4a5a5]/60 tracking-[0.3em] uppercase mb-2">
            Countdown
          </span>
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl text-[#2d1b1b] font-semibold">
            The Big Day Is Coming
          </h2>
        </div>

        {/* Countdown numbers – Instagram style (clean, spaced) */}
        <div className="flex justify-center items-center gap-3 sm:gap-6">
          {items.map((item, index) => (
            <div key={index} className="text-center">
              <div className="bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl px-3 py-2 sm:px-5 sm:py-3 min-w-[60px] sm:min-w-[80px] shadow-lg">
                <span className="font-playfair text-2xl sm:text-4xl md:text-5xl font-bold text-[#2d1b1b]">
                  {String(item.value).padStart(2, '0')}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-poppins text-[#d4a5a5]/70 mt-1.5 tracking-wider uppercase">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Optional note */}
        <p className="mt-6 text-sm text-[#d4a5a5]/60 font-poppins">
          ✨ {timeLeft.days} days, {timeLeft.hours} hours, {timeLeft.minutes} minutes remaining
        </p>
      </div>
    </section>
  );
}