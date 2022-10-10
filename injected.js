var lan = {
    en: ['NAME','PRICE','GEMS','REQUEST','View in Community Market'],
    ru: ['НАЗВАНИЕ','ЦЕНА','ГЕМЫ','ЗАПРОС','Найти на Торговой площадке'],
    l: navigator.language == "ru-RU" || navigator.language == "ru" ? 'ru' : 'en'
};

$J('.booster_creator_right').html('').before('<div class="fast_profit disable" value="request">FAST PROFIT</div><div class="profit disable" value="price">PROFIT</div>').before('<div class="booster_creator"><div class="popup_creator"><div class="name" value="name">' + lan[lan.l][0] + '<span>▲</span></div><div value="request">' + lan[lan.l][3] + '</div><div value="price">' + lan[lan.l][1] + '</div><div value="gems">' + lan[lan.l][2] + '</div></div></div>').css('opacity','1');

function addItem(){
    $J('.booster_creator_right').html('');
    for(var i = 0; i < bk.length; i++){
        $J('.booster_creator_right').append('<div class=\"popup_item' + (bd[bk[i]].unavailable || !bd[bk[i]].price ? ' disable' : '') + '\"value=\"' + bk[i] + '\"' + (bd[bk[i]].unavailable && bd[bk[i]].available_at_time  ? 'title=\"' + bd[bk[i]].available_at_time + '\"' : '') + '>\n\t\t<div class=\"name\">' + bd[bk[i]].name + '</div>\n\t\t<div class=\"request\">' + (bd[bk[i]].request ? (bd[bk[i]].request / 100) : '⚠️') + '</div>\n\t\t<div class=\"price\">' + (bd[bk[i]].price ? (bd[bk[i]].price / 100) : '⚠️') + '</div>\n\t\t<div class=\"gem\">' + bd[bk[i]].gems + '</div>\n\t</div>');
    }
    $J('.popup_item[value="' + $J('#booster_game_selector').val() + '"]').addClass('active');
};

$J('.profit, .fast_profit').click(function(){
    if(!$J(this).hasClass('disable')){
        $J('.popup_creator>div>span').remove();
        bk = sortProfit(bd, $J(this).attr('value'));
        addItem();
        $J('.booster_creator_right').scrollTop(0);
    }
});

$J('.popup_creator>div').click(function(){
        $J('.popup_creator>div>span').remove();
        var sc = $J(this).attr('value');
        sort_dir = sort_column == sc ? !sort_dir : sc == 'request' || sc == 'price' ? false : true;
        sort_column = sc;
        bk = sort(bd, sort_column, sort_dir);
        if(sort_dir){
            $J(this).append('<span>▲</span>');
        }
        else{
            $J(this).append('<span>▼</span>');
        }
        addItem();
        $J('.booster_creator_right').scrollTop(0);
});

$J(document).on('mousedown','.popup_item',function(e){
    if(!e.originalEvent.button){
        location.hash = $J(this).attr('value');
    }
});

$J(window).on('hashchange', function(){
    $J('.popup_item').removeClass('active');
    $J('.popup_item[value="' + $J('#booster_game_selector').val() + '"]').addClass('active');
    if($J('.ViewMarket').length == 0 && $J('#booster_game_selector').val()){
        $J('.booster_goo_cost').before('<div class="ViewMarket">' + lan[lan.l][4] + '</div>');
    }
});

$J(document).on('mousedown','.ViewMarket',function(e){
    if(!e.originalEvent.button){
        open('https://steamcommunity.com/market/listings/753/' + bd[$J('#booster_game_selector').val()].link);
    }
});

CBoosterCreatorPage.ExecuteCreateBooster = function(rgBoosterData, nTradabilityPreference){
    $J.post('https://steamcommunity.com/tradingcards/ajaxcreatebooster/',{
        sessionid: g_sessionID,
        appid: rgBoosterData.appid,
        series: rgBoosterData.series,
        tradability_preference: nTradabilityPreference
    }).done(function(data){
        if(data.purchase_result.success == 1){
            var date = new Date();
            date.setTime(date.getTime() + 86400000);
            bd[data.purchase_result.appid]["available_at_time"] = date.toLocaleString(navigator.language, {day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric'});
            bd[data.purchase_result.appid]["unavailable"] = true;
            $J('.popup_item[value="' + data.purchase_result.appid + '"]').addClass('disable').attr('title', bd[data.purchase_result.appid]["available_at_time"]);
        }
        CBoosterCreatorPage.ShowBoosterCreatedDialog(data.purchase_result);
        CBoosterCreatorPage.UpdateGooDisplay(data.goo_amount, data.tradable_goo_amount, data.untradable_goo_amount);
        rgBoosterData.unavailable = true;
        if(rgBoosterData.$Option){
            CBoosterCreatorPage.ToggleActionButton(rgBoosterData.$Option);
        }
        if(rgBoosterData.$MiniOption){
            CBoosterCreatorPage.ToggleActionButton(rgBoosterData.$MiniOption);
        }
        CBoosterCreatorPage.RefreshSelectOptions();
    }).fail(function(jqXHR){
        ShowAlertDialog( CBoosterCreatorPage.ExecuteCreateBooster.toString().match(/ShowAlertDialog\(\s'(.*)'\s\)/)[1].split(/',\s'/) );
        var data = $J.parseJSON(jqXHR.responseText);
        if(data && typeof(data.goo_amount) != 'undefined'){
            CBoosterCreatorPage.UpdateGooDisplay(data.goo_amount, data.tradable_goo_amount, data.untradable_goo_amount);
        }
    });
}

function sort(o, k, s){
    return Object.keys(o).sort(function(a, b){
        var r = (o[a][k] < o[b][k]) ? -1 : (o[a][k] > o[b][k]) ? 1 : 0;
        return r * (s ? 1 : -1);
    });
};

function sortProfit(o, k){
    return Object.keys(o).sort(function(a, b){
        return (o[b][k] / o[b].gems) - (o[a][k] / o[a].gems);
    });
};
var sort_column = 'name', sort_dir = true, bd = localStorage.getItem('bd') ? JSON.parse(localStorage.getItem('bd')) : {}, bk = sort(CBoosterCreatorPage.sm_rgBoosterData, sort_column, sort_dir), link = [], l = '', n = 99;

for(var i = 0; i < bk.length; i++){
    var CB = CBoosterCreatorPage.sm_rgBoosterData[bk[i]];
    if(!bd[bk[i]]){
        bd[bk[i]] = {
            available_at_time: CB.available_at_time ? CB.available_at_time : null,
            gems: Number(CB.price),
            link: CB.appid + '-' + encodeURIComponent(CB.name.replace(/&amp;/g, '&').replace(/\//g, '-')) + '%20Booster%20Pack',
            name: CB.name,
            nameid: null,
            price: 0,
            request: 0,
            unavailable: CB.unavailable ? true : false
        }
    }else{
        bd[bk[i]].available_at_time = CB.available_at_time ? CB.available_at_time : null;
        bd[bk[i]].unavailable = CB.unavailable ? true : false;
    }
    l += '&items[]=' + bd[bk[i]].link + '&qty[]=0';
    if(n == i || i == bk.length - 1){
        link = link.concat([l]);
        l = '';
        n += 100;
    }
}

addItem();

function scanRequest(n){
    $J.get('https://steamcommunity.com/market/multisell?appid=753&contextid=6' + link[n] + 'l=english').done(function(d){
       var multi = d.split(/market_multi_itemname/);
        for(var i = 1; i < multi.length; i++){
            var appid = multi[i].match(/listings\/753\/(\d*)-/)[1];
            var price = multi[i].match(/price_paid" value="([^"]*)"/)[1];
            price = Math.round(parseFloat(price.replace(/[^0-9,.]/g, '').replace(/,/g, '.')) * 100);
            bd[appid]['request'] = bd[appid]['price'] ? price : 0;
        }
        localStorage.setItem('bd', JSON.stringify(bd));
        scanPrice(n + 1);
        bk = sort(bd, sort_column, sort_dir);
        addItem();
    }).fail(function(){
        setTimeout(function(){
            scanRequest(n);
        }, 15000);
    });
};

function scanPrice(n){
    if(n < link.length){
        $J.get('https://steamcommunity.com/market/multibuy?appid=753' + link[n] + 'l=english').done(function(d){
            var multi = d.split(/market_multi_itemname/);
            for(var i = 1; i < multi.length; i++){
                var appid = multi[i].match(/listings\/753\/(\d*)-/)[1];
                var nameid = multi[i].match(/name="buy_(\d*)_price"/)[1];
                var price = multi[i].match(/price" value="([^"]*)"/)[1];
                price = Math.round(parseFloat(price.replace(/[^0-9,.]/g, '').replace(/,/g, '.')) * 100);
                bd[appid]['price'] = multi[i].match(/"\sdata-tooltip-text="/) ? price : 0;
                bd[appid]['nameid'] = nameid;
            }
            scanRequest(n);
        }).fail(function(){
            setTimeout(function(){
                scanPrice(n);
            }, 15000);
        });
    }else{
        $J('.fast_profit,.profit').removeClass('disable');
    }
};

if($J('.ViewMarket').length == 0){
    $J('.booster_goo_cost').before('<div class="ViewMarket">' + lan[lan.l][4] + '</div>');
}

$J.when.apply($J, [$J.get('https://steamcommunity.com/login/home/?goto=%2Fmarket%2Fmultisell%3Fappid%3D753%26contextid%3D6%26items%5B%5D%3D220-Half-Life%25202%2520Booster%2520Pack%26qty%5B%5D%3D0'), $J.get('https://steamcommunity.com/login/home/?goto=%2Fmarket%2Fmultibuy%3Fappid%3D753%26items%5B%5D%3D220-Half-Life%25202%2520Booster%2520Pack%26qty%5B%5D%3D0')]).always(function(){
    scanPrice(0);
});