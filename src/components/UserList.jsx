import React from "react";
import { UserAPI } from "@/utils";
import { Link } from "@/react-router-dom";

export default function UserList() {
  const [users, setUsers] = React.useState([]);
  React.useEffect(() => {
    const users = UserAPI.list();
    setUsers(users);
  }, []);

  return (
    <ul>
      {users.map((user, index) => (
        <li key={index}>
          <Link to={`/user/detail/${user.id}`} state={user}>
            {user.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
