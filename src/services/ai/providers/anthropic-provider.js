import Anthropic from "@anthropic-ai/sdk";
import { BaseProvider } from "./base-provider.js";
import { env } from "../../../config/env.js";

/**
 * AnthropicProvider
 *
 * Wraps the Anthropic Messages API.
 * Model is configurable via ANTHROPIC_MODEL env var.
 * Defaults to claude-sonnet-4-20250514 (best quality/speed for valuation).
 */
export class AnthropicProvider extends BaseProvider {
  constructor() {
    super();
    this._client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY, // set in .env
    });
    this._model = env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
  }

  get name() {
    return `Anthropic (${this._model})`;
  }

  /**
   * @param {object} params
   * @param {string} params.system
   * @param {string} params.user
   * @param {number} params.maxTokens
   * @returns {Promise<string>}
   */
  async chat({ system, user, maxTokens = 1500 }) {
    const message = await this._client.messages.create({
      model:      this._model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    });

    return message.content?.[0]?.text ?? "";
  }
}