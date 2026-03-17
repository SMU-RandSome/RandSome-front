import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/store/authStore';
import { DisplayModeProvider } from '@/store/displayModeStore';
import { ToastProvider } from '@/components/ui/Toast';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <DisplayModeProvider>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </DisplayModeProvider>
  </MemoryRouter>
);

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllProviders, ...options });

export { AllProviders };
