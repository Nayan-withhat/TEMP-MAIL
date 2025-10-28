import { IStorageService } from './StorageInterface';
import { UserTrackingData } from '../userTrackingService';
import { LocalStorageService } from './StorageInterface';

export class APIStorageService implements IStorageService {
  private apiUrl: string;
  private fallbackStorage: LocalStorageService;

  constructor(apiUrl: string = '/api/tracking') {
    this.apiUrl = apiUrl;
    this.fallbackStorage = new LocalStorageService();
  }

  async saveUserData(data: UserTrackingData): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('API save failed');
      }
    } catch (error) {
      console.error('API save failed, using fallback:', error);
      // Fallback to local storage if API fails
      await this.fallbackStorage.saveUserData(data);
    }
  }

  async getUserData(): Promise<UserTrackingData[]> {
    try {
      const response = await fetch(`${this.apiUrl}/data`);
      if (!response.ok) {
        throw new Error('API fetch failed');
      }
      return await response.json();
    } catch (error) {
      console.error('API fetch failed, using fallback:', error);
      // Fallback to local storage if API fails
      return await this.fallbackStorage.getUserData();
    }
  }

  async clearUserData(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/clear`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('API clear failed');
      }
    } catch (error) {
      console.error('API clear failed, using fallback:', error);
      // Fallback to local storage if API fails
      await this.fallbackStorage.clearUserData();
    }
  }
}