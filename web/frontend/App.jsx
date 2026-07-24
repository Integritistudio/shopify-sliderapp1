import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import { QueryProvider, PolarisProvider } from "./components";
import { AppearanceProvider } from "./contexts/appearance-context";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();

  return (
    <PolarisProvider>
      <BrowserRouter>
        <QueryProvider>
          <AppearanceProvider>
            <NavMenu>
              <a href="/" rel="home">
                Sliders
              </a>
              <a href="/appearance">Appearance</a>
              <a href="/pricing">Pricing</a>
              <a href="/setupguide">Guide</a>
            </NavMenu>
            <Routes pages={pages} />
          </AppearanceProvider>
        </QueryProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
