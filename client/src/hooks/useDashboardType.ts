import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useDashboardContext } from '@/context/DashboardContext';

export default function useDashboardType() {
  const [location] = useLocation();
  const { setDashboardType } = useDashboardContext();

  useEffect(() => {
    if (location.includes('/dashboard/agency')) {
      setDashboardType('agency');
    } else if (location.includes('/dashboard/client')) {
      setDashboardType('client');
    } else if (location.includes('/dashboard/admin')) {
      setDashboardType('admin');
    } else if (location.includes('/dashboard/employee')) {
      setDashboardType('employee');
    }
  }, [location, setDashboardType]);
}
