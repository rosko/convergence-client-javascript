import {RealTimeValue} from "./RealTimeValue";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {PathElement} from "./ot/Path";
import StringInsertOperation from "./ot/ops/StringInsertOperation";
import StringRemoveOperation from "./ot/ops/StringRemoveOperation";
import StringSetOperation from "./ot/ops/StringSetOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeValueType from "./RealTimeValueType";
import {ModelChangeEvent} from "./events";
import {LocalIndexReference} from "./reference/LocalIndexReference";
import {RealTimeModel} from "./RealTimeModel";
import {LocalModelReference} from "./reference/LocalModelReference";
import {ModelReference} from "./reference/ModelReference";
import {IndexReference} from "./reference/IndexReference";
import Session from "../Session";
import {ReferenceType} from "./reference/ModelReference";
import {ModelEventCallbacks} from "./RealTimeModel";
import {RemoteReferenceEvent} from "../connection/protocol/model/reference/ReferenceEvent";
import {ReferenceManager} from "./reference/ReferenceManager";
import {OperationType} from "./ot/ops/OperationType";
import MessageType from "../connection/protocol/MessageType";
import {ReferenceDisposedCallback} from "./reference/LocalModelReference";
import {LocalRangeReference} from "./reference/LocalRangeReference";
import {RangeReference} from "./reference/RangeReference";
import {StringValue} from "./dataValue";


export default class RealTimeString extends RealTimeValue<String> {

  static Events: any = {
    INSERT: "insert",
    REMOVE: "remove",
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED,
    REFERENCE: RealTimeValue.Events.REFERENCE,
    MODEL_CHANGED: RealTimeValue.Events.MODEL_CHANGED
  };

  private _referenceManager: ReferenceManager;
  private _data: string;
  private _referenceDisposed: ReferenceDisposedCallback;

  /**
   * Constructs a new RealTimeString.
   */
  constructor(data: StringValue,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              callbacks: ModelEventCallbacks,
              model: RealTimeModel) {
    super(RealTimeValueType.String, data.id, parent, fieldInParent, callbacks, model);

    this._data = data.value;
    this._referenceManager = new ReferenceManager(this, [ReferenceType.INDEX, ReferenceType.RANGE]);
    this._referenceDisposed = (reference: LocalModelReference<any, any>) => {
      this._referenceManager.removeLocalReference(reference.key());
    };
  }

  insert(index: number, value: string): void {
    this._validateInsert(index, value);

    var operation: StringInsertOperation = new StringInsertOperation(this.id(), false, index, value);
    this._data = this._data.slice(0, index) + value + this._data.slice(index, this._data.length);
    this._sendOperation(operation);

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
      if (ref instanceof IndexReference) {
        ref._handleInsert(index, value.length);
      }
    });
  }

  remove(index: number, length: number): void {
    this._validateRemove(index, length);

    var operation: StringRemoveOperation = new StringRemoveOperation(this.id(), false, index, this._data.substr(index, length));
    this._data = this._data.slice(0, index) + this._data.slice(index + length, this._data.length);
    this._sendOperation(operation);

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
      if (ref instanceof IndexReference) {
        ref._handleRemove(index, length);
      }
    });
  }

  length(): number {
    return this._data.length;
  }

  /////////////////////////////////////////////////////////////////////////////
  // References
  /////////////////////////////////////////////////////////////////////////////

  // fixme the index and range reference methods are almost the same.  can we refactor?
  indexReference(key: string): LocalIndexReference {
    var existing: LocalModelReference<any, any> = this._referenceManager.getLocalReference(key);
    if (existing !== undefined) {
      if (existing.reference().type() !== ReferenceType.INDEX) {
        throw new Error("A reference with this key already exists, but is not an index reference");
      } else {
        return <LocalIndexReference>existing;
      }
    } else {
      var session: Session = this.model().session();
      var reference: IndexReference = new IndexReference(key, this, session.userId(), session.userId(), true);

      this._referenceManager.referenceMap().put(reference);
      var local: LocalIndexReference = new LocalIndexReference(
        reference,
        this._callbacks.referenceEventCallbacks,
        this._referenceDisposed
      );
      this._referenceManager.addLocalReference(local);
      return local;
    }
  }

  rangeReference(key: string): LocalRangeReference {
    var existing: LocalModelReference<any, any> = this._referenceManager.getLocalReference(key);
    if (existing !== undefined) {
      if (existing.reference().type() !== ReferenceType.RANGE) {
        throw new Error("A reference with this key already exists, but is not a range reference");
      } else {
        return <LocalRangeReference>existing;
      }
    } else {
      var session: Session = this.model().session();
      var reference: RangeReference = new RangeReference(key, this, session.userId(), session.userId(), true);

      this._referenceManager.referenceMap().put(reference);
      var local: LocalRangeReference = new LocalRangeReference(
        reference,
        this._callbacks.referenceEventCallbacks,
        this._referenceDisposed
      );
      this._referenceManager.addLocalReference(local);
      return local;
    }
  }

  reference(sessionId: string, key: string): ModelReference<any> {
    return this._referenceManager.referenceMap().get(sessionId, key);
  }

  references(sessionId?: string, key?: string): ModelReference<any>[] {
    return this._referenceManager.referenceMap().getAll(sessionId, key);
  }

  /////////////////////////////////////////////////////////////////////////////
  // private and protected methods.
  /////////////////////////////////////////////////////////////////////////////

  protected _setValue(value: string): void {
    this._validateSet(value);

    this._data = value;
    var operation: StringSetOperation = new StringSetOperation(this.id(), false, value);
    this._sendOperation(operation);

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
      ref._dispose();
    });
    this._referenceManager.referenceMap().removeAll();
  }

  protected _getValue(): string {
    return this._data;
  }

  //
  // Operations
  //

  _handleRemoteOperation(operationEvent: ModelOperationEvent): void {
    var type: string = operationEvent.operation.type;
    if (type === OperationType.STRING_INSERT) {
      this._handleInsertOperation(operationEvent);
    } else if (type === OperationType.STRING_REMOVE) {
      this._handleRemoveOperation(operationEvent);
    } else if (type === OperationType.STRING_VALUE) {
      this._handleSetOperation(operationEvent);
    } else {
      throw new Error("Invalid operation!");
    }
  }

  private _handleInsertOperation(operationEvent: ModelOperationEvent): void {
    var operation: StringInsertOperation = <StringInsertOperation> operationEvent.operation;
    var index: number = operation.index;
    var value: string = operation.value;

    this._validateInsert(index, value);

    this._data = this._data.slice(0, index) + value + this._data.slice(index, this._data.length);

    var event: StringInsertEvent = {
      src: this,
      name: RealTimeString.Events.INSERT,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.userId,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index,
      value: value
    };
    this.emitEvent(event);

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
      if (ref instanceof IndexReference) {
        ref._handleInsert(index, value.length);
      }
    });

    this._bubbleModelChangedEvent(event);
  }

  private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
    var operation: StringRemoveOperation = <StringRemoveOperation> operationEvent.operation;
    var index: number = operation.index;
    var value: string = operation.value;

    this._validateRemove(index, value.length);

    this._data = this._data.slice(0, index) + this._data.slice(index + value.length, this._data.length);

    var event: StringRemoveEvent = {
      src: this,
      name: RealTimeString.Events.REMOVE,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.userId,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index,
      value: value
    };
    this.emitEvent(event);

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
      if (ref instanceof IndexReference) {
        ref._handleRemove(index, value.length);
      }
    });

    this._bubbleModelChangedEvent(event);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: StringSetOperation = <StringSetOperation> operationEvent.operation;
    var value: string = operation.value;

    this._validateSet(value);
    this._data = value;

    var event: StringSetValueEvent = {
      src: this,
      name: RealTimeString.Events.VALUE,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.userId,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: value
    };
    this.emitEvent(event);

    this._referenceManager.referenceMap().getAll().forEach((ref: ModelReference<any>) => {
      ref._dispose();
    });
    this._referenceManager.referenceMap().removeAll();
    this._referenceManager.removeAllLocalReferences();

    this._bubbleModelChangedEvent(event);
  }

  private _validateInsert(index: number, value: string): void {
    // TODO: Add integer check
    if (this._data.length < index || index < 0) {
      throw new Error("Index out of bounds: " + index);
    }

    if (typeof value !== "string") {
      throw new Error("Value must be a string");
    }
  }

  private _validateRemove(index: number, length: number): void {
    // TODO: Add integer check
    if (this._data.length < index + length || index < 0) {
      throw new Error("Index out of bounds!");
    }
  }

  private _validateSet(value: string): void {
    if (typeof value !== "string") {
      throw new Error("Value must be a string");
    }
  }

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    this._referenceManager.handleRemoteReferenceEvent(event);
    if (event.type === MessageType.REFERENCE_PUBLISHED) {
      var reference: ModelReference<any> = this._referenceManager.referenceMap().get(event.sessionId, event.key);
      this._fireReferenceCreated(reference);
    }
  }
}

export interface StringInsertEvent extends ModelChangeEvent {
  src: RealTimeString;
  index: number;
  value:  string;
}

export interface StringRemoveEvent extends ModelChangeEvent {
  src: RealTimeString;
  index: number;
  value:  string;
}

export interface StringSetValueEvent extends ModelChangeEvent {
  src: RealTimeString;
  value:  string;
}