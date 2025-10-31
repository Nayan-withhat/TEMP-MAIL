import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Inbox as InboxIcon, Mail, Loader2 } from 'lucide-react';
import { mailTmApi, Message } from '@/services/mailTmApi';
import { formatDistanceToNow } from 'date-fns';

interface InboxProps {
  onMessageSelect: (messageId: string) => void;
  translations: any;
  onMessagesChange?: (count: number) => void;
}

export default function Inbox({ onMessageSelect, translations, onMessagesChange }: InboxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await mailTmApi.getMessages();
      setMessages(data);
      onMessagesChange?.(data.length);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async (messageId: string) => {
    await mailTmApi.markAsRead(messageId);
    onMessageSelect(messageId);
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">{translations.loading}</p>
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{translations.noMessages}</h3>
          <p className="text-muted-foreground">{translations.waitingForEmails}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{translations.inbox}</CardTitle>
        <Button onClick={fetchMessages} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          {translations.refresh}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => handleMessageClick(message.id)}
              className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{translations.from}: {message.from.address}</p>
                  <p className="text-sm mt-1">{message.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!message.seen && (
                    <Badge variant="default" className="text-xs">New</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}