import { GoogleGenAI } from "@google/genai";

// Simple in-memory cache to avoid redundant API calls during a session
const imageCache = new Map<string, string>();

const getApiKey = () => {
  const customKey = localStorage.getItem('custom_gemini_api_key');
  if (customKey) return customKey;
  return import.meta.env.VITE_GEMINI_API_KEY || "";
};

export async function generateLineArt(prompt: string, id: string): Promise<string> {
  // 1. Check in-memory cache first
  if (imageCache.has(id)) {
    return imageCache.get(id)!;
  }

  // 2. Check local storage for persistent cache (optional, but good for "apps")
  const persistentCache = localStorage.getItem(`cache_img_${id}`);
  if (persistentCache) {
    imageCache.set(id, persistentCache);
    return persistentCache;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key tidak ditemukan. Silakan masukkan API Key di pengaturan.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const lineArtPrompt = `Simple black and white line art for a children's coloring book. Clean bold outlines, no shading, no colors, plain white background. Subject: ${prompt}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: lineArtPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const dataUrl = `data:image/png;base64,${part.inlineData.data}`;
        // Save to cache
        imageCache.set(id, dataUrl);
        try {
          // Try to save to localStorage (might fail if quota is full)
          localStorage.setItem(`cache_img_${id}`, dataUrl);
        } catch (e) {
          console.warn("Storage full, only using session cache");
        }
        return dataUrl;
      }
    }
    throw new Error("Gagal membuat gambar. Coba lagi ya!");
  } catch (error: any) {
    console.error("Error generating image:", error);
    
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error("Kuota harian habis! Kamu bisa masukkan API Key sendiri di pengaturan agar bisa lanjut mewarnai.");
    }
    
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/800`;
  }
}
