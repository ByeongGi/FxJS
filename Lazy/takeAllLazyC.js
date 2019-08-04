import toIter from "../Strict/toIter.js";
import go from "../Strict/go.js";
import rangeLazy from "../Lazy/rangeLazy.js";
import mapLazy from "../Lazy/mapLazy.js";
import takeUntilLazy from "../Lazy/takeUntilLazy.js";
import reject from "../Strict/reject.js";
import flatMapLazy from "../Lazy/flatMapLazy.js";
import catchNoopIter from "../.internal/catchNoopIter.js";

export default function takeAllLazyC(n, iter) {
  if (arguments.length == 1) return typeof n == 'number' ? _ => takeAllLazyC(n, _) : n;
  if (n == Infinity) return iter;

  iter = toIter(iter);
  return go(
    rangeLazy(Infinity),
    mapLazy(_ => go(
      rangeLazy(n),
      mapLazy(_ => iter.next()),
      reject(a => a.done),
      catchNoopIter
    )),
    takeUntilLazy(a => a.length < n),
    flatMapLazy(mapLazy(a => a.value)));
}