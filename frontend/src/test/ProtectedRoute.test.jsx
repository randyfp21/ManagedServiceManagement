import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as apiModule from '../utils/api';

const ProtectedRoute = ({ children }) => {
  const token = apiModule.getToken();
  if (!token) {
    return <div>Redirected to Login</div>;
  }
  return children;
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('redirects to login when unauthenticated', () => {
    vi.spyOn(apiModule, 'getToken').mockReturnValue(null);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Dashboard Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/redirected to login/i)).toBeInTheDocument();
    expect(screen.queryByText(/protected dashboard content/i)).not.toBeInTheDocument();
  });

  it('renders children when authenticated with valid token', () => {
    vi.spyOn(apiModule, 'getToken').mockReturnValue('valid_jwt_token');

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Dashboard Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/protected dashboard content/i)).toBeInTheDocument();
  });
});
