import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  CloudRain, TrendingUp, Lightbulb, Activity, ArrowRight, Flag, Heart, Sparkles,
  Star, Sun, Moon, Zap, Crown, Calendar as CalendarIcon, AlertTriangle
} from 'lucide-react';
import { Language, UserProfile } from '../../types';
import clsx from 'clsx';
import { MOCK_MARKET } from '../../data/mock';
import { DASH_TEXT } from './constants';
import { getLiveAgriUpdates } from '../../services/geminiService';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type Badge = {
  label: Record<string, string>;
  bg: string;
  icon?: React.ComponentType<any>;
};

type Palette = {
  a: string;   // primary color
  b: string;   // secondary color
  c: string;   // accent / highlight
  spark: string[];
};

type Slide = {
  id: string;
  tag: Record<string, string>;
  title: Record<string, string>;
  sub: Record<string, string>;
  cta: Record<string, string>;
  icon: React.ComponentType<any>;
  pal: Palette;
  badges: Badge[];
  special?: boolean;
};

/* ═══════════════════════════════════════════════════════════════
   PALETTES — vivid two-tone + accent
   ═══════════════════════════════════════════════════════════════ */

const P: Record<string, Palette> = {
  india:   { a: '#FF8C00', b: '#15803D', c: '#FFD700', spark: ['#FF8C00','#FFD700','#fff','#15803D','#FFA500'] },
  storm:   { a: '#2563EB', b: '#7C3AED', c: '#38BDF8', spark: ['#3B82F6','#8B5CF6','#38BDF8','#A78BFA','#6366F1'] },
  jade:    { a: '#059669', b: '#0D9488', c: '#6EE7B7', spark: ['#10B981','#34D399','#14B8A6','#6EE7B7','#2DD4BF'] },
  orchid:  { a: '#9333EA', b: '#DB2777', c: '#E879F9', spark: ['#A855F7','#EC4899','#D946EF','#F472B6','#C084FC'] },
  sun:     { a: '#EA580C', b: '#D97706', c: '#FDE047', spark: ['#F59E0B','#FBBF24','#FB923C','#FDE047','#FCD34D'] },
  night:   { a: '#4F46E5', b: '#6D28D9', c: '#A5B4FC', spark: ['#6366F1','#8B5CF6','#A78BFA','#818CF8','#C4B5FD'] },
  bull:    { a: '#059669', b: '#0891B2', c: '#34D399', spark: ['#10B981','#06B6D4','#34D399','#22D3EE','#2DD4BF'] },
  bear:    { a: '#DC2626', b: '#EA580C', c: '#FCA5A5', spark: ['#EF4444','#F97316','#FB7185','#FBBF24','#F87171'] },
  gold:    { a: '#D97706', b: '#EA580C', c: '#FDE68A', spark: ['#FBBF24','#F59E0B','#FB923C','#FDE047','#FCD34D'] },
};

/* ═══════════════════════════════════════════════════════════════
   TIMING
   ═══════════════════════════════════════════════════════════════ */

const SLIDE_DUR = 600;
const AUTO_MS = 7200;
const N_PARTICLES = 22;

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export const SmartBanner = ({
  lang, className, weather, user,
}: {
  lang: Language;
  className?: string;
  weather?: any;
  user?: UserProfile;
}) => {
  /* ── state ── */
  const [ci, setCi] = useState(0);
  const [anim, setAnim] = useState<'idle'|'out'|'in'>('idle');
  const [live, setLive] = useState<any[]>([]);
  const [aiSync, setAiSync] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [paused, setPaused] = useState(false);
  const [noMo, setNoMo] = useState(false);
  const [hover, setHover] = useState(false);
  const [swX, setSwX] = useState<number|null>(null);

  const root = useRef<HTMLDivElement>(null);
  const raf = useRef<number>();
  const tmr = useRef<ReturnType<typeof setInterval>>();

  const txt = DASH_TEXT[lang];

  /* ── clock ── */
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);

  /* ── reduced motion ── */
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion:reduce)');
    if (!mq) return;
    const fn = () => setNoMo(mq.matches);
    fn(); mq.addEventListener?.('change', fn);
    return () => mq.removeEventListener?.('change', fn);
  }, []);

  /* ── visibility ── */
  useEffect(() => {
    const fn = () => setPaused(document.visibilityState === 'hidden');
    fn(); document.addEventListener('visibilitychange', fn);
    return () => document.removeEventListener('visibilitychange', fn);
  }, []);

  /* ── parallax (CSS vars only) ── */
  useEffect(() => {
    const el = root.current;
    if (!el || noMo || !window.matchMedia?.('(pointer:fine)').matches) return;
    const onM = (e: PointerEvent) => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (((e.clientX-r.left)/r.width)-.5).toFixed(3));
        el.style.setProperty('--my', (((e.clientY-r.top)/r.height)-.5).toFixed(3));
      });
    };
    const onL = () => { el.style.setProperty('--mx','0'); el.style.setProperty('--my','0'); };
    el.addEventListener('pointermove', onM, {passive:true});
    el.addEventListener('pointerleave', onL, {passive:true});
    return () => { if(raf.current) cancelAnimationFrame(raf.current); el.removeEventListener('pointermove',onM); el.removeEventListener('pointerleave',onL); };
  }, [noMo]);

  /* ── data ── */
  const temp = weather?.current?.temperature_2m ? Math.round(weather.current.temperature_2m) : '--';
  const wCode = weather?.current?.weather_code || 0;
  const isDay = weather?.current?.is_day !== 0;
  const wind = weather?.current?.wind_speed_10m || 0;
  const wDesc = txt.weather_desc[wCode] || txt.weather_desc[0];
  const rainy = wCode >= 51, stormy = wCode >= 95, hiWind = wind > 20;

  const crop = user?.crop || 'Soyabean';
  const mkt = MOCK_MARKET.find(m => m.name.toLowerCase().includes(crop.toLowerCase())) || MOCK_MARKET[0];
  const cropL = txt.crops[mkt.name] || mkt.name;
  const bull = mkt.trend.includes('+');

  const dn: Record<string,string[]> = {
    mr:['रवि','सोम','मंगळ','बुध','गुरु','शुक्र','शनि'],
    hi:['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि'],
    en:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  };
  const mn: Record<string,string[]> = {
    mr:['जानेवारी','फेब्रुवारी','मार्च','एप्रिल','मे','जून','जुलै','ऑगस्ट','सप्टेंबर','ऑक्टोबर','नोव्हेंबर','डिसेंबर'],
    hi:['जनवरी','फरवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'],
    en:['January','February','March','April','May','June','July','August','September','October','November','December'],
  };

  const dy = dn[lang]?.[now.getDay()] ?? dn.en[now.getDay()];
  const dt = now.getDate();
  const mo = mn[lang]?.[now.getMonth()] ?? mn.en[now.getMonth()];
  const yr = now.getFullYear();
  const tm = now.toLocaleTimeString(lang==='en'?'en-US':'hi-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
  const repDay = now.getMonth()===0 && now.getDate()===26;

  /* ── AI fetch ── */
  useEffect(() => {
    let ok = true;
    (async()=>{
      try { setAiSync(true); await new Promise(r=>setTimeout(r,800));
        const u = await getLiveAgriUpdates(lang);
        if(ok && u?.length) setLive(u);
      } catch{} finally{ if(ok) setAiSync(false); }
    })();
    const t = setInterval(async()=>{
      try{ const u = await getLiveAgriUpdates(lang); if(ok&&u?.length) setLive(u); }catch{}
    }, 10*60000);
    return()=>{ ok=false; clearInterval(t); };
  }, [lang]);

  /* ── particle seeds (stable) ── */
  const seeds = useMemo(() => Array.from({length:N_PARTICLES},(_,i)=>({
    i, x:Math.random()*100, y:Math.random()*100,
    s:2+Math.random()*5, dx:-20+Math.random()*40,
    dy:-28-Math.random()*20, dur:4+Math.random()*5,
    del:Math.random()*5, a:.12+Math.random()*.38,
    blur:Math.random()>.75,
  })),[]);

  /* ── build slides ── */
  const slides: Slide[] = useMemo(() => {
    const s: Slide[] = [];

    if (repDay) s.push({
      id:'rep', icon:Flag, pal:P.india, special:true,
      tag:{mr:'राष्ट्रीय सण',hi:'राष्ट्रीय पर्व',en:'National Festival'},
      title:{mr:'🇮🇳 प्रजासत्ताक दिन शुभेच्छा',hi:'🇮🇳 गणतंत्र दिवस की शुभकामनाएं',en:'🇮🇳 Happy Republic Day'},
      sub:{mr:'भारताच्या 77व्या प्रजासत्ताक दिनाच्या हार्दिक शुभेच्छा',hi:'भारत के 77वें गणतंत्र दिवस की हार्दिक शुभकामनाएं',en:'Celebrating 77 years of Indian Democracy & Unity'},
      cta:{mr:'शेअर करा',hi:'शेयर करें',en:'Share'},
      badges:[
        {label:{mr:'77वा',hi:'77वां',en:'77th'},bg:'from-orange-500 to-amber-400',icon:Star},
        {label:{mr:'26 जानेवारी',hi:'26 जनवरी',en:'Jan 26'},bg:'from-green-600 to-emerald-500',icon:Flag},
      ],
    });

    if (stormy||(rainy&&hiWind)) s.push({
      id:'storm', icon:AlertTriangle, pal:P.storm,
      tag:{mr:'⚠️ हवामान इशारा',hi:'⚠️ मौसम चेतावनी',en:'⚠️ Weather Alert'},
      title:{mr:stormy?'वादळी पावसाची शक्यता!':'जोरदार पाऊस अपेक्षित',hi:stormy?'तूफानी बारिश संभावित!':'तेज बारिश की संभावना',en:stormy?'Storm Alert!':'Heavy Rain Expected'},
      sub:{mr:`वेग: ${wind} किमी/तास • पिकांची काळजी घ्या`,hi:`गति: ${wind} किमी/घंटा • फसल सुरक्षा करें`,en:`Wind: ${wind} km/h • Secure your crops`},
      cta:{mr:'सल्ला पहा',hi:'सलाह देखें',en:'View Tips'},
      badges:[
        {label:{mr:'तातडीचे',hi:'अत्यावश्यक',en:'Urgent'},bg:'from-red-600 to-rose-500',icon:AlertTriangle},
        {label:{mr:`${wind}km/h`,hi:`${wind}km/h`,en:`${wind}km/h`},bg:'from-blue-500 to-cyan-500'},
      ],
    });

    live.slice(0,3).forEach((u,i)=>{
      const sc = u.type==='scheme';
      s.push({
        id:`ai${i}`, icon:sc?Crown:TrendingUp, pal:sc?P.jade:P.orchid,
        tag:sc?{mr:'🎯 सरकारी योजना',hi:'🎯 सरकारी योजना',en:'🎯 Govt Scheme'}:{mr:'📊 बाजार अपडेट',hi:'📊 बाजार अपडेट',en:'📊 Market Update'},
        title:{mr:u.title,hi:u.title,en:u.title},
        sub:{mr:u.subtitle,hi:u.subtitle,en:u.subtitle},
        cta:{mr:'तपशील',hi:'विवरण',en:'Details'},
        badges:[
          {label:{mr:u.badge||'नवीन',hi:u.badge||'नया',en:u.badge||'New'},bg:sc?'from-emerald-500 to-teal-500':'from-purple-500 to-pink-500'},
          {label:{mr:'AI',hi:'AI',en:'AI'},bg:'from-cyan-400 to-blue-500',icon:Sparkles},
        ],
      });
    });

    if(s.length<2) s.push({
      id:'cal', icon:CalendarIcon, pal:P.orchid,
      tag:{mr:'📅 आजचा दिवस',hi:'📅 आज का दिन',en:'📅 Today'},
      title:{mr:`${dy}, ${dt} ${mo}`,hi:`${dy}, ${dt} ${mo}`,en:`${dy}, ${mo} ${dt}`},
      sub:{mr:`${yr} • ${tm} • पिकांची काळजी घ्या`,hi:`${yr} • ${tm} • फसल की देखभाल करें`,en:`${yr} • ${tm} • Perfect day for farming`},
      cta:{mr:'कॅलेंडर',hi:'कैलेंडर',en:'Calendar'},
      badges:[
        {label:{mr:dy,hi:dy,en:dy},bg:'from-purple-500 to-pink-500'},
        {label:{mr:`${dt}`,hi:`${dt}`,en:`${dt}`},bg:'from-pink-500 to-rose-500'},
      ],
    });

    if(!stormy&&!hiWind&&s.length<3&&temp!=='--') s.push({
      id:'wx', icon:rainy?CloudRain:isDay?Sun:Moon, pal:isDay?P.sun:P.night,
      tag:{mr:'🌤️ हवामान',hi:'🌤️ मौसम',en:'🌤️ Weather'},
      title:rainy?{mr:'पावसाची शक्यता',hi:'बारिश की संभावना',en:'Rain Expected'}:{mr:`${wDesc} • ${temp}°C`,hi:`${wDesc} • ${temp}°C`,en:`${wDesc} • ${temp}°C`},
      sub:{mr:`तापमान ${temp}°C • शेतीसाठी ${isDay?'चांगले':'शांत'} हवामान`,hi:`तापमान ${temp}°C • खेती के लिए ${isDay?'अच्छा':'शांत'} मौसम`,en:`Temp ${temp}°C • ${isDay?'Good':'Calm'} for farming`},
      cta:{mr:'तपशील',hi:'विवरण',en:'Forecast'},
      badges:[
        {label:{mr:`${temp}°C`,hi:`${temp}°C`,en:`${temp}°C`},bg:isDay?'from-amber-400 to-orange-500':'from-indigo-500 to-purple-600'},
      ],
    });

    if(s.length<4) s.push({
      id:'mkt', icon:TrendingUp, pal:bull?P.bull:P.bear,
      tag:{mr:'💹 बाजार',hi:'💹 मार्केट',en:'💹 Market'},
      title:{mr:`${cropL}: ₹${mkt.price}`,hi:`${cropL}: ₹${mkt.price}`,en:`${cropL}: ₹${mkt.price}`},
      sub:{mr:`आवक: ${mkt.arrival} • ${mkt.trend}`,hi:`आवक: ${mkt.arrival} • ${mkt.trend}`,en:`Arrival: ${mkt.arrival} • ${mkt.trend}`},
      cta:{mr:'भाव',hi:'कीमत',en:'Rates'},
      badges:[
        {label:{mr:bull?'📈 तेजी':'📉 घसरण',hi:bull?'📈 बढ़त':'📉 गिरावट',en:bull?'📈 Bullish':'📉 Bearish'},bg:bull?'from-emerald-500 to-teal-500':'from-red-500 to-rose-500'},
        {label:{mr:mkt.trend,hi:mkt.trend,en:mkt.trend},bg:bull?'from-cyan-400 to-teal-400':'from-orange-400 to-amber-400'},
      ],
    });

    if(s.length<5) s.push({
      id:'tip', icon:Lightbulb, pal:P.gold,
      tag:{mr:'💡 स्मार्ट टीप',hi:'💡 स्मार्ट टिप',en:'💡 Smart Tip'},
      title:isDay?{mr:'फवारणीसाठी योग्य वेळ',hi:'छिड़काव का सही समय',en:'Perfect Spray Time'}:{mr:'पिकांना थंडीपासून वाचवा',hi:'फसलों को ठंड से बचाएं',en:'Protect from Cold'},
      sub:isDay?{mr:'वारा कमी • दुपारी ४ पर्यंत फवारणी करा',hi:'हवा कम • शाम 4 तक छिड़काव करें',en:'Low wind — spray before 4 PM'}:{mr:'रात्री तापमान कमी • पाणी द्या',hi:'रात तापमान गिरेगा • सिंचाई करें',en:'Temp drops tonight — irrigate'},
      cta:{mr:'सल्ला',hi:'सलाह',en:'Read'},
      badges:[
        {label:{mr:'AI',hi:'AI',en:'AI'},bg:'from-amber-400 to-yellow-400',icon:Zap},
        {label:{mr:'टीप',hi:'टिप',en:'Tip'},bg:'from-orange-400 to-amber-500'},
      ],
    });

    return s;
  }, [repDay,stormy,rainy,hiWind,wind,temp,wDesc,isDay,dy,dt,mo,yr,tm,live,lang,cropL,mkt,bull]);

  /* ── nav ── */
  const go = useCallback((n:number) => {
    if(anim!=='idle'||slides.length<=1) return;
    setAnim('out');
    setTimeout(()=>{ setCi(((n%slides.length)+slides.length)%slides.length); setAnim('in');
      setTimeout(()=>setAnim('idle'), SLIDE_DUR);
    }, SLIDE_DUR);
  },[anim,slides.length]);
  const nxt = useCallback(()=>go(ci+1),[ci,go]);
  const prv = useCallback(()=>go(ci-1),[ci,go]);

  /* ── auto ── */
  useEffect(()=>{
    if(slides.length<=1||noMo||paused||hover) return;
    tmr.current=setInterval(nxt,AUTO_MS);
    return()=>{if(tmr.current)clearInterval(tmr.current)};
  },[slides.length,noMo,paused,hover,nxt]);

  /* ── swipe ── */
  const tsS=(e:React.TouchEvent)=>setSwX(e.touches[0].clientX);
  const tsE=(e:React.TouchEvent)=>{if(swX===null)return;const d=e.changedTouches[0].clientX-swX;if(Math.abs(d)>50)d>0?prv():nxt();setSwX(null);};

  /* ── resolve ── */
  const si = ci>=slides.length?0:ci;
  const sl = slides[si];
  if(!sl) return null;
  const {pal,icon:Ic} = sl;
  const pc = sl.special?N_PARTICLES:16;

  return (
    <div
      ref={root}
      className={clsx(
        'SB group relative flex flex-1 w-full lg:max-w-5xl lg:mx-auto',
        'min-h-[110px] lg:min-h-[148px]',
        'rounded-[26px] lg:rounded-[30px] overflow-hidden',
        'select-none cursor-default',
        paused&&'SB--paused',
        className,
      )}
      style={{
        boxShadow: hover
          ? `0 30px 90px -18px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.06), 0 0 80px -20px ${pal.a}50`
          : `0 22px 70px -16px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04)`,
        transition: 'box-shadow .6s ease',
      }}
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      onTouchStart={tsS} onTouchEnd={tsE}
      onKeyDown={e=>{if(e.key==='ArrowRight')nxt();if(e.key==='ArrowLeft')prv();}}
      tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Smart Dashboard"
    >
      {/* ═══ STYLES ═══ */}
      <style>{`
        .SB{--mx:0;--my:0;isolation:isolate;contain:layout paint}
        .SB--paused,.SB--paused *{animation-play-state:paused!important}
        .SB:focus-visible{outline:2px solid rgba(255,255,255,.5);outline-offset:4px}

        /* ── transitions ── */
        @keyframes SB-in{
          0%{opacity:0;transform:translate3d(0,10px,0) scale(.98)}
          100%{opacity:1;transform:translate3d(0,0,0) scale(1)}
        }
        @keyframes SB-out{
          0%{opacity:1;transform:translate3d(0,0,0) scale(1)}
          100%{opacity:0;transform:translate3d(0,-10px,0) scale(.98)}
        }

        /* ── background aurora ── */
        @keyframes SB-aurora{
          0%,100%{transform:translate3d(calc(var(--mx)*14px),calc(var(--my)*14px),0) rotate(0deg) scale(1);opacity:.55}
          33%{transform:translate3d(calc(var(--mx)*-10px + 6px),calc(var(--my)*-10px),0) rotate(60deg) scale(1.15);opacity:.7}
          66%{transform:translate3d(calc(var(--mx)*8px - 4px),calc(var(--my)*12px),0) rotate(120deg) scale(.95);opacity:.6}
        }

        /* ── mesh drift ── */
        @keyframes SB-mesh{
          0%,100%{background-position:0% 50%}
          50%{background-position:100% 50%}
        }

        /* ── particles ── */
        @keyframes SB-float{
          0%,100%{transform:translate3d(0,0,0) scale(1);opacity:var(--a)}
          30%{transform:translate3d(calc(var(--dx)*.4),calc(var(--dy)*.3),0) scale(.85);opacity:calc(var(--a)*.7)}
          60%{transform:translate3d(var(--dx),var(--dy),0) scale(.65);opacity:calc(var(--a)*.35)}
          85%{transform:translate3d(calc(var(--dx)*.6),calc(var(--dy)*.8),0) scale(.9);opacity:calc(var(--a)*.55)}
        }

        /* ── shine ── */
        @keyframes SB-shine{
          0%{transform:translateX(-200%) skewX(-16deg);opacity:0}
          20%{opacity:.4}
          80%{opacity:.4}
          100%{transform:translateX(300%) skewX(-16deg);opacity:0}
        }

        /* ── icon glow ── */
        @keyframes SB-iglow{
          0%,100%{box-shadow:0 0 24px var(--g1),0 0 60px var(--g2)}
          50%{box-shadow:0 0 40px var(--g1),0 0 90px var(--g2),0 0 120px var(--g3)}
        }

        /* ── badge breathe ── */
        @keyframes SB-badge{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}

        /* ── live ping ── */
        @keyframes SB-ping{
          0%{transform:scale(1);opacity:1}
          80%{transform:scale(2.8);opacity:0}
          100%{transform:scale(2.8);opacity:0}
        }

        /* ── progress ── */
        @keyframes SB-prog{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}

        /* ── cta shimmer ── */
        @keyframes SB-cta{
          0%{background-position:-200% center}
          100%{background-position:200% center}
        }

        /* ── title gradient scroll ── */
        @keyframes SB-title{
          0%{background-position:0% 50%}
          50%{background-position:100% 50%}
          100%{background-position:0% 50%}
        }

        @media(prefers-reduced-motion:reduce){
          .SB .SBa,.SB .SBa *{animation:none!important;transition:none!important}
        }
      `}</style>

      {/* ═══ BG-1: DEEP BLACK BASE ═══ */}
      <div className="absolute inset-0" style={{background:'#050508'}} />

      {/* ═══ BG-2: DUAL COLOR BLEED (rich color on black) ═══ */}
      <div className="absolute inset-0" style={{
        background:`
          radial-gradient(ellipse 70% 80% at 0% 30%, ${pal.a}45 0%, transparent 60%),
          radial-gradient(ellipse 70% 80% at 100% 70%, ${pal.b}40 0%, transparent 60%)
        `,
      }} />

      {/* ═══ BG-3: AURORA BLOBS (animated, pointer-reactive) ═══ */}
      <div className="absolute inset-0 pointer-events-none SBa" style={{
        animation:'SB-aurora 10s ease-in-out infinite',
        background:`
          radial-gradient(500px 420px at 22% 35%, ${pal.a}55 0%, ${pal.a}12 35%, transparent 65%),
          radial-gradient(480px 400px at 78% 65%, ${pal.b}48 0%, ${pal.b}10 35%, transparent 65%),
          radial-gradient(350px 350px at 50% 50%, ${pal.c}20 0%, transparent 55%)
        `,
        mixBlendMode:'screen',
      }} />

      {/* ═══ BG-4: MESH GRADIENT (shifting) ═══ */}
      <div className="absolute inset-0 pointer-events-none SBa" style={{
        background:`linear-gradient(135deg, ${pal.a}18 0%, transparent 30%, ${pal.c}12 50%, transparent 70%, ${pal.b}15 100%)`,
        backgroundSize:'300% 300%',
        animation:'SB-mesh 14s ease-in-out infinite',
        mixBlendMode:'screen',
        opacity:.6,
      }} />

      {/* ═══ BG-5: TOP SPECULAR HIGHLIGHT ═══ */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background:'radial-gradient(120% 50% at 50% -10%, rgba(255,255,255,.08) 0%, transparent 55%)',
      }} />

      {/* ═══ BG-6: BOTTOM DEPTH SHADOW ═══ */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background:'linear-gradient(180deg, transparent 50%, rgba(0,0,0,.45) 100%)',
      }} />

      {/* ═══ BG-7: NOISE GRAIN ═══ */}
      <div className="absolute inset-0 pointer-events-none opacity-[.18]" style={{
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.06'/%3E%3C/svg%3E")`,
        backgroundSize:'128px 128px',
        mixBlendMode:'overlay',
      }} />

      {/* ═══ BG-8: PARTICLES ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {seeds.slice(0,pc).map(p=>{
          const c=pal.spark[p.i%pal.spark.length];
          return(
            <span key={p.i} className="absolute rounded-full SBa" style={{
              top:`${p.y}%`,left:`${p.x}%`,
              width:p.s,height:p.s,
              background:`radial-gradient(circle,${c} 0%,${c}00 70%)`,
              boxShadow:`0 0 ${p.s*4}px ${c}60, 0 0 ${p.s*8}px ${c}25`,
              filter:p.blur?'blur(1px)':undefined,
              '--dx':`${p.dx}px`,'--dy':`${p.dy}px`,'--a':`${p.a}`,
              animation:`SB-float ${p.dur}s ease-in-out ${p.del}s infinite`,
            } as React.CSSProperties} />
          );
        })}
      </div>

      {/* ═══ BG-9: SHINE SWEEP ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-y-0 w-[45%] SBa" style={{
          background:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,.04) 30%,rgba(255,255,255,.14) 50%,rgba(255,255,255,.04) 70%,transparent 100%)',
          animation:'SB-shine 9s ease-in-out 1.5s infinite',
        }} />
      </div>

      {/* ═══ BG-10: TOP EDGE LIGHT ═══ */}
      <div className="absolute top-0 left-6 right-6 h-px pointer-events-none" style={{
        background:`linear-gradient(90deg, transparent 0%, ${pal.a}35 20%, rgba(255,255,255,.2) 50%, ${pal.b}35 80%, transparent 100%)`,
      }} />

      {/* ═══ BG-11: BOTTOM ACCENT BAR ═══ */}
      <div className="absolute bottom-0 inset-x-0 h-[2.5px] pointer-events-none overflow-hidden">
        <div className="h-full" style={{
          background:`linear-gradient(90deg, transparent 0%, ${pal.a} 15%, ${pal.c} 40%, ${pal.b} 65%, ${pal.a} 85%, transparent 100%)`,
          backgroundSize:'200% 100%',
          animation: noMo?undefined:'SB-mesh 5s linear infinite',
          boxShadow:`0 0 20px ${pal.a}80, 0 0 40px ${pal.b}50, 0 -4px 16px ${pal.c}30`,
        }} />
        {slides.length>1&&!noMo&&!paused&&!hover&&(
          <div className="absolute bottom-0 left-0 h-full origin-left" style={{
            background:'rgba(255,255,255,.55)',
            animation:`SB-prog ${AUTO_MS}ms linear infinite`,
          }} />
        )}
      </div>

      {/* ═══ CONTENT ═══ */}
      <div
        className={clsx(
          'relative z-10 w-full h-full flex flex-col lg:flex-row',
          'items-start lg:items-center justify-between',
          'px-5 py-[18px] lg:px-8 lg:py-6 gap-3 lg:gap-6',
          'SBa',
          anim==='out'&&`animate-[SB-out_${SLIDE_DUR}ms_cubic-bezier(.4,0,.2,1)_forwards]`,
          anim==='in'&&`animate-[SB-in_${SLIDE_DUR}ms_cubic-bezier(0,0,.2,1)_forwards]`,
        )}
        style={{transform:'translate3d(calc(var(--mx)*2px),calc(var(--my)*2px),0)'}}
      >
        {/* ── LEFT ── */}
        <div className="flex items-start lg:items-center gap-4 lg:gap-5 flex-1 min-w-0 w-full">

          {/* ── ICON ── */}
          <div className="relative shrink-0 group/icon">
            {/* Outer aurora glow */}
            <div className="absolute -inset-4 rounded-3xl pointer-events-none SBa" style={{
              background:`
                radial-gradient(circle at 35% 35%, ${pal.a}60 0%, transparent 55%),
                radial-gradient(circle at 65% 65%, ${pal.b}50 0%, transparent 55%)
              `,
              filter:'blur(14px)',
              animation:'SB-iglow 4s ease-in-out infinite',
              '--g1':`${pal.a}35`,'--g2':`${pal.b}25`,'--g3':`${pal.c}15`,
            } as React.CSSProperties} />

            {/* Icon card */}
            <div
              className="relative w-[52px] h-[52px] lg:w-[62px] lg:h-[62px] rounded-[18px] lg:rounded-[20px] overflow-hidden"
              style={{
                background:`linear-gradient(145deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.04) 50%,rgba(0,0,0,.1) 100%)`,
                backdropFilter:'blur(20px) saturate(1.8)',
                WebkitBackdropFilter:'blur(20px) saturate(1.8)',
                border:'1px solid rgba(255,255,255,.12)',
                boxShadow:`
                  inset 0 1px 0 rgba(255,255,255,.2),
                  inset 0 -1px 0 rgba(0,0,0,.25),
                  0 16px 48px -8px rgba(0,0,0,.7),
                  0 0 0 1px rgba(255,255,255,.06)
                `,
                transform:'translate3d(calc(var(--mx)*5px),calc(var(--my)*5px),0)',
              }}
            >
              {/* Color wash inside card */}
              <div className="absolute inset-0" style={{
                background:`linear-gradient(145deg, ${pal.a}30 0%, transparent 45%, ${pal.b}22 100%)`,
              }} />
              {/* Specular top */}
              <div className="absolute top-0 left-2 right-2 h-[1.5px]"
                style={{background:`linear-gradient(90deg,transparent,${pal.c}50,rgba(255,255,255,.5),${pal.c}50,transparent)`}}
              />
              {/* Centered icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Ic size={26} strokeWidth={2.2} className="text-white relative z-10"
                  style={{filter:`drop-shadow(0 0 10px ${pal.a}90) drop-shadow(0 4px 8px rgba(0,0,0,.5))`}}
                />
              </div>
            </div>

            {/* Special star */}
            {sl.special&&(
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center SBa"
                style={{
                  background:`linear-gradient(135deg,${pal.c},${pal.a})`,
                  boxShadow:`0 0 12px ${pal.c}80, 0 2px 8px rgba(0,0,0,.4)`,
                  animation:'SB-badge 2s ease-in-out infinite',
                }}>
                <Star size={10} fill="currentColor" className="text-white" />
              </div>
            )}
          </div>

          {/* ── TEXT ── */}
          <div className="flex flex-col gap-[5px] lg:gap-[7px] flex-1 min-w-0">
            {/* Tag + Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Category */}
              <span className="inline-flex items-center text-[9px] lg:text-[10px] font-bold uppercase tracking-[.13em] text-white/80 bg-white/[.06] border border-white/[.1] backdrop-blur-sm px-2.5 py-[3px] rounded-full">
                {sl.tag[lang]||sl.tag.en}
              </span>
              {/* Badges */}
              {sl.badges.slice(0,2).map((b,i)=>(
                <span key={i} className={clsx(
                  'inline-flex items-center gap-[3px] px-2.5 py-[3px] rounded-full',
                  'text-[9px] lg:text-[10px] font-extrabold uppercase tracking-wide text-white',
                  `bg-gradient-to-r ${b.bg}`,
                  'border border-white/20',
                  'SBa',
                )} style={{
                  boxShadow:`0 2px 12px rgba(0,0,0,.3), 0 0 16px ${pal.a}18`,
                  animation:noMo?undefined:`SB-badge ${2.6+i*.3}s ease-in-out infinite`,
                }}>
                  {b.icon&&<b.icon size={9} strokeWidth={3}/>}
                  {b.label[lang]||b.label.en}
                </span>
              ))}
            </div>

            {/* Title — gradient animated text */}
            <h2 className="text-[19px] lg:text-[24px] font-black leading-[1.15] tracking-tight line-clamp-1"
              style={{
                background:`linear-gradient(90deg, #fff 0%, ${pal.c} 30%, #fff 50%, ${pal.c} 70%, #fff 100%)`,
                backgroundSize:'300% 100%',
                WebkitBackgroundClip:'text',
                WebkitTextFillColor:'transparent',
                backgroundClip:'text',
                animation: noMo?undefined:'SB-title 6s ease-in-out infinite',
                filter:`drop-shadow(0 2px 8px rgba(0,0,0,.5))`,
              }}>
              {sl.title[lang]||sl.title.en}
            </h2>

            {/* Subtitle */}
            <p className="text-[11px] lg:text-[13px] font-semibold leading-snug text-white/65 line-clamp-1 tracking-wide"
              style={{textShadow:'0 1px 8px rgba(0,0,0,.5)'}}>
              {sl.sub[lang]||sl.sub.en}
            </p>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="flex items-center justify-between w-full lg:w-auto lg:gap-4 shrink-0">

          {/* Divider (lg) */}
          <div className="hidden lg:block h-16 w-px" style={{
            background:`linear-gradient(180deg, transparent 0%, ${pal.a}30 25%, rgba(255,255,255,.12) 50%, ${pal.b}30 75%, transparent 100%)`,
          }} />

          {/* CTA — premium shimmer button */}
          <button
            className={clsx(
              'group/c relative overflow-hidden',
              'px-5 py-2.5 lg:px-6 lg:py-3',
              'rounded-[14px] lg:rounded-[16px]',
              'border border-white/15',
              'transition-all duration-300',
              'hover:scale-[1.04] hover:border-white/30',
              'active:scale-[.97]',
              'focus-visible:outline-2 focus-visible:outline-white/40 focus-visible:outline-offset-2',
            )}
            style={{
              background:`linear-gradient(145deg,rgba(255,255,255,.1) 0%,rgba(255,255,255,.03) 100%)`,
              backdropFilter:'blur(16px)',
              WebkitBackdropFilter:'blur(16px)',
              boxShadow:`0 10px 36px -8px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.12)`,
              transform:'translate3d(calc(var(--mx)*-3px),calc(var(--my)*-3px),0)',
            }}
            aria-label={`${sl.cta[lang]||sl.cta.en} — ${sl.title[lang]||sl.title.en}`}
          >
            {/* Shimmer */}
            <div className="absolute inset-0 opacity-0 group-hover/c:opacity-100 transition-opacity duration-500" style={{
              background:`linear-gradient(90deg, transparent 20%, ${pal.a}15 40%, ${pal.c}20 50%, ${pal.b}15 60%, transparent 80%)`,
              backgroundSize:'200% 100%',
              animation:'SB-cta 2s linear infinite',
            }} />
            {/* Hover color fill */}
            <div className="absolute inset-0 opacity-0 group-hover/c:opacity-100 transition-opacity duration-300" style={{
              background:`linear-gradient(135deg, ${pal.a}15, ${pal.b}12)`,
            }} />
            {/* Top specular */}
            <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            {/* Label */}
            <span className="relative flex items-center gap-2">
              <span className="text-[11px] lg:text-[13px] font-bold text-white tracking-wide">{sl.cta[lang]||sl.cta.en}</span>
              <ArrowRight size={14} strokeWidth={2.5}
                className="text-white/70 group-hover/c:text-white group-hover/c:translate-x-0.5 transition-all duration-300"
              />
            </span>
          </button>

          {/* Status + Dots */}
          <div className="flex flex-col items-end gap-2 ml-3 lg:ml-0">
            {/* Live pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{
              background:'rgba(0,0,0,.3)',
              border:'1px solid rgba(255,255,255,.08)',
              backdropFilter:'blur(12px)',
            }}>
              <Activity size={10} strokeWidth={3} className="text-emerald-400" />
              <span className="text-[8px] font-bold text-white/80 uppercase tracking-[.08em]">
                {aiSync?'Sync':'Live'}
              </span>
              <span className="relative flex h-[6px] w-[6px]">
                {!aiSync&&(
                  <span className="absolute inset-0 rounded-full bg-emerald-400 SBa"
                    style={{animation:'SB-ping 1.6s ease-out infinite'}}
                  />
                )}
                <span className={clsx('relative rounded-full h-[6px] w-[6px]',aiSync?'bg-amber-400':'bg-emerald-400')}
                  style={{boxShadow:aiSync?'0 0 6px rgba(251,191,36,.8)':'0 0 8px rgba(52,211,153,.9), 0 0 20px rgba(52,211,153,.35)'}}
                />
              </span>
            </div>

            {/* Dots */}
            {slides.length>1&&(
              <div className="flex items-center gap-[5px]" role="tablist">
                {slides.map((_,i)=>(
                  <button key={i} role="tab" aria-selected={i===si}
                    aria-label={`Slide ${i+1}`} onClick={()=>go(i)}
                    className={clsx(
                      'rounded-full transition-all duration-400',
                      'focus-visible:outline-1 focus-visible:outline-white/40',
                      i===si?'h-[6px] w-8':'h-[5px] w-[5px] bg-white/20 hover:bg-white/40',
                    )}
                    style={i===si?{
                      background:`linear-gradient(90deg,${pal.a},${pal.c},${pal.b})`,
                      boxShadow:`0 0 14px ${pal.a}60, 0 0 6px ${pal.b}40`,
                    }:undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ CORNER JEWELS ═══ */}
      <div className="absolute top-[14px] left-[18px] flex gap-[5px] opacity-50 pointer-events-none">
        {[pal.a,pal.c,pal.b].map((c,i)=>(
          <span key={i} className="w-[6px] h-[6px] rounded-full"
            style={{background:c, boxShadow:`0 0 8px ${c}70`}}
          />
        ))}
      </div>

      {/* ═══ SPECIAL DECORATIONS ═══ */}
      {sl.special&&(
        <>
          <Sparkles size={18} strokeWidth={2.5}
            className="absolute top-[14px] right-[18px] pointer-events-none SBa"
            style={{color:pal.c,filter:`drop-shadow(0 0 14px ${pal.c})`,animation:'SB-badge 2.5s ease-in-out infinite'}}
          />
          <Heart size={12} fill="currentColor"
            className="absolute bottom-[14px] right-[18px] pointer-events-none SBa"
            style={{color:'#f87171',filter:'drop-shadow(0 0 10px rgba(248,113,113,.8))',animation:'SB-badge 2s ease-in-out .3s infinite'}}
          />
          <Zap size={14} fill="currentColor"
            className="absolute bottom-[14px] left-[18px] pointer-events-none SBa"
            style={{color:pal.c,filter:`drop-shadow(0 0 10px ${pal.c}90)`,animation:'SB-badge 2.8s ease-in-out .6s infinite'}}
          />
        </>
      )}
    </div>
  );
};