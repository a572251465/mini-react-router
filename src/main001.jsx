import Home from "@/components/Home";
import User from "@/components/User";
import Profile from "@/components/Profile";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, HashRouter } from "@/react-router-dom";
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user" element={<User />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </HashRouter>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
