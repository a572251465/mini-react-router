import Home from "@/components/Home";
import User from "@/components/User";
import Profile from "@/components/Profile";
import Post from "@/components/Post";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, HashRouter } from "@/react-router-dom";
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user" element={<User />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/post/:id" element={<Post />} />
      </Routes>
    </HashRouter>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
