
import { Language } from './types';

export const TRANSLATIONS: Record<Language, any> = {
  mr: {
    app_name: "AI कृषी मित्र",
    menu_dashboard: "डॅशबोर्ड",
    menu_market: "बाजार भाव",
    menu_weather: "हवामान",
    menu_crop_doctor: "पीक डॉक्टर",
    menu_knowledge: "कृषी ज्ञान",
    menu_schemes: "योजना",
    menu_voice: "व्हॉइस असिस्टंट",
    menu_soil: "माती परीक्षण",
    menu_yield: "उत्पन्न अंदाज",
    menu_area: "क्षेत्र मोजणी",
    
    live_system: "लाईव्ह सिस्टम",
    welcome_title: "नमस्कार,",
    welcome_subtitle: "तुमच्या शेतीचा आजचा अहवाल",
    weather_alert_title: "हवामान इशारा",
    weather_alert_msg: "पुढील २ तासात जोरदार पावसाची शक्यता आहे. काढणी केलेला माल सुरक्षित ठेवा.",
    
    quick_action_doctor: "पीक डॉक्टर",
    quick_action_doctor_desc: "झटपट रोग निदान",
    quick_action_market: "बाजार भाव",
    quick_action_market_desc: "ताजी अपडेट",
    quick_action_soil: "माती परीक्षण",
    quick_action_tools: "स्मार्ट टूल्स",

    govt_schemes: "शासकीय योजना",
    latest_news: "कृषी बातम्या",
    view_all: "सर्व पहा",
    
    schemes_title: "शासकीय योजना",
    schemes_desc: "शेतकऱ्यांसाठी विविध सरकारी योजनांची माहिती",
    scheme_benefit: "फायदा",
    scheme_deadline: "मुदत",
    apply_btn: "सविस्तर माहिती",
    open_status: "सुरू आहे",
    closed_status: "बंद",

    scheme_tabs_info: "माहिती",
    scheme_tabs_docs: "कागदपत्रे",
    scheme_tabs_process: "अर्ज प्रक्रिया",
    scheme_eligibility: "पात्रता",
    scheme_step_by_step: "अर्जाच्या पायऱ्या",
    scheme_documents_req: "आवश्यक कागदपत्रे",

    market_title: "बाजार भाव",
    market_subtitle: "तुमच्या जवळील बाजार समित्यांचे भाव",
    price_label: "भाव",
    arrival_label: "आवक",

    weather_title: "हवामान अंदाज",
    weather_subtitle: "पुढील ३ दिवसांचा अंदाज",
    wind: "वारा",
    humidity: "आद्रता",
    uv_index: "उन",

    scan_title: "पीक डॉक्टर",
    scan_desc: "पिकाच्या पानाचा फोटो काढा आणि रोगाचे अचूक निदान मिळवा",
    take_photo: "फोटो काढा",
    upload_text: "किंवा फोटो अपलोड करा",
    analyzing: "तपासणी करत आहे...",
    analysis_report: "तपासणी अहवाल",
    save_report: "अहवाल जतन करा",
    share_expert: "तज्ञांना पाठवा",

    voice_title: "मी ऐकतोय...",
    voice_tap: "बोलण्यासाठी टॅप करा",
    voice_desc: "हवामान, पीक किंवा बाजारभावाबद्दल तुमच्या भाषेत विचारा.",
    voice_hints: [
      "सोयाबीनचा आजचा भाव काय आहे?",
      "आज पाऊस पडेल का?",
      "पीएम किसान योजनेची माहिती द्या",
      "कापसावर कोणती फवारणी करावी?"
    ],

    blog_title: "कृषी ज्ञान भांडार",
    blog_subtitle: "नवीन तंत्रज्ञान आणि यशोगाथा",
    read_article: "लेख वाचा",
    
    soil_title: "माती आरोग्य कार्ड",
    soil_subtitle: "NPK टाकून खताचा सल्ला मिळवा",
    n_label: "नायट्रोजन (N)",
    p_label: "फॉस्फरस (P)",
    k_label: "पोटॅशियम (K)",
    crop_input: "कोणते पीक घेणार आहात?",
    analyze_soil_btn: "खत व्यवस्थापन सल्ला मिळवा",
    soil_result_title: "AI मृदा सल्ला",

    yield_title: "उत्पन्न अंदाज",
    yield_subtitle: "AI वापरून उत्पन्नाचा अंदाज घ्या",
    sowing_date: "पेरणी तारीख",
    soil_type: "जमिनीचा प्रकार",
    irrigation_type: "सिंचन पद्धत",
    area_size: "क्षेत्र (एकर)",
    predict_btn: "उत्पन्न अंदाज सांगा",
    yield_result: "अपेक्षित उत्पन्न",

    area_title: "क्षेत्र मोजणी (सॅटेलाईट)",
    area_subtitle: "नकाशावर टॅप करून जमीन मोजा",
    total_area: "एकूण क्षेत्र",
    unit_sqm: "चौ. मीटर",
    unit_acre: "एकर",
    unit_guntha: "गुंठा",
    unit_hectare: "हेक्टर",
    unit_bigha: "बिघा",
    reset_map: "पुन्हा मोजा",
    undo_point: "मागे घ्या",

    author: "लेखक",
    date_format: "दिनांक",
  },
  hi: {
    app_name: "AI कृषि मित्र",
    menu_dashboard: "डैशबोर्ड",
    menu_market: "मंडी भाव",
    menu_weather: "मौसम",
    menu_crop_doctor: "फसल डॉक्टर",
    menu_knowledge: "कृषि ज्ञान",
    menu_schemes: "योजनाएं",
    menu_voice: "वॉयस असिस्टेंट",
    menu_soil: "मृदा परीक्षण",
    menu_yield: "उपज अनुमान",
    menu_area: "क्षेत्र मापन",

    live_system: "लाइव सिस्टम",
    welcome_title: "नमस्ते,",
    welcome_subtitle: "आपकी खेती की आज की रिपोर्ट",
    weather_alert_title: "मौसम चेतावनी",
    weather_alert_msg: "अगले 2 घंटों में भारी बारिश की संभावना है। फसल सुरक्षित करें।",

    quick_action_doctor: "फसल डॉक्टर",
    quick_action_doctor_desc: "त्वरित निदान",
    quick_action_market: "मंडी भाव",
    quick_action_market_desc: "ताज़ा अपडेट",
    quick_action_soil: "मृदा परीक्षण",
    quick_action_tools: "स्मार्ट टूल्स",

    govt_schemes: "सरकारी योजनाएं",
    latest_news: "कृषि समाचार",
    view_all: "सभी देखें",

    schemes_title: "सरकारी योजनाएं",
    schemes_desc: "किसानों के लिए विभिन्न सरकारी योजनाओं की जानकारी",
    scheme_benefit: "लाभ",
    scheme_deadline: "समय सीमा",
    apply_btn: "विस्तृत जानकारी",
    open_status: "खुला है",
    closed_status: "बंद",

    scheme_tabs_info: "जानकारी",
    scheme_tabs_docs: "दस्तावेज़",
    scheme_tabs_process: "आवेदन प्रक्रिया",
    scheme_eligibility: "पात्रता",
    scheme_step_by_step: "आवेदन के चरण",
    scheme_documents_req: "आवश्यक दस्तावेज़",

    market_title: "मंडी भाव",
    market_subtitle: "आपके नजदीकी मंडी के भाव",
    price_label: "भाव",
    arrival_label: "आवक",

    weather_title: "मौसम पूर्वानुमान",
    weather_subtitle: "अगले 3 दिनों का अनुमान",
    wind: "हवा",
    humidity: "नमी",
    uv_index: "धूप",

    scan_title: "फसल डॉक्टर",
    scan_desc: "फसल की पत्ती की फोटो लें और बीमारी का सटीक निदान पाएं",
    take_photo: "फोटो लें",
    upload_text: "या फोटो अपलोड करें",
    analyzing: "जांच कर रहा है...",
    analysis_report: "जांच रिपोर्ट",
    save_report: "रिपोर्ट सेव करें",
    share_expert: "विशेषज्ञ को भेजें",

    voice_title: "मैं सुन रहा हूँ...",
    voice_tap: "बोलने के लिए टैप करें",
    voice_desc: "मौसम, फसल या बाजार भाव के बारे में अपनी भाषा में पूछें।",
    voice_hints: [
      "सोयाबीन का आज का भाव क्या है?",
      "क्या आज बारिश होगी?",
      "पीएम किसान योजना की जानकारी दें",
      "कपास पर कौन सा छिड़काव करें?"
    ],

    blog_title: "कृषि ज्ञान केंद्र",
    blog_subtitle: "नई तकनीक और सफलता की कहानियाँ",
    read_article: "लेख पढ़ें",
    
    soil_title: "मृदा स्वास्थ्य कार्ड",
    soil_subtitle: "NPK डालकर खाद की सलाह प्राप्त करें",
    n_label: "नाइट्रोजन (N)",
    p_label: "फास्फोरस (P)",
    k_label: "पोटेशियम (K)",
    crop_input: "कौन सी फसल उगा रहे हैं?",
    analyze_soil_btn: "खाद प्रबंधन सलाह प्राप्त करें",
    soil_result_title: "AI मृदा सलाह",

    yield_title: "उपज अनुमान",
    yield_subtitle: "AI का उपयोग करके उपज का अनुमान लगाएं",
    sowing_date: "बुवाई की तारीख",
    soil_type: "मिट्टी का प्रकार",
    irrigation_type: "सिंचाई का प्रकार",
    area_size: "क्षेत्र (एकड़)",
    predict_btn: "उपज अनुमान प्राप्त करें",
    yield_result: "अनुमानित उपज",

    area_title: "क्षेत्र मापन (सैटेलाइट)",
    area_subtitle: "मानचित्र पर टैप करके भूमि मापें",
    total_area: "कुल क्षेत्र",
    unit_sqm: "वर्ग मीटर",
    unit_acre: "एकड़",
    unit_guntha: "गुंठा",
    unit_hectare: "हेक्टेयर",
    unit_bigha: "बीघा",
    reset_map: "रीसेट करें",
    undo_point: "पीछे जाएं",

    author: "लेखक",
    date_format: "दिनांक",
  },
  en: {
    app_name: "AI Krushi Mitra",
    menu_dashboard: "Dashboard",
    menu_market: "Market",
    menu_weather: "Weather",
    menu_crop_doctor: "Crop Doctor",
    menu_knowledge: "Knowledge",
    menu_schemes: "Schemes",
    menu_voice: "Voice Assistant",
    menu_soil: "Soil Health",
    menu_yield: "Yield Predictor",
    menu_area: "Area Calc",

    live_system: "Live System",
    welcome_title: "Hello,",
    welcome_subtitle: "Here's your smart farming summary",
    weather_alert_title: "Weather Alert",
    weather_alert_msg: "Heavy rain expected in next 2 hours. Secure harvested crops.",

    quick_action_doctor: "Crop Doctor",
    quick_action_doctor_desc: "Instant Diagnosis",
    quick_action_market: "Market Rates",
    quick_action_market_desc: "Live Updates",
    quick_action_soil: "Soil Health",
    quick_action_tools: "Smart Tools",

    govt_schemes: "Govt Schemes",
    latest_news: "Agri News",
    view_all: "View All",

    schemes_title: "Government Schemes",
    schemes_desc: "Benefits and subsidies for farmers",
    scheme_benefit: "Benefit",
    scheme_deadline: "Deadline",
    apply_btn: "View Details",
    open_status: "Open",
    closed_status: "Closed",

    scheme_tabs_info: "Info",
    scheme_tabs_docs: "Documents",
    scheme_tabs_process: "Process",
    scheme_eligibility: "Eligibility",
    scheme_step_by_step: "How to Apply",
    scheme_documents_req: "Required Documents",

    market_title: "Market Rates",
    market_subtitle: "Live prices from local Mandis",
    price_label: "Price",
    arrival_label: "Arrival",

    weather_title: "Weather Forecast",
    weather_subtitle: "Forecast for next 3 days",
    wind: "Wind",
    humidity: "Humidity",
    uv_index: "UV Index",

    scan_title: "Crop Doctor",
    scan_desc: "Upload a photo of your crop leaf for instant diagnosis",
    take_photo: "Take Photo",
    upload_text: "or drag and drop here",
    analyzing: "Analyzing...",
    analysis_report: "Analysis Report",
    save_report: "Save Report",
    share_expert: "Share with Expert",

    voice_title: "I'm listening...",
    voice_tap: "Tap to Speak",
    voice_desc: "Ask about weather, crops, or market rates in your language.",
    voice_hints: [
      "What is the soyabean rate?",
      "Will it rain today?",
      "Explain PM Kisan Scheme",
      "Identify crop disease"
    ],

    blog_title: "Knowledge Hub",
    blog_subtitle: "Latest farming techniques",
    read_article: "Read Article",
    
    soil_title: "Soil Health Card",
    soil_subtitle: "Enter NPK for fertilizer advice",
    n_label: "Nitrogen (N)",
    p_label: "Phosphorus (P)",
    k_label: "Potassium (K)",
    crop_input: "Which crop are you growing?",
    analyze_soil_btn: "Get Fertilizer Advice",
    soil_result_title: "AI Soil Advice",

    yield_title: "Yield Predictor",
    yield_subtitle: "Estimate production using AI",
    sowing_date: "Sowing Date",
    soil_type: "Soil Type",
    irrigation_type: "Irrigation",
    area_size: "Area (Acres)",
    predict_btn: "Predict Yield",
    yield_result: "Expected Yield",

    area_title: "Area Calculator (Sat)",
    area_subtitle: "Tap on map to calculate field area",
    total_area: "Total Area",
    unit_sqm: "Sq. Meter",
    unit_acre: "Acre",
    unit_guntha: "Guntha",
    unit_hectare: "Hectare",
    unit_bigha: "Bigha",
    reset_map: "Reset",
    undo_point: "Undo",

    author: "Author",
    date_format: "Date",
  }
};

export const SCHEMES_DATA = {
  mr: [
    {
      id: 1,
      title: 'प्रधानमंत्री किसान सन्मान निधी (PM-Kisan)',
      subtitle: 'दरवर्षी ₹६००० ची आर्थिक मदत',
      status: 'OPEN',
      grad: 'from-green-600 to-emerald-700',
      description: 'अल्प आणि अत्यल्प भूधारक शेतकऱ्यांचे उत्पन्न वाढवण्यासाठी भारत सरकारची ही महत्त्वाची योजना आहे. या अंतर्गत शेतकऱ्यांना दरवर्षी ६००० रुपये तीन समान हप्त्यांमध्ये (प्रत्येकी २०००) दिले जातात.',
      benefits: [
        'दरवर्षी ₹६००० थेट बँक खात्यात',
        'हप्ता १: एप्रिल-जुलै (₹२०००)',
        'हप्ता २: ऑगस्ट-नोव्हेंबर (₹२०००)',
        'हप्ता ३: डिसेंबर-मार्च (₹२०००)',
        'कोणत्याही मध्यस्थाची गरज नाही'
      ],
      eligibility: [
        'स्वतःच्या नावावर शेतजमीन असावी',
        'संस्थात्मक जमीनधारक पात्र नाहीत',
        'कुटुंबातील पती, पत्नी आणि अल्पवयीन मुले',
        'सरकारी नोकरी किंवा आयकर भरणारे अपात्र'
      ],
      documents: [
        'आधार कार्ड',
        'बँक पासबुक (आधार लिंक केलेले)',
        '७/१२ उतारा आणि ८-अ',
        'मोबाईल नंबर',
        'पासपोर्ट साईझ फोटो'
      ],
      process: [
        { title: 'नोंदणी', desc: 'pmkisan.gov.in वर जा आणि "New Farmer Registration" वर क्लिक करा.' },
        { title: 'माहिती भरा', desc: 'आधार नंबर, राज्य आणि कॅप्चा कोड टाकून सर्च करा.' },
        { title: 'जमीन तपशील', desc: 'तुमच्या जमिनीचा सर्वे नंबर, गट नंबर आणि क्षेत्र अचूक भरा.' },
        { title: 'कागदपत्रे अपलोड', desc: '७/१२ उतारा आणि आधार कार्ड स्कॅन करून अपलोड करा.' },
        { title: 'सबमिट', desc: 'फॉर्म सबमिट करा आणि रजिस्ट्रेशन नंबर लिहून ठेवा.' }
      ]
    },
    {
      id: 2,
      title: 'प्रधानमंत्री पीक विमा योजना (PMFBY)',
      subtitle: 'पिकांचे नैसर्गिक आपत्तीपासून संरक्षण',
      status: 'OPEN',
      grad: 'from-blue-600 to-indigo-700',
      description: 'नैसर्गिक आपत्ती, कीड आणि रोगांमुळे पिकांचे नुकसान झाल्यास शेतकऱ्यांना आर्थिक मदत देण्यासाठी ही योजना आहे. अतिशय कमी प्रीमियमवर विमा संरक्षण मिळते.',
      benefits: [
        'खरीप पिकांसाठी फक्त २% प्रीमियम',
        'रब्बी पिकांसाठी १.५% प्रीमियम',
        'बागायती/नगदी पिकांसाठी ५% प्रीमियम',
        'स्थानिक नैसर्गिक आपत्तीसाठी संरक्षण',
        'काढणीपश्चात नुकसानीची भरपाई'
      ],
      eligibility: [
        'सर्व शेतकरी (कर्जदार आणि बिगर कर्जदार)',
        'भाडेतत्वावर शेती करणारे (काही अटी)',
        'अधिसूचित पिके घेणारे शेतकरी'
      ],
      documents: [
        '७/१२ उतारा',
        'पीक पेरा दाखला (तलाठी स्वाक्षरी)',
        'आधार कार्ड',
        'बँक पासबुक',
        'रद्द केलेला चेक'
      ],
      process: [
        { title: 'बँक/CSC', desc: 'जवळच्या बँकेत किंवा CSC सेंटरवर जा.' },
        { title: 'फॉर्म भरा', desc: 'विमा प्रस्ताव फॉर्म भरा आणि प्रीमियम जमा करा.' },
        { title: 'ऑनलाइन', desc: 'pmfby.gov.in या पोर्टलवर स्वतः अर्ज करू शकता.' },
        { title: 'नुकसान सूचना', desc: 'नुकसान झाल्यास ७२ तासांच्या आत विमा कंपनीला कळवणे अनिवार्य आहे (अॅपद्वारे).' }
      ]
    },
    {
      id: 3,
      title: 'नमो शेतकरी महासन्मान निधी',
      subtitle: 'राज्य सरकारकडून अतिरिक्त ₹६०००',
      status: 'OPEN',
      grad: 'from-orange-500 to-red-600',
      description: 'महाराष्ट्र शासनाने पीएम किसान योजनेच्या धर्तीवर ही योजना सुरू केली आहे. पात्र शेतकऱ्यांना पीएम किसानचे ₹६००० आणि नमो योजनेचे ₹६००० असे एकूण ₹१२००० मिळतील.',
      benefits: [
        'वार्षिक ₹६००० अतिरिक्त मदत',
        'पीएम किसानच्या लाभार्थ्यांनाच लाभ',
        'स्वतंत्र अर्जाची गरज नाही',
        'थेट बँक हस्तांतरण (DBT)'
      ],
      eligibility: [
        'शेतकरी महाराष्ट्राचा रहिवासी असावा',
        'पीएम किसान योजनेसाठी पात्र असावा',
        'बँक खाते आधारशी लिंक असावे'
      ],
      documents: [
        'पीएम किसान नोंदणी असणे आवश्यक',
        'आधार कार्ड',
        'ई-केवायसी (e-KYC) पूर्ण असणे अनिवार्य'
      ],
      process: [
        { title: 'स्वतंत्र अर्ज नाही', desc: 'या योजनेसाठी वेगळा अर्ज करण्याची गरज नाही.' },
        { title: 'e-KYC', desc: 'तुमची पीएम किसान e-KYC पूर्ण करा.' },
        { title: 'आधार लिंक', desc: 'बँक खात्याला आधार आणि मोबाईल लिंक असल्याची खात्री करा.' },
        { title: 'स्थिती तपासा', desc: 'अधिकृत पोर्टलवर बेनिफिशिअरी स्टेटस तपासा.' }
      ]
    },
    {
      id: 4,
      title: 'कुसुम सोलार पंप योजना',
      subtitle: 'सौर कृषी पंपासाठी ९०% सबसिडी',
      status: 'OPEN',
      grad: 'from-cyan-600 to-blue-600',
      description: 'ज्या शेतकऱ्यांकडे वीज जोडणी नाही अशा शेतकऱ्यांना दिवसा सिंचन करता यावे यासाठी सौर कृषी पंप दिले जातात. यासाठी सरकार मोठ्या प्रमाणावर अनुदान देते.',
      benefits: [
        '९०% ते ९५% पर्यंत अनुदान',
        'दिवसा वीज उपलब्ध',
        'वीज बिलातून मुक्तता',
        'पर्यावरण पूरक सिंचन'
      ],
      eligibility: [
        'शेतकऱ्याकडे शाश्वत पाण्याचा स्त्रोत असावा (विहीर/बोअर)',
        'पारंपारिक वीज कनेक्शन नसावे',
        'जमीन स्वतःच्या नावावर असावी'
      ],
      documents: [
        '७/१२ उतारा',
        'आधार कार्ड',
        'जातीचा दाखला (लागू असल्यास)',
        'पासपोर्ट फोटो',
        'विहीर/बोअर असल्याची हमी'
      ],
      process: [
        { title: 'पोर्टल', desc: 'MAHAKUSUM किंवा अधिकृत सरकारी पोर्टलवर जा.' },
        { title: 'रजिस्ट्रेशन', desc: 'मोबाईल नंबर आणि आधार वापरून लॉगिन करा.' },
        { title: 'पैसे भरणा', desc: 'हिस्सा रक्कम (१०%) ऑनलाइन भरा.' },
        { title: 'व्हेंडर निवड', desc: 'तुमच्या पसंतीची कंपनी निवडा.' },
        { title: 'इन्स्टॉलेशन', desc: 'कंपनीचे लोक येऊन पंप बसवून देतील.' }
      ]
    }
  ],
  en: [
    {
      id: 1,
      title: 'PM Kisan Samman Nidhi',
      subtitle: '₹6000 Annual Support',
      status: 'OPEN',
      grad: 'from-green-600 to-emerald-700',
      description: 'A central sector scheme to provide income support to all landholding farmers\' families in the country to supplement their financial needs for procuring various inputs related to agriculture.',
      benefits: [
        '₹6000 per year in 3 installments',
        'Direct Bank Transfer (DBT)',
        'No middlemen involved',
        'Guaranteed income support'
      ],
      eligibility: [
        'Must have cultivable land in own name',
        'Institutional landholders not eligible',
        'Income tax payers not eligible',
        'Serving/Retired govt employees not eligible'
      ],
      documents: [
        'Aadhar Card',
        'Land Records (7/12, 8-A)',
        'Bank Passbook',
        'Mobile Number',
        'Passport Size Photo'
      ],
      process: [
        { title: 'Register', desc: 'Visit pmkisan.gov.in and select "New Farmer Registration".' },
        { title: 'Fill Details', desc: 'Enter Aadhar, State, and other personal details.' },
        { title: 'Land Data', desc: 'Enter Survey Number, Dag Number, and Area accurately.' },
        { title: 'Upload', desc: 'Scan and upload land records and Aadhar.' },
        { title: 'Submit', desc: 'Submit form and note down the registration ID.' }
      ]
    },
    {
      id: 2,
      title: 'Pradhan Mantri Fasal Bima Yojana',
      subtitle: 'Crop Insurance Scheme',
      status: 'OPEN',
      grad: 'from-blue-600 to-indigo-700',
      description: 'Provides insurance coverage and financial support to the farmers in the event of failure of any of the notified crops as a result of natural calamities, pests & diseases.',
      benefits: [
        'Low premium (2% Kharif, 1.5% Rabi)',
        'Full sum insured provided',
        'Covers localized calamities',
        'Covers post-harvest losses'
      ],
      eligibility: [
        'All farmers growing notified crops',
        'Sharecroppers and tenant farmers',
        'Both loanee and non-loanee farmers'
      ],
      documents: [
        'Land Possession Certificate (7/12)',
        'Sowing Certificate',
        'Aadhar Card',
        'Bank Passbook',
        'Cancelled Cheque'
      ],
      process: [
        { title: 'Visit Bank/CSC', desc: 'Go to nearest bank branch or CSC center.' },
        { title: 'Proposal', desc: 'Fill the insurance proposal form.' },
        { title: 'Premium', desc: 'Pay the calculated premium amount.' },
        { title: 'Claim', desc: 'In case of loss, intimate insurer within 72 hours via App.' }
      ]
    },
    {
      id: 4,
      title: 'PM-KUSUM Solar Pump',
      subtitle: '90% Subsidy on Solar Pumps',
      status: 'OPEN',
      grad: 'from-cyan-600 to-blue-600',
      description: 'Scheme to de-dieselise the farm sector by providing standalone solar pumps to farmers who do not have grid connectivity.',
      benefits: [
        'Upto 90% Subsidy',
        'Daytime irrigation possible',
        'Zero electricity bill',
        'Low maintenance'
      ],
      eligibility: [
        'Farmer must have water source',
        'No existing electricity connection',
        'Valid land ownership'
      ],
      documents: [
        '7/12 Extract',
        'Aadhar Card',
        'Caste Certificate (if applicable)',
        'Photo',
        'Water Source Declaration'
      ],
      process: [
        { title: 'Apply Online', desc: 'Visit state KUSUM portal.' },
        { title: 'Login', desc: 'Register using Aadhar and Mobile.' },
        { title: 'Payment', desc: 'Pay the beneficiary share online.' },
        { title: 'Selection', desc: 'Select vendor for installation.' },
        { title: 'Installation', desc: 'Vendor installs the pump at your farm.' }
      ]
    }
  ],
  hi: [
    {
      id: 1,
      title: 'प्रधानमंत्री किसान सम्मान निधि',
      subtitle: '₹6000 वार्षिक सहायता',
      status: 'OPEN',
      grad: 'from-green-600 to-emerald-700',
      description: 'छोटे और सीमांत किसानों को निश्चित आय सहायता प्रदान करने के लिए सरकार की एक पहल। इसके तहत किसानों को प्रति वर्ष 6000 रुपये दिए जाते हैं।',
      benefits: [
        'प्रति वर्ष ₹6000 तीन किस्तों में',
        'सीधे बैंक खाते में (DBT)',
        'बिचौलियों की कोई भूमिका नहीं',
        'पेंशन सुविधा उपलब्ध'
      ],
      eligibility: [
        'स्वयं के नाम पर कृषि भूमि होनी चाहिए',
        'संस्थागत भूमि धारक पात्र नहीं',
        'सरकारी कर्मचारी पात्र नहीं',
        'आयकरदाता पात्र नहीं'
      ],
      documents: [
        'आधार कार्ड',
        'खतौनी / भूमि रिकॉर्ड',
        'बैंक पासबुक',
        'मोबाइल नंबर',
        'फोटो'
      ],
      process: [
        { title: 'पंजीकरण', desc: 'pmkisan.gov.in पर जाएं और "New Farmer Registration" चुनें।' },
        { title: 'विवरण', desc: 'आधार और राज्य का विवरण भरें।' },
        { title: 'भूमि जानकारी', desc: 'खसरा/खतौनी नंबर और क्षेत्रफल भरें।' },
        { title: 'अपलोड', desc: 'दस्तावेज़ स्कैन करके अपलोड करें।' },
        { title: 'जमा करें', desc: 'फॉर्म जमा करें और प्रिंट निकालें।' }
      ]
    },
    {
      id: 2,
      title: 'प्रधानमंत्री फसल बीमा योजना',
      subtitle: 'फसल सुरक्षा बीमा',
      status: 'OPEN',
      grad: 'from-blue-600 to-indigo-700',
      description: 'प्राकृतिक आपदाओं, कीटों और रोगों के परिणामस्वरूप फसल खराब होने की स्थिति में किसानों को वित्तीय सहायता प्रदान करना।',
      benefits: [
        'बहुत कम प्रीमियम (खरीफ 2%, रबी 1.5%)',
        'पूरी बीमित राशि का भुगतान',
        'स्थानीय आपदाओं के लिए कवर',
        'कटाई के बाद के नुकसान के लिए कवर'
      ],
      eligibility: [
        'अधिसूचित फसल उगाने वाले सभी किसान',
        'बटाईदार और किरायेदार किसान',
        'ऋणी और गैर-ऋणी दोनों किसान'
      ],
      documents: [
        'भूमि रिकॉर्ड',
        'बुवाई प्रमाण पत्र',
        'आधार कार्ड',
        'बैंक पासबुक',
        'रद्द चेक'
      ],
      process: [
        { title: 'बैंक/CSC जाएं', desc: 'नजदीकी बैंक या CSC केंद्र पर जाएं।' },
        { title: 'फॉर्म', desc: 'बीमा प्रस्ताव फॉर्म भरें।' },
        { title: 'प्रीमियम', desc: 'प्रीमियम राशि जमा करें।' },
        { title: 'दावा', desc: 'नुकसान होने पर 72 घंटे के भीतर सूचित करें।' }
      ]
    }
  ]
};
