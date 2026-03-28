import { useMutation, useQuery } from "@tanstack/react-query";
import type { JournalPost, Product } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

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

export function useIsCallerAdmin() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useIsAdminClaimed() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdminClaimed"],
    queryFn: async () => {
      if (!actor) return false;
      // biome-ignore lint/suspicious/noExplicitAny: method may not be in generated types yet
      return (actor as any).isAdminClaimed();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimAdmin() {
  const { actor } = useActor();
  return useMutation<boolean, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      // biome-ignore lint/suspicious/noExplicitAny: method may not be in generated types yet
      return (actor as any).claimAdmin();
    },
  });
}

export function useAdminProducts() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAdminJournalPosts() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  return useQuery<JournalPost[]>({
    queryKey: ["admin", "journalPosts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJournalPosts();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAdminSubscribers() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["admin", "subscribers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNewsletterSubscribers();
    },
    enabled: !!actor && !isFetching && !!identity,
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
