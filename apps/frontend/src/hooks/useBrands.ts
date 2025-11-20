import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandService } from '@/services/brands';

interface UseBrandsOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export const useBrands = (options: UseBrandsOptions = {}) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['brands', options],
    queryFn: () => brandService.getAll(options),
  });

  const createMutation = useMutation({
    mutationFn: brandService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      brandService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: brandService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  return {
    brands: data?.brands || [],
    pagination: data?.pagination,
    isLoading,
    error,
    createBrand: createMutation.mutate,
    updateBrand: updateMutation.mutate,
    deleteBrand: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useBrand = (id: string) => {
  return useQuery({
    queryKey: ['brands', id],
    queryFn: () => brandService.getById(id),
    enabled: !!id,
  });
};
