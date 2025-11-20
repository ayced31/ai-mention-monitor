export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  domain?: string;
  keywords: string[];
  competitors: string[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    queries: number;
  };
}

export interface Query {
  id: string;
  brandId: string;
  queryText: string;
  isActive: boolean;
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY';
  lastChecked?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    mentions: number;
  };
}

export interface Mention {
  id: string;
  queryId: string;
  aiProvider: 'OPENAI' | 'ANTHROPIC' | 'PERPLEXITY';
  mentioned: boolean;
  context?: string;
  position?: number;
  competitors?: Record<string, number>;
  confidence: number;
  rawResponse: string;
  checkedAt: string;
}

export interface Alert {
  id: string;
  type: 'MENTION_DETECTED' | 'MENTION_LOST' | 'COMPETITOR_MENTIONED' | 'WEEKLY_DIGEST';
  channel: 'EMAIL' | 'SLACK' | 'WEBHOOK';
  config: any;
  threshold?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  mentionRate: number;
  totalChecks: number;
  mentionCount: number;
  byProvider: {
    provider: string;
    total: number;
    mentioned: number;
    rate: number;
  }[];
  timeline: {
    date: string;
    mentioned: number;
    total: number;
    rate: number;
  }[];
  competitorComparison: {
    name: string;
    mentionCount: number;
    avgPosition: number;
    rate: number;
  }[];
  topQueries: {
    query: string;
    total: number;
    mentioned: number;
    rate: number;
  }[];
  dateRange: {
    from: string;
    to: string;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
