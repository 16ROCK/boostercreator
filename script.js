var r = new XMLHttpRequest();
r.open('GET', chrome.extension.getURL('/injected.js'), true);
r.setRequestHeader('Content-Type', 'text/javascript;charset=UTF-8');
r.onload = function(){
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.innerHTML = r.responseText;
    document.querySelector('head').appendChild(s);
};
r.send();