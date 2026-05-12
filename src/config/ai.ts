import axios from 'axios';

// OpenRouter API Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free';

export const openRouterClient = axios.create({
  baseURL: OPENROUTER_BASE_URL,
  timeout: 30000, // 30 seconds timeout to prevent hanging
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
    'X-Title': 'ShopEase AI'
  }
});

export const MODEL_NAME = MODEL;

// Export OpenRouter as default
export default openRouterClient;

// Gemini (Backup option)
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });



