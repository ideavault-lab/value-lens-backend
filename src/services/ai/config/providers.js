import { AnthropicProvider } from "../providers/anthropic-provider.js";
import { MistralProvider   } from "../providers/mistral-provider.js";
import { env } from "../../../config/env.js"; // your existing env config
/**
 * Provider Registry
 *
 * Maps provider keys (used in AI_PROVIDER env var) to their adapter classes.
 *
 * To add a new provider:
 *   1. Import it here
 *   2. Add a key → class entry in PROVIDERS
 *   That's it. Nothing else needs to change.
 */
const PROVIDERS = {
  anthropic: AnthropicProvider,
  mistral:   MistralProvider,
};

/**
 * Resolve and instantiate the active provider.
 *
 * Reads AI_PROVIDER from the environment (default: "mistral").
 * Throws a clear error at startup if the key is unrecognised —
 * better than a cryptic failure at runtime.
 *
 * @returns {import('../providers/BaseProvider').BaseProvider}
 */
export function resolveProvider() {
  const key = (env.AI_PROVIDER ?? "mistral").toLowerCase().trim();

  const ProviderClass = PROVIDERS[key];

  if (!ProviderClass) {
    const available = Object.keys(PROVIDERS).join(", ");
    throw new Error(
      `[AIService] Unknown provider "${key}". ` +
      `Set AI_PROVIDER to one of: ${available}`
    );
  }

  return new ProviderClass();
}