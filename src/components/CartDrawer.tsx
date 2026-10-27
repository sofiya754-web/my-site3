import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: CartDrawerProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.fragrance.price * item.quantity, 0);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderComplete(true);
      onClearCart();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-screen max-w-md bg-[#0f0f0f] border-l border-white/10 text-white flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between font-sans">
                <div>
                  <h2 className="font-serif text-2xl tracking-tight">Корзина ателье</h2>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
                    Beyond The Collection
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/80 transition-colors cursor-pointer"
                  aria-label="Закрыть корзину"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
                {orderComplete ? (
                  <div className="text-center py-12 space-y-4">
                    <CheckCircle2 size={48} className="text-amber-300 mx-auto" />
                    <h3 className="font-serif text-3xl">Заказ подтвержден</h3>
                    <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
                      Ваш флакон Bentley бережно собирается в парфюмерном ателье в Крю и отправляется курьером в белых перчатках.
                    </p>
                    <button
                      onClick={() => {
                        setOrderComplete(false);
                        onClose();
                      }}
                      className="mt-4 px-6 py-2.5 rounded-full bg-white text-black text-xs uppercase tracking-widest font-semibold cursor-pointer"
                    >
                      Вернуться в галерею
                    </button>
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-16 text-white/40 space-y-3">
                    <p className="font-serif text-2xl text-white/60">Ваша корзина пуста</p>
                    <p className="text-xs tracking-wider">
                      Исследуйте коллекцию и выберите ваш знаковый аромат.
                    </p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.fragrance.id}
                      className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <img
                        src={item.fragrance.src}
                        alt={item.fragrance.name}
                        className="w-16 h-20 object-contain drop-shadow"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-serif text-lg leading-tight">
                              {item.fragrance.name}
                            </h4>
                            <span className="font-serif text-sm">
                              ${item.fragrance.price * item.quantity}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/50">{item.fragrance.volume}</p>
                          {item.engraving && (
                            <span className="inline-block mt-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-200 border border-amber-300/20">
                              Инициалы: {item.engraving}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2 border border-white/20 rounded-md px-2 py-0.5 text-xs">
                            <button
                              onClick={() => onUpdateQuantity(item.fragrance.id, -1)}
                              className="text-white/60 hover:text-white cursor-pointer px-1"
                            >
                              -
                            </button>
                            <span className="px-2 font-mono">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.fragrance.id, 1)}
                              className="text-white/60 hover:text-white cursor-pointer px-1"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.fragrance.id)}
                            className="text-white/40 hover:text-red-400 text-xs transition-colors p-1 cursor-pointer"
                            aria-label="Удалить позицию"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Checkout Summary */}
              {!orderComplete && items.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-black/40 space-y-4 font-sans">
                  <div className="space-y-2 text-xs text-white/70">
                    <div className="flex justify-between">
                      <span>Промежуточный итог</span>
                      <span className="font-serif text-sm text-white">${subtotal}</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Доставка в белых перчатках</span>
                      <span className="uppercase text-[10px] tracking-wider text-amber-200">
                        Бесплатно
                      </span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Подарочный футляр и 2 сэмпла</span>
                      <span className="uppercase text-[10px] tracking-wider text-amber-200">
                        Включено
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex justify-between items-baseline font-serif">
                    <span className="text-lg">Итого</span>
                    <span className="text-2xl">${subtotal}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-white hover:bg-stone-200 disabled:opacity-50 text-black py-3.5 rounded-full font-sans text-[13px] md:text-[14px] uppercase tracking-[0.08em] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isCheckingOut ? (
                      'Подготовка к отправке...'
                    ) : (
                      <>
                        Оформить заказ <ArrowRight size={15} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-white/40 tracking-wider uppercase">
                    <Shield size={12} />
                    <span>Официальная парфюмерия Bentley Motors</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
