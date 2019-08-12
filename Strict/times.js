import timesLazy from "../Lazy/timesLazy.js";
import curry from "./curry.js";
import takeAll from "./takeAll.js";

export default curry(function times(f, n) {
  return takeAll(timesLazy(f, n));
});