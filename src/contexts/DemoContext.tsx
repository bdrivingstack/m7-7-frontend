import { createContext, useContext, type ReactNode } from "react";

interface DemoContextValue {
  isDemo: true;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  return (
    <DemoContext.Provider value={{ isDemo: true }}>
      {children}
    </DemoContext.Provider>
  );
}

// Retourne null hors DemoProvider (/app/*, /admin/*) → mode réel
// Retourne { isDemo: true } dans /demo/* → mode démo
export function useDemo() {
  return useContext(DemoContext);
}
