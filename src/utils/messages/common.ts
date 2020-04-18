export interface IEmptyMessageRequest {
  method: string;
}
export type IMessageRequestType = IEmptyMessageRequest;

export interface IEmptyMessageResponse {}

export type HandlerCallbackType = (request: IMessageRequestType) => void;
