import { openRouterClient, MODEL_NAME } from '../config/ai';
import { ProductRepository } from '../repositories/product.repository';

type StylistRequest = {
  productId?: string;
  productName?: string;
  category?: string;
  style?: string;
  priceRange?: string;
};

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
  static async getStylistSuggestions(request: StylistRequest) {
    const { productId, productName, category, style, priceRange } = request;
    const contextLines: string[] = [
      'You are an expert curator for ShopEase AI. Use the exact user input to create highly relevant suggestions.',
    ];

    const electronicsKeywords = [
      'phone',
      'laptop',
      'tablet',
      'camera',
      'apple',
      'samsung',
      'pixel',
      'macbook',
      'ipad',
      'smartwatch',
      'airpods',
      'electronics',
      'headphones',
      'speaker',
      'charger',
      'adapter',
    ];

    const allInput = [productName, category, style].filter(Boolean).join(' ').toLowerCase();
    const isElectronics = electronicsKeywords.some((keyword) => allInput.includes(keyword));

    if (productId) {
      const product = await ProductRepository.findById(productId);
      if (product) {
        contextLines.push(`Current product: ${product.name}`);
        if (product.category?.name) {
          contextLines.push(`Category: ${product.category.name}`);
        }
        if (product.description) {
          contextLines.push(`Description: ${product.description}`);
        }
        if (product.variants?.length) {
          const prices = product.variants.map((variant: any) => variant.price).filter(Boolean);
          if (prices.length) {
            contextLines.push(`Price range: ${Math.min(...prices)} - ${Math.max(...prices)}`);
          }
        }
      }
    }

    if (!productId && productName) {
      contextLines.push(`Product or keyword: ${productName}`);
    }
    if (category) {
      contextLines.push(`Category: ${category}`);
    }
    if (style) {
      contextLines.push(`Preferred style or occasion: ${style}`);
    }
    if (priceRange) {
      contextLines.push(`Desired budget: ${priceRange}`);
    }

    if (contextLines.length === 1) {
      throw new Error('No stylist inputs provided. Please send productName, productId, category, style, or priceRange.');
    }

    const recommendationGoal = isElectronics
      ? 'Recommend 3 to 4 complementary accessories or product bundles that best match the item and category provided.'
      : 'Recommend 3 to 4 complementary fashion items or outfit elements that best match the item and category provided.';

    const prompt = `
      ${contextLines.join('\n')}

      ${recommendationGoal}
      Use the exact input and category to keep the suggestions relevant. Do not invent unrelated fashion items for electronics requests.

      Return ONLY valid JSON in this format:
      [
        {
          "name": "Item name or suggestion",
          "description": "Brief explanation of the item",
          "price": "Approximate price or pricing guidance",
          "image": "Optional image URL",
          "why": "Why this item completes the look"
        }
      ]
    `;

    const raw = await this.callAI(prompt);
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [{ name: 'Expert Curated', description: cleaned, price: '', image: '', why: '' }];
    } catch (e) {
      return [{ name: 'Expert Curated', description: cleaned, price: '', image: '', why: '' }];
    }
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


