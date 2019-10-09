import {StringMapLike} from "../util";

/**
 * Represents the options that can be set when Joining an activity.
 *
 * @category Collaboration Awareness
 */
export interface IActivityJoinOptions {
  /**
   * Initial state to set when joining an activity.
   */
  state?: StringMapLike;
}
