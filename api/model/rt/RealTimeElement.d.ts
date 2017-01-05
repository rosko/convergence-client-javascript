import {ConvergenceEventEmitter} from "../../util/ConvergenceEventEmitter";
import {Path} from "../Path";
import {ModelReference} from "../reference/ModelReference";
import {ReferenceFilter} from "../reference/ReferenceFilter";
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {ObservableElement, ObservableElementEvents} from "../observable/ObservableElement";
import {ConvergenceEvent} from "../../util/ConvergenceEvent";

export interface RealTimeElementEvents extends ObservableElementEvents {
}

export declare abstract class RealTimeElement<T>
  extends ConvergenceEventEmitter<ConvergenceEvent> implements ObservableElement<T> {

  public static readonly Events: RealTimeElementEvents;

  public id(): string;

  public type(): string;

  public path(): Path;

  public isAttached(): boolean;

  public isDetached(): boolean;

  public parent(): RealTimeContainerElement<any>

  public value(): T;
  public value(value: T): void;

  public reference(sessionId: string, key: string): ModelReference<any>;

  public references(filter?: ReferenceFilter): Array<ModelReference<any>>;
}
