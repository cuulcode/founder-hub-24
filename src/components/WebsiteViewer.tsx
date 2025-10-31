import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

interface WebsiteViewerProps {
  url: string;
  companyName: string;
  onClose: () => void;
}

export const WebsiteViewer = ({ url, companyName, onClose }: WebsiteViewerProps) => {
  const [key, setKey] = useState(0);
  
  const formatUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(formatUrl(url), '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="border-b border-border p-3 flex items-center justify-between gap-2 bg-sidebar">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate">{companyName}</span>
            <span className="text-xs text-muted-foreground truncate">{url}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleOpenExternal}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="flex-1 p-0 relative">
        <iframe
          key={key}
          src={formatUrl(url)}
          className="w-full h-full border-0"
          title={`${companyName} website`}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </CardContent>
    </Card>
  );
};
