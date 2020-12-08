import { useRef } from "react";

export function useInitial<T>(val: T) {
  const { current } = useRef(val);
  return current;
}
