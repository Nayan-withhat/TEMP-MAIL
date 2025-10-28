import { Mail, RefreshCw, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onRefresh: () => void;
  onGenerateNew: () => void;
}

export default function Sidebar({ onRefresh, onGenerateNew }: SidebarProps) {
  return (
    <div className="w-64 bg-[#1a1f3a] text-white h-screen flex flex-col p-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold">
            <span className="text-blue-400">@</span>mail<span className="text-blue-400">.tm</span>
          </h1>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10"
          onClick={onGenerateNew}
        >
          <Mail className="w-5 h-5 mr-3" />
          Inbox
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10"
          onClick={onRefresh}
        >
          <RefreshCw className="w-5 h-5 mr-3" />
          Refresh
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-blue-400 hover:bg-white/10"
        >
          <Rocket className="w-5 h-5 mr-3" />
          Custom Domain Support
        </Button>
      </nav>

      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="bg-white/5 rounded-lg p-3 mb-3">
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80" 
            alt="Ad" 
            className="w-full h-32 object-cover rounded mb-2"
          />
          <p className="text-xs text-gray-400">Advertisement</p>
        </div>
      </div>
    </div>
  );
}
