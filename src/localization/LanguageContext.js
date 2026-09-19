import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en';
import ta from './ta';
import kn from './kn';
import te from './te';
import ml from './ml';
import hi from './hi';

const LANGUAGE_STORAGE_KEY = 'appLanguage';

const dictionaries = { en, ta, kn, te, ml, hi };

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: key => key,
});

const resolve = (dict, key) =>
  key.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), dict);

const interpolate = (str, vars) => {
  if (!vars) return str;
  return str.replace(/{{\s*(\w+)\s*}}/g, (match, name) =>
    vars[name] !== undefined ? String(vars[name]) : match,
  );
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved && dictionaries[saved]) {
          setLanguageState(saved);
        }
      } catch (err) {
        console.log('Failed to load language preference:', err);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setLanguage = async lang => {
    if (!dictionaries[lang]) return;
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (err) {
      console.log('Failed to persist language preference:', err);
    }
  };

  const t = useMemo(() => {
    return (key, vars) => {
      const dict = dictionaries[language] || dictionaries.en;
      let value = resolve(dict, key);
      if (value === undefined) {
        value = resolve(dictionaries.en, key);
      }
      if (value === undefined) return key;
      if (typeof value === 'string') return interpolate(value, vars);
      return value;
    };
  }, [language]);

  if (!ready) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
