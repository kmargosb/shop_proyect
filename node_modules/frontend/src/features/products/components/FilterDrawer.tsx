"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  full?: boolean;
};

export default function FilterDrawer({
  open,
  onClose,
  title,
  children,
  full = false,
}: Props) {
  // cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* OVERLAY */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose} // 🔥 cerrar click fuera
          />

          {/* PANEL */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 25,
            }}
            className={`
              fixed bottom-0 left-0 w-full z-50
              bg-white text-black rounded-t-2xl p-6
              ${full ? "h-full" : "h-[45%]"}
            `}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">{title}</h2>

              <button onClick={onClose}>
                <X />
              </button>
            </div>

            {/* CONTENT */}
            <div className="space-y-4 overflow-y-auto">{children}</div>

            {/* APPLY */}
            <button
              onClick={onClose}
              className="w-full mt-6 bg-black text-white py-3 rounded-full"
            >
              Aplicar
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
