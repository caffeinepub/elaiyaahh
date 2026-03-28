import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Lock,
  LogOut,
  Pencil,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { JournalPost, Product } from "../backend.d";
import { ProductCategory } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddJournalPost,
  useAddProduct,
  useAdminJournalPosts,
  useAdminProducts,
  useAdminSubscribers,
  useClaimAdmin,
  useDeleteJournalPost,
  useDeleteProduct,
  useIsAdminClaimed,
  useIsCallerAdmin,
  useUpdateJournalPost,
  useUpdateProduct,
} from "../hooks/useQueries";

// ─── Product Form ────────────────────────────────────────────────────────────

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "",
  description: "",
  price: 0,
  category: ProductCategory.skincare,
  imageUrl: "",
  isBestseller: false,
};

function ProductFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Omit<Product, "id"> | null;
  onSave: (data: Omit<Product, "id">) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<Omit<Product, "id">>(
    initial ?? EMPTY_PRODUCT,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset form when dialog reopens
  useEffect(() => {
    setForm(initial ?? EMPTY_PRODUCT);
  }, [initial, open]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-cream-100 border-cream-400 max-w-lg"
        data-ocid="product.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-ink">
            {initial ? "Edit Product" : "Add Product"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label className="font-sans text-xs uppercase tracking-widest text-ink-muted">
              Name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="bg-cream-50 border-cream-400 text-ink text-sm"
              data-ocid="product.input"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="font-sans text-xs uppercase tracking-widest text-ink-muted">
              Description
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="bg-cream-50 border-cream-400 text-ink text-sm resize-none"
              data-ocid="product.textarea"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label className="font-sans text-xs uppercase tracking-widest text-ink-muted">
                Price ($)
              </Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) =>
                  set("price", Number.parseFloat(e.target.value) || 0)
                }
                className="bg-cream-50 border-cream-400 text-ink text-sm"
                data-ocid="product.input"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="font-sans text-xs uppercase tracking-widest text-ink-muted">
                Category
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v as ProductCategory)}
              >
                <SelectTrigger
                  className="bg-cream-50 border-cream-400 text-ink text-sm"
                  data-ocid="product.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-cream-100 border-cream-400">
                  <SelectItem value={ProductCategory.skincare}>
                    Skincare
                  </SelectItem>
                  <SelectItem value={ProductCategory.makeup}>Makeup</SelectItem>
                  <SelectItem value={ProductCategory.collections}>
                    Collections
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label className="font-sans text-xs uppercase tracking-widest text-ink-muted">
              Image URL
            </Label>
            <Input
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="/assets/generated/..."
              className="bg-cream-50 border-cream-400 text-ink text-sm"
              data-ocid="product.input"
            />
          </div>
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="bestseller"
              checked={form.isBestseller}
              onCheckedChange={(v) => set("isBestseller", !!v)}
              className="border-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              data-ocid="product.checkbox"
            />
            <Label
              htmlFor="bestseller"
              className="font-sans text-xs uppercase tracking-widest text-ink-muted cursor-pointer"
            >
              Mark as Bestseller
            </Label>
          </div>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="font-sans text-xs tracking-widest uppercase text-ink-muted hover:text-ink px-4 py-2 transition-colors"
            data-ocid="product.cancel_button"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending || !form.name.trim()}
            onClick={() => onSave(form)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gold text-cream-50 font-sans text-xs tracking-widest uppercase hover:bg-gold-dark transition-colors disabled:opacity-50"
            data-ocid="product.save_button"
          >
            {isPending && <Loader2 size={12} className="animate-spin" />}
            {isPending ? "Saving..." : "Save"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Journal Form ─────────────────────────────────────────────────────────────

const EMPTY_POST: Omit<JournalPost, "id"> = {
  title: "",
  excerpt: "",
  imageUrl: "",
};

function JournalFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Omit<JournalPost, "id"> | null;
  onSave: (data: Omit<JournalPost, "id">) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<Omit<JournalPost, "id">>(
    initial ?? EMPTY_POST,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset form when dialog reopens
  useEffect(() => {
    setForm(initial ?? EMPTY_POST);
  }, [initial, open]);

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-cream-100 border-cream-400 max-w-lg"
        data-ocid="journal.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-ink">
            {initial ? "Edit Journal Post" : "Add Journal Post"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label className="font-sans text-xs uppercase tracking-widest text-ink-muted">
              Title
            </Label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="bg-cream-50 border-cream-400 text-ink text-sm"
              data-ocid="journal.input"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="font-sans text-xs uppercase tracking-widest text-ink-muted">
              Excerpt
            </Label>
            <Textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={3}
              className="bg-cream-50 border-cream-400 text-ink text-sm resize-none"
              data-ocid="journal.textarea"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="font-sans text-xs uppercase tracking-widest text-ink-muted">
              Image URL
            </Label>
            <Input
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="/assets/generated/..."
              className="bg-cream-50 border-cream-400 text-ink text-sm"
              data-ocid="journal.input"
            />
          </div>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="font-sans text-xs tracking-widest uppercase text-ink-muted hover:text-ink px-4 py-2 transition-colors"
            data-ocid="journal.cancel_button"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending || !form.title.trim()}
            onClick={() => onSave(form)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gold text-cream-50 font-sans text-xs tracking-widest uppercase hover:bg-gold-dark transition-colors disabled:opacity-50"
            data-ocid="journal.save_button"
          >
            {isPending && <Loader2 size={12} className="animate-spin" />}
            {isPending ? "Saving..." : "Save"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
  const { data: products = [], isLoading, refetch } = useAdminProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAdd = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted.");
      refetch();
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  const handleSave = async (data: Omit<Product, "id">) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          product: { ...data, id: editingProduct.id },
        });
        toast.success("Product updated.");
      } else {
        await addProduct.mutateAsync({ ...data, id: crypto.randomUUID() });
        toast.success("Product added.");
      }
      setDialogOpen(false);
      refetch();
    } catch {
      toast.error("Failed to save product.");
    }
  };

  const isMutating = addProduct.isPending || updateProduct.isPending;

  return (
    <div data-ocid="admin.products.panel">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-ink">Products</h2>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-5 py-2 bg-gold text-cream-50 font-sans text-xs tracking-widest uppercase hover:bg-gold-dark transition-colors"
          data-ocid="admin.products.primary_button"
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      {isLoading ? (
        <div
          className="flex justify-center py-16"
          data-ocid="admin.products.loading_state"
        >
          <Loader2 className="animate-spin text-gold" size={28} />
        </div>
      ) : products.length === 0 ? (
        <div
          className="py-16 text-center"
          data-ocid="admin.products.empty_state"
        >
          <p className="font-serif text-lg text-ink-muted">No products yet.</p>
        </div>
      ) : (
        <div className="border border-cream-400 overflow-hidden">
          <Table data-ocid="admin.products.table">
            <TableHeader>
              <TableRow className="bg-cream-200 hover:bg-cream-200 border-cream-400">
                <TableHead className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold">
                  Name
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold">
                  Category
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold">
                  Price
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold">
                  Bestseller
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p, i) => (
                <TableRow
                  key={p.id}
                  className="border-cream-400 hover:bg-cream-200 transition-colors"
                  data-ocid={`admin.products.row.${i + 1}`}
                >
                  <TableCell className="font-sans text-sm text-ink font-medium">
                    {p.name}
                  </TableCell>
                  <TableCell>
                    <span className="font-sans text-[10px] tracking-widest uppercase text-ink-muted">
                      {p.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-sans text-sm text-ink">
                    ${p.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {p.isBestseller && (
                      <Badge className="bg-gold/20 text-gold border-gold/30 font-sans text-[9px] tracking-widest uppercase font-normal">
                        Bestseller
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        className="p-1.5 text-ink-muted hover:text-gold transition-colors"
                        aria-label="Edit"
                        data-ocid={`admin.products.edit_button.${i + 1}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-ink-muted hover:text-red-500 transition-colors"
                        aria-label="Delete"
                        data-ocid={`admin.products.delete_button.${i + 1}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={
          editingProduct
            ? {
                name: editingProduct.name,
                description: editingProduct.description,
                price: editingProduct.price,
                category: editingProduct.category,
                imageUrl: editingProduct.imageUrl,
                isBestseller: editingProduct.isBestseller,
              }
            : null
        }
        onSave={handleSave}
        isPending={isMutating}
      />
    </div>
  );
}

// ─── Journal Tab ──────────────────────────────────────────────────────────────

function JournalTab() {
  const { data: posts = [], isLoading, refetch } = useAdminJournalPosts();
  const addPost = useAddJournalPost();
  const updatePost = useUpdateJournalPost();
  const deletePost = useDeleteJournalPost();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<JournalPost | null>(null);

  const handleAdd = () => {
    setEditingPost(null);
    setDialogOpen(true);
  };

  const handleEdit = (p: JournalPost) => {
    setEditingPost(p);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost.mutateAsync(id);
      toast.success("Post deleted.");
      refetch();
    } catch {
      toast.error("Failed to delete post.");
    }
  };

  const handleSave = async (data: Omit<JournalPost, "id">) => {
    try {
      if (editingPost) {
        await updatePost.mutateAsync({
          id: editingPost.id,
          post: { ...data, id: editingPost.id },
        });
        toast.success("Post updated.");
      } else {
        await addPost.mutateAsync({ ...data, id: crypto.randomUUID() });
        toast.success("Post added.");
      }
      setDialogOpen(false);
      refetch();
    } catch {
      toast.error("Failed to save post.");
    }
  };

  const isMutating = addPost.isPending || updatePost.isPending;

  return (
    <div data-ocid="admin.journal.panel">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-ink">Journal Posts</h2>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-5 py-2 bg-gold text-cream-50 font-sans text-xs tracking-widest uppercase hover:bg-gold-dark transition-colors"
          data-ocid="admin.journal.primary_button"
        >
          <Plus size={14} /> Add Post
        </button>
      </div>

      {isLoading ? (
        <div
          className="flex justify-center py-16"
          data-ocid="admin.journal.loading_state"
        >
          <Loader2 className="animate-spin text-gold" size={28} />
        </div>
      ) : posts.length === 0 ? (
        <div
          className="py-16 text-center"
          data-ocid="admin.journal.empty_state"
        >
          <p className="font-serif text-lg text-ink-muted">No posts yet.</p>
        </div>
      ) : (
        <div className="border border-cream-400 overflow-hidden">
          <Table data-ocid="admin.journal.table">
            <TableHeader>
              <TableRow className="bg-cream-200 hover:bg-cream-200 border-cream-400">
                <TableHead className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold">
                  Title
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold">
                  Excerpt
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((p, i) => (
                <TableRow
                  key={p.id}
                  className="border-cream-400 hover:bg-cream-200 transition-colors"
                  data-ocid={`admin.journal.row.${i + 1}`}
                >
                  <TableCell className="font-sans text-sm text-ink font-medium max-w-[200px] truncate">
                    {p.title}
                  </TableCell>
                  <TableCell className="font-sans text-xs text-ink-muted max-w-[300px] truncate">
                    {p.excerpt}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        className="p-1.5 text-ink-muted hover:text-gold transition-colors"
                        aria-label="Edit"
                        data-ocid={`admin.journal.edit_button.${i + 1}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-ink-muted hover:text-red-500 transition-colors"
                        aria-label="Delete"
                        data-ocid={`admin.journal.delete_button.${i + 1}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <JournalFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={
          editingPost
            ? {
                title: editingPost.title,
                excerpt: editingPost.excerpt,
                imageUrl: editingPost.imageUrl,
              }
            : null
        }
        onSave={handleSave}
        isPending={isMutating}
      />
    </div>
  );
}

// ─── Subscribers Tab ──────────────────────────────────────────────────────────

function SubscribersTab() {
  const { data: subscribers = [], isLoading } = useAdminSubscribers();

  return (
    <div data-ocid="admin.subscribers.panel">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-ink">Subscribers</h2>
        <span className="font-sans text-xs tracking-widest uppercase text-ink-muted">
          {subscribers.length} total
        </span>
      </div>

      {isLoading ? (
        <div
          className="flex justify-center py-16"
          data-ocid="admin.subscribers.loading_state"
        >
          <Loader2 className="animate-spin text-gold" size={28} />
        </div>
      ) : subscribers.length === 0 ? (
        <div
          className="py-16 text-center"
          data-ocid="admin.subscribers.empty_state"
        >
          <p className="font-serif text-lg text-ink-muted">
            No subscribers yet.
          </p>
        </div>
      ) : (
        <div className="border border-cream-400 overflow-hidden">
          <Table data-ocid="admin.subscribers.table">
            <TableHeader>
              <TableRow className="bg-cream-200 hover:bg-cream-200 border-cream-400">
                <TableHead className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold">
                  #
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-[0.2em] uppercase text-gold">
                  Email
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((email, i) => (
                <TableRow
                  key={email}
                  className="border-cream-400 hover:bg-cream-200 transition-colors"
                  data-ocid={`admin.subscribers.row.${i + 1}`}
                >
                  <TableCell className="font-sans text-xs text-ink-muted w-12">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-ink">
                    {email}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Admin Panel Root ─────────────────────────────────────────────────────────

export function AdminPanel({ onExit }: { onExit: () => void }) {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";
  const isLoggedIn = loginStatus === "success" && !!identity;

  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();
  const { data: isAdminClaimed, isLoading: checkingClaimed } =
    useIsAdminClaimed();
  const claimAdmin = useClaimAdmin();
  const queryClient = useQueryClient();

  // Loading screen
  if (isInitializing || (isLoggedIn && (checkingAdmin || checkingClaimed))) {
    return (
      <div
        className="min-h-screen bg-cream-100 flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-cream-100 flex items-center justify-center px-6"
        data-ocid="admin.modal"
      >
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-cream-200 border border-cream-400 flex items-center justify-center mx-auto mb-6">
            <Lock size={22} className="text-gold" />
          </div>
          <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-gold mb-2">
            Admin Access
          </p>
          <h1 className="font-serif text-3xl font-medium text-ink mb-3">
            Elaiyaahh
          </h1>
          <p className="font-sans text-xs text-ink-muted mb-8 leading-relaxed">
            Sign in with your admin account to manage products, journals, and
            subscribers.
          </p>
          <button
            type="button"
            disabled={isLoggingIn}
            onClick={login}
            className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 bg-gold text-cream-50 font-sans font-medium text-xs tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors disabled:opacity-60"
            data-ocid="admin.primary_button"
          >
            {isLoggingIn && <Loader2 size={13} className="animate-spin" />}
            {isLoggingIn ? "Connecting..." : "Admin Login"}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="mt-4 block mx-auto font-sans text-xs text-ink-muted hover:text-ink transition-colors"
            data-ocid="admin.cancel_button"
          >
            ← Back to site
          </button>
        </div>
      </motion.div>
    );
  }

  // Claim admin screen — no one has claimed admin yet
  if (!isAdmin && !isAdminClaimed) {
    const handleClaim = async () => {
      try {
        await claimAdmin.mutateAsync();
        await queryClient.invalidateQueries({
          queryKey: ["isCallerAdmin", identity?.getPrincipal().toString()],
        });
        toast.success("Admin access claimed successfully!");
      } catch {
        toast.error("Failed to claim admin access.");
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-cream-100 flex items-center justify-center px-6"
        data-ocid="admin.modal"
      >
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-cream-200 border border-gold/40 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={22} className="text-gold" />
          </div>
          <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-gold mb-2">
            First Time Setup
          </p>
          <h1 className="font-serif text-3xl font-medium text-ink mb-3">
            Claim Admin
          </h1>
          <p className="font-sans text-xs text-ink-muted mb-8 leading-relaxed">
            This is your first time accessing admin. Click below to claim
            ownership of this store.
          </p>
          <button
            type="button"
            disabled={claimAdmin.isPending}
            onClick={handleClaim}
            className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 bg-gold text-cream-50 font-sans font-medium text-xs tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors disabled:opacity-60"
            data-ocid="admin.primary_button"
          >
            {claimAdmin.isPending && (
              <Loader2 size={13} className="animate-spin" />
            )}
            {claimAdmin.isPending ? "Claiming..." : "Claim Admin Access"}
          </button>
          <button
            type="button"
            onClick={() => {
              clear();
              onExit();
            }}
            className="mt-4 block mx-auto font-sans text-xs text-ink-muted hover:text-ink transition-colors"
            data-ocid="admin.cancel_button"
          >
            ← Back to site
          </button>
        </div>
      </motion.div>
    );
  }

  // Access denied — admin already claimed by someone else
  if (!isAdmin && isAdminClaimed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-cream-100 flex items-center justify-center px-6"
        data-ocid="admin.error_state"
      >
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={22} className="text-red-400" />
          </div>
          <h2 className="font-serif text-2xl text-ink mb-3">Access Denied</h2>
          <p className="font-sans text-xs text-ink-muted mb-8 leading-relaxed">
            Your account does not have admin privileges.
          </p>
          <button
            type="button"
            onClick={() => {
              clear();
              onExit();
            }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-cream-50 font-sans text-xs tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors"
            data-ocid="admin.secondary_button"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </motion.div>
    );
  }

  // Dashboard
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-cream-100"
      data-ocid="admin.panel"
    >
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-cream-100 border-b border-cream-400 shadow-xs">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="font-serif text-xl font-semibold tracking-[0.12em] text-ink uppercase hover:text-gold transition-colors"
              data-ocid="admin.link"
            >
              Elaiyaahh
            </button>
            <span className="font-sans text-[9px] tracking-[0.25em] uppercase text-gold border border-gold/50 px-2 py-0.5">
              Admin
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              clear();
              onExit();
            }}
            className="inline-flex items-center gap-1.5 font-sans text-xs text-ink-muted hover:text-ink transition-colors uppercase tracking-widest"
            data-ocid="admin.secondary_button"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-gold mb-2">
            Dashboard
          </p>
          <h1 className="font-serif text-4xl font-medium text-ink">
            Admin Panel
          </h1>
        </div>

        <Tabs defaultValue="products" data-ocid="admin.tab">
          <TabsList className="bg-cream-200 border border-cream-400 rounded-none p-0 h-auto mb-8">
            {(["products", "journal", "subscribers"] as const).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-none font-sans text-xs tracking-[0.15em] uppercase px-6 py-3 text-ink-muted data-[state=active]:text-gold data-[state=active]:bg-cream-100 data-[state=active]:shadow-none border-r border-cream-400 last:border-r-0 transition-colors"
                data-ocid={`admin.${tab}.tab`}
              >
                {tab === "products"
                  ? "Products"
                  : tab === "journal"
                    ? "Journal"
                    : "Subscribers"}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="journal">
            <JournalTab />
          </TabsContent>
          <TabsContent value="subscribers">
            <SubscribersTab />
          </TabsContent>
        </Tabs>
      </main>
    </motion.div>
  );
}
