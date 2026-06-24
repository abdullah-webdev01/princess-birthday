import axios from 'axios';
<<<<<<< HEAD

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

=======
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
>>>>>>> 48258ebafe639ba1a561a50b805a1f01c1330c8d
const api = axios.create({ baseURL: API_URL });

// ===== PUBLIC =====
export const getSettings = () => api.get('/settings');

export const getWishes = (approved = true) => api.get(`/wishes?approved=${approved}`);
export const createWish = (data) => api.post('/wishes', data);

export const getPhotos = (approvedOnly = true) => api.get(`/photos?approved_only=${approvedOnly}`);
export const uploadPhoto = (formData) => api.post('/photos/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const likePhoto = (photoId, guestName) => api.post(`/photos/${photoId}/like`, { guest_name: guestName });

export const getVideoLikes = () => api.get('/video/likes');
export const likeVideo = () => api.post('/video/like');
export const getVideoComments = (approved = true) => api.get(`/video/comments?approved=${approved}`);
export const addVideoComment = (data) => api.post('/video/comments', data);

// ===== STORY (Public) =====
export const getStoryPhotos = () => api.get('/story/photos');

// ===== ADMIN =====
export const updateSettings = (data) => api.put('/admin/settings', data);

export const getAdminWishes = () => api.get('/admin/wishes');
export const approveWish = (id) => api.put(`/admin/wishes/${id}/approve`);
export const deleteWish = (id) => api.delete(`/admin/wishes/${id}`);

export const approvePhoto = (id) => api.put(`/admin/photos/${id}/approve`);
export const deletePhoto = (id) => api.delete(`/admin/photos/${id}`);

export const toggleMemoryMode = (enabled) => api.post('/admin/memory-mode', { enabled });

export const getVideoCommentsAdmin = () => api.get('/admin/video/comments');
export const approveVideoComment = (id) => api.put(`/admin/video/comments/${id}/approve`);
export const deleteVideoCommentAdmin = (id) => api.delete(`/admin/video/comments/${id}`);

// ===== ADMIN STORY =====
export const getAdminStoryPhotos = () => api.get('/admin/story/photos');
export const uploadStoryPhoto = (formData) => api.post('/admin/story/photos/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteStoryPhoto = (id) => api.delete(`/admin/story/photos/${id}`);
export const reorderStoryPhotos = (orderList) => api.put('/admin/story/photos/reorder', { order: orderList });

// ===== ADMIN HERO & VIDEO =====
export const uploadHeroImage = (formData) => api.post('/admin/hero/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const uploadVideo = (formData) => api.post('/admin/video/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
