import { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface FooterProps {
  onOpenInfo: (title: string, content: string) => void;
}

export function Footer({ onOpenInfo }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const blurUp = {
    initial: { opacity: 0, y: 40, filter: 'blur(20px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 1, ease: 'easeOut' as const }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setEmail(''), 3000);
    }
  };

  const Column = ({
    heading,
    items
  }: {
    heading: string;
    items: { label: string; text: string }[];
  }) => (
    <div>
      <div
        className="mb-5 text-black/55"
        style={{
          fontFamily: "var(--font-sans), 'Manrope', ui-sans-serif, sans-serif",
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.3em',
          textTransform: 'uppercase'
        }}
      >
        {heading}
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <button
              onClick={() => onOpenInfo(item.label, item.text)}
              className="hover:underline text-left cursor-pointer transition-opacity"
              style={{
                fontFamily: "var(--font-sans), 'Manrope', ui-sans-serif, sans-serif",
                fontSize: '15px',
                fontWeight: 400,
                color: 'rgba(0,0,0,0.85)'
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer
      className="relative w-full text-black overflow-hidden"
      style={{ backgroundColor: '#f4ecdc' }}
    >
      <div className="relative max-w-[1480px] mx-auto px-8 md:px-16 pt-16 md:pt-20 pb-12">
        <motion.div
          {...blurUp}
          transition={{ duration: 1, ease: 'easeOut' as const, delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-10 mb-20 md:mb-24"
        >
          <Column
            heading="Коллекция"
            items={[
              {
                label: 'Все ароматы',
                text: 'Коллекция Beyond The Collection включает шесть уникальных авторских композиций, объединяющих редкие растительные эссенции и мастерство парфюмеров.'
              },
              {
                label: 'Флакон',
                text: 'Каждый массивный хрустальный флакон украшен гранеными гранями, отделкой из кожи Connolly и рифленой крышкой с легендарным знаком Flying B.'
              },
              {
                label: 'Устойчивое развитие',
                text: 'Наши флаконы пригодны для повторного наполнения и созданы с заботой о биоразнообразии и этичном сборе компонентов.'
              },
              {
                label: 'Издания',
                text: 'От дерзкого Wild Vetiver до лимитированного Flacon de Cristal Crystal Edition — каждый аромат раскрывает грань дальних странствий.'
              }
            ]}
          />
          <Column
            heading="Ателье"
            items={[
              {
                label: 'Наша история',
                text: 'Рожденная в Крю, Англия, парфюмерия Bentley воплощает более чем вековое наследие автомобильной роскоши и искусства гран-туринга.'
              },
              {
                label: 'Парфюмеры',
                text: 'Создано в сотрудничестве с великими мастерами: Сидони Лансессёр, Карин Дюбрей-Серени, Мишель Альмерак и Фабрис Пеллегрен.'
              },
              {
                label: 'Визиты в ателье',
                text: 'Индивидуальные консультации и подбор ароматов доступны по записи в Крю и флагманском бутике в Лондоне на Мейфэр.'
              },
              {
                label: 'Пресса',
                text: 'Пресс-материалы, эксклюзивные съемки и тестовые наборы доступны через службу коммуникаций Bentley.'
              }
            ]}
          />
          <Column
            heading="Контакты"
            items={[
              {
                label: 'Бутики',
                text: 'Посетите наши парфюмерные бутики в Мейфэр, Dubai Mall, Родео-Драйв и Ginza Six.'
              },
              {
                label: 'Консьерж',
                text: 'Персональная гравировка, подбор подарков и срочная международная доставка: concierge@bentleyfragrances.com.'
              },
              {
                label: 'Возврат',
                text: '30 дней на возврат. К каждому заказу прилагается пробный флакон 2 мл, чтобы оценить шлейф до вскрытия основной упаковки.'
              },
              {
                label: 'Уход за ароматом',
                text: 'Храните аромат вдали от прямых солнечных лучей и перепадов температур, плотно закрывая крышку.'
              }
            ]}
          />

          <div>
            <div
              className="mb-5 text-black/55"
              style={{
                fontFamily: "var(--font-sans), 'Manrope', sans-serif",
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              Рассылка
            </div>
            <p
              className="mb-5 text-black/70 font-sans text-[14px] leading-[1.5]"
              style={{
                fontFamily: "var(--font-sans), 'Manrope', sans-serif"
              }}
            >
              Анонсы изданий и закрытые приглашения, дважды в сезон.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-900 bg-emerald-100/60 p-2.5 rounded text-xs font-sans">
                <Check size={14} />
                <span>Вы подписаны на приглашения ателье.</span>
              </div>
            ) : (
              <form
                className="flex items-center border-b border-black/30 pb-2.5 gap-3"
                onSubmit={handleSubscribe}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vash@email.ru"
                  className="bg-transparent flex-1 outline-none placeholder:text-black/40 font-sans text-[14px] text-black"
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
          </div>
        </motion.div>

        <motion.div
          {...blurUp}
          transition={{ duration: 0.9, ease: 'easeOut' as const, delay: 0.25 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-8 border-t border-black/15"
        >
          <div
            className="text-black/55"
            style={{
              fontFamily: "var(--font-sans), 'Manrope', ui-sans-serif, sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase'
            }}
          >
            © 2026 Beyond The Collection · Bentley Motors Parfumerie
          </div>

          <div
            className="flex items-center gap-5"
            style={{
              fontFamily: "var(--font-sans), 'Manrope', ui-sans-serif, sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Instagram
            </a>
            <span className="text-black/30">·</span>
            <a
              href="https://tiktok.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              TikTok
            </a>
            <span className="text-black/30">·</span>
            <a
              href="https://spotify.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Spotify
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
