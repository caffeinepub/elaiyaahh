import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";


actor {
  // Access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type ProductCategory = {
    #skincare;
    #makeup;
    #collections;
  };

  module ProductCategory {
    public func toText(category : ProductCategory) : Text {
      switch (category) {
        case (#skincare) { "Skincare" };
        case (#makeup) { "Makeup" };
        case (#collections) { "Collections" };
      };
    };
  };

  type Product = {
    id : Text;
    name : Text;
    category : ProductCategory;
    description : Text;
    price : Float;
    imageUrl : Text;
    isBestseller : Bool;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  type JournalPost = {
    id : Text;
    title : Text;
    excerpt : Text;
    imageUrl : Text;
  };

  module JournalPost {
    public func compare(post1 : JournalPost, post2 : JournalPost) : Order.Order {
      Text.compare(post1.title, post2.title);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let products = Map.empty<Text, Product>();
  let journalPosts = Map.empty<Text, JournalPost>();
  let newsletterSubscribers = Set.empty<Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextProductId = 10;
  var nextJournalPostId = 10;

  // ─── Admin claim ────────────────────────────────────────────────────────────

  // Returns true if an admin has already been assigned
  public query func isAdminClaimed() : async Bool {
    accessControlState.adminAssigned;
  };

  // First logged-in user to call this becomes admin (one-time only)
  public shared ({ caller }) func claimAdmin() : async Bool {
    if (caller.isAnonymous()) { return false };
    if (accessControlState.adminAssigned) { return false };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
    true;
  };

  // ─── User profile ────────────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Newsletter subscription - public, no auth required
  public func subscribeNewsletter(email : Text) : async Bool {
    if (newsletterSubscribers.contains(email)) { return false };
    newsletterSubscribers.add(email);
    true;
  };

  // Admin-only product management
  public shared ({ caller }) func addProduct(product : Product) : async Product {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let newProduct = { product with id = "prod" # nextProductId.toText() };
    products.add(newProduct.id, newProduct);
    nextProductId += 1;
    newProduct;
  };

  public shared ({ caller }) func updateProduct(id : Text, product : Product) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    if (not products.containsKey(id)) { return false };
    products.add(id, product);
    true;
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
      };
    if (not products.containsKey(id)) { return false };
    products.remove(id);
    true;
  };

  // Admin-only journal management
  public shared ({ caller }) func addJournalPost(journalPost : JournalPost) : async JournalPost {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add journal posts");
    };

    let newPost = { journalPost with id = "jp" # nextJournalPostId.toText() };
    journalPosts.add(newPost.id, newPost);
    nextJournalPostId += 1;
    newPost;
  };

  public shared ({ caller }) func updateJournalPost(id : Text, journalPost : JournalPost) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update journal posts");
    };
    if (not journalPosts.containsKey(id)) { return false };
    journalPosts.add(id, journalPost);
    true;
  };

  public shared ({ caller }) func deleteJournalPost(id : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete journal posts");
    };
    if (not journalPosts.containsKey(id)) { return false };
    journalPosts.remove(id);
    true;
  };

  // Public query functions - no auth required
  public query func getProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query func getProductsByCategory(category : ProductCategory) : async [Product] {
    products.values().filter(func(p) { p.category == category }).toArray().sort();
  };

  public query func getBestsellers() : async [Product] {
    products.values().filter(func(p) { p.isBestseller }).toArray().sort();
  };

  public query func getJournalPosts() : async [JournalPost] {
    journalPosts.values().toArray().sort();
  };

  public query func getNewsletterSubscribers() : async [Text] {
    newsletterSubscribers.toArray();
  };

  public query func getAllProductsByCategory() : async [(Text, [Product])] {
    let categories = List.empty<ProductCategory>();
    categories.add(#skincare);
    categories.add(#makeup);
    categories.add(#collections);
    categories.toArray().map(
      func(category) {
        (ProductCategory.toText(category), products.values().filter(func(p) { p.category == category }).toArray().sort());
      }
    );
  };

  // Seed data
  products.add(
    "prod1",
    {
      id = "prod1";
      name = "Elaiyaahh Hydrating Serum";
      category = #skincare;
      description = "A nourishing serum that hydrates and brightens skin.";
      price = 29.99;
      imageUrl = "/assets/generated/product-serum.dim_600x600.jpg";
      isBestseller = true;
    },
  );

  products.add(
    "prod2",
    {
      id = "prod2";
      name = "Elaiyaahh Velvet Lipstick";
      category = #makeup;
      description = "Smooth, long-lasting velvet lipstick in various shades.";
      price = 19.99;
      imageUrl = "/assets/generated/product-lipstick.dim_600x600.jpg";
      isBestseller = false;
    },
  );

  products.add(
    "prod3",
    {
      id = "prod3";
      name = "Elaiyaahh Radiance Collection";
      category = #collections;
      description = "Complete set for radiant, glowing skin.";
      price = 79.99;
      imageUrl = "/assets/generated/product-moisturizer.dim_600x600.jpg";
      isBestseller = true;
    },
  );

  products.add(
    "prod4",
    {
      id = "prod4";
      name = "Elaiyaahh Cleansing Balm";
      category = #skincare;
      description = "Gentle and effective cleansing balm.";
      price = 24.99;
      imageUrl = "/assets/generated/product-toner.dim_600x600.jpg";
      isBestseller = false;
    },
  );

  products.add(
    "prod5",
    {
      id = "prod5";
      name = "Elaiyaahh Foundation";
      category = #makeup;
      description = "Lightweight foundation for flawless coverage.";
      price = 32.99;
      imageUrl = "/assets/generated/product-foundation.dim_600x600.jpg";
      isBestseller = true;
    },
  );

  products.add(
    "prod6",
    {
      id = "prod6";
      name = "Elaiyaahh Eye Shadow Palette";
      category = #makeup;
      description = "Versatile palette for stunning eye looks.";
      price = 27.99;
      imageUrl = "/assets/generated/product-eyeshadow.dim_600x600.jpg";
      isBestseller = false;
    },
  );

  journalPosts.add(
    "jp1",
    {
      id = "jp1";
      title = "The Importance of Skincare Routine";
      excerpt = "Discover why a daily skincare routine is essential for healthy skin.";
      imageUrl = "/assets/generated/journal-1.dim_600x400.jpg";
    },
  );

  journalPosts.add(
    "jp2",
    {
      id = "jp2";
      title = "Top 5 Makeup Tips for Beginners";
      excerpt = "Learn simple yet effective makeup tips for flawless looks.";
      imageUrl = "/assets/generated/journal-2.dim_600x400.jpg";
    },
  );

  journalPosts.add(
    "jp3",
    {
      id = "jp3";
      title = "Transform Your Look with Elaiyaahh Collections";
      excerpt = "Explore how our specialty collections can transform your skin and beauty routine.";
      imageUrl = "/assets/generated/journal-3.dim_600x400.jpg";
    },
  );
};
