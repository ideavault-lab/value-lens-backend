import { Mistral } from '@mistralai/mistralai';
import fs from 'fs';
import { env } from './env.js';

// ─── Provider config ───────────────────────────────────────────────────────────
// Swap this out to switch providers (openai, cohere, etc.)
export const LLM_PROVIDER = 'mistral';

export const MODELS = {
  mistral: {
    chat: 'mistral-medium-latest',
    embed: 'mistral-embed',
  },
  // openai: { chat: 'gpt-4o', embed: 'text-embedding-3-small' },
};
console.log("process.env.MISTRAL_API_KEY",env.AI_API_KEY);
// ─── Mistral client ────────────────────────────────────────────────────────────
const mistralClient = new Mistral({ apiKey: env.AI_API_KEY });

// ─── File upload (RAG document store) ─────────────────────────────────────────
/**
 * Upload a file for retrieval-augmented generation.
 * @param {string} filePath - Local path to the file (PDF, txt, etc.)
 * @returns {Promise<string>} - The uploaded file ID
 */
export async function uploadRagFile(filePath) {
  const upload = await mistralClient.files.upload({
    file: fs.createReadStream(filePath),
    purpose: 'retrieval',
  });
  console.log(`[RAG] File uploaded: ${upload.id} (${filePath})`);
  return upload.id;
}

// ─── Chat with optional RAG document ──────────────────────────────────────────
/**
 * Run a chat completion, optionally grounded in an uploaded document.
 * @param {string} prompt
 * @param {string|null} fileId - File ID from uploadRagFile(), or null
 * @param {object} opts - Override model, temperature, etc.
 */
export async function chat(prompt, fileId = null, opts = {}) {
  const model = opts.model ?? MODELS[LLM_PROVIDER].chat;

  const contentParts = [{ type: 'text', text: prompt }];

  // Attach document if provided
  if (fileId) {
    contentParts.push({
      type: 'document_url',
      documentUrl: fileId,
    });
  }

  const response = await mistralClient.chat.complete({
    model,
    messages: [{ role: 'user', content: contentParts }],
    temperature: opts.temperature ?? 0.3,
    ...opts,
  });

  return response.choices[0].message.content;
}

export { mistralClient };