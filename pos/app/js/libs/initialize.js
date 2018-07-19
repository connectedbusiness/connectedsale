//  Author: Interprise Solutions : 09-03-2013
//  ConnectedSale System Initalization
//  Ref: CSL-14189

(function () {
    //SET THIS TO 'true' FOR DEBUG/DEVELOPMENT
    var isDebug = false; 

    if (!navigator.connectedSale) {
        navigator.__proto__.connectedSale = {};
        navigator.connectedSale.currentSessionID = Math.random();
        navigator.connectedSale.preventCache = function (url) {
            url = url ? url : '';
            if (isDebug) return url;
            return url + '?' + navigator.connectedSale.currentSessionID;
        }
    }

    var loadJS = function (url, onLoad, datamain) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = navigator.connectedSale.preventCache(url);
        if (datamain) script.setAttribute("data-main", datamain);
        script.onload = function () { console.log('Loaded: ' + url); if (onLoad) onLoad(); };
        head.appendChild(script);
    }

    var loadCSS = function (url, onLoad, isLess) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('link');
        script.rel = 'stylesheet';
        if (isLess) script.rel = 'stylesheet/less';
        script.type = 'text/css';
        script.href = navigator.connectedSale.preventCache(url);
        script.onload = function () { console.log('Loaded: ' + url); if (onLoad) onLoad(); };
        head.appendChild(script);
    }

    var isBrowser = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);

    loadCSS('css/font-awesome.min.css', null, false);
    // loadCSS('css/style.less', null, true);
    // loadCSS('css/custom.less', null, true);
    loadCSS('css/style-flat.css', null, false);
    loadCSS('css/custom.css', null, false);
    
    loadCSS('css/dialog/jquery.ui.dialog.css');
    loadCSS('css/datetimepicker/jquery-ui.css');
    loadCSS('css/jquery.mobile-1.1.0.css');

    //loadJS('js/libs/less-1.3.3.min.js');
    loadJS('js/libs/require.min.js', null, 'js/main');
    loadJS('js/libs/disableBackButton.js', function () { disableHistory(); });
    //if (!isBrowser) loadJS('cordova.js');

})();
