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
