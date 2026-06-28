/**
 * main.jsx — React entry point
 *
 * NOTE: StrictMode is intentionally omitted.
 * React StrictMode runs effects twice in development, which would double-init
 * the dataStream.js interval (the guard prevents a crash, but you'd see a
 * warning on every hot-reload). For a streaming telemetry app we skip it.
 * You can re-enable it once the stream control is fully hooked up.
 */
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
