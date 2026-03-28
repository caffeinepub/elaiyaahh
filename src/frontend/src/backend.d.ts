import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface JournalPost {
    id: string;
    title: string;
    imageUrl: string;
    excerpt: string;
}
export interface UserProfile {
    name: string;
}
export interface Product {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    isBestseller: boolean;
    category: ProductCategory;
    price: number;
}
export enum ProductCategory {
    collections = "collections",
    skincare = "skincare",
    makeup = "makeup"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addJournalPost(journalPost: JournalPost): Promise<JournalPost>;
    addProduct(product: Product): Promise<Product>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdmin(): Promise<boolean>;
    deleteJournalPost(id: string): Promise<boolean>;
    deleteProduct(id: string): Promise<boolean>;
    getAllProductsByCategory(): Promise<Array<[string, Array<Product>]>>;
    getBestsellers(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getJournalPosts(): Promise<Array<JournalPost>>;
    getNewsletterSubscribers(): Promise<Array<string>>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: ProductCategory): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdminClaimed(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    subscribeNewsletter(email: string): Promise<boolean>;
    updateJournalPost(id: string, journalPost: JournalPost): Promise<boolean>;
    updateProduct(id: string, product: Product): Promise<boolean>;
}
