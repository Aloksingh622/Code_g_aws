import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, createBrowserRouter } from 'react-router'
import { Provider } from 'react-redux';
import { store } from './redux/store.js';
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from 'next-themes'; 

createRoot(document.getElementById('root')).render(
  <StrictMode >
    <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider attribute="class"> 
        <App />
      </ThemeProvider>
    </BrowserRouter>
    </Provider>
  </StrictMode>,
)
