import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertService } from '@/services/alerts';

export const useAlerts = () => {
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: alertService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      alertService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: alertService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return {
    alerts: alerts || [],
    isLoading,
    createAlert: createMutation.mutate,
    updateAlert: updateMutation.mutate,
    deleteAlert: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
