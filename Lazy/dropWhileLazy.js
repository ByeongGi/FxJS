import go1 from "../go1.js";
import curry from "../curry.js";
import toIter from "../toIter.js";
import noop from "../noop.js";
import nop from "../nop.js";
import flatLazy from "./flatLazy.js";

export default curry(function* dropWhileLazy(f, iter) {
  let prev = null, ok = false;
  iter = toIter(iter);
  for(const a of iter) {
    const cond = ok || go1(a, f);
    if (cond instanceof Promise) {
      cond.catch(noop);
      yield prev = (prev || Promise.resolve())
        .then(_ => cond)
        .then(c => (ok = !c) ? a : Promise.reject(nop));
      prev = prev.catch(noop);
    } else if (ok || (ok = !cond)) return yield* flatLazy([a, iter]);
  }
});