import { Mistral } from "@mistralai/mistralai";
import fs from "fs";
import { BaseProvider } from "./base-provider.js";
import { env } from "../../../config/env.js"; // your existing env config

// ─── Model registry ───────────────────────────────────────────────────────────
// Add more Mistral models here as needed
const MISTRAL_MODELS = {
  chat:  env.MISTRAL_MODEL ?? "mistral-medium-latest",
  embed: "mistral-embed",
};

/**
 * MistralProvider
 *
 * Adapter for the Mistral AI SDK (@mistralai/mistralai).
 * Plugs into ValuationAIService via the BaseProvider interface.
 *
 * Features:
 *  - Uses your existing env.AI_API_KEY (matches your mistral-ai.js config)
 *  - Supports optional RAG file attachment (uploadRagFile + fileId in chat)
 *  - Exposes the raw mistralClient for any direct SDK use outside valuation
 *
 * Switching to this provider:
 *   AI_PROVIDER=mistral  (in .env)
 */
export class MistralProvider extends BaseProvider {
  constructor() {
    super();
    this._client = new Mistral({ apiKey: env.AI_API_KEY });
    this._model  = MISTRAL_MODELS.chat;
  }

  get name() {
    return `Mistral (${this._model})`;
  }

  // ─── BaseProvider contract ─────────────────────────────────────────────────

  /**
   * Core chat method used by ValuationAIService.
   * System prompt is injected as a system-role message (Mistral supports it).
   *
   * @param {object} params
   * @param {string} params.system     - System / persona prompt
   * @param {string} params.user       - User prompt with full valuation context
   * @param {number} params.maxTokens
   * @param {string} [params.fileId]   - Optional RAG file ID from uploadRagFile()
   * @returns {Promise<string>}        - Raw text response from Mistral
   */
  async chat({ system, user, maxTokens = 1500, fileId = null }) {
    const userContent = this._buildUserContent(user, fileId);

    const response = await this._client.chat.complete({
      model:       this._model,
      max_tokens:  maxTokens,
      temperature: 0.3, // low temp for consistent structured JSON output
      messages: [
        { role: "system", content: system     },
        { role: "user",   content: userContent },
      ],
    });

    return response.choices[0].message.content ?? "";
  }

  // ─── RAG helpers ───────────────────────────────────────────────────────────

  /**
   * Upload a file for retrieval-augmented generation.
   * Store the returned ID in your DB or env and pass it to chat() as fileId.
   *
   * @param {string} filePath - Local path to the file (PDF, txt, etc.)
   * @returns {Promise<string>} - Uploaded file ID
   */
  async uploadRagFile(filePath) {
    const upload = await this._client.files.upload({
      file:    fs.createReadStream(filePath),
      purpose: "retrieval",
    });
    console.log(`[MistralProvider] RAG file uploaded: ${upload.id} (${filePath})`);
    return upload.id;
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  /**
   * Build the user content block — plain text, or multipart with a document.
   *
   * @param {string}      text
   * @param {string|null} fileId
   * @returns {string | Array}
   */
  _buildUserContent(text, fileId) {
    if (!fileId) return text;

    return [
      { type: "text",         text        },
      { type: "document_url", documentUrl: fileId },
    ];
  }
}

// ─── Singleton export (for direct SDK use outside the provider system) ────────
export const mistralProvider = new MistralProvider();

// Convenience re-exports matching your original mistral-ai.js API
// so existing callers don't break while you migrate.
export const chat          = (prompt, fileId, opts) => mistralProvider.chat({ system: "", user: prompt, fileId, ...opts });
export const uploadRagFile = (filePath)              => mistralProvider.uploadRagFile(filePath);