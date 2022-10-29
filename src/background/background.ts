chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: 'https://steamcommunity.com/tradingcards/boostercreator/'
  });
});
