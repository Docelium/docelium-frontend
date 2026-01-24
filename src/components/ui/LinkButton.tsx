"use client"

import Link from 'next/link';
import Button, { ButtonProps } from '@mui/material/Button';
import { forwardRef } from 'react';

interface LinkButtonProps extends Omit<ButtonProps, 'href'> {
  href: string;
}

const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton({ href, children, ...props }, ref) {
    return (
      <Button component={Link} href={href} ref={ref} {...props}>
        {children}
      </Button>
    );
  }
);

export default LinkButton;
