import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';

export const useAnalytics = (
  brandId: string,
  params: {
    from: string;
    to: string;
    granularity?: 'hour' | 'day' | 'week';
  }
) => {
  return useQuery({
    queryKey: ['analytics', brandId, params],
    queryFn: () => analyticsService.getBrandAnalytics(brandId, params),
    enabled: !!brandId && !!params.from && !!params.to,
  });
};

export const useAnalyticsSummary = (brandId: string) => {
  return useQuery({
    queryKey: ['analytics-summary', brandId],
    queryFn: () => analyticsService.getSummary(brandId),
    enabled: !!brandId,
  });
};
