declare global {
  let CBoosterCreatorPage: SteamBoosterCreatorPage;
  let g_sessionID: string;
  let ShowAlertDialog: SteamAlertFunctions;
  let $J: JQueryStatic;
}

import './style.css';

import { SteamAlertFunctions } from './models/config';
import { SteamBoosterCreatorPage } from './models/page';
import { BoosterPackItem, TableData } from './models/table';
import { labels } from './constants/language';
import { steamFee, maxRetryCount } from './constants/config';

const profitButtonsTemplate = `<div class="profit-buttons-container">
  <div class="fast_profit_btn disable" value="request">
    FAST PROFIT
  </div>
  <div class="profit_btn disable" value="price">
    PROFIT
  </div>
</div>`;

const sessionId = g_sessionID;
const boosterPackCreatorRef = CBoosterCreatorPage;
const alertFunction = ShowAlertDialog;

const bd: TableData = {};
const storedItemListString = localStorage.getItem('bd');
const storedItemList = storedItemListString
  ? JSON.parse(storedItemListString)
  : {};

const boosterOptionsString = localStorage.getItem('boosterOptions');
const boosterOptions = boosterOptionsString
  ? JSON.parse(boosterOptionsString)
  : {};

const walletInfoItem = localStorage.getItem('wallet_Info');
const wallet_Info = walletInfoItem
  ? JSON.parse(walletInfoItem)
  : { currency: 1, priceGems: 0 };

const currentLanguage =
  $J('.menuitem:last').attr('href')?.split('/')[3] == 'ru' ? 'RU' : 'EN';

const languageLabels = labels[currentLanguage];

let displayProfitValue = !!boosterOptions.displayProfitValue;
let sort_column: keyof BoosterPackItem = 'name';
let sort_dir = true;

let bk = sort(boosterPackCreatorRef.sm_rgBoosterData, sort_column, sort_dir);
let link: Array<string> = [];
let l = '';
let n = 99;
let appid = '';

const leftBPCreatorBox = $J('.booster_creator_left')[0];
const rightBPCreatorBox = $J('.booster_creator_right')[0];
const BPCreatorMainContainer = $J('.booster_creator_area')[0];

rightBPCreatorBox.classList.remove('booster_creator_right');
rightBPCreatorBox.classList.add('booster_creator_right_table');

const wrapperBox = document.createElement('div');
const rightContainer = document.createElement('div');
const tableWrapperContainer = document.createElement('div');
const tableContainer = document.createElement('div');

wrapperBox.classList.add('creator-helper-container');
rightContainer.classList.add('creator-right-container');
tableWrapperContainer.classList.add('creator-table-wrapper');
tableContainer.classList.add('creator-table-container');

tableContainer.appendChild(rightBPCreatorBox);
tableWrapperContainer.appendChild(tableContainer);
rightContainer.appendChild(tableWrapperContainer);

wrapperBox.appendChild(leftBPCreatorBox);
wrapperBox.appendChild(rightContainer);
BPCreatorMainContainer.appendChild(wrapperBox);

const profitColumnClass = displayProfitValue ? '' : 'hide-column';
const nameColumnFillClass = displayProfitValue ? '' : 'big-column';

$J('.creator-right-container').prepend(profitButtonsTemplate);

$J('.booster_creator_right_table')
  .html('')
  .before(
    `<div class="booster_creator">
      <div class="creator-table-header">
        <div class="name ${nameColumnFillClass}" value="name">
          ${languageLabels.Name}
          <span>▲</span>
        </div>
        <div value="request">
          ${languageLabels.Request}
        </div>
        <div value="price">
          ${languageLabels.Price}
        </div>
        <div value="gems">
          ${languageLabels.Gems}
        </div>
        <div value="profit" class="${profitColumnClass}">
          ${languageLabels.Profit}
        </div>
      </div>
    </div>`
  )
  .css('opacity', '1');

function stringFloatToInteger(n: string) {
  return Math.round(
    parseFloat(n.replace(/[^0-9,.]/g, '').replace(/,/g, '.')) * 100
  );
}

function addItem() {
  $J('.booster_creator_right_table').html('');

  bk.forEach((itemId) => {
    const currentItem = bd[itemId];

    const itemName = currentItem.name;
    const unavailable =
      currentItem.unavailable && !!currentItem.available_at_time;
    const availableAtTime = currentItem.available_at_time;

    const itemPriceValue = currentItem.price;
    const itemRequestValue = currentItem.request;

    const priceToPack = wallet_Info.priceGems * currentItem.gems;

    const itemRequestFee = currentItem.request - currentItem.request * steamFee;
    const itemPriceFee = currentItem.price - currentItem.price * steamFee;

    const fastProfit = itemRequestFee - priceToPack;

    const itemPriceDisplay = itemPriceValue ? itemPriceValue / 100 : '⚠️';
    const itemRequestDisplay = itemRequestValue ? itemRequestValue / 100 : '⚠️';

    const itemRequestColor =
      priceToPack < itemRequestFee
        ? 'green'
        : priceToPack < currentItem.request
        ? 'orange'
        : 'red';
    const itemPriceColor =
      priceToPack < itemPriceFee
        ? 'green'
        : priceToPack < itemPriceValue
        ? 'orange'
        : 'red';

    $J('.booster_creator_right_table').append(
      `<div class="creator-table-row${
        currentItem.unavailable || !currentItem.price ? ' disable' : ''
      }
        "value="${itemId}"
        ${unavailable ? 'title="' + availableAtTime + '"' : ''}
        >
          <div class="name ${nameColumnFillClass}">
            ${itemName}
          </div>
          <div class="request ${itemRequestColor}">
            ${itemRequestDisplay}
          </div>
          <div class="price ${itemPriceColor}">
            ${itemPriceDisplay}
          </div>
          <div class="gem">
            ${currentItem.gems}
          </div>
          <div class="profit ${profitColumnClass}">
            ${Math.round(fastProfit) / 100}
          </div>
        </div>`
    );
  });

  $J(
    '.creator-table-row[value="' + $J('#booster_game_selector').val() + '"]'
  ).addClass('active');
}

$J('.profit_btn, .fast_profit_btn').click(function () {
  if (!$J(this).hasClass('disable')) {
    $J('.creator-table-header>div>span').remove();
    bk = sortProfit(bd, $J(this).attr('value') as keyof BoosterPackItem);
    addItem();
    $J('.booster_creator_right_table').scrollTop(0);
  }
});

$J('.creator-table-header>div').click(function () {
  $J('.creator-table-header>div>span').remove();
  const sc = $J(this).attr('value') as keyof BoosterPackItem;
  sort_dir =
    sort_column == sc
      ? !sort_dir
      : sc == 'request' || sc == 'price' || sc == 'profit'
      ? false
      : true;
  sort_column = sc;
  bk = sort(bd, sort_column, sort_dir);
  if (sort_dir) {
    $J(this).append('<span>▲</span>');
  } else {
    $J(this).append('<span>▼</span>');
  }
  addItem();
  $J('.booster_creator_right_table').scrollTop(0);
});

$J(document).on('mousedown', '.creator-table-row', function (e) {
  if (!e.originalEvent || !e.originalEvent.button) {
    location.hash = $J(this).attr('value') as string;
  }
});

$J(window).on('hashchange', function () {
  $J('.creator-table-row').removeClass('active');
  $J(
    '.creator-table-row[value="' + $J('#booster_game_selector').val() + '"]'
  ).addClass('active');
  priceoverview();
});

$J(document).on('mousedown', '.ViewMarket', function (e) {
  if (e.originalEvent && e.originalEvent.button < 2) {
    open(
      'https://steamcommunity.com/market/listings/753/' +
        bd[$J('#booster_game_selector').val() as string].link
    );
  }
});

boosterPackCreatorRef.ExecuteCreateBooster = function (
  rgBoosterData,
  nTradabilityPreference
) {
  $J.post('https://steamcommunity.com/tradingcards/ajaxcreatebooster/', {
    sessionid: sessionId,
    appid: rgBoosterData.appid,
    series: rgBoosterData.series,
    tradability_preference: nTradabilityPreference
  })
    .done(function (data) {
      if (data.purchase_result.success == 1) {
        const date = new Date();
        date.setTime(date.getTime() + 86400000);
        bd[data.purchase_result.appid]['available_at_time'] =
          date.toLocaleString(navigator.language, {
            day: 'numeric',
            month: 'long',
            hour: 'numeric',
            minute: 'numeric'
          });
        bd[data.purchase_result.appid]['unavailable'] = true;
        $J('.creator-table-row[value="' + data.purchase_result.appid + '"]')
          .addClass('disable')
          .attr('title', bd[data.purchase_result.appid]['available_at_time']);
      }
      boosterPackCreatorRef.ShowBoosterCreatedDialog(data.purchase_result);
      boosterPackCreatorRef.UpdateGooDisplay(
        data.goo_amount,
        data.tradable_goo_amount,
        data.untradable_goo_amount
      );
      rgBoosterData.unavailable = true;

      if (rgBoosterData.$Option) {
        boosterPackCreatorRef.ToggleActionButton(rgBoosterData.$Option);
      }

      if (rgBoosterData.$MiniOption) {
        boosterPackCreatorRef.ToggleActionButton(rgBoosterData.$MiniOption);
      }

      boosterPackCreatorRef.RefreshSelectOptions();
    })
    .fail(function (jqXHR) {
      const funcContent =
        boosterPackCreatorRef.ExecuteCreateBooster.toString().match(
          /ShowAlertDialog\(\s'(.*)'\s\)/
        );

      if (funcContent && funcContent.length > 0) {
        alertFunction(funcContent[1].split(/',\s'/) as string[]);
      }

      const data = JSON.parse(jqXHR.responseText);

      if (data && typeof data.goo_amount != 'undefined') {
        boosterPackCreatorRef.UpdateGooDisplay(
          data.goo_amount,
          data.tradable_goo_amount,
          data.untradable_goo_amount
        );
      }
    });
};

function sort(
  o: Record<string, BoosterPackItem>,
  k: keyof BoosterPackItem,
  s: boolean
) {
  return Object.keys(o).sort(function (a, b) {
    const r =
      (o[a][k] as number) < (o[b][k] as number)
        ? -1
        : (o[a][k] as number) > (o[b][k] as number)
        ? 1
        : 0;
    return r * (s ? 1 : -1);
  });
}

function sortProfit(
  o: Record<string, BoosterPackItem>,
  k: keyof BoosterPackItem
) {
  return Object.keys(o).sort(function (a, b) {
    return (o[b][k] as number) / o[b].gems - (o[a][k] as number) / o[a].gems;
  });
}

for (let i = 0; i < bk.length; i++) {
  const itemId = bk[i];
  const currentItem = boosterPackCreatorRef.sm_rgBoosterData[bk[i]];

  let nameid = null;
  let price = 0;
  let request = 0;
  let profit = 0;

  if (storedItemList[itemId]) {
    nameid = storedItemList[itemId].nameid;
    price = storedItemList[itemId].price;
    request = storedItemList[itemId].request;
    profit =
      request -
      request * steamFee -
      wallet_Info.priceGems * Number(currentItem.price);
  }

  bd[itemId] = {
    available_at_time: currentItem.available_at_time
      ? currentItem.available_at_time
      : null,
    gems: Number(currentItem.price),
    link:
      currentItem.appid +
      '-' +
      encodeURIComponent(
        currentItem.name.replace(/&amp;/g, '&').replace(/\//g, '-')
      )
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29') +
      '%20Booster%20Pack',
    profit,
    name: currentItem.name,
    nameid: nameid,
    price: price,
    request: request,
    unavailable: currentItem.unavailable ? true : false
  };

  l += '&items[]=' + bd[itemId].link + '&qty[]=0';

  if (n == i || i == bk.length - 1) {
    link = link.concat([l]);
    l = '';
    n += 100;
  }
}

addItem();

function scanRequest(n: number, retryCount = maxRetryCount) {
  if (retryCount === 0) {
    scanPrice(n + 1);
    bk = sort(bd, sort_column, sort_dir);
    addItem();
    return;
  }

  $J.get(
    'https://steamcommunity.com/market/multisell?appid=753&contextid=6' +
      link[n] +
      '&l=english'
  )
    .done(function (d) {
      if (d.includes('Steam Community :: Error')) {
        return setTimeout(function () {
          console.error('Error fetching items sell price', { retryCount });

          scanRequest(n, --retryCount);
        }, 1000);
      }

      const multi = d.split(/market_multi_itemname/);
      for (let i = 1; i < multi.length; i++) {
        const appid = multi[i].match(/listings\/753\/(\d*)-/);
        if (appid) {
          const price = stringFloatToInteger(
            multi[i].match(/price_paid" value="([^"]*)"/)[1]
          );
          bd[appid[1]]['request'] =
            bd[appid[1]]['price'] &&
            !multi[i - 1].match(/"\sdata-tooltip-html="/)
              ? price
              : 0;
        }
      }
      localStorage.setItem('bd', JSON.stringify(bd));
      scanPrice(n + 1);
      bk = sort(bd, sort_column, sort_dir);
      addItem();
    })
    .fail(function () {
      console.error('Error fetching items sell price', { retryCount });

      setTimeout(function () {
        scanRequest(n, --retryCount);
      }, 15000);
    });
}

function scanPrice(n: number, retryCount = maxRetryCount) {
  if (n < link.length) {
    if (retryCount === 0) {
      scanRequest(n);
      return;
    }

    const url =
      'https://steamcommunity.com/market/multibuy?appid=753' +
      link[n] +
      '&l=english';
    $J.get(url)
      .done(function (d) {
        if (d.includes('Steam Community :: Error')) {
          return setTimeout(function () {
            console.error('Error fetching items buy price', { retryCount });

            scanPrice(n, --retryCount);
          }, 1000);
        }

        const multi = d.split(/market_multi_itemname/);

        for (let i = 1; i < multi.length; i++) {
          const appid = multi[i].match(/listings\/753\/(\d*)-/);
          if (appid) {
            const nameid = multi[i].match(/name="buy_(\d*)_price"/)[1];
            const price = stringFloatToInteger(
              multi[i].match(/price" value="([^"]*)"/)[1]
            );
            bd[appid[1]]['price'] = multi[i].match(/"\sdata-tooltip-text="/)
              ? price
              : 0;
            bd[appid[1]]['nameid'] = nameid;
          }
        }

        scanRequest(n);
      })
      .fail(function () {
        console.error('Error fetching items buy price', { retryCount });

        setTimeout(function () {
          scanPrice(n, --retryCount);
        }, 15000);
      });
  } else {
    $J('.fast_profit_btn,.profit_btn').removeClass('disable');
  }
}

function PriceGems(retryCount = 2) {
  if (!retryCount) {
    priceoverview();
    scanPrice(0);
    return;
  }

  $J.get(
    'https://steamcommunity.com/login/home/?goto=%2Fmarket%2Fmultibuy%3Fappid%3D753%26items%5B%5D%3D753-Sack%2520of%2520Gems%26qty%5B%5D%3D0%26l%3Denglish'
  )
    .done(function (data: string) {
      const priceMatch = data.match(/price" value="([^"]*)"/);

      if (!priceMatch || !priceMatch.length) {
        console.error('Error fetching gems buy price', { retryCount });

        PriceGems(--retryCount);
        return;
      }

      RequestGems(stringFloatToInteger(priceMatch[1]));
    })
    .fail(function () {
      console.error('Error fetching gems buy price', { retryCount });

      setTimeout(function () {
        PriceGems(--retryCount);
      }, 15000);
    });
}

function RequestGems(gemsSellPrice: number, retryCount = 2) {
  if (!retryCount) {
    priceoverview();
    scanPrice(0);
    return;
  }

  $J.get(
    'https://steamcommunity.com/login/home/?goto=%2Fmarket%2Fmultisell%3Fappid%3D753%26contextid%3D6%26items%5B%5D%3D753-Sack%2520of%2520Gems%26qty%5B%5D%3D0%26l%3Denglish'
  )
    .done(function (data: string) {
      const gemsBuyPriceMatch = data.match(/price_paid" value="([^"]*)"/);
      const currencyCodeMatch = data.match(/"wallet_currency":(\d*),"/);

      if (
        !gemsBuyPriceMatch ||
        !gemsBuyPriceMatch.length ||
        !currencyCodeMatch ||
        !currencyCodeMatch.length
      ) {
        console.error('Error fetching gems sell price', { retryCount });

        RequestGems(gemsSellPrice, --retryCount);
        return;
      }

      const gemsBuyPrice = gemsBuyPriceMatch[1];
      const currencyCode = currencyCodeMatch[1];
      const pricePerGem =
        Math.floor((gemsSellPrice + stringFloatToInteger(gemsBuyPrice)) / 20) /
        100;

      wallet_Info.currency = currencyCode;
      wallet_Info.priceGems = pricePerGem;

      localStorage.setItem('wallet_Info', JSON.stringify(wallet_Info));

      priceoverview();
      scanPrice(0);
    })
    .fail(function () {
      console.error('Error fetching gems sell price', { retryCount });

      setTimeout(function () {
        RequestGems(gemsSellPrice, --retryCount);
      }, 15000);
    });
}

PriceGems();

function priceoverview() {
  if (
    !$J('.priceoverview').length &&
    appid != $J('#booster_game_selector').val()
  ) {
    const currentLink = bd[$J('#booster_game_selector').val() as string].link;
    $J.get(
      'https://steamcommunity.com/market/priceoverview/?country=' +
        currentLanguage +
        '&currency=' +
        wallet_Info.currency +
        '&appid=753&market_hash_name=' +
        currentLink
    ).done(function (data) {
      if (data.success) {
        let strInfo = '';
        if (data.lowest_price) {
          strInfo += languageLabels.StartingAt + data.lowest_price + '<br>';
        } else {
          strInfo += languageLabels.EmptyListing + '<br>';
        }
        if (data.volume) {
          let strVolume = languageLabels.SellHistory;
          strVolume = strVolume.replace('%1$s', data.volume);
          strInfo += languageLabels.Volume + strVolume + '<br>';
        }
        if (
          !$J('.priceoverview').length &&
          appid != $J('#booster_game_selector').val()
        ) {
          $J('.booster_goo_cost').before(
            '<div class="priceoverview" style="min-height: 3em; margin-left: 1em;">' +
              strInfo +
              '</div>'
          );
        }
      }
      appid = $J('#booster_game_selector').val() as string;
    });
  }
  if (!$J('.ViewMarket').length) {
    $J('.booster_goo_cost').before(
      '<div class="ViewMarket">' + languageLabels.ViewInMarket + '</div>'
    );
  }
}
