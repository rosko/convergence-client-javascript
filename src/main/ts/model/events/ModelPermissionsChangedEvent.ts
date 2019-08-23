import {IConvergenceEvent} from "../../util";
import {RealTimeModel} from "../rt";
import {ModelPermissions} from "../ModelPermissions";

/**
 * Emitted when the permissions on a model are modified. See [[ModelPermissionManager]]
 * to manage permissions programmatically.
 */
export class ModelPermissionsChangedEvent implements IConvergenceEvent {
  public static readonly NAME = "permissions_changed";

  /**
   * The name of this event type.  This can be e.g. used to filter when using the
   * [[ConvergenceEventEmitter.events]] stream.
   */
  public readonly name: string = ModelPermissionsChangedEvent.NAME;

  /**
   * @param model
   * @param permissions
   * @param changes
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The model whose permissions changed
     */
    public readonly model: RealTimeModel,

    /**
     * The permissions that changed
     */
    public readonly permissions: ModelPermissions,

    /**
     * A list of the specific permissions that were changed: One or more of
     * `read`, `write`, `remove` or `manage`
     */
    public readonly changes: string[]
  ) {
    Object.freeze(this);
  }
}
