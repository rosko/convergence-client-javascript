/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectRemovePropertyOperation} from "../../ops/ObjectRemovePropertyOperation";
import {OperationPair} from "../OperationPair";

/**
 * @hidden
 * @internal
 */
export const ObjectRemovePropertyRemovePropertyOTF: OperationTransformationFunction<ObjectRemovePropertyOperation,
  ObjectRemovePropertyOperation> =
  (s: ObjectRemovePropertyOperation, c: ObjectRemovePropertyOperation) => {
    if (s.prop !== c.prop) {
      // O-RR-1
      return new OperationPair(s, c);
    } else {
      // O-RR-2
      return new OperationPair(s.copy({ noOp: true }), c.copy({ noOp: true }));
    }
  };