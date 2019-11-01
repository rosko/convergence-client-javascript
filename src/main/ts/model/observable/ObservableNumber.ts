import {ObservableElement, ObservableElementEvents, ObservableElementEventConstants} from "./ObservableElement";

/**
 * The events that could be emitted by a [[RealTimeNumber]] or [[HistoricalNumber]].
 *
 * @module RealTimeData
 */
export interface ObservableNumberEvents extends ObservableElementEvents {
  /**
   * Emitted when the value of this number changes
   * (but not explicitly set, listen to [[RealTimeNumberEvents.VALUE]] for that).
   * The emitted event is an [[NumberDeltaEvent]].
   *
   * @event
   */
  readonly DELTA: string;

  /**
   * Emitted when the entire [[RealTimeNumber.value|value]] of a [[RealTimeNumber]] is set,
   * meaning its entire contents were replaced (or initially set).
   * See [[NumberSetValueEvent]] for the actual emitted event.
   *
   * @event
   */
  readonly VALUE: string;
}

/**
 * @module RealTimeData
 */
export const ObservableNumberEventConstants: ObservableNumberEvents = {
  DELTA: "delta",
  ...ObservableElementEventConstants
};

Object.freeze(ObservableNumberEventConstants);

/**
 * @module RealTimeData
 */
export interface ObservableNumber extends ObservableElement<number> {

}
