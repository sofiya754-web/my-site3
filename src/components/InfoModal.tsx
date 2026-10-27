import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';

interface InfoModalProps {
  info: { title: string; content: string } | null;
  onClose: () => void;
}

export function InfoModal({ info, onClose }: InfoModalProps) {
  if (!info) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#141414] border border-white/15 text-white rounded-2xl p-8 z-10 shadow-2xl space-y-5"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-amber-200/80 font-mono">
            <Sparkles size={14} />
            <span>Bentley Parfumerie Atelier</span>
          </div>

          <h3 className="font-serif font-medium text-3xl md:text-4xl tracking-tight text-white">
            {info.title}
          </h3>

          <p className="text-white/80 text-[16px] leading-[1.5] font-sans font-normal">
            {info.content}
          </p>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-white text-black font-sans text-[13px] uppercase tracking-[0.08em] font-medium hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
