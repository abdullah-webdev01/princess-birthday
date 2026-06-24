import { useState, useEffect, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  getSettings, updateSettings,
  getAdminWishes, approveWish, deleteWish,
  getPhotos, approvePhoto, deletePhoto,
  toggleMemoryMode,
  getVideoCommentsAdmin, approveVideoComment, deleteVideoCommentAdmin,
  uploadHeroImage, uploadStoryPhoto, getAdminStoryPhotos, deleteStoryPhoto, reorderStoryPhotos,
  uploadVideo
} from '../utils/api';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('media');
  const [settings, setSettings] = useState({});
  const [wishes, setWishes] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videoComments, setVideoComments] = useState([]);
  const [storyPhotos, setStoryPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropFile, setCropFile] = useState(null);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', x: 0, y: 0, width: 80, height: 80, aspect: 4 / 5 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [cropSpan, setCropSpan] = useState(1);
  const [uploadTargetIndex, setUploadTargetIndex] = useState(null);
  const [replacingPhotoId, setReplacingPhotoId] = useState(null);
  const imgRef = useRef(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [settingsRes, wishesRes, photosRes, videoCommentsRes, storyRes] = await Promise.all([
          getSettings(),
          getAdminWishes(),
          getPhotos(false),
          getVideoCommentsAdmin(),
          getAdminStoryPhotos()
        ]);
        setSettings(settingsRes.data || {});
        setWishes(wishesRes.data || []);
        setPhotos(photosRes.data || []);
        setVideoComments(videoCommentsRes.data || []);
        setStoryPhotos(storyRes.data || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isLoggedIn]);

  const saveSettings = async (updated) => {
    setSaving(true);
    try {
      await updateSettings(updated);
      setSettings(prev => ({ ...prev, ...updated }));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveWish = async (id) => {
    try {
      await approveWish(id);
      setWishes(prev => prev.map(w => w.id === id ? { ...w, approved: true } : w));
    } catch (error) { console.error(error); }
  };
  const handleDeleteWish = async (id) => {
    if (!confirm('Delete this wish?')) return;
    try {
      await deleteWish(id);
      setWishes(prev => prev.filter(w => w.id !== id));
    } catch (error) { console.error(error); }
  };

  const handleApprovePhoto = async (id) => {
    try {
      await approvePhoto(id);
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, approved: true } : p));
    } catch (error) { console.error(error); }
  };
  const handleDeletePhoto = async (id) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await deletePhoto(id);
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch (error) { console.error(error); }
  };

  const handleApproveVideoComment = async (id) => {
    try {
      await approveVideoComment(id);
      setVideoComments(prev => prev.map(c => c.id === id ? { ...c, approved: true } : c));
    } catch (error) {
      console.error('Approve error:', error);
      alert('Failed to approve comment');
    }
  };
  const handleDeleteVideoComment = async (id) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteVideoCommentAdmin(id);
      setVideoComments(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete comment');
    }
  };

  const toggleMemory = async () => {
    const newVal = !settings.memory_gallery_enabled;
    try {
      await toggleMemoryMode(newVal);
      setSettings(prev => ({ ...prev, memory_gallery_enabled: newVal }));
      alert('Memory Gallery ' + (newVal ? 'Enabled' : 'Disabled'));
      window.location.reload();
    } catch (error) {
      console.error('Toggle error:', error);
      alert('Failed to toggle');
    }
  };

  // ---- Story Photo Management ----
  const openCropForSlot = (index, existingPhotoId = null) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setCropFile(file);
        setCropImage(reader.result);
        setUploadTargetIndex(index);
        setReplacingPhotoId(existingPhotoId);
        const span = index === 6 ? 2 : 1;
        setCropSpan(span);
        setCrop({ unit: '%', x: 0, y: 0, width: 80, height: 80, aspect: span === 2 ? 4 / 3 : 4 / 5 });
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleCropSave = async () => {
    if (!completedCrop || !imgRef.current) return;
    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const c = completedCrop;
    canvas.width = c.width * scaleX;
    canvas.height = c.height * scaleY;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      c.x * scaleX,
      c.y * scaleY,
      c.width * scaleX,
      c.height * scaleY,
      0,
      0,
      c.width * scaleX,
      c.height * scaleY
    );
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('file', blob, cropFile.name);
      formData.append('caption', '');
      formData.append('span', cropSpan.toString());
      try {
        if (replacingPhotoId) {
          await deleteStoryPhoto(replacingPhotoId);
          setStoryPhotos(prev => prev.filter(p => p.id !== replacingPhotoId));
        }
        const res = await uploadStoryPhoto(formData);
        const newPhoto = res.data.photo;
        const updatedPhotos = [...storyPhotos];
        updatedPhotos.splice(uploadTargetIndex, 0, newPhoto);
        setStoryPhotos(updatedPhotos);
        const orderIds = updatedPhotos.map(p => p.id);
        reorderStoryPhotos(orderIds).catch(err => console.error('Reorder error:', err));
        alert('Photo uploaded successfully!');
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed');
      }
      setCropModalOpen(false);
      setCropImage(null);
      setCropFile(null);
      setReplacingPhotoId(null);
      setUploadTargetIndex(null);
    }, 'image/jpeg');
  };

  const handleDeleteStory = async (id) => {
    if (!confirm('Delete this story photo?')) return;
    try {
      await deleteStoryPhoto(id);
      setStoryPhotos(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    }
  };

  const movePhoto = (index, direction) => {
    const newPhotos = [...storyPhotos];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newPhotos.length) return;
    [newPhotos[index], newPhotos[targetIndex]] = [newPhotos[targetIndex], newPhotos[index]];
    setStoryPhotos(newPhotos);
    const orderIds = newPhotos.map(p => p.id);
    reorderStoryPhotos(orderIds).catch(err => console.error('Reorder error:', err));
  };

  // Hero upload
  const handleHeroUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await uploadHeroImage(formData);
      setSettings(prev => ({ ...prev, hero_image_url: res.data.url }));
      alert('Hero image uploaded!');
    } catch (error) {
      console.error('Hero upload error:', error);
      alert('Upload failed');
    }
  };

  // Video upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await uploadVideo(formData);
      setSettings(prev => ({ ...prev, video_url: res.data.url }));
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Video upload error:', error);
      alert('Upload failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5ede4] to-[#fce8e0] p-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/30">
          <h1 className="text-3xl font-playfair text-rose-600 text-center mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-poppins text-[#2d1b1b]/70 mb-1">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 border border-rose/20 focus:outline-none focus:ring-2 focus:ring-rose/30" placeholder="admin" />
            </div>
            <div>
              <label className="block text-sm font-poppins text-[#2d1b1b]/70 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 border border-rose/20 focus:outline-none focus:ring-2 focus:ring-rose/30" placeholder="••••••••" />
            </div>
            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-rose to-gold text-white font-semibold hover:shadow-lg transition hover:scale-105">Login</button>
          </form>
          <p className="text-center text-xs text-[#d4a5a5]/60 mt-4">Default: admin / admin123</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-cream"><p className="text-rose-400 font-poppins animate-pulse">Loading admin panel...</p></div>;
  }

  const tabs = [
    { id: 'media', label: '📷 Media Settings' },
    { id: 'wishes', label: '💬 Wishes' },
    { id: 'videoComments', label: '🎬 Video Comments' },
    { id: 'gallery', label: '🖼️ Memory Gallery' },
    { id: 'event', label: '⏰ Event Settings' },
  ];

  const totalSlots = 7;
  const storySlots = Array.from({ length: totalSlots }, (_, i) => storyPhotos[i] || null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5ede4] via-[#fdf6f0] to-[#fce8e0] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-playfair text-rose-600">Admin Portal</h1>
          <button onClick={() => setIsLoggedIn(false)} className="px-4 py-2 rounded-full bg-rose-200/50 text-rose-600 text-sm hover:bg-rose-300/50 transition">Logout</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-rose-100/30 pb-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-full transition-all duration-200 text-sm font-poppins ${activeTab === tab.id ? 'bg-gradient-to-r from-rose to-gold text-white shadow-lg' : 'bg-white/30 text-[#2d1b1b]/70 hover:bg-white/50'}`}>{tab.label}</button>
          ))}
        </div>

        <div className="bg-white/40 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/30">
          {activeTab === 'media' && (
            <div className="space-y-10">
              <h2 className="text-2xl font-playfair text-[#2d1b1b]">Media Settings</h2>
              
              {/* HERO IMAGE */}
              <div className="border-b border-rose-100/30 pb-8">
                <h3 className="text-xl font-playfair text-rose-600 mb-4">Hero Image</h3>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1">
                    <label className="block text-sm font-poppins text-[#2d1b1b]/70 mb-1">Upload Hero Image (square recommended)</label>
                    <input type="file" accept="image/*" onChange={handleHeroUpload} className="w-full p-3 rounded-xl bg-white/50 border border-rose/20 text-sm" />
                    <p className="text-xs text-rose-400/60 mt-1">Image will be cropped to a square (1:1) to fit the oval frame.</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-40 rounded-full overflow-hidden shadow-lg border-2 border-gold-300 bg-white/10 p-1">
                      {settings.hero_image_url ? (
                        <img src={settings.hero_image_url} alt="Hero" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-rose-300 text-xs bg-rose-50/20">No image</div>
                      )}
                    </div>
                    <p className="text-center text-xs text-[#d4a5a5]/70 mt-1">Preview</p>
                  </div>
                </div>
                {settings.hero_image_url && <p className="text-sm text-green-600 mt-2">✅ Image uploaded</p>}
              </div>

              {/* STORY PHOTOS */}
              <div className="border-b border-rose-100/30 pb-8">
                <h3 className="text-xl font-playfair text-rose-600 mb-4">Story Photos (Click any slot to upload)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-auto">
                  {storySlots.map((photo, idx) => {
                    const isWide = idx === 6;
                    const spanClass = isWide ? 'col-span-2 md:col-span-3' : 'col-span-1';
                    const aspectClass = isWide ? 'aspect-[4/3]' : 'aspect-[4/5]';
                    return (
                      <div
                        key={idx}
                        className={`${spanClass} ${aspectClass} relative group bg-white/20 rounded-xl border-2 border-dashed border-rose-300/40 hover:border-rose-500 transition-all duration-200 cursor-pointer overflow-hidden`}
                        onClick={() => photo ? (confirm('Replace? OK=Replace, Cancel=Delete') ? openCropForSlot(idx, photo.id) : handleDeleteStory(photo.id)) : openCropForSlot(idx)}
                      >
                        {photo ? (
                          <>
                            <img src={photo.image_url} alt={photo.caption || `Story ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-sm font-poppins bg-black/50 px-3 py-1 rounded-full">Tap to replace/delete</span>
                            </div>
                            <div className="absolute top-1 right-1 flex gap-1 z-10">
                              <button onClick={(e) => { e.stopPropagation(); movePhoto(idx, -1); }} className="bg-white/80 text-[#2d1b1b] rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-white">↑</button>
                              <button onClick={(e) => { e.stopPropagation(); movePhoto(idx, 1); }} className="bg-white/80 text-[#2d1b1b] rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-white">↓</button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteStory(photo.id); }} className="bg-red-500/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                            </div>
                            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">{idx + 1}</div>
                            {isWide && <div className="absolute bottom-1 right-1 bg-rose-500/70 text-white text-xs px-2 py-0.5 rounded">Wide</div>}
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-rose-300/70">
                            <span className="text-4xl">+</span>
                            <span className="text-xs mt-1">Click to upload</span>
                            {isWide && <span className="text-[10px] text-rose-400/60">(Wide)</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-[#d4a5a5]/60 mt-3">Click any slot to upload. Use ↑↓ to reorder. Slot 7 is wide (2 columns).</p>
              </div>

              {/* VIDEO */}
              <div>
                <h3 className="text-xl font-playfair text-rose-600 mb-4">Video</h3>
                <div>
                  <label className="block text-sm font-poppins text-[#2d1b1b]/70 mb-1">Upload Video (MP4, WebM, OGG, MOV)</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploading}
                      className="flex-1 p-3 rounded-xl bg-white/50 border border-rose/20 text-sm"
                    />
                    <button
                      onClick={() => {
                        // trigger file input manually
                        const input = document.querySelector('input[type="file"][accept="video/*"]');
                        if (input) input.click();
                      }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose to-gold text-white font-semibold hover:shadow-lg transition hover:scale-105 disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : '📤 Upload Video'}
                    </button>
                  </div>
                  {settings.video_url && (
                    <div className="mt-4 max-w-md">
                      <p className="text-sm text-green-600 mb-2">✅ Video uploaded</p>
                      <video src={settings.video_url} className="w-full rounded-xl shadow-lg" controls />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wishes' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-playfair text-[#2d1b1b]">Wishes Management</h2>
              <div>
                <label className="block text-sm font-poppins text-[#2d1b1b]/70 mb-1">Wishes Heading</label>
                <input type="text" value={settings.wishes_heading || ''} onChange={e => setSettings({ ...settings, wishes_heading: e.target.value })} className="w-full p-3 rounded-xl bg-white/50 border border-rose/20" />
              </div>
              <button onClick={() => saveSettings({ wishes_heading: settings.wishes_heading })} disabled={saving} className="mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-rose to-gold text-white font-semibold hover:shadow-lg transition hover:scale-105 disabled:opacity-50">{saving ? 'Saving...' : 'Save Heading'}</button>
              <div className="space-y-3">
                {wishes.length === 0 ? <p className="text-[#d4a5a5]/60">No wishes yet.</p> : wishes.map(w => (
                  <div key={w.id} className={`p-4 rounded-xl ${w.approved ? 'bg-green-50/70' : 'bg-rose-50/70'} border border-white/50 flex flex-wrap items-center justify-between gap-3`}>
                    <div className="flex-1">
                      <p className="font-semibold text-rose-600">{w.guest_name}</p>
                      <p className="text-sm text-[#2d1b1b]/80">{w.message}</p>
                      <p className="text-xs text-[#d4a5a5]/60">{new Date(w.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {!w.approved && <button onClick={() => handleApproveWish(w.id)} className="px-3 py-1 rounded-full bg-green-400/80 text-white text-xs hover:bg-green-500 transition">Approve</button>}
                      <button onClick={() => handleDeleteWish(w.id)} className="px-3 py-1 rounded-full bg-red-400/80 text-white text-xs hover:bg-red-500 transition">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'videoComments' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-playfair text-[#2d1b1b]">Video Comments</h2>
              <div className="space-y-3">
                {videoComments.length === 0 ? <p className="text-[#d4a5a5]/60">No comments yet.</p> : videoComments.map(c => (
                  <div key={c.id} className={`p-4 rounded-xl ${c.approved ? 'bg-green-50/70' : 'bg-rose-50/70'} border border-white/50 flex flex-wrap items-center justify-between gap-3`}>
                    <div className="flex-1">
                      <p className="font-semibold text-rose-600">{c.guest_name}</p>
                      <p className="text-sm text-[#2d1b1b]/80">{c.comment}</p>
                      <p className="text-xs text-[#d4a5a5]/60">{new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {!c.approved && <button onClick={() => handleApproveVideoComment(c.id)} className="px-3 py-1 rounded-full bg-green-400/80 text-white text-xs hover:bg-green-500 transition">Approve</button>}
                      <button onClick={() => handleDeleteVideoComment(c.id)} className="px-3 py-1 rounded-full bg-red-400/80 text-white text-xs hover:bg-red-500 transition">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-playfair text-[#2d1b1b]">Memory Gallery</h2>
              <div className="flex items-center justify-between p-4 bg-white/30 rounded-xl">
                <span className="font-poppins text-[#2d1b1b]">Gallery Status</span>
                <button onClick={toggleMemory} className={`px-4 py-2 rounded-full text-white text-sm font-semibold transition-all ${settings.memory_gallery_enabled ? 'bg-green-500' : 'bg-gray-400'}`}>
                  {settings.memory_gallery_enabled ? '✅ Enabled' : '❌ Disabled'}
                </button>
              </div>
              <div className="space-y-3">
                <h3 className="font-playfair text-xl text-[#2d1b1b]">Pending Photos</h3>
                {photos.filter(p => !p.approved).map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-3 bg-white/30 rounded-xl">
                    <img src={p.image_url} alt={p.caption || 'Photo'} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="text-sm font-poppins">by {p.guest_name || 'Guest'}</p>
                      <p className="text-xs text-[#d4a5a5]/60">{p.caption}</p>
                    </div>
                    <button onClick={() => handleApprovePhoto(p.id)} className="px-3 py-1 rounded-full bg-green-400/80 text-white text-xs hover:bg-green-500 transition">Approve</button>
                    <button onClick={() => handleDeletePhoto(p.id)} className="px-3 py-1 rounded-full bg-red-400/80 text-white text-xs hover:bg-red-500 transition">Delete</button>
                  </div>
                ))}
                {photos.filter(p => !p.approved).length === 0 && <p className="text-center text-[#d4a5a5]/60 py-4">No pending photos</p>}
              </div>
            </div>
          )}

          {activeTab === 'event' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-playfair text-[#2d1b1b]">Event Settings</h2>
              <p className="text-sm text-[#d4a5a5]/80">Set event details. Memory Gallery will auto-enable after event time.</p>
              <div>
                <label className="block text-sm font-poppins text-[#2d1b1b]/70 mb-1">Event Date</label>
                <input type="date" value={settings.event_date || ''} onChange={e => setSettings({ ...settings, event_date: e.target.value })} className="w-full p-3 rounded-xl bg-white/50 border border-rose/20" />
              </div>
              <div>
                <label className="block text-sm font-poppins text-[#2d1b1b]/70 mb-1">Event Time (24-hour)</label>
                <input type="time" value={settings.event_time || ''} onChange={e => setSettings({ ...settings, event_time: e.target.value })} className="w-full p-3 rounded-xl bg-white/50 border border-rose/20" />
              </div>
              <div>
                <label className="block text-sm font-poppins text-[#2d1b1b]/70 mb-1">Venue Name</label>
                <input type="text" value={settings.venue || ''} onChange={e => setSettings({ ...settings, venue: e.target.value })} className="w-full p-3 rounded-xl bg-white/50 border border-rose/20" placeholder="Grand Palace Hall" />
              </div>
              <div>
                <label className="block text-sm font-poppins text-[#2d1b1b]/70 mb-1">Full Address</label>
                <input type="text" value={settings.address || ''} onChange={e => setSettings({ ...settings, address: e.target.value })} className="w-full p-3 rounded-xl bg-white/50 border border-rose/20" placeholder="123, Main Road, City, Country" />
              </div>
              <div>
                <label className="block text-sm font-poppins text-[#2d1b1b]/70 mb-1">Google Maps Coordinates (optional)</label>
                <input type="text" value={settings.coordinates || ''} onChange={e => setSettings({ ...settings, coordinates: e.target.value })} className="w-full p-3 rounded-xl bg-white/50 border border-rose/20" placeholder="31.5204, 74.3587" />
                <p className="text-xs text-[#d4a5a5]/60 mt-1">If coordinates are provided, the location button will use them instead of address.</p>
              </div>
              <button onClick={() => saveSettings({ 
                event_date: settings.event_date, 
                event_time: settings.event_time,
                venue: settings.venue,
                address: settings.address,
                coordinates: settings.coordinates
              })} disabled={saving} className="px-6 py-2 rounded-full bg-gradient-to-r from-rose to-gold text-white font-semibold hover:shadow-lg transition hover:scale-105 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Event Details'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Crop Modal */}
      {cropModalOpen && cropImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-playfair text-[#2d1b1b] mb-4">Crop Photo</h3>
            <ReactCrop crop={crop} onChange={newCrop => setCrop(newCrop)} onComplete={c => setCompletedCrop(c)} aspect={crop.aspect}>
              <img ref={imgRef} src={cropImage} alt="Crop preview" className="w-full" />
            </ReactCrop>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setCropModalOpen(false); setCropImage(null); }} className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition">Cancel</button>
              <button onClick={handleCropSave} className="px-6 py-2 rounded-full bg-gradient-to-r from-rose to-gold text-white font-semibold hover:shadow-lg transition hover:scale-105">Save & Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}