import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const GITHUB_USER = 'cuulcode';
const GITHUB_REPO = 'founder-hub-24';
const APK_FILE = 'founder-hub-24-debug.apk';
const APK_URL = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/releases/download/app-latest/${APK_FILE}`;

interface DownloadAndroidButtonProps {
  compact?: boolean;
}

export const DownloadAndroidButton = ({ compact = false }: DownloadAndroidButtonProps) => (
  <Button asChild variant="outline" size={compact ? 'icon' : 'sm'} aria-label="Download Android APK">
    <a href={APK_URL} download={APK_FILE} title="Download Android APK">
      <Download className={compact ? 'h-5 w-5' : 'h-4 w-4'} />
      {!compact && <span>Download Android APK</span>}
    </a>
  </Button>
);
