/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is subject to the terms and conditions defined in the files
 * 'LICENSE' and 'COPYING.LESSER', which are part of this source code package.
 */

import {IPresenceEvent} from "./IPresenceEvent";
import {DomainUser} from "../../identity";

/**
 * Emitted when one or more items of a particular [[DomainUser]]'s presence
 * [[UserPresence.state|state]] were [[PresenceService.setState|set]].
 *
 * @module Presence
 */
export class PresenceStateSetEvent implements IPresenceEvent {
  public static readonly NAME = "state_set";

  /**
   * @inheritdoc
   */
  public readonly name: string = PresenceStateSetEvent.NAME;

  constructor(
    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * The entire new state (as opposed to only the items that changed) for the
     * [[user]].
     */
    public readonly state: Map<string, any>
  ) {
    Object.freeze(this);
  }
}