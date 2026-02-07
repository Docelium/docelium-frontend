'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const prevPathRef = useRef(pathname);

  // When pathname or search params change, navigation is complete
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      setLoading(false);
    }
    prevPathRef.current = pathname;
  }, [pathname, searchParams]);

  // Listen for clicks on internal links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Only internal links, not same page, not new tab
      if (
        href.startsWith('/') &&
        href !== pathname &&
        !href.startsWith('#') &&
        !anchor.hasAttribute('target') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        setLoading(true);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  // Safety timeout: hide after 8s in case navigation gets stuck
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 8000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (!loading) return null;

  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
      <LinearProgress />
    </Box>
  );
}
