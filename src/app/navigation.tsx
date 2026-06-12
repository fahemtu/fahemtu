// Fahemtu — Produit 1 : routing minimal, typé, sans dépendance.
// Module autonome : un simple état de route en mémoire, pensé pour s'insérer
// plus tard dans un bundle plus large sans imposer de router global.

import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  NavigationContext,
  type NavigationValue,
  type Route,
} from "./navigation-context";

export function NavigationProvider({
  initialRoute = { name: "home" },
  children,
}: {
  initialRoute?: Route;
  children: ReactNode;
}) {
  const [route, setRoute] = useState<Route>(initialRoute);

  const navigate = useCallback((next: Route) => setRoute(next), []);
  const goHome = useCallback(() => setRoute({ name: "home" }), []);

  const value = useMemo<NavigationValue>(
    () => ({ route, navigate, goHome }),
    [route, navigate, goHome],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}
