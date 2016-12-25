import {ConvergenceEventEmitter} from "../util/ConvergenceEventEmitter";
import {Session} from "../Session";
import {RealTimeModel} from "./rt/RealTimeModel";
import {ModelQuery} from "./query/ModelQuery";
import {HistoricalModel} from "./historical/HistoricalModel";
import {ModelResult} from "../../src/main/ts/model/query/ModelResult";

export declare class ModelService extends ConvergenceEventEmitter {
  public session(): Session;

  public query(query: ModelQuery): Promise<ModelResult>;

  public open(collectionId: string, modelId: string, initializer?: () => any): Promise<RealTimeModel>;

  public create(collectionId: string, modelId: string, data: Map<string, any>): Promise<void>;

  public remove(collectionId: string, modelId: string): Promise<void>;

  public history(collectionId: string, modelId: string): Promise<HistoricalModel>;
}
