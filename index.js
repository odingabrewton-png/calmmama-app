import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import React from 'react';

import App from './App';
import ErrorBoundary from './ErrorBoundary';

function installWebFatalErrorReporter() {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const mountOverlay = (error, details) => {
    const root = document.getElementById('root');
    if (!root || root.dataset.villageFatalError === '1') return;

    const message = error?.message || String(error || 'Unknown error');
    const stack = error?.stack || details || '';
    root.dataset.villageFatalError = '1';

    root.innerHTML = `
      <div style="min-height:100vh;padding:24px;background:#BAC6BC;color:#2A382E;font-family:Georgia,serif;">
        <p style="font-size:10px;font-weight:800;letter-spacing:1px;color:#6B5588;margin:0 0 8px;">CALMMAMA VILLAGE · RUNTIME ERROR</p>
        <h1 style="font-size:20px;margin:0 0 10px;">The village hit an unexpected snag</h1>
        <p style="font-size:12px;line-height:18px;margin:0 0 16px;">This fallback appears for errors outside React render (effects, async handlers). Screenshot for debugging.</p>
        <pre style="white-space:pre-wrap;background:rgba(255,252,248,0.9);padding:14px;border-radius:12px;font-size:12px;color:#A35338;">${message}</pre>
        ${stack ? `<pre style="white-space:pre-wrap;background:rgba(255,252,248,0.9);padding:14px;border-radius:12px;font-size:10px;margin-top:12px;color:#3D5246;">${stack}</pre>` : ''}
        <button type="button" onclick="window.location.reload()" style="margin-top:16px;background:#5C7A68;color:#fff;border:none;border-radius:12px;padding:12px 18px;font-weight:800;cursor:pointer;">Reload village</button>
      </div>
    `;
  };

  window.addEventListener('error', (event) => {
    mountOverlay(event.error, event.error?.stack);
  });

  window.addEventListener('unhandledrejection', (event) => {
    mountOverlay(event.reason, event.reason?.stack);
  });
}

installWebFatalErrorReporter();

function Root() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

registerRootComponent(Root);
