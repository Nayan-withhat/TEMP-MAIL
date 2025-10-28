import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { copyToClipboard } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { mailTmApi, MessageDetail } from '@/services/mailTmApi';
import { format } from 'date-fns';

interface MessageReaderProps {
  messageId: string | null;
  open: boolean;
  onClose: () => void;
}

export default function MessageReader({ messageId, open, onClose }: MessageReaderProps) {
  const [message, setMessage] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (messageId && open) {
      fetchMessage();
    }
  }, [messageId, open]);

  const fetchMessage = async () => {
    if (!messageId) return;
    
    setLoading(true);
    try {
      const data = await mailTmApi.getMessage(messageId);
      setMessage(data);
      if (!data.seen) {
        await mailTmApi.markAsRead(messageId);
      }
    } catch (error) {
      console.error('Failed to fetch message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : message ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">{message.subject}</DialogTitle>
              <DialogDescription className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">From:</span>
                  <button
                    onClick={async (e) => {
                      const addr = message.from.address;
                      const ok = await copyToClipboard(addr);
                      try {
                        const el = e.currentTarget as HTMLElement;
                        el.classList.add('copy-animate');
                        setTimeout(() => el.classList.remove('copy-animate'), 520);
                      } catch (err) {}
                      if (ok) {
                        toast({ title: 'Copied!', description: 'Sender email copied.' });
                      } else {
                        toast({ title: 'Copy Failed', description: 'Please copy manually.', variant: 'destructive' });
                      }
                    }}
                    className="text-left"
                    title="Click to copy sender email"
                  >
                    <span className="underline decoration-dotted">{message.from.name || message.from.address}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">To:</span>
                  <button
                    onClick={async (e) => {
                      const all = message.to.map(t => t.address).join(', ');
                      const ok = await copyToClipboard(all);
                      try {
                        const el = e.currentTarget as HTMLElement;
                        el.classList.add('copy-animate');
                        setTimeout(() => el.classList.remove('copy-animate'), 520);
                      } catch (err) {}
                      if (ok) {
                        toast({ title: 'Copied!', description: 'Recipient email(s) copied.' });
                      } else {
                        toast({ title: 'Copy Failed', description: 'Please copy manually.', variant: 'destructive' });
                      }
                    }}
                    className="text-left"
                    title="Click to copy recipient emails"
                  >
                    <span className="underline decoration-dotted">{message.to.map(t => t.address).join(', ')}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Date:</span>
                  <span>{format(new Date(message.createdAt), 'PPpp')}</span>
                </div>
                {message.hasAttachments && (
                  <Badge variant="secondary">Has Attachments</Badge>
                )}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[50vh] mt-4">
              {message.html && message.html.length > 0 ? (
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: message.html.join('') }}
                />
              ) : (
                <div className="whitespace-pre-wrap text-sm">{message.text}</div>
              )}
            </ScrollArea>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
