// @/components/common/LanguageContext.tsx

"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Language = "en" | "am";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("jireh-language");
      const resolvedLanguage =
        savedLanguage === "en" || savedLanguage === "am"
          ? (savedLanguage as Language)
          : "en";
      document.documentElement.lang = resolvedLanguage;
      setLanguage(resolvedLanguage);
    }
  }, []);
  

  const updateLanguage = useCallback((newLanguage: Language) => {
    localStorage.setItem("jireh-language", newLanguage);
    document.documentElement.lang = newLanguage;
    setLanguage(newLanguage);
  }, []);

  if (language === null) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
