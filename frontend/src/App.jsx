import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { useEffect, useState } from 'react';
import InvitationEnvelope from './components/InvitationEnvelope';

function App() {
  const [loading, setLoading] = useState(true);
  const [showEnvelope, setShowEnvelope] = useState(true);

  useEffect(() => {
    const isAdmin = window.location.pathname === '/admin';
    if (isAdmin) {
      setLoading(false);
      setShowEnvelope(false); // Admin par envelope nahi dikhana
    } else {
      // Normal user ke liye loading screen
      setTimeout(() => setLoading(false), 2000);
    }
  }, []);

  const handleEnvelopeOpen = () => {
    setShowEnvelope(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-cream flex flex-col items-center justify-center z-50">
        <div className="text-7xl animate-crown">👑</div>
        <div className="font-cinzel text-rose mt-4 tracking-widest">Loading...</div>
        <div className="mt-6 w-40 h-1 bg-rose/20 rounded overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose to-gold animate-loadBar" />
        </div>
      </div>
    );
  }

  return (
    <>
      {showEnvelope && <InvitationEnvelope onOpen={handleEnvelopeOpen} />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/invite/:code" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;