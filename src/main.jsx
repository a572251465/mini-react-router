import Home from "@/components/Home";
import User from "@/components/User";
import Profile from "@/components/Profile";
import Post from "@/components/Post";
import UserAdd from "./components/UserAdd";
import UserList from "./components/UserList";
import UserDetail from "./components/UserDetail";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Route,
  Routes,
  HashRouter,
  Link,
  NavLink,
  Navigate,
} from "@/react-router-dom";

const activeStyle = { backgroundColor: "green" };
const activeClassName = "active";
const activeNavProps = {
  style: ({ isActive }) => (isActive ? activeStyle : {}),
  className: ({ isActive }) => (isActive ? activeClassName : ""),
};

function App() {
  return (
    <HashRouter>
      <ul>
        <li>
          <NavLink end={true} to="/" {...activeNavProps}>
            首页
          </NavLink>
        </li>
        <li>
          <NavLink to="/user" {...activeNavProps}>
            用户管理
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" {...activeNavProps}>
            个人中心
          </NavLink>
        </li>
      </ul>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user" element={<User />}>
          <Route path="add" element={<UserAdd />} />
          <Route path="list" element={<UserList />} />
          <Route path="detail/:id" element={<UserDetail />} />
        </Route>
        <Route path="/profile" element={<Profile />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
