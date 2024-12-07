import './utils/exception.js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n';
import { Analytics } from '@vercel/analytics/react';

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Analytics />
  </>
);
