import { LabelValues, Languages } from "../models/config";

export const labels: Record<Languages, LabelValues> = {
  EN: {
    Name: 'NAME',
    Price: 'PRICE',
    Gems: 'GEMS',
    Request: 'REQUEST',
    ViewInMarket: 'View in Community Market',
    StartingAt: 'Starting at: ',
    EmptyListing: 'There are no listings currently available for this item.',
    SellHistory: '%1$s sold in the last 24 hours',
    Volume: 'Volume: ',
    Profit: 'PROFIT',
    SellVolume: 'Sell Volume'
  },
  RU: {
    Name: 'НАЗВАНИЕ',
    Price: 'ЦЕНА',
    Gems: 'ГЕМЫ',
    Request: 'ЗАПРОС',
    ViewInMarket: 'Найти на Торговой площадке',
    StartingAt: 'От ',
    EmptyListing: 'Сейчас этот предмет никто не продаёт.',
    SellHistory: 'за последние 24 часа: %1$s',
    Volume: 'Продано ',
    Profit: 'Выгода',
    SellVolume: 'Продать объем'
  }
};
