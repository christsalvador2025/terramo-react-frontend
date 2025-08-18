import React from "react";

export type YearContextValue = { year: number; setYear: (y: number) => void; years: number[] };

const YearContext = React.createContext<YearContextValue | undefined>(undefined);

export function YearProvider({ children }: { children: React.ReactNode }) {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = 2023; y <= currentYear; y++) years.unshift(y); // newest first
  const [year, setYear] = React.useState<number>(currentYear);
  const value = React.useMemo(() => ({ year, setYear, years }), [year, years]);
  return <YearContext.Provider value={value}>{children}</YearContext.Provider>;
}

export function useYear() {
  const ctx = React.useContext(YearContext);
  if (!ctx) throw new Error("useYear must be used inside <YearProvider>");
  return ctx;
}
