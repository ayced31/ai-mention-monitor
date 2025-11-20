import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/index.js";
import {
  BaseAIProvider,
  type MentionCheckParams,
  type MentionCheckResult,
} from "./base.provider.js";
import { logger } from "../../utils/logger.js";

export class GeminiProvider extends BaseAIProvider {
  name = "GEMINI";
  private client: GoogleGenerativeAI | null = null;

  constructor() {
    super();
    if (env.GOOGLE_AI_API_KEY) {
      this.client = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);
    }
  }

  async checkMention(params: MentionCheckParams): Promise<MentionCheckResult> {
    if (!this.client) {
      logger.warn("Google AI API key not configured");
      return {
        mentioned: false,
        context: null,
        position: null,
        competitorPositions: {},
        confidence: 0,
        rawResponse: "Google AI API key not configured",
      };
    }

    try {
      // Use Gemini 2.5 Pro for best performance
      const model = this.client.getGenerativeModel({ model: "gemini-2.5-pro" });

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: params.query,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });

      const response = result.response;
      const rawResponse = response.text() || "";

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

      logger.info(
        {
          provider: this.name,
          query: params.query,
          mentioned,
          position,
        },
        "Gemini mention check completed"
      );

      return {
        mentioned,
        context,
        position,
        competitorPositions,
        confidence,
        rawResponse,
      };
    } catch (error: any) {
      logger.error(
        {
          error: error.message,
          provider: this.name,
          query: params.query,
        },
        "Gemini API error"
      );

      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}
