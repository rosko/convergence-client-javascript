/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {Immutable} from "../../../util/Immutable";
import {DiscreteOperation} from "./DiscreteOperation";
import {OperationType} from "./OperationType";
import {DateSet} from "./operationChanges";

/**
 * @hidden
 * @internal
 */
export class DateSetOperation extends DiscreteOperation implements DateSet {

  constructor(id: string,
              noOp: boolean,
              public readonly value: Date) {
    super(OperationType.DATE_VALUE, id, noOp);
    Object.freeze(this);
  }

  public copy(updates: any): DateSetOperation {
    return new DateSetOperation(
      Immutable.update(this.id, updates.id),
      Immutable.update(this.noOp, updates.noOp),
      Immutable.update(this.value, updates.value));
  }
}