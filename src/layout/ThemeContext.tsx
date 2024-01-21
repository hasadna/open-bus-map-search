// ThemeContext.js
import React, { FC, PropsWithChildren, createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ConfigProvider, theme } from 'antd';
import heIL from 'antd/es/locale/he_IL';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from 'src/locale/useLocalStorage';

export interface ThemeContextInterface {
  toggleTheme: () => void;
  isDarkTheme: boolean;
}

const ThemeContext = createContext({} as ThemeContextInterface);

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

const { defaultAlgorithm, darkAlgorithm } = theme;

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {

  const { setItem, getItem } = useLocalStorage('isDarkTheme');

  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    // Read the dark theme preference from localStorage or default to false
    return getItem() === 'true' || false;
  });

  const { i18n } = useTranslation();

  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => {
      const newTheme = !prevTheme;
      // Save the dark theme preference to localStorage
      setItem(String(newTheme));
      return newTheme;
    });
  };

  const contextValue = {
    isDarkTheme,
    toggleTheme,
  };

  // Read the dark theme preference from localStorage when the component mounts
  useEffect(() => {
    const storedTheme = getItem() === 'true';
    setIsDarkTheme(storedTheme || false);
  }, []);

  return (
    <ConfigProvider
      direction={i18n.dir()}
      locale={heIL}
      theme={{
        algorithm: isDarkTheme ? darkAlgorithm : defaultAlgorithm,
      }}>
      <MuiThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
        <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
      </MuiThemeProvider>
    </ConfigProvider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};