import OptionsSync from "webext-options-sync";
import { ERporting, EBiases } from "./sites";

const log = require("debug")("mbfc:utils:options");

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
  collapseConspiracy: false,
  collapseSatire: false,
  collapseFakeNews: false,
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
