import './utils/exception.js';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n';
import { Analytics } from '@vercel/analytics/react';
import { isBrowserExtension } from './utils/utils.js';

createRoot(document.getElementById('root')).render(
  <>
    <App />
    {!isBrowserExtension ? <Analytics /> : null}
  </>
);
