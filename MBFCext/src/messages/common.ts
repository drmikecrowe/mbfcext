import debug from "debug";
import { isDevMode } from "../utils/utils";
import { IConfig, ISource } from "../utils/definitions";

isDevMode();
const log = debug("mbfc:common");

export interface IEmptyMessageRequest {
    method: string
}

export interface IReportUnknownRequest extends IEmptyMessageRequest {
    domain: string;
}

export interface IAssociateSiteRequest extends IEmptyMessageRequest {
    source: ISource;
    fb_url: string;
}

export interface IShowSiteRequest extends IEmptyMessageRequest {
    source: ISource;
    isAlias: boolean;
    isBase: boolean;
    isCollapsed: boolean;
}

export interface IHideSiteRequest extends IEmptyMessageRequest {
    source: ISource;
    hideState: boolean;
}

export interface IReportCollapsedRequest extends IEmptyMessageRequest {
    source: ISource;
}

export type IMessageRequestType = IEmptyMessageRequest | IReportUnknownRequest | IAssociateSiteRequest | IShowSiteRequest | IHideSiteRequest | IReportCollapsedRequest;

export interface IEmptyMessageResponse {}

export interface IGetConfigResponse extends IEmptyMessageResponse {
    config: IConfig;
}

export interface IHideSiteResponse extends IEmptyMessageResponse {
    hiddenSites: any;
}

export type IMessageResponseType = IEmptyMessageRequest | IGetConfigResponse | IHideSiteResponse;

export type HandlerCallbackType = (request: IMessageRequestType) => void;
export type ResponseCallbackType = (response?: IMessageResponseType) => void;
