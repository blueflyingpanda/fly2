import { AnimatePresence } from "framer-motion";
import { Suspense, lazy, useEffect, useState } from "react";
import { AirportsView } from "./components/AirportsView";
import { BottomNav, type Tab } from "./components/BottomNav";
import { ConvertView } from "./components/ConvertView";
import { DirectionsView } from "./components/DirectionsView";
import { Login } from "./components/Login";
import { PromoView } from "./components/PromoView";
import { SettingsView } from "./components/SettingsView";
import { TopBar } from "./components/TopBar";

// Stats pulls in the (heavy) charting lib — load it only when opened.
const StatsView = lazy(() =>
  import("./components/StatsView").then((m) => ({ default: m.StatsView }))
);
import { useAuth } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import { useLocale } from "./contexts/LocaleContext";
import { initTelegram } from "./core/telegram";
import { FullScreenSpinner, Spinner } from "./ui/Spinner";

function AppShell() {
  const [tab, setTab] = useState<Tab>("directions");
  const [airportsOpen, setAirportsOpen] = useState(false);
  const [statsTarget, setStatsTarget] = useState<{ src: string; dst: string } | null>(null);

  const openStats = (src: string, dst: string) => {
    setStatsTarget({ src, dst });
    setTab("stats");
  };

  let content: React.ReactNode;
  if (airportsOpen) {
    content = <AirportsView key="airports" onBack={() => setAirportsOpen(false)} />;
  } else {
    switch (tab) {
      case "directions":
        content = <DirectionsView key="directions" onOpenStats={openStats} />;
        break;
      case "stats":
        content = (
          <Suspense
            key="stats"
            fallback={
              <div className="flex justify-center py-24">
                <Spinner className="h-7 w-7" />
              </div>
            }
          >
            <StatsView initial={statsTarget} />
          </Suspense>
        );
        break;
      case "promo":
        content = <PromoView key="promo" />;
        break;
      case "convert":
        content = <ConvertView key="convert" />;
        break;
      case "settings":
        content = <SettingsView key="settings" onOpenAirports={() => setAirportsOpen(true)} />;
        break;
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <main>
        <AnimatePresence mode="wait">{content}</AnimatePresence>
      </main>
      {!airportsOpen && <BottomNav tab={tab} onChange={setTab} />}
    </div>
  );
}

export default function App() {
  const { status } = useAuth();
  const { t } = useLocale();

  useEffect(() => {
    initTelegram();
  }, []);

  if (status === "loading") return <FullScreenSpinner label={t.loading} />;
  if (status === "anonymous") return <Login />;

  return (
    <ChatProvider>
      <AppShell />
    </ChatProvider>
  );
}
