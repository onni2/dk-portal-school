/**
 * TypeScript types for DK subscription products and product groups used in the products catalogue.
 * Uses: nothing — standalone file
 * Exports: SubscriptionProduct, ProductGroup
 */
export interface SubscriptionProduct {
  ItemCode: string;
  Description: string;
  UnitPrice1WithTax: number;
  ShowItemInWebShop: boolean;
  ExtraDesc1?: string | null;
  ExtraDesc2?: string | null;
}

export interface ProductGroup {
  title: string;
  products: SubscriptionProduct[];
}
