import { useEffect, useRef, useState } from 'react';
import { getSettings } from '../utils/api';

export default function CelebrationSection() {
  const [eventData, setEventData] = useState({
    date: 'Loading...',
    time: 'Loading...',
    venue: 'Loading...',
    address: 'Loading...',
    coordinates: '',
  });
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSettings();
        if (res.data) {
          setEventData({
            date: res.data.event_date || '21 June 2026',
            time: res.data.event_time || '6:00 PM',
            venue: res.data.venue || 'Grand Palace Hall',
            address: res.data.address || '123, Main Road, City, Country',
            coordinates: res.data.coordinates || '',
          });
        } else {
          setEventData({
            date: '21 June 2026',
            time: '6:00 PM',
            venue: 'Grand Palace Hall',
            address: '123, Main Road, City, Country',
            coordinates: '',
          });
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setEventData({
          date: '21 June 2026',
          time: '6:00 PM',
          venue: 'Grand Palace Hall',
          address: '123, Main Road, City, Country',
          coordinates: '',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    const timeout = setTimeout(() => setIsVisible(true), 1500);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  const mapLink = eventData.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventData.coordinates)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventData.address)}`;

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-[#fdf6f0] to-[#fce4ec]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-rose-400 font-poppins animate-pulse">Loading event details...</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 px-4 bg-gradient-to-b from-[#fdf6f0] via-[#fce4ec] to-[#fdf6f0]">
      <div className="max-w-4xl mx-auto">
        <div
          className={`text-center mb-6 sm:mb-10 transition-all duration-700 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <span className="inline-block text-xs font-cinzel text-[#d4a5a5]/60 tracking-[0.3em] uppercase mb-2">
            Join Us
          </span>
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl text-[#d4a5a5] font-bold tracking-wide">
            Join Us In Celebrating
          </h2>
          <h3 className="font-playfair text-2xl sm:text-3xl md:text-4xl text-[#2d1b1b] font-semibold mt-1">
            Our Little Princess
          </h3>
        </div>

        <div
          className={`max-w-2xl mx-auto text-center mb-10 sm:mb-14 transition-all duration-700 delay-100 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="font-poppins text-base sm:text-lg text-[#2d1b1b]/80 leading-relaxed">
            With hearts full of love and joy, we warmly invite you to celebrate the First Birthday of our beloved little
            princess.
          </p>
          <p className="font-poppins text-sm sm:text-base text-[#2d1b1b]/70 leading-relaxed mt-4">
            Your presence, blessings, and good wishes will make this day even more memorable for our family.
            <br />
            Come and share this beautiful milestone with us as we celebrate a year filled with laughter, love, and
            precious memories.
          </p>
        </div>

        <div
          className={`transition-all duration-700 delay-200 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="glass p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl border border-white/30 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📅</span>
                <div>
                  <p className="text-xs font-cinzel text-[#d4a5a5] tracking-widest uppercase">Date</p>
                  <p className="font-playfair text-lg text-[#2d1b1b] font-semibold">{eventData.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🕒</span>
                <div>
                  <p className="text-xs font-cinzel text-[#d4a5a5] tracking-widest uppercase">Time</p>
                  <p className="font-playfair text-lg text-[#2d1b1b] font-semibold">{eventData.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">📍</span>
                <div>
                  <p className="text-xs font-cinzel text-[#d4a5a5] tracking-widest uppercase">Venue</p>
                  <p className="font-playfair text-lg text-[#2d1b1b] font-semibold">{eventData.venue}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2">
                <span className="text-3xl mt-1">🏠</span>
                <div>
                  <p className="text-xs font-cinzel text-[#d4a5a5] tracking-widest uppercase">Address</p>
                  <p className="font-poppins text-sm sm:text-base text-[#2d1b1b] leading-relaxed">{eventData.address}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-[#d4a5a5] to-[#f5d6a8] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
              >
                View Location
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}