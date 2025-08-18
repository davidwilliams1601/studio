"use client";

import { useState, useEffect } from 'react';

// Simple mock auth hook for testing
export function useAuth() {
  const [user, setUser] = useState({ email: 'test@example.com', uid: 'test123' });
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setUser(null);
  };

  return { user, loading, logout };
}
