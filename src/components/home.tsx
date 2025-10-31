import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Inbox from './Inbox';
import MessageReader from './MessageReader';
import { Toaster } from '@/components/ui/toaster';
import { Account, mailTmApi } from '@/services/mailTmApi';
import { useToast } from '@/components/ui/use-toast';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [account, setAccount] = useState<Account | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [hasMessages, setHasMessages] = useState(false);
  const { toast } = useToast();

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    // Load saved language
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);

    // Auto-generate email on first load
    const savedAccount = localStorage.getItem('tempmail_account');
    const savedToken = localStorage.getItem('tempmail_token');
    
    if (savedAccount && savedToken) {
      const account = JSON.parse(savedAccount);
      setAccount(account);
      mailTmApi.setToken(savedToken);
    } else {
      // Auto-generate new email
      generateNewEmail();
    }
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const generateRandomString = (length: number) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const generateNewEmail = async () => {
    setLoading(true);
    try {
      const domains = await mailTmApi.getDomains();
      const domain = domains[0];
      const username = generateRandomString(10);
      const address = `${username}@${domain}`;
      const password = generateRandomString(16);

      const newAccount = await mailTmApi.createAccount(address, password);
      const token = await mailTmApi.getToken(address, password);

      const accountWithPassword = { ...newAccount, password };
      setAccount(accountWithPassword);
      mailTmApi.setToken(token);
      
      localStorage.setItem('tempmail_account', JSON.stringify(accountWithPassword));
      localStorage.setItem('tempmail_token', token);

      toast({
        title: t.emailGenerated,
        description: t.emailReady,
      });
    } catch (error) {
      toast({
        title: t.error,
        description: t.failedToGenerate,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMessageSelect = (messageId: string) => {
    setSelectedMessageId(messageId);
    setMessageDialogOpen(true);
  };

  const handleCloseMessage = () => {
    setMessageDialogOpen(false);
    setSelectedMessageId(null);
  };

  const handleLogout = () => {
    setAccount(null);
    mailTmApi.clearToken();
    localStorage.removeItem('tempmail_account');
    localStorage.removeItem('tempmail_token');
    toast({
      title: t.loggedOut,
      description: t.generatingNew,
    });
    // Auto-generate new email after logout
    setTimeout(() => generateNewEmail(), 500);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">{t.generatingEmail}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onRefresh={handleRefresh} onGenerateNew={generateNewEmail} translations={t} />
      
      <div className="flex-1 flex flex-col">
        <TopBar 
          email={account.address} 
          onLogout={handleLogout} 
          language={language}
          onLanguageChange={handleLanguageChange}
          translations={t}
        />
        
        <main className="flex-1 overflow-auto pb-24">
          <div className="max-w-6xl mx-auto p-6">
            {!hasMessages && (
              <div className="mb-6 text-center">
                <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4">
                  <svg className="w-24 h-24 mx-auto text-blue-500" viewBox="0 0 100 100" fill="none">
                    <rect x="10" y="25" width="80" height="50" rx="5" stroke="currentColor" strokeWidth="3"/>
                    <path d="M10 30 L50 55 L90 30" stroke="currentColor" strokeWidth="3" fill="none"/>
                    <circle cx="50" cy="45" r="8" fill="currentColor" opacity="0.3"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-2">{t.tempMail}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t.description}
                </p>
              </div>
            )}

            <Inbox 
              onMessageSelect={handleMessageSelect} 
              translations={t}
              onMessagesChange={(count) => setHasMessages(count > 0)}
            />
          </div>
        </main>

        {/* Fixed Bottom Advertisement Banner */}
        <div className="fixed bottom-0 left-64 right-0 bg-background border-t p-4 z-50">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1557821552-17105176677c?w=400&q=80" 
                  alt="Ad" 
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="font-semibold text-sm mb-1">Premium Email Services</p>
                  <p className="text-xs text-muted-foreground">Get advanced features with our premium plan</p>
                </div>
              </div>
              <Button variant="default" size="sm">Learn More</Button>
            </div>
          </div>
        </div>
      </div>

      <MessageReader
        messageId={selectedMessageId}
        open={messageDialogOpen}
        onClose={handleCloseMessage}
      />

      <Toaster />
    </div>
  );
}