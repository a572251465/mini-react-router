import React from "react";
import { Router } from "@/react-router";
import { createHashHistory, createBrowserHistory } from "@/history";
import { isNullOrUndefined } from "@/shared";

// 导出react-router
export * from "@/react-router";

/**
 * 导出 hash router
 *
 * @author lihh
 * @param children 子类 children  拿到子元素的children属性
 * @constructor
 */
export function HashRouter({ children }) {
  // 使用useRef对象创建一个可变的ref对象，用于存储历史对象的引用
  const historyRef = React.useRef();
  // 判断是否包含 history引用
  if (isNullOrUndefined(historyRef.current))
    historyRef.current = createHashHistory();

  // 获取当前的历史对象
  const history = historyRef.current;

  // 使用useState创建一个状态，存储当前的动作和位置
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });

  // 当history发生变化的时候 重新更新状态
  React.useEffect(() => history.listen(setState), [history]);

  return (
    <Router
      children={children}
      location={state.location}
      navigator={history}
      navigationType={state.action}
    />
  );
}

/**
 * 导出 history router
 *
 * @author lihh
 * @param children 子类 children
 * @constructor
 */
export function BrowserRouter({ children }) {
  // 使用useRef对象创建一个可变的ref对象，用于存储历史对象的引用
  const historyRef = React.useRef();
  // 判断是否包含 history引用
  if (isNullOrUndefined(historyRef.current))
    historyRef.current = createBrowserHistory();

  // 获取当前的历史对象
  const history = historyRef.current;

  // 使用useState创建一个状态，存储当前的动作和位置
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });

  // 当history发生变化的时候 重新更新状态
  React.useEffect(() => history.listen(setState), [history]);

  return (
    <Router
      children={children}
      location={state.location}
      navigator={history}
      navigationType={state.action}
    />
  );
}
