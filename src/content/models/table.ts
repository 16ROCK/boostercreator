export type BoosterPackItem = {
  appid?: number;
  series?: number;

  name: string;
  price: number;
  unavailable: boolean;

  link: string;
  gems: number;
  profit: number;
  nameid: string;
  request: number;

  available_at_time: string | null;

  $Option?: unknown;
  $MiniOption?: unknown;
};

export type TableData = Record<string, BoosterPackItem>;
