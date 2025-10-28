import { useState, useEffect } from 'react';
import { userTrackingService, UserTrackingData } from '../services/userTrackingService';

interface UseUserTrackingReturn {
  currentUserData: UserTrackingData | null;
  allUserData: UserTrackingData[];
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
  clearData: () => void;
}

export function useUserTracking(): UseUserTrackingReturn {
  const [currentUserData, setCurrentUserData] = useState<UserTrackingData | null>(null);
  const [allUserData, setAllUserData] = useState<UserTrackingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Collect new data
      const newData = await userTrackingService.collectUserData();
      setCurrentUserData(newData);
      
      // Update stored data list
      const allData = userTrackingService.getAllStoredData();
      setAllUserData(allData);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to collect user data'));
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    userTrackingService.clearStoredData();
    setAllUserData([]);
    setCurrentUserData(null);
  };

  // Collect data when component mounts
  useEffect(() => {
    refreshData();
  }, []);

  return {
    currentUserData,
    allUserData,
    isLoading,
    error,
    refreshData,
    clearData
  };
}