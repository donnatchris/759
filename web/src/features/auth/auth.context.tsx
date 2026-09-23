'use client';

import { createContext, useContext } from 'react';
import { TAuthUser } from './auth.types';

type UserContextType = {
  user: TAuthUser;
  isAdmin: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  isAdmin: false,
});

type UserProviderProps = {
  children: React.ReactNode;
  user: TAuthUser;
};

export function UserProvider({ children, user }: UserProviderProps) {
  const isAdmin = user?.role === 'ADMIN';
  return (
    <UserContext.Provider value={{ user, isAdmin }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
