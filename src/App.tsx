import { useEffect } from 'react';
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "@/hooks/useAuth";
import QuotaBanner from "@/components/feature/QuotaBanner";

const THEME_KEY = 'viralboard_theme';

function App() {
  useEffect(() => {
    // Apply saved theme on initial load
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <BrowserRouter basename={__BASE_PATH__}>
          <AppRoutes />
          <QuotaBanner />
        </BrowserRouter>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
