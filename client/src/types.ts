export type Category = { id: string; name: string; slug?: string };

export type ProductSummary = {
  id: string;
  title: string;
  images: { url: string }[];
  category: { name: string };
  seller: {
    id: string;
    companyName: string;
    address?: string | null;
    email?: string | null;
    emailInquiriesEnabled?: boolean;
    whatsapp?: string | null;
  };
};

export type SellerSummary = {
  id: string;
  companyName: string;
  description: string;
  address: string;
  website: string;
  contactName: string;
  categories: Category[];
  productCount: number;
  coverImage?: string | null;
};
