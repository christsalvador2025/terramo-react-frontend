import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n';
// import { Provider } from 'react-redux';
import ReduxProvider from "./lib/redux/provider";
import PersistAuth from './lib/redux/PersistAuth.tsx'
// import { store } from './app/store';
import App from './App.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider>
    <PersistAuth/>
    <App />
    </ReduxProvider>
  </StrictMode>,
)
 