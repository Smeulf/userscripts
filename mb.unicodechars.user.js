// ==UserScript==
// @name         mb.unicodechars
// @namespace    https://github.com/Smeulf/userscripts
// @version      0.8
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
		    /*
			Create custom context menu if not exists
			*/
		if (!unsafeWindow.mbunicodecharMenuCreated)
		{
			var newHTML = document.createElement ('div');
			newHTML.innerHTML = buildMenu();
			document.body.appendChild (newHTML);
			unsafeWindow.mbunicodecharMenuCreated = true;
		}
		
        event.preventDefault();

        unsafeWindow.lastInputClicked = event.target;
        unsafeWindow.selectionStart = event.target.selectionStart;
        unsafeWindow.selectionEnd = event.target.selectionEnd;

        var rect = unsafeWindow.lastInputClicked.getBoundingClientRect();
        document.getElementById("mbunicodecharsMenu").style.top = (rect.bottom + window.scrollY) + 'px';
        document.getElementById("mbunicodecharsMenu").style.left = (rect.left + window.scrollX) + 'px';
        
        setActiveOption(2); //used for mouse enter

        var cn = document.getElementById("mbunicodecharsMenu").childNodes;
        cn[0].index = 0;
        cn[0].addEventListener('click',close);
        cn[0].addEventListener('mouseenter',menuMouseEnter);
        var i;
        for (i=1;i<cn.length-1;i++)
        {
            cn[i].index = i;
            cn[i].addEventListener('click', menuOption);
            cn[i].addEventListener('mouseenter',menuMouseEnter);
        }
		
		cn[cn.length-1].index = cn.length-1;
        cn[i].addEventListener('click', showSettings);
        cn[cn.length-1].addEventListener('mouseenter',menuMouseEnter);

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

        if (event.key == "Escape")
        {
            close();
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
    unsafeWindow.lastInputClicked.setSelectionRange(unsafeWindow.selectionStart, unsafeWindow.selectionEnd);
}

function showSettings(event)
{
	alert("upcoming option");
}

function buildMenu()
{
    var menuItems = JSON.parse(localStorage.getItem("mb.unicodechars_items"));
    if (menuItems === null)
    {
        menuItems = [
            ["\u2018", "Left Single Quotes"],
            ["\u2019", "Apostrophe, Right Single Quotes"],
            ["\u2018\u2019", "Left+Right Single Quotes"],
            ["\u201C", "Left Double Quotes"],
            ["\u201D", "Right Double Quotes"],
            ["\u201C\u201D", "Left+Right Double Quotes"],
            ["\u2026", "Horizontal Ellipsis"],
            ["\u2014", "Em Dash"],
            ["\u2013", "En Dash"],
            ["\u2032", "Prime"],
            ["\u2033", "Double Prime"]
        ];
        localStorage.setItem("mb.unicodechars_items",JSON.stringify(menuItems));
    }

    var str = [];
    str.push('<div class="mbunicodecharsOptionRow" id"closeOption"><div class="mbunicodecharsOptionLeftColumn">\
        </div><div class="mbunicodecharsOptionRightColumn" align="right"><button class="nobutton icon remove-item" title="CLose" type="button"></button></div></div>'); //close option, mandatory

    for (var i=0; i<menuItems.length; i++)
    {
     str.push('<div id="'+menuItems[i][0]+'" class="mbunicodecharsOptionRow"><div class="mbunicodecharsOptionLeftColumn">'+menuItems[i][0]+
              '</div><div class="mbunicodecharsOptionRightColumn">'+menuItems[i][1]+'</div></div>');
    }

    str.push('<div class="mbunicodecharsOptionRow" id="settings"><div class="mbunicodecharsOptionLeftColumn">\
        </div><div class="mbunicodecharsOptionRightColumn" align="right">(upcomming) settings</div></div>');

    return '<div class="mbunicodecharsMenuHide" id="mbunicodecharsMenu">'+str.join("")+'</div>';
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
