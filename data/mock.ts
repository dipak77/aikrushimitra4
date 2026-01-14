
import { Wheat, CloudSun, Sprout, Sun, CloudRain, ShoppingBasket, Citrus, Cherry, Leaf } from 'lucide-react';

export const MOCK_MARKET = [
  { name: 'Soyabean', price: 4850, trend: '+120', arrival: 'High', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Wheat, history: [4600, 4650, 4700, 4800, 4750, 4850] },
  { name: 'Cotton', price: 7200, trend: '-50', arrival: 'Med', color: 'text-cyan-300', bg: 'bg-cyan-500/20', icon: CloudSun, history: [7300, 7350, 7250, 7200, 7150, 7200] },
  { name: 'Onion', price: 1800, trend: '-200', arrival: 'High', color: 'text-pink-300', bg: 'bg-pink-500/20', icon: Sprout, history: [2200, 2100, 2000, 1950, 1900, 1800] },
  { name: 'Tur', price: 9200, trend: '+500', arrival: 'Low', color: 'text-emerald-300', bg: 'bg-emerald-500/20', icon: Sprout, history: [8500, 8600, 8800, 9000, 9100, 9200] },
  { name: 'Wheat', price: 2400, trend: '+10', arrival: 'High', color: 'text-yellow-300', bg: 'bg-yellow-500/20', icon: Wheat, history: [2350, 2360, 2380, 2390, 2400, 2400] },
  { name: 'Maize', price: 2100, trend: '+40', arrival: 'Med', color: 'text-orange-300', bg: 'bg-orange-500/20', icon: Sprout, history: [1900, 1950, 2000, 2050, 2080, 2100] },
  { name: 'Gram', price: 5400, trend: '-100', arrival: 'Med', color: 'text-amber-600', bg: 'bg-amber-800/20', icon: Sprout, history: [5600, 5550, 5500, 5450, 5420, 5400] },
  { name: 'Tomato', price: 1200, trend: '+150', arrival: 'Low', color: 'text-red-400', bg: 'bg-red-500/20', icon: Cherry, history: [800, 900, 1000, 1050, 1100, 1200] },
  { name: 'Potato', price: 1600, trend: '-30', arrival: 'High', color: 'text-amber-200', bg: 'bg-amber-900/20', icon: Leaf, history: [1700, 1680, 1650, 1620, 1600, 1600] },
  { name: 'Rice', price: 3200, trend: '+0', arrival: 'Med', color: 'text-teal-300', bg: 'bg-teal-500/20', icon: Wheat, history: [3200, 3200, 3150, 3180, 3200, 3200] },
];

export const WEATHER_HOURLY = [
    { time: '10 AM', temp: '26°', icon: Sun },
    { time: '11 AM', temp: '28°', icon: Sun },
    { time: '12 PM', temp: '30°', icon: CloudSun },
    { time: '1 PM', temp: '31°', icon: CloudSun },
    { time: '2 PM', temp: '32°', icon: Sun },
    { time: '3 PM', temp: '31°', icon: CloudSun },
    { time: '4 PM', temp: '30°', icon: CloudRain },
];
