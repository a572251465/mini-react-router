import { isNullOrUndefined } from "@/shared/isNullOrUndefined";

/**
 * 判断是否是对象
 *
 * @author lihh
 * @param value 判断的值
 * @return {boolean} 返回的是否是对象
 */
export function isObject(value) {
  return !isNullOrUndefined(value) && typeof value === "object";
}
