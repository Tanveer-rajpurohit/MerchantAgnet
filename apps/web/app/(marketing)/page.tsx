import LoadingScreen from "../components/LoadingScreen";
import Navbar from "../components/Navbar";
import { LandingPage } from "../components/home";
import SmoothScroll from "../components/SmoothScroll";

export default function Page() {
  return (
    <SmoothScroll>
      <div className="relative min-h-screen bg-bg text-primary selection:bg-brand selection:text-white overflow-x-clip">
        <Navbar />
        <main className="overflow-x-clip">
          <LandingPage />
        </main>
        <LoadingScreen />
      </div>
    </SmoothScroll>
  );
}
