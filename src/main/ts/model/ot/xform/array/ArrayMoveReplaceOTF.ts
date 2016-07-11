import OperationTransformationFunction from "../OperationTransformationFunction";
import OperationPair from "../OperationPair";
import ArrayMoveOperation from "../../ops/ArrayMoveOperation";
import {ArrayMoveHelper} from "./ArrayMoveHelper";
import {MoveDirection} from "./ArrayMoveHelper";
import {RangeIndexRelationship} from "../../util/RangeRelationshipUtil";
import ArrayReplaceOperation from "../../ops/ArrayReplaceOperation";


export default class ArrayMoveReplaceOTF implements OperationTransformationFunction<ArrayMoveOperation, ArrayReplaceOperation> {
  transform(s: ArrayMoveOperation, c: ArrayReplaceOperation): OperationPair {
    switch (ArrayMoveHelper.getMoveDirection(s)) {
      case MoveDirection.Forward:
        return this.transformAgainstForwardMove(s, c);
      case MoveDirection.Backward:
        return this.transformAgainstBackwardMove(s, c);
      case MoveDirection.Identity:
        return this.transformAgainstIdentityMove(s, c);
      default:
        throw new Error("Invalid move direction");
    }
  }

  private transformAgainstForwardMove(s: ArrayMoveOperation, c: ArrayReplaceOperation): OperationPair {
    switch (ArrayMoveHelper.getRangeIndexRelationship(s, c.index)) {
      case RangeIndexRelationship.Before:
      case RangeIndexRelationship.After:
        // A-MP-1 and A-MP-5
        return new OperationPair(s, c);
      case RangeIndexRelationship.Start:
        // A-MP-2
        return new OperationPair(s, c.copy({index: s.toIndex}));
      case RangeIndexRelationship.Within:
      case RangeIndexRelationship.End:
        // A-MP-3 and A-MP-4
        return new OperationPair(s, c.copy({index: c.index - 1}));
      default:
        throw new Error("Invalid range-index relationship");
    }
  }

  private transformAgainstBackwardMove(s: ArrayMoveOperation, c: ArrayReplaceOperation): OperationPair {
    switch (ArrayMoveHelper.getRangeIndexRelationship(s, c.index)) {
      case RangeIndexRelationship.Before:
      case RangeIndexRelationship.After:
        // A-MP-6 and A-MP-10
        return new OperationPair(s, c);
      case RangeIndexRelationship.End:
        // A-MP-7
        return new OperationPair(s, c.copy({index: s.toIndex}));
      case RangeIndexRelationship.Start:
      case RangeIndexRelationship.Within:
        // A-MP-8 and A-MP-9
        return new OperationPair(s, c.copy({index: c.index + 1}));
      default:
        throw new Error("Invalid range-index relationship");
    }
  }

  private transformAgainstIdentityMove(s: ArrayMoveOperation, c: ArrayReplaceOperation): OperationPair {
    // A-MP-11, A-MP-12, A-MP-13
    return new OperationPair(s, c);
  }
}