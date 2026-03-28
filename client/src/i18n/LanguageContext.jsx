import { createContext, useContext, useMemo, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext(null);

function getNestedValue(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem("educonnect-language") || "en");

  const value = useMemo(() => {
    const dictionary = translations[language] || translations.en;

    return {
      language,
      setLanguage: (nextLanguage) => {
        localStorage.setItem("educonnect-language", nextLanguage);
        setLanguageState(nextLanguage);
      },
      t: (path) => getNestedValue(dictionary, path) ?? getNestedValue(translations.en, path) ?? path,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }

  return context;
}
