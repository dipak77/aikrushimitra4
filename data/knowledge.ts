
export const KNOWLEDGE_BASE = [
  {
    id: 'soyabean',
    category: 'crop',
    title: { mr: 'सोयाबीन शेती तंत्र', hi: 'सोयाबीन की खेती', en: 'Soyabean Farming' },
    subtitle: { mr: 'संपूर्ण उत्पादन मार्गदर्शक', hi: 'पूर्ण उत्पादन गाइड', en: 'Complete Production Guide' },
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ced72a?q=80&w=1000&auto=format&fit=crop',
    tags: ['Kharif', 'Oilseed', 'Cash Crop'],
    stats: [
      { label: { mr: 'कालावधी', en: 'Duration' }, value: '90-110 Days', icon: 'clock' },
      { label: { mr: 'पाणी', en: 'Water' }, value: 'Medium', icon: 'droplet' },
      { label: { mr: 'हवामान', en: 'Temp' }, value: '25°-30°C', icon: 'sun' },
    ],
    sections: [
      {
        title: { mr: 'जमीन आणि हवामान', en: 'Soil & Climate' },
        content: {
          mr: 'सोयाबीनसाठी मध्यम ते भारी, पाण्याचा चांगला निचरा होणारी जमीन आवश्यक आहे. जमिनीचा सामू (pH) ६.५ ते ७.५ दरम्यान असावा. जास्त आम्लयुक्त किंवा क्षारयुक्त जमिनीत पीक चांगले येत नाही. तापमान २५ ते ३० अंश सेल्सिअस वाढीसाठी पोषक असते.',
          en: 'Soybean requires medium to heavy, well-drained soil. Soil pH should be between 6.5 and 7.5. The crop does not thrive in highly acidic or saline soils. A temperature of 25°C to 30°C is ideal for growth.'
        }
      },
      {
        title: { mr: 'पूर्वमशागत व पेरणी', en: 'Preparation & Sowing' },
        content: {
          mr: 'उन्हाळ्यात खोल नांगरट करून जमीन तापू द्यावी. पेरणीपूर्वी कुळवाच्या २ पाळ्या द्याव्या. पेरणी पाऊस पडल्यावर जमिनीत पुरेसा ओलावा असताना करावी. दोन ओळींत ४५ सेमी आणि दोन झाडांत ५ सेमी अंतर ठेवावे.',
          en: 'Plough the land deep in summer and let it heat up. Harrow twice before sowing. Sow when there is sufficient moisture in the soil after rain. Maintain 45 cm between rows and 5 cm between plants.'
        }
      },
      {
        title: { mr: 'खत व्यवस्थापन (NPK)', en: 'Fertilizer Management' },
        content: {
          mr: 'पेरणीच्या वेळी ३० किलो नत्र, ६० किलो स्फुरद आणि ३० किलो पालाश प्रति हेक्टरी द्यावे. गंधक २० किलो प्रति हेक्टरी दिल्यास तेलाचे प्रमाण वाढते. फुलोरा अवस्थेत २% युरियाची फवारणी करावी.',
          en: 'Apply 30 kg Nitrogen, 60 kg Phosphorus, and 30 kg Potash per hectare at sowing. Applying 20 kg Sulphur per hectare increases oil content. Spray 2% Urea at the flowering stage.'
        }
      },
      {
        title: { mr: 'पीक संरक्षण', en: 'Plant Protection' },
        content: {
          mr: 'खोडमाशी आणि चक्रीभुंगा यांच्या नियंत्रणासाठी थायोमेथोक्झाम किंवा क्लोरअँट्रानिलीप्रोल फवारणी करावी. पाने खाणाऱ्या अळीसाठी प्रोफेनोफॉस वापरावे.',
          en: 'Spray Thiamethoxam or Chlorantraniliprole to control stem fly and girdle beetle. Use Profenofos for leaf-eating caterpillars.'
        }
      }
    ]
  },
  {
    id: 'cotton',
    category: 'crop',
    title: { mr: 'कापूस लागवड', hi: 'कपास की खेती', en: 'Cotton Farming' },
    subtitle: { mr: 'पांढरे सोने पिकवण्याचे तंत्र', hi: 'सफेद सोना उगाने की तकनीक', en: 'Technique to Grow White Gold' },
    image: 'https://images.unsplash.com/photo-1595123550441-d377e017de2a?q=80&w=1000&auto=format&fit=crop',
    tags: ['Cash Crop', 'Fiber', 'Long Duration'],
    stats: [
      { label: { mr: 'कालावधी', en: 'Duration' }, value: '150-180 Days', icon: 'clock' },
      { label: { mr: 'पाणी', en: 'Water' }, value: 'High', icon: 'droplet' },
      { label: { mr: 'हवामान', en: 'Temp' }, value: '21°-35°C', icon: 'sun' },
    ],
    sections: [
      {
        title: { mr: 'जमीन', en: 'Soil' },
        content: {
          mr: 'कापसासाठी मध्यम ते भारी काळी कसदार जमीन (Black Cotton Soil) उत्तम असते. पाण्याचा उत्तम निचरा होणे गरजेचे आहे.',
          en: 'Medium to heavy fertile Black Cotton Soil is best for cotton. Good water drainage is essential.'
        }
      },
      {
        title: { mr: 'लागवड अंतर', en: 'Planting Distance' },
        content: {
          mr: 'कोरडवाहूसाठी ९०x६० सेमी किंवा ९०x४५ सेमी अंतर ठेवावे. बागायतीसाठी १२०x६० सेमी किंवा १५०x३० सेमी अंतर ठेवावे.',
          en: 'For rainfed, keep 90x60 cm or 90x45 cm spacing. For irrigated, keep 120x60 cm or 150x30 cm spacing.'
        }
      },
      {
        title: { mr: 'खत व्यवस्थापन', en: 'Fertilizer' },
        content: {
          mr: 'बागायती कापसासाठी १२०:६०:६० (NPK) किलो/हेक्टर मात्रा द्यावी. नत्र (N) ३ हप्त्यात विभागून द्यावे (पेरणीवेळी, ३० दिवसांनी, ६० दिवसांनी).',
          en: 'For irrigated cotton, apply 120:60:60 (NPK) kg/ha. Apply Nitrogen (N) in 3 splits (at sowing, 30 days, 60 days).'
        }
      }
    ]
  },
  {
    id: 'onion',
    category: 'crop',
    title: { mr: 'कांदा उत्पादन', hi: 'प्याज की खेती', en: 'Onion Farming' },
    subtitle: { mr: 'अधिक उत्पन्नासाठी आधुनिक पद्धत', hi: 'अधिक उपज के लिए आधुनिक विधि', en: 'Modern Method for High Yield' },
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=1000&auto=format&fit=crop',
    tags: ['Rabi', 'Vegetable', 'Cash Crop'],
    stats: [
      { label: { mr: 'कालावधी', en: 'Duration' }, value: '100-120 Days', icon: 'clock' },
      { label: { mr: 'पाणी', en: 'Water' }, value: 'Regular', icon: 'droplet' },
      { label: { mr: 'हवामान', en: 'Temp' }, value: '15°-25°C', icon: 'sun' },
    ],
    sections: [
      {
        title: { mr: 'हवामान', en: 'Climate' },
        content: {
          mr: 'कांदा पिकास थंड हवामान मानवते. कांदा पोसताना तापमान १५ ते २५ अंश सेल्सिअस असावे. काढणीच्या वेळी उष्ण व कोरडे हवामान आवश्यक असते.',
          en: 'Onion crop prefers cool climate. Temperature should be 15-25°C during bulb development. Hot and dry weather is needed during harvesting.'
        }
      },
      {
        title: { mr: 'पुनर्लागवड', en: 'Transplanting' },
        content: {
          mr: 'रोपे ६-८ आठवड्यांची झाल्यावर पुनर्लागवड करावी. रोपांच्या शेंड्याची १/३ पाने कापून लागवड केल्यास बाष्पीभवन कमी होते.',
          en: 'Transplant when seedlings are 6-8 weeks old. Trimming 1/3rd of the tops reduces evaporation and helps establishment.'
        }
      }
    ]
  },
  {
    id: 'drip',
    category: 'tech',
    title: { mr: 'ठिबक सिंचन', hi: 'ड्रिप सिंचाई', en: 'Drip Irrigation' },
    subtitle: { mr: 'पाण्याची ५०% बचत आणि दुप्पट उत्पादन', hi: 'पानी की बचत और दोगुनी उपज', en: 'Save 50% Water & Double Yield' },
    image: 'https://images.unsplash.com/photo-1622383563227-044011358d16?q=80&w=1000&auto=format&fit=crop',
    tags: ['Technology', 'Water Saving', 'Efficiency'],
    stats: [
      { label: { mr: 'बचत', en: 'Saving' }, value: '50-60%', icon: 'droplet' },
      { label: { mr: 'उत्पन्न', en: 'Yield' }, value: '+40%', icon: 'trending-up' },
      { label: { mr: 'खर्च', en: 'Cost' }, value: 'Subsidized', icon: 'indian-rupee' },
    ],
    sections: [
      {
        title: { mr: 'फायदे', en: 'Benefits' },
        content: {
          mr: '१. पाण्याची ५०-६०% बचत होते.\n२. खतांचा (फर्टिगेशन) कार्यक्षम वापर होतो.\n३. तणांचा प्रादुर्भाव कमी होतो.\n४. उत्पादनात ३०-४०% वाढ होते.',
          en: '1. Saves 50-60% water.\n2. Efficient use of fertilizers (Fertigation).\n3. Reduces weed growth.\n4. Increases yield by 30-40%.'
        }
      },
      {
        title: { mr: 'देखभाल', en: 'Maintenance' },
        content: {
          mr: 'फिल्टर नियमित साफ करावेत. आठवड्यातून एकदा लॅटरल लाईन्स फ्लश कराव्यात. ऍसिड ट्रीटमेंटने ड्रिपर चोक होणे टाळता येते.',
          en: 'Clean filters regularly. Flush lateral lines once a week. Use acid treatment to prevent dripper clogging.'
        }
      }
    ]
  }
];
