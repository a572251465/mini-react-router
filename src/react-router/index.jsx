import React from "react";
// 导航上下文
const NavigationContext = React.createContext({});
// 位置上下文
const LocationContext = React.createContext({});
// 导出指定的对象
export { NavigationContext, LocationContext };

/**
 * 导出router 组件
 *
 * @author lihh
 * @param children 子元素 children
 * @param location 表示位置信息
 * @param navigator 表示导航信息
 * @constructor
 */
export function Router({ children, location, navigator }) {
  // 使用useMemo 创建导航上下文
  const navigationContext = React.useMemo(() => ({ navigator }), [navigator]);
  // 使用useMemo 创建路径上下文
  const locationContext = React.useMemo(() => ({ location }), [location]);

  return (
    <NavigationContext.Provider value={navigationContext}>
      <LocationContext.Provider
        value={locationContext}
        children={children}
      ></LocationContext.Provider>
    </NavigationContext.Provider>
  );
}

// 定义Route函数组件（空实现）
export function Route(props) {}

/**
 * 表示 routes 组件
 *
 * @author lihh
 * @param children 表示子组件
 * @constructor
 */
export function Routes({ children }) {
  return useRoutes(createRoutesFromChildren(children));
}

/**
 * 自定义的hook 用来获取location
 *
 * @author lihh
 * @return {*}
 */
export function useLocation() {
  return React.useContext(LocationContext).location;
}

/**
 * 自定义hook 通过该方法获取path上的 params
 *
 * @author lihh
 */
export function useSearchParams() {
  // 通过hook 拿到location
  const location = useLocation();
  const pathname = location.pathname;

  return new URLSearchParams(pathname.split("?")[1]);
}

/**
 * 初始化 pathname
 *
 * @author lihh
 * @param pathname 访问的pathname
 */
function initPathname(pathname) {
  return pathname || "/";
}

/**
 * 格式匹配 element
 *
 * @author lihh
 * @param routes 路由routes
 */
export function useRoutes(routes) {
  // 表示当前定位的位置
  const location = useLocation();
  const pathname = initPathname(location.pathname);

  // 遍历路由数组 匹配当前路径
  for (const route of routes) {
    const { path, element } = route;

    // 匹配到 path
    // 此时的属性【pathname】 是当前window的location中访问的url
    // 此时的属性【path】 是自定义标签的route的 path属性
    // 通过匹配path 定位到某个组件
    const match = matchPath(path, pathname);
    if (match) return element;
  }

  return null;
}

/**
 * 编译 path, 将path 转换为正则
 *
 * @author lihh
 * @param path 访问的path
 */
function compilePath(path) {
  let regexpSource = "^" + path;
  regexpSource += "$";
  const matcher = new RegExp(regexpSource);
  return matcher;
}

/**
 * 匹配path
 *
 * @author lihh
 * @param path 访问的path
 * @param pathname 以及匹配的pathname
 */
export function matchPath(path, pathname) {
  const matcher = compilePath(path);
  const match = pathname.match(matcher);
  if (!match) return null;
  return match;
}

/**
 * 从children中 创建routes
 *
 * @author lihh
 * @param children 子元素
 */
export function createRoutesFromChildren(children) {
  const routes = [];
  // 使用react中api【React.Children】进行子元素的遍历
  React.Children.forEach(children, (element) => {
    const route = {
      // 表示跳转的path
      path: element.props.path,
      // 表示渲染的子元素
      element: element.props.element,
    };
    routes.push(route);
  });

  return routes;
}
