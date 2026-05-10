import { model } from '../config/ai';

export class AIService {
  /**
   * Generates a premium, SEO-optimized product description.
   */
  static async generateDescription(productName: string, category: string, features: string[]) {
    const prompt = `
      You are an expert e-commerce copywriter for ShopEase AI. 
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
      You are an AI assistant for ShopEase AI.
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
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      return { search: query };
    }
  }

  /**
   * AI Personal Stylist: Suggests "complete looks" based on a single product.
   */
  static async getStylistSuggestions(productName: string, category: string) {
    const prompt = `
      You are a high-end fashion stylist for ShopEase AI.
      A customer is looking at a "${productName}" in the "${category}" category.
      Suggest 3-4 other items that would complete this look (e.g., matching shoes, accessories, or complementary clothing).
      Explain WHY these items work together.
      
      Return the response as a list of suggestions with titles and brief justifications.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * Sentiment Reviewer: Summarizes reviews into "Buy" or "Wait" insights.
   */
  static async summarizeReviews(reviews: { rating: number; comment: string }[]) {
    if (reviews.length === 0) return "No reviews yet.";

    const reviewText = reviews.map(r => `[Rating: ${r.rating}/5] ${r.comment}`).join('\n');
    const prompt = `
      You are a sentiment analyst for ShopEase AI.
      Analyze these customer reviews and provide a concise summary.
      Decide if the consensus is "Buy" or "Wait" and explain the main pros and cons.
      
      Reviews:
      ${reviewText}
      
      Return format:
      Consensus: [Buy/Wait]
      Summary: [Brief explanation]
      Pros: [List]
      Cons: [List]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * AI Smart Support: Context-aware chatbot.
   */
  static async chatWithSupport(query: string, context: any) {
    const prompt = `
      You are the ShopEase AI Smart Support assistant.
      User Query: "${query}"
      
      Context Information (e.g., user orders, cart items):
      ${JSON.stringify(context, null, 2)}
      
      Provide a helpful, concise, and polite response. If you can't answer, ask the user to contact human support.
      If the user asks about an order, use the provided context to give status updates.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
