import curry from "./curry.js";
import takeAll from "./takeAll.js";
import removeLazy from "../Lazy/removeLazy.js";

export default curry(function remove(start, count, iter) {
  if (iter === undefined) return remove(start, 1, count);
  if (start < 0) {
    iter = Array.from(iter);
    start += iter.length;
  }
  return takeAll(removeLazy(start, count, iter));
});