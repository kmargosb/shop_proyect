'use client';

import Image from 'next/image';
import RelatedProducts from '@/features/products/components/RelatedProducts';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { useCart } from '@/features/cart/CartContext';
import { apiFetch } from '@/shared/lib/api';
import { socket } from '@/shared/lib/socket';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/features/wishlist/WishListContext';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import type { ProductImage } from '@/types/product';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [viewTracked, setViewTracked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [buyingNow, setBuyingNow] = useState(false);
  const { t } = useLanguage();

  /* ===============================
     LOAD PRODUCT
  =============================== */

  const loadProduct = async () => {
    const res = await apiFetch(`/products/${id}`);

    if (!res || !res.ok) {
      setLoading(false);
      return;
    }

    const data = await res.json();

    setProduct(data);

    if (data.variants?.length) {
      const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

      const COLOR_ORDER = [
        'WHITE',
        'BLACK',
        'CREAM',
        'BEIGE',
        'GREY',
        'GRAY',
        'BROWN',
        'GREEN',
        'BLUE',
        'RED',
      ];

      const sortedVariants = [...data.variants].sort((a: any, b: any) => {
        const colorDiff =
          COLOR_ORDER.indexOf(a.color?.toUpperCase()) - COLOR_ORDER.indexOf(b.color?.toUpperCase());

        if (colorDiff !== 0) return colorDiff;

        return SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size);
      });

      const firstAvailableVariant =
        sortedVariants.find((variant: any) => variant.stock - variant.reservedStock > 0) ??
        sortedVariants[0];

      setSelectedSize(firstAvailableVariant.size);
      setSelectedColor(firstAvailableVariant.color);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!product || viewTracked) return;

    setViewTracked(true);

    apiFetch('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        event: 'PRODUCT_VIEW',
        productId: product.id,
      }),
    });
  }, [product, viewTracked]);

  useEffect(() => {
    setViewTracked(false);
  }, [id]);

  useEffect(() => {
    const handleProductUpdated = (payload: { productId: string }) => {
      if (payload.productId === id) {
        loadProduct();
      }
    };

    socket.on('productUpdated', handleProductUpdated);

    return () => {
      socket.off('productUpdated', handleProductUpdated);
    };
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-6 py-20 text-center">{t.product.loading}</div>;
  }

  if (!product) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">{t.product.notFound}</h1>

          <p className="mt-4 text-neutral-400">{t.product.notFoundDescription}</p>
        </div>
      </div>
    );
  }

  /* ===============================
     IMAGE ORDER (PRIMARY FIRST)
  =============================== */

  const images = [...(product.images ?? [])].sort(
    (a: any, b: any) => Number(b.isPrimary) - Number(a.isPrimary),
  );

  const mainImage = images[selectedImage]?.url ?? '/placeholder-product.png';

  const variants = product.variants ?? [];

  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const sizes = Array.from(new Set<string>(variants.map((v: any) => String(v.size)))).sort(
    (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b),
  );

  const COLOR_ORDER = [
    'WHITE',
    'BLACK',
    'CREAM',
    'BEIGE',
    'GREY',
    'GRAY',
    'BROWN',
    'GREEN',
    'BLUE',
    'RED',
  ];

  const colors = Array.from(new Set<string>(variants.map((v: any) => String(v.color)))).sort(
    (a, b) => {
      const ai = COLOR_ORDER.indexOf(a.toUpperCase());
      const bi = COLOR_ORDER.indexOf(b.toUpperCase());

      if (ai === -1 && bi === -1) {
        return a.localeCompare(b);
      }

      if (ai === -1) return 1;
      if (bi === -1) return -1;

      return ai - bi;
    },
  );

  const selectedVariant =
    variants.find(
      (variant: any) => variant.size === selectedSize && variant.color === selectedColor,
    ) ?? null;

  const availableStock = (selectedVariant?.stock ?? 0) - (selectedVariant?.reservedStock ?? 0);

  const outOfStock = availableStock <= 0;

  /* ===============================
   STOCK STATUS
=============================== */

  let stockBadge = null;

  if (outOfStock) {
    stockBadge = <span className="font-medium text-red-500">{t.product.soldOut}</span>;
  } else if (availableStock <= 5) {
    stockBadge = <span className="font-medium text-amber-400">{t.product.lowStock}</span>;
  } else {
    stockBadge = <span className="font-medium text-emerald-500">{t.product.inStock}</span>;
  }

  /* ===============================
     ACTIONS
  =============================== */

  const handleAddToCart = async () => {
    try {
      if (!selectedVariant) {
        toast.error(t.toast.selectVariant);
        return;
      }
      toast.success(t.toast.addedToCart);

      setAddingToCart(true);

      setAddedToCart(true);

      await addItem(product.id, selectedVariant.id, quantity, true, {
        productId: product.id,
        variantId: selectedVariant.id,
        quantity,
        stock: selectedVariant.stock,
        name: product.name,
        price: product.price,
        image:
          product.images?.find((i: ProductImage) => i.isPrimary)?.url ??
          product.images?.[0]?.url ??
          null,
        size: selectedVariant.size,
        color: selectedVariant.color,
      });

      void apiFetch('/analytics/track', {
        method: 'POST',
        body: JSON.stringify({
          event: 'ADD_TO_CART',
          productId: product.id,
          metadata: {
            variantId: selectedVariant.id,
            quantity,
          },
        }),
      });

      setTimeout(() => {
        setAddedToCart(false);
        setAddingToCart(false);
      }, 900);
    } catch (error: any) {
      setAddedToCart(false);
      setAddingToCart(false);
      toast.dismiss();
      toast.error(error?.message || t.toast.stockError);
    }
  };

  const handleBuyNow = async () => {
    try {
      if (!selectedVariant) {
        toast.error(t.toast.selectVariant);
        return;
      }
      setBuyingNow(true);
      toast.success(t.toast.addedToCart);

      await addItem(product.id, selectedVariant.id, quantity, false, {
        productId: product.id,
        variantId: selectedVariant.id,
        quantity,
        stock: selectedVariant.stock,
        name: product.name,
        price: product.price,
        image:
          product.images?.find((i: ProductImage) => i.isPrimary)?.url ??
          product.images?.[0]?.url ??
          null,
        size: selectedVariant.size,
        color: selectedVariant.color,
      });

      router.push('/checkout');

      void apiFetch('/analytics/track', {
        method: 'POST',
        body: JSON.stringify({
          event: 'ADD_TO_CART',
          productId: product.id,
          metadata: {
            variantId: selectedVariant.id,
            quantity,
            buyNow: true,
          },
        }),
      });
    } catch (error: any) {
      toast.dismiss();
      setBuyingNow(false);
      toast.error(error?.message || t.toast.stockError);
    }
  };

  /* ===============================
     UI
  =============================== */

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 md:space-y-24 md:px-6 md:py-16">
      <main className="grid gap-6 md:grid-cols-2 md:gap-14">
        {/* ===============================
         IMAGE GALLERY
      =============================== */}

        <div className="space-y-3 md:space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-900">
            <Image src={mainImage} alt={product.name} fill className="object-cover" />
          </div>

          {images.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {images.map((img: any, index: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-14 w-14 md:h-20 md:w-20 overflow-hidden rounded-md border ${
                    selectedImage === index ? 'border-white' : 'border-neutral-700'
                  } cursor-pointer`}
                >
                  <Image src={img.url} alt={product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===============================
         PRODUCT INFO
      =============================== */}

        <div className="space-y-4 md:space-y-6">
          {product.brand?.name && (
            <p className="text-xs tracking-[0.22em] md:text-sm md:tracking-[0.3em] text-neutral-500 uppercase">
              {product.brand.name}
            </p>
          )}

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>

            <button
              disabled={buyingNow}
              onClick={() => toggleWishlist(product.id)}
              title={isWishlisted(product.id) ? t.wishlist.saved : t.wishlist.save}
              className="rounded-full p-2 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Heart
                size={22}
                className={
                  isWishlisted(product.id) ? 'fill-rose-500 text-rose-500' : 'text-neutral-500'
                }
              />
            </button>
          </div>

          <p className="text-xl font-semibold md:text-2xl">€{(product.price / 100).toFixed(2)}</p>

          {stockBadge}

          <div className="space-y-4 md:space-y-6">
            <div>
              <p className="mb-3 text-xs tracking-[0.25em] text-neutral-500 uppercase">
                {t.product.size}
              </p>

              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    disabled={buyingNow}
                    onClick={() => {
                      setSelectedSize(size);
                      setQuantity(1);
                    }}
                    className={`h-10 min-w-[46px] cursor-pointer rounded-lg border px-3 md:h-11 md:min-w-[52px] md:rounded-xl md:px-4 transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-white bg-neutral-900 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.25)]'
                        : 'border-neutral-700 text-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs tracking-[0.25em] text-neutral-500 uppercase">
                {t.product.color}
              </p>

              <div className="flex flex-wrap gap-3 md:gap-5">
                {colors.map((color) => {
                  const colorMap: Record<string, string> = {
                    WHITE: 'bg-white border border-neutral-500',
                    BLACK: 'bg-black',
                    CREAM: 'bg-yellow-50',
                    BEIGE: 'bg-stone-200',
                    GREY: 'bg-neutral-500',
                    GRAY: 'bg-neutral-500',
                    BROWN: 'bg-amber-800',
                    GREEN: 'bg-green-700',
                    BLUE: 'bg-blue-700',
                    RED: 'bg-red-700',
                  };

                  const swatch = colorMap[color.toUpperCase()] ?? 'bg-neutral-400';

                  const active = selectedColor === color;

                  return (
                    <button
                      key={color}
                      disabled={buyingNow}
                      onClick={() => {
                        if (selectedColor === color) return;
                        setSelectedColor(color);
                        setQuantity(1);

                        const variantsForColor = variants
                          .filter((v: any) => v.color === color)
                          .sort((a: any, b: any) => {
                            const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

                            return SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size);
                          });

                        const firstAvailable =
                          variantsForColor.find((v: any) => v.stock - v.reservedStock > 0) ??
                          variantsForColor[0];

                        if (firstAvailable) {
                          setSelectedSize(firstAvailable.size);
                        }
                      }}
                      className="flex cursor-pointer flex-col items-center gap-2"
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${active ? 'scale-140 border-black' : 'border-neutral-400'}`}
                      >
                        <span className={`h-5 w-5 rounded-full ${swatch}`} />
                      </span>

                      <span
                        className={`text-xs tracking-wide uppercase ${
                          active ? 'font-semibold text-black' : 'text-neutral-400'
                        }`}
                      >
                        {color}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {product.description && (
            <p className="text-sm leading-relaxed text-neutral-400 md:text-base">{product.description}</p>
          )}

          {/* ===============================
           QUANTITY SELECTOR
        =============================== */}

          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400">{t.product.quantity}</span>

            <div className="flex items-center rounded-md border border-neutral-700">
              <button
                disabled={outOfStock || buyingNow}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="cursor-pointer px-3 py-1 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                -
              </button>

              <span className="px-4">{quantity}</span>

              <button
                disabled={outOfStock || buyingNow}
                onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                className="cursor-pointer px-3 py-1 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* ===============================
           ACTION BUTTONS
        =============================== */}

          <div className="flex gap-2 md:gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={outOfStock || addingToCart || buyingNow}
              className="min-w-[140px] md:min-w-[170px] cursor-pointer bg-white text-black shadow-sm transition-all duration-300 hover:bg-neutral-200 hover:shadow-md disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
            >
              <span className="flex items-center gap-2">
                {addedToCart ? (
                  <>✓ Added</>
                ) : addingToCart ? (
                  <>Adding...</>
                ) : (
                  <>{t.product.addToCart}</>
                )}
              </span>
            </Button>

            <Button
              onClick={handleBuyNow}
              disabled={outOfStock || buyingNow}
              variant="outline"
              className="cursor-pointer shadow-sm transition-all hover:shadow-md"
            >
              {buyingNow ? 'Loading...' : t.product.buyNow}
            </Button>
          </div>
        </div>
      </main>

      {/* ===============================
       RELATED PRODUCTS
    =============================== */}

      <RelatedProducts productId={product.id} />
    </div>
  );
}
