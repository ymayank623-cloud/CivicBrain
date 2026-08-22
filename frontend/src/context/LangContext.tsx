import React, { createContext, useState, useContext, useEffect } from 'react';

type Lang = 'en' | 'hi';

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (en: string, hi: string) => string;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('civic_lang');
    if (saved === 'hi' || saved === 'en') {
      setLang(saved);
    }
  }, []);

  const toggleLang = () => {
    setLang(prev => {
      const newLang = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('civic_lang', newLang);
      return newLang;
    });
  };

  const t = (en: string, hi: string) => (lang === 'en' ? en : hi);

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang must be used within LangProvider");
  return context;
}
