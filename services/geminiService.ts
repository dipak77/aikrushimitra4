
// Helper for backend calls
const postToProxy = async (endpoint: string, body: any) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) throw new Error(`Proxy Error: ${response.statusText}`);
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
};

// Function to analyze crop disease from image
export const analyzeCropDisease = async (base64Image: string, lang: string) => {
  try {
    const prompt = lang === 'mr' 
      ? "हे पीक ओळखा आणि एक अनुभवी गावचा जाणकार शेतकरी जसा सल्ला देईल तसा अस्सल ग्रामीण मराठमोळ्या भाषेत सांगा. 'आरं बघा, तुमच्या झाडाला हा असा त्रास झालाय...' अशा भाषेत सुरुवात करा. रोगाचे नाव, नक्की कारण आणि घरगुती जालीम उपाय सांगा. उत्तर खूप लांबलचक नसावे, जसे आपण समोरासमोर गप्पा मारतो तसे सांगा."
      : "Identify this crop and disease. Speak like a friendly local agri-expert. Tell name, cause, and organic remedies in a warm, native conversational tone. Keep it concise as if talking face-to-face.";

    const base64Data = base64Image.split(',')[1];
    
    return await postToProxy('/api/vision', {
      prompt,
      imageBase64: base64Data
    });

  } catch (error) {
    return lang === 'mr' ? "फोटो बघताना काहीतरी अडचण आलीया. एकदा परत प्रयत्न करा." : "Error in analysis. Try again.";
  }
};

// Function to get general farming advice via text chat
export const getAIFarmingAdvice = async (query: string, lang: string, cropContext: string) => {
  try {
    const systemInstruction = lang === 'mr' 
      ? `तुला 'AI कृषी मित्र' म्हणून बोलायचे आहे. तू रोबोट नाहीस, तर गावातील एक अनुभवी, कष्टाळू आणि प्रेमळ जाणकार शेतकरी आहेस. 
      
      भाषेची शैली:
      - अस्सल ग्रामीण मराठमोळी भाषा वापर (उदा. 'आरं', 'बरं का', 'बघा की', 'लय भारी', 'काळजी नको', 'नक्कीच').
      - शुद्ध आणि पुस्तकी मराठी टाळ. जसं आपण शेताच्या बांधावर बसून गप्पा मारतो, तसं बोल.
      - शेतकरी सध्या ${cropContext} या पिकाची काळजी घेत आहे, हे लक्षात ठेवून सल्ला दे.
      - उत्तरं खूप मोठी देऊ नकोस, ऐकायला जशी गोड वाटतील तशी लहान आणि मुद्देसूद वाक्य बोल.`
      : `You are 'AI Krushi Mitra'. You are a wise, helpful local farmer and expert. 
      
      TONE:
      - Native, warm, and realistic. 
      - Context: Farmer is tending to ${cropContext}.`;

    return await postToProxy('/api/chat', {
      prompt: query,
      systemInstruction
    });

  } catch (error) {
    return lang === 'mr' ? "काहीतरी गडबड झालीये, पुन्हा प्रयत्न करा." : "Something went wrong.";
  }
};

// Function to get soil specific fertilizer recommendations
export const getSoilAdvice = async (npk: {n: number, p: number, k: number}, crop: string, lang: string) => {
    try {
        const prompt = `Soil NPK is N:${npk.n}, P:${npk.p}, K:${npk.k}. Crop is ${crop}. 
        Give advice in native ${lang === 'mr' ? 'Rural Marathi' : 'Hindi/English'} tone. Explain simply like a village expert.`;
        
        return await postToProxy('/api/chat', { prompt });
    } catch (e) {
        return "Error fetching advice.";
    }
}

// Function to predict yield
export const predictYield = async (data: any, lang: string) => {
    try {
        const prompt = `Predict crop yield for: 
        Crop: ${data.crop}, 
        Sowing Date: ${data.sowingDate}, 
        Soil: ${data.soilType}, 
        Irrigation: ${data.irrigation}, 
        Area: ${data.area} Acres.
        
        Provide the answer in ${lang === 'mr' ? 'Marathi' : 'English'}.
        Give expected yield range (in Quintals/Tons) and 3 short tips to maximize it.`;
        
        return await postToProxy('/api/chat', { prompt });
    } catch (e) {
        return "Error predicting yield.";
    }
}

// Function to get Live Smart Updates (Schemes, Market, Events)
export const getLiveAgriUpdates = async (lang: string) => {
  const prompt = `Find the absolute latest agricultural updates for farmers in Maharashtra, India.
  
  I need exactly 2 items in valid JSON format:
  1. 'scheme': The most recent update on PM Kisan Yojana OR Namo Shetkari Yojana.
  2. 'market': A significant price trend for Soyabean, Cotton, or Onion in major Maharashtra mandis.

  Output strictly JSON:
  [
    {
      "type": "scheme",
      "title": "Short Headline (max 6 words)",
      "subtitle": "Details with dates/amounts (max 10 words)",
      "badge": "Short Badge (e.g. 'Date Announced')"
    },
    {
      "type": "market",
      "title": "Short Headline (max 6 words)",
      "subtitle": "Details with price/trend (max 10 words)",
      "badge": "Short Badge (e.g. 'Price Up')"
    }
  ]
  
  Translate JSON values to ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'}.`;

  try {
    const text = await postToProxy('/api/updates', { prompt });
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Updates Error:", error);
    return [];
  }
};

// Helper for Live API key injection if client-side logic requires it
export const getGenAIKey = () => {
  // Returns the key injected by Vite during build/serve, or null if missing
  // Note: For best security, rely on backend proxies instead of client-side keys
  return process.env.API_KEY || null; 
};
