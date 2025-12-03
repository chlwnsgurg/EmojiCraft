import { GoogleGenAI } from "@google/genai";

export const generateEmoji = async (
  concept: string,
  referenceImages: string[],
  itemDescription: string,
  itemText?: string
): Promise<string> => {
  try {
    // Initialize client lazily to ensure environment is ready
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [];

    // Add reference images to context
    referenceImages.forEach((base64) => {
      // Remove data URL prefix if present for the API call payload
      const cleanBase64 = base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: cleanBase64,
        },
      });
    });

    // Construct the prompt
    let prompt = `Create a high-quality emoji/sticker.
    
    Overall Concept: ${concept}
    
    Specific Emoji Description: ${itemDescription}
    `;

    if (itemText && itemText.trim().length > 0) {
      prompt += `\nText Requirement: The text "${itemText}" MUST be clearly visible and integrated into the emoji design.`;
    }

    prompt += `\nStyle: Vector art, flat design, vibrant colors, white sticker border, expressive, high resolution (1024x1024).`;

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
    });

    // Extract image
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
    }

    throw new Error("No image generated.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};