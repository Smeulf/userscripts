// ==UserScript==
// @name         mb.unicodechars
// @namespace    https://github.com/Smeulf/userscripts
// @version      0.10.3
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
    z-index: 1000;\
    position: absolute;\
    background-color: #E8E8E8;\
    display: flex;\
	flex-direction: row;\
    margin: 0px;\
    font-family: sans-serif;\
}\
.mbunicodecharsHide {\
    display: none;\
}\
.mbunicodecharsLanguageActive {\
    display: flex;\
    flex-wrap: wrap;\
    background-color: #C8C8C8;\
}\
.mbunicodecharsOptionInactive {\
    background-color: none;\
}\
.mbunicodecharsOptionActive {\
    background-color: #FFFF00;\
}\
.mbunicodecharsOptionChar {\
    padding: 3px;\
    min-width: 16px;\
    min-height: 16px;\
    max-width: 16px;\
    max-height: 16px;\
    background-color: none;\
    border: 1px solid #E8E8E8;\
    font-size: 16px;\
    text-align: center;\
}\
.mbunicodecharsOptionOther {\
    white-space: nowrap;\
	margin: 2px;\
    text-align: right;\
}\
.mbunicodecharsSettingsMenu {\
    position: absolute;\
    width: 500px;\
    height: 300px;\
    background-color: #D8D8D8;\
}\
.mbunicodecharsLanguagesPanel{\
    border: 2px solid blue;\
}\
.mbunicodecharsFlagsPanel {\
    background-color: none;\
    border: none;\
    display: flex;\
    flex-direction: column;\
}\
.mbunicodecharsFlag {\
    background-color: none;\
    padding: 6px;\
    border: 2px solid #E8E8E8;\
}\
.mbunicodecharsFlagActive {\
    background-color: #C8C8C8;\
    padding: 6px;\
    border: 2px solid blue;\
}\
.mbunicodecharsShowBox{\
    display: flex;\
    align-items: center;\
}\
.mbunicodecharsShowBoxLeft{\
    font-size: 40px;\
    min-width: 40px;\
    min-height: 40px;\
    text-align: center;\
    padding:10px;\
}\
.mbunicodecharsShowBowRight{\
    align-self: flex-start;\
    margin: 2px;\
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
    if (event.toString() == "[object KeyboardEvent]" && event.key == "m" && event.ctrlKey)
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

        var mainPanel = document.getElementById("mbunicodecharsMainPanel");
        var flagsPanel = document.getElementById("mbunicodecharsFlagsPanel");
        var languagesPanel = document.getElementById("mbunicodecharsLanguagesPanel");
        var language = languagesPanel.childNodes[languagesPanel.defaultLanguage];

        setActiveLanguage(languagesPanel.defaultLanguage);

        mainPanel.className = "mbunicodecharsMenuShow";

        var rect = unsafeWindow.lastInputClicked.getBoundingClientRect();

        if ($(window).height() - rect.bottom < $(mainPanel).height() && rect.top > $(mainPanel).height())
        {
            //There's not enough place for the menu to be displayed on bottom of the input,
            //but there's enough to show it on top
            flagsPanel.style.justifyContent = "flex-end";
            mainPanel.style.top = (rect.top + window.scrollY - $(mainPanel).height())+'px';
        }
        else
        {
            flagsPanel.style.justifyContent = "flex-start";
            mainPanel.style.top = (rect.bottom + window.scrollY) + 'px';
        }

        mainPanel.style.left = (rect.left + window.scrollX- (flagsPanel.className != "mbunicodecharsHide" ? $(flagsPanel).width() : 0 )) + 'px';
        unsafeWindow.menuOpened = true;

        $(window).resize( function() {
            rect = unsafeWindow.lastInputClicked.getBoundingClientRect();
            mainPanel.style.top = flagsPanel.style.justifyContent == "flex-start" ? (rect.bottom + window.scrollY) + 'px' : (rect.top + window.scrollY - $(mainPanel).height())+'px';
            mainPanel.style.left = (rect.left + window.scrollX - (flagsPanel.className != "mbunicodecharsHide" ? $(flagsPanel).width() : 0 )) + 'px';
        });
    }
}

function navigateMenu(event)
{
    if (unsafeWindow.menuOpened && event.key.match(/ArrowDown|ArrowUp|ArrowLeft|ArrowRight|Enter|Escape|Tab/))
    {
        event.preventDefault();
        event.cancelBubble = true;
        var languagesPanel = document.getElementById("mbunicodecharsLanguagesPanel");
        var menu = languagesPanel.childNodes[languagesPanel.activeLanguage];
        var cn = menu.childNodes;

        if (event.key == "Enter")
        {
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent('click', true, false);
            cn[menu.activeOption].dispatchEvent(ev);
        }
        else if (event.key.match(/ArrowRight/))
        {
            if (cn.length -1 > menu.activeOption)
            {
                //we need to skip the option at index 1 (showBox)
                setActiveOption(menu.activeOption + (menu.activeOption==0 ? 2:1));
            }
        }
        else if (event.key.match(/ArrowLeft/))
        {
            if (menu.activeOption > 0)
            {
                //we need to skip the option at index 1 (showBox)
                setActiveOption(menu.activeOption - (menu.activeOption==2 ? 2:1));
            }
        }
        else if (event.key.match(/ArrowDown/))
        {
            //we need to skip the option at index 1 (showBox)
            //we have 8 items per row: 192 (languagePanel width size var) / 24 (mbunicodecharsOptionChar border + padding + width)
            setActiveOption(Math.min(menu.activeOption + (menu.activeOption==0 ? 2:8), cn.length -1));
        }
        else if (event.key.match(/ArrowUp/))
        {
            //we need to skip the option at index 1 (showBox)
            setActiveOption(Math.max(menu.activeOption - (menu.activeOption==2 ? 2:8), 0));
        }
        else if (event.key == "Escape")
        {
            close();
        }
        else if (event.key == "Tab" && languagesPanel.childNodes.length>1)
        {
            var direction = event.shiftKey ? -1 : 1;
            var newIndex = languagesPanel.activeLanguage+direction;

            if (direction > 0)
            {
                newIndex = newIndex < languagesPanel.childNodes.length ? newIndex : 0;
            }
            else
            {
                newIndex = newIndex >= 0 ? newIndex : languagesPanel.childNodes.length;
            }
            setActiveLanguage(newIndex);
        }

    }
}

function onMenuMouseEnter(event)
{
    setActiveOption(event.target.index);
}

function setActiveOption(index)
{
    var languagesPanel = document.getElementById("mbunicodecharsLanguagesPanel");
    var menu = languagesPanel.childNodes[languagesPanel.activeLanguage];
    var cn = menu.childNodes;
    if (menu.activeOption !== undefined)
    {
        cn[menu.activeOption].className = "mbunicodecharsOptionInactive";
    }
    menu.activeOption = index;
    cn[menu.activeOption].className = "mbunicodecharsOptionActive";
    cn[menu.activeOption].focus();

    if (index > 0 && index < cn.length-1)
    {
        cn[1].childNodes[0].textContent = (cn[menu.activeOption].isCombiningChar ? "\u25CC" : "") + cn[menu.activeOption].childNodes[0].textContent;
        cn[1].childNodes[1].textContent = cn[menu.activeOption].name;
    }
    else
    {
        cn[1].childNodes[0].textContent = "\u00A0";
        cn[1].childNodes[1].textContent = "";
    }
}

function setActiveLanguage(index)
{
    var languagesPanel = document.getElementById("mbunicodecharsLanguagesPanel");
    var flagsPanel = document.getElementById("mbunicodecharsFlagsPanel");

    languagesPanel.childNodes[languagesPanel.activeLanguage].className = "mbunicodecharsHide";
    languagesPanel.childNodes[index].className = "mbunicodecharsLanguageActive";

    flagsPanel.childNodes[languagesPanel.activeLanguage].className = "mbunicodecharsFlag";
    flagsPanel.childNodes[index].className = "mbunicodecharsFlagActive";
    languagesPanel.activeLanguage = index;
    setActiveOption(languagesPanel.childNodes[index].defaultOption);

    if (flagsPanel.style.justifyContent == "flex-end") //flags are shown
    {
        var rect = unsafeWindow.lastInputClicked.getBoundingClientRect();
        flagsPanel.parentElement.style.top = (rect.top + window.scrollY - $(flagsPanel.parentElement).height())+'px';
    }
}

/*
  When a menu option is clicked, insert the caracter in the string and close the menu
*/
function onMenuOptionClic(event)
{
    
    var element = event.target;
    //Most of the time, we click on the children div, so we need the parent element code
    if (element.code === undefined)
    {
        element = event.target.parentElement;
    }
    var code = element.code;
    var offset = element.offset;

    var selectionStart = unsafeWindow.lastInputClicked.selectionStart;
    var selectionEnd = unsafeWindow.lastInputClicked.selectionEnd;

    if (element.isCombiningChar)
    {
        if (selectionEnd - selectionStart != 1)
        {
            alert("You must select one and only one character in the input text to add a diacritic on it");
            return;
        }

        //console.log("combining char found");
        //console.log(unsafeWindow.lastInputClicked.value.substring(selectionStart, selectionEnd).toUnicode());
        code = unsafeWindow.lastInputClicked.value.substring(selectionStart, selectionEnd)+code;
        //console.log(code.toUnicode());
        code = code.normalize('NFC');
        if (code.length > 1)
        {
            if (!confirm("\u26A0 The "+code+" caracter is not normalized. Are you sure?"))
            {
                return;
            }
        }
        //console.log(code);
        //console.log(code.toUnicode());
    }

    unsafeWindow.lastInputClicked.value = unsafeWindow.lastInputClicked.value.substr(0, selectionStart)
        + code
        + unsafeWindow.lastInputClicked.value.substr(selectionEnd);

    var languagesPanel = document.getElementById("mbunicodecharsLanguagesPanel");
    var menu = languagesPanel.childNodes[languagesPanel.defaultLanguage];
    var cn = menu.childNodes;
    cn[menu.activeOption].className = "mbunicodecharsOptionInactive";
    document.getElementById("mbunicodecharsMainPanel").className = "mbunicodecharsHide";

    unsafeWindow.menuOpened = false;
    unsafeWindow.lastInputClicked.focus();
    unsafeWindow.lastInputClicked.setSelectionRange(selectionStart+offset+(element.isCombiningChar ? code.length-1:0),
                                                    selectionStart+offset+(element.isCombiningChar ? code.length-1:0));
    var ev = document.createEvent('HTMLEvents');
    ev.initEvent('change', true, true);
    unsafeWindow.lastInputClicked.dispatchEvent(ev);}

function onFlagClic(event)
{
    event.preventDefault();
    var target = event.target;
    while (target.index === undefined)
    {
        target=target.parentElement;
    }
    setActiveLanguage(target.index);
}

function close(event)
{
    document.getElementById("mbunicodecharsMainPanel").className = "mbunicodecharsHide";
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
    //if (languagePacks === null)
    //{
        updateLanguagePack("XW_Diacritics");
        updateLanguagePack("XE_ExtendedLatin");
        updateLanguagePack("GR_Greek");
        updateLanguagePack("CJK");
    //}
    
    var mainPanel = document.createElement('div');
    mainPanel.id = "mbunicodecharsMainPanel";
    mainPanel.className="mbunicodecharsHide";

    var languagesPanel = document.createElement('div');
    languagesPanel.className = "mbunicodecharsLanguagesPanel";
    languagesPanel.id = "mbunicodecharsLanguagesPanel";

    var flagsPanel = document.createElement('div');
    flagsPanel.className = "mbunicodecharsFlagsPanel";
    flagsPanel.style.width = "55px"; //Force width, won't work correctly using styles to determine the size while the panel is hidden
    flagsPanel.id = "mbunicodecharsFlagsPanel";

    var languagePacks = JSON.parse(localStorage.getItem("mb.unicodechars_languagePacks"));

    var size = "192px"; //Languagepanel width

    languagePacks.forEach( function(lp) {

        var flag = document.createElement('div');
        flag.innerHTML = '<span class="flag flag-'+lp.code+'"><abbr title="'+lp.name+'">'+lp.code+'</abbr></span>';
        flag.className = "mbunicodecharsFlag";
        flag.index = flagsPanel.childNodes.length;
        flag.addEventListener('mousedown', onFlagClic);
        flagsPanel.appendChild(flag);

        var menuItems = lp.menuItems;

        var languagePanel = document.createElement('div');
        languagePanel.className="mbunicodecharsHide";
        languagePanel.id = lp.code+"_"+lp.name;
        languagePanel.style.width = size; //fixed size rather than in css style to ensure getting panel size if hidden

        var itemIndex = 0; //We need to maintain index reference because some items might be dropped if disabled
        var dft = 0; // default value for focused item
        var item;

        //close option, mandatory
        var closeItem = document.createElement('div');
        closeItem.className = "mbunicodecharsOptionInactive";
        closeItem.style.width = size; //fixed size rather than in css style to ensure getting panel size if hidden
        closeItem.index = 0;
        closeItem.addEventListener('click',close);
        closeItem.addEventListener('mouseenter',onMenuMouseEnter);
        closeItem.innerHTML = '<div class="mbunicodecharsOptionOther"><button class="nobutton icon remove-item" title="Close" type="button"></button></div>';

        languagePanel.appendChild(closeItem);

        //showbox, mandatory
        //TODO : Move styles to css except width
        var showBox = document.createElement('div');
        showBox.className = "mbunicodecharsShowBox";
        showBox.style.width = size; //fixed size rather than in css style to ensure getting panel size if hidden
        showBox.innerHTML = '<div class="mbunicodecharsShowBoxLeft">\u00A0</div>';
        showBox.innerHTML += '<div class="mbunicodecharsShowBoxRight">\u00A0</div>';
        showBox.index = ++itemIndex;

        languagePanel.appendChild(showBox)

        for (var j=0; j<menuItems.length; j++)
        {
            if (menuItems[j].enabled)
            {
                item = document.createElement('div');
                item.className = "mbunicodecharsOptionInactive";
                item.index = ++itemIndex;
                item.addEventListener('click', onMenuOptionClic);
                item.addEventListener('mouseenter',onMenuMouseEnter);
                item.innerHTML = '<div class="mbunicodecharsOptionChar">'+menuItems[j].code+'</div>'

                item.code = menuItems[j].code;
                item.name = menuItems[j].name;
                item.offset = menuItems[j].offset;
                item.isCombiningChar = menuItems[j].code.isCombiningCharacter();

                if (menuItems[j].default)
                {
                    dft = itemIndex;
                }

                languagePanel.appendChild(item);
            }
        }

        item = document.createElement('div');
        item.style.width = size; //fixed size rather than in css style to ensure getting panel size if hidden
        item.className = "mbunicodecharsOptionInactive";
        item.id = "settings";
        item.index = ++itemIndex;
        item.innerHTML = '<div class="mbunicodecharsOptionOther">(upcoming) settings</div>';
        item.addEventListener('click', showSettings);
        item.addEventListener('mouseenter',onMenuMouseEnter);
        languagePanel.appendChild(item);

        languagePanel.defaultOption = dft;

        languagesPanel.appendChild(languagePanel);
    });

    languagesPanel.defaultLanguage=0;
    languagesPanel.activeLanguage = 0;

    //load flags css if not in the page, and if requiried
    if (flagsPanel.childNodes.length > 1)
    {
        var cssFileName = "https://staticbrainz.org/MB/styles/icons-5610cb57fe.css";
        var css = $('link[href="https://staticbrainz.org/MB/styles/icons-5610cb57fe.css"]')[0];
        if (css === undefined)
        {
            console.log("Adding icons CSS");
            var newCSS = document.createElement('link');
            newCSS.type = "text/css";
            newCSS.rel = "stylesheet";
            newCSS.href = cssFileName;
            document.head.appendChild(newCSS);
        }
    }
    else // lese hide flags panel
    {
        flagsPanel.className = "mbunicodecharsHide";
    }

    mainPanel.appendChild(flagsPanel);
    mainPanel.appendChild(languagesPanel);
    
    document.body.appendChild(mainPanel);
}

function updateLanguagePack(source)
{
    var languagePacks = JSON.parse(localStorage.getItem("mb.unicodechars_languagePacks"));
    var newLanguagePack;
    var currentLanguagePack;

    if (source === undefined)
    {
        //Update from local worldwide punctuation
        newLanguagePack = {"code":"XW", "name": "Worldwide punctuation", "version": "0.10.3", "menuItems":[]};

        if (languagePacks !== null)
        {
            currentLanguagePack = languagePacks.find(l => l.code == newLanguagePack.code && l.name == newLanguagePack.name);
            if (currentLanguagePack !== undefined && currentLanguagePack.version == newLanguagePack.version)
            {
                console.log("mb.unicodechars: same version found, no need to update");
                return;
            }
        }

        console.log("mb.unicodechars: update requiried to version "+newLanguagePack.version);

        newLanguagePack.menuItems = [
            {"code": "\u2018", "name": "Left single quotation mark", "offset":1, "enabled":true, "default":false},
            {"code": "\u2019", "name": "Apostrophe, Right single quotation mark", "offset":1, "enabled":true, "default":true},
            {"code": "\u2018\u2019", "name": "Left+Right single quotation marks", "offset":1, "enabled":true, "default":false},
            {"code": "\u201C", "name": "Left double quotation mark", "offset":1, "enabled":true, "default":false},
            {"code": "\u201D", "name": "Right double quotation mark", "offset":1, "enabled":true, "default":false},
            {"code": "\u201C\u201D", "name": "Left+Right double quotation marks", "offset":1, "enabled":true, "default":false},
            {"code":"\u00AB","name":"Left-pointing double angle quotation mark","offset":1, "enabled":true,"default":false},
            {"code":"\u00BB","name":"Right-pointing double angle quotation mark","offset":1, "enabled":true,"default":false},
            {"code":"\u00AB\u00BB","name":"Left-pointing+Right-pointing double angle quotation mark","offset":1, "enabled":true,"default":false},
            {"code": "\u2026", "name": "Horizontal ellipsis", "offset":1, "enabled":true, "default":false},
            {"code": "\u2010", "name": "Hyphen", "offset":1, "enabled":true, "default":false},
            {"code": "\u2212", "name": "Minus sign", "offset":1, "enabled":true, "default":false},
            {"code": "\u2013", "name": "En dash", "offset":1, "enabled":true, "default":false},
            {"code": "\u2014", "name": "Em dash", "offset":1, "enabled":true, "default":false},
            {"code": "\u2032", "name": "Prime", "offset":1, "enabled":true, "default":false},
            {"code": "\u2033", "name": "Double prime", "offset":1, "enabled":true, "default":false},
            {"code": "\u00BF", "name": "Inverted question mark", "offset":1, "enabled":true, "default":false},
            {"code": "\u00A1", "name": "Inverted exclamation mark", "offset":1, "enabled":true, "default":false},
            {"code": "\u00D7", "name": "Multiplication Sign", "offset":1, "enabled":true, "default":false}
        ];

        processLanguagePackUpdate(languagePacks, currentLanguagePack, newLanguagePack);

    }
    else
    {
        var jRequest = $.getJSON( 'https://raw.githubusercontent.com/Smeulf/userscripts/extradev/languages/'+source+'.json')
        //var jRequest = $.getJSON( 'http://localhost/languages/'+source+'.json') //for local dev only
        .done(function() {
            newLanguagePack = jRequest.responseJSON;
            if (languagePacks !== null)
            {
                currentLanguagePack = languagePacks.find(l => l.code == newLanguagePack.code && l.name == newLanguagePack.name);
                if (currentLanguagePack !== undefined && currentLanguagePack.version == newLanguagePack.version)
                {
                    console.log("mb.unicodechars: Language pack "+newLanguagePack.code+"_"+newLanguagePack.name+": same version "+
                                newLanguagePack.version +" found, no need to update");
                    return;
                }
            }
            var d = processLanguagePackUpdate(languagePacks, currentLanguagePack, newLanguagePack);
        })
        .error(function(jqXHR, textStatus, errorThrown) {
            console.log("error " + textStatus);
            console.log("incoming Text " + jqXHR.responseText);
        })
        .fail(function() {
            console.log( "error while loading JSON" );
        });
    }
}

function processLanguagePackUpdate(languagePacks, currentLanguagePack, newLanguagePack)
{
    console.log("now update the new language pack");
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
                //TODO: This would be a user defined item, must be added to the new items
                //Not a problem for now as user items are not implemented
            }
        }
    }

    if (languagePacks === null)
    {
        languagePacks = [];
        languagePacks.push(newLanguagePack);
    }
    else if (currentLanguagePack === undefined)
    {
        languagePacks.push(newLanguagePack);
    }
    else
    {
        currentLanguagePack.version = newLanguagePack.version;
        currentLanguagePack.menuItems = newLanguagePack.menuItems;
    }
    localStorage.setItem("mb.unicodechars_languagePacks",JSON.stringify(languagePacks));
}

function getCountries()
{
    var countries = unsafeWindow.mbunicodecharsCountries;
    if(countries === undefined)
    {
        countries = {"XW":"[Worldwide]",
                     "CJK":"[CJK]",
                     "AF":"Afghanistan",
                     "AX":"Åland Islands",
                     "AL":"Albania",
                     "DZ":"Algeria",
                     "AS":"American Samoa",
                     "AD":"Andorra",
                     "AO":"Angola",
                     "AI":"Anguilla",
                     "AQ":"Antarctica",
                     "AG":"Antigua and Barbuda",
                     "AR":"Argentina",
                     "AM":"Armenia",
                     "AW":"Aruba",
                     "AU":"Australia",
                     "AT":"Austria",
                     "AZ":"Azerbaijan",
                     "BS":"Bahamas",
                     "BH":"Bahrain",
                     "BD":"Bangladesh",
                     "BB":"Barbados",
                     "BY":"Belarus",
                     "BE":"Belgium",
                     "BZ":"Belize",
                     "BJ":"Benin",
                     "BM":"Bermuda",
                     "BT":"Bhutan",
                     "BO":"Bolivia",
                     "BA":"Bosnia and Herzegovina",
                     "BW":"Botswana",
                     "BV":"Bouvet Island",
                     "BR":"Brazil",
                     "IO":"British Indian Ocean Territory",
                     "BN":"Brunei Darussalam",
                     "BG":"Bulgaria",
                     "BF":"Burkina Faso",
                     "BI":"Burundi",
                     "KH":"Cambodia",
                     "CM":"Cameroon",
                     "CA":"Canada",
                     "CV":"Cape Verde",
                     "KY":"Cayman Islands",
                     "CF":"Central African Republic",
                     "TD":"Chad",
                     "CL":"Chile",
                     "CN":"China",
                     "CX":"Christmas Island",
                     "CC":"Cocos (Keeling) Islands",
                     "CO":"Colombia",
                     "KM":"Comoros",
                     "CG":"Congo",
                     "CD":"Congo, The Democratic Republic of the",
                     "CK":"Cook Islands",
                     "CR":"Costa Rica",
                     "CI":"Cote d'Ivoire",
                     "HR":"Croatia",
                     "CU":"Cuba",
                     "CY":"Cyprus",
                     "XC":"Czechoslovakia",
                     "CZ":"Czech Republic",
                     "DK":"Denmark",
                     "DJ":"Djibouti",
                     "DM":"Dominica",
                     "DO":"Dominican Republic",
                     "XG":"East Germany",
                     "EC":"Ecuador",
                     "EG":"Egypt",
                     "SV":"El Salvador",
                     "GQ":"Equatorial Guinea",
                     "ER":"Eritrea",
                     "EE":"Estonia",
                     "ET":"Ethiopia",
                     "XE":"Europe",
                     "FK":"Falkland Islands (Malvinas)",
                     "FO":"Faroe Islands",
                     "FJ":"Fiji",
                     "FI":"Finland",
                     "FR":"France",
                     "GF":"French Guiana",
                     "PF":"French Polynesia",
                     "TF":"French Southern Territories",
                     "GA":"Gabon",
                     "GM":"Gambia",
                     "GE":"Georgia",
                     "DE":"Germany",
                     "GH":"Ghana",
                     "GI":"Gibraltar",
                     "GR":"Greece",
                     "GL":"Greenland",
                     "GD":"Grenada",
                     "GP":"Guadeloupe",
                     "GU":"Guam",
                     "GT":"Guatemala",
                     "GG":"Guernsey",
                     "GN":"Guinea",
                     "GW":"Guinea-Bissau",
                     "GY":"Guyana",
                     "HT":"Haiti",
                     "HM":"Heard and Mc Donald Islands",
                     "HN":"Honduras",
                     "HK":"Hong Kong",
                     "HU":"Hungary",
                     "IS":"Iceland",
                     "IN":"India",
                     "ID":"Indonesia",
                     "IR":"Iran (Islamic Republic of)",
                     "IQ":"Iraq",
                     "IE":"Ireland",
                     "IM":"Isle of Man",
                     "IL":"Israel",
                     "IT":"Italy",
                     "JM":"Jamaica",
                     "JP":"Japan",
                     "JE":"Jersey",
                     "JO":"Jordan",
                     "KZ":"Kazakhstan",
                     "KE":"Kenya",
                     "KI":"Kiribati",
                     "KP":"Korea (North), Democratic People's Republic of",
                     "KR":"Korea (South), Republic of",
                     "KW":"Kuwait",
                     "KG":"Kyrgyzstan",
                     "LA":"Lao People's Democratic Republic",
                     "LV":"Latvia",
                     "LB":"Lebanon",
                     "LS":"Lesotho",
                     "LR":"Liberia",
                     "LY":"Libyan Arab Jamahiriya",
                     "LI":"Liechtenstein",
                     "LT":"Lithuania",
                     "LU":"Luxembourg",
                     "MO":"Macau",
                     "MK":"Macedonia, The Former Yugoslav Republic of",
                     "MG":"Madagascar",
                     "MW":"Malawi",
                     "MY":"Malaysia",
                     "MV":"Maldives",
                     "ML":"Mali",
                     "MT":"Malta",
                     "MH":"Marshall Islands",
                     "MQ":"Martinique",
                     "MR":"Mauritania",
                     "MU":"Mauritius",
                     "YT":"Mayotte",
                     "MX":"Mexico",
                     "FM":"Micronesia, Federated States of",
                     "MD":"Moldova, Republic of",
                     "MC":"Monaco",
                     "MN":"Mongolia",
                     "ME":"Montenegro",
                     "MS":"Montserrat",
                     "MA":"Morocco",
                     "MZ":"Mozambique",
                     "MM":"Myanmar",
                     "NA":"Namibia",
                     "NR":"Nauru",
                     "NP":"Nepal",
                     "NL":"Netherlands",
                     "AN":"Netherlands Antilles",
                     "NC":"New Caledonia",
                     "NZ":"New Zealand",
                     "NI":"Nicaragua",
                     "NE":"Niger",
                     "NG":"Nigeria",
                     "NU":"Niue",
                     "NF":"Norfolk Island",
                     "MP":"Northern Mariana Islands",
                     "NO":"Norway",
                     "OM":"Oman",
                     "PK":"Pakistan",
                     "PW":"Palau",
                     "PS":"Palestinian Territory",
                     "PA":"Panama",
                     "PG":"Papua New Guinea",
                     "PY":"Paraguay",
                     "PE":"Peru",
                     "PH":"Philippines",
                     "PN":"Pitcairn",
                     "PL":"Poland",
                     "PT":"Portugal",
                     "PR":"Puerto Rico",
                     "QA":"Qatar",
                     "RE":"Reunion",
                     "RO":"Romania",
                     "RU":"Russian Federation",
                     "RW":"Rwanda",
                     "BL":"Saint Barthélemy",
                     "SH":"Saint Helena",
                     "KN":"Saint Kitts and Nevis",
                     "LC":"Saint Lucia",
                     "MF":"Saint Martin",
                     "PM":"Saint Pierre and Miquelon",
                     "VC":"Saint Vincent and The Grenadines",
                     "WS":"Samoa",
                     "SM":"San Marino",
                     "ST":"Sao Tome and Principe",
                     "SA":"Saudi Arabia",
                     "SN":"Senegal",
                     "RS":"Serbia",
                     "CS":"Serbia and Montenegro",
                     "SC":"Seychelles",
                     "SL":"Sierra Leone",
                     "SG":"Singapore",
                     "SK":"Slovakia",
                     "SI":"Slovenia",
                     "SB":"Solomon Islands",
                     "SO":"Somalia",
                     "ZA":"South Africa",
                     "GS":"South Georgia and the South Sandwich Islands",
                     "SU":"Soviet Union",
                     "ES":"Spain",
                     "LK":"Sri Lanka",
                     "SD":"Sudan",
                     "SR":"Suriname",
                     "SJ":"Svalbard and Jan Mayen",
                     "SZ":"Swaziland",
                     "SE":"Sweden",
                     "CH":"Switzerland",
                     "SY":"Syrian Arab Republic",
                     "TW":"Taiwan",
                     "TJ":"Tajikistan",
                     "TZ":"Tanzania, United Republic of",
                     "TH":"Thailand",
                     "TL":"Timor-Leste",
                     "TG":"Togo",
                     "TK":"Tokelau",
                     "TO":"Tonga",
                     "TT":"Trinidad and Tobago",
                     "TN":"Tunisia",
                     "TR":"Turkey",
                     "TM":"Turkmenistan",
                     "TC":"Turks and Caicos Islands",
                     "TV":"Tuvalu",
                     "UG":"Uganda",
                     "UA":"Ukraine",
                     "AE":"United Arab Emirates",
                     "GB":"United Kingdom",
                     "US":"United States",
                     "UM":"United States Minor Outlying Islands",
                     "XU":"[Unknown Country]",
                     "UY":"Uruguay",
                     "UZ":"Uzbekistan",
                     "VU":"Vanuatu",
                     "VA":"Vatican City State (Holy See)",
                     "VE":"Venezuela",
                     "VN":"Viet Nam",
                     "VG":"Virgin Islands, British",
                     "VI":"Virgin Islands, U.S.",
                     "WF":"Wallis and Futuna Islands",
                     "EH":"Western Sahara",
                     "YE":"Yemen",
                     "YU":"Yugoslavia",
                     "ZM":"Zambia",
                     "ZW":"Zimbabwe"
                    };
        unsafeWindow.mbunicodecharsCountries = countries;
    }
    return countries;
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

String.prototype.toUnicode = function(){
    var result = "";
    for(var i = 0; i < this.length; i++){
        // Assumption: all characters are < 0xffff
        result += "\\u" + ("000" + this[i].charCodeAt(0).toString(16)).substr(-4);
    }
    return result;
};

String.prototype.isCombiningCharacter = function(){
    if (this.length == 0 || this.length > 1)
    {
        return false;
    }
    else
    {
        var val = "0x"+this[0].charCodeAt(0).toString(16);
        return (val >= 0x0300 && val <= 0x036F || // Combining Diacritical Marks
                val >= 0x1AB0 && val <= 0x1AFF || // Combining Diacritical Marks Extended
                val >= 0x1DC0 && val <= 0x1DFF || // Combining Diacritical Marks Supplement
                val >= 0x20D0 && val <= 0x20FF || // Combining Diacritical Marks for Symbols
                val >= 0xFE20 && val <= 0xFE2F)   // Combining Half Marks
    }
}
