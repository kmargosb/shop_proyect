'use client';

import { useEffect, useRef, useState } from 'react';
import { useNavbar } from '@/hooks/useNavbar';

export function useNavbarScroll() {
  const [visible, setVisible] = useState(true);

  const lastScrollRef = useRef(0);

  const setNavbarVisible = useNavbar((s) => s.setVisible);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScrollRef.current && currentScroll > 80) {
        setVisible(false);
        setNavbarVisible(false);
      } else {
        setVisible(true);
        setNavbarVisible(true);
      }

      lastScrollRef.current = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [setNavbarVisible]);

  return visible;
}
