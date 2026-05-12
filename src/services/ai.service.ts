import { openRouterClient, MODEL_NAME } from '../config/ai';

export class AIService {
  /**
   * Call OpenRouter API with any prompt
   */
  private static async callAI(prompt: string): Promise<string> {
    try {
      if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'sk_free') {
        throw new Error('OPENROUTER_API_KEY is missing or set to placeholder "sk_free". Please set a valid key.');
      }

      const response = await openRouterClient.post('/chat/completions', {
        model: MODEL_NAME,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('No response from AI model');
      }

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('OpenRouter API Error:', error.response?.data || error.message);
      throw new Error(`AI Service Error: ${error.message}`);
    }
  }

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

    return this.callAI(prompt);
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

    try {
      const text = await this.callAI(prompt);
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

    return this.callAI(prompt);
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

    return this.callAI(prompt);
  }

  /**
   * AI Smart Support: Full context-aware chatbot with shop knowledge.
   */
  static async chatWithSupport(query: string, context: any) {
    const shopInfo = {
      name: 'ShopEase',
      categories: context?.categories || ['Fashion', 'Electronics', 'Home & Living'],
      supportEmail: 'support@shopease.com',
      returnsPolicy: '30-day money-back guarantee',
    };

    const prompt = `You are ShopEase AI - a helpful, professional customer support chatbot.
    
    SHOP INFO: ${JSON.stringify(shopInfo)}
    CONTEXT: ${JSON.stringify(context)}
    QUERY: "${query}"
    
    Answer the user query based on the shop info and context. Be concise.`;

    return this.callAI(prompt);
  }

  /**
   * Multi-turn conversation with memory
   */
  static async chatWithMemory(messages: Array<{ role: 'user' | 'assistant'; content: string }>, context: any) {
    try {
      if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'sk_free') {
        throw new Error('OPENROUTER_API_KEY is missing.');
      }

      const response = await openRouterClient.post('/chat/completions', {
        model: MODEL_NAME,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: 0.8,
        max_tokens: 1500
      });

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('OpenRouter Chat Error:', error.response?.data || error.message);
      throw new Error(`Chat failed: ${error.message}`);
    }
  }
}


