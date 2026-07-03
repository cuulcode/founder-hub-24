import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();

/**
 * Auth redirect URL for OAuth flows.
 * On native (Android/iOS) uses custom scheme; on web uses current origin.
 */
export const getAuthRedirectUrl = (path = '/') => {
  if (isNative()) {
    return `app.lovable.394ea0a206c842e3bceaf8143da9f098://${path.replace(/^\//, '')}`;
  }
  return `${window.location.origin}${path}`;
};
