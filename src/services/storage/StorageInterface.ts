import { UserTrackingData } from '../userTrackingService';

export interface IStorageService {
  saveUserData(data: UserTrackingData): Promise<void>;
  getUserData(): Promise<UserTrackingData[]>;
  clearUserData(): Promise<void>;
}

// For localStorage backup
export class LocalStorageService implements IStorageService {
  private readonly STORAGE_KEY = 'userTrackingData';

  async saveUserData(data: UserTrackingData): Promise<void> {
    try {
      const existingData = localStorage.getItem(this.STORAGE_KEY);
      const dataArray = existingData ? JSON.parse(existingData) : [];
      dataArray.push(data);
      
      // Keep only last 100 entries
      if (dataArray.length > 100) {
        dataArray.shift();
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataArray));
    } catch (error) {
      console.error('LocalStorage save failed:', error);
    }
  }

  async getUserData(): Promise<UserTrackingData[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('LocalStorage read failed:', error);
      return [];
    }
  }

  async clearUserData(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}