
import { Wheat, CloudSun, Sprout, Sun, CloudRain, ShoppingBasket, Citrus, Cherry, Leaf, Droplets, Bug, Scissors, Ruler } from 'lucide-react';

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

export const MOCK_VEGETABLES = [
    { id: 1, nameMr: 'टोमॅटो', nameHi: 'टमाटर', nameEn: 'Tomato', price: 30, unit: 'kg', category: 'veg', image: '🍅' },
    { id: 2, nameMr: 'कांदा', nameHi: 'प्याज़', nameEn: 'Onion', price: 40, unit: 'kg', category: 'veg', image: '🧅' },
    { id: 3, nameMr: 'बटाटा', nameHi: 'आलू', nameEn: 'Potato', price: 35, unit: 'kg', category: 'veg', image: '🥔' },
    { id: 4, nameMr: 'कोथिंबीर', nameHi: 'धनिया', nameEn: 'Coriander', price: 15, unit: 'bunch', category: 'leafy', image: '🌿' },
    { id: 5, nameMr: 'भेंडी', nameHi: 'भिंडी', nameEn: 'Okra', price: 60, unit: 'kg', category: 'veg', image: '🥬' },
    { id: 6, nameMr: 'वांगी', nameHi: 'बैंगन', nameEn: 'Brinjal', price: 50, unit: 'kg', category: 'veg', image: '🍆' },
    { id: 7, nameMr: 'पालक', nameHi: 'पालक', nameEn: 'Spinach', price: 20, unit: 'bunch', category: 'leafy', image: '🥗' },
    { id: 8, nameMr: 'लसूण', nameHi: 'लहसुन', nameEn: 'Garlic', price: 120, unit: 'kg', category: 'veg', image: '🧄' },
    { id: 9, nameMr: 'मिरची', nameHi: 'मिर्च', nameEn: 'Chili', price: 80, unit: 'kg', category: 'veg', image: '🌶️' },
    { id: 10, nameMr: 'गाजर', nameHi: 'गाजर', nameEn: 'Carrot', price: 45, unit: 'kg', category: 'veg', image: '🥕' },
    { id: 11, nameMr: 'सफरचंद', nameHi: 'सेब', nameEn: 'Apple', price: 150, unit: 'kg', category: 'fruit', image: '🍎' },
    { id: 12, nameMr: 'केळी', nameHi: 'केला', nameEn: 'Banana', price: 40, unit: 'dozen', category: 'fruit', image: '🍌' },
    { id: 13, nameMr: 'फ्लॉवर', nameHi: 'गोभी', nameEn: 'Cauliflower', price: 40, unit: 'kg', category: 'veg', image: '🥦' },
    { id: 14, nameMr: 'कोबी', nameHi: 'पत्ता गोभी', nameEn: 'Cabbage', price: 25, unit: 'kg', category: 'veg', image: '🥬' },
    { id: 15, nameMr: 'आले', nameHi: 'अद्रक', nameEn: 'Ginger', price: 120, unit: 'kg', category: 'veg', image: '🫚' },
    { id: 16, nameMr: 'लिंबू', nameHi: 'नींबू', nameEn: 'Lemon', price: 5, unit: 'pc', category: 'veg', image: '🍋' },
    { id: 17, nameMr: 'काकडी', nameHi: 'खीरा', nameEn: 'Cucumber', price: 30, unit: 'kg', category: 'veg', image: '🥒' },
    { id: 18, nameMr: 'हापूस आंबा', nameHi: 'आम', nameEn: 'Mango', price: 600, unit: 'doz', category: 'fruit', image: '🥭' },
    { id: 19, nameMr: 'कलिंगड', nameHi: 'तरबूज', nameEn: 'Watermelon', price: 50, unit: 'pc', category: 'fruit', image: '🍉' },
    { id: 20, nameMr: 'मेथी', nameHi: 'मेथी', nameEn: 'Fenugreek', price: 20, unit: 'bunch', category: 'leafy', image: '🌿' },
    { id: 21, nameMr: 'शेपू', nameHi: 'सोुआ', nameEn: 'Dill', price: 15, unit: 'bunch', category: 'leafy', image: '🌱' },
    { id: 22, nameMr: 'मटार', nameHi: 'मटर', nameEn: 'Green Peas', price: 80, unit: 'kg', category: 'veg', image: '🫛' },
    { id: 23, nameMr: 'दुधी भोपळा', nameHi: 'लौकी', nameEn: 'Bottle Gourd', price: 30, unit: 'pc', category: 'veg', image: '🥒' },
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

export const CROP_SCHEDULES = {
  mr: [
    {
      id: 'soyabean',
      name: "सोयाबीन",
      variety: "JS-335",
      duration: "१००-११० दिवस",
      currentDay: 48,
      stages: [
        { id: 1, title: "पेरणी व उगवण", days: "०-१०", status: "completed", icon: Sprout, tasks: [{ t: "बीजप्रक्रिया (रायझोबियम)", i: Leaf }, { t: "पेरणी (३-४ सेमी खोलीवर)", i: Sprout }] },
        { id: 2, title: "शाकीय वाढ", days: "११-३५", status: "completed", icon: Leaf, tasks: [{ t: "कोळपणी / तण काढणे", i: Scissors }, { t: "चक्रीभुंगा नियंत्रण", i: Bug }] },
        { id: 3, title: "फुलोरा अवस्था", days: "३६-६०", status: "active", icon: Citrus, tasks: [{ t: "१२:६१:०० खताची फवारणी", i: Droplets }, { t: "पाणी व्यवस्थापन", i: CloudRain }, { t: "अळी नियंत्रण फवारणी", i: Bug }] },
        { id: 4, title: "शेंगा भरणे", days: "६१-८०", status: "upcoming", icon: Cherry, tasks: [{ t: "००:५२:३४ (पोटॅश) फवारणी", i: Droplets }, { t: "पिकाचे संरक्षण", i: Bug }] },
        { id: 5, title: "परिपक्वता व काढणी", days: "८१-१००", status: "upcoming", icon: ShoppingBasket, tasks: [{ t: "काढणी नियोजन", i: Scissors }, { t: "साठवणूक", i: ShoppingBasket }] }
      ]
    },
    {
      id: 'cotton',
      name: "कापूस",
      variety: "Bt Cotton",
      duration: "१५०-१६० दिवस",
      currentDay: 48,
      stages: [
        { id: 1, title: "लागवड", days: "०-१५", status: "completed", icon: Sprout, tasks: [{ t: "लागवड अंतर निश्चित करणे", i: Ruler }] },
        { id: 2, title: "शाकीय वाढ", days: "१६-४५", status: "completed", icon: Leaf, tasks: [{ t: "खताचा पहिला हप्ता", i: Droplets }, { t: "मावा/तुडतुडे नियंत्रण", i: Bug }] },
        { id: 3, title: "पाते लागणे", days: "४६-७०", status: "active", icon: Leaf, tasks: [{ t: "युरिया/पोटॅश डोस", i: Droplets }, { t: "बोंडअळी सापळे लावणे", i: Bug }] },
        { id: 4, title: "बोंड भरणे", days: "७१-११०", status: "upcoming", icon: Citrus, tasks: [{ t: "सूक्ष्म अन्नद्रव्य फवारणी", i: Droplets }] },
        { id: 5, title: "वेचणी", days: "१११+", status: "upcoming", icon: ShoppingBasket, tasks: [{ t: "पहिली वेचणी", i: ShoppingBasket }] }
      ]
    }
  ],
  hi: [
    {
      id: 'soyabean',
      name: "सोयाबीन",
      variety: "JS-335",
      duration: "100-110 दिन",
      currentDay: 48,
      stages: [
        { id: 1, title: "बुवाई और अंकुरण", days: "0-10", status: "completed", icon: Sprout, tasks: [{ t: "बीज उपचार", i: Leaf }] },
        { id: 2, title: "वानस्पतिक वृद्धि", days: "11-35", status: "completed", icon: Leaf, tasks: [{ t: "खरपतवार नियंत्रण", i: Scissors }] },
        { id: 3, title: "फूल आना", days: "36-60", status: "active", icon: Citrus, tasks: [{ t: "12:61:00 छिड़काव", i: Droplets }, { t: "सिंचाई प्रबंधन", i: CloudRain }] },
        { id: 4, title: "फलियां बनना", days: "61-80", status: "upcoming", icon: Cherry, tasks: [{ t: "00:52:34 छिड़काव", i: Droplets }] },
        { id: 5, title: "परिपक्वता", days: "81-100", status: "upcoming", icon: ShoppingBasket, tasks: [{ t: "कटाई", i: Scissors }] }
      ]
    },
    {
        id: 'cotton',
        name: "कपास",
        variety: "Bt Cotton",
        duration: "150-160 दिन",
        currentDay: 48,
        stages: [
          { id: 1, title: "बुवाई", days: "0-15", status: "completed", icon: Sprout, tasks: [{ t: "दूरी बनाए रखें", i: Ruler }] },
          { id: 2, title: "वानस्पतिक वृद्धि", days: "16-45", status: "completed", icon: Leaf, tasks: [{ t: "खाद की पहली खुराक", i: Droplets }] },
          { id: 3, title: "कली बनना", days: "46-70", status: "active", icon: Leaf, tasks: [{ t: "यूरिया/पोटाश", i: Droplets }] },
          { id: 4, title: "टिंडा बनना", days: "71-110", status: "upcoming", icon: Citrus, tasks: [{ t: "सूक्ष्म पोषक तत्व", i: Droplets }] },
          { id: 5, title: "चुनाई", days: "111+", status: "upcoming", icon: ShoppingBasket, tasks: [{ t: "पहली चुनाई", i: ShoppingBasket }] }
        ]
      }
  ],
  en: [
    {
      id: 'soyabean',
      name: "Soyabean",
      variety: "JS-335",
      duration: "100-110 Days",
      currentDay: 48,
      stages: [
        { id: 1, title: "Sowing & Germination", days: "0-10", status: "completed", icon: Sprout, tasks: [{ t: "Seed Treatment", i: Leaf }] },
        { id: 2, title: "Vegetative Growth", days: "11-35", status: "completed", icon: Leaf, tasks: [{ t: "Weed Control", i: Scissors }] },
        { id: 3, title: "Flowering", days: "36-60", status: "active", icon: Citrus, tasks: [{ t: "Spray 12:61:00", i: Droplets }, { t: "Irrigation", i: CloudRain }] },
        { id: 4, title: "Pod Formation", days: "61-80", status: "upcoming", icon: Cherry, tasks: [{ t: "Spray 00:52:34", i: Droplets }] },
        { id: 5, title: "Maturity", days: "81-100", status: "upcoming", icon: ShoppingBasket, tasks: [{ t: "Harvesting", i: Scissors }] }
      ]
    },
    {
        id: 'cotton',
        name: "Cotton",
        variety: "Bt Cotton",
        duration: "150-160 Days",
        currentDay: 48,
        stages: [
          { id: 1, title: "Sowing", days: "0-15", status: "completed", icon: Sprout, tasks: [{ t: "Spacing Check", i: Ruler }] },
          { id: 2, title: "Vegetative", days: "16-45", status: "completed", icon: Leaf, tasks: [{ t: "First Fertilizer Dose", i: Droplets }] },
          { id: 3, title: "Squaring", days: "46-70", status: "active", icon: Leaf, tasks: [{ t: "Urea/Potash Dose", i: Droplets }] },
          { id: 4, title: "Boll Formation", days: "71-110", status: "upcoming", icon: Citrus, tasks: [{ t: "Micronutrients", i: Droplets }] },
          { id: 5, title: "Picking", days: "111+", status: "upcoming", icon: ShoppingBasket, tasks: [{ t: "First Picking", i: ShoppingBasket }] }
        ]
      }
  ]
};
