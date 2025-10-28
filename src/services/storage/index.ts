import { IStorageService } from './StorageInterface';
import { LocalStorageService } from './StorageInterface';
import { IndexedDBStorage } from './IndexedDBStorage';
import { APIStorageService } from './APIStorage';

export type StorageType = 'localStorage' | 'indexedDB' | 'api';

export function createStorageService(type: StorageType = 'indexedDB'): IStorageService {
  switch (type) {
    case 'localStorage':
      return new LocalStorageService();
    case 'indexedDB':
      return new IndexedDBStorage();
    case 'api':
      return new APIStorageService();
    default:
      return new LocalStorageService();
  }
}