import type { Product } from '@/types/product';
import ProductCard from './ProductCard';

type Props = {
  products: Product[];
};

export default function ProductsGrid({ products }: Props) {
  return (
    <>
      {products.map((product) => (
        <div key={product.id} className="min-w-[48%] md:min-w-0">
          <ProductCard product={product} />
        </div>
      ))}
    </>
  );
}
