import { isMobileApp } from "@/constants/ui";
import { StatusBar, Style as StatusBarStyle } from "@capacitor/status-bar";
import { createContext, useContext, useEffect, useState } from "react";
import { THEME_STORAGE_KEY_NAME } from "./constants";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
const handleThemeChange = (theme:Theme) => {
  
  const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const mediaQuery=window.matchMedia("(prefers-color-scheme: dark)")
      const systemTheme = mediaQuery.matches ? "dark" : "light";
       

      root.classList.add(systemTheme);
      
    }else{    
    root.classList.add(theme);
    }
  if(isMobileApp){
  let isDark;
  if(theme==='system'){
    isDark= window.matchMedia("(prefers-color-scheme: dark)")
    .matches
  
  } else {
    isDark=theme==='dark'
  }
  
  Promise.all([StatusBar.setStyle({
    style: isDark ? StatusBarStyle.Dark : StatusBarStyle.Light,
  }),StatusBar.setBackgroundColor({color:isDark ? "#000000" : "#FFFFFF"})]).catch(() => {});
}
};
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = THEME_STORAGE_KEY_NAME,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    handleThemeChange(theme);
    if(theme==='system'){
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      
      const handler = (e: MediaQueryListEvent) => handleThemeChange(e.matches ? "dark" : "light");
      mediaQuery.addEventListener("change", handler);

      return () => {
        mediaQuery.removeEventListener("change", handler);
      };
    }
  }, [theme]);
 
  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      document.cookie = `${storageKey}=${theme}; path=/`;
      handleThemeChange(theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
