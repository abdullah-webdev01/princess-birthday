import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InvitationEnvelope({ onOpen }) {
  const [step, setStep] = useState('envelope');
  const [showParticles, setShowParticles] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowParticles(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleEnvelopeClick = () => {
    if (step === 'envelope') {
      setStep('flapOpen');
      setTimeout(() => setStep('letterSlide'), 700);
    }
  };

  useEffect(() => {
    if (step === 'letterSlide') {
      const timer = setTimeout(() => setStep('letterUnfold'), 800);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'letterUnfold') {
      const timer = setTimeout(() => setStep('ready'), 600);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => onOpen(), 800);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#f5ede4] via-[#fdf6f0] to-[#fce8e0] overflow-hidden"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Background bokeh */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={`bokeh-${i}`}
                className="absolute rounded-full bg-rose-100/20 blur-3xl"
                style={{
                  width: `${120 + Math.random() * 200}px`,
                  height: `${120 + Math.random() * 200}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `floatBokeh ${10 + Math.random() * 12}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 6}s`,
                }}
              />
            ))}
          </div>

          {/* Sparkles */}
          {showParticles && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute w-1 h-1 rounded-full bg-gold-400/60"
                  initial={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0, 1.5, 0],
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                  }}
                  transition={{
                    duration: 3 + Math.random() * 5,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                  }}
                />
              ))}
            </div>
          )}

          {/* Envelope Container */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-[320px] sm:max-w-[400px] mx-auto px-2 py-2">
            <motion.div
              className="relative w-full aspect-[4/3] cursor-pointer"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={handleEnvelopeClick}
            >
              {/* Shadow */}
              <div className="absolute inset-0 rounded-2xl shadow-2xl shadow-rose-200/30" />

              {/* Envelope Body */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#f5ede4] via-[#ede3d5] to-[#e0d0bd] border border-white/50 shadow-xl overflow-hidden"
                animate={step !== 'envelope' ? { scale: 1 } : {}}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNMzAgMTBhMTAgMTAgMCAwIDAgMCAyMCAxMCAxMCAwIDAgMCAwLTIweiIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] bg-repeat" />
                <div className="absolute top-[35%] left-0 right-0 h-px bg-amber-200/20" />
                <div className="absolute bottom-[35%] left-0 right-0 h-px bg-amber-200/15" />
              </motion.div>

              {/* Flap */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-[55%] origin-top rounded-t-2xl overflow-hidden"
                initial={{ rotateX: 0 }}
                animate={step !== 'envelope' ? { rotateX: -180, y: -6 } : { rotateX: 0 }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="w-full h-full bg-gradient-to-br from-[#f5ede4] via-[#ede3d5] to-[#e0d0bd] rounded-t-2xl border-b border-gold-300/15">
                  <div className="w-full h-full bg-gradient-to-br from-[#f5ede4] via-[#ede3d5] to-[#e0d0bd]" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                </div>
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[#e0d0bd] to-[#d0c0ad] rounded-t-2xl"
                  style={{ transform: 'rotateX(180deg)', backfaceVisibility: 'hidden' }}
                />
              </motion.div>

              {/* Golden Thread */}
              <motion.div
                className="absolute top-[22%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                animate={step !== 'envelope' ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <div className="absolute w-12 h-12 rounded-full border-[3px] border-gold-400/60 shadow-lg rotate-45" />
                  <div className="absolute w-8 h-8 rounded-full border-2 border-gold-300/40 rotate-[-15deg]" />
                  <div className="absolute w-3 h-3 bg-gold-400/70 rounded-full shadow-md" />
                  <div className="absolute -top-2 -right-2 w-4 h-3 bg-gold-400/50 rounded-full rotate-12" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-3 bg-gold-400/50 rounded-full -rotate-12" />
                </div>
              </motion.div>

              {/* Letter */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 mx-auto w-[88%] z-10"
                initial={{ y: 70, opacity: 0, scale: 0.9 }}
                animate={
                  step === 'letterSlide' || step === 'letterUnfold' || step === 'ready'
                    ? { y: 0, opacity: 1, scale: 1 }
                    : { y: 70, opacity: 0, scale: 0.9 }
                }
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <motion.div
                  className="bg-[#fffdf5] rounded-xl shadow-2xl border border-white/60 p-2.5 sm:p-4 relative overflow-hidden w-full"
                  animate={
                    step === 'letterUnfold' || step === 'ready'
                      ? { scale: 1, y: 0 }
                      : { scale: 0.96, y: 4 }
                  }
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-amber-200/20" />

                  <AnimatePresence>
                    {(step === 'letterUnfold' || step === 'ready') && (
                      <motion.div
                        className="space-y-1 text-center w-full break-words overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, staggerChildren: 0.08 }}
                      >
                        <motion.p
                          className="font-cinzel text-[8px] sm:text-[10px] text-gold-500 tracking-[0.3em] uppercase"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          With Love,
                        </motion.p>
                        <motion.h2
                          className="font-playfair text-[13px] sm:text-2xl text-rose-600 font-bold leading-tight"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          We Invite You To Celebrate
                        </motion.h2>
                        <motion.h3
                          className="font-playfair text-[15px] sm:text-3xl text-[#2d1b1b] font-bold leading-tight"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring' }}
                        >
                          The First Birthday
                        </motion.h3>
                        <motion.h4
                          className="font-playfair text-[18px] sm:text-4xl text-gold-600 font-bold leading-tight"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring' }}
                        >
                          Princess 👑
                        </motion.h4>
                        <motion.p
                          className="font-poppins text-[10px] sm:text-sm text-[#2d1b1b]/70 leading-relaxed w-full px-1"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          Your presence and blessings will make this day even more special for our family.
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Button */}
            {step === 'ready' && (
              <motion.button
                className="mt-3 sm:mt-5 px-5 sm:px-8 py-2 sm:py-3 rounded-full bg-gradient-to-r from-rose to-gold text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-[11px] sm:text-sm whitespace-nowrap"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                onClick={handleEnter}
              >
                Enter the Celebration 🎉
              </motion.button>
            )}

            {/* Hint text */}
            {step === 'envelope' && (
              <>
                <motion.p
                  className="mt-3 sm:mt-4 font-cinzel text-[9px] sm:text-[10px] text-rose-400/70 tracking-[0.3em] uppercase text-center"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  ✨ A Special Invitation Awaits You ✨
                </motion.p>
                <motion.p
                  className="mt-0.5 text-[9px] text-rose-300/60 font-poppins animate-pulse"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  (Tap to open)
                </motion.p>
              </>
            )}
          </div>

          <style>{`
            @keyframes floatBokeh {
              0%, 100% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(30px, -20px) scale(1.1); }
              66% { transform: translate(-20px, 30px) scale(0.9); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}