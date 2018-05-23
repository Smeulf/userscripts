// ==UserScript==
// @name         mb.unicodechars
// @namespace    https://github.com/Smeulf/userscripts
// @version      0.5
// @description  Ctrl+M on Musicbrainz input text or textarea controls shows context menu for unicode characters. Just click on the menu line to send the character or close.
// @author       Smeulf
// @match        http://*.musicbrainz.org/*
// @match        https://*.musicbrainz.org/*
// @grant        GM_addStyle
// ==/UserScript==


/*
  Styles for custom context menu
*/
GM_addStyle('\
.mbunicodecharsMenuShow {\
    z-index:1000;\
    position: absolute;\
    background-color:#C0C0C0;\
    border: 1px solid blue;\
    padding: 2px;\
    display: block;\
    margin: 0;\
    font-family: sans-serif;\
}\
\
.mbunicodecharsMenuHide {\
    display: none;\
}\
\
.mbunicodecharsOptionActive {\
    background-color:#FFFF00;\
}\
.mbunicodecharsOptionInactive {\
    background-color:#C0C0C0;\
}\
');

/*
  Custom context menu. The id is used to print the unicode caracter
*/
var newHTML = document.createElement ('div');
newHTML.innerHTML = '<div class="mbunicodecharsMenuHide" id="mbunicodecharsMenu">\
<div align=\'right\'>[X]</div>\
<div id="\u2018">\u2018 (Left Single Quotes U+2018)</div>\
<div id="\u2019">\u2019 (Apostrophe, Right Single Quotes U+2019)</div>\
<div id="\u2018\u2019">\u2018\u2019 (Left+Right Single Quotes U+2018 & U+2019)</div>\
<div id="\u201C">\u201C (Left Double Quotes U+201C)</div>\
<div id="\u201D">\u201D (Right Double Quotes U+201D)</div>\
<div id="\u201C\u201D">\u201C\u201D (Left+Right Double Quotes U+201C & U+201D)</div>\
<div id="\u2026">\u2026 (Horizontal Ellipsis U+2026)</div>\
<div id="\u2014">\u2014 (Em Dash U+2014)</div>\
<div id="\u2013">\u2013 (En Dash U+2013)</div>\
</div>\
';
document.body.appendChild (newHTML);


/*
  Main entry point : will wait for any elements with where type is text ( [type='text'] ), and repeat every 500ms to scan the page for changes
  It(s requiried to rescan the page periodically because of AJAX
*/
waitForKeyElements("input", addListener);
waitForKeyElements("textarea", addListener);


/*
  Callback function when a [type='text'] element is found. Adds listeners to the object
*/
function addListener(obj)
{
    obj[0].addEventListener('keydown', addMenu);
    obj[0].addEventListener('keydown', navigateMenu);
}


/*
  Event callback. Displays the menu and set unsafewindow variables for persistance
*/
function addMenu(event)
{
    if (
        (event.toString() == "[object KeyboardEvent]" && event.key == "m" && event.ctrlKey== true)
    )
    {
        event.preventDefault();

        unsafeWindow.lastInputClicked = event.target;
        unsafeWindow.selectionStart = event.target.selectionStart;
        unsafeWindow.selectionEnd = event.target.selectionEnd;

        document.getElementById("mbunicodecharsMenu").className = "mbunicodecharsMenuShow";
        unsafeWindow.menuOpened = true;

        var rect = unsafeWindow.lastInputClicked.getBoundingClientRect();
        document.getElementById("mbunicodecharsMenu").style.top = (rect.bottom + window.scrollY) + 'px';
        document.getElementById("mbunicodecharsMenu").style.left = (rect.left + window.scrollX) + 'px';
        
        setActiveOption(2); //used for mouse enter

        var cn = document.getElementById("mbunicodecharsMenu").childNodes;
        cn[0].index = 0;
        cn[0].addEventListener('click',close);
        cn[0].addEventListener('mouseenter',menuMouseEnter);
        var i;
        for (i=1;i<cn.length;i++)
        {
            cn[i].index = i;
            cn[i].addEventListener('click', menuOption);
            cn[i].addEventListener('mouseenter',menuMouseEnter);
        }
    }
}

function navigateMenu(event)
{
    if (unsafeWindow.menuOpened == true && (event.key == "ArrowDown" || event.key == "ArrowUp" || event.key == "Enter"))
    {
        event.preventDefault();
        console.log(event);
        var cn = document.getElementById("mbunicodecharsMenu").childNodes;

        if (event.key == "Enter")
        {
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent('click', true, false);
            cn[unsafeWindow.activeMenuOption].dispatchEvent(ev);
        }

        if (event.key == "ArrowDown")
        {
            if (cn.length -1 > unsafeWindow.activeMenuOption)
            {
                setActiveOption(unsafeWindow.activeMenuOption + 1);
            }
        }

        if (event.key == "ArrowUp")
        {
            if (unsafeWindow.activeMenuOption > 0)
            {
                setActiveOption(unsafeWindow.activeMenuOption - 1);
            }
        }


    }
}

function menuMouseEnter(event)
{
    setActiveOption(event.target.index);
}

function setActiveOption(index)
{
    var cn = document.getElementById("mbunicodecharsMenu").childNodes;
    if (unsafeWindow.activeMenuOption !== undefined)
    {
        cn[unsafeWindow.activeMenuOption].className = "mbunicodecharsOptionInactive";
    }
    unsafeWindow.activeMenuOption = index;
     cn[unsafeWindow.activeMenuOption].className = "mbunicodecharsOptionActive";
}


/*
  When a menu option is clicked, insert the caracter in the string and close the menu
*/
function menuOption(event)
{
    unsafeWindow.lastInputClicked.value = unsafeWindow.lastInputClicked.value.substr(0, unsafeWindow.selectionStart)
        + event.target.id
        + unsafeWindow.lastInputClicked.value.substr(unsafeWindow.selectionEnd);
    var cn = document.getElementById("mbunicodecharsMenu").childNodes;
    cn[unsafeWindow.activeMenuOption].className = "mbunicodecharsOptionInactive";
    document.getElementById("mbunicodecharsMenu").className = "mbunicodecharsMenuHide";

    unsafeWindow.menuOpened = false;
    unsafeWindow.lastInputClicked.focus();
    unsafeWindow.lastInputClicked.setSelectionRange(unsafeWindow.selectionStart+1, unsafeWindow.selectionStart+1);
}

function close(event)
{
    document.getElementById("mbunicodecharsMenu").className = "mbunicodecharsMenuHide";
    unsafeWindow.menuOpened = false;
    unsafeWindow.lastInputClicked.focus();
    unsafeWindow.lastInputClicked.setSelectionRange(unsafeWindow.selectionStart, unsafeWindow.selectionStart);
}


/*
Function from https://gist.githubusercontent.com/raw/2625891/waitForKeyElements.js
Credits to BrockA, https://github.com/BrockA
Analyses the page every M ms for specif tags and calls a function, usefull when pages loads AJAX content
Only the timer was changed from 300ms to 500ms
*/
function waitForKeyElements (
    selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
    actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
    iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
    {
        targetNodes = $(selectorTxt);
    }
    else
    {
        targetNodes = $(iframeSelector).contents().find (selectorTxt);
    }

    if (targetNodes && targetNodes.length > 0) {
        btargetsFound = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each ( function () {
            var jThis = $(this);
            var alreadyFound = jThis.data ('alreadyFound') || false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound = actionFunction (jThis);
                if (cancelFound)
                {
                    btargetsFound = false;
                }
                else
                {
                    jThis.data ('alreadyFound', true);
                }
            }
        } );
    }
    else {
        btargetsFound = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj = waitForKeyElements.controlObj || {};
    var controlKey = selectorTxt.replace (/[^\w]/g, "_");
    var timeControl = controlObj [controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound && bWaitOnce && timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if ( ! timeControl) {
            timeControl = setInterval ( function () {
                waitForKeyElements (selectorTxt,
                                    actionFunction,
                                    bWaitOnce,
                                    iframeSelector
                                   );
            },500);
            controlObj [controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj = controlObj;
}
