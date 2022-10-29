import { BoosterPackItem } from './table';

export type SteamBoosterCreatorPage = {
  sm_rgBoosterData: Record<string, BoosterPackItem>;
  ExecuteCreateBooster: (
    rgBoosterData: BoosterPackItem,
    nTradabilityPreference: unknown
  ) => void;
  UpdateGooDisplay: (a: number, b: number, c: number) => void;
  ToggleActionButton: (option: unknown) => void;
  RefreshSelectOptions: () => void;
  ShowBoosterCreatedDialog: (item: string) => void;
};
