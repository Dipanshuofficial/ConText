"use client";

import type { FormEvent, ChangeEvent } from "react"; // Explicit type import
import { useState, useCallback } from "react";
import {
  answerQuestionWithContext,
  type AnswerQuestionWithContextInput,
  type AnswerQuestionWithContextOutput,
} from "@/ai/flows/answer-question-with-context";
import { useToast } from "@/hooks/use-toast";

// Define the structure of a chat message
export interface Message {
  id: string; // Unique identifier for each message
  role: "user" | "assistant"; // Sender role
  content: string; // Message text
}

// Define the options for the useChat hook
export interface UseChatOptions {
  initialMessages?: Message[]; // Optional initial messages
  initialInput?: string; // Optional initial input value
  initialApiConfig?: Omit<AnswerQuestionWithContextInput, "question">; // Configuration for the AI flow (e.g., URL)
  onResponse?: (response: AnswerQuestionWithContextOutput) => void; // Optional callback on successful response
  onError?: (error: Error) => void; // Optional callback on error
}

// Define the return type of the useChat hook
export interface UseChatReturn {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for managing chat state and interactions with the AI flow.
 * @param options - Configuration options for the chat hook.
 * @returns An object containing chat state and handler functions.
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    initialMessages = [],
    initialInput = "",
    initialApiConfig = { url: "" }, // Default URL handling
    onResponse,
    onError,
  } = options;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState<string>(initialInput);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast(); // Toast notification hook

  // Handler for input changes
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  ); // No dependencies, setInput is stable

  // Handler for form submission
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault(); // Prevent default form submission
      if (!input.trim() || isLoading) return; // Do nothing if input is empty or already loading

      // Create the user message object
      const newUserMessage: Message = {
        id: crypto.randomUUID(), // Generate a unique ID
        role: "user",
        content: input,
      };

      // Add user message to state and clear input
      setMessages((prev) => [...prev, newUserMessage]);
      const currentInput = input; // Store input before clearing
      setInput("");
      setIsLoading(true);
      setError(null); // Clear previous errors

      try {
        // Prepare input for the AI flow
        const chatInput: AnswerQuestionWithContextInput = {
          ...initialApiConfig,
          // Ensure URL is always set, defaulting to current window location if available
          url:
            initialApiConfig.url ||
            (typeof window !== "undefined" ? window.location.href : ""),
          question: currentInput,
        };

        // Basic URL validation
        if (
          !chatInput.url ||
          !URL.canParse(chatInput.url) ||
          !chatInput.url.startsWith("http")
        ) {
          throw new Error("Invalid or missing webpage URL for context.");
        }

        // Call the AI flow
        const result = await answerQuestionWithContext(chatInput);

        // Check if the result or answer is valid
        if (!result?.answer) {
          console.warn("Received null or empty answer from the AI.", result);
          // Create a fallback assistant message
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Sorry, I couldn't generate a response for that. There might have been an issue.",
          };
          setMessages((prev) => [...prev, assistantMessage]);
          const errorInstance = new Error(
            "AI returned an empty or invalid response."
          );
          setError(errorInstance);
          onError?.(errorInstance); // Call error callback
          toast({
            // Show error toast
            title: "Response Error",
            description: "The AI returned an empty or invalid response.",
            variant: "destructive",
          });
        } else {
          // Create the assistant message object
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: result.answer,
          };
          // Add assistant message to state
          setMessages((prev) => [...prev, assistantMessage]);
          onResponse?.(result); // Call response callback
        }
      } catch (err: unknown) {
        // Catch any error
        console.error("Chat API Error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        const errorInstance = new Error(errorMessage);
        setError(errorInstance); // Store the error object
        onError?.(errorInstance); // Call error callback
        toast({
          // Show error toast
          title: "Error",
          description: `Failed to get response: ${errorMessage}`,
          variant: "destructive",
        });
        // Add an error message to the chat interface
        const errorMessageObj: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Sorry, I encountered an error: ${errorMessage}`,
        };
        setMessages((prev) => [...prev, errorMessageObj]);
      } finally {
        setIsLoading(false); // Always set loading to false
      }
    },
    [
      input,
      isLoading,
      initialApiConfig,
      onResponse,
      onError,
      toast,
      setMessages,
      setInput,
    ]
  ); // Dependencies for useCallback

  // Return chat state and handlers
  return {
    messages,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  };
}
