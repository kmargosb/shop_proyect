export interface CreateRefundInput {
  orderId: string
  amount?: number
  reason?: string
}

export interface StripeRefundResponse {
  id: string
  status: string
  amount: number
  currency: string
}

export interface RefundItemInput {
  orderItemId: string
  quantity: number
}

export interface CreateRefundInput {
  orderId: string
  reason?: string
  items?: RefundItemInput[]
}