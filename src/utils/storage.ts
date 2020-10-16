export {};
const log = require("debug")("mbfc:background:storage");

import { StorageArea } from "./StorageArea";

export enum ERporting {
    HIGH = "H",
    LOW = "L",
    MIXED = "M",
    MOSTLY_FACTUAL = "MF",
    VERY_HIGH = "VH",
    VERY_LOW = "VL",
}

export const enum EBiases {
    CENTER = "C",
    CONSPIRACY = "CP",
    FAKE_NEWS = "FN",
    LEFT = "L",
    LEFT_CENTER = "LC",
    PRO_SCIENCE = "PS",
    RIGHT = "R",
    RIGHT_CENTER = "RC",
    SATIRE = "S",
}

export interface IFormOptions {
    collapseLeft: boolean;
    collapseLeftCenter: boolean;
    collapseCenter: boolean;
    collapseRightCenter: boolean;
    collapseRight: boolean;
    collapseProScience: boolean;
    collapseConspiracy: boolean;
    collapseSatire: boolean;
    collapseFakeNews: boolean;
    collapseMixed: boolean;
}

export const DefaultFormOptions: IFormOptions = {
    collapseLeft: false,
    collapseLeftCenter: false,
    collapseCenter: false,
    collapseRightCenter: false,
    collapseRight: false,
    collapseProScience: false,
    collapseConspiracy: true,
    collapseSatire: false,
    collapseFakeNews: true,
    collapseMixed: false,
};

export interface IOptions {
    collapse: Record<ERporting, boolean>;
    hideSites: Record<string, boolean>;
    showSites: Record<string, boolean>;
}

export const OptionsToStorage = {
    collapseLeft: EBiases.LEFT,
    collapseLeftCenter: EBiases.LEFT_CENTER,
    collapseCenter: EBiases.CENTER,
    collapseRightCenter: EBiases.RIGHT_CENTER,
    collapseRight: EBiases.RIGHT_CENTER,
    collapseProScience: EBiases.PRO_SCIENCE,
    collapseConspiracy: EBiases.CONSPIRACY,
    collapseSatire: EBiases.SATIRE,
    collapseFakeNews: EBiases.FAKE_NEWS,
    collapseMixed: "M",
};

export const StorageToOptions = {
    [EBiases.LEFT]: "collapseLeft",
    [EBiases.LEFT_CENTER]: "collapseLeftCenter",
    [EBiases.CENTER]: "collapseCenter",
    [EBiases.RIGHT_CENTER]: "collapseRightCenter",
    [EBiases.RIGHT_CENTER]: "collapseRight",
    [EBiases.PRO_SCIENCE]: "collapseProScience",
    [EBiases.CONSPIRACY]: "collapseConspiracy",
    [EBiases.SATIRE]: "collapseSatire",
    [EBiases.FAKE_NEWS]: "collapseFakeNews",
    M: "collapseMixed",
};

export interface IConfig {
    hiddenSites: Record<string, boolean>;
    collapse: any;
    unknown: Record<string, boolean>;
    lastRun: number;
    firstrun: boolean;
    loaded: boolean;
    mbfcAnalytics: boolean;
    pollMinutes: number;
}

const configDefaults: IConfig = {
    hiddenSites: {},
    collapse: DefaultFormOptions,
    unknown: {},
    lastRun: 0,
    firstrun: true,
    loaded: false,
    mbfcAnalytics: false,
    pollMinutes: 60,
};

export const storage = StorageArea.create<IConfig>({
    defaults: configDefaults,
});
