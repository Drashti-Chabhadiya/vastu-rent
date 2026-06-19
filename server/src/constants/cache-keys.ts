export const CACHE_KEYS = {
  CATEGORIES_ALL: "categories:all",
  PRODUCTS_RECENT: "products:recent",
  PRODUCT_DETAIL: (id: string) => `product:detail:${id}`,
  PRODUCTS_LIST: (filters: any) => `products:list:${JSON.stringify(filters)}`,
  PRODUCTS_LIST_PATTERN: "products:list:*",
};

export const CACHE_TTLS = {
  CATEGORIES: 86400, // 24 hours
  PRODUCTS: 3600,    // 1 hour
};
