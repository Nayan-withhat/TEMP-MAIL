import { IStorageService } from './StorageInterface';
import { UserTrackingData } from '../userTrackingService';

export class IndexedDBStorage implements IStorageService {
  private readonly DB_NAME = 'UserTrackingDB';
  private readonly STORE_NAME = 'userTrackingStore';
  private readonly DB_VERSION = 1;

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { 
            keyPath: 'timestamp',
            autoIncrement: false 
          });
        }
      };
    });
  }

  async saveUserData(data: UserTrackingData): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);

        // Add new data
        const request = store.add(data);

        request.onsuccess = () => {
          // Clean up old entries if we have more than 100
          const countRequest = store.count();
          countRequest.onsuccess = () => {
            if (countRequest.result > 100) {
              // Get all keys
              const keysRequest = store.getAllKeys();
              keysRequest.onsuccess = () => {
                const keys = keysRequest.result as string[];
                // Sort by timestamp (newest first) and delete oldest
                keys.sort().reverse();
                const keysToDelete = keys.slice(100);
                keysToDelete.forEach(key => store.delete(key));
              };
            }
          };
          resolve();
        };

        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
      });
    } catch (error) {
      console.error('IndexedDB save failed:', error);
      // Fallback to localStorage
      const localStorageService = new LocalStorageService();
      await localStorageService.saveUserData(data);
    }
  }

  async getUserData(): Promise<UserTrackingData[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const data = request.result as UserTrackingData[];
          resolve(data.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ));
        };

        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
      });
    } catch (error) {
      console.error('IndexedDB read failed:', error);
      // Fallback to localStorage
      const localStorageService = new LocalStorageService();
      return await localStorageService.getUserData();
    }
  }

  async clearUserData(): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
      });
    } catch (error) {
      console.error('IndexedDB clear failed:', error);
      // Fallback to localStorage
      const localStorageService = new LocalStorageService();
      await localStorageService.clearUserData();
    }
  }
}