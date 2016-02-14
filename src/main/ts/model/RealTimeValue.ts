import RealTimeValueType from "./RealTimeValueType";
import {PathElement, Path} from "../ot/Path";
import DiscreteOperation from "../ot/ops/DiscreteOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeContainerValue from "./RealTimeContainerValue";
import {ModelDetachedEvent} from "./events";
import ConvergenceEventEmitter from "../util/ConvergenceEventEmitter";

abstract class RealTimeValue<T> extends ConvergenceEventEmitter {

  static Events: any = {
    DETACHED: "detached"
  };

  private _detached: boolean = false;

  /**
   * Constructs a new RealTimeValue.
   */
  constructor(private _modelType: RealTimeValueType,
              private _parent: RealTimeContainerValue<any>,
              public fieldInParent: PathElement,
              protected _sendOpCallback: (operation: DiscreteOperation) => void) {
    super();
  }

  type(): RealTimeValueType {
    return this._modelType;
  }

  path(): Path {
    if (this._parent == null) {
      return [];
    } else {
      var path: Path = this._parent.path();
      path.push(this.fieldInParent);
      return path;
    }
  }

  isDetached(): boolean {
    return this._detached;
  }

  _detach(): void {
    this._parent = null;
    this._detached = true;
    this._sendOpCallback = null;
    var event: ModelDetachedEvent = {
      src: this,
      name: RealTimeValue.Events.DETACHED
    };

    this.emitEvent(event);
  }

  value(): T
  value(value: T): void
  value(value?: T): any {
    if (arguments.length === 0) {
      return this._getValue();
    } else {
      this._setValue(value);
      return;
    }
  }

  private _exceptionIfDetached(): void {
    if (this._detached) {
      throw Error("Can not perform actions on a detached RealTimeValue.");
    }
  }

  protected _sendOperation(operation: DiscreteOperation): void {
    this._exceptionIfDetached();
    this._sendOpCallback(operation);
  }

  protected abstract _getValue(): T;
  protected abstract _setValue(value: T): void;

  abstract _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): void;
}

export default RealTimeValue;
