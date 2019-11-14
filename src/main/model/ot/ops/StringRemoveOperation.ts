/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {StringRemove} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class StringRemoveOperation extends DiscreteOperation implements StringRemove {

  constructor(id: string,
              noOp: boolean,
              public readonly index: number,
              public readonly value: string) {
    super(OperationType.STRING_REMOVE, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): StringRemoveOperation {
    return new StringRemoveOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.index, updates.index),
      Immutable.update(this.value, updates.value));
  }
}