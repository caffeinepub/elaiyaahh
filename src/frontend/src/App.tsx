import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ArrowLeft,
  Facebook,
  Heart,
  Instagram,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { SiPinterest } from "react-icons/si";
import { toast } from "sonner";
import type { JournalPost, Product } from "./backend.d";
import { AdminPanel } from "./components/AdminPanel";
import {
  useBestsellers,
  useJournalPosts,
  useProducts,
  useSubscribeNewsletter,
} from "./hooks/useQueries";

const queryClient = new QueryClient();

type View = "home" | "shop" | "admin";

// Image mapping by product name keyword
const PRODUCT_IMAGES: Record<string, string> = {
  serum: "/assets/generated/product-serum.dim_600x600.jpg",
  moisturizer: "/assets/generated/product-moisturizer.dim_600x600.jpg",
  lipstick: "/assets/generated/product-lipstick.dim_600x600.jpg",
  foundation: "/assets/generated/product-foundation.dim_600x600.jpg",
  eyeshadow: "/assets/generated/product-eyeshadow.dim_600x600.jpg",
  toner: "/assets/generated/product-toner.dim_600x600.jpg",
};

const JOURNAL_IMAGES = [
  "/assets/generated/journal-1.dim_600x400.jpg",
  "/assets/generated/journal-2.dim_600x400.jpg",
  "/assets/generated/journal-3.dim_600x400.jpg",
];

function getProductImage(product: Product): string {
  const name = product.name.toLowerCase();
  for (const [key, url] of Object.entries(PRODUCT_IMAGES)) {
    if (name.includes(key)) return url;
  }
  if (product.category === "skincare") return PRODUCT_IMAGES.serum;
  if (product.category === "makeup") return PRODUCT_IMAGES.lipstick;
  return PRODUCT_IMAGES.moisturizer;
}

function NavLink({
  href,
  children,
}: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      data-ocid="nav.link"
      className="text-xs font-sans font-medium tracking-[0.15em] uppercase text-ink-muted hover:text-gold transition-colors duration-200"
      onClick={(e) => {
        e.preventDefault();
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      {children}
    </a>
  );
}

function GoldButton({
  children,
  onClick,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center px-8 py-3 bg-gold text-cream-50 font-sans font-medium text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:bg-gold-dark hover:shadow-warm ${className}`}
    >
      {children}
    </button>
  );
}

function ProductCard({
  product,
  onAddToBag,
  index,
  ocidPrefix = "bestsellers",
}: {
  product: Product;
  onAddToBag: () => void;
  index: number;
  ocidPrefix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.07, 0.4) }}
      className="group flex flex-col bg-cream-100"
      data-ocid={`${ocidPrefix}.item.${index + 1}`}
    >
      <div className="overflow-hidden aspect-square">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-gold mb-1">
          {product.category}
        </p>
        <h3 className="font-serif text-base font-medium text-ink mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-ink-light font-sans leading-relaxed mb-3 flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-sans text-sm font-medium text-ink-muted">
            ${product.price.toFixed(2)}
          </span>
          <button
            type="button"
            data-ocid={`${ocidPrefix}.button.${index + 1}`}
            onClick={onAddToBag}
            className="text-xs font-sans font-medium tracking-[0.15em] uppercase text-gold border border-gold px-4 py-2 hover:bg-gold hover:text-cream-50 transition-all duration-200"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function JournalCard({
  post,
  imageUrl,
  index,
}: { post: JournalPost; imageUrl: string; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer"
      data-ocid={`journal.item.${index + 1}`}
    >
      <div className="overflow-hidden aspect-[3/2] mb-3">
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <h4 className="font-serif text-sm font-medium text-ink mb-1 leading-snug">
        {post.title}
      </h4>
      <p className="text-xs text-ink-light font-sans leading-relaxed mb-2 line-clamp-2">
        {post.excerpt}
      </p>
      <span className="text-xs font-sans font-medium tracking-[0.15em] uppercase text-gold border-b border-gold pb-0.5 hover:border-gold-dark transition-colors">
        Read more
      </span>
    </motion.article>
  );
}

function Header({
  cartCount,
  onShopNav,
  currentView,
}: {
  cartCount: number;
  onShopNav: (view: View) => void;
  currentView: View;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 bg-cream-100 border-b border-cream-400 shadow-xs"
      data-ocid="header.section"
    >
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <button
          type="button"
          onClick={() => onShopNav("home")}
          className="font-serif text-2xl font-semibold tracking-[0.12em] text-ink uppercase"
          data-ocid="header.link"
        >
          Elaiyaahh
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {currentView === "shop" ? (
            <button
              type="button"
              onClick={() => onShopNav("home")}
              className="flex items-center gap-1.5 text-xs font-sans font-medium tracking-[0.15em] uppercase text-ink-muted hover:text-gold transition-colors duration-200"
              data-ocid="nav.link"
            >
              <ArrowLeft size={13} />
              Home
            </button>
          ) : (
            <>
              <NavLink href="#home">Home</NavLink>
              <NavLink href="#skincare">Skincare</NavLink>
              <NavLink href="#makeup">Makeup</NavLink>
              <NavLink href="#collections">Collections</NavLink>
              <NavLink href="#story">Our Story</NavLink>
              <NavLink href="#journals">Journals</NavLink>
            </>
          )}
          <button
            type="button"
            onClick={() => onShopNav("shop")}
            className={`text-xs font-sans font-medium tracking-[0.15em] uppercase transition-colors duration-200 ${
              currentView === "shop"
                ? "text-gold border-b border-gold pb-0.5"
                : "text-ink-muted hover:text-gold"
            }`}
            data-ocid="nav.link"
          >
            Shop
          </button>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-ink hover:text-gold transition-colors"
            aria-label="Search"
            data-ocid="header.button"
          >
            <Search size={18} />
          </button>
          <button
            type="button"
            className="text-ink hover:text-gold transition-colors hidden sm:block"
            aria-label="Account"
            data-ocid="header.button"
          >
            <User size={18} />
          </button>
          <button
            type="button"
            className="text-ink hover:text-gold transition-colors hidden sm:block"
            aria-label="Wishlist"
            data-ocid="header.button"
          >
            <Heart size={18} />
          </button>
          <button
            type="button"
            className="relative text-ink hover:text-gold transition-colors"
            aria-label="Cart"
            data-ocid="cart.button"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-accent text-ink text-[9px] font-sans font-semibold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className="lg:hidden text-ink"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            data-ocid="header.toggle"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="lg:hidden bg-cream-100 border-t border-cream-400 px-6 py-4 flex flex-col gap-4">
          {currentView === "shop" ? (
            <button
              type="button"
              onClick={() => {
                onShopNav("home");
                setMobileOpen(false);
              }}
              className="flex items-center gap-1.5 text-xs font-sans font-medium tracking-[0.15em] uppercase text-ink-muted hover:text-gold transition-colors text-left"
              data-ocid="nav.link"
            >
              <ArrowLeft size={13} /> Home
            </button>
          ) : (
            [
              "Home",
              "Skincare",
              "Makeup",
              "Collections",
              "Our Story",
              "Journals",
            ].map((item) => (
              <NavLink
                key={item}
                href={`#${item.toLowerCase().replace(" ", "")}`}
              >
                {item}
              </NavLink>
            ))
          )}
          <button
            type="button"
            onClick={() => {
              onShopNav("shop");
              setMobileOpen(false);
            }}
            className={`text-left text-xs font-sans font-medium tracking-[0.15em] uppercase transition-colors duration-200 ${
              currentView === "shop"
                ? "text-gold"
                : "text-ink-muted hover:text-gold"
            }`}
            data-ocid="nav.link"
          >
            Shop
          </button>
        </nav>
      )}
    </header>
  );
}

function HeroSection({ onShopClick }: { onShopClick: () => void }) {
  return (
    <section
      id="home"
      className="relative min-h-[85vh] flex items-center overflow-hidden"
      style={{
        backgroundImage: "url('/assets/generated/hero-model.dim_1200x700.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center right",
      }}
      data-ocid="hero.section"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cream-100/90 via-cream-100/60 to-transparent" />
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl"
        >
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold mb-4">
            Women's Luxury Cosmetics
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium text-ink leading-tight mb-6">
            Radiance
            <br />
            <em className="italic font-normal">Redefined.</em>
          </h1>
          <p className="font-sans text-sm text-ink-muted leading-relaxed mb-8 max-w-sm">
            Crafted for the modern woman — beauty that's effortless, elegant,
            and entirely yours.
          </p>
          <GoldButton onClick={onShopClick} data-ocid="hero.primary_button">
            Shop the Collection
          </GoldButton>
        </motion.div>
      </div>
    </section>
  );
}

function BestsellersSection({ onAddToBag }: { onAddToBag: () => void }) {
  const { data: products = [], isLoading } = useBestsellers();

  const fallbackProducts: Product[] = [
    {
      id: "1",
      name: "Radiance Serum",
      description: "Brightening vitamin C serum for luminous skin",
      price: 48.0,
      category: "skincare" as any,
      isBestseller: true,
      imageUrl: "",
    },
    {
      id: "2",
      name: "Velvet Moisturizer",
      description: "Deep hydration with a silky-smooth finish",
      price: 38.0,
      category: "skincare" as any,
      isBestseller: true,
      imageUrl: "",
    },
    {
      id: "3",
      name: "Silk Lipstick",
      description: "Rich pigment in a weightless, satin formula",
      price: 28.0,
      category: "makeup" as any,
      isBestseller: true,
      imageUrl: "",
    },
  ];

  const displayProducts =
    isLoading || products.length === 0
      ? fallbackProducts
      : products.slice(0, 3);

  return (
    <section
      id="skincare"
      className="py-20 bg-cream-200"
      data-ocid="bestsellers.section"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-gold mb-3">
            Curated Essentials
          </p>
          <h2 className="font-serif text-4xl font-medium text-ink">
            Meet Our Bestsellers
          </h2>
        </motion.div>
        {isLoading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            data-ocid="bestsellers.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square bg-cream-300 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToBag={onAddToBag}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section
      id="story"
      className="py-20 bg-cream-100"
      data-ocid="story.section"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="overflow-hidden"
          >
            <img
              src="/assets/generated/brand-story.dim_800x600.jpg"
              alt="The Elaiyaahh Story"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-gold mb-4">
              Our Journey
            </p>
            <h2 className="font-serif text-4xl font-medium text-ink mb-6">
              The Elaiyaahh Story
            </h2>
            <p className="font-sans text-sm text-ink-muted leading-relaxed mb-4">
              Born from a belief that beauty should feel as good as it looks,
              Elaiyaahh was founded on the philosophy of mindful luxury. Every
              formula is crafted with intention — balancing efficacy, elegance,
              and care for the skin.
            </p>
            <p className="font-sans text-sm text-ink-muted leading-relaxed mb-8">
              We celebrate the modern woman in all her facets — her quiet
              confidence, her radiant glow, her desire for products that honor
              both her skin and her spirit.
            </p>
            <GoldButton data-ocid="story.primary_button">
              Our Philosophy
            </GoldButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FavoritesAndJournals({ onAddToBag }: { onAddToBag: () => void }) {
  const { data: products = [] } = useProducts();
  const { data: posts = [], isLoading: postsLoading } = useJournalPosts();

  const fallbackProducts: Product[] = [
    {
      id: "1",
      name: "Radiance Serum",
      description: "",
      price: 48,
      category: "skincare" as any,
      isBestseller: true,
      imageUrl: "",
    },
    {
      id: "2",
      name: "Velvet Moisturizer",
      description: "",
      price: 38,
      category: "skincare" as any,
      isBestseller: true,
      imageUrl: "",
    },
    {
      id: "3",
      name: "Silk Lipstick",
      description: "",
      price: 28,
      category: "makeup" as any,
      isBestseller: true,
      imageUrl: "",
    },
    {
      id: "4",
      name: "Flawless Foundation",
      description: "",
      price: 42,
      category: "makeup" as any,
      isBestseller: false,
      imageUrl: "",
    },
  ];

  const fallbackPosts: JournalPost[] = [
    {
      id: "1",
      title: "Your Morning Ritual: 5 Steps to Glowing Skin",
      excerpt:
        "Start your day with intention. A thoughtful skincare routine sets the tone for everything that follows.",
      imageUrl: "",
    },
    {
      id: "2",
      title: "The Art of Effortless Makeup",
      excerpt:
        "Less can truly be more. Discover the three-product routine that lets your natural beauty shine through.",
      imageUrl: "",
    },
    {
      id: "3",
      title: "Ingredients We Love: A Deep Dive",
      excerpt:
        "From vitamin C to hyaluronic acid, we explore the science behind our most beloved formulas.",
      imageUrl: "",
    },
  ];

  const displayProducts =
    products.length > 0 ? products.slice(0, 4) : fallbackProducts;
  const displayPosts = posts.length > 0 ? posts.slice(0, 3) : fallbackPosts;

  return (
    <section
      id="collections"
      className="py-20 bg-cream-200"
      data-ocid="favorites.section"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-gold mb-3">
                Handpicked
              </p>
              <h2 className="font-serif text-3xl font-medium text-ink">
                Discover Our Favorites
              </h2>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              {displayProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group relative overflow-hidden cursor-pointer"
                  data-ocid={`favorites.item.${i + 1}`}
                  onClick={onAddToBag}
                >
                  <div className="aspect-square">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="font-serif text-xs text-cream-50">
                      {product.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div id="journals">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-gold mb-3">
                Latest Reads
              </p>
              <h2 className="font-serif text-3xl font-medium text-ink">
                From the Journals
              </h2>
            </motion.div>
            {postsLoading ? (
              <div
                className="flex flex-col gap-6"
                data-ocid="journal.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-cream-300 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {displayPosts.map((post, i) => (
                  <JournalCard
                    key={post.id}
                    post={post}
                    imageUrl={JOURNAL_IMAGES[i] ?? JOURNAL_IMAGES[0]}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

type ShopCategory = "All" | "Skincare" | "Makeup" | "Collections";

const SHOP_FALLBACK_PRODUCTS: Product[] = [
  {
    id: "s1",
    name: "Radiance Serum",
    description: "Brightening vitamin C serum for luminous, even-toned skin",
    price: 48.0,
    category: "skincare" as any,
    isBestseller: true,
    imageUrl: "",
  },
  {
    id: "s2",
    name: "Velvet Moisturizer",
    description: "Deep hydration with a silky-smooth, non-greasy finish",
    price: 38.0,
    category: "skincare" as any,
    isBestseller: true,
    imageUrl: "",
  },
  {
    id: "s3",
    name: "Rose Petal Toner",
    description:
      "Balancing floral toner that refines pores and soothes redness",
    price: 32.0,
    category: "skincare" as any,
    isBestseller: false,
    imageUrl: "",
  },
  {
    id: "s4",
    name: "Pore-Refining Clay Mask",
    description:
      "Purifying kaolin mask that draws out impurities and minimizes pores",
    price: 36.0,
    category: "skincare" as any,
    isBestseller: false,
    imageUrl: "",
  },
  {
    id: "s5",
    name: "Silk Lipstick",
    description:
      "Rich pigment in a weightless, satin formula that lasts all day",
    price: 28.0,
    category: "makeup" as any,
    isBestseller: true,
    imageUrl: "",
  },
  {
    id: "s6",
    name: "Flawless Foundation",
    description: "Buildable coverage with a natural, skin-like finish",
    price: 42.0,
    category: "makeup" as any,
    isBestseller: false,
    imageUrl: "",
  },
  {
    id: "s7",
    name: "Sunset Eyeshadow Palette",
    description:
      "12 warm, wearable shades from sheer champagne to deep coppery bronze",
    price: 54.0,
    category: "makeup" as any,
    isBestseller: true,
    imageUrl: "",
  },
  {
    id: "s8",
    name: "Precision Brow Pencil",
    description:
      "Micro-tip pencil for naturally defined brows that hold all day",
    price: 22.0,
    category: "makeup" as any,
    isBestseller: false,
    imageUrl: "",
  },
  {
    id: "s9",
    name: "Glow Ritual Set",
    description: "Serum, moisturizer, and toner — the complete luminosity trio",
    price: 108.0,
    category: "collections" as any,
    isBestseller: true,
    imageUrl: "",
  },
  {
    id: "s10",
    name: "Bold Beauty Kit",
    description:
      "Lipstick, foundation, and eyeshadow palette in a luxe gift box",
    price: 116.0,
    category: "collections" as any,
    isBestseller: false,
    imageUrl: "",
  },
  {
    id: "s11",
    name: "Everyday Essentials",
    description:
      "Four bestselling must-haves beautifully presented for gifting",
    price: 95.0,
    category: "collections" as any,
    isBestseller: false,
    imageUrl: "",
  },
];

function ShopPage({ onAddToBag }: { onAddToBag: () => void }) {
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("All");
  const { data: backendProducts = [] } = useProducts();

  const allProducts =
    backendProducts.length > 0 ? backendProducts : SHOP_FALLBACK_PRODUCTS;

  const filtered =
    activeCategory === "All"
      ? allProducts
      : allProducts.filter(
          (p) => p.category.toLowerCase() === activeCategory.toLowerCase(),
        );

  const categories: ShopCategory[] = [
    "All",
    "Skincare",
    "Makeup",
    "Collections",
  ];

  return (
    <motion.div
      key="shop"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      data-ocid="shop.page"
    >
      {/* Shop Hero Banner */}
      <section
        className="py-16 bg-cream-200 text-center"
        data-ocid="shop.section"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
            Elaiyaahh
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-ink mb-4">
            Shop the Collection
          </h1>
          <p className="font-sans text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
            Discover every formula — from daily rituals to special occasion
            statements.
          </p>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="h-px bg-cream-400" />

      {/* Category Tabs */}
      <section
        className="bg-cream-100 py-8 sticky top-[73px] z-40 border-b border-cream-400"
        data-ocid="shop.panel"
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div
            className="flex items-center gap-8 overflow-x-auto"
            role="tablist"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                data-ocid="shop.tab"
                className={`relative pb-2 shrink-0 font-sans text-xs font-medium tracking-[0.2em] uppercase transition-colors duration-200 ${
                  activeCategory === cat
                    ? "text-gold"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-12 bg-cream-100" data-ocid="shop.list">
        <div className="max-w-[1200px] mx-auto px-6">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-24 text-center"
                data-ocid="shop.empty_state"
              >
                <p className="font-serif text-2xl text-ink mb-2">
                  Nothing here yet
                </p>
                <p className="font-sans text-sm text-ink-light">
                  Check back soon for new arrivals in {activeCategory}.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filtered.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToBag={onAddToBag}
                    index={i}
                    ocidPrefix="shop"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </motion.div>
  );
}

function Footer({ onShopNav }: { onShopNav?: (view: View) => void }) {
  const [email, setEmail] = useState("");
  const { mutateAsync: subscribe, isPending } = useSubscribeNewsletter();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribe(email);
      toast.success("You're on the list! Welcome to Elaiyaahh.");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const year = new Date().getFullYear();

  const shopLinks = [
    "Skincare",
    "Makeup",
    "Collections",
    "Bestsellers",
    "Gift Sets",
  ];

  return (
    <footer
      className="bg-cream-200 border-t border-cream-400 pt-16 pb-8"
      data-ocid="footer.section"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <p className="font-serif text-2xl font-semibold tracking-[0.12em] text-ink uppercase mb-4">
              Elaiyaahh
            </p>
            <p className="font-sans text-xs text-ink-light leading-relaxed">
              Modest luxury beauty for the modern woman. Crafted with care, worn
              with confidence.
            </p>
          </div>

          <div>
            <h3 className="font-sans text-[10px] tracking-[0.25em] uppercase text-gold mb-4">
              Shop
            </h3>
            <ul className="space-y-2">
              {shopLinks.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => onShopNav?.("shop")}
                    className="font-sans text-xs text-ink-muted hover:text-gold transition-colors text-left"
                    data-ocid="footer.link"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[10px] tracking-[0.25em] uppercase text-gold mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {[
                "Our Story",
                "Philosophy",
                "Sustainability",
                "Careers",
                "Contact",
                "FAQ",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="/"
                    className="font-sans text-xs text-ink-muted hover:text-gold transition-colors"
                    data-ocid="footer.link"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[10px] tracking-[0.25em] uppercase text-gold mb-4">
              Stay Connected
            </h3>
            <p className="font-sans text-xs text-ink-light mb-4 leading-relaxed">
              Be the first to hear about new arrivals, beauty tips, and
              exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream-100 border border-cream-400 text-xs font-sans text-ink placeholder:text-ink-light focus:outline-none focus:border-gold transition-colors"
                data-ocid="newsletter.input"
                required
              />
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 bg-gold text-cream-50 font-sans font-medium text-xs tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors disabled:opacity-60"
                data-ocid="newsletter.submit_button"
              >
                {isPending ? "Subscribing..." : "Sign Up"}
              </button>
            </form>
            <div className="flex items-center gap-4 mt-5">
              <a
                href="/"
                aria-label="Instagram"
                className="text-ink-light hover:text-gold transition-colors"
                data-ocid="footer.link"
              >
                <Instagram size={16} />
              </a>
              <a
                href="/"
                aria-label="Pinterest"
                className="text-ink-light hover:text-gold transition-colors"
                data-ocid="footer.link"
              >
                <SiPinterest size={14} />
              </a>
              <a
                href="/"
                aria-label="Facebook"
                className="text-ink-light hover:text-gold transition-colors"
                data-ocid="footer.link"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-cream-400 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-[10px] text-ink-light tracking-wide">
            © {year} Elaiyaahh. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="font-sans text-[10px] text-ink-light">
              Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                caffeine.ai
              </a>
            </p>
            <button
              type="button"
              onClick={() => onShopNav?.("admin")}
              className="font-sans text-[9px] text-ink-light hover:text-gold transition-colors opacity-40 hover:opacity-100"
              data-ocid="admin.open_modal_button"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function AppContent() {
  const [cartCount, setCartCount] = useState(1);
  const [currentView, setCurrentView] = useState<View>("home");

  // Detect ?admin=1 in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "1") {
      setCurrentView("admin");
    }
  }, []);

  const addToBag = () => setCartCount((prev) => prev + 1);

  const navigateTo = (view: View) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const _scrollToBestsellers = () => {
    document.querySelector("#skincare")?.scrollIntoView({ behavior: "smooth" });
  };

  if (currentView === "admin") {
    return (
      <>
        <AdminPanel onExit={() => navigateTo("home")} />
        <Toaster position="bottom-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <Header
        cartCount={cartCount}
        onShopNav={navigateTo}
        currentView={currentView}
      />
      <main>
        <AnimatePresence mode="wait">
          {currentView === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HeroSection onShopClick={() => navigateTo("shop")} />
              <BestsellersSection onAddToBag={addToBag} />
              <StorySection />
              <FavoritesAndJournals onAddToBag={addToBag} />
            </motion.div>
          ) : (
            <ShopPage onAddToBag={addToBag} />
          )}
        </AnimatePresence>
      </main>
      <Footer onShopNav={navigateTo} />
      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
