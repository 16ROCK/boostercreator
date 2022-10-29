export type Languages = 'EN' | 'RU';

export interface LabelValues {
  Name: string;
  Price: string;
  Gems: string;
  Request: string;
  ViewInMarket: string;
  StartingAt: string;
  EmptyListing: string;
  SellHistory: string;
  Volume: string;
  Profit: string;
  SellVolume: string;
}

export type SteamAlertFunctions = (
  strTitle: string[],
  strDescription?: string,
  strOKButton?: string,
  rgModalParams?: unknown
) => void;
