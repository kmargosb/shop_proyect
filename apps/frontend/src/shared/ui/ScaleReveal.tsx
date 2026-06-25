'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type ScaleRevealProps = {
  children: ReactNode;
  delay?: number;
};

export default function ScaleReveal({ children, delay = 0 }: ScaleRevealProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.94,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 1,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
    >
      {children}
    </motion.div>
  );
}
