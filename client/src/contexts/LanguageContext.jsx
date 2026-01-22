import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        // Load from local storage or default to browser language
        const savedLang = localStorage.getItem('talklink_language');
        if (savedLang) {
            setLanguage(savedLang);
        } else {
            const browserLang = navigator.language.startsWith('ko') ? 'ko' : 'en';
            setLanguage(browserLang);
        }
    }, []);

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('talklink_language', lang);
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
