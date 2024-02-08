import { FC, PropsWithChildren, createContext, useContext } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";
import { ConfigProvider, theme } from "antd";
import heIL from "antd/es/locale/he_IL";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "src/locale/useLocalStorage";

export interface ThemeContextInterface {
  toggleTheme: () => void;
  isDarkTheme?: boolean;
}

const ThemeContext = createContext({} as ThemeContextInterface);

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const { defaultAlgorithm, darkAlgorithm, compactAlgorithm } = theme;

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage<boolean>("isDarkTheme");

  const { i18n } = useTranslation();
  const toggleTheme = () => {
    setIsDarkTheme((prevTheme: boolean) => !prevTheme);
  };

  const contextValue = {
    isDarkTheme,
    toggleTheme,
  };

  return (
    <ConfigProvider
      direction={i18n.dir()}
      locale={heIL}
      theme={{
        algorithm: isDarkTheme ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorBgBase: isDarkTheme ? "#1c1d1c" : "#ffffff",
        },
      }}
    >
      <MuiThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
        <ScopedCssBaseline enableColorScheme>
          <ThemeContext.Provider value={contextValue}>
            {" "}
            {children}{" "}
          </ThemeContext.Provider>
        </ScopedCssBaseline>
      </MuiThemeProvider>
    </ConfigProvider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
