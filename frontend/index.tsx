import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FusionProvider } from './context/FusionContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <FusionProvider>
      <App />
    </FusionProvider>
  </React.StrictMode>
);