import intersectionByLazy from '../Lazy/intersectionByLazy.js';
import curry2 from './curry2.js';
import takeAll from './takeAll.js';

export default curry2(function intersectionBy(f, b, a) {
  return takeAll(intersectionByLazy(f, b, a))
});