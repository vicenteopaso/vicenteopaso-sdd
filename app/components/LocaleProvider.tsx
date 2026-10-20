"use client";

import { useParams, usePathname } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Locale } from "@/lib/i18n";
import { defaultLocale, locales } from "@/lib/i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function persistLocale(locale: Locale) {
  localStorage.setItem("preferred-locale", locale);
  document.cookie = `preferred-locale=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

function getLocaleFromPathname(pathname: string | null): Locale | null {
  const segment = pathname?.split("/").filter(Boolean)[0];
  return segment && locales.includes(segment as Locale)
    ? (segment as Locale)
    : null;
}

export function LocaleProvider({
  initialLocale = defaultLocale,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const params = useParams<{ lang?: string }>();
  const pathname = usePathname();
  const routeLocaleFromParams =
    params?.lang && locales.includes(params.lang as Locale)
      ? (params.lang as Locale)
      : null;
  const [locale, setLocaleState] = useState<Locale>(
    routeLocaleFromParams ?? initialLocale,
  );

  // On mount, persist the server-determined locale to storage and cookie
  useEffect(() => {
    persistLocale(routeLocaleFromParams ?? initialLocale);
  }, [initialLocale, routeLocaleFromParams]);

  useEffect(() => {
    const routeLocale = getLocaleFromPathname(pathname);
    if (!routeLocale) return;
    setLocaleState((currentLocale) => {
      if (currentLocale === routeLocale) return currentLocale;
      persistLocale(routeLocale);
      return routeLocale;
    });
  }, [pathname]);

  const setLocale = useCallback((newLocale: Locale) => {
    if (!locales.includes(newLocale)) return;
    setLocaleState(newLocale);
    persistLocale(newLocale);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    return { locale: defaultLocale, setLocale: () => {} };
  }
  return context;
}
