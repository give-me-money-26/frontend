import { createBrowserRouter } from "react-router";
import Layout from "./components/layout/Layout";
import OnboardingPage from "./pages/OnboardingPage/OnboardingPage";
import MapPage from "./pages/MapPage/MapPage";
import SimulatorPage from "./pages/SimulatorPage/SimulatorPage";
import DetailPage from "./pages/DetailPage/DetailPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";

const router = createBrowserRouter([
  { path: "/", element: <OnboardingPage /> },
  {
    element: <Layout />,
    children: [
      { path: "map", element: <MapPage /> },
      { path: "simulator", element: <SimulatorPage /> },
      { path: "revenue", element: <DetailPage key="revenue" /> },
      {
        path: "environment",
        element: <DetailPage key="environment" initialView="environment" />,
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
