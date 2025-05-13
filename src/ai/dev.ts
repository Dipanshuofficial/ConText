'use server';
/**
 * @fileOverview Development entry point for running Genkit flows locally.
 * This file imports the necessary flows to be accessible via the Genkit CLI tools.
 */

// Ensure the main flow is registered with Genkit for local development/testing.
import '@/ai/flows/answer-question-with-context.ts';
