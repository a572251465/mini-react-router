import React from "react";
import { Router, useLocation, useNavigate } from "@/react-router";
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

/**
 * 编写 link组件
 *
 * @author lihh
 * @param to 跳转的位置
 * @param children 显示的子元素
 * @return {JSX.Element}
 * @constructor
 */
export function Link({ to, children, ...rest }) {
  const navigate = useNavigate();
  return (
    <a
      {...rest}
      href={to}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

/**
 * 实现NavLink 导航，其实就是有选中状态的导航
 *
 * @author lihh
 * @param classNameProp className 样式
 * @param end 是否要匹配到结束
 * @param styleProp style 样式属性
 * @param to 要跳转到哪里去
 * @param children 子类
 * @param rest 其余的参数
 * @constructor
 */
export function NavLink({
  className: classNameProp,
  end = false,
  style: styleProp = {},
  to,
  children,
  ...rest
}) {
  // 拿到此时路由信息
  const location = useLocation();
  // 设置要跳转到的位置
  const path = { pathname: to };

  // 此时浏览器的 对应的path
  const locationPathname = location.pathname;
  const toPathname = path.pathname;

  // 意味着什么是激活状态. 1. 完全匹配的状态肯定是激活的状态 2. 不需要完全匹配，但是匹配前缀时，匹配结束后一定后面跟着一个/ 符号
  const isActive =
    locationPathname === toPathname ||
    (!end &&
      locationPathname.startsWith(toPathname) &&
      locationPathname.charAt(toPathname.length) === "/");

  let className;
  if (typeof classNameProp === "function")
    className = classNameProp({ isActive });
  let style;
  if (typeof styleProp === "function") style = styleProp({ isActive });

  return (
    <Link to={to} className={className} style={style} {...rest}>
      {children}
    </Link>
  );
}
