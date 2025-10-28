import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Inbox as InboxIcon, Mail, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { copyToClipboard } from '@/lib/utils';
import { mailTmApi, Message } from '@/services/mailTmApi';
import { formatDistanceToNow } from 'date-fns';

interface InboxProps {
  onMessageSelect: (messageId: string) => void;
}

export default function Inbox({ onMessageSelect }: InboxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await mailTmApi.getMessages();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <InboxIcon className="w-6 h-6" />
              Inbox
            </CardTitle>
            <CardDescription>
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </CardDescription>
          </div>
          <Button
            onClick={fetchMessages}
            disabled={loading}
            variant="outline"
            size="icon"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
              <Mail className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Messages will appear here when received</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => onMessageSelect(message.id)}
                  className="w-full text-left p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const addr = message.from.address;
                          const ok = await copyToClipboard(addr);
                          try {
                            const el = e.currentTarget as HTMLElement;
                            el.classList.add('copy-animate');
                            setTimeout(() => el.classList.remove('copy-animate'), 520);
                          } catch (err) {}
                          if (ok) {
                            toast({ title: 'Copied!', description: 'Email copied to clipboard.' });
                          } else {
                            toast({ title: 'Copy Failed', description: 'Please copy manually.', variant: 'destructive' });
                          }
                        }}
                        className="text-left p-0 m-0 flex-1"
                        title="Click to copy sender email"
                      >
                        <span className="font-semibold truncate">{message.from.name || message.from.address}</span>
                      </button>
                      {!message.seen && (
                        <Badge variant="default" className="shrink-0">New</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="font-medium text-sm mb-1 truncate">{message.subject}</p>
                  <p className="text-sm text-muted-foreground truncate">{message.intro}</p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
