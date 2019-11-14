/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IModelEvent} from "./IModelEvent";
import {RealTimeModel} from "../rt";

/**
 * Emitted when a [[RealTimeModel]] goes offline, generally because the client
 * lost connectivity to the server.  Subscribe to this
 * directly on a [[RealTimeModel]] rather than a [[RealTimeElement]] within.
 *
 * @module Real Time Data
 */
export class ModelOfflineEvent implements IModelEvent {
  public static readonly NAME = "offline";

  /**
   * @inheritdoc
   */
  public readonly name: string = ModelOfflineEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeModel]] that just went offline.
     */
    public readonly src: RealTimeModel
  ) {
    Object.freeze(this);
  }
}