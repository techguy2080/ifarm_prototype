'use client';

import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#16a34a', // green-600
      light: '#22c55e', // green-500
      dark: '#15803d', // green-700
    },
    secondary: {
      main: '#6b7280', // gray-500
    },
    background: {
      default: '#f9fafb', // gray-50
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}














