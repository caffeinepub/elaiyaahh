import { useMutation, useQuery } from "@tanstack/react-query";
import type { JournalPost, Product } from "../backend.d";
import { useActor } from "./useActor";

export function useBestsellers() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["bestsellers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBestsellers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useJournalPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<JournalPost[]>({
    queryKey: ["journalPosts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJournalPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubscribeNewsletter() {
  const { actor } = useActor();
  return useMutation<boolean, Error, string>({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.subscribeNewsletter(email);
    },
  });
}

// ─── Admin hooks ────────────────────────────────────────────────────────────

export function useAdminProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminJournalPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<JournalPost[]>({
    queryKey: ["admin", "journalPosts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJournalPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminSubscribers() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["admin", "subscribers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNewsletterSubscribers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  return useMutation<Product, Error, Product>({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Not connected");
      return actor.addProduct(product);
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  return useMutation<boolean, Error, { id: string; product: Product }>({
    mutationFn: async ({ id, product }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(id, product);
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(id);
    },
  });
}

export function useAddJournalPost() {
  const { actor } = useActor();
  return useMutation<JournalPost, Error, JournalPost>({
    mutationFn: async (post: JournalPost) => {
      if (!actor) throw new Error("Not connected");
      return actor.addJournalPost(post);
    },
  });
}

export function useUpdateJournalPost() {
  const { actor } = useActor();
  return useMutation<boolean, Error, { id: string; post: JournalPost }>({
    mutationFn: async ({ id, post }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateJournalPost(id, post);
    },
  });
}

export function useDeleteJournalPost() {
  const { actor } = useActor();
  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteJournalPost(id);
    },
  });
}
