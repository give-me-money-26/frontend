import { RouterProvider } from "react-router";
import useDefaultAssumptions from "./hooks/useDefaultAssumptions";
import router from "./router";

function App() {
  useDefaultAssumptions();
  return <RouterProvider router={router} />;
}

export default App;
