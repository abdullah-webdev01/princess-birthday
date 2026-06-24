import { useEffect, useRef, useState } from 'react';
import { getStoryPhotos, getSettings } from '../utils/api';

export default function Story() {
  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState('Dear Our Little Princess');
  const [subtitle, setSubtitle] = useState('One year ago, you changed our world forever');
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  // Predefined aspect ratios for each slot (index 0-6)
  const aspectRatios = [
    'aspect-[4/5]',   // slot 1: portrait
    'aspect-[4/3]',   // slot 2: landscape
    'aspect-square',  // slot 3: square
    'aspect-[4/3]',   // slot 4: landscape
    'aspect-[4/5]',   // slot 5: portrait
    'aspect-square',  // slot 6: square
    'aspect-[4/3]',   // slot 7: wide (span=2)
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [photosRes, settingsRes] = await Promise.all([
          getStoryPhotos(),
          getSettings()
        ]);
        setPhotos(photosRes.data || []);
        if (settingsRes.data) {
          setTitle(settingsRes.data.story_title || 'Dear Our Little Princess');
          setSubtitle(settingsRes.data.story_text || 'One year ago, you changed our world forever');
        }
      } catch (error) {
        console.error('Error fetching story data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up');
          }
        });
      },
      { threshold: 0.2 }
    );
    const elements = sectionRef.current?.querySelectorAll('.story-item');
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [photos]);

  if (loading) {
    return <div className="py-20 text-center text-rose-400 font-poppins animate-pulse">Loading story...</div>;
  }

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 px-4 bg-gradient-to-b from-[#fdf6f0] via-[#fce4ec] to-[#fdf6f0]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl text-[#d4a5a5] font-bold tracking-wide">
            {title}
          </h2>
          <p className="font-playfair text-xl sm:text-2xl md:text-3xl text-[#2d1b1b] font-semibold mt-2">
            {subtitle}
          </p>
          <p className="font-poppins text-sm sm:text-base text-[#d4a5a5]/80 max-w-2xl mx-auto mt-3 leading-relaxed">
            Every smile, every laugh, every tiny step has made our lives more beautiful. We love you endlessly.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 auto-rows-auto">
          {photos.map((photo, index) => {
            // Determine span: slot 7 (index 6) is wide (2 columns), others normal (1 column)
            const span = index === 6 ? 2 : 1;
            const spanClass = span === 2 ? 'col-span-2 md:col-span-3' : 'col-span-1';
            // Use predefined aspect ratio for this index (fallback to aspect-[4/5] if out of range)
            const aspectClass = aspectRatios[index] || 'aspect-[4/5]';
            return (
              <div
                key={photo.id}
                className={`story-item opacity-0 ${spanClass} row-span-1 ${aspectClass} overflow-hidden rounded-2xl shadow-lg border border-white/30 bg-white/10 backdrop-blur-sm p-1.5 transition-transform duration-300 hover:scale-[1.03] hover:shadow-2xl`}
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption || 'Story'}
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <p className="font-cinzel text-xs sm:text-sm text-[#d4a5a5]/60 tracking-[0.2em] uppercase">
            A journey of love, laughter & little feet
          </p>
        </div>
      </div>
    </section>
  );
}