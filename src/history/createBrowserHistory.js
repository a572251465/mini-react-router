import { assign, isObject } from "@/shared";

/**
 * 创建 跟browser相关的history
 *
 * @author lihh
 */
export function createBrowserHistory() {
  // 拿到window上的history
  const globalHistory = window.history;

  // 定义状态变量
  let state;
  // 初始化监听器数组
  let listeners = [];

  // 初始化 history 对象
  let history = {
    action: "POP",
    location: {
      pathname: window.location.pathname,
      state: globalHistory.state,
    },
  };

  /**
   * 给数组中添加监听的函数
   *
   * @author lihh
   * @param listener 添加监听的函数
   * @return {(function(): void)|*} 此函数是去除一个副作用的函数
   */
  function listen(listener) {
    listeners.push(listener);
    return () => {
      // 返回一个函数，此函数为了剔除监听的listener
      listeners = listeners.filter((fn) => fn !== listener);
    };
  }

  /**
   * 跳转到浏览器记录的指定位置
   *
   * @author lihh
   * @param n 步数
   */
  function go(n) {
    globalHistory.go(n);
  }

  /**
   * 返回上一个历史记录
   *
   * @author lihh
   */
  function goBack() {
    go(-1);
  }

  /**
   * 前进一条历史记录
   *
   * @author lihh
   */
  function goForward() {
    go(1);
  }

  /**
   * 给历史栈中 添加一条记录
   *
   * @author lihh
   * @param pathnameInfo 跳转的path name
   * @param nextState 状态
   */
  function push(pathnameInfo, nextState) {
    const action = "PUSH";

    let pathname;
    // 判断是否是对象
    if (isObject(pathnameInfo)) {
      state = pathnameInfo.state;
      pathname = pathnameInfo.pathname;
    } else {
      pathname = pathnameInfo;
      state = nextState;
    }

    // 给原生的历史栈中添加数据
    globalHistory.pushState(state, null, pathname);
    // 构成一个location
    const location = { pathname, state };

    notify({ action, location });
  }

  // 点击浏览器的前进以及后退 从而触发该事件
  window.addEventListener("popstate", () => {
    const location = {
      state: globalHistory.state,
      pathname: window.location.pathname,
    };

    // 当通过浏览器 前进以及后退触发后  通知监听器
    notify({ action: "POP", location });
  });

  /**
   * 通过replace 替换当前的历史记录
   *
   * @author lihh
   * @param pathnameInfo 表示替换的信息
   * @param nextState 表示下一个形式的状态
   */
  function replace(pathnameInfo, nextState) {
    const action = "REPLACE";
    let pathname;

    if (isObject(pathnameInfo)) {
      state = pathnameInfo.state;
      pathname = pathnameInfo.pathname;
    } else {
      state = nextState;
      pathname = pathnameInfo;
    }

    globalHistory.replaceState(state, null, pathname);
    const location = { pathname, state };
    notify({ action, location });
  }

  /**
   * 通过所有的监听器 变化
   *
   * @author lihh
   * @param action 表示发生的动作
   * @param location 表示构成的位置 location
   */
  function notify({ action, location }) {
    history.action = action;
    history.location = location;
    history.length = globalHistory.length;
    listeners.forEach((listener) => {
      listener({ action, location });
    });
  }

  history = assign({}, history, {
    go,
    goBack,
    goForward,
    push,
    replace,
    listen,
  });
  return history;
}
