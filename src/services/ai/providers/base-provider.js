/**
 * BaseProvider
 *
 * Abstract base class that every AI provider adapter must extend.
 * ValuationAIService only ever talks to this interface — never to
 * Anthropic or Mistral SDKs directly.
 *
 * To add a new provider (e.g. OpenAI, Gemini):
 *   1. Create providers/OpenAIProvider.js extending BaseProvider
 *   2. Implement chat()
 *   3. Register it in config/providers.js
 */
export class BaseProvider {
  /** @returns {string} Human-readable provider name for logs */
  get name() {
    throw new Error(`${this.constructor.name} must implement get name()`);
  }

  /**
   * Send a prompt and get a plain-text response back.
   *
   * @param {object}   params
   * @param {string}   params.system   - System / persona prompt
   * @param {string}   params.user     - User-facing prompt with all context
   * @param {number}  [params.maxTokens=1500]
   * @returns {Promise<string>}        - Raw text from the model (never throws)
   */
  async chat({ system, user, maxTokens = 1500 }) {
    throw new Error(`${this.constructor.name} must implement chat()`);
  }
}