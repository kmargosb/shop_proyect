export type ProductImage = {
  url: string
}

export type Product = {
  id: string
  name: string
  price: number
  stock: number
  images?: ProductImage[]
}