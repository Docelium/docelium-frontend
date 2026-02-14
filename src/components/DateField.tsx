'use client';

import TextField, { TextFieldProps } from '@mui/material/TextField';
import React from 'react';

const ALLOWED_KEYS = new Set([
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'Tab', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Enter', '/', 'Home', 'End',
]);

export default function DateField(props: Omit<TextFieldProps, 'type'>) {
  const { slotProps, onKeyDown, ...rest } = props;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!ALLOWED_KEYS.has(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
    if (onKeyDown) {
      (onKeyDown as (e: React.KeyboardEvent<HTMLDivElement>) => void)(e);
    }
  };

  return (
    <TextField
      type="date"
      onKeyDown={handleKeyDown}
      slotProps={{
        inputLabel: { shrink: true },
        ...slotProps,
      }}
      {...rest}
    />
  );
}
