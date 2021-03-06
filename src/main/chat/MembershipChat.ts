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

import {Chat} from "./Chat";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {IChatEvent} from "./events";
import {Observable} from "rxjs";
import {IdentityCache} from "../identity/IdentityCache";
import {domainUserIdToProto} from "../connection/ProtocolUtil";
import {DomainUserIdentifier, DomainUserId} from "../identity";
import {IChatInfo} from "./IChatInfo";

/**
 * A [[MembershipChat]] chat is a chat construct that has a specific set of
 * users who belong to that chat. A [[MembershipChat]] keeps track of which
 * users are part of the chat.
 *
 * @module Chat
 */
export abstract class MembershipChat extends Chat {

  /**
   * @hidden
   * @internal
   */
  protected constructor(connection: ConvergenceConnection,
                        identityCache: IdentityCache,
                        messageStream: Observable<IChatEvent>,
                        info: MembershipChatInfo) {
    super(connection, identityCache, messageStream, info);
  }

  public info(): MembershipChatInfo {
    return super.info() as MembershipChatInfo;
  }

  /**
   * Leaves the chat, such that messages will no longer be received. The
   * semantics of this depend on the specific subclass.
   *
   * @returns
   *   A promise that will be resolved when the Chat is left successfully.
   */
  public leave(): Promise<void> {
    this._connection.session().assertOnline();
    this._assertJoined();
    return this._connection.request({
      leaveChatRequest: {
        chatId: this._info.chatId
      }
    }).then(() => undefined);
  }

  /**
   * Removes the specified user from the Chat.
   *
   * @param user
   *   The user to remove from the Chat.
   * @returns
   *   A promise that is resolved when the specified user is successfully
   *   removed from the chat.
   */
  public remove(user: DomainUserIdentifier): Promise<void> {
    this._connection.session().assertOnline();
    this._assertJoined();
    return this._connection.request({
      removeUserFromChatRequest: {
        chatId: this._info.chatId,
        userToRemove: domainUserIdToProto(DomainUserId.toDomainUserId(user))
      }
    }).then(() => undefined);
  }
}

/**
 * The possible types of [[ChatInfo.membership]].
 *
 * @module Chat
 */
export type ChatMembership = "public" | "private";

/**
 * The [[ChatInfo]] relevant to a [[MembershipChat]].
 *
 * @module Chat
 */
export interface MembershipChatInfo extends IChatInfo {
  readonly membership: ChatMembership;
}
