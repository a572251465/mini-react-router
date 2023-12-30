import React from "react";
// 导航上下文
const NavigationContext = React.createContext({});
// 位置上下文
const LocationContext = React.createContext({});
const RouteContext = React.createContext({});
// 导出指定的对象
export { NavigationContext, LocationContext };

const isSplat = (s) => s === "*";
const splatPenalty = -2;
const indexRouteValue = 2;
const paramRe = /^:\w+$/;
const dynamicSegmentValue = 3;
const emptySegmentValue = 1;
const staticSegmentValue = 10;
function computeScore(path, index) {
  let segments = path.split("/");
  let initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }
  if (index) {
    initialScore += indexRouteValue;
  }
  return segments
    .filter((s) => !isSplat(s))
    .reduce((score, segment) => {
      return (
        score +
        (paramRe.test(segment)
          ? dynamicSegmentValue
          : segment === ""
            ? emptySegmentValue
            : staticSegmentValue)
      );
    }, initialScore);
}
function rankRouteBranches(branches) {
  branches.sort((a, b) => {
    return a.score !== b.score
      ? b.score - a.score
      : compareIndexes(
          a.routeMetas.map((meta) => meta.childrenIndex),
          b.routeMetas.map((meta) => meta.childrenIndex),
        );
  });
}
function compareIndexes(a, b) {
  let sibling =
    a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]);
  return sibling ? a[a.length - 1] - b[b.length - 1] : 0;
}

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
 * 通过自定的hook 拿到navigate
 *
 * @return {(function(*): void)|*}
 */
export function useNavigate() {
  const { navigator } = React.useContext(NavigationContext);
  const navigate = React.useCallback(
    (to) => {
      navigator.push(to);
    },
    [navigator],
  );

  return navigate;
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
  // 当location pathname 发生变化后，会重新进行渲染，通过location 拿到最新的pathname
  const location = useLocation();
  // 如果pathname 在第一次的时候默认是undefined，就是初始化为/
  const pathname = initPathname(location.pathname);

  // routes 此时这个结构是：{path: xxx, element: xxx, children: xxx[]}
  // pathname 就是url中实际的地址
  const matches = matchRoutes(routes, pathname);
  return _renderMatches(matches);
}

/**
 * 渲染的 match
 *
 * @author lihh
 * @param matches 拿到的matches
 * @return {*|null}
 * @private
 */
function _renderMatches(matches) {
  // 判断是否为空
  if (!matches) {
    return null;
  }

  // 从右侧依次开始渲染
  // 此时渲染出来的是最左侧的节点，为什么从右侧开始遍历呢，只是将右侧的内容作为下一个outlet了
  // 但是此时出来的是最左侧的内容
  return matches.reduceRight(
    (outlet, match, index) => (
      <RouteContext.Provider
        value={{ outlet, matches: matches.slice(0, index + 1) }}
      >
        {match.route.element}
      </RouteContext.Provider>
    ),
    null,
  );
}

/**
 * match 到routes
 *
 * @author lihh
 * @param routes 总的routes
 * @param pathname 访问的真实pathname
 */
function matchRoutes(routes, pathname) {
  // 因为访问的url有任何可能性，所以这个目的就是展平url
  const branches = flattenRoutes(routes);
  // 进行加分排序 ，通过莫名的加分 进行排序，最大的原则是：越长 分数越高
  rankRouteBranches(branches);

  let matches = null;
  for (let i = 0; matches == null && i < branches.length; i++) {
    // 根据pathname 开始match
    matches = matchRouteBranch(branches[i], pathname);
  }
  return matches;
}

/**
 * 匹配路由的分支
 *
 * @author lihh
 * @param branch 每个分支（每个扁平化的url 都可以称之为分支）
 * @param pathname 访问的path name
 */
function matchRouteBranch(branch, pathname) {
  // routeMetas 本身是一个数组，但是上述内容我们提到过，对于有的url来说这是一个元素的数组，但是有的是两个元素的数组
  const { routeMetas } = branch;
  const matches = [];
  let matchedParams = {};
  let matchedPathname = "";

  for (let i = 0; i < routeMetas.length; i++) {
    // 拿到每个meta 的route
    const { route } = routeMetas[i];
    // 表示已经到最后了
    const end = i === routeMetas.length - 1;

    // 表示匹配到的内容【matchedPathname】 长度 之前的不要
    const remainingPathname = pathname.slice(matchedPathname.length);
    // 通过path 进行匹配
    const match = matchPath({ path: route.path, end }, remainingPathname);
    if (!match) return null;

    // match.params 表示拿到路径上的 RESTFUL 参数
    matchedParams = Object.assign({}, matchedParams, match.params);
    matches.push({ route, params: matchedParams });
    matchedPathname = joinPaths([matchedPathname, match.matchedPathname]);
  }

  return matches;
}

/**
 * 展平 routes
 *
 * @author lihh
 * @param routes 传递过来的route信息
 * @param branches 这种总信息
 * @param parentMetas 这是总的meta信息
 * @param parentPath 这是一个父类的path
 */
function flattenRoutes(
  routes,
  branches = [],
  parentMetas = [],
  parentPath = "",
) {
  routes.forEach((route, index) => {
    // 每个url 构成一个mate信息
    const routeMeta = { route, childrenIndex: index };
    // 将父类的path  以及自身的path 结合在一起
    const routePath = joinPaths([parentPath, routeMeta.route.path]);
    // 将父类的meta信息 以及子类的信息绑定到一起去（越靠左，越大）
    const routeMetas = [...parentMetas, routeMeta];
    if (route.children)
      // 如果存在儿子的话，展平儿子。branches 表示所有的分支
      // routeMetas 一个纵向级别的信息  例如：/user /list 等
      flattenRoutes(route.children, branches, routeMetas, routePath);

    // 将所有的内容扁平化后，放到此数组中
    // 对于每个url来说都可以构成一个分支，有的分支只有一个元素，但是有的分支有两个元素，例如：父子  route
    branches.push({
      routePath,
      routeMetas,
      score: computeScore(routePath, route.index),
    });
  });

  return branches;
}

/**
 * 将多个path 以特定的符号进行拼接
 *
 * @author lihh
 * @param paths 多个path
 */
function joinPaths(paths) {
  return paths.join("/").replace(/\/+/g, "/");
}

/**
 * 编译 path, 将path 转换为正则
 *
 * @author lihh
 * @param path 访问的path
 * @param end 表示是否匹配到最后
 */
function compilePath(path, end) {
  // 此变量就是为了收集 path 后面的 [:参数]的
  const paramNames = [];
  let regexpSource =
    "^" +
    path
      .replace(/:(\w+)/g, (_, key) => {
        // 好比 收集的是 :id 的值
        paramNames.push(key);
        // 替换为 包含分组的任意字符
        return "([^\\/]+)";
      })
      .replace(/^\/*/, "/");

  // 是否匹配到最后
  if (end) regexpSource += "\\/*$";

  // 针对* 做一个特殊的处理
  if (path === "*") regexpSource = ".*";
  const matcher = new RegExp(regexpSource);
  return [matcher, paramNames];
}

/**
 * 匹配path
 *
 * @author lihh
 * @param path route中的path
 * @param end 表示是否匹配到最后
 * @param pathname 以及匹配的pathname 是location中的pathname
 */
export function matchPath({ path, end }, pathname) {
  const [matcher, paramNames] = compilePath(path, end);
  // 拿到分组的值
  const match = pathname.match(matcher);
  if (!match) return null;

  const [matchedPathname, ...values] = match;
  // 此时的变量【paramNames】 保存的是  包含key 的数组
  // values 是解析的值  此值跟上述的内容 是一一对应起来的 其实就是所谓的{id: 100}等
  const params = paramNames.reduce((memo, paramName, index) => {
    memo[paramName] = values[index];
    return memo;
  }, {});
  return { params, matchedPathname };
}

/**
 * 导出出口方法
 *
 * @author lihh
 * @return {null}
 * @constructor
 */
export function Outlet() {
  return useOutlet();
}

/**
 * 自定义hook 为了渲染出口
 *
 * @author lihh
 * @return {React.ReactElement}
 */
export function useOutlet() {
  const outlet = React.useContext(RouteContext).outlet;
  return outlet;
}

/**
 * 导出当前路由下的params
 *
 * @author lihh
 * @return {null}
 */
export function useParams() {
  const { matches } = React.useContext(RouteContext);
  return matches[matches.length - 1].params;
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
  // 有可能是嵌套路由，也就是孩子套孩子
  React.Children.forEach(children, (element) => {
    const route = {
      // 表示跳转的path
      path: element.props.path,
      // 表示渲染的子元素
      element: element.props.element,
    };

    // 如果内部存在孩子的话 递归处理
    if (element.props.children)
      route.children = createRoutesFromChildren(element.props.children);

    routes.push(route);
  });

  return routes;
}

/**
 * 导出一个重定向的组件
 *
 * @author lihh
 * @param to 到哪里去
 * @constructor
 */
export function Navigate({ to }) {
  const navigate = useNavigate();
  React.useLayoutEffect(() => {
    navigate(to);
  }, []);
  return null;
}
