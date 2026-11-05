import { createBrowserRouter } from "react-router";
import Layout from "./components/layout/Layout";
import MapPage from "./pages/MapPage/MapPage";
import OnboardingPage from "./pages/OnboardingPage/OnboardingPage";
import SimulatorPage from "./pages/SimulatorPage/SimulatorPage";

const router = createBrowserRouter([
  { path: "/", element: <OnboardingPage /> },
  {
    element: <Layout />,
    children: [
      { path: "/map", element: <MapPage /> },
      { path: "/simulator", element: <SimulatorPage /> },
    ],
  },
]);

export default router;
