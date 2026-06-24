import { useState, useEffect } from 'react';
import { getWishes, createWish } from '../utils/api';

export default function WishesWall() {
  const [wishes, setWishes] = useState([]);
  const [newWish, setNewWish] = useState({ guest_name: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const fetchWishes = async () => {
    try {
      const res = await getWishes(true);
      if (Array.isArray(res.data)) {
        setWishes(res.data);
      } else {
        setWishes([]);
      }
    } catch (error) {
      console.error('Failed to fetch wishes:', error);
      setWishes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newWish.guest_name.trim() || !newWish.message.trim()) {
      alert('Please enter your name and message');
      return;
    }
    try {
      await createWish(newWish);
      setNewWish({ guest_name: '', message: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      await fetchWishes();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error posting wish');
    }
  };

  if (loading) {
    return (
      <section className="py-20 px-4 bg-[#fdf6f0]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-rose-400 font-poppins">Loading wishes...</p>
        </div>
      </section>
    );
  }

  // Random rotation for each note (between -4 and 4 deg)
  const randomRotation = () => (Math.random() - 0.5) * 8;

  return (
    <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-[#fdf6f0] via-[#fce4ec] to-[#fdf6f0]">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-playfair text-center text-gold mb-12">
          Wishes Wall
        </h2>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6 text-center max-w-md mx-auto">
            🎉 Your wish has been sent successfully! <br />
            <span className="text-sm">It will appear here after admin approval.</span>
          </div>
        )}

        {/* Submit Form – as a paper note style */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative p-6 bg-[#fffdf5] rounded-2xl shadow-2xl border border-white/50 transform rotate-0.5 transition hover:rotate-0 duration-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-rose-300 rounded-full shadow-lg flex items-center justify-center">
              <span className="text-white text-[10px]">✿</span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={newWish.guest_name}
                onChange={(e) => setNewWish({ ...newWish, guest_name: e.target.value })}
                className="w-full p-3 rounded-xl bg-white/80 border border-rose/20 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-rose/30"
                required
              />
              <textarea
                rows="3"
                placeholder="Write your wish for the princess..."
                value={newWish.message}
                onChange={(e) => setNewWish({ ...newWish, message: e.target.value })}
                className="w-full p-3 rounded-xl bg-white/80 border border-rose/20 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-rose/30"
                required
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose to-gold text-white font-semibold text-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Post Wish
              </button>
            </form>
          </div>
        </div>

        {/* Board with Paper Notes */}
        <div className="relative p-4 sm:p-8 rounded-3xl bg-[#e8d5b5] bg-opacity-40 backdrop-blur-sm border border-white/30 shadow-inner">
          {/* Subtle board texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNMzAgMTBhMTAgMTAgMCAwIDAgMCAyMCAxMCAxMCAwIDAgMCAwLTIweiIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] bg-repeat" />

          {/* Notes Grid */}
          <div className="relative z-10 flex flex-wrap justify-center gap-4 sm:gap-6">
            {wishes.length === 0 ? (
              <p className="text-center text-[#d4a5a5]/70 w-full py-10">No wishes yet. Be the first!</p>
            ) : (
              wishes.map((wish) => {
                const rotation = randomRotation();
                return (
                  <div
                    key={wish.id}
                    className="relative group"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    {/* Paper Note */}
                    <div className="w-56 sm:w-64 p-4 bg-[#fffdf5] rounded-lg shadow-xl border border-white/50 hover:shadow-2xl transition-shadow duration-300">
                      {/* Pin (flower style) */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-rose-300 rounded-full shadow-md flex items-center justify-center border border-white/50 z-10 group-hover:scale-110 transition-transform">
                        <span className="text-white text-sm">✿</span>
                      </div>
                      {/* Message */}
                      <div className="mt-2">
                        <p className="font-handwritten text-lg text-[#2d1b1b] leading-relaxed">
                          “{wish.message}”
                        </p>
                        <p className="text-right text-sm font-poppins text-rose-500 mt-2">
                          — {wish.guest_name}
                        </p>
                      </div>
                      {/* Date (optional) */}
                      <p className="text-[10px] text-[#d4a5a5]/40 mt-2 text-right">
                        {new Date(wish.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}