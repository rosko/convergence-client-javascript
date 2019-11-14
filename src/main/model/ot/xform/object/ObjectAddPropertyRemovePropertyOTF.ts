/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {ObjectAddPropertyOperation} from "../../ops/ObjectAddPropertyOperation";
import {ObjectRemovePropertyOperation} from "../../ops/ObjectRemovePropertyOperation";
import {OperationPair} from "../OperationPair";

/**
 * @hidden
 * @internal
 */
export const ObjectAddPropertyRemovePropertyOTF: OperationTransformationFunction<ObjectAddPropertyOperation,
  ObjectRemovePropertyOperation> =
  (s: ObjectAddPropertyOperation, c: ObjectRemovePropertyOperation) => {
    if (s.prop !== c.prop) {
      // O-AR-1
      return new OperationPair(s, c);
    } else {
      // O-AR-2
      throw new Error("Add property and Remove property can not target the same property");
    }
  };