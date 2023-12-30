import React from "react";
import { useNavigate } from "@/react-router-dom";
import { UserAPI } from "@/utils";

export default function UserAdd() {
  const nameRef = React.useRef();
  const navigate = useNavigate();
  function handleSubmit(event) {
    event.preventDefault();
    const name = nameRef.current.value;
    UserAPI.add({ id: Date.now() + "", name });
    navigate("/user/list");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" ref={nameRef} />
      <button type="submit">添加</button>
    </form>
  );
}
