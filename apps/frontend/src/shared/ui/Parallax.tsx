'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  offset?: number;
};

export default function Parallax({ children, offset = 40 }: Props) {
  const { scrollY } = useScroll();

  const y = useTransform(scrollY, [0, 3000], [0, -offset]);

  return <motion.div style={{ y }}>{children}</motion.div>;
}
