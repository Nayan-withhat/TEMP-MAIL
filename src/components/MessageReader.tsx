import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
        <DialogHeader>
          <DialogTitle className="text-xl">
            {loading ? 'Loading...' : message?.subject || 'Message'}
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : message ? (
          <>
            <div className="space-y-2 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium">From:</span>
                <span>{message.from.name || message.from.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">To:</span>
                <span>{message.to.map(t => t.address).join(', ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Date:</span>
                <span>{format(new Date(message.createdAt), 'PPpp')}</span>
              </div>
              {message.hasAttachments && (
                <Badge variant="secondary">Has Attachments</Badge>
              )}
            </div>
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