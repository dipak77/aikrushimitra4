
import { Wheat, CloudSun, Sprout, Sun, CloudRain } from 'lucide-react';

export const MOCK_MARKET = [
  { name: 'Soyabean', price: 4850, trend: '+120', arrival: 'High', color: 'text-amber-300', bg: 'bg-amber-500/20', icon: Wheat, history: [4700, 4750, 4800, 4850] },
  { name: 'Cotton', price: 7200, trend: '-50', arrival: 'Med', color: 'text-cyan-300', bg: 'bg-cyan-500/20', icon: CloudSun, history: [7300, 7250, 7250, 7200] },
  { name: 'Onion', price: 1800, trend: '-200', arrival: 'High', color: 'text-pink-300', bg: 'bg-pink-500/20', icon: Sprout, history: [2000, 1950, 1900, 1800] },
  { name: 'Tur', price: 9200, trend: '+500', arrival: 'Low', color: 'text-emerald-300', bg: 'bg-emerald-500/20', icon: Sprout, history: [8500, 8800, 9000, 9200] },
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
