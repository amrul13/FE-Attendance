import AppRoutes from "./routes";
import { Toaster } from "sonner";


function App() {
  return (
    <div className="justify-center">
      <AppRoutes />
      <Toaster />
    </div>
  );
}

export default App;
