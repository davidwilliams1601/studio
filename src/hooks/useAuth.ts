"use client";

import { useState } from 'react';

interface User {
  email: string;
  uid: string;
}

// Simple mock auth hook for demo purposes
export function useAuth() {
  const [user] = useState<User>({ email: 'demo@linkstream.app', uid: 'demo123' });
  const [loading] = useState(false);

  const logout = async () => {
    // Mock logout
    console.log('Logout clicked');
  };

  const login = async (email: string, password: string) => {
    // Mock login
    console.log('Login:', email);
    return { user: { email, uid: 'demo123' } };
  };

  return { user, loading, logout, login };
}
