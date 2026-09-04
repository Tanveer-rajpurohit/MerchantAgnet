import type { StoreItem, CartItem, CartSummary, UserChatMessage as Message } from "../../../types";

export type { StoreItem, CartItem, CartSummary, Message };

export const STORES: StoreItem[] = [
  {
    id: "sharma-store",
    name: "Sharma Kirana Store",
    category: "Kirana / Grocery",
    location: "Shop #4, Link Road, Andheri West, Mumbai",
    area: "Andheri West",
    popularItems: ["Aashirvaad Atta 5kg", "Amul Milk 1L", "Tata Salt 1kg"],
  },
  {
    id: "gupta-provisions",
    name: "Gupta Daily Provisions",
    category: "Dairy & Staples",
    location: "Plot 12, Station Road, Bandra East, Mumbai",
    area: "Bandra East",
    popularItems: ["Fortune Sunflower Oil", "Parle-G Biscuit", "Sugar 1kg"],
  },
  {
    id: "patel-meds",
    name: "Patel Medical & General",
    category: "Pharmacy",
    location: "Opp. Juhu Gymkhana, Juhu, Mumbai",
    area: "Juhu",
    popularItems: ["Dettol Soap 3-pack", "First Aid Kit", "Bandages"],
  },
  {
    id: "mahalaxmi-veg",
    name: "Mahalaxmi Fresh & Veg",
    category: "Fruits & Veg",
    location: "Market Yard, Dadar West, Mumbai",
    area: "Dadar West",
    popularItems: ["Fresh Tomatoes 1kg", "Onions 2kg", "Potatoes 2kg"],
  },
];

export const CATEGORIES = [
  "All",
  "Kirana / Grocery",
  "Dairy & Staples",
  "Pharmacy",
  "Fruits & Veg",
];
