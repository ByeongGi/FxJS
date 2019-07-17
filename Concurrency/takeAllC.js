import toIter from "../Strict/toIter.js";
import go from "../Strict/go.js";
import map from "../Strict/map.js";
import rangeLazy from "../Lazy/rangeLazy.js";
import mapLazy from "../Lazy/mapLazy.js";
import takeUntilLazy from "../Lazy/takeUntilLazy.js";
import flat from "../Strict/flat.js";
import takeC from "./takeC.js";
import takeWhile from "../Strict/takeWhile.js";

export default function takeAllC(n, iter) {
  if (arguments.length == 1) return typeof n == 'number' ? _ => takeAllC(n, _) : takeC(Infinity, n);
  iter = toIter(iter);
  let closed = false;
  return go(
    rangeLazy(Infinity),
    mapLazy(_ => go(
      rangeLazy(n),
      mapLazy(_ => iter.next()),
      takeWhile(({done}) => !(closed = done)),
      map(({value}) => value))),
    takeUntilLazy(_ => closed),
    flat);
}