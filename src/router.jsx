import { createBrowserRouter } from "react-router";
import Layout from "./components/layout/Layout";
import DetailPage from "./pages/DetailPage/DetailPage";
import SimulatorPage from "./pages/SimulatorPage/SimulatorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <SimulatorPage /> },
      { path: "revenue", element: <DetailPage key="revenue" /> },
      { path: "environment", element: <DetailPage key="environment" initialView="environment" /> },
    ],
  },
]);

export default router;
