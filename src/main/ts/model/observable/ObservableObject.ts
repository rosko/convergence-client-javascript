import {ObservableElement, ObservableElementEvents, ObservableElementEventConstants} from "./ObservableElement";
import {ObservableContainerElement} from "./ObservableContainerElement";

/**
 * The events that could be emitted by a [[RealTimeObject]] or [[HistoricalObject]].
 */
export interface ObservableObjectEvents extends ObservableElementEvents {
  /**
   * Emitted when a value is [[RealTimeObject.set|initially set or replaced]] on a [[RealTimeObject]].
   * See [[ObjectSetEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly SET: string;

  /**
   * Emitted when a key-value pair is [[RealTimeObject.remove|removed]] from a [[RealTimeObject]].
   * See [[ObjectRemoveEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly REMOVE: string;

  /**
   * Emitted when the entire [[RealTimeObject.value|value]] of a [[RealTimeObject]] is set,
   * meaning its entire contents were replaced (or initially set).
   * See [[ObjectSetValueEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly VALUE: string;
}

export const ObservableObjectEventConstants: ObservableObjectEvents = {
  SET: "set",
  REMOVE: "remove",
  ...ObservableElementEventConstants
};
Object.freeze(ObservableObjectEventConstants);

export interface ObservableObject extends ObservableContainerElement<{ [key: string]: any }> {

  get(key: string): ObservableElement<any>;

  keys(): string[];

  hasKey(key: string): boolean;

  forEach(callback: (model: ObservableElement<any>, key?: string) => void): void;
}
