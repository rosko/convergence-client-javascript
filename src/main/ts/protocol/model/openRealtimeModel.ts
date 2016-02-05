import {IncomingProtocolResponseMessage} from "../protocol";
import {OutgoingProtocolRequestMessage} from "../protocol";
import ModelFqn from "../../model/ModelFqn";
import MessageType from "../MessageType";


export interface OpenRealTimeModelRequest extends OutgoingProtocolRequestMessage {
  modelFqn: ModelFqn;
}

export class OpenRealTimeModelRequestSerializer {
  static serialize(request: OpenRealTimeModelRequest): any {
    return {
      fqn: request.modelFqn
    };
  }
}

export interface OpenRealTimeModelResponse extends IncomingProtocolResponseMessage {
  resourceId: string;
  version: number;
  createdTime: number;
  modifiedTime: number;
  data: any;
}

export class OpenRealTimeModelResponseMessageDeserializer {
  static deserialize(body: any): OpenRealTimeModelResponse {
    return {
      resourceId: body.rId,
      version: body.v,
      createdTime: body.created,
      modifiedTime: body.modified,
      data: body.data,
      type: MessageType.OPEN_REAL_TIME_MODEL
    };
  }
}
