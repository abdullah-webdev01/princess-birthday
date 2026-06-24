import { useState, useEffect, useRef } from 'react';
import { getVideoLikes, likeVideo, getVideoComments, addVideoComment, getSettings } from '../utils/api';

export default function VideoSection() {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [likesRes, commentsRes, settingsRes] = await Promise.all([
          getVideoLikes(),
          getVideoComments(),
          getSettings()
        ]);
        setLikes(likesRes.data?.likes || 0);
        setComments(commentsRes.data || []);
        // Get video URL from settings
        if (settingsRes.data?.video_url) {
          setVideoUrl(settingsRes.data.video_url);
        } else {
          // Fallback video if no URL in settings
          setVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4');
        }
      } catch (error) {
        console.error('Error fetching video data:', error);
        // Fallback video on error
        setVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await likeVideo();
      setLikes(res.data?.likes || likes + 1);
      setLiked(true);
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      alert('Please enter your name and comment');
      return;
    }
    try {
      const res = await addVideoComment({ guest_name: name, comment: comment });
      const newComment = res.data?.[0] || { guest_name: name, comment: comment, created_at: new Date().toISOString() };
      setComments([newComment, ...comments]);
      setName('');
      setComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Error posting comment');
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-[#fdf6f0] to-[#fce4ec]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-rose-400 font-poppins animate-pulse">Loading video...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-[#fdf6f0] to-[#fce4ec]">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/30 bg-white/10 backdrop-blur-sm p-1.5">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full aspect-square object-cover rounded-2xl"
            autoPlay
            loop
            muted
            playsInline
            controls
          />
        </div>

        <div className="mt-6 glass p-4 sm:p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-transform duration-200 hover:scale-110 ${
                liked ? 'text-rose-500' : 'text-[#d4a5a5]'
              }`}
            >
              <span className="text-3xl sm:text-4xl">{liked ? '❤️' : '🤍'}</span>
              <span className="text-sm font-poppins text-[#2d1b1b]">
                {likes} {likes === 1 ? 'like' : 'likes'}
              </span>
            </button>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-cinzel text-[#d4a5a5] tracking-[0.15em] uppercase mb-3">
              Comments ({comments.length})
            </h4>

            <form onSubmit={handleCommentSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-white/50 border border-rose/20 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-rose/30"
              />
              <input
                type="text"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-[2] px-4 py-2 rounded-xl bg-white/50 border border-rose/20 text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-rose/30"
              />
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose to-gold text-white font-semibold text-sm hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap"
              >
                Post
              </button>
            </form>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {comments.length === 0 ? (
                <p className="text-sm text-[#d4a5a5]/60 text-center py-4">No comments yet. Be the first!</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="glass p-3 rounded-xl">
                    <p className="font-semibold text-rose text-sm">{c.guest_name}</p>
                    <p className="text-sm text-[#2d1b1b] mt-0.5">{c.comment}</p>
                    <p className="text-[10px] text-[#d4a5a5]/50 mt-1">
                      {new Date(c.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}