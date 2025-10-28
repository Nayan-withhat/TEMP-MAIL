interface UserLocation {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

interface BrowserInfo {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timeZone: string;
  isOnline: boolean;
}

interface UserTrackingData {
  timestamp: string;
  ipAddress: string;
  location: UserLocation;
  browserInfo: BrowserInfo;
  referrer: string;
}

class UserTrackingService {
  private static instance: UserTrackingService;
  private lastKnownIP: string = '';
  private lastKnownLocation: UserLocation = {};

  private constructor() {}

  public static getInstance(): UserTrackingService {
    if (!UserTrackingService.instance) {
      UserTrackingService.instance = new UserTrackingService();
    }
    return UserTrackingService.instance;
  }

  private async getIPAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      this.lastKnownIP = data.ip;
      return data.ip;
    } catch (error) {
      console.error('Failed to fetch IP:', error);
      return this.lastKnownIP || 'Unknown';
    }
  }

  private async getLocationInfo(): Promise<UserLocation> {
    try {
      const response = await fetch(`https://ipapi.co/${this.lastKnownIP}/json/`);
      const data = await response.json();
      
      this.lastKnownLocation = {
        country: data.country_name,
        city: data.city,
        region: data.region,
        timezone: data.timezone,
        latitude: data.latitude,
        longitude: data.longitude
      };
      
      return this.lastKnownLocation;
    } catch (error) {
      console.error('Failed to fetch location:', error);
      return this.lastKnownLocation;
    }
  }

  private getBrowserInfo(): BrowserInfo {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isOnline: navigator.onLine
    };
  }

  public async collectUserData(): Promise<UserTrackingData> {
    const ipAddress = await this.getIPAddress();
    const location = await this.getLocationInfo();
    const browserInfo = this.getBrowserInfo();

    const userData: UserTrackingData = {
      timestamp: new Date().toISOString(),
      ipAddress,
      location,
      browserInfo,
      referrer: document.referrer
    };

    this.saveUserData(userData);
    return userData;
  }

  private saveUserData(data: UserTrackingData): void {
    try {
      // Get existing data
      const existingData = localStorage.getItem('userTrackingData');
      const dataArray = existingData ? JSON.parse(existingData) : [];
      
      // Add new data
      dataArray.push(data);
      
      // Keep only last 100 entries to prevent storage overflow
      if (dataArray.length > 100) {
        dataArray.shift();
      }
      
      // Save back to localStorage
      localStorage.setItem('userTrackingData', JSON.stringify(dataArray));
      
      // Also log to console for development
      console.log('User data saved:', data);
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }

  public getAllStoredData(): UserTrackingData[] {
    try {
      const data = localStorage.getItem('userTrackingData');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return [];
    }
  }

  public clearStoredData(): void {
    localStorage.removeItem('userTrackingData');
  }
}

export const userTrackingService = UserTrackingService.getInstance();
export type { UserTrackingData, UserLocation, BrowserInfo };