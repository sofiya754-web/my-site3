import { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { STAY_SECTION_BG } from '../data/fragrances';

export function StaySection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
      }, 3000);
    }
  };

  const blurUp = {
    initial: { opacity: 0, y: 40, filter: 'blur(20px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 1, ease: 'easeOut' as const }
  };

  return (
    <section
      id="stay-section"
      className="relative w-full overflow-hidden"
      style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}
    >
      <img
        src={STAY_SECTION_BG}
        alt=""
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 w-full pointer-events-none select-none"
        style={{ objectFit: 'cover', objectPosition: 'center bottom' }}
      />

      <div
        className="relative max-w-[1480px] mx-auto px-8 md:px-16 pt-20 md:pt-24 pb-20 md:pb-24 min-h-screen flex flex-col justify-between"
        style={{ gap: '32px' }}
      >
        <motion.div {...blurUp}>
          <div
            className="font-serif font-medium leading-[1.05] tracking-tight text-black text-[clamp(44px,9vw,120px)]"
            style={{
              fontFamily: "var(--font-serif), 'Cormorant Garamond', serif"
            }}
          >
            Оставайтесь <span className="italic font-normal font-serif">в</span>
          </div>
          <div
            className="font-sans font-light leading-[1.05] tracking-tight text-black text-[clamp(28px,5vw,56px)] mt-1"
            style={{
              fontFamily: "var(--font-sans), 'Manrope', sans-serif"
            }}
          >
            коллекции
          </div>
        </motion.div>

        <motion.div
          {...blurUp}
          transition={{ duration: 1, ease: 'easeOut' as const, delay: 0.2 }}
          className="max-w-md pb-12"
        >
          <p
            className="mb-6 font-sans text-black/75 text-[16px] md:text-[18px] leading-[1.5] font-normal"
            style={{
              fontFamily: "var(--font-sans), 'Manrope', sans-serif"
            }}
          >
            Анонсы редких тиражей и закрытые приглашения парфюмерного ателье Bentley, дважды в сезон.
          </p>

          {subscribed ? (
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200/60 p-3 rounded-lg text-sm font-sans">
              <Check size={16} />
              <span>Вы внесены в закрытый реестр Bentley Atelier Gazette.</span>
            </div>
          ) : (
            <form
              className="flex items-center border-b border-black/40 pb-2.5 gap-3"
              onSubmit={handleSubmit}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vash@email.ru"
                className="bg-transparent flex-1 outline-none placeholder:text-black/40 font-sans text-[15px] md:text-[16px] text-black"
                style={{
                  fontFamily: "var(--font-sans), 'Manrope', sans-serif"
                }}
              />
              <button
                type="submit"
                className="hover:opacity-70 transition-opacity cursor-pointer font-sans text-[13px] font-medium tracking-[0.06em] uppercase text-black"
                style={{
                  fontFamily: "var(--font-sans), 'Manrope', sans-serif"
                }}
              >
                Подписаться →
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
