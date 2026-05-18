import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '#/lib/api';

export function useWishlist() {
  const queryClient = useQueryClient();

  // Fetch liked product IDs
  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist-ids'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/likes/ids');
        return res.data.productIds as string[];
      } catch (error) {
        return [];
      }
    },
    // Only fetch if session might exist or we can just always fetch and return [] on 401
    retry: false
  });

  // Toggle Like Mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiClient.post('/likes/toggle', { productId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-ids'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-products'] });
    }
  });

  // Dislike Mutation
  const dislikeMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiClient.post('/likes/dislike', { productId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-ids'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-products'] });
    }
  });

  const toggleLike = (productId: string) => {
    toggleLikeMutation.mutate(productId);
  };

  const dislike = (productId: string) => {
    dislikeMutation.mutate(productId);
  };

  const isLiked = (productId: string) => wishlist.includes(productId);

  return { 
    wishlist, 
    toggleLike, 
    dislike, 
    isLiked, 
    count: wishlist.length,
    isLoading 
  };
}
