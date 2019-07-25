import rejectLazy from "./rejectLazy.js";
import curry2 from "../Strict/curry2.js";
import some from "../Strict/some.js";

export default curry2(function differenceWithLazy(f, iter1, iter2) {
  return rejectLazy(a => some(b => f(a, b), iter2), iter1);
});