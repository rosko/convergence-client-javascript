/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableArray} from "../observable/ObservableArray";
import {ObservableElement} from "../observable/ObservableElement";
import {DomainUser} from "../../identity";

/**
 * Emitted when a value is inserted into a [[RealTimeArray]].  This could be from a
 * [[RealTimeArray.insert]], [[RealTimeArray.push]], [[RealTimeArray.unshift]], or some
 * other method.
 *
 * @module Real Time Data
 */
export class ArrayInsertEvent implements IValueChangedEvent {
  public static readonly NAME = "insert";

  /**
   * @inheritdoc
   */
  public readonly name: string = ArrayInsertEvent.NAME;

  /**
   * @param element
   * @param index
   * @param value
   * @param sessionId
   * @param userd
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeArray]] or [[HistoricalArray]] which was modified
     */
    public readonly element: ObservableArray,

    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * @inheritdoc
     */
    public readonly sessionId: string,

    /**
     * True if the change occurred locally (within the current session)
     */
    public readonly local: boolean,

    /**
     * The index at which the new value was inserted
     */
    public readonly index: number,

    /**
     * A read-only representation of the value that was just inserted
     */
    public readonly value: ObservableElement<any>
  ) {
    Object.freeze(this);
  }
}
