import { GoogleGenAI, Type } from "@google/genai";
import { Product, ForecastData, RestockSuggestion } from "../types";

const API_KEY = process.env.API_KEY || ''; 

// Helper to initialize AI. 
// Note: In a real app, never expose keys on client. This is for demo/prototype purposes.
const getAI = () => {
  if (!API_KEY) {
    console.warn("Gemini API Key is missing. AI features will act on dummy data.");
    return null;
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const generateSalesForecast = async (products: Product[]): Promise<ForecastData[]> => {
  const ai = getAI();
  if (!ai) return mockForecast(products);

  const productContext = products.map(p => ({
    name: p.name,
    sku: p.sku,
    currentStock: p.currentStock,
    category: p.category
  }));

  const prompt = `
    You are an AI Inventory Forecasting Engine. 
    Analyze the following inventory list. 
    Assume standard retail seasonal trends (currently typical business days).
    Predict the sales demand for the next 7 days for each item based on its category and typical utility.
    
    Inventory: ${JSON.stringify(productContext)}
    
    Return a JSON array where each object has:
    - sku (string)
    - productName (string)
    - currentStock (number)
    - predictedDemand (number, estimated sales for next 7 days)
    - confidence (number, 0-100)
    - riskLevel (string: 'LOW', 'MEDIUM', 'HIGH' based on if demand > stock)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sku: { type: Type.STRING },
              productName: { type: Type.STRING },
              currentStock: { type: Type.NUMBER },
              predictedDemand: { type: Type.NUMBER },
              confidence: { type: Type.NUMBER },
              riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] }
            }
          }
        }
      }
    });

    return JSON.parse(response.text) as ForecastData[];
  } catch (error) {
    console.error("AI Forecast Error", error);
    return mockForecast(products);
  }
};

export const analyzeRestockNeeds = async (products: Product[]): Promise<RestockSuggestion[]> => {
  const ai = getAI();
  if (!ai) return mockRestock(products);

  const lowStockItems = products.filter(p => p.currentStock <= p.reorderLevel * 1.5); // Check near reorder level

  if (lowStockItems.length === 0) return [];

  const prompt = `
    You are a Procurement AI. Analyze these products that are low on stock or near reorder level.
    Suggest purchase orders.
    
    Products: ${JSON.stringify(lowStockItems)}
    
    Return a JSON array of suggestions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sku: { type: Type.STRING },
              productName: { type: Type.STRING },
              currentStock: { type: Type.NUMBER },
              suggestedQuantity: { type: Type.NUMBER },
              vendor: { type: Type.STRING },
              reason: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text) as RestockSuggestion[];
  } catch (error) {
    console.error("AI Restock Error", error);
    return mockRestock(products);
  }
};

export const askInventoryAssistant = async (question: string, products: Product[], orders: any[]): Promise<string> => {
  const ai = getAI();
  if (!ai) return "I cannot access the AI service right now. Please check your API key.";

  // Summarize context to save tokens
  const lowStock = products.filter(p => p.currentStock <= p.reorderLevel).map(p => p.name).join(", ");
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const totalValue = products.reduce((acc, p) => acc + (p.currentStock * p.unitPrice), 0);

  const contextData = `
    Inventory Summary:
    - Total Products: ${products.length}
    - Total Inventory Value: $${totalValue}
    - Low Stock Items: ${lowStock || "None"}
    - Pending Purchase Orders: ${pendingOrders}
    - Detailed Product List (Sample): ${JSON.stringify(products.slice(0, 10))}... (list truncated)
  `;

  const prompt = `
    You are SmartShelfX AI Assistant. You help warehouse managers with inventory questions.
    
    Context:
    ${contextData}

    User Question: "${question}"

    Answer concisely and helpfully. If asked to write an email, draft a professional one.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "I'm having trouble analyzing the inventory right now. Please try again later.";
  }
};

// Fallbacks if no API key
const mockForecast = (products: Product[]): ForecastData[] => {
  return products.map(p => {
    const demand = Math.floor(Math.random() * 20) + 1;
    return {
      sku: p.sku,
      productName: p.name,
      currentStock: p.currentStock,
      predictedDemand: demand,
      confidence: 85,
      riskLevel: demand > p.currentStock ? 'HIGH' : 'LOW'
    };
  });
};

const mockRestock = (products: Product[]): RestockSuggestion[] => {
  return products
    .filter(p => p.currentStock <= p.reorderLevel)
    .map(p => ({
      sku: p.sku,
      productName: p.name,
      currentStock: p.currentStock,
      suggestedQuantity: p.reorderLevel * 3,
      vendor: p.vendor,
      reason: "Stock fell below reorder level threshold."
    }));
};