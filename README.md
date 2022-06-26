# userscripts

This repository contains custom userscripts:

- mb.unicodechars: 
Adds a context menu on Musicbrainz input texts and textareas to easily type unicodes characters like ’ (Apostrophe U+2019)
or … (Horizontal Ellipsis), Dashes, Quotes, and Primes.  Press Ctrl+M to display the context menu.

Tested under Chrome+Tampermonkey, Vivaldi+Violent Monkey (thanks @jesus2099), Firefox+Tampermonkey (thanks @rdswift) and Opera+Tampermonkey** (thanks @Lotheric).

** Under opera, the Ctrl+M shortcut of the script will overwrite the Opera default Ctrl+M for tab navigation. Just click out the inputbox to use Opera Ctrl+M tab navigation.

  0.10.3 : Add Multiplication Sign, Wave Dash and Corner Brackets

  0.10.2 : Navigate in 2D with +up+ right +down+ left arrow keys

  0.9.0: Hyphen and Minus signs added. Major rework of the code for future customization option
  
  0.8: Menu beautification, now loads only when called, plus minor fixes
  
  0.7: Close menu with Escape key

  0.6: Prime and double prime

  0.5: Fix menu visibility when created to hidden

  0.4: Firefox support + Minor fixes. Change menu font.

  0.3: Add simple and double opening and closing quotes. Add em and & en dash. Fix "suspension points" name to "Horizontal Ellipsis"
  
  0.2: Ctrl+M now replace Ctrl+RightClick to open the menu, hilight selected option, apostrophe (U+2020) selected by default, navigate      through menu option with up and down arrows
  
  0.1: First version for testing purpose, handling Ctrl+Right Click
