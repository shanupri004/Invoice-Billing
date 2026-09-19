import React, { createContext, useContext } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from '../localization/LanguageContext';

const TAMIL_FONT_SCALE = 0.85;

const FontScaleContext = createContext(null);

export function NoFontScale({ children }) {
  return (
    <FontScaleContext.Provider value={1}>{children}</FontScaleContext.Provider>
  );
}

export default function AppText({ style, ...props }) {
  const { language } = useTranslation();
  const override = useContext(FontScaleContext);
  const scale = override ?? (language === 'ta' ? TAMIL_FONT_SCALE : 1);

  if (scale === 1) {
    return <Text style={style} {...props} />;
  }

  const flattened = StyleSheet.flatten(style) || {};
  const scaledStyle =
    typeof flattened.fontSize === 'number'
      ? { ...flattened, fontSize: flattened.fontSize * scale }
      : flattened;

  return <Text style={scaledStyle} {...props} />;
}
