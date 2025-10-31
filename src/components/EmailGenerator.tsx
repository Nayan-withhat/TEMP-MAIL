import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { mailTmApi, Account } from '@/services/mailTmApi';

interface EmailGeneratorProps {
  onEmailGenerated: (account: Account, token: string) => void;
}

export default function EmailGenerator({ onEmailGenerated }: EmailGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [generatedAccount, setGeneratedAccount] = useState<Account | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const generateRandomString = (length: number) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const domains = await mailTmApi.getDomains();
      const domain = domains[0];
      const username = generateRandomString(10);
      const address = `${username}@${domain}`;
      const password = generateRandomString(16);

      const account = await mailTmApi.createAccount(address, password);
      const token = await mailTmApi.getToken(address, password);

      setGeneratedAccount({ ...account, password });
      onEmailGenerated({ ...account, password }, token);

      toast({
        title: 'Email Generated!',
        description: 'Your temporary email is ready to use.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard.`,
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: 'Copied!',
          description: `${label} copied to clipboard.`,
        });
      } catch (err) {
        toast({
          title: 'Copy Failed',
          description: `Please manually copy the ${label.toLowerCase()}.`,
          variant: 'destructive',
        });
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-6 h-6" />
          Generate Temporary Email
        </CardTitle>
        <CardDescription>
          Create a disposable email address for temporary use
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {generatedAccount ? (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="flex gap-2">
                <Input 
                  id="email"
                  value={generatedAccount.address} 
                  readOnly 
                  className="font-mono text-sm" 
                />
                <Button 
                  onClick={() => handleCopy(generatedAccount.address, 'Email')} 
                  variant="outline" 
                  size="icon"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    id="password"
                    value={generatedAccount.password} 
                    readOnly 
                    type={showPassword ? 'text' : 'password'}
                    className="font-mono text-sm pr-10" 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button 
                  onClick={() => handleCopy(generatedAccount.password, 'Password')} 
                  variant="outline" 
                  size="icon"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="pt-2 text-xs text-muted-foreground">
              💡 Save these credentials to login later from any device
            </div>
          </div>
        ) : (
          <Button onClick={handleGenerate} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Email Address'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}