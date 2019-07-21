import toIter from "../Strict/toIter.js";

export default function* zipIndexs(iter) {
  let i = -1;
  for (const a of toIter(iter)) yield [++i, a];
};