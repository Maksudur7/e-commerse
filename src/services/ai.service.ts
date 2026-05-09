import { model } from '../config/ai';

export class AIService {
  /**
   * Generates a premium, SEO-optimized product description.
   */
  static async generateDescription(productName: string, category: string, features: string[]) {
    const prompt = `
      You are an expert e-commerce copywriter. 
      Write a premium, high-converting, and SEO-optimized product description for:
      Product Name: ${productName}
      Category: ${category}
      Key Features: ${features.join(', ')}
      
      The description should be professional, engaging, and highlight the benefits. 
      Return the result in a clean, structured format.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * Parses natural language search into structured filters.
   */
  static async parseSearchIntent(query: string) {
    const prompt = `
      You are an AI assistant for an e-commerce marketplace called ShopEase AI.
      Analyze the following search query and extract structured search parameters.
      Query: "${query}"
      
      Return ONLY a JSON object with these keys:
      - search (string: core product keywords)
      - category (string: the most likely category slug)
      - minPrice (number)
      - maxPrice (number)
      - color (string)
      - style (string)
      
      Example: "Red party dress under 2000" -> {"search": "party dress", "category": "clothing", "maxPrice": 2000, "color": "red"}
      If information is missing, use null.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Clean up the response (remove markdown code blocks if any)
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      return { search: query }; // Fallback to raw search
    }
  }
}
