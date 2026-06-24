import { useState, useEffect } from 'react';
import { getSettings, getPhotos, uploadPhoto, likePhoto } from '../utils/api';

export default function MemoryGallery() {
  const [photos, setPhotos] = useState([]);
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [guestName, setGuestName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const settingsRes = await getSettings();
        const enabled = settingsRes.data?.memory_gallery_enabled || false;
        setMemoryEnabled(enabled);

        if (enabled) {
          const photosRes = await getPhotos(true);
          setPhotos(photosRes.data || []);
        } else {
          setPhotos([]);
        }
      } catch (error) {
        console.error('Error fetching gallery data:', error);
        setMemoryEnabled(false);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLike = async (photoId) => {
    try {
      const res = await likePhoto(photoId, 'Guest');
      setPhotos(prev =>
        prev.map(p =>
          p.id === photoId
            ? { ...p, likes: res.data.liked ? (p.likes || 0) + 1 : (p.likes || 0) - 1 }
            : p
        )
      );
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a photo');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('guest_name', guestName || 'Guest');
      formData.append('caption', caption || '');
      await uploadPhoto(formData);
      alert('📸 Photo uploaded successfully! It will appear after admin approval.');
      setFile(null);
      setCaption('');
      setGuestName('');
      const res = await getPhotos(true);
      setPhotos(res.data || []);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 px-4 bg-[#fdf6f0]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-rose-400 font-poppins animate-pulse">Loading memories...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-[#fdf6f0] via-[#fce4ec] to-[#fdf6f0]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-playfair text-4xl sm:text-5xl text-[#d4a5a5] font-bold tracking-wide">
            Memory Gallery
          </h2>
          <p className="font-poppins text-sm text-[#d4a5a5]/70 mt-2">
            Cherished moments from the celebration
          </p>
        </div>

        {!memoryEnabled ? (
          <div className="glass p-8 rounded-3xl text-center max-w-2xl mx-auto">
            <p className="text-5xl mb-4">📸</p>
            <p className="text-xl font-playfair text-[#2d1b1b]">
              Memory Gallery will be available after the event.
            </p>
            <p className="text-sm text-[#d4a5a5]/70 mt-2">
              Guests will be able to upload and share their precious moments here once the celebration begins.
            </p>
          </div>
        ) : (
          <>
            <div className="glass p-6 sm:p-8 rounded-3xl max-w-2xl mx-auto mb-12">
              <h3 className="text-xl font-playfair text-[#2d1b1b] mb-4">Share Your Memory</h3>
              <form onSubmit={handleUpload} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/50 border border-rose/20 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-rose/30"
                />
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/50 border border-rose/20 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-rose/30"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full p-3 rounded-xl bg-white/50 border border-rose/20 text-sm font-poppins file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose file:text-white hover:file:bg-rose/80"
                  required
                />
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose to-gold text-white font-semibold text-sm hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : '📤 Upload Memory'}
                </button>
              </form>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[#d4a5a5]/60 font-poppins">No memories uploaded yet. Be the first to share!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="glass p-2 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                    <div className="relative overflow-hidden rounded-xl aspect-square">
                      <img
                        src={photo.image_url}
                        alt={photo.caption || 'Memory'}
                        className="w-full h-full object-contain bg-[#fdf6f0]" // <-- Changed to object-contain
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3">
                      {photo.caption && (
                        <p className="text-sm font-poppins text-[#2d1b1b]/80 line-clamp-2">{photo.caption}</p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-poppins text-[#d4a5a5]/60">
                          by {photo.guest_name || 'Guest'}
                        </span>
                        <button
                          onClick={() => handleLike(photo.id)}
                          className="flex items-center gap-1 text-sm transition-all duration-200 hover:scale-110 text-[#d4a5a5] hover:text-rose-500"
                        >
                          <span>❤️</span>
                          <span className="text-xs">{photo.likes || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}