const API_BASE = 'https://api.mail.tm';

export interface Account {
  id: string;
  address: string;
  password: string;
}

export interface Message {
  id: string;
  from: { address: string; name: string };
  to: Array<{ address: string; name: string }>;
  subject: string;
  intro: string;
  seen: boolean;
  createdAt: string;
  hasAttachments: boolean;
}

export interface MessageDetail extends Message {
  html: string[];
  text: string;
}

let authToken: string | null = null;

export const mailTmApi = {
  async getDomains(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/domains`);
    const data = await response.json();
    return data['hydra:member'].map((d: any) => d.domain);
  },

  async createAccount(address: string, password: string): Promise<Account> {
    const response = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, password }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create account');
    }
    
    return response.json();
  },

  async getToken(address: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, password }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to authenticate');
    }
    
    const data = await response.json();
    authToken = data.token;
    return data.token;
  },

  async getMessages(): Promise<Message[]> {
    if (!authToken) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_BASE}/messages`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    
    const data = await response.json();
    return data['hydra:member'];
  },

  async getMessage(id: string): Promise<MessageDetail> {
    if (!authToken) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_BASE}/messages/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch message');
    }
    
    return response.json();
  },

  async markAsRead(id: string): Promise<void> {
    if (!authToken) throw new Error('Not authenticated');
    
    await fetch(`${API_BASE}/messages/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify({ seen: true }),
    });
  },

  setToken(token: string) {
    authToken = token;
  },

  clearToken() {
    authToken = null;
  },
};
