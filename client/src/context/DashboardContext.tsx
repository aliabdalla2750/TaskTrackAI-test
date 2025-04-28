import React, { createContext, useState, useContext, ReactNode } from 'react';

type DashboardType = 'agency' | 'client' | 'admin' | 'employee';

interface DashboardContextType {
  dashboardType: DashboardType;
  setDashboardType: (type: DashboardType) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dashboardType, setDashboardType] = useState<DashboardType>('agency');

  return (
    <DashboardContext.Provider value={{ dashboardType, setDashboardType }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
}
