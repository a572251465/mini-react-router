import { assign, isObject } from "@/shared";

/**
 * 用来创建一个hash 模式的history
 *
 * @author lihh
 */
export function createHashHistory() {
  // 定义一个栈 用来存在历史记录
  const stack = [];
  // 表示当前索引的位置
  let index = -1;
  // 表示触发的动作 有默认值
  let action = "POP";
  // 表示当前的状态
  let state;
  // 表示存放监听函数的数组
  let listeners = [];
  // 表示返回的历史对象
  const history = {};

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
   * push 添加一个新的记录
   *
   * @author lihh
   * @param pathnameInfo 添加path信息
   * @param nextState 添加的状态
   */
  function push(pathnameInfo, nextState) {
    action = "PUSH";
    let pathname;

    if (isObject(pathnameInfo)) {
      state = pathnameInfo.state;
      pathname = pathnameInfo.pathname;
    } else {
      pathname = pathnameInfo;
      state = nextState;
    }

    // 修改浏览器的hash值
    window.location.hash = pathname;
  }

  /**
   * 跳转 浏览器的指定记录
   *
   * @author lihh
   * @param n 跳转指定步骤
   */
  function go(n) {
    action = "POP";
    index += n;

    // 拿到指定的location记录
    const nextLocation = stack[index];
    // 更新状态
    state = nextLocation.state;
    // 更新浏览器的hash值
    window.location.hash = nextLocation.pathname;
  }

  /**
   * 浏览器向前一步
   *
   * @author lihh
   */
  function goBack() {
    go(-1);
  }

  /**
   * 浏览器向后一步
   *
   * @author lihh
   */
  function goForward() {
    go(1);
  }

  /**
   * 当hash值 发生变化的时候 触发该事件
   *
   * @author lihh
   */
  function handleHashChange() {
    // 此时获取最新的pathname
    const pathname = window.location.hash.slice(1);
    // 更新历史对象的 action
    history.action = action;

    // 构建新的location
    const location = { pathname, state };
    history.location = location;

    // 如果是PUSH的动作，直接给历史栈中添加记录
    if (action === "PUSH") stack[++index] = location;
    // 通知所有监听器
    listeners.forEach((listener) => {
      listener({
        action,
        location,
      });
    });
  }

  // 监听 hashchange 事件
  window.addEventListener("hashchange", handleHashChange);

  // 初始化历史对象
  if (window.location.hash) {
    action = "PUSH";
    handleHashChange();
  } else {
    window.location.hash = "/";
  }

  return assign({}, history, {
    action: "POP",
    go,
    goBack,
    goForward,
    push,
    listen,
    location: {
      pathname: undefined,
      state: undefined,
    },
  });
}
