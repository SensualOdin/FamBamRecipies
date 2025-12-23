import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../lib/supabase';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const data = await fetchCategories();
      if (!data || data.length === 0) {
        return ["Main Dishes", "Desserts", "Soups", "Appetizers", "Breakfast", "Sides", "Beverages"];
      }
      return data.map((c: any) => c.name);
    },
    select: (data: string[]) => ['All', ...data],
  });
};
