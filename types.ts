


export type Language = 'mr' | 'hi' | 'en';

export type ViewState = 
  | 'SPLASH' 
  | 'LANGUAGE' 
  | 'LOGIN' 
  | 'PROFILE' 
  | 'DASHBOARD' 
  | 'DISEASE_DETECTOR' 
  | 'WEATHER' 
  | 'SOIL' 
  | 'IRRIGATION'
  | 'YIELD' 
  | 'AREA_CALCULATOR'
  | 'VOICE_ASSISTANT'
  | 'MARKET'
  | 'SCHEMES'
  | 'CALENDAR'
  | 'NEWS'
  | 'AGRI_KNOWLEDGE'
  | 'KNOWLEDGE_DETAIL'
  | 'BLOG'
  | 'BLOG_DETAIL'
  | 'SABJI_MANDI'
  | 'ADMIN';

export interface UserProfile {
  name: string;
  email?: string;
  picture?: string;
  village: string;
  district: string;
  landSize: string;
  crop: string;
  joinedAt?: number;
  lastLogin?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface BlogSection {
  heading: string;
  subheading?: string;
  content: string;
  image?: string;
  benefits?: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  image: string;
  intro: string;
  sections: BlogSection[];
  conclusion: string;
  faqs?: FAQ[];
  relatedPosts?: string[];
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  view: string;
  location: string;
  userAgent: string;
  userName?: string;
  userEmail?: string;
}

declare global {
  interface Window {
    ENV: {
      API_KEY: string;
    }
  }

  interface ImportMetaEnv {
    readonly VITE_GOOGLE_CLIENT_ID: string;
    readonly [key: string]: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
