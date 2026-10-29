import { createBrowserRouter } from "react-router";
import Layout from "./components/layout/Layout";
import OnboardingPage from "./pages/OnboardingPage/OnboardingPage";
import SimulatorPage from "./pages/SimulatorPage/SimulatorPage";

const router = createBrowserRouter([
  { path: "/", element: <OnboardingPage /> },
  {
    element: <Layout />,
    children: [{ path: "/simulator", element: <SimulatorPage /> }],
  },
]);

export default router;
