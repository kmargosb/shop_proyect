import ProductList from "./ProductList";

export default function ProductsView() {
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-6">
        La tienda de Koky el Kokyto 🛒
      </h1>

      <ProductList />
    </main>
  );
}