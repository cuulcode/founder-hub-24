import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Update these once your repo is connected to GitHub.
const GITHUB_USER = 'cuulcode';
const GITHUB_REPO = 'founder-hub-24';
const APK_URL = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/releases/download/app-latest/app-debug.apk`;

export const DownloadAndroidButton = () => (
  <Button asChild variant="outline" size="sm">
    <a href={APK_URL} download>
      <Download className="h-4 w-4" />
      Download Android App
    </a>
  </Button>
);
