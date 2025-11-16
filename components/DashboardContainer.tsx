'use client';

import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface DashboardContainerProps {
  children: ReactNode;
  background?: string;
  minHeight?: string;
}

export default function DashboardContainer({
  children,
  background = 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
  minHeight = 'auto',
}: DashboardContainerProps) {
  return (
    <Box
      sx={{
        p: { xs: 3, sm: 4, md: 5 },
        background,
        minHeight,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        '& > *': {
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
        },
        '& .MuiGrid-container': {
          width: '100% !important',
          maxWidth: '100% !important',
          marginLeft: '0 !important',
          marginRight: '0 !important',
        },
        '& .MuiCard-root': {
          width: '100%',
          maxWidth: '100%',
        },
        // Improved Typography
        '& .MuiTypography-h1': {
          fontWeight: 400,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
        },
        '& .MuiTypography-h2': {
          fontWeight: 400,
          letterSpacing: '-0.02em',
          lineHeight: 1.25,
        },
        '& .MuiTypography-h3': {
          fontWeight: 400,
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
        },
        '& .MuiTypography-h4': {
          fontWeight: 500,
          letterSpacing: '-0.01em',
          lineHeight: 1.35,
        },
        '& .MuiTypography-h5': {
          fontWeight: 500,
          letterSpacing: '-0.01em',
          lineHeight: 1.4,
        },
        '& .MuiTypography-h6': {
          fontWeight: 400,
          letterSpacing: '0',
          lineHeight: 1.5,
        },
        '& .MuiTypography-body1': {
          fontWeight: 400,
          letterSpacing: '0.01em',
          lineHeight: 1.65,
        },
        '& .MuiTypography-body2': {
          fontWeight: 400,
          letterSpacing: '0.01em',
          lineHeight: 1.65,
        },
        '& .MuiTypography-subtitle1': {
          fontWeight: 400,
          letterSpacing: '0.01em',
          lineHeight: 1.55,
        },
        '& .MuiTypography-subtitle2': {
          fontWeight: 500,
          letterSpacing: '0.01em',
          lineHeight: 1.55,
        },
      }}
    >
      {children}
    </Box>
  );
}
