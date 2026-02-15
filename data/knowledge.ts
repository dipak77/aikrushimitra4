
export interface LocalizedText {
  mr: string;
  hi?: string;
  en: string;
}

export interface Stat {
  label: LocalizedText;
  value: string;
  icon: string;
}

export interface Section {
  title: LocalizedText;
  content: LocalizedText;
}

export interface KnowledgeItem {
  id: string;
  category: 'crop' | 'tech' | 'livestock' | 'scheme';
  title: LocalizedText;
  subtitle: LocalizedText;
  image: string;
  tags: string[];
  stats: Stat[];
  sections: Section[];
  expectedYield?: LocalizedText;
  bestVarieties?: string[];
  marketInfo?: LocalizedText;
}

export const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'soyabean',
    category: 'crop',
    title: { mr: 'सोयाबीन शेती तंत्र', hi: 'सोयाबीन की खेती', en: 'Soyabean Farming' },
    subtitle: { mr: 'संपूर्ण उत्पादन मार्गदर्शक', hi: 'पूर्ण उत्पादन गाइड', en: 'Complete Production Guide' },
    image: 'https://images.unsplash.com/photo-1628277613967-6abca504d0ac?q=80&w=1200&auto=format&fit=crop',
    tags: ['Kharif', 'Oilseed', 'Cash Crop'],
    bestVarieties: ['JS-335', 'JS-9560', 'MACS-1188', 'KDS-726', 'MAUS-71', 'Phule Kalyani'],
    expectedYield: {
      mr: 'सरासरी उत्पादन: २०-२५ क्विंटल/हेक्टर (सुधारित वाणांसह ३० क्विंटलपर्यंत शक्य)',
      en: 'Average Yield: 20-25 quintals/ha (up to 30 quintals possible with improved varieties)'
    },
    marketInfo: {
      mr: 'MSP ₹४,६०० प्रति क्विंटल (२०२४-२५). सोयाबीन प्रक्रिया उद्योगात तेल (१८-२०%) आणि पेंड (सोयामील) यांना मोठी मागणी.',
      en: 'MSP ₹4,600 per quintal (2024-25). High demand in soybean processing industry for oil (18-20%) and soyameal.'
    },
    stats: [
      { label: { mr: 'कालावधी', en: 'Duration' }, value: '90-110 Days', icon: 'clock' },
      { label: { mr: 'पाणी', en: 'Water' }, value: 'Medium', icon: 'droplet' },
      { label: { mr: 'हवामान', en: 'Temp' }, value: '25°-30°C', icon: 'sun' },
      { label: { mr: 'बियाणे', en: 'Seed Rate' }, value: '70-80 kg/ha', icon: 'sprout' },
    ],
    sections: [
      {
        title: { mr: 'जमीन आणि हवामान', en: 'Soil & Climate' },
        content: {
          mr: 'सोयाबीनसाठी मध्यम ते भारी, पाण्याचा चांगला निचरा होणारी जमीन आवश्यक आहे. जमिनीचा सामू (pH) ६.५ ते ७.५ दरम्यान असावा. जास्त आम्लयुक्त किंवा क्षारयुक्त जमिनीत पीक चांगले येत नाही. तापमान २५ ते ३० अंश सेल्सिअस वाढीसाठी पोषक असते. पिकाला ६०० ते ८५० मिमी पावसाची आवश्यकता असते. जमिनीत सेंद्रिय कर्ब (Organic Carbon) ०.६% पेक्षा जास्त असल्यास उत्तम उत्पादन मिळते.',
          en: 'Soybean requires medium to heavy, well-drained soil. Soil pH should be between 6.5 and 7.5. The crop does not thrive in highly acidic or saline soils. A temperature of 25°C to 30°C is ideal for growth. The crop needs 600-850 mm rainfall. Soil with organic carbon above 0.6% gives excellent yields.'
        }
      },
      {
        title: { mr: 'बीजप्रक्रिया', en: 'Seed Treatment' },
        content: {
          mr: 'पेरणीपूर्वी बियाण्यास थायरम + कार्बोक्सिन (३ ग्रॅम/किलो बियाणे) चोळावे. त्यानंतर रायझोबियम + PSB जिवाणू संवर्धक (२५ ग्रॅम/किलो) लावावे. बीजप्रक्रियेमुळे उगवण क्षमता सुधारते आणि मूळकूज, मर रोगापासून संरक्षण मिळते.',
          en: 'Treat seeds with Thiram + Carboxin (3 gm/kg seed) before sowing. Then apply Rhizobium + PSB biofertilizer (25 gm/kg). Seed treatment improves germination and protects against root rot and wilt diseases.'
        }
      },
      {
        title: { mr: 'पूर्वमशागत व पेरणी', en: 'Land Preparation & Sowing' },
        content: {
          mr: 'उन्हाळ्यात खोल नांगरट (२५-३० सेमी) करून जमीन तापू द्यावी. पेरणीपूर्वी कुळवाच्या २ पाळ्या द्याव्या. शेणखत ५ टन/हेक्टर मिसळावे. पेरणी जून मध्यापासून जुलैच्या पहिल्या आठवड्यापर्यंत करावी. पाऊस पडल्यावर जमिनीत पुरेसा ओलावा असताना पेरणी करावी. दोन ओळींत ४५ सेमी (भारी जमिनीत ३० सेमी) आणि दोन झाडांत ५ सेमी अंतर ठेवावे. बियाणे ३-४ सेमी खोलीवर पेरावे.',
          en: 'Plough the land deep (25-30 cm) in summer and let it heat up. Harrow twice before sowing. Mix 5 tons/ha FYM. Sow from mid-June to the first week of July. Sow when there is sufficient moisture after rain. Maintain 45 cm between rows (30 cm in heavy soils) and 5 cm between plants. Sow seeds at 3-4 cm depth.'
        }
      },
      {
        title: { mr: 'खत व्यवस्थापन (NPK)', en: 'Fertilizer Management' },
        content: {
          mr: 'पेरणीच्या वेळी ३० किलो नत्र (N), ६० किलो स्फुरद (P₂O₅), आणि ३० किलो पालाश (K₂O) प्रति हेक्टरी द्यावे. गंधक (Sulphur) २० किलो प्रति हेक्टरी दिल्यास तेलाचे प्रमाण वाढते. फुलोरा अवस्थेत (४५-५० दिवस) २% युरिया + ०.५% सूक्ष्म अन्नद्रव्य मिश्रणाची फवारणी करावी. बोरॉन कमतरतेसाठी बोरॅक्स ५ किलो/हेक्टर जमिनीत द्यावे.',
          en: 'Apply 30 kg Nitrogen (N), 60 kg Phosphorus (P₂O₅), and 30 kg Potash (K₂O) per hectare at sowing. Applying 20 kg Sulphur per hectare increases oil content. Spray 2% Urea + 0.5% micronutrient mixture at flowering stage (45-50 days). Apply Borax 5 kg/ha to soil for Boron deficiency.'
        }
      },
      {
        title: { mr: 'आंतरमशागत व तण नियंत्रण', en: 'Intercultivation & Weed Control' },
        content: {
          mr: 'पेरणीनंतर ३ दिवसांत पेंडिमेथालिन (३.३ लिटर/हेक्टर) फवारणी करावी. २०-२५ दिवसांनी एक कोळपणी आणि ३५-४० दिवसांनी एक खुरपणी करावी. तणांच्या नियंत्रणासाठी इमॅझेथापायर (७५ मिली/हेक्टर) पेरणीनंतर १५-२० दिवसांत फवारावे.',
          en: 'Spray Pendimethalin (3.3 L/ha) within 3 days of sowing. Do one hoeing at 20-25 days and one weeding at 35-40 days. For weed control, spray Imazethapyr (75 ml/ha) at 15-20 days after sowing.'
        }
      },
      {
        title: { mr: 'पीक संरक्षण - किडी', en: 'Pest Management' },
        content: {
          mr: 'खोडमाशी: थायोमेथोक्झाम २५ WG (१०० ग्रॅम/हेक्टर) फवारणी.\nचक्रीभुंगा: क्लोरअँट्रानिलीप्रोल १८.५ SC (१५० मिली/हेक्टर).\nपाने खाणारी अळी (स्पोडोप्टेरा): प्रोफेनोफॉस ५० EC (१ लिटर/हेक्टर) किंवा इमामेक्टिन बेंझोएट ५ SG (२०० ग्रॅम/हेक्टर).\nशेंगा पोखरणारी अळी: नोव्हॅल्युरॉन १० EC (५०० मिली/हेक्टर).\nमावा (Aphids): इमिडाक्लोप्रिड १७.८ SL (१५० मिली/हेक्टर).',
          en: 'Stem fly: Spray Thiamethoxam 25 WG (100 gm/ha).\nGirdle beetle: Chlorantraniliprole 18.5 SC (150 ml/ha).\nLeaf-eating caterpillar (Spodoptera): Profenofos 50 EC (1 L/ha) or Emamectin Benzoate 5 SG (200 gm/ha).\nPod borer: Novaluron 10 EC (500 ml/ha).\nAphids: Imidacloprid 17.8 SL (150 ml/ha).'
        }
      },
      {
        title: { mr: 'पीक संरक्षण - रोग', en: 'Disease Management' },
        content: {
          mr: 'तांबेरा (Rust): प्रोपीकोनाझोल २५ EC (५०० मिली/हेक्टर) फवारणी.\nपिवळा मोझॅक विषाणू (YMV): पांढरी माशी नियंत्रणासाठी ट्रायझोफॉस (८०० मिली/हेक्टर).\nमूळकूज (Root Rot): ट्रायकोडर्मा (२.५ किलो/हेक्टर) जमिनीत मिसळावे.\nजिवाणूजन्य पानावरील ठिपके: कॉपर ऑक्सिक्लोराईड (२.५ किलो/हेक्टर).',
          en: 'Rust: Spray Propiconazole 25 EC (500 ml/ha).\nYellow Mosaic Virus (YMV): Triazophos (800 ml/ha) for whitefly control.\nRoot Rot: Mix Trichoderma (2.5 kg/ha) in soil.\nBacterial leaf spot: Copper Oxychloride (2.5 kg/ha).'
        }
      },
      {
        title: { mr: 'काढणी व साठवणूक', en: 'Harvesting & Storage' },
        content: {
          mr: 'पाने पिवळी पडून ८०% शेंगा तपकिरी होतात तेव्हा काढणी करावी. काढणी सकाळी करावी म्हणजे शेंगा फुटत नाहीत. बियाण्यात ओलावा १२% पेक्षा कमी असताना साठवणूक करावी. जूट पोत्यात किंवा हवाबंद डब्यात साठवावे.',
          en: 'Harvest when leaves turn yellow and 80% pods are brown. Harvest in the morning to prevent pod shattering. Store when seed moisture is below 12%. Store in jute bags or airtight containers.'
        }
      }
    ]
  },
  {
    id: 'cotton',
    category: 'crop',
    title: { mr: 'कापूस लागवड', hi: 'कपास की खेती', en: 'Cotton Farming' },
    subtitle: { mr: 'पांढरे सोने पिकवण्याचे तंत्र', hi: 'सफेद सोना उगाने की तकनीक', en: 'White Gold — Complete Cultivation Guide' },
    image: 'https://images.unsplash.com/photo-1615470749906-f4a89f5b4d09?q=80&w=1200&auto=format&fit=crop',
    tags: ['Kharif', 'Cash Crop', 'Fiber', 'Long Duration'],
    bestVarieties: ['Bt Cotton (BG-II)', 'Suraj', 'NH-615', 'Ankur-3028', 'Ajeet-199', 'Rashi-665'],
    expectedYield: {
      mr: 'बागायती: २५-३५ क्विंटल/हेक्टर कपाशी (१५-२० क्विंटल रुई). कोरडवाहू: १०-१५ क्विंटल/हेक्टर कपाशी.',
      en: 'Irrigated: 25-35 quintals/ha kapashi (15-20 quintals lint). Rainfed: 10-15 quintals/ha kapashi.'
    },
    marketInfo: {
      mr: 'MSP ₹७,१२१ प्रति क्विंटल (मध्यम धागा) (२०२४-२५). रुईची लांबी, मजबुती आणि सूक्ष्मता यावर बाजारभाव अवलंबून.',
      en: 'MSP ₹7,121 per quintal (medium staple) (2024-25). Market price depends on lint length, strength, and fineness.'
    },
    stats: [
      { label: { mr: 'कालावधी', en: 'Duration' }, value: '150-180 Days', icon: 'clock' },
      { label: { mr: 'पाणी', en: 'Water' }, value: 'High', icon: 'droplet' },
      { label: { mr: 'हवामान', en: 'Temp' }, value: '21°-35°C', icon: 'sun' },
      { label: { mr: 'बियाणे', en: 'Seed Rate' }, value: '2.5 kg/ha (Bt)', icon: 'sprout' },
    ],
    sections: [
      {
        title: { mr: 'जमीन आणि हवामान', en: 'Soil & Climate' },
        content: {
          mr: 'कापसासाठी मध्यम ते भारी काळी कसदार जमीन (Black Cotton Soil) उत्तम असते. जमिनीचा pH ६.५ ते ८.० दरम्यान असावा. पाण्याचा उत्तम निचरा होणे गरजेचे आहे. उगवणीसाठी २१°C आणि वाढीसाठी २५°-३५°C तापमान आवश्यक. ६०० ते ११०० मिमी पावसाची आवश्यकता असते.',
          en: 'Medium to heavy fertile Black Cotton Soil is best for cotton. Soil pH should be 6.5-8.0. Good water drainage is essential. Temperature of 21°C for germination and 25°-35°C for growth is needed. Requires 600-1100 mm rainfall.'
        }
      },
      {
        title: { mr: 'लागवड पद्धती', en: 'Planting Method' },
        content: {
          mr: 'कोरडवाहूसाठी: ९०×६० सेमी किंवा ९०×४५ सेमी अंतर ठेवावे.\nबागायतीसाठी: १२०×६० सेमी किंवा १५०×३० सेमी अंतर ठेवावे.\nPHD (High Density Planting System): ६०×१० सेमी - प्रति हेक्टर १,६६,००० झाडे, उत्पादन ३०-४०% जास्त.\nBt बियाणे एका ठिकाणी १ बियाणे ३-४ सेमी खोलीवर पेरावे.',
          en: 'Rainfed: 90×60 cm or 90×45 cm spacing.\nIrrigated: 120×60 cm or 150×30 cm spacing.\nHDPS (High Density Planting System): 60×10 cm — 1,66,000 plants/ha, 30-40% higher yield.\nSow 1 Bt seed per spot at 3-4 cm depth.'
        }
      },
      {
        title: { mr: 'खत व्यवस्थापन', en: 'Fertilizer Management' },
        content: {
          mr: 'बागायती कापसासाठी १२०:६०:६० (N:P₂O₅:K₂O) किलो/हेक्टर मात्रा द्यावी.\nनत्र (N) ३ हप्त्यात विभागून द्यावे: पेरणीवेळी (२५%), ३० दिवसांनी (५०%), ६० दिवसांनी (२५%).\nफुलोरा अवस्थेत MgSO₄ (१%) + KNO₃ (१%) फवारणी करावी.\nसूक्ष्म अन्नद्रव्ये: ZnSO₄ (२५ किलो/हेक्टर) + FeSO₄ (२५ किलो/हेक्टर) जमिनीत द्यावे.',
          en: 'For irrigated cotton, apply 120:60:60 (N:P₂O₅:K₂O) kg/ha.\nApply Nitrogen (N) in 3 splits: at sowing (25%), 30 days (50%), 60 days (25%).\nSpray MgSO₄ (1%) + KNO₃ (1%) at flowering stage.\nMicronutrients: Apply ZnSO₄ (25 kg/ha) + FeSO₄ (25 kg/ha) to soil.'
        }
      },
      {
        title: { mr: 'पीक संरक्षण - किडी', en: 'Pest Management' },
        content: {
          mr: 'गुलाबी बोंडअळी (Pink Bollworm): फेरोमोन सापळे (५/हेक्टर) लावावेत. प्रोफेनोफॉस + सायपरमेथ्रिन फवारणी.\nरसशोषक किडी (मावा, तुडतुडे, पांढरी माशी): फ्लोनिकॅमिड ५० WG (१५० ग्रॅम/हेक्टर) किंवा डायाफेनथ्युरॉन ५०% WP (६०० ग्रॅम/हेक्टर).\nअमेरिकन बोंडअळी (Bt कापसावर कमी): क्लोरअँट्रानिलीप्रोल १८.५ SC (१५० मिली/हेक्टर).\nनिंबोळी अर्क (५%) फवारणी एकात्मिक कीड व्यवस्थापनासाठी उपयुक्त.',
          en: 'Pink Bollworm: Install pheromone traps (5/ha). Spray Profenofos + Cypermethrin.\nSucking pests (Aphids, Jassids, Whiteflies): Flonicamid 50 WG (150 gm/ha) or Diafenthiuron 50% WP (600 gm/ha).\nAmerican Bollworm (less in Bt cotton): Chlorantraniliprole 18.5 SC (150 ml/ha).\nNeem seed extract (5%) spray useful for IPM.'
        }
      },
      {
        title: { mr: 'काढणी', en: 'Harvesting' },
        content: {
          mr: 'बोंडे पूर्ण उमलल्यावर ३-४ वेचणी कराव्यात. पहिली वेचणी पेरणीनंतर ११०-१२० दिवसांनी. कापूस कोरडा असताना (सकाळी दव सुकल्यावर) वेचावा. ओल्या कापसात १२% पेक्षा कमी ओलावा असताना साठवावा.',
          en: 'Pick cotton in 3-4 pickings after bolls fully open. First picking at 110-120 days after sowing. Pick when cotton is dry (after morning dew dries). Store when moisture content is below 12%.'
        }
      }
    ]
  },
  {
    id: 'onion',
    category: 'crop',
    title: { mr: 'कांदा उत्पादन', hi: 'प्याज की खेती', en: 'Onion Farming' },
    subtitle: { mr: 'अधिक उत्पन्नासाठी आधुनिक पद्धत', hi: 'अधिक उपज के लिए आधुनिक विधि', en: 'Modern Method for High Yield' },
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200&auto=format&fit=crop',
    tags: ['Rabi', 'Kharif', 'Vegetable', 'Cash Crop', 'Export'],
    bestVarieties: ['Baswant-780', 'N-2-4-1', 'Phule Samarth', 'AFDR', 'Bhima Shakti', 'Bhima Kiran'],
    expectedYield: {
      mr: 'रब्बी कांदा: २५०-३५० क्विंटल/हेक्टर. खरीप कांदा: २००-२५० क्विंटल/हेक्टर. उन्हाळी (लेट खरीप): १५०-२०० क्विंटल/हेक्टर.',
      en: 'Rabi onion: 250-350 quintals/ha. Kharif onion: 200-250 quintals/ha. Summer (late Kharif): 150-200 quintals/ha.'
    },
    marketInfo: {
      mr: 'नाशिक (लासलगाव) हे कांद्याचे प्रमुख बाजार. निर्यातीसाठी ४-६ सेमी आकाराचा लाल कांदा पसंत. साठवणुकीत २०-३०% नासाडी टाळण्यासाठी चाळवर योग्य साठवणूक करावी.',
      en: 'Nashik (Lasalgaon) is the primary onion market. Red onion of 4-6 cm size preferred for export. Proper storage on racks can prevent 20-30% post-harvest losses.'
    },
    stats: [
      { label: { mr: 'कालावधी', en: 'Duration' }, value: '100-120 Days', icon: 'clock' },
      { label: { mr: 'पाणी', en: 'Water' }, value: 'Regular', icon: 'droplet' },
      { label: { mr: 'हवामान', en: 'Temp' }, value: '15°-25°C', icon: 'sun' },
      { label: { mr: 'बियाणे', en: 'Seed Rate' }, value: '8-10 kg/ha', icon: 'sprout' },
    ],
    sections: [
      {
        title: { mr: 'हवामान आणि जमीन', en: 'Climate & Soil' },
        content: {
          mr: 'कांदा पिकास थंड हवामान मानवते. कांदा पोसताना तापमान १५ ते २५ अंश सेल्सिअस असावे. काढणीच्या वेळी उष्ण व कोरडे हवामान आवश्यक असते. हलकी ते मध्यम, भुसभुशीत, पाण्याचा निचरा होणारी जमीन उत्तम. जमिनीचा pH ६.० ते ७.५ दरम्यान असावा. भारी चिकणमाती जमिनीत कांदा पोसत नाही.',
          en: 'Onion prefers cool climate. Temperature should be 15-25°C during bulb development. Hot and dry weather is needed during harvesting. Light to medium, loose, well-drained soil is best. Soil pH should be 6.0-7.5. Onion does not develop well in heavy clay soil.'
        }
      },
      {
        title: { mr: 'रोपवाटिका व्यवस्थापन', en: 'Nursery Management' },
        content: {
          mr: 'गादी वाफे (१.५ मी × ३ मी) तयार करून बियाणे पेरावे. ३ मी लांबीच्या वाफ्यासाठी ६-८ ग्रॅम बियाणे. बियाणे पेरणीपूर्वी थायरम (३ ग्रॅम/किलो) चोळावे. वाफ्यावर पालापाचोळा (Mulching) ठेवावा. ८-१० दिवसांत उगवण होते. ६-८ आठवड्यांनी रोपे पुनर्लागवडीस तयार.',
          en: 'Prepare raised beds (1.5m × 3m) and sow seeds. Use 6-8 gm seed per 3m bed. Treat seeds with Thiram (3 gm/kg) before sowing. Cover beds with mulch. Germination occurs in 8-10 days. Seedlings ready for transplanting in 6-8 weeks.'
        }
      },
      {
        title: { mr: 'पुनर्लागवड', en: 'Transplanting' },
        content: {
          mr: 'रोपे ६-८ आठवड्यांची झाल्यावर पुनर्लागवड करावी. रोपांच्या शेंड्याची १/३ पाने कापून लागवड केल्यास बाष्पीभवन कमी होते. लागवड अंतर: १५ × १० सेमी (सपाट वाफा) किंवा रुंद वरंब्यावर (BBF) ३ ओळी लावाव्यात. लागवड संध्याकाळी करावी. लागवडीनंतर लगेच पाणी द्यावे.',
          en: 'Transplant when seedlings are 6-8 weeks old. Trimming 1/3rd of the tops reduces evaporation and helps establishment. Spacing: 15 × 10 cm (flat bed) or 3 rows on broad bed furrow (BBF). Transplant in the evening. Irrigate immediately after transplanting.'
        }
      },
      {
        title: { mr: 'खत व्यवस्थापन', en: 'Fertilizer Management' },
        content: {
          mr: 'शेणखत: १५-२० टन/हेक्टर लागवडीपूर्वी.\nNPK: ११०:४०:६० किलो/हेक्टर.\nनत्र ३ हप्त्यात: लागवडीवेळी (३३%), ३० दिवसांनी (३३%), ४५ दिवसांनी (३३%).\nगंधक: ४० किलो/हेक्टर (तिखटपणा व साठवणूक क्षमता वाढते).\nसूक्ष्म अन्नद्रव्ये: ४५ दिवसांनी 19:19:19 (५ ग्रॅम/लिटर) + सूक्ष्म अन्नद्रव्य मिश्रण फवारणी.',
          en: 'FYM: 15-20 tons/ha before planting.\nNPK: 110:40:60 kg/ha.\nNitrogen in 3 splits: at planting (33%), 30 days (33%), 45 days (33%).\nSulphur: 40 kg/ha (increases pungency and storage life).\nMicronutrients: Spray 19:19:19 (5 gm/L) + micronutrient mixture at 45 days.'
        }
      },
      {
        title: { mr: 'पीक संरक्षण', en: 'Plant Protection' },
        content: {
          mr: 'करपा (Purple blotch): मॅन्कोझेब (२.५ ग्रॅम/लिटर) + कार्बेन्डाझिम (१ ग्रॅम/लिटर) आळीपाळीने फवारणी.\nथ्रिप्स: फिप्रोनिल ५ SC (२ मिली/लिटर) किंवा स्पिनोसॅड ४५ SC (०.३ मिली/लिटर).\nमूळकूज: ट्रायकोडर्मा (२.५ किलो/हेक्टर) जमिनीत मिसळावे.\nमृदुकूज (Downy Mildew): मेटालॅक्झिल (२ ग्रॅम/लिटर) फवारावे.',
          en: 'Purple blotch: Alternate spray of Mancozeb (2.5 gm/L) + Carbendazim (1 gm/L).\nThrips: Fipronil 5 SC (2 ml/L) or Spinosad 45 SC (0.3 ml/L).\nRoot rot: Mix Trichoderma (2.5 kg/ha) in soil.\nDowny Mildew: Spray Metalaxyl (2 gm/L).'
        }
      },
      {
        title: { mr: 'काढणी व साठवणूक', en: 'Harvesting & Storage' },
        content: {
          mr: '५०-७५% मान वाकल्यावर पाणी देणे बंद करावे. ७-१० दिवसांनी काढणी करावी. काढणीनंतर ३-५ दिवस शेतात सावलीत सुकवावे. शेंड्या २-३ सेमी ठेवून कापाव्यात. कांदा चाळवर (Onion Storage Structure) पातळ थरात (३-४ थर) साठवावा. चाळमध्ये हवा खेळती राहील याची काळजी घ्यावी.',
          en: 'Stop irrigation when 50-75% tops fall. Harvest after 7-10 days. Dry in shade for 3-5 days after harvest. Trim tops leaving 2-3 cm. Store on racks (Onion Storage Structure) in thin layers (3-4 layers). Ensure good air circulation in storage.'
        }
      }
    ]
  },
  {
    id: 'wheat',
    category: 'crop',
    title: { mr: 'गहू लागवड', hi: 'गेहूं की खेती', en: 'Wheat Farming' },
    subtitle: { mr: 'रब्बी हंगामातील प्रमुख पीक', hi: 'रबी सीजन की प्रमुख फसल', en: 'Major Rabi Season Crop' },
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1200&auto=format&fit=crop',
    tags: ['Rabi', 'Cereal', 'Staple Food'],
    bestVarieties: ['NIAW-301 (Trimbak)', 'LOK-1', 'HD-2967', 'GW-322', 'MACS-6222', 'Phule Samadhan'],
    expectedYield: {
      mr: 'बागायती: ४५-५५ क्विंटल/हेक्टर. कोरडवाहू: १५-२० क्विंटल/हेक्टर.',
      en: 'Irrigated: 45-55 quintals/ha. Rainfed: 15-20 quintals/ha.'
    },
    marketInfo: {
      mr: 'MSP ₹२,२७५ प्रति क्विंटल (२०२४-२५). गव्हाचे पीठ, मैदा, रवा, सेमोलिना आदी उत्पादनांना सदैव मागणी.',
      en: 'MSP ₹2,275 per quintal (2024-25). Always in demand for flour, maida, semolina products.'
    },
    stats: [
      { label: { mr: 'कालावधी', en: 'Duration' }, value: '110-130 Days', icon: 'clock' },
      { label: { mr: 'पाणी', en: 'Water' }, value: '4-6 Irrigations', icon: 'droplet' },
      { label: { mr: 'हवामान', en: 'Temp' }, value: '15°-25°C', icon: 'sun' },
      { label: { mr: 'बियाणे', en: 'Seed Rate' }, value: '100-125 kg/ha', icon: 'sprout' },
    ],
    sections: [
      {
        title: { mr: 'जमीन आणि हवामान', en: 'Soil & Climate' },
        content: {
          mr: 'गव्हासाठी मध्यम ते भारी, सुपीक, पाण्याचा निचरा होणारी चिकणमाती जमीन उत्तम. जमिनीचा pH ६.० ते ७.५ दरम्यान असावा. उगवणीसाठी २०-२५°C आणि दाणे पोसताना १५-२०°C तापमान आवश्यक. ४०० ते ७०० मिमी पावसाची/सिंचनाची आवश्यकता.',
          en: 'Medium to heavy, fertile, well-drained clay loam soil is best for wheat. Soil pH should be 6.0-7.5. Temperature of 20-25°C for germination and 15-20°C for grain filling. Requires 400-700 mm water.'
        }
      },
      {
        title: { mr: 'पेरणी', en: 'Sowing' },
        content: {
          mr: 'बागायती गव्हाची पेरणी नोव्हेंबर पहिल्या पंधरवड्यात करावी. कोरडवाहू पेरणी ऑक्टोबर अखेरपर्यंत. दोन ओळींत २२.५ सेमी अंतर ठेवावे. बियाणे ५-६ सेमी खोलीवर पेरावे. उशिरा पेरणी (डिसेंबर) केल्यास बियाणे दर २५% वाढवावा.',
          en: 'Sow irrigated wheat in the first fortnight of November. Rainfed sowing by end of October. Keep 22.5 cm row spacing. Sow at 5-6 cm depth. For late sowing (December), increase seed rate by 25%.'
        }
      },
      {
        title: { mr: 'खत व्यवस्थापन', en: 'Fertilizer Management' },
        content: {
          mr: 'बागायती: १२०:६०:४० (N:P₂O₅:K₂O) किलो/हेक्टर.\nनत्र ३ हप्त्यात: पेरणीवेळी (५०%), पहिले पाणी (२५%), दुसरे पाणी (२५%).\nजस्त कमतरतेसाठी: ZnSO₄ (२५ किलो/हेक्टर) जमिनीत.\nफुलोरा अवस्थेत: 0:52:34 (MKP) ५ ग्रॅम/लिटर फवारणी.',
          en: 'Irrigated: 120:60:40 (N:P₂O₅:K₂O) kg/ha.\nNitrogen in 3 splits: at sowing (50%), first irrigation (25%), second irrigation (25%).\nFor Zinc deficiency: ZnSO₄ (25 kg/ha) in soil.\nAt flowering: Spray 0:52:34 (MKP) 5 gm/L.'
        }
      },
      {
        title: { mr: 'पाणी व्यवस्थापन', en: 'Water Management' },
        content: {
          mr: 'गव्हास ४-६ पाणी (सिंचन) आवश्यक.\n१ले पाणी: पेरणीनंतर २१ दिवसांनी (मुकुट मुळांच्या वाढीसाठी - अत्यंत महत्त्वाचे).\n२रे पाणी: ४० दिवसांनी (फुटवे येताना).\n३रे पाणी: ६० दिवसांनी (गाभा बाहेर पडताना).\n४थे पाणी: ८० दिवसांनी (फुलोरा अवस्था).\n५वे पाणी: १०० दिवसांनी (दाणे भरताना).',
          en: 'Wheat needs 4-6 irrigations.\n1st: 21 days after sowing (crown root initiation — most critical).\n2nd: 40 days (tillering).\n3rd: 60 days (stem elongation).\n4th: 80 days (flowering).\n5th: 100 days (grain filling).'
        }
      },
      {
        title: { mr: 'पीक संरक्षण', en: 'Plant Protection' },
        content: {
          mr: 'तांबेरा (Rust): प्रोपीकोनाझोल २५ EC (५०० मिली/हेक्टर) फवारणी.\nकरपा (Blight): मॅन्कोझेब (२.५ किलो/हेक्टर) फवारणी.\nमावा: इमिडाक्लोप्रिड (१५० मिली/हेक्टर).\nउंदीर: ब्रोमाडिओलोन (०.००५%) विषारी गोळ्या वापराव्या.',
          en: 'Rust: Spray Propiconazole 25 EC (500 ml/ha).\nBlight: Spray Mancozeb (2.5 kg/ha).\nAphids: Imidacloprid (150 ml/ha).\nRats: Use Bromadiolone (0.005%) poison baits.'
        }
      }
    ]
  },
  {
    id: 'sugarcane',
    category: 'crop',
    title: { mr: 'ऊस लागवड', hi: 'गन्ना की खेती', en: 'Sugarcane Farming' },
    subtitle: { mr: 'साखर कारखान्यांचे मुख्य पीक', hi: 'चीनी मिल का मुख्य फसल', en: 'Primary Sugar Factory Crop' },
    image: 'https://images.unsplash.com/photo-1599940778173-e5ae6719f0e6?q=80&w=1200&auto=format&fit=crop',
    tags: ['Annual', 'Cash Crop', 'Sugar', 'Ethanol'],
    bestVarieties: ['Co-86032', 'CoM-0265', 'CoVSI-9805', 'Co-92005', 'Phule-265', 'CoC-671'],
    expectedYield: {
      mr: 'आडसाली: १२०-१५० टन/हेक्टर. पूर्वहंगामी: ९०-११० टन/हेक्टर. सुरू: ८०-१०० टन/हेक्टर.',
      en: 'Adsali (pre-seasonal): 120-150 tons/ha. Pre-seasonal: 90-110 tons/ha. Suru: 80-100 tons/ha.'
    },
    marketInfo: {
      mr: 'FRP ₹३,१५ प्रति क्विंटल (बेस रिकव्हरी १०.२५%). उपपदार्थ: गूळ, इथेनॉल, बगॅस (वीजनिर्मिती).',
      en: 'FRP ₹315 per quintal (base recovery 10.25%). By-products: Jaggery, ethanol, bagasse (power generation).'
    },
    stats: [
      { label: { mr: 'कालावधी', en: 'Duration' }, value: '12-18 Months', icon: 'clock' },
      { label: { mr: 'पाणी', en: 'Water' }, value: 'Very High', icon: 'droplet' },
      { label: { mr: 'हवामान', en: 'Temp' }, value: '20°-35°C', icon: 'sun' },
      { label: { mr: 'बेणे', en: 'Seed Sets' }, value: '30,000/ha', icon: 'sprout' },
    ],
    sections: [
      {
        title: { mr: 'जमीन आणि हवामान', en: 'Soil & Climate' },
        content: {
          mr: 'मध्यम ते भारी, सुपीक, पाण्याचा निचरा होणारी जमीन उत्तम. जमिनीचा pH ६.५ ते ८.० दरम्यान असावा. वाढीसाठी ३०-३५°C, परिपक्वतेसाठी २०-२५°C आवश्यक. ११०० ते १५०० मिमी पाण्याची आवश्यकता.',
          en: 'Medium to heavy, fertile, well-drained soil is best. Soil pH should be 6.5-8.0. Temperature of 30-35°C for growth and 20-25°C for maturity. Needs 1100-1500 mm water.'
        }
      },
      {
        title: { mr: 'लागवड पद्धती', en: 'Planting Method' },
        content: {
          mr: 'सरी-वरंबा पद्धतीने लागवड (९० सेमी अंतर). ३ डोळ्यांचे बेणे वापरावे. बेणे कार्बेन्डाझिम (१ ग्रॅम/लिटर) द्रावणात बुडवून लागवड करावी. आडसाली: जुलै-ऑगस्ट, पूर्वहंगामी: ऑक्टोबर-नोव्हेंबर, सुरू: जानेवारी-फेब्रुवारी.',
          en: 'Plant using furrow method (90 cm spacing). Use 3-eyed seed sets. Dip sets in Carbendazim (1 gm/L) solution. Adsali: July-August, Pre-seasonal: October-November, Suru: January-February.'
        }
      },
      {
        title: { mr: 'खत व्यवस्थापन', en: 'Fertilizer Management' },
        content: {
          mr: 'सुरू ऊसासाठी: २५०:११५:११५ (N:P₂O₅:K₂O) किलो/हेक्टर.\nआडसाली: ३४०:१७०:१७० किलो/हेक्टर.\nनत्र ४ हप्त्यात: ०, ४५, ९०, १३५ दिवसांनी.\nशेणखत/कंपोस्ट: २५ टन/हेक्टर.',
          en: 'For Suru cane: 250:115:115 (N:P₂O₅:K₂O) kg/ha.\nAdsali: 340:170:170 kg/ha.\nNitrogen in 4 splits: at 0, 45, 90, 135 days.\nFYM/Compost: 25 tons/ha.'
        }
      },
      {
        title: { mr: 'पीक संरक्षण', en: 'Plant Protection' },
        content: {
          mr: 'खोडकिडा (Internode Borer): ट्रायकोकार्ड (५०,००० अंडी/हेक्टर) प्रत्येक महिन्यात सोडावे.\nहुमणी (White Grub): क्लोरपायरीफॉस (२.५ लिटर/हेक्टर) ड्रेंचिंग.\nलाल सड (Red Rot): रोगमुक्त बेणे वापरावे. कार्बेन्डाझिम (१ ग्रॅम/लिटर) बुडवून लागवड.\nतुरा (Smut): बेणे कार्बेन्डाझिम + मॅन्कोझेब (२ ग्रॅम/लिटर) उपचारित.',
          en: 'Internode Borer: Release Trichocards (50,000 eggs/ha) monthly.\nWhite Grub: Drench Chlorpyrifos (2.5 L/ha).\nRed Rot: Use disease-free seed sets. Dip in Carbendazim (1 gm/L).\nSmut: Treat sets with Carbendazim + Mancozeb (2 gm/L).'
        }
      }
    ]
  },
  {
    id: 'turmeric',
    category: 'crop',
    title: { mr: 'हळद लागवड', hi: 'हल्दी की खेती', en: 'Turmeric Farming' },
    subtitle: { mr: 'सुवर्ण मसाला - उच्च उत्पन्नाचे पीक', hi: 'गोल्डन स्पाइस - उच्च आय', en: 'Golden Spice — High Income Crop' },
    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?q=80&w=1200&auto=format&fit=crop',
    tags: ['Kharif', 'Spice', 'Medicinal', 'Export'],
    bestVarieties: ['Selam', 'Rajapuri', 'Krishna', 'Phule Swarupa', 'Salem Alleppey', 'Prabha'],
    expectedYield: {
      mr: 'बागायती: २५०-३५० क्विंटल/हेक्टर (ओली हळद). सुकी हळद: ५०-७० क्विंटल/हेक्टर.',
      en: 'Irrigated: 250-350 quintals/ha (green turmeric). Dry turmeric: 50-70 quintals/ha.'
    },
    marketInfo: {
      mr: 'सांगली, सेलम हे प्रमुख बाजार. कर्क्यूमिन (Curcumin) ३% पेक्षा जास्त असल्यास चांगला भाव. सेंद्रिय हळदीला प्रीमियम दर.',
      en: 'Sangli, Salem are major markets. Curcumin content above 3% fetches better price. Organic turmeric gets premium rates.'
    },
    stats: [
      { label: { mr: 'कालावधी', en: 'Duration' }, value: '8-9 Months', icon: 'clock' },
      { label: { mr: 'पाणी', en: 'Water' }, value: 'Regular', icon: 'droplet' },
      { label: { mr: 'हवामान', en: 'Temp' }, value: '20°-30°C', icon: 'sun' },
      { label: { mr: 'बेणे', en: 'Seed Rhizome' }, value: '2500 kg/ha', icon: 'sprout' },
    ],
    sections: [
      {
        title: { mr: 'जमीन आणि लागवड', en: 'Soil & Planting' },
        content: {
          mr: 'हलकी ते मध्यम, सुपीक, पाण्याचा निचरा होणारी जमीन उत्तम. लागवड जून-जुलैमध्ये वरंब्यावर करावी. अंतर: ४५ × २२.५ सेमी. प्रत्येक गड्ड्यात ३० ते ५० ग्रॅम कंद लावावा. शेणखत: २५-३० टन/हेक्टर मिसळावे.',
          en: 'Light to medium, fertile, well-drained soil is best. Plant in June-July on ridges. Spacing: 45 × 22.5 cm. Use 30-50 gm rhizome per pit. Mix 25-30 tons/ha FYM.'
        }
      },
      {
        title: { mr: 'खत व्यवस्थापन', en: 'Fertilizer Management' },
        content: {
          mr: 'NPK: १२०:६०:१२० किलो/हेक्टर.\nनत्र ३ हप्त्यात: ६०, ९०, १२० दिवसांनी.\n१५ दिवसांनी पालापाचोळा (आच्छादन) ३-४ इंच जाड टाकावे.\nफेरोसल्फेट (FeSO₄) + ZnSO₄ फवारणी ९० दिवसांनी.',
          en: 'NPK: 120:60:120 kg/ha.\nNitrogen in 3 splits: at 60, 90, 120 days.\nApply mulching (3-4 inches thick) at 15 days.\nSpray Ferrous Sulphate + ZnSO₄ at 90 days.'
        }
      },
      {
        title: { mr: 'काढणी आणि प्रक्रिया', en: 'Harvesting & Processing' },
        content: {
          mr: 'पाने पिवळी पडून सुकल्यावर (८-९ महिन्यांनी) काढणी करावी. काढणीनंतर कंद स्वच्छ धुवून शिजवावेत (४५-६० मिनिटे). सुकवण्यासाठी उन्हात ८-१० दिवस पसरावे. ओलावा ८-१०% पर्यंत कमी होईपर्यंत सुकवावे. पॉलिश करून बाजारात पाठवावी.',
          en: 'Harvest when leaves turn yellow and dry (8-9 months). Wash and boil rhizomes (45-60 minutes) after harvest. Spread in sun for 8-10 days to dry. Dry until moisture reduces to 8-10%. Polish and send to market.'
        }
      }
    ]
  },
  {
    id: 'pomegranate',
    category: 'crop',
    title: { mr: 'डाळिंब लागवड', hi: 'अनार की खेती', en: 'Pomegranate Farming' },
    subtitle: { mr: 'फळबाग शेतीतील नगदी पीक', hi: 'बागवानी का नकदी फसल', en: 'Horticulture Cash Crop' },
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=1200&auto=format&fit=crop',
    tags: ['Perennial', 'Fruit', 'Export', 'High Value'],
    bestVarieties: ['Bhagwa', 'Ganesh', 'Mridula', 'Arakta', 'Ruby', 'Phule Bhagwa Super'],
    expectedYield: {
      mr: '३-४ वर्षांनी फळधारणा सुरू. पूर्ण वाढ झालेल्या झाडापासून ६-८ टन/हेक्टर (मृग बहार). अंबिया बहारात ८-१२ टन/हेक्टर.',
      en: 'Fruiting starts in 3-4 years. 6-8 tons/ha from fully grown trees (Mrig Bahar). 8-12 tons/ha in Ambia Bahar.'
    },
    marketInfo: {
      mr: 'निर्यातीसाठी A ग्रेड (२५० ग्रॅम+) भगवा डाळिंबाला ₹१००-₹२०० प्रति किलो. EU, मध्य-पूर्व, दक्षिण-पूर्व आशिया प्रमुख निर्यात बाजार.',
      en: 'A Grade (250 gm+) Bhagwa pomegranate fetches ₹100-₹200/kg for export. EU, Middle East, South-East Asia are major export markets.'
    },
    stats: [
      { label: { mr: 'फळधारणा', en: 'Bearing' }, value: '3-4 Years', icon: 'clock' },
      { label: { mr: 'पाणी', en: 'Water' }, value: 'Drip Essential', icon: 'droplet' },
      { label: { mr: 'हवामान', en: 'Temp' }, value: '25°-35°C', icon: 'sun' },
      { label: { mr: 'झाडे', en: 'Trees' }, value: '555/ha', icon: 'sprout' },
    ],
    sections: [
      {
        title: { mr: 'लागवड', en: 'Planting' },
        content: {
          mr: 'अंतर: ४.५ × ३ मी (५५५ झाडे/हेक्टर) किंवा ५ × ३ मी (६६६ झाडे/हेक्टर).\nखड्डा: ६०×६०×६० सेमी. शेणखत (२० किलो) + सिंगल सुपर फॉस्फेट (५०० ग्रॅम) + निंबोळी पेंड (१ किलो) मिसळावे.\nलागवड जून-जुलैमध्ये पावसात करावी. रोगमुक्त कलमी रोपे वापरावी.',
          en: 'Spacing: 4.5 × 3 m (555 trees/ha) or 5 × 3 m (666 trees/ha).\nPit: 60×60×60 cm. Mix FYM (20 kg) + SSP (500 gm) + Neem cake (1 kg).\nPlant in June-July during rains. Use disease-free grafted saplings.'
        }
      },
      {
        title: { mr: 'बहार व्यवस्थापन', en: 'Bahar Management' },
        content: {
          mr: 'मृग बहार (जून-जुलै): महाराष्ट्रात प्रचलित. एप्रिलमध्ये पाणी बंद करून ताण द्यावा.\nअंबिया बहार (जानेवारी-फेब्रुवारी): कोरडवाहूसाठी उत्तम. ऑक्टोबरमध्ये ताण द्यावा.\nहस्त बहार (सप्टेंबर-ऑक्टोबर): जुलैमध्ये ताण.\nताण दिल्यानंतर इथेफॉन (३९% SL) ३ मिली/लिटर फवारणी केल्यास एकसमान फुलोरा.',
          en: 'Mrig Bahar (June-July): Common in Maharashtra. Give stress by stopping water in April.\nAmbia Bahar (Jan-Feb): Best for rainfed. Give stress in October.\nHast Bahar (Sep-Oct): Stress in July.\nSpray Ethephon (39% SL) 3 ml/L after stress for uniform flowering.'
        }
      },
      {
        title: { mr: 'पीक संरक्षण', en: 'Plant Protection' },
        content: {
          mr: 'तेल्या (Bacterial Blight): बोर्डो मिश्रण (१%) + स्ट्रेप्टोसायक्लिन (५०० पीपीएम) फवारणी. रोगग्रस्त फांद्या कापून जाळाव्या.\nमर (Wilt): ट्रायकोडर्मा + बॅसिलस सबटिलिस जमिनीत ड्रेंच.\nफळकिडे (Fruit Borer): इमामेक्टिन बेंझोएट (२०० ग्रॅम/हेक्टर).\nमावा/तुडतुडे: इमिडाक्लोप्रिड (१५० मिली/हेक्टर).',
          en: 'Bacterial Blight (Telya): Spray Bordeaux mixture (1%) + Streptocycline (500 ppm). Cut and burn infected branches.\nWilt: Drench Trichoderma + Bacillus subtilis in soil.\nFruit Borer: Emamectin Benzoate (200 gm/ha).\nAphids/Jassids: Imidacloprid (150 ml/ha).'
        }
      }
    ]
  },
  {
    id: 'grape',
    category: 'crop',
    title: { mr: 'द्राक्ष लागवड', hi: 'अंगूर की खेती', en: 'Grape Farming' },
    subtitle: { mr: 'निर्यातक्षम द्राक्ष उत्पादनाचे शास्त्र', hi: 'निर्यात योग्य अंगूर उत्पादन', en: 'Export Quality Grape Production' },
    image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=1200&auto=format&fit=crop',
    tags: ['Perennial', 'Fruit', 'Export', 'High Value'],
    bestVarieties: ['Thompson Seedless', 'Sharad Seedless (Kishmish)', 'Sonaka', 'Tas-A-Ganesh', 'Nanasaheb Purple', 'Crimson Seedless'],
    expectedYield: {
      mr: 'व्यापारी उत्पादन: ३०-४० टन/हेक्टर. निर्यातक्षम: २०-२५ टन/हेक्टर.',
      en: 'Commercial yield: 30-40 tons/ha. Export quality: 20-25 tons/ha.'
    },
    marketInfo: {
      mr: 'EU, UK, रशिया प्रमुख निर्यात बाजार. शरद सीडलेस (मनुके) ला सर्वाधिक मागणी. निर्यात दर: ₹५०-₹१५०/किलो.',
      en: 'EU, UK, Russia are major export markets. Sharad Seedless (raisins) most in demand. Export price: ₹50-₹150/kg.'
    },
    stats: [
      { label: { mr: 'फळधारणा', en: 'Bearing' }, value: '2-3 Years', icon: 'clock' },
      { label: { mr: 'पाणी', en: 'Water' }, value: 'Drip Only', icon: 'droplet' },
      { label: { mr: 'हवामान', en: 'Temp' }, value: '15°-35°C', icon: 'sun' },
      { label: { mr: 'वेली', en: 'Vines' }, value: '2200/ha', icon: 'sprout' },
    ],
    sections: [
      {
        title: { mr: 'लागवड', en: 'Planting' },
        content: {
          mr: 'अंतर: ३ × १.५ मी (Y आकार) किंवा ३.६ × १.८ मी (T आकार).\nखड्डा: ९०×९०×९० सेमी. शेणखत, निंबोळी पेंड, SSP, MOP मिसळावे.\nलागवड कलमी रोपांनी जानेवारी-फेब्रुवारीमध्ये करावी.\nमांडव (Pandal) तयार करणे आवश्यक.',
          en: 'Spacing: 3 × 1.5 m (Y shape) or 3.6 × 1.8 m (T shape).\nPit: 90×90×90 cm. Mix FYM, Neem cake, SSP, MOP.\nPlant grafted saplings in January-February.\nPandal/Pergola setup is essential.'
        }
      },
      {
        title: { mr: 'छाटणी व्यवस्थापन', en: 'Pruning Management' },
        content: {
          mr: 'एप्रिल छाटणी (फळ छाटणी/October Pruning): फळधारणेसाठी.\nऑक्टोबर छाटणी (फॉरवर्ड प्रूनिंग): काड्यांची वाढ.\nछाटणीनंतर बोर्डो पेस्ट लावावी.\nनिर्यातक्षम द्राक्षासाठी ३०-३५ घोस/वेल ठेवावे.',
          en: 'April Pruning (Fruit/October Pruning): For fruiting.\nOctober Pruning (Forward Pruning): For cane growth.\nApply Bordeaux paste after pruning.\nKeep 30-35 bunches/vine for export quality grapes.'
        }
      }
    ]
  },
  {
    id: 'drip',
    category: 'tech',
    title: { mr: 'ठिबक सिंचन', hi: 'ड्रिप सिंचाई', en: 'Drip Irrigation' },
    subtitle: { mr: 'पाण्याची ५०% बचत आणि दुप्पट उत्पादन', hi: 'पानी की बचत और दोगुनी उपज', en: 'Save 50% Water & Double Yield' },
    image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1200&auto=format&fit=crop',
    tags: ['Technology', 'Water Saving', 'Efficiency', 'Subsidy'],
    stats: [
      { label: { mr: 'बचत', en: 'Saving' }, value: '50-60%', icon: 'droplet' },
      { label: { mr: 'उत्पन्न', en: 'Yield' }, value: '+40%', icon: 'trending-up' },
      { label: { mr: 'खर्च', en: 'Cost' }, value: '₹45-80K/ha', icon: 'indian-rupee' },
      { label: { mr: 'अनुदान', en: 'Subsidy' }, value: '55-80%', icon: 'percent' },
    ],
    sections: [
      {
        title: { mr: 'फायदे', en: 'Benefits' },
        content: {
          mr: '१. पाण्याची ५०-६०% बचत होते.\n२. खतांचा (फर्टिगेशन) कार्यक्षम वापर — ३०% खत बचत.\n३. तणांचा प्रादुर्भाव कमी होतो.\n४. उत्पादनात ३०-४०% वाढ होते.\n५. मजुरी खर्चात बचत.\n६. पाण्यात विरघळणारी खते सहज देता येतात.\n७. डोंगराळ/उताराच्या जमिनीत उत्तम काम करते.',
          en: '1. Saves 50-60% water.\n2. Efficient use of fertilizers (Fertigation) — 30% fertilizer saving.\n3. Reduces weed growth.\n4. Increases yield by 30-40%.\n5. Saves labor costs.\n6. Easy to apply water-soluble fertilizers.\n7. Works well on hilly/sloped land.'
        }
      },
      {
        title: { mr: 'प्रणाली घटक', en: 'System Components' },
        content: {
          mr: 'पंप/मोटर → सँड फिल्टर → स्क्रीन/डिस्क फिल्टर → फर्टिगेशन युनिट (व्हेंच्युरी) → मेन पाइपलाइन (PVC) → सब-मेन → लॅटरल लाईन (LDPE/LLDPE) → ड्रिपर (ऑनलाइन/इनलाइन).\nड्रिपर डिस्चार्ज: २-४ लिटर/तास (पिकानुसार).',
          en: 'Pump/Motor → Sand Filter → Screen/Disc Filter → Fertigation Unit (Venturi) → Main Pipeline (PVC) → Sub-Main → Lateral Line (LDPE/LLDPE) → Dripper (Online/Inline).\nDripper discharge: 2-4 liters/hour (crop-dependent).'
        }
      },
      {
        title: { mr: 'देखभाल', en: 'Maintenance' },
        content: {
          mr: 'फिल्टर दररोज/आठवड्यातून एकदा साफ करावेत.\nलॅटरल लाईन्स दर १५ दिवसांनी फ्लश कराव्यात.\nऍसिड ट्रीटमेंट (HCl 33%) महिन्यातून एकदा — ड्रिपर चोक होणे टाळता येते.\nक्लोरिनेशन (Sodium Hypochlorite) त्रैमासिक — शेवाळ/जैविक वाढ नियंत्रण.\nलॅटरल शेवटच्या भागातून पाणी येत आहे का तपासावे.',
          en: 'Clean filters daily or weekly.\nFlush lateral lines every 15 days.\nAcid treatment (HCl 33%) monthly — prevents dripper clogging.\nChlorination (Sodium Hypochlorite) quarterly — controls algae/biological growth.\nCheck if water flows from lateral ends.'
        }
      },
      {
        title: { mr: 'सरकारी अनुदान (PMKSY)', en: 'Government Subsidy (PMKSY)' },
        content: {
          mr: 'प्रधानमंत्री कृषी सिंचन योजना (PMKSY) अंतर्गत:\n• सर्वसाधारण शेतकरी: ५५% अनुदान.\n• अनुसूचित जाती/जमाती: ७५% अनुदान.\n• अल्प/अत्यल्प भूधारक: ८०% पर्यंत अनुदान.\n• अर्ज: https://mahadbt.maharashtra.gov.in वर ऑनलाइन.\n• कागदपत्रे: ७/१२ उतारा, ८-अ, आधार कार्ड, बँक पासबुक.',
          en: 'Under Pradhan Mantri Krishi Sinchayee Yojana (PMKSY):\n• General farmers: 55% subsidy.\n• SC/ST: 75% subsidy.\n• Small/Marginal: Up to 80% subsidy.\n• Apply online: https://mahadbt.maharashtra.gov.in\n• Documents: 7/12 extract, 8-A, Aadhaar, bank passbook.'
        }
      }
    ]
  },
  {
    id: 'sprinkler',
    category: 'tech',
    title: { mr: 'तुषार सिंचन', hi: 'स्प्रिंकलर सिंचाई', en: 'Sprinkler Irrigation' },
    subtitle: { mr: 'पावसासारखे पाणी - सर्व पिकांसाठी', hi: 'बारिश जैसा पानी', en: 'Rain-like Irrigation for All Crops' },
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1200&auto=format&fit=crop',
    tags: ['Technology', 'Water Saving', 'Subsidy'],
    stats: [
      { label: { mr: 'बचत', en: 'Saving' }, value: '30-40%', icon: 'droplet' },
      { label: { mr: 'उत्पन्न', en: 'Yield' }, value: '+25%', icon: 'trending-up' },
      { label: { mr: 'खर्च', en: 'Cost' }, value: '₹25-50K/ha', icon: 'indian-rupee' },
      { label: { mr: 'अनुदान', en: 'Subsidy' }, value: '55-75%', icon: 'percent' },
    ],
    sections: [
      {
        title: { mr: 'उपयोगिता', en: 'Applications' },
        content: {
          mr: 'गहू, हरभरा, भुईमूग, ज्वारी आदी पिकांसाठी उत्तम. सपाट ते किंचित उताराच्या जमिनीत प्रभावी. एकसमान पाणी वितरण. जमिनीची धूप कमी होते. ३०-४०% पाणी बचत.',
          en: 'Ideal for wheat, chickpea, groundnut, sorghum. Effective on flat to slightly sloped land. Uniform water distribution. Reduces soil erosion. 30-40% water saving.'
        }
      },
      {
        title: { mr: 'प्रकार', en: 'Types' },
        content: {
          mr: 'रेनगन (Rain Gun): मोठ्या क्षेत्रासाठी — ३५-५० मी त्रिज्या.\nमिनी स्प्रिंकलर: भाजीपाला, फुलशेतीसाठी.\nमायक्रो स्प्रिंकलर: फळबागांसाठी.\nपोर्टेबल/सेमी-पोर्टेबल: लहान शेतकऱ्यांसाठी.',
          en: 'Rain Gun: For large areas — 35-50 m radius.\nMini Sprinkler: For vegetables, floriculture.\nMicro Sprinkler: For orchards.\nPortable/Semi-portable: For small farmers.'
        }
      }
    ]
  },
  {
    id: 'vermicompost',
    category: 'tech',
    title: { mr: 'गांडूळ खत', hi: 'वर्मीकम्पोस्ट', en: 'Vermicomposting' },
    subtitle: { mr: 'सेंद्रिय शेतीचा पाया', hi: 'जैविक खेती का आधार', en: 'Foundation of Organic Farming' },
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop',
    tags: ['Organic', 'Soil Health', 'Low Cost'],
    stats: [
      { label: { mr: 'खर्च', en: 'Cost' }, value: '₹3-5/kg', icon: 'indian-rupee' },
      { label: { mr: 'कालावधी', en: 'Duration' }, value: '45-60 Days', icon: 'clock' },
      { label: { mr: 'उत्पन्न', en: 'Output' }, value: '60-70%', icon: 'trending-up' },
      { label: { mr: 'NPK', en: 'NPK' }, value: '1.5:0.5:0.8', icon: 'sprout' },
    ],
    sections: [
      {
        title: { mr: 'कृती', en: 'Process' },
        content: {
          mr: 'सावलीत ३ × १ × ०.५ मी आकाराचा बेड तयार करावा. तळाला वाळलेला पालापाचोळा, शेणखत यांचा ६ इंचाचा थर द्यावा. त्यावर अर्ध कुजलेले शेणखत + पिकांचे अवशेष (बारीक केलेले) मिसळावे. प्रति बेड १ किलो गांडुळे (Eisenia fetida) सोडावे. वर ज्यूट/गोणपाट टाकून ओलावा (५०-६०%) टिकवावा. दररोज पाणी शिंपडावे. ४५-६० दिवसांत खत तयार.',
          en: 'Prepare a bed of 3 × 1 × 0.5 m in shade. Layer dry leaves and FYM (6 inch) at bottom. Mix semi-decomposed FYM + crop residues (shredded). Add 1 kg earthworms (Eisenia fetida) per bed. Cover with jute/gunny bag, maintain 50-60% moisture. Sprinkle water daily. Compost ready in 45-60 days.'
        }
      },
      {
        title: { mr: 'फायदे', en: 'Benefits' },
        content: {
          mr: '१. जमिनीचे सेंद्रिय कर्ब वाढवते.\n२. जमिनीची भौतिक रचना सुधारते.\n३. उपयुक्त सूक्ष्मजीवांची संख्या वाढते.\n४. पाणी धरून ठेवण्याची क्षमता वाढते.\n५. रासायनिक खतांचा वापर ३०-५०% कमी होतो.\n६. विक्रीतून अतिरिक्त उत्पन्न (₹५-८/किलो).',
          en: '1. Increases soil organic carbon.\n2. Improves soil physical structure.\n3. Increases beneficial microbial population.\n4. Enhances water retention capacity.\n5. Reduces chemical fertilizer use by 30-50%.\n6. Extra income from sales (₹5-8/kg).'
        }
      }
    ]
  },
  {
    id: 'soil-testing',
    category: 'tech',
    title: { mr: 'माती परीक्षण', hi: 'मृदा परीक्षण', en: 'Soil Testing' },
    subtitle: { mr: 'खत व्यवस्थापनाचा आधार', hi: 'उर्वरक प्रबंधन का आधार', en: 'Foundation for Fertilizer Management' },
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1200&auto=format&fit=crop',
    tags: ['Technology', 'Soil Health', 'Essential'],
    stats: [
      { label: { mr: 'खर्च', en: 'Cost' }, value: 'Free-₹300', icon: 'indian-rupee' },
      { label: { mr: 'वेळ', en: 'Time' }, value: '15-20 Days', icon: 'clock' },
      { label: { mr: 'बचत', en: 'Savings' }, value: '30% Fertilizer', icon: 'trending-up' },
      { label: { mr: 'वैधता', en: 'Validity' }, value: '3 Years', icon: 'percent' },
    ],
    sections: [
      {
        title: { mr: 'नमुना घेणे', en: 'Sample Collection' },
        content: {
          mr: 'शेताच्या ८-१० ठिकाणांहून V-आकारात ०-१५ सेमी खोलीवर माती घ्यावी. सर्व माती एकत्र करून ५०० ग्रॅमचा प्रतिनिधी नमुना तयार करावा. नमुना कापडी पिशवीत ठेवावा. नमुन्यावर शेतकऱ्याचे नाव, गट क्रमांक, पीक लिहावे. कृषी विज्ञान केंद्र (KVK) किंवा माती परीक्षण प्रयोगशाळेत पाठवावा.',
          en: 'Collect soil from 8-10 spots in the field in V-shape at 0-15 cm depth. Mix all soil and prepare a representative 500 gm sample. Keep sample in cloth bag. Write farmer name, plot number, crop on the sample. Send to KVK or Soil Testing Lab.'
        }
      },
      {
        title: { mr: 'परीक्षण मापदंड', en: 'Test Parameters' },
        content: {
          mr: 'pH (सामू): ६.५-७.५ आदर्श.\nEC (विद्युत चालकता): <१ dS/m.\nसेंद्रिय कर्ब (OC): >०.६% उत्तम.\nउपलब्ध नत्र (N): >२८० किलो/हेक्टर उच्च.\nउपलब्ध स्फुरद (P): >२५ किलो/हेक्टर उच्च.\nउपलब्ध पालाश (K): >२८० किलो/हेक्टर उच्च.\nसूक्ष्म अन्नद्रव्ये: Zn, Fe, Mn, Cu, B.',
          en: 'pH: 6.5-7.5 ideal.\nEC (Electrical Conductivity): <1 dS/m.\nOrganic Carbon (OC): >0.6% is good.\nAvailable Nitrogen (N): >280 kg/ha is high.\nAvailable Phosphorus (P): >25 kg/ha is high.\nAvailable Potash (K): >280 kg/ha is high.\nMicronutrients: Zn, Fe, Mn, Cu, B.'
        }
      }
    ]
  },
  {
    id: 'pmkisan',
    category: 'scheme',
    title: { mr: 'पीएम किसान सन्मान निधी', hi: 'पीएम किसान सम्मान निधि', en: 'PM Kisan Samman Nidhi' },
    subtitle: { mr: 'दरवर्षी ₹६,००० थेट बँक खात्यात', hi: 'हर साल ₹6,000 सीधे बैंक खाते में', en: '₹6,000/Year Direct to Bank Account' },
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1200&auto=format&fit=crop',
    tags: ['Government', 'Financial Aid', 'Direct Benefit'],
    stats: [
      { label: { mr: 'रक्कम', en: 'Amount' }, value: '₹6,000/Year', icon: 'indian-rupee' },
      { label: { mr: 'हप्ते', en: 'Installments' }, value: '3 × ₹2,000', icon: 'clock' },
      { label: { mr: 'लाभार्थी', en: 'Beneficiaries' }, value: '11 Crore+', icon: 'trending-up' },
      { label: { mr: 'अर्ज', en: 'Apply' }, value: 'Online/CSC', icon: 'percent' },
    ],
    sections: [
      {
        title: { mr: 'पात्रता', en: 'Eligibility' },
        content: {
          mr: '• सर्व भूधारक शेतकरी कुटुंबे पात्र.\n• कुटुंब: पती, पत्नी, अल्पवयीन मुले.\n• अट: शेतजमीन नावावर असणे आवश्यक.\n• अपात्र: आयकर भरणारे, सरकारी नोकर, निवृत्तीवेतन धारक (₹१०,०००+), व्यावसायिक (डॉक्टर, वकील, इंजिनिअर).',
          en: '• All landholding farmer families are eligible.\n• Family: Husband, wife, minor children.\n• Condition: Land must be in the name.\n• Ineligible: Income tax payers, government employees, pensioners (₹10,000+), professionals (doctors, lawyers, engineers).'
        }
      },
      {
        title: { mr: 'अर्ज प्रक्रिया', en: 'Application Process' },
        content: {
          mr: '• ऑनलाइन: https://pmkisan.gov.in वर नोंदणी.\n• CSC (कॉमन सर्व्हिस सेंटर) मार्फत अर्ज.\n• कागदपत्रे: आधार कार्ड, बँक पासबुक, ७/१२ उतारा, मोबाईल नंबर.\n• eKYC पूर्ण करणे अनिवार्य.\n• स्टेटस चेक: https://pmkisan.gov.in/BeneficiaryStatus',
          en: '• Online: Register at https://pmkisan.gov.in\n• Apply through CSC (Common Service Center).\n• Documents: Aadhaar card, Bank passbook, 7/12 extract, Mobile number.\n• eKYC completion is mandatory.\n• Check status: https://pmkisan.gov.in/BeneficiaryStatus'
        }
      }
    ]
  },
  {
    id: 'crop-insurance',
    category: 'scheme',
    title: { mr: 'पीक विमा योजना (PMFBY)', hi: 'फसल बीमा योजना', en: 'Crop Insurance (PMFBY)' },
    subtitle: { mr: 'नैसर्गिक आपत्तीत नुकसान भरपाई', hi: 'प्राकृतिक आपदा में नुकसान भरपाई', en: 'Compensation for Natural Calamities' },
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1200&auto=format&fit=crop',
    tags: ['Government', 'Insurance', 'Risk Management'],
    stats: [
      { label: { mr: 'प्रीमियम', en: 'Premium' }, value: '1.5-5%', icon: 'indian-rupee' },
      { label: { mr: 'खरीप', en: 'Kharif' }, value: '2% Premium', icon: 'clock' },
      { label: { mr: 'रब्बी', en: 'Rabi' }, value: '1.5% Premium', icon: 'trending-up' },
      { label: { mr: 'नगदी', en: 'Commercial' }, value: '5% Premium', icon: 'percent' },
    ],
    sections: [
      {
        title: { mr: 'योजनेची वैशिष्ट्ये', en: 'Scheme Features' },
        content: {
          mr: '• खरीप पिकांसाठी २% आणि रब्बी पिकांसाठी १.५% शेतकरी प्रीमियम.\n• नगदी/बागायती पिकांसाठी ५% प्रीमियम.\n• उर्वरित प्रीमियम केंद्र व राज्य सरकार भरते.\n• नुकसानीचे मूल्यांकन: रिमोट सेन्सिंग + पीक कापणी प्रयोग.\n• ७२ तासांत नुकसानीची माहिती कळवणे अनिवार्य.',
          en: '• 2% farmer premium for Kharif and 1.5% for Rabi crops.\n• 5% premium for commercial/horticultural crops.\n• Remaining premium paid by Central and State government.\n• Loss assessment: Remote sensing + Crop Cutting Experiments.\n• Mandatory to report loss within 72 hours.'
        }
      },
      {
        title: { mr: 'अर्ज कसा करावा', en: 'How to Apply' },
        content: {
          mr: '• कर्जदार शेतकरी: बँकेमार्फत आपोआप विमा.\n• बिगर कर्जदार: CSC/बँक/ऑनलाइन अर्ज.\n• वेबसाइट: https://pmfby.gov.in\n• Crop Insurance App वर नुकसान कळवता येते.\n• कागदपत्रे: ७/१२, पेरणी प्रमाणपत्र, आधार, बँक पासबुक.',
          en: '• Loanee farmers: Automatic enrollment through bank.\n• Non-loanee: Apply via CSC/Bank/Online.\n• Website: https://pmfby.gov.in\n• Report losses on Crop Insurance App.\n• Documents: 7/12, Sowing certificate, Aadhaar, Bank passbook.'
        }
      }
    ]
  },
  {
    id: 'dairy',
    category: 'livestock',
    title: { mr: 'दुग्धव्यवसाय', hi: 'डेयरी फार्मिंग', en: 'Dairy Farming' },
    subtitle: { mr: 'दूध उत्पादनातून शाश्वत उत्पन्न', hi: 'दूध उत्पादन से स्थिर आय', en: 'Sustainable Income from Milk Production' },
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1200&auto=format&fit=crop',
    tags: ['Livestock', 'Dairy', 'Daily Income'],
    stats: [
      { label: { mr: 'दूध', en: 'Milk' }, value: '10-25 L/day', icon: 'droplet' },
      { label: { mr: 'दर', en: 'Rate' }, value: '₹30-45/L', icon: 'indian-rupee' },
      { label: { mr: 'जाती', en: 'Breeds' }, value: 'HF/Jersey/Gir', icon: 'sprout' },
      { label: { mr: 'खर्च', en: 'Cost' }, value: '₹60-90K/cow', icon: 'trending-up' },
    ],
    sections: [
      {
        title: { mr: 'जातींची निवड', en: 'Breed Selection' },
        content: {
          mr: 'संकरित (HF/Jersey Cross): १५-२५ लिटर/दिवस. व्यवस्थापन-सघन.\nगीर: ८-१२ लिटर/दिवस. उष्ण हवामानात तग. A2 दूध.\nसाहिवाल: १०-१५ लिटर/दिवस. रोग प्रतिकारक्षम.\nम्हैस (मुऱ्हा): ८-१२ लिटर/दिवस. उच्च फॅट (७-८%).\nनिवड हवामान, बाजार, व्यवस्थापन क्षमतेनुसार करावी.',
          en: 'Crossbred (HF/Jersey Cross): 15-25 L/day. Management-intensive.\nGir: 8-12 L/day. Heat tolerant. A2 milk.\nSahiwal: 10-15 L/day. Disease resistant.\nBuffalo (Murrah): 8-12 L/day. High fat (7-8%).\nSelect based on climate, market, and management capacity.'
        }
      },
      {
        title: { mr: 'आहार व्यवस्थापन', en: 'Feed Management' },
        content: {
          mr: 'हिरवा चारा: ३०-४० किलो/दिवस (नेपियर, मका, लसूणघास).\nवाळलेला चारा: ५-८ किलो/दिवस (भुसा, कडवण).\nपशुखाद्य (खुराक): दूध उत्पादनानुसार — प्रति २.५ लिटर दुधासाठी १ किलो.\nखनिज मिश्रण: ५० ग्रॅम/दिवस. मीठ: ३० ग्रॅम/दिवस.\nस्वच्छ पाणी: ६०-८० लिटर/दिवस (दिवसातून ३-४ वेळा).',
          en: 'Green fodder: 30-40 kg/day (Napier, Maize, Lucerne).\nDry fodder: 5-8 kg/day (straw, kadba).\nConcentrate feed: Based on milk yield — 1 kg per 2.5 liters milk.\nMineral mixture: 50 gm/day. Salt: 30 gm/day.\nClean water: 60-80 L/day (3-4 times daily).'
        }
      },
      {
        title: { mr: 'आरोग्य व्यवस्थापन', en: 'Health Management' },
        content: {
          mr: 'लसीकरण वेळापत्रक:\n• FMD (खुरपका-मुखपका): दर ६ महिन्यांनी.\n• HS (घटसर्प): वर्षातून एकदा (मान्सूनपूर्वी).\n• BQ (फऱ्या): वर्षातून एकदा.\n• ब्रुसेला: ४-८ महिने वयात (एकदाच).\nजंतनाशक: दर ३ महिन्यांनी (Albendazole/Fenbendazole).\nकासदाह (Mastitis): CMT चाचणी नियमित. दूध काढताना स्वच्छता.',
          en: 'Vaccination schedule:\n• FMD: Every 6 months.\n• HS (Hemorrhagic Septicemia): Once a year (before monsoon).\n• BQ (Black Quarter): Once a year.\n• Brucellosis: At 4-8 months age (once).\nDeworming: Every 3 months (Albendazole/Fenbendazole).\nMastitis: Regular CMT testing. Maintain hygiene during milking.'
        }
      },
      {
        title: { mr: 'अर्थशास्त्र', en: 'Economics' },
        content: {
          mr: '१ गाय (HF Cross) — गुंतवणूक:\n• गाय खरेदी: ₹६०,०००-₹९०,०००\n• शेड: ₹३०,०००-₹५०,०००\n• मासिक खर्च: ₹८,०००-₹१२,०००\n• मासिक उत्पन्न (१५ लिटर × ₹३५ × ३० दिवस): ₹१५,७५०\n• मासिक नफा: ₹३,७५०-₹७,७५०\n• शेण/गोमूत्र विक्री: अतिरिक्त उत्पन्न.',
          en: '1 Cow (HF Cross) — Investment:\n• Cow purchase: ₹60,000-₹90,000\n• Shed: ₹30,000-₹50,000\n• Monthly cost: ₹8,000-₹12,000\n• Monthly income (15 L × ₹35 × 30 days): ₹15,750\n• Monthly profit: ₹3,750-₹7,750\n• Dung/Urine sale: Additional income.'
        }
      }
    ]
  },
  {
    id: 'poultry',
    category: 'livestock',
    title: { mr: 'कुक्कुटपालन', hi: 'मुर्गीपालन', en: 'Poultry Farming' },
    subtitle: { mr: 'कमी जागेत जास्त उत्पन्न', hi: 'कम जगह में अधिक आय', en: 'High Income in Less Space' },
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=1200&auto=format&fit=crop',
    tags: ['Livestock', 'Poultry', 'Quick Returns'],
    stats: [
      { label: { mr: 'अंडी', en: 'Eggs' }, value: '250-300/year', icon: 'sprout' },
      { label: { mr: 'मांस', en: 'Meat' }, value: '2-2.5 kg/bird', icon: 'trending-up' },
      { label: { mr: 'गुंतवणूक', en: 'Investment' }, value: '₹50-80/bird', icon: 'indian-rupee' },
      { label: { mr: 'परतावा', en: 'Returns' }, value: '6-8 Months', icon: 'clock' },
    ],
    sections: [
      {
        title: { mr: 'जातींची निवड', en: 'Breed Selection' },
        content: {
          mr: 'अंडी उत्पादन: BV-300, White Leghorn — २५०-३०० अंडी/वर्ष.\nमांस उत्पादन (ब्रॉयलर): Vencob, Cobb-400 — ४२ दिवसांत २-२.५ किलो.\nदेशी/गावठी: गिरिराज, वनराजा — दुहेरी उद्देश. रोग प्रतिकारक.\nकडकनाथ: काळे मांस — प्रीमियम दर (₹५००-₹८००/किलो).',
          en: 'Egg production: BV-300, White Leghorn — 250-300 eggs/year.\nMeat (Broiler): Vencob, Cobb-400 — 2-2.5 kg in 42 days.\nDesi/Country: Giriraja, Vanaraja — Dual purpose. Disease resistant.\nKadaknath: Black meat — Premium price (₹500-₹800/kg).'
        }
      },
      {
        title: { mr: 'व्यवस्थापन', en: 'Management' },
        content: {
          mr: 'शेड: १ चौ. फूट/ब्रॉयलर, २ चौ. फूट/लेअर.\nतापमान: पहिल्या आठवड्यात ३५°C, दर आठवड्याला ३°C कमी.\nखाद्य: स्टार्टर (०-३ आठवडे), ग्रोअर (३-६ आठवडे), फिनिशर (६+ आठवडे).\nपाणी: शुद्ध, थंड पाणी सतत उपलब्ध.\nलसीकरण: Marek\'s (दिवस १), Lasota/F1 (दिवस ७), IBD (दिवस १४, २८), Lasota Booster (दिवस २१).',
          en: 'Shed: 1 sq ft/broiler, 2 sq ft/layer.\nTemperature: 35°C first week, reduce 3°C weekly.\nFeed: Starter (0-3 weeks), Grower (3-6 weeks), Finisher (6+ weeks).\nWater: Clean, cool water always available.\nVaccination: Marek\'s (Day 1), Lasota/F1 (Day 7), IBD (Day 14, 28), Lasota Booster (Day 21).'
        }
      }
    ]
  }
];

export const CATEGORIES = [
  { id: 'all', label: { mr: 'सर्व', en: 'All' }, icon: 'grid', color: 'from-emerald-500 to-teal-600' },
  { id: 'crop', label: { mr: 'पिके', en: 'Crops' }, icon: 'wheat', color: 'from-green-500 to-emerald-600' },
  { id: 'tech', label: { mr: 'तंत्रज्ञान', en: 'Technology' }, icon: 'settings', color: 'from-blue-500 to-indigo-600' },
  { id: 'livestock', label: { mr: 'पशुपालन', en: 'Livestock' }, icon: 'milk', color: 'from-amber-500 to-orange-600' },
  { id: 'scheme', label: { mr: 'योजना', en: 'Schemes' }, icon: 'landmark', color: 'from-purple-500 to-violet-600' },
];
