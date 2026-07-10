export const queryKeys = {
  products: {
    all: ['products'] as const,

    list: (queryString: string) => [...queryKeys.products.all, queryString] as const,

    detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,

    related: (id: string) => [...queryKeys.products.all, 'related', id] as const,
  },

  brands: {
    all: ['brands'] as const,

    detail: (brand: string) => [...queryKeys.brands.all, brand] as const,
  },

  auth: {
    me: ['auth', 'me'] as const,
  },

  cart: {
    all: ['cart'] as const,
  },

  addresses: {
    all: ['addresses'] as const,
  },
};
