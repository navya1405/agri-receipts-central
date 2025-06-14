
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useReceipts = () => {
  return useQuery({
    queryKey: ['receipts'],
    queryFn: async () => {
      const { data: rawReceipts, error: rawError } = await supabase
        .from('receipts')
        .select(`
          *,
          committee:committee_id(name, district)
        `)
        .order('created_at', { ascending: false });
      if (rawError) throw new Error(rawError.message);
      return rawReceipts;
    }
  });
};

export const useCommittees = () => {
  return useQuery({
    queryKey: ['committees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('committees')
        .select('id, name');
      if (error) throw new Error(error.message);
      return data;
    }
  });
};
