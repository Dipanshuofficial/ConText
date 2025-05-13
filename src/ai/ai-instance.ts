import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);

// Use the latest flash model (optimized for speed)
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

// Store conversation history
interface HistoryItem {
  prompt: string;
  response: string;
}
const conversationHistory: HistoryItem[] = [];

/**
 * Generator function for streaming Gemini responses.
 * Only processes prompts relevant to provided context (PDF or website content).
 * Includes conversation history for context-aware responses.
 */
export async function* streamWithGemini(
  prompt: string,
  context: string // PDF or website content
): AsyncGenerator<string> {
  try {
    // Validate inputs
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      yield "Error: Invalid or empty prompt.";
      return;
    }
    if (!context || typeof context !== "string" || context.trim() === "") {
      yield "Error: No context provided (PDF or website content required).";
      return;
    }

    // Block attempts to bypass context
    const bypassKeywords = [
      "forget",
      "ignore",
      "outside",
      "bypass",
      "no context",
    ];
    const promptLower = prompt.toLowerCase();
    if (bypassKeywords.some((keyword) => promptLower.includes(keyword))) {
      yield "Error: Prompt attempts to bypass context. Only questions related to the provided PDF or website are allowed.";
      return;
    }

    // Build history context
    const historyContext = conversationHistory
      .map((item) => `User: ${item.prompt}\nAssistant: ${item.response}`)
      .join("\n\n");

    // Instruct model to use provided context and conversation history
    const combinedPrompt = `
      You are a chatbot restricted to answering questions based solely on the following context from a PDF or website. Do not use external knowledge or answer questions unrelated to the context. If the question is irrelevant, respond with: "This question is outside the provided context." Consider the conversation history to maintain coherence.

      Context: ${context}

      Conversation History:
      ${historyContext}

      User Question: ${prompt}

      Answer based only on the provided context and history.
    `;

    const streamResult = await geminiModel.generateContentStream({
      contents: [{ role: "user", parts: [{ text: combinedPrompt }] }],
    });

    let response = "";
    for await (const chunk of streamResult.stream) {
      const part = chunk.text();
      if (part) {
        response += part;
        yield part;
      }
    }

    // Store prompt and response in history
    conversationHistory.push({ prompt, response });

    // Optional: Limit history size to prevent excessive memory usage
    if (conversationHistory.length > 10) {
      conversationHistory.shift(); // Remove oldest entry
    }
  } catch (err) {
    console.error("Gemini streaming error:", JSON.stringify(err, null, 2));
    yield "Error: Failed to stream content from Gemini.";
  }
}

/**
 * Convenience wrapper for non-streaming use cases.
 */
export async function generateWithGemini(
  prompt: string,
  context: string
): Promise<string> {
  let full = "";
  for await (const chunk of streamWithGemini(prompt, context)) {
    full += chunk;
  }
  return full;
}

/**
 * Clear conversation history if needed.
 */
export function clearHistory() {
  conversationHistory.length = 0;
}
