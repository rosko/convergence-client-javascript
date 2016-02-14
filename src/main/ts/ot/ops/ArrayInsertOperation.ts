import Immutable from "../../util/Immutable";
import DiscreteOperation from "./DiscreteOperation";
import {Path} from "../Path";
import OperationType from "../../protocol/model/OperationType";

export default class ArrayInsertOperation extends DiscreteOperation {

  constructor(path: Path, noOp: boolean, public index: number, public value: any) {
    super(OperationType.ARRAY_INSERT, path, noOp);
    Object.freeze(this);
  }

  copy(updates: any): ArrayInsertOperation {
    return new ArrayInsertOperation(
      Immutable.update(this.path, updates.path),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value));
  }
}
