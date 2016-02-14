import OperationPair from "../OperationPair";
import OperationTransformationFunction from "../OperationTransformationFunction";
import StringRemoveOperation from "../../ops/StringRemoveOperation";
import {RangeRangeRelationship} from "../../util/RangeRelationshipUtil";
import {RangeRelationshipUtil} from "../../util/RangeRelationshipUtil";

export default class StringRemoveRemoveOTF implements OperationTransformationFunction<StringRemoveOperation, StringRemoveOperation> {
  transform(s: StringRemoveOperation, c: StringRemoveOperation): OperationPair {
    var cStart: number = c.index;
    var cEnd: number = c.index + c.value.length;

    var sStart: number = s.index;
    var sEnd: number = s.index + s.value.length;

    var rr: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(sStart, sEnd, cStart, cEnd);
    switch (rr) {
      case RangeRangeRelationship.Precedes:
        // S-RR-1
        return new OperationPair(
          s,
          c.copy({index: c.index - s.value.length}));
      case RangeRangeRelationship.PrecededBy:
        // S-RR-2
        return new OperationPair(
          s.copy({index: s.index - c.value.length}),
          c);
      case RangeRangeRelationship.Meets:
      case RangeRangeRelationship.Overlaps:
        // S-RR-3 and S-RR-5
        var offsetDelta: number = c.index - s.index;
        return new OperationPair(
          s.copy({value: s.value.substring(0, offsetDelta)}),
          c.copy({index: s.index, value: c.value.substring(s.value.length - offsetDelta, c.value.length)}));
      case RangeRangeRelationship.MetBy:
      case RangeRangeRelationship.OverlappedBy:
        // S-RR-4 and S-RR-6
        offsetDelta = s.index - c.index;
        return new OperationPair(
          s.copy({index: c.index, value: s.value.substring(c.value.length - offsetDelta, s.value.length)}),
          c.copy({value: c.value.substring(0, offsetDelta)}));
      case RangeRangeRelationship.Starts:
        // S-RR-7
        return new OperationPair(
          s.copy({noOp: true}),
          c.copy({value: c.value.substring(s.value.length, c.value.length)}));
      case RangeRangeRelationship.StartedBy:
        // S-RR-8
        return new OperationPair(
          s.copy({value: s.value.substring(c.value.length, s.value.length)}),
          c.copy({noOp: true}));
      case RangeRangeRelationship.Contains:
        // S-RR-9
        var overlapStart: number = c.index - s.index;
        var overlapEnd: number = overlapStart + c.value.length;
        return new OperationPair(
          s.copy({value: s.value.substring(0, overlapStart) + s.value.substring(overlapEnd, s.value.length)}),
          c.copy({noOp: true}));
      case RangeRangeRelationship.ContainedBy:
        // S-RR-10
        overlapStart = s.index - c.index;
        overlapEnd = overlapStart + s.value.length;
        return new OperationPair(
          s.copy({noOp: true}),
          c.copy({value: c.value.substring(0, overlapStart) + c.value.substring(overlapEnd, c.value.length)}));
      case RangeRangeRelationship.Finishes:
        // S-RR-11
        return new OperationPair(
          s.copy({noOp: true}),
          c.copy({value: c.value.substring(0, c.value.length - s.value.length)}));
      case RangeRangeRelationship.FinishedBy:
        // S-RR-12
        return new OperationPair(
          s.copy({value: s.value.substring(0, s.value.length - c.value.length)}),
          c.copy({noOp: true}));
      case RangeRangeRelationship.EqualTo:
        // S-RR-13
        return new OperationPair(s.copy({noOp: true}), c.copy({noOp: true}));
      default:
        throw new Error("invalid range range relationship");
    }
  }
}
