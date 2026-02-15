import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Language, UserProfile } from '../../types';
import { TRANSLATIONS, SHOP_PHONE } from '../../constants';
import { MOCK_VEGETABLES } from '../../data/mock';
import SimpleView from '../layout/SimpleView';
import {
  ShoppingCart, Plus, Minus, X, ArrowRight, MapPin, User, Send,
  CheckCircle2, Search, Sparkles, Star, Clock, Truck, Shield,
  ChevronRight, Package, Leaf, BadgePercent, Phone, Heart,
  TrendingUp, Zap, Filter
} from 'lucide-react';
import { Button } from '../Button';
import { triggerHaptic } from '../../utils/common';
import clsx from 'clsx';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type CartItem = { id: number; qty: number };

type CategoryKey = 'all' | 'veg' | 'fruit' | 'leafy';

type CategoryConfig = {
  key: CategoryKey;
  emoji: string;
  gradient: string;
  glow: string;
  activeText: string;
};

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS & CONFIG
   ═══════════════════════════════════════════════════════════════ */

const CATEGORIES: CategoryConfig[] = [
  { key: 'all', emoji: '🛒', gradient: 'from-green-500 to-emerald-600', glow: 'rgba(34,197,94,0.4)', activeText: 'text-white' },
  { key: 'veg', emoji: '🥕', gradient: 'from-orange-500 to-amber-600', glow: 'rgba(249,115,22,0.4)', activeText: 'text-white' },
  { key: 'leafy', emoji: '🥬', gradient: 'from-emerald-500 to-teal-600', glow: 'rgba(16,185,129,0.4)', activeText: 'text-white' },
  { key: 'fruit', emoji: '🍎', gradient: 'from-rose-500 to-pink-600', glow: 'rgba(244,63,94,0.4)', activeText: 'text-white' },
];

const FRESHNESS_LABELS = {
  mr: '🌿 ताजे आजच',
  hi: '🌿 आज ताज़ा',
  en: '🌿 Fresh Today',
};

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COUNTER COMPONENT
   ═══════════════════════════════════════════════════════════════ */

const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [value, displayValue]);

  return (
    <span
      className={clsx(
        "inline-block font-black text-white tabular-nums transition-all duration-150",
        isAnimating && "scale-125 text-green-400"
      )}
    >
      {displayValue}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CARD COMPONENT
   ═══════════════════════════════════════════════════════════════ */

const ProductCard = React.memo(({
  product, qty, lang, onAdd, onRemove, t,
}: {
  product: any;
  qty: number;
  lang: Language;
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  t: any;
}) => {
  const pName = lang === 'mr' ? product.nameMr : lang === 'hi' ? product.nameHi : product.nameEn;
  const isInCart = qty > 0;
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--cx', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--cy', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={clsx(
        "group relative flex flex-col items-center text-center",
        "rounded-[1.25rem] overflow-hidden",
        "border transition-all duration-500 ease-out",
        "active:scale-[0.97]",
        isInCart
          ? "border-green-500/25 bg-gradient-to-b from-green-500/[0.06] via-[#0a0f1a] to-[#080d17] shadow-[0_0_30px_rgba(34,197,94,0.08)]"
          : "border-white/[0.06] bg-gradient-to-b from-[#0d1220] via-[#0a0f1a] to-[#080d17] hover:border-white/[0.12]"
      )}
    >
      {/* ── Mouse Spotlight ────────────────────────── */}
      <div
        className="absolute -inset-px rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(200px circle at var(--cx, 50%) var(--cy, 50%), ${isInCart ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)'}, transparent 50%)`
        }}
      />

      {/* ── Noise Texture ──────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }}
      />

      {/* ── Top Accent Line ────────────────────────── */}
      <div
        className={clsx(
          "absolute top-0 left-4 right-4 h-[1px] transition-opacity duration-500",
          isInCart ? "opacity-60" : "opacity-0 group-hover:opacity-40"
        )}
      >
        <div className={clsx(
          "h-full bg-gradient-to-r",
          isInCart ? "from-transparent via-green-400 to-transparent" : "from-transparent via-white/40 to-transparent"
        )} />
      </div>

      {/* ── Freshness Badge ────────────────────────── */}
      {product.fresh && (
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 backdrop-blur-sm">
            {FRESHNESS_LABELS[lang]}
          </span>
        </div>
      )}

      {/* ── Content ────────────────────────────────── */}
      <div className="relative z-10 p-4 pb-4 w-full flex flex-col items-center">
        {/* Emoji with Glow */}
        <div className="relative mb-3 mt-1">
          <div
            className={clsx(
              "absolute inset-0 blur-2xl rounded-full transition-opacity duration-500",
              isInCart ? "opacity-30 bg-green-500/30" : "opacity-0 group-hover:opacity-20 bg-white/10"
            )}
          />
          <span
            className={clsx(
              "relative block text-5xl drop-shadow-xl",
              "transform transition-all duration-500 ease-out",
              "group-hover:scale-110 group-hover:-translate-y-1",
              isInCart && "scale-105"
            )}
            role="img"
            aria-label={product.nameEn}
          >
            {product.image}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-[15px] font-extrabold text-white leading-tight mb-0.5 tracking-tight">
          {pName}
        </h3>
        <p className="text-[11px] text-white/30 font-medium mb-3">
          {product.nameEn}
        </p>

        {/* Price Tag */}
        <div className={clsx(
          "flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-xl transition-all duration-300",
          "border",
          isInCart
            ? "bg-green-500/10 border-green-500/20"
            : "bg-white/[0.03] border-white/[0.06] group-hover:bg-white/[0.06]"
        )}>
          <span className={clsx(
            "font-black text-lg tabular-nums transition-colors duration-300",
            isInCart ? "text-green-400" : "text-white"
          )}>
            ₹{product.price}
          </span>
          <span className="text-[10px] text-white/30 font-semibold">/{product.unit}</span>
        </div>

        {/* Action Button / Quantity Control */}
        {qty === 0 ? (
          <button
            onClick={() => onAdd(product.id)}
            className={clsx(
              "w-full py-2.5 rounded-xl text-sm font-bold",
              "flex items-center justify-center gap-2",
              "bg-white/[0.04] border border-white/[0.08]",
              "text-green-400",
              "hover:bg-green-500/15 hover:border-green-500/30",
              "active:scale-95",
              "transition-all duration-300"
            )}
          >
            <Plus size={16} strokeWidth={2.5} />
            {t.mandi_add}
          </button>
        ) : (
          <div className={clsx(
            "flex items-center w-full rounded-xl overflow-hidden",
            "bg-green-500/10 border border-green-500/25",
            "transition-all duration-300"
          )}>
            <button
              onClick={() => onRemove(product.id)}
              className={clsx(
                "flex-1 h-10 flex items-center justify-center",
                "text-green-400 hover:bg-green-500/20",
                "active:scale-90 transition-all duration-200"
              )}
            >
              {qty === 1 ? (
                <X size={14} className="text-red-400" strokeWidth={2.5} />
              ) : (
                <Minus size={16} strokeWidth={2.5} />
              )}
            </button>

            <div className="w-12 h-10 flex items-center justify-center border-x border-green-500/15">
              <AnimatedCounter value={qty} />
            </div>

            <button
              onClick={() => onAdd(product.id)}
              className={clsx(
                "flex-1 h-10 flex items-center justify-center",
                "bg-green-500 text-white",
                "hover:bg-green-600",
                "active:scale-90 transition-all duration-200",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
              )}
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* ── In-Cart Indicator ──────────────────────── */}
      {isInCart && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px]">
          <div className="h-full bg-gradient-to-r from-green-500/60 via-emerald-400/80 to-green-500/60" />
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   CART ITEM ROW
   ═══════════════════════════════════════════════════════════════ */

const CartItemRow = React.memo(({
  product, qty, lang, onAdd, onRemove,
}: {
  product: any;
  qty: number;
  lang: Language;
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
}) => {
  const pName = lang === 'mr' ? product.nameMr : lang === 'hi' ? product.nameHi : product.nameEn;
  const subtotal = product.price * qty;

  return (
    <div className={clsx(
      "group flex items-center gap-3 p-3.5 rounded-2xl",
      "bg-white/[0.03] border border-white/[0.06]",
      "hover:bg-white/[0.05] hover:border-white/[0.1]",
      "transition-all duration-300"
    )}>
      {/* Emoji */}
      <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">{product.image}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm truncate">{pName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-white/30">₹{product.price}/{product.unit}</span>
          <span className="text-[10px] text-white/15">•</span>
          <span className="text-xs font-bold text-green-400">₹{subtotal}</span>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onRemove(product.id)}
          className={clsx(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "border transition-all duration-200 active:scale-90",
            qty === 1
              ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
              : "bg-white/[0.06] border-white/[0.08] text-white/50 hover:bg-white/[0.1]"
          )}
        >
          {qty === 1 ? <X size={12} strokeWidth={3} /> : <Minus size={14} strokeWidth={2.5} />}
        </button>

        <span className="w-6 text-center font-black text-white tabular-nums text-sm">
          {qty}
        </span>

        <button
          onClick={() => onAdd(product.id)}
          className={clsx(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "bg-green-500 text-white",
            "hover:bg-green-600 active:scale-90",
            "transition-all duration-200",
            "shadow-[0_2px_8px_rgba(34,197,94,0.3)]"
          )}
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

const SabjiMandiView = ({
  lang, user, onBack,
}: {
  lang: Language;
  user: UserProfile;
  onBack: () => void;
}) => {
  const t = TRANSLATIONS[lang];
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: user.name, address: user.village });
  const [isOrderSent, setIsOrderSent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const cartDrawerRef = useRef<HTMLDivElement>(null);

  // ── Filtered Products ──────────────────────────────────
  const products = useMemo(() =>
    MOCK_VEGETABLES.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        p.nameEn.toLowerCase().includes(q) ||
        p.nameMr.includes(q) ||
        p.nameHi.includes(q);
      return matchCat && matchSearch;
    }),
    [activeCategory, searchQuery]
  );

  // ── Cart Logic ─────────────────────────────────────────
  const addToCart = useCallback((id: number) => {
    triggerHaptic('light');
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);

  const removeFromCart = useCallback((id: number) => {
    triggerHaptic('light');
    setCart(prev => {
      const newQty = (prev[id] || 0) - 1;
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  }, []);

  const { totalItems, totalPrice, cartItems } = useMemo(() => {
    const items = Object.entries(cart).map(([id, qty]) => ({
      product: MOCK_VEGETABLES.find(v => v.id === Number(id))!,
      qty: qty as number,
    })).filter(i => i.product);

    return {
      totalItems: items.reduce((a, b) => a + b.qty, 0),
      totalPrice: items.reduce((a, b) => a + b.product.price * b.qty, 0),
      cartItems: items,
    };
  }, [cart]);

  // ── Checkout ───────────────────────────────────────────
  const handleCheckout = useCallback(() => {
    if (totalItems === 0) return;

    let itemsList = '';
    cartItems.forEach(({ product: p, qty }) => {
      const name = lang === 'mr' ? p.nameMr : lang === 'hi' ? p.nameHi : p.nameEn;
      itemsList += `▸ ${name} × ${qty} ${p.unit} — ₹${p.price * qty}\n`;
    });

    const greeting = lang === 'mr'
      ? 'नमस्कार 🙏\n🥬 नवीन भाजी ऑर्डर:'
      : lang === 'hi'
        ? 'नमस्ते 🙏\n🥬 नई सब्जी ऑर्डर:'
        : 'Hello 🙏\n🥬 New Vegetable Order:';
    const totalLabel = lang === 'mr' ? 'एकूण' : lang === 'hi' ? 'कुल' : 'Total';
    const nameLabel = lang === 'mr' ? 'नाव' : lang === 'hi' ? 'नाम' : 'Name';
    const addrLabel = lang === 'mr' ? 'पत्ता' : lang === 'hi' ? 'पता' : 'Address';

    const message = `${greeting}\n━━━━━━━━━━━━━━━\n${itemsList}━━━━━━━━━━━━━━━\n💰 ${totalLabel}: ₹${totalPrice}\n\n👤 ${nameLabel}: ${userDetails.name}\n📍 ${addrLabel}: ${userDetails.address}`;

    window.open(`https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(message)}`, '_blank');

    setIsOrderSent(true);
    setIsCartOpen(false);
    setCart({});
    triggerHaptic('heavy');
  }, [totalItems, totalPrice, cartItems, lang, userDetails]);

  // ── Keyboard Shortcut ──────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchFocused) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsCartOpen(false);
        setIsOrderSent(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchFocused]);

  // ── Active Category Config ─────────────────────────────
  const activeCatConfig = CATEGORIES.find(c => c.key === activeCategory) || CATEGORIES[0];

  return (
    <SimpleView title={t.mandi_title} onBack={onBack}>
      {/* ── Global Styles ──────────────────────────────── */}
      <style>{`
        @keyframes success-bounce {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.1); }
        }
        @keyframes check-draw {
          from { stroke-dashoffset: 50; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes confetti {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-60px) rotate(360deg); opacity: 0; }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-down-fade {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cart-bounce {
          0%   { transform: translateY(100px) scale(0.9); opacity: 0; }
          60%  { transform: translateY(-6px) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes float-badge {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-2px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50%      { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="pb-36 relative min-h-screen">

        {/* ══════════════════════════════════════════════
            SUCCESS OVERLAY
            ══════════════════════════════════════════════ */}
        {isOrderSent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
            <div
              className={clsx(
                "relative bg-gradient-to-b from-[#0a1628] to-[#060e1a]",
                "border border-green-500/20 rounded-[2rem] p-8 max-w-sm w-full text-center",
                "shadow-[0_0_80px_rgba(34,197,94,0.15)]"
              )}
              style={{ animation: 'slide-down-fade 0.4s ease-out' }}
            >
              {/* Confetti Particles */}
              <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
                {['🎉', '✨', '🥬', '🎊', '💚'].map((emoji, i) => (
                  <span
                    key={i}
                    className="absolute text-lg"
                    style={{
                      left: `${15 + i * 18}%`,
                      top: '40%',
                      animation: `confetti ${1.5 + i * 0.3}s ease-out ${i * 0.1}s forwards`,
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>

              {/* Success Icon */}
              <div className="relative mx-auto mb-6">
                <div
                  className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, rgba(34,197,94,0.15), transparent 70%)',
                    animation: 'success-bounce 0.6s ease-out',
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle2 size={36} className="text-green-400" strokeWidth={2} />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
                {lang === 'mr' ? 'ऑर्डर पाठवली! ✅' : lang === 'hi' ? 'ऑर्डर भेजा! ✅' : 'Order Sent! ✅'}
              </h2>
              <p className="text-sm text-white/40 mb-6 leading-relaxed">
                {lang === 'mr'
                  ? 'WhatsApp वर तुमच्या ऑर्डरची माहिती पाठवली आहे.'
                  : lang === 'hi'
                    ? 'WhatsApp पर आपके ऑर्डर का विवरण भेजा गया है।'
                    : 'Your order details have been sent via WhatsApp.'}
              </p>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 mb-6">
                {[
                  { icon: Truck, label: lang === 'mr' ? 'डिलिव्हरी' : 'Delivery' },
                  { icon: Shield, label: lang === 'mr' ? 'सुरक्षित' : 'Secure' },
                  { icon: Clock, label: lang === 'mr' ? 'जलद' : 'Fast' },
                ].map((badge, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/15 flex items-center justify-center">
                      <badge.icon size={14} className="text-green-400" />
                    </div>
                    <span className="text-[9px] text-white/25 font-bold uppercase">{badge.label}</span>
                  </div>
                ))}
              </div>

              <Button
                fullWidth
                onClick={() => setIsOrderSent(false)}
                variant="primary"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3.5 rounded-xl shadow-[0_8px_32px_rgba(34,197,94,0.3)]"
              >
                <span className="font-bold">
                  {lang === 'mr' ? 'ठीक आहे' : lang === 'hi' ? 'ठीक है' : 'Done'}
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STICKY HEADER (Search + Categories)
            ══════════════════════════════════════════════ */}
        <div className={clsx(
          "sticky top-0 z-30 -mx-4 px-4",
          "bg-[#020617]/90 backdrop-blur-xl",
          "border-b border-white/[0.04]",
          "transition-all duration-300"
        )}>
          {/* Search */}
          <div className="pt-3 pb-2">
            <div className="relative group/search">
              {/* Search Glow */}
              <div
                className={clsx(
                  "absolute -inset-1 rounded-2xl transition-opacity duration-400 blur-xl",
                  searchFocused ? "opacity-30" : "opacity-0"
                )}
                style={{ background: activeCatConfig.glow }}
              />

              <div className="relative">
                <Search
                  size={18}
                  className={clsx(
                    "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300",
                    searchFocused ? "text-green-400" : "text-white/25"
                  )}
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder={lang === 'mr' ? 'भाजी शोधा...' : lang === 'hi' ? 'सब्ज़ी खोजें...' : 'Search vegetables...'}
                  className={clsx(
                    "w-full rounded-xl pl-12 pr-12 py-3.5",
                    "bg-white/[0.04] border text-white text-sm font-medium",
                    "placeholder:text-white/20",
                    "focus:outline-none transition-all duration-300",
                    searchFocused
                      ? "border-green-500/30 bg-white/[0.06] shadow-[0_0_20px_rgba(34,197,94,0.06)]"
                      : "border-white/[0.06]"
                  )}
                />
                {/* Keyboard Shortcut Hint */}
                {!searchFocused && !searchQuery && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex">
                    <kbd className="text-[10px] text-white/15 font-mono bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded">
                      /
                    </kbd>
                  </div>
                )}
                {/* Clear Button */}
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 pt-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => { setActiveCategory(cat.key); triggerHaptic('light'); }}
                  className={clsx(
                    "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap",
                    "border transition-all duration-400 ease-out",
                    "active:scale-95",
                    isActive
                      ? clsx("text-white border-transparent bg-gradient-to-r", cat.gradient)
                      : "bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60"
                  )}
                  style={isActive ? { boxShadow: `0 4px 20px ${cat.glow}` } : undefined}
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span>{t.mandi_categories[cat.key] || cat.key}</span>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Results Count ────────────────────────────── */}
        <div className="flex items-center justify-between px-1 pt-4 pb-2">
          <p className="text-xs text-white/20 font-medium">
            {products.length} {lang === 'mr' ? 'वस्तू' : lang === 'hi' ? 'आइटम' : 'items'}
            {searchQuery && (
              <span className="text-white/10"> • "{searchQuery}"</span>
            )}
          </p>
          {totalItems > 0 && (
            <span
              className="text-[10px] font-bold text-green-400/60 flex items-center gap-1"
              style={{ animation: 'float-badge 2s ease-in-out infinite' }}
            >
              <ShoppingCart size={10} />
              {totalItems} in cart
            </span>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            PRODUCT GRID
            ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((p, i) => (
            <div
              key={p.id}
              style={{ animation: `slide-down-fade 0.3s ease-out ${i * 0.04}s both` }}
            >
              <ProductCard
                product={p}
                qty={cart[p.id] || 0}
                lang={lang}
                onAdd={addToCart}
                onRemove={removeFromCart}
                t={t}
              />
            </div>
          ))}

          {products.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-white/15" />
              </div>
              <p className="text-white/30 font-medium text-sm mb-1">
                {lang === 'mr' ? 'काहीही सापडले नाही' : lang === 'hi' ? 'कुछ नहीं मिला' : 'No items found'}
              </p>
              <p className="text-white/15 text-xs">"{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            FLOATING CART BAR
            ══════════════════════════════════════════════ */}
        {totalItems > 0 && (
          <div
            className="fixed bottom-6 inset-x-4 md:inset-x-auto md:max-w-md md:left-1/2 md:-translate-x-1/2 z-[190]"
            style={{ animation: 'cart-bounce 0.5s ease-out' }}
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className={clsx(
                "w-full flex items-center justify-between p-4 rounded-2xl",
                "bg-gradient-to-r from-green-600 to-emerald-600",
                "border border-green-400/20",
                "shadow-[0_12px_48px_rgba(34,197,94,0.35)]",
                "active:scale-[0.97] transition-transform duration-200",
                "group/cart"
              )}
              style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
            >
              <div className="flex items-center gap-3">
                {/* Item Count Badge */}
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-black/25 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <span className="font-black text-white text-lg tabular-nums">{totalItems}</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 border border-green-600 flex items-center justify-center">
                    <Sparkles size={6} className="text-green-900" />
                  </div>
                </div>

                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                    {t.mandi_total}
                  </span>
                  <span className="text-xl font-black text-white tabular-nums tracking-tight">
                    ₹{totalPrice}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10 group-hover/cart:bg-black/30 transition-colors">
                <span className="font-bold text-white text-sm">{t.mandi_cart}</span>
                <ArrowRight
                  size={16}
                  className="text-white/70 group-hover/cart:translate-x-0.5 transition-transform duration-300"
                />
              </div>
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            CART DRAWER (Bottom Sheet)
            ══════════════════════════════════════════════ */}
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[250] transition-opacity duration-300"
              onClick={() => setIsCartOpen(false)}
            />

            {/* Sheet */}
            <div
              ref={cartDrawerRef}
              className={clsx(
                "fixed bottom-0 inset-x-0 z-[260]",
                "bg-gradient-to-b from-[#0c1629] to-[#060e1a]",
                "border-t border-white/[0.06]",
                "rounded-t-[2rem]",
                "max-h-[90vh] overflow-hidden flex flex-col",
                "shadow-[0_-16px_64px_rgba(0,0,0,0.5)]"
              )}
              style={{ animation: 'slide-up 0.35s ease-out' }}
            >
              {/* Handle */}
              <div className="flex items-center justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 bg-white/10 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.04] flex-shrink-0">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <ShoppingCart size={20} className="text-green-400" />
                    {t.mandi_cart}
                  </h2>
                  <p className="text-xs text-white/25 mt-0.5">
                    {totalItems} {lang === 'mr' ? 'वस्तू' : 'items'} • ₹{totalPrice}
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-all"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">

                {/* Cart Items */}
                <div className="space-y-2.5">
                  {cartItems.map(({ product: p, qty }, i) => (
                    <div
                      key={p.id}
                      style={{ animation: `slide-down-fade 0.3s ease-out ${i * 0.05}s both` }}
                    >
                      <CartItemRow
                        product={p}
                        qty={qty}
                        lang={lang}
                        onAdd={addToCart}
                        onRemove={removeFromCart}
                      />
                    </div>
                  ))}
                </div>

                {/* Delivery Details */}
                <div className={clsx(
                  "p-5 rounded-2xl",
                  "bg-white/[0.02] border border-white/[0.05]",
                  "space-y-4"
                )}>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-green-400" />
                    <span className="text-xs font-bold text-green-400/80 uppercase tracking-wider">
                      {t.mandi_delivery || 'Delivery'} Details
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/15" />
                      <input
                        type="text"
                        value={userDetails.name}
                        onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t.mandi_name}
                        className={clsx(
                          "w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3",
                          "text-white text-sm font-medium",
                          "placeholder:text-white/15",
                          "focus:outline-none focus:border-green-500/30 focus:bg-white/[0.05]",
                          "transition-all duration-300"
                        )}
                      />
                    </div>

                    <div className="relative">
                      <MapPin size={14} className="absolute left-3.5 top-3.5 text-white/15" />
                      <textarea
                        value={userDetails.address}
                        onChange={(e) => setUserDetails(prev => ({ ...prev, address: e.target.value }))}
                        placeholder={t.mandi_address}
                        rows={2}
                        className={clsx(
                          "w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3",
                          "text-white text-sm font-medium",
                          "placeholder:text-white/15",
                          "focus:outline-none focus:border-green-500/30 focus:bg-white/[0.05]",
                          "transition-all duration-300 resize-none"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                  <h4 className="text-xs font-bold text-white/25 uppercase tracking-wider flex items-center gap-2">
                    <Package size={12} />
                    {lang === 'mr' ? 'बिल सारांश' : lang === 'hi' ? 'बिल सारांश' : 'Bill Summary'}
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/30">
                        {lang === 'mr' ? 'उपएकूण' : 'Subtotal'} ({totalItems} items)
                      </span>
                      <span className="text-white/50 font-semibold tabular-nums">₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/30 flex items-center gap-1">
                        <Truck size={12} />
                        {lang === 'mr' ? 'डिलिव्हरी' : 'Delivery'}
                      </span>
                      <span className="text-green-400/80 font-semibold text-xs bg-green-500/10 px-2 py-0.5 rounded-md">
                        FREE
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-white/[0.04]" />

                  <div className="flex justify-between items-center">
                    <span className="text-white/50 font-bold text-sm">{t.mandi_total}</span>
                    <span className="text-2xl font-black text-white tabular-nums tracking-tight">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fixed Bottom: Checkout */}
              <div className="flex-shrink-0 px-6 py-5 border-t border-white/[0.04] bg-[#060e1a]/90 backdrop-blur-xl">
                <button
                  onClick={handleCheckout}
                  disabled={totalItems === 0 || !userDetails.name || !userDetails.address}
                  className={clsx(
                    "w-full flex items-center justify-center gap-3 py-4 rounded-2xl",
                    "font-bold text-base text-white",
                    "bg-gradient-to-r from-green-500 to-emerald-600",
                    "hover:from-green-600 hover:to-emerald-700",
                    "active:scale-[0.97]",
                    "transition-all duration-300",
                    "shadow-[0_8px_32px_rgba(34,197,94,0.3)]",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  )}
                >
                  <Send size={18} className="text-white" strokeWidth={2} />
                  {t.mandi_checkout}
                  <span className="text-white/60 text-xs font-medium ml-1">via WhatsApp</span>
                </button>

                {/* Trust Footer */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  {[
                    { icon: Shield, text: lang === 'mr' ? 'सुरक्षित' : 'Secure' },
                    { icon: Zap, text: lang === 'mr' ? 'जलद' : 'Instant' },
                    { icon: Phone, text: 'WhatsApp' },
                  ].map((item, i) => (
                    <span key={i} className="flex items-center gap-1 text-[9px] text-white/15 font-bold uppercase tracking-wider">
                      <item.icon size={10} />
                      {item.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SimpleView>
  );
};

export default SabjiMandiView;