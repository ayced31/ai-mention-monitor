import OpenAI from 'openai';
import { env } from '../../config/index.js';
import { BaseAIProvider, type MentionCheckParams, type MentionCheckResult } from './base.provider.js';
import { logger } from '../../utils/logger.js';

export class OpenAIProvider extends BaseAIProvider {
  name = 'OPENAI';
  private client: OpenAI | null = null;

  constructor() {
    super();
    if (env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });
    }
  }

  async checkMention(params: MentionCheckParams): Promise<MentionCheckResult> {
    if (!this.client) {
      logger.warn('OpenAI API key not configured');
      return {
        mentioned: false,
        context: null,
        position: null,
        competitorPositions: {},
        confidence: 0,
        rawResponse: 'OpenAI API key not configured',
      };
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: params.query,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const rawResponse = completion.choices[0]?.message?.content || '';
      
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
      }, 'OpenAI mention check completed');

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
      }, 'OpenAI API error');
      
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}
