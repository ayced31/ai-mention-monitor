import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryService } from '@/services/queries';

export const useQueries = (brandId: string) => {
  const queryClient = useQueryClient();

  const { data: queries, isLoading } = useQuery({
    queryKey: ['queries', brandId],
    queryFn: () => queryService.getAll(brandId),
    enabled: !!brandId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => queryService.create(brandId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries', brandId] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      queryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries', brandId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: queryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries', brandId] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  const triggerCheckMutation = useMutation({
    mutationFn: queryService.triggerCheck,
  });

  return {
    queries: queries || [],
    isLoading,
    createQuery: createMutation.mutate,
    updateQuery: updateMutation.mutate,
    deleteQuery: deleteMutation.mutate,
    triggerCheck: triggerCheckMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isChecking: triggerCheckMutation.isPending,
  };
};
