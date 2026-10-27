import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, ShieldCheck, Box, ChevronRight } from 'lucide-react';
import { Fragrance } from '../types';

interface FragranceModalProps {
  fragrance: Fragrance | null;
  onClose: () => void;
  onAddToCart: (fragrance: Fragrance, engraving?: string) => void;
  onSelectNext: () => void;
  onSelectPrev: () => void;
}

export function FragranceModal({
  fragrance,
  onClose,
  onAddToCart,
  onSelectNext,
  onSelectPrev
}: FragranceModalProps) {
  const [engraving, setEngraving] = useState('');
  const [showEngraveInput, setShowEngraveInput] = useState(false);
  const [added, setAdded] = useState(false);

  if (!fragrance) return null;

  const handleAdd = () => {
    onAddToCart(fragrance, engraving.trim() || undefined);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#111111] border border-white/10 text-white shadow-2xl rounded-2xl overflow-hidden my-auto z-10 flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* Left Column: Bottle presentation */}
          <div className="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-b from-[#181818] to-[#0c0c0c] flex flex-col items-center justify-between relative border-b md:border-b-0 md:border-r border-white/10">
            {/* Top brand tag */}
            <div className="w-full flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-white/50">
              <span>Beyond The Collection</span>
              <span>Bentley Crewe</span>
            </div>

            {/* Bottle image display */}
            <div className="my-6 relative flex items-center justify-center group">
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: fragrance.colorAccent }}
              />
              <img
                src={fragrance.src}
                alt={fragrance.name}
                className="w-56 md:w-72 h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-105"
              />

              {/* Engraving badge preview on flacon */}
              {engraving && (
                <div className="absolute bottom-6 bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1 rounded text-[10px] tracking-widest text-amber-200 uppercase font-mono">
                  Воротничок: {engraving.toUpperCase()}
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="w-full flex items-center justify-between text-xs tracking-wider uppercase text-white/60 pt-2 border-t border-white/10 font-sans">
              <button
                onClick={onSelectPrev}
                className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                ← Предыдущий
              </button>
              <span className="font-serif italic text-white/40">Флакон 100 мл</span>
              <button
                onClick={onSelectNext}
                className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                Следующий →
              </button>
            </div>
          </div>

          {/* Right Column: Scent formulation & bespoke order */}
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Category & Perfumer */}
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-amber-300/80 mb-2 font-medium font-sans">
                <span>{fragrance.family}</span>
                <span>·</span>
                <span>{fragrance.perfumer}</span>
              </div>

              {/* Title & Price */}
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <h2 className="font-serif font-medium text-3xl md:text-4xl text-white tracking-tight">
                  {fragrance.name}
                </h2>
                <span className="font-serif font-medium text-2xl text-white/90">
                  ${fragrance.price}
                </span>
              </div>

              <p className="text-white/75 text-[15px] md:text-[16px] leading-[1.5] mb-6 font-sans font-normal">
                {fragrance.story}
              </p>

              {/* Olfactory Pyramid */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-3 font-sans">
                <div className="text-[11px] uppercase tracking-[0.1em] text-white/50 font-medium">
                  Ольфакторная пирамида
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="w-20 text-white/40 uppercase tracking-wider shrink-0 text-[10px] pt-0.5">Верхние:</span>
                    <span className="text-white/90 font-medium">{fragrance.topNotes.join(' · ')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-20 text-white/40 uppercase tracking-wider shrink-0 text-[10px] pt-0.5">Сердце:</span>
                    <span className="text-amber-100 font-medium">{fragrance.heartNotes.join(' · ')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-20 text-white/40 uppercase tracking-wider shrink-0 text-[10px] pt-0.5">База:</span>
                    <span className="text-white/70 font-medium">{fragrance.baseNotes.join(' · ')}</span>
                  </div>
                </div>
              </div>

              {/* Complimentary Bespoke Engraving */}
              <div className="mb-6 font-sans">
                {!showEngraveInput ? (
                  <button
                    type="button"
                    onClick={() => setShowEngraveInput(true)}
                    className="flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors border-b border-dashed border-white/30 pb-0.5 cursor-pointer"
                  >
                    <Sparkles size={13} className="text-amber-300" />
                    <span>Добавить бесплатную монограмму / инициалы</span>
                  </button>
                ) : (
                  <div className="p-3 bg-white/5 border border-white/15 rounded-lg">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-white/80">Гравировка на воротничке флакона (до 3 символов)</span>
                      <button
                        onClick={() => {
                          setShowEngraveInput(false);
                          setEngraving('');
                        }}
                        className="text-white/40 hover:text-white text-[11px] cursor-pointer"
                      >
                        Отмена
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={3}
                      value={engraving}
                      onChange={(e) => setEngraving(e.target.value.toUpperCase())}
                      placeholder="НАПР. WOB"
                      className="w-full bg-black/60 border border-white/20 rounded px-3 py-1.5 text-sm uppercase tracking-widest text-amber-200 outline-none focus:border-white/50"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <button
                onClick={handleAdd}
                className="w-full bg-white hover:bg-stone-200 text-black py-3.5 px-6 rounded-full font-sans text-[13px] md:text-[14px] uppercase tracking-[0.08em] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {added ? (
                  <>
                    <Check size={16} />
                    Добавлено в корзину ателье
                  </>
                ) : (
                  <>
                    Приобрести издание — ${fragrance.price}
                    <ChevronRight size={15} />
                  </>
                )}
              </button>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-3 text-[11px] text-white/50 font-sans">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-white/40 shrink-0" />
                  <span>Бесплатная курьерская доставка в белых перчатках</span>
                </div>
                <div className="flex items-center gap-2">
                  <Box size={14} className="text-white/40 shrink-0" />
                  <span>2 премиальных сэмпла 2 мл в комплекте</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
