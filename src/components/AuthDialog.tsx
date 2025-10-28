import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn, UserPlus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { mailTmApi, Account } from '@/services/mailTmApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (account: Account, token: string) => void;
}

export default function AuthDialog({ open, onClose, onAuthenticated }: AuthDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [domains, setDomains] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchDomains();
    }
  }, [open]);

  const fetchDomains = async () => {
    try {
      const domainList = await mailTmApi.getDomains();
      setDomains(domainList);
      if (domainList.length > 0) {
        setSelectedDomain(domainList[0]);
      }
    } catch (error) {
      console.error('Failed to fetch domains:', error);
    }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast({
        title: 'Error',
        description: 'Please enter email and password',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const token = await mailTmApi.getToken(loginEmail, loginPassword);
      const account: Account = {
        id: '',
        address: loginEmail,
        password: loginPassword,
      };
      
      onAuthenticated(account, token);
      toast({
        title: 'Logged In!',
        description: 'Successfully logged into your account.',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!createUsername || !createPassword || !selectedDomain) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const fullEmail = `${createUsername}@${selectedDomain}`;

    setLoading(true);
    try {
      const account = await mailTmApi.createAccount(fullEmail, createPassword);
      const token = await mailTmApi.getToken(fullEmail, createPassword);
      
      onAuthenticated({ ...account, password: createPassword }, token);
      toast({
        title: 'Account Created!',
        description: 'Your account has been created successfully.',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create account. Username may already exist.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">Create an account</DialogTitle>
          <DialogDescription className="text-center">
            Here you can create a new account for this you need to select a username, then domain and password!
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Account</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-username">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="create-username"
                  type="text"
                  placeholder="johndoe"
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  className="flex-1"
                />
                <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!createUsername && (
                <p className="text-xs text-destructive">Required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                placeholder="******"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateAccount} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email Address</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="your-email@XaRath-Temp"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}