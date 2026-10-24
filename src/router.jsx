import { createBrowserRouter } from "react-router";
import Layout from "./components/layout/Layout";
import SimulatorPage from "./pages/SimulatorPage/SimulatorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [{ index: true, element: <SimulatorPage /> }],
  },
]);

export default router;
