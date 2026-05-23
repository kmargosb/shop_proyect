"use client";

import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL!;

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("🟢 Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 Socket disconnected");
});