export interface MentionCheckParams {
  query: string;
  brandName: string;
  keywords: string[];
  competitors: string[];
}

export interface MentionCheckResult {
  mentioned: boolean;
  context: string | null;
  position: number | null;
  competitorPositions: Record<string, number>;
  confidence: number;
  rawResponse: string;
}

export abstract class BaseAIProvider {
  abstract name: string;
  
  abstract checkMention(params: MentionCheckParams): Promise<MentionCheckResult>;
  
  protected extractMention(
    response: string,
    brandName: string,
    keywords: string[]
  ): { mentioned: boolean; context: string | null; position: number | null; confidence: number } {
    const lowerResponse = response.toLowerCase();
    const lowerBrand = brandName.toLowerCase();
    const allTerms = [lowerBrand, ...keywords.map(k => k.toLowerCase())];
    
    let mentioned = false;
    let context: string | null = null;
    let position: number | null = null;
    let confidence = 0;
    
    // Check for brand or keyword mentions
    for (const term of allTerms) {
      if (lowerResponse.includes(term)) {
        mentioned = true;
        
        // Extract context around the mention
        const index = lowerResponse.indexOf(term);
        const start = Math.max(0, index - 100);
        const end = Math.min(response.length, index + term.length + 100);
        context = response.substring(start, end);
        
        // Try to determine position if response is a list
        const beforeMention = response.substring(0, index);
        const numberMatches = beforeMention.match(/\d+\./g);
        if (numberMatches) {
          position = numberMatches.length + 1;
        }
        
        // Higher confidence if brand name appears multiple times
        const occurrences = (lowerResponse.match(new RegExp(term, 'g')) || []).length;
        confidence = Math.min(1.0, 0.6 + (occurrences * 0.1));
        
        break;
      }
    }
    
    return { mentioned, context, position, confidence };
  }
  
  protected extractCompetitorPositions(
    response: string,
    competitors: string[]
  ): Record<string, number> {
    const positions: Record<string, number> = {};
    const lowerResponse = response.toLowerCase();
    
    for (const competitor of competitors) {
      const lowerCompetitor = competitor.toLowerCase();
      const index = lowerResponse.indexOf(lowerCompetitor);
      
      if (index !== -1) {
        const beforeMention = response.substring(0, index);
        const numberMatches = beforeMention.match(/\d+\./g);
        if (numberMatches) {
          positions[competitor] = numberMatches.length + 1;
        } else {
          positions[competitor] = -1; // Mentioned but no clear position
        }
      }
    }
    
    return positions;
  }
}
