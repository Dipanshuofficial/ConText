"use server";

import { z } from "zod";
import { crawlWebpage } from "@/services/web-crawler";
import { generateWithGemini } from "@/ai/ai-instance";

// --- Schemas ---
const InputSchema = z.object({
  url: z.string().url(),
  question: z.string().min(1),
});
export type AnswerQuestionWithContextInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  answer: z.string(),
});
export type AnswerQuestionWithContextOutput = z.infer<typeof OutputSchema>;

// --- Summarize Web Content ---
async function summarizeWebPage(url: string): Promise<string> {
  try {
    const raw = await crawlWebpage(url);
    return raw.length > 4000 ? raw.slice(0, 4000) + "..." : raw;
  } catch (err) {
    return `Error: Could not retrieve content from ${url}. ${
      err instanceof Error ? err.message : ""
    }`;
  }
}

// --- Build Prompt ---
function buildPrompt(url: string, question: string, summary?: string): string {
  if (summary?.startsWith("Error:")) {
    return `The webpage at ${url} could not be retrieved: ${summary}
    
Please answer the following question using general knowledge:

Q: ${question}`;
  }

  return `You are an assistant helping users with questions about this webpage: ${url}

Webpage Content:
${summary}

Now answer the user's question clearly and concisely.

Q: ${question}`;
}

// --- Entry Function ---
export async function answerQuestionWithContext(
  input: AnswerQuestionWithContextInput
): Promise<AnswerQuestionWithContextOutput> {
  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    return { answer: `Error: Invalid input. ${issues}` };
  }

  try {
    const { url, question } = parsed.data;
    const summary = await summarizeWebPage(url);
    const prompt = buildPrompt(url, question, summary);
    const answer = await generateWithGemini(prompt, "the page content");
    return OutputSchema.parse({ answer });
  } catch (err) {
    return {
      answer:
        err instanceof Error
          ? `Error: ${err.message}`
          : "Unknown error occurred.",
    };
  }
}
