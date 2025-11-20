import { env } from '../../config/index.js';
import { BaseAIProvider, type MentionCheckParams, type MentionCheckResult } from './base.provider.js';
import { logger } from '../../utils/logger.js';

export class PerplexityProvider extends BaseAIProvider {
  name = 'PERPLEXITY';
  private apiKey: string | null = null;
  private apiUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    super();
    this.apiKey = env.PERPLEXITY_API_KEY || null;
  }

  async checkMention(params: MentionCheckParams): Promise<MentionCheckResult> {
    if (!this.apiKey) {
      logger.warn('Perplexity API key not configured');
      return {
        mentioned: false,
        context: null,
        position: null,
        competitorPositions: {},
        confidence: 0,
        rawResponse: 'Perplexity API key not configured',
      };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'user',
              content: params.query,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Perplexity API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const rawResponse = data.choices?.[0]?.message?.content || '';
      
      // Extract mention information
      const { mentioned, context, position, confidence } = this.extractMention(
        rawResponse,
        params.brandName,
        params.keywords
      );

      // Extract competitor positions
      const competitorPositions = this.extractCompetitorPositions(
        rawResponse,
        params.competitors
      );

      logger.info({
        provider: this.name,
        query: params.query,
        mentioned,
        position,
      }, 'Perplexity mention check completed');

      return {
        mentioned,
        context,
        position,
        competitorPositions,
        confidence,
        rawResponse,
      };
    } catch (error: any) {
      logger.error({ 
        error: error.message, 
        provider: this.name,
        query: params.query,
      }, 'Perplexity API error');
      
      throw new Error(`Perplexity API error: ${error.message}`);
    }
  }
}
