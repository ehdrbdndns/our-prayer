
import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  shouldRequestReview: boolean;
  setShouldRequestReview: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export function AppProvider(props: React.PropsWithChildren<{}>) {
  const [shouldRequestReview, setShouldRequestReview] = useState(false);

  return (
    <AppContext.Provider
      value={{
        shouldRequestReview,
        setShouldRequestReview,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
