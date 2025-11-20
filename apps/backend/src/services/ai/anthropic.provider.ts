import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/index.js';
import { BaseAIProvider, type MentionCheckParams, type MentionCheckResult } from './base.provider.js';
import { logger } from '../../utils/logger.js';

export class AnthropicProvider extends BaseAIProvider {
  name = 'ANTHROPIC';
  private client: Anthropic | null = null;

  constructor() {
    super();
    if (env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({
        apiKey: env.ANTHROPIC_API_KEY,
      });
    }
  }

  async checkMention(params: MentionCheckParams): Promise<MentionCheckResult> {
    if (!this.client) {
      logger.warn('Anthropic API key not configured');
      return {
        mentioned: false,
        context: null,
        position: null,
        competitorPositions: {},
        confidence: 0,
        rawResponse: 'Anthropic API key not configured',
      };
    }

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: params.query,
          },
        ],
      });

      const rawResponse = message.content[0]?.type === 'text' 
        ? message.content[0].text 
        : '';
      
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
      }, 'Anthropic mention check completed');

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
      }, 'Anthropic API error');
      
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }
}
