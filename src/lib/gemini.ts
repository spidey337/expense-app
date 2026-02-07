import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

export interface ParsedReceipt {
  store: string;
  date: string;
  amount: number;
  items: { name: string; amount: number }[];
  suggestedTags: string[];
}

export async function parseReceipt(
  base64Image: string,
  mimeType: string
): Promise<ParsedReceipt> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
      {
        text: `Analyze this receipt image and extract the following information as JSON:

{
  "store": "Store/business name",
  "date": "ISO 8601 date string (YYYY-MM-DDTHH:mm:ss)",
  "amount": total amount as a number,
  "items": [{ "name": "item description", "amount": price as number }],
  "suggestedTags": ["tag1", "tag2"]
}

Rules:
- For "amount", use the total/grand total. If tax is listed separately, include it in the total.
- For "items", list each line item with its price. Omit tax/tip lines.
- For "date", if no time is visible, use 12:00:00 as default time.
- For "suggestedTags", pick from: Mortgage, Food, Groceries, Leisure, Tech, Utility, Transport, Health, Clothing, Education, Gifts, Subscriptions, Dining Out, Entertainment, Insurance. Pick 1-3 that best match.
- Return ONLY valid JSON, no markdown fences.`,
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "";
  return JSON.parse(text) as ParsedReceipt;
}
