import OperationTransformationFunction from "../OperationTransformationFunction";
import OperationPair from "../OperationPair";
import ArrayInsertOperation from "../../ops/ArrayInsertOperation";
import ArrayRemoveOperation from "../../ops/ArrayRemoveOperation";

export default class ArrayInsertRemoveOTF implements OperationTransformationFunction<ArrayInsertOperation, ArrayRemoveOperation> {
  transform(s: ArrayInsertOperation, c: ArrayRemoveOperation): OperationPair {
    if (s.index <= c.index) {
      // A-IR-1 and A-IR-2
      return new OperationPair(s, c.copy({index: c.index + 1}));
    } else {
      // A-IR-3
      return new OperationPair(s.copy({index: s.index - 1}), c);
    }
  }
}