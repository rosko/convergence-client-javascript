/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {HistoricalElement} from "./HistoricalElement";
import {NumberNode} from "../internal/NumberNode";
import {HistoricalWrapperFactory} from "./HistoricalWrapperFactory";
import {
  ObservableNumber,
  ObservableNumberEvents,
  ObservableNumberEventConstants
} from "../observable/ObservableNumber";
import {HistoricalModel} from "./HistoricalModel";

/**
 * @module Real Time Data
 */
export interface HistoricalNumberEvents extends ObservableNumberEvents {
}

/**
 * A read-only history-aware version of a [[RealTimeNumber]].  See [[HistoricalElement]]
 * and [[HistoricalModel]] for some common usages.
 *
 * @module Real Time Data
 */
export class HistoricalNumber extends HistoricalElement<number> implements ObservableNumber {
  public static readonly Events: HistoricalNumberEvents = ObservableNumberEventConstants;

  /**
   * @hidden
   * @internal
   */
  constructor(delegate: NumberNode, wrapperFactory: HistoricalWrapperFactory, model: HistoricalModel) {
    super(delegate, wrapperFactory, model);
  }
}