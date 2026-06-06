import { useState, useCallback } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface UseFetchReturn<T> {
  data: T[];
  loading: boolean;
  error: PostgrestError | null;
  refetch: () => Promise<void>;
  count: number | null;
}

export interface UseMutationReturn<T> {
  loading: boolean;
  error: PostgrestError | null;
  execute: (data: T) => Promise<any>;
}

/**
 * Hook genérico para buscar dados de uma tabela
 * @param tableName - Nome da tabela no Supabase
 * @param query - Função para customizar a query
 */
export function useFetch<T>(
  tableName: string,
  query?: (q: any) => any
): UseFetchReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [count, setCount] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let q = supabase.from(tableName).select('*', { count: 'exact' });

      if (query) {
        q = query(q);
      }

      const { data: result, error: err, count: resultCount } = await q;

      if (err) throw err;

      setData(result as T[]);
      setCount(resultCount);
      setError(null);
    } catch (err) {
      setError(err as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [tableName, query]);

  // Executar fetch ao montar component
  useState(() => {
    fetchData();
  });

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    count,
  };
}

/**
 * Hook para inserir dados
 */
export function useInsert<T>(tableName: string): UseMutationReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const execute = useCallback(
    async (data: T) => {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase
          .from(tableName)
          .insert([data])
          .select();

        if (err) throw err;
        setError(null);
        return result;
      } catch (err) {
        setError(err as PostgrestError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tableName]
  );

  return { loading, error, execute };
}

/**
 * Hook para atualizar dados
 */
export function useUpdate<T>(tableName: string): UseMutationReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const execute = useCallback(
    async (data: T & { id: number }) => {
      try {
        setLoading(true);
        const { id, ...updateData } = data;
        const { data: result, error: err } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('id', id)
          .select();

        if (err) throw err;
        setError(null);
        return result;
      } catch (err) {
        setError(err as PostgrestError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tableName]
  );

  return { loading, error, execute };
}

/**
 * Hook para deletar dados
 */
export function useDelete(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const execute = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const { error: err } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);

        if (err) throw err;
        setError(null);
      } catch (err) {
        setError(err as PostgrestError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tableName]
  );

  return { loading, error, execute };
}

