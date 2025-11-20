import { BaseAIProvider } from './base.provider.js';
import { OpenAIProvider } from './openai.provider.js';
import { AnthropicProvider } from './anthropic.provider.js';
import { PerplexityProvider } from './perplexity.provider.js';
import { GeminiProvider } from './gemini.provider.js';

export type AIProviderType = 'OPENAI' | 'ANTHROPIC' | 'PERPLEXITY' | 'GEMINI';

export class AIProviderFactory {
  private static providers: Map<AIProviderType, BaseAIProvider> = new Map();

  static {
    // Initialize all providers
    this.providers.set('OPENAI', new OpenAIProvider());
    this.providers.set('ANTHROPIC', new AnthropicProvider());
    this.providers.set('PERPLEXITY', new PerplexityProvider());
    this.providers.set('GEMINI', new GeminiProvider());
  }

  static create(type: AIProviderType): BaseAIProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Unknown AI provider: ${type}`);
    }
    return provider;
  }

  static getAllProviders(): BaseAIProvider[] {
    return Array.from(this.providers.values());
  }

  static getAvailableProviders(): AIProviderType[] {
    return Array.from(this.providers.keys());
  }
}

// Export types and providers
export { BaseAIProvider } from './base.provider.js';
export type { MentionCheckParams, MentionCheckResult } from './base.provider.js';
