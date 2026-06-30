'use client';

import { io, type Socket } from 'socket.io-client';

export type DashboardUpdatePayload = {
  type?: string;
  orderId?: string;
};

export type OrderUpdatedPayload = {
  orderId: string;
};

type ServerToClientEvents = {
  'dashboard:update': (payload: DashboardUpdatePayload) => void;
  orderUpdated: (payload: OrderUpdatedPayload) => void;
  orderCancelled: (payload: OrderUpdatedPayload) => void;
  orderPaid: (payload: OrderUpdatedPayload) => void;
  productUpdated: (payload: { productId: string }) => void;
  cartUpdated: (payload: { cartId: string }) => void;
};

type ClientToServerEvents = Record<string, never>;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('🟢 Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔴 Socket disconnected');
});
