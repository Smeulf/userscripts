// ==UserScript==
// @name         mb.unicodechars
// @namespace    https://github.com/Smeulf/userscripts
// @version      0.10.5
// @description  Ctrl+M on MusicBrainz input text or textarea controls shows context menu for unicode characters. Just click on the menu line to send the character or close with Escape key.
// @author       Smeulf
// @match        *://*.musicbrainz.org/*
// @grant        GM_addStyle
// ==/UserScript==


/*
  Styles for custom context menu
*/
GM_addStyle('\
.mbunicodecharsMenuShow {\
    z-index:1000;\
    position: absolute;\
    background-color:#D8D8D8;\
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
    display: table-row;\
}\
.mbunicodecharsOptionInactive {\
    background-color:#D8D8D8;\
    display: table-row;\
}\
.mbunicodecharsOptionRow {\
    display: table-row;\
}\
.mbunicodecharsOptionLeftColumn {\
    width:12%;\
    display:table-cell;\
}\
.mbunicodecharsOptionRightColumn {\
    width:88%;\
    display:table-cell;\
}\
.mbunicodecharsSettingsMenu {\
    position: absolute;\
    width: 500px;\
    height: 300px;\
    background-color:#D8D8D8;\
}\
');


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
    obj[0].addEventListener('keydown', displayMenu);
    obj[0].addEventListener('keydown', navigateMenu);
}


/*
  Event callback. Displays the menu and set unsafewindow variables for persistance
*/
function displayMenu(event)
{

    if (event.toString() == "[object KeyboardEvent]" && event.key == "m" && event.ctrlKey== true)
    {
        /*
        Create custom context menu if not exists
        */

        if (!unsafeWindow.mbunicodecharMenuCreated)
        {
            console.log("Create mb.unicodechars menu");
            buildMenu();
            unsafeWindow.mbunicodecharMenuCreated = true;
        }

        event.preventDefault();

        unsafeWindow.lastInputClicked = event.target;
        unsafeWindow.selectionStart = event.target.selectionStart;
        unsafeWindow.selectionEnd = event.target.selectionEnd;

        var menu = document.getElementById("mbunicodecharsMenu");

        var rect = unsafeWindow.lastInputClicked.getBoundingClientRect();
        menu.style.top = (rect.bottom + window.scrollY) + 'px';
        menu.style.left = (rect.left + window.scrollX) + 'px';

        setActiveOption(menu.defaultOption); //used for mouse click

        var cn = menu.childNodes;
        cn[0].index = 0;
        cn[0].addEventListener('click',close);
        cn[0].addEventListener('mouseenter',onMenuMouseEnter);

        var i;
        for (i=1;i<cn.length-1;i++)
        {
            cn[i].index = i;
            cn[i].addEventListener('click', onMenuOptionClic);
            cn[i].addEventListener('mouseenter',onMenuMouseEnter);
        };

        cn[cn.length-1].index = cn.length-1;
        cn[i].addEventListener('click', showSettings);
        cn[cn.length-1].addEventListener('mouseenter',onMenuMouseEnter);

        menu.className = "mbunicodecharsMenuShow";
        unsafeWindow.menuOpened = true;
    }
}

function navigateMenu(event)
{
    if (unsafeWindow.menuOpened == true && event.key.match(/ArrowDown|ArrowUp|Enter|Escape/))
    {
        event.preventDefault();
        event.cancelBubble = true;
        var menu = document.getElementById("mbunicodecharsMenu");
        var cn = menu.childNodes;

        if (event.key == "Enter")
        {
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent('click', true, false);
            cn[menu.activeOption].dispatchEvent(ev);
        }

        if (event.key == "ArrowDown")
        {
            if (cn.length -1 > menu.activeOption)
            {
                setActiveOption(menu.activeOption + 1);
            }
        }

        if (event.key == "ArrowUp")
        {
            if (menu.activeOption > 0)
            {
                setActiveOption(menu.activeOption - 1);
            }
        }

        if (event.key == "Escape")
        {
            close();
        }

    }
}

function onMenuMouseEnter(event)
{
    setActiveOption(event.target.index);
}

function setActiveOption(index)
{
    var menu = document.getElementById("mbunicodecharsMenu");
    var cn = menu.childNodes;
    if (menu.activeOption !== undefined)
    {
        cn[menu.activeOption].className = "mbunicodecharsOptionInactive";
    }
    menu.activeOption = index;
     cn[menu.activeOption].className = "mbunicodecharsOptionActive";
}


/*
  When a menu option is clicked, insert the caracter in the string and close the menu
*/
function onMenuOptionClic(event)
{
    var id = event.target.id;
    //Most of the time, we click on the children div, so we need the parent id
    if (id == "")
    {
        id = event.target.parentElement.id;
    }
    unsafeWindow.lastInputClicked.value = unsafeWindow.lastInputClicked.value.substr(0, unsafeWindow.selectionStart)
        + id.replace(/%s/g, unsafeWindow.lastInputClicked.value.substring(unsafeWindow.selectionStart, unsafeWindow.selectionEnd))
        + unsafeWindow.lastInputClicked.value.substr(unsafeWindow.selectionEnd);
    var menu = document.getElementById("mbunicodecharsMenu");
    var cn = menu.childNodes;
    cn[menu.activeOption].className = "mbunicodecharsOptionInactive";
    document.getElementById("mbunicodecharsMenu").className = "mbunicodecharsMenuHide";

    unsafeWindow.menuOpened = false;
    unsafeWindow.lastInputClicked.focus();
    if (id.length > 1 && unsafeWindow.selectionStart != unsafeWindow.selectionEnd) {
		unsafeWindow.lastInputClicked.setSelectionRange(unsafeWindow.selectionStart + 1, unsafeWindow.selectionEnd + 1);
    } else {
		unsafeWindow.lastInputClicked.setSelectionRange(unsafeWindow.selectionStart + 1, unsafeWindow.selectionStart + 1);
    }
    var ev = document.createEvent('HTMLEvents');
    ev.initEvent('change', true, true);
    unsafeWindow.lastInputClicked.dispatchEvent(ev);
}

function close(event)
{
    document.getElementById("mbunicodecharsMenu").className = "mbunicodecharsMenuHide";
    unsafeWindow.menuOpened = false;
    unsafeWindow.lastInputClicked.focus();
    unsafeWindow.lastInputClicked.setSelectionRange(unsafeWindow.selectionStart, unsafeWindow.selectionEnd);
}

function showSettings(event)
{
	alert("upcoming option");
}

function buildMenu()
{
    updateLanguagePack();
    var languagePacks = JSON.parse(localStorage.getItem("mb.unicodechars_languagePacks"));
    var menuItems = languagePacks[0].menuItems;

    var str = [];
    var dft = 1;
    str.push('<div class="mbunicodecharsOptionRow" id"closeOption"><div class="mbunicodecharsOptionLeftColumn">\
        </div><div class="mbunicodecharsOptionRightColumn" align="right"><button class="nobutton icon remove-item" title="CLose" type="button"></button></div></div>'); //close option, mandatory

    for (var i=0; i<menuItems.length; i++)
    {
        if (menuItems[i].enabled)
        {
            str.push('<div id="'+menuItems[i].code+'" class="mbunicodecharsOptionRow"><div class="mbunicodecharsOptionLeftColumn">'+menuItems[i].code.replace(/%s/g, "")+
                     '</div><div class="mbunicodecharsOptionRightColumn">'+menuItems[i].name+'</div></div>');
        }
        if (menuItems[i].default)
        {
            dft = i+1;
        }
    }

    str.push('<div class="mbunicodecharsOptionRow" id="settings"><div class="mbunicodecharsOptionLeftColumn">\
        </div><div class="mbunicodecharsOptionRightColumn" align="right">(upcoming) settings</div></div>');

    var newHTML = document.createElement('div');
    newHTML.innerHTML = '<div class="mbunicodecharsMenuHide" id="mbunicodecharsMenu">'+str.join("")+'</div>';
    document.body.appendChild(newHTML);
    document.getElementById("mbunicodecharsMenu").defaultOption = dft;
}


function updateLanguagePack(source)
{
    var languagePacks = JSON.parse(localStorage.getItem("mb.unicodechars_languagePacks"));
    var newLanguagePack;
    var currentLanguagePack;

    if (source === undefined)
    {
        //Update from local worldwide punctuation
        newLanguagePack = {"code":"XW", "name": "Worldwide punctuation", "version": "0.10.5", "menuItems":[]};

        if (languagePacks !== null)
        {
            currentLanguagePack = languagePacks.find(l => l.code == newLanguagePack.code && l.name == newLanguagePack.name);
            if (currentLanguagePack !== undefined && currentLanguagePack.version == newLanguagePack.version)
            {
                console.log("mb.unicodechars: same version found, no need to update");
                return;
            }
        }

        console.log("mb.unicodechars: update required to version "+newLanguagePack.version);

        newLanguagePack.menuItems = [
            {"code": "\u2018", "name": "Left Single Quote", "offset":1, "enabled":true, "default":false},
            {"code": "\u2019", "name": "Apostrophe, Right Single Quote", "offset":1, "enabled":true, "default":true},
            {"code": "\u2018%s\u2019", "name": "Left+Right Single Quotes", "offset":1, "enabled":true, "default":false},
            {"code": "\u201C", "name": "Left Double Quotes", "offset":1, "enabled":true, "default":false},
            {"code": "\u201D", "name": "Right Double Quotes", "offset":1, "enabled":true, "default":false},
            {"code": "\u201C%s\u201D", "name": "Left+Right Double Quotes", "offset":1, "enabled":true, "default":false},
            {"code": "\u300C%s\u300D", "name": "Left+Right Corner Brackets", "offset":1, "enabled":true, "default":false},
            {"code": "\u300E%s\u300F", "name": "Left+Right White Corner Brackets", "offset":1, "enabled":true, "default":false},
            {"code": "\u2026", "name": "Horizontal Ellipsis", "offset":1, "enabled":true, "default":false},
            {"code": "\u2010", "name": "Hyphen", "offset":1, "enabled":true, "default":false},
            {"code": "\u2013", "name": "En Dash", "offset":1, "enabled":true, "default":false},
            {"code": "\u2014", "name": "Em Dash", "offset":1, "enabled":true, "default":false},
            {"code": "\u2012", "name": "Figure Dash", "offset":1, "enabled":true, "default":false},
            {"code": "\u301C", "name": "Wave Dash", "offset":1, "enabled":true, "default":false},
            {"code": "\u2032", "name": "Prime", "offset":1, "enabled":true, "default":false},
            {"code": "\u2033", "name": "Double Prime", "offset":1, "enabled":true, "default":false},
            {"code": "\u2212", "name": "Minus Sign", "offset":1, "enabled":true, "default":false},
            {"code": "\u00D7", "name": "Multiplication Sign", "offset":1, "enabled":true, "default":false}
        ];
    }
    else
    {
        //TODO: load language chars from github
    }

    //now update the new language pack:
    if (currentLanguagePack !== undefined)
    {
        for (var i=0;i<newLanguagePack.menuItems.length; i++)
        {
            var f = currentLanguagePack.menuItems.find(item => item.code == newLanguagePack.menuItems[i].code);
            if (f !== undefined )
            {
                newLanguagePack.menuItems[i].enabled = f.enabled;
                newLanguagePack.menuItems[i].default = f.default;
            }
            else
            {
                //TODO: This must be a user defined item, must be added to the new items
                //Not a problem for now as user items are not implemented
            }
        }
    }

    if (languagePacks === null)
    {
        languagePacks = [];
        languagePacks.push(newLanguagePack);
    }
    else
    {
        currentLanguagePack.version = newLanguagePack.version;
        currentLanguagePack.menuItems = newLanguagePack.menuItems;
    }
    localStorage.setItem("mb.unicodechars_languagePacks",JSON.stringify(languagePacks));
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
