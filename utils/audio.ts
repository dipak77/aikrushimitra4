import { Blob as GenAIBlob } from '@google/genai';

/**
 * High-performance Base64 Encoder for ArrayBuffer
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Encode Uint8Array to base64 string
 */
export function encode(bytes: Uint8Array): string {
  return arrayBufferToBase64(bytes.buffer);
}

/**
 * Decode base64 string to Uint8Array
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decode audio data (PCM16) and create AudioBuffer
 * Used for playing back audio received from Gemini
 */
export async function decodeAudioData(
  data: Uint8Array, 
  ctx: AudioContext, 
  sampleRate: number, 
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = Math.floor(dataInt16.length / numChannels);
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      const sample = dataInt16[i * numChannels + channel];
      // Normalize Int16 to Float32 (-1.0 to 1.0)
      channelData[i] = sample / (sample < 0 ? 0x8000 : 0x7FFF);
    }
  }
  
  return buffer;
}

/**
 * Resample audio to 16kHz (required by Gemini Live API)
 * Converts Float32Array to Int16Array PCM format
 */
export function downsampleTo16k(
  inputData: Float32Array, 
  inputSampleRate: number
): Int16Array {
  // If already 16kHz, just convert to Int16
  if (inputSampleRate === 16000) {
    const result = new Int16Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
      const s = Math.max(-1, Math.min(1, inputData[i]));
      result[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return result;
  }

  // Resample using linear interpolation
  const ratio = inputSampleRate / 16000;
  const newLength = Math.round(inputData.length / ratio);
  const result = new Int16Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const originalIndex = i * ratio;
    const index1 = Math.floor(originalIndex);
    const index2 = Math.min(index1 + 1, inputData.length - 1);
    const fraction = originalIndex - index1;
    
    // Linear interpolation
    const val = inputData[index1] * (1 - fraction) + inputData[index2] * fraction;
    const s = Math.max(-1, Math.min(1, val));
    result[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  return result;
}

/**
 * Create PCM audio chunk for sending to Gemini Live API
 * Returns GenAI Blob format
 */
export function createPCMChunk(
  data: Float32Array, 
  sampleRate: number
): GenAIBlob {
  const int16 = downsampleTo16k(data, sampleRate);
  return { 
    data: arrayBufferToBase64(int16.buffer), 
    mimeType: "audio/pcm;rate=16000"
  };
}

/**
 * Alternative: Create PCM chunk as base64 string (for WebSocket)
 * Use this if you need to send raw base64 instead of GenAI Blob
 */
export function createPCMChunkBase64(
  data: Float32Array, 
  sampleRate: number
): string {
  const int16 = downsampleTo16k(data, sampleRate);
  return arrayBufferToBase64(int16.buffer);
}

/**
 * Convert Float32Array directly to Int16Array PCM
 * Without resampling
 */
export function float32ToInt16(float32: Float32Array): Int16Array {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16;
}

/**
 * Convert Int16Array PCM to Float32Array
 */
export function int16ToFloat32(int16: Int16Array): Float32Array {
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    const sample = int16[i];
    float32[i] = sample / (sample < 0 ? 0x8000 : 0x7FFF);
  }
  return float32;
}

/**
 * Get audio volume level (0.0 to 1.0)
 * Useful for visualizations
 */
export function getAudioLevel(data: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += Math.abs(data[i]);
  }
  return Math.min(1, sum / data.length);
}

/**
 * Check if audio contains silence
 */
export function isSilence(data: Float32Array, threshold: number = 0.01): boolean {
  return getAudioLevel(data) < threshold;
}

/**
 * Apply fade in/out to audio buffer
 */
export function applyFade(
  data: Float32Array, 
  fadeInSamples: number, 
  fadeOutSamples: number
): Float32Array {
  const result = new Float32Array(data);
  
  // Fade in
  for (let i = 0; i < fadeInSamples && i < result.length; i++) {
    result[i] *= i / fadeInSamples;
  }
  
  // Fade out
  const startFadeOut = result.length - fadeOutSamples;
  for (let i = 0; i < fadeOutSamples && startFadeOut + i < result.length; i++) {
    result[startFadeOut + i] *= (fadeOutSamples - i) / fadeOutSamples;
  }
  
  return result;
}

/**
 * Normalize audio volume
 */
export function normalizeAudio(data: Float32Array, targetLevel: number = 0.8): Float32Array {
  let maxVal = 0;
  for (let i = 0; i < data.length; i++) {
    const abs = Math.abs(data[i]);
    if (abs > maxVal) maxVal = abs;
  }
  
  if (maxVal === 0) return data;
  
  const factor = targetLevel / maxVal;
  const result = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] * factor;
  }
  
  return result;
}

/**
 * Merge multiple audio channels into mono
 */
export function mergeChannels(channels: Float32Array[]): Float32Array {
  if (channels.length === 0) return new Float32Array(0);
  if (channels.length === 1) return channels[0];
  
  const length = channels[0].length;
  const result = new Float32Array(length);
  
  for (let i = 0; i < length; i++) {
    let sum = 0;
    for (let ch = 0; ch < channels.length; ch++) {
      sum += channels[ch][i] || 0;
    }
    result[i] = sum / channels.length;
  }
  
  return result;
}
