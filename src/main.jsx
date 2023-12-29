import Home from "@/components/Home";
import User from "@/components/User";
import Profile from "@/components/Profile";
import Post from "@/components/Post";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Route,
  Routes,
  HashRouter,
  Link,
} from "@/react-router-dom";
function App() {
  return (
    <HashRouter>
      <ul>
        <li>
          <Link to="/">首页</Link>
        </li>
        <li>
          <Link to="/user">用户管理</Link>
        </li>
        <li>
          <Link to="/profile">个人中心</Link>
        </li>
      </ul>
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
