﻿function getUrlVars()
{
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
    function (m, key, value)
    {
        vars[key] = value;
    });
    return vars;
}

function shuffleArray(array)
{
    for (var i = 0; i < array.length; i++)
    {
        var swapIndex = i + Math.floor(Math.random() * (array.length - i));
        var temp = array[i];
        array[i] = array[swapIndex];
        array[swapIndex] = temp;
    }
}

function checkForConsecutiveDuplicates(array)
{
    for (var i = 0; i < array.length - 1; i++)
        if (array[i] === array[i + 1])
            return true;
    return false;
}

function getBrowser()
{
    var nAgt = navigator.userAgent;
    var browserName = navigator.appName;
    var fullVersion = '' + parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;

    // In Opera 15+, the true version is after "OPR/" 
    if ((verOffset = nAgt.indexOf("OPR/")) !== -1)
    {
        browserName = "Opera";
        fullVersion = nAgt.substring(verOffset + 4);
    }
        // In older Opera, the true version is after "Opera" or after "Version"
    else if ((verOffset = nAgt.indexOf("Opera")) !== -1)
    {
        browserName = "Opera";
        fullVersion = nAgt.substring(verOffset + 6);
        if ((verOffset = nAgt.indexOf("Version")) !== -1)
            fullVersion = nAgt.substring(verOffset + 8);
    }
        // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset = nAgt.indexOf("MSIE")) !== -1)
    {
        browserName = "Microsoft Internet Explorer";
        fullVersion = nAgt.substring(verOffset + 5);
    }
        // In Chrome, the true version is after "Chrome" 
    else if ((verOffset = nAgt.indexOf("Chrome")) !== -1)
    {
        browserName = "Chrome";
        fullVersion = nAgt.substring(verOffset + 7);
    }
        // In Safari, the true version is after "Safari" or after "Version" 
    else if ((verOffset = nAgt.indexOf("Safari")) !== -1)
    {
        browserName = "Safari";
        fullVersion = nAgt.substring(verOffset + 7);
        if ((verOffset = nAgt.indexOf("Version")) !== -1)
            fullVersion = nAgt.substring(verOffset + 8);
    }
        // In Firefox, the true version is after "Firefox" 
    else if ((verOffset = nAgt.indexOf("Firefox")) !== -1)
    {
        browserName = "Firefox";
        fullVersion = nAgt.substring(verOffset + 8);
    }
        // In most other browsers, "name/version" is at the end of userAgent 
    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
              (verOffset = nAgt.lastIndexOf('/')))
    {
        browserName = nAgt.substring(nameOffset, verOffset);
        fullVersion = nAgt.substring(verOffset + 1);
        if (browserName.toLowerCase() === browserName.toUpperCase())
        {
            browserName = navigator.appName;
        }
    }
    // trim the fullVersion string at semicolon/space if present
    if ((ix = fullVersion.indexOf(";")) !== -1)
        fullVersion = fullVersion.substring(0, ix);
    if ((ix = fullVersion.indexOf(" ")) !== -1)
        fullVersion = fullVersion.substring(0, ix);

    majorVersion = parseInt('' + fullVersion, 10);
    if (isNaN(majorVersion))
    {
        fullVersion = '' + parseFloat(navigator.appVersion);
        majorVersion = parseInt(navigator.appVersion, 10);
    }
    return browserName + ':' + fullVersion;
}

function getOS()
{
    var os = navigator.appVersion;
    os = os.substring(0, os.indexOf(')') + 1);
    return os;
}

function doTimer(length, oncomplete)
{
    //Time resolution adjustments
    var resolution = 100;
    length = length - 10;

    var steps = Math.floor((length / 100) * (resolution / 10)),
        speed = Math.floor(length / steps),
        count = 0,
        start = new Date().getTime();

    function instance()
    {
        if (count++ === steps)
        {
            oncomplete(steps, count);
        } else
        {
            var diff = (new Date().getTime() - start) - (count * speed);
            window.setTimeout(instance, (speed - diff));
        }
    }

    window.setTimeout(instance, speed);
}

function deleteKeyboards(keys)
{
    for (var i = 0; i < keys.length; i++)
    {
        window.removeEventListener("keydown", keys[i].keydownListenerBind);
        window.removeEventListener("keyup", keys[i].keyupListenerBind);
    }
}

function keyboard(keyCode)
{
    document.body.focus();
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function (event)
    {
        if (event.keyCode === key.code)
        {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };
    //The `upHandler`
    key.upHandler = function (event)
    {
        if (event.keyCode === key.code)
        {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    //Attach event listeners
    key.keydownListenerBind = key.downHandler.bind(key);
    window.addEventListener("keydown", key.keydownListenerBind);
    key.keyupListenerBind = key.upHandler.bind(key);
    window.addEventListener("keyup", key.keyupListenerBind);
    return key;
}

function dateIsToday(date)
{
    if (date !== "" && date !== null && date !== undefined)
{
        var dateObject = Date.parseExact(date, "dd-MM-yyyy").clearTime();
        var today = Date.now().clearTime();
        if (dateObject.equals(today))
            return true;
    }
    return false;
}

function formatMoney(moneyin)
{
    if (window.hasOwnProperty("Intl") === false)
    {
        return '£' + moneyin.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "£1,");
    }
    else
    {
        var formatter = new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2
        });
        return formatter.format(moneyin).toString();
    }
   
}


(function (w)
{
    var oldST = w.setTimeout;
    var oldSI = w.setInterval;
    var oldCI = w.clearInterval;
    var timers = [];
    w.timers = timers;
    w.setTimeout = function (fn, delay)
    {
        var id = oldST(function ()
        {
            fn && fn();
            removeTimer(id);
        }, delay);
        timers.push(id);
        return id;
    };
    w.setInterval = function (fn, delay)
    {
        var id = oldSI(fn, delay);
        timers.push(id);
        return id;
    };
    w.clearInterval = function (id)
    {
        oldCI(id);
        removeTimer(id);
    };
    w.clearTimeout = w.clearInterval;

    function removeTimer(id)
    {
        var index = timers.indexOf(id);
        if (index >= 0)
            timers.splice(index, 1);
    }
}(window));

function clearAllTimers()
{
    for (var i = timers.length; i--;)
        clearInterval(timers[i]);
}