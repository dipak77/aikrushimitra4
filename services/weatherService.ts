
import { Language } from '../types';

export interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
    apparent_temperature: number;
    visibility: number;
    uv_index?: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
}

export const fetchWeather = async (lat: number, lng: number): Promise<WeatherData> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m,apparent_temperature,visibility,uv_index&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather fetch failed');
    return await res.json();
  } catch (e) {
    console.error("Weather fetch error, using mock", e);
    return MOCK_WEATHER;
  }
};

export const getPlaceName = async (lat: number, lng: number, lang: Language = 'en'): Promise<string> => {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=${lang}`);
    const data = await res.json();
    return data.locality || data.city || data.town || data.village || 'Satara';
  } catch (e) {
    console.error("Geocoding error", e);
    return 'Satara';
  }
};

export const DEFAULT_COORDS = { lat: 19.75, lng: 75.71 }; // Satara/Maharashtra region

export const MOCK_WEATHER: WeatherData = {
  current: {
    temperature_2m: 28,
    relative_humidity_2m: 45,
    is_day: 1,
    weather_code: 1,
    wind_speed_10m: 12,
    apparent_temperature: 30,
    visibility: 10000,
    uv_index: 6
  },
  hourly: {
    time: Array.from({ length: 24 }, (_, i) => new Date(new Date().setHours(i, 0, 0, 0)).toISOString()),
    temperature_2m: [22, 21, 20, 19, 19, 20, 22, 25, 28, 30, 32, 33, 34, 34, 33, 32, 30, 28, 26, 25, 24, 23, 23, 22],
    weather_code: Array(24).fill(1),
    is_day: Array(24).fill(1)
  },
  daily: {
    time: Array.from({ length: 7 }, (_, i) => new Date(new Date().setDate(new Date().getDate() + i)).toISOString()),
    weather_code: Array(7).fill(1),
    temperature_2m_max: [34, 35, 33, 32, 34, 35, 34],
    temperature_2m_min: [22, 23, 21, 20, 22, 23, 22],
    sunrise: Array(7).fill(new Date(new Date().setHours(6, 30, 0, 0)).toISOString()),
    sunset: Array(7).fill(new Date(new Date().setHours(18, 45, 0, 0)).toISOString())
  }
};
