/*
//
// BEGIN SONGBIRD GPL
//
// This file is part of the Songbird web player.
//
// Copyright(c) 2005-2008 POTI, Inc.
// http://songbirdnest.com
//
// This file may be licensed under the terms of of the
// GNU General Public License Version 2 (the "GPL").
//
// Software distributed under the License is distributed
// on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, either
// express or implied. See the GPL for the specific language
// governing rights and limitations.
//
// You should have received a copy of the GPL along with this
// program. If not, go to http://www.gnu.org/licenses/gpl.html
// or write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
//
// END SONGBIRD GPL
//
 */

/**
 * \file windowUtils.js
 * \brief Window Utility constants, functions and objects that are common
 * to all windows.
 *
 * Note: This file is dependent on chrome://global/content/globalOverlay.js
 */

/**
 * \brief The Songbird Core Window Type.
 */
var CORE_WINDOWTYPE         = "Songbird:Core";

/**
 * \brief Maximized State value.
 */
var STATE_MAXIMIZED         = Components.interfaces.nsIDOMChromeWindow.STATE_MAXIMIZED;

/**
 * \brief Minimized State value.
 */
var STATE_MINIMIZED         = Components.interfaces.nsIDOMChromeWindow.STATE_MINIMIZED;

// Convenient globals.
var gPPS     = Components.classes["@songbirdnest.com/Songbird/PlaylistPlayback;1"]
                      .getService(Components.interfaces.sbIPlaylistPlayback);
var gPrompt  = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                      .getService(Components.interfaces.nsIPromptService);
var gPrefs   = Components.classes["@mozilla.org/preferences-service;1"]
                      .getService(Components.interfaces.nsIPrefBranch);
var gConsole = Components.classes["@mozilla.org/consoleservice;1"]
                      .getService(Components.interfaces.nsIConsoleService);
                      
if (typeof(Cc) == "undefined")
  var Cc = Components.classes;
if (typeof(Ci) == "undefined")
  var Ci = Components.interfaces;
if (typeof(Cu) == "undefined")
  var Cu = Components.utils;
if (typeof(Cr) == "undefined")
  var Cr = Components.results;



// Strings are cool.
var theSongbirdStrings = document.getElementById( "songbird_strings" );

// log to JS console AND to the command line (in case of crashes)
function SB_LOG (scopeStr, msg) {
  msg = msg ? msg : "";
  //This works, but adds everything as an Error
  //Components.utils.reportError( scopeStr + " : " + msg);
  gConsole.logStringMessage( scopeStr + " : " + msg );
  dump( scopeStr + " : " + msg + "\n");
}

var PREFS_SERVICE_CONTRACTID = "@mozilla.org/preferences-service;1";
var nsIPrefBranch2 = Components.interfaces.nsIPrefBranch2;
/**
 * \brief Get a preference.
 * Adapted from nsUpdateService.js.in. Need to replace with dataremotes.
 * \param aFunc Function to used to retrieve the pref.
 * \param aPreference The name of the pref to retrieve.
 * \param aDefaultValue The default value to return if it is impossible to read the pref or it does not exist.
 * \internal
 */
function getPref(aFunc, aPreference, aDefaultValue) {
  var prefs =
    Components.classes[PREFS_SERVICE_CONTRACTID].getService(nsIPrefBranch2);
  try {
    return prefs[aFunc](aPreference);
  }
  catch (e) { }
  return aDefaultValue;
}

/**
 * \brief Set a preference.
 * \param aFunc Function to used to set the pref.
 * \param aPreference The name of the pref to set.
 * \param aValue The value of the pref.
 * \return The return value of the function used to set the pref.
 * \internal
 */
function setPref(aFunc, aPreference, aValue) {
  var prefs =
    Components.classes[PREFS_SERVICE_CONTRACTID].getService(nsIPrefBranch2);
  return prefs[aFunc](aPreference, aValue);
}

/**
 * \brief onMinimize handler, minimizes the window in the current context.
 * \internal
 */
function onMinimize()
{
  document.defaultView.minimize();
}

/**
 * \brief onMaximize handler, maximizes the window in the current context.
 * \internal
 */
function onMaximize()
{
  if ( isMaximized() )
  {
    document.defaultView.restore();
  }
  else
  {
    document.defaultView.maximize();
  }
  // TODO
  //syncMaxButton();
  //syncResizers();
}

/**
 * \brief Is the window in the current context maximized?
 * \return true or false.
 * \internal
 */
function isMaximized() {
  return (window.windowState == STATE_MAXIMIZED);
}

/**
 * \brief Is the window in the current context minimized?
 * \return true or false.
 * \internal
 */
function isMinimized() {
  return (window.windowState == STATE_MINIMIZED);
}

/* TODO: These broke circa 0.2.  The logic needs to be moved into sys-outer-frame
function syncMaxButton()
{
  var maxButton = document.getElementById("sysbtn_maximize");
  if (maxButton)
  {
    if (isMaximized()) maxButton.setAttribute("checked", "true");
    else maxButton.removeAttribute("checked");
  }
}
function syncResizers()
{
  // TODO?
  if (isMaximized()) disableResizers();
  else enableResizers();
}
*/

/**
 * \brief Restore the window in the current context to unmaximized state.
 * \internal
 */
function restoreWindow()
{
  if ( isMaximized() )
  {
    document.defaultView.restore();
  }
  
  // TODO
  //syncMaxButton();
  //syncResizers();
}

/**
 * \brief onExit handler, saves window size and position before closing the window.
 * \internal
 */
function onExit( skipSave )
{
  document.defaultView.close();
}

/**
 * \brief onHide handler, handles hiding the window in the current context.
 * \internal
 */
function onHide()
{
  var windowCloak =
    Components.classes["@songbirdnest.com/Songbird/WindowCloak;1"]
              .getService(Components.interfaces.sbIWindowCloak);
  windowCloak.cloak(window);

  // And try to focus another of our windows. We'll try to focus in this order:
  var windowList = ["Songbird:Main",
                    "Songbird:TrackEditor",
                    "Songbird:Firstrun",
                    "Songbird:EULA"];
  var windowCount = windowList.length;

  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);

  for (var index = 0; index < windowCount; index++) {
    var windowType = windowList[index];
    var lastWindow = wm.getMostRecentWindow(windowType);
    if (lastWindow && (lastWindow != window)) {
      try {
        lastWindow.focus();
      } catch (e) {}
      break;
    }
  }

}


/**
 * \brief Handles completion of resizing of the window in the current context.
 */
function onWindowResizeComplete() {
  var d = window.document;
  var dE = window.document.documentElement;
  if (dE.getAttribute("persist").match("width"))  { d.persist(dE.id, "width");  }
  if (dE.getAttribute("persist").match("height")) { d.persist(dE.id, "height"); }
}

/**
 * \brief Handles completion of dragging of the window in the current context.
 */
function onWindowDragComplete() {
  var d = window.document;
  var dE = window.document.documentElement;
  if (dE.getAttribute("persist").match("screenX")) { d.persist(dE.id, "screenX");  }
  if (dE.getAttribute("persist").match("screenY")) { d.persist(dE.id, "screenY"); }
}

/**
 * \brief Focus the window in the current context.
 */
function windowFocus()
{
  // Try to activate the window if it isn't cloaked.
  var windowCloak =
    Components.classes["@songbirdnest.com/Songbird/WindowCloak;1"]
              .getService(Components.interfaces.sbIWindowCloak);
  if (windowCloak.isCloaked(window))
    return;

  try {
    window.focus();
  } catch(e) {
  }
}

/**
 * \brief Delayed focus of the window in the current context.
 */
function delayedActivate()
{
  setTimeout( windowFocus, 50 );
}

/**
 * \brief See if a window needs to be somehow "fixed" after it is opened.
 *
 * In addition to loading the size and position (if stored), we also perform some sanity checks. 
 * The window must be:
 * - sized appropriately if we have never seen it before
 * - not too small for its min-size styles or some default minimum.
 * - actually on screen somewhere.
 * 
 */
function windowPlacementSanityChecks()
{
  // we had to put this into a setTimeout because at onload some of the needed variables are not yet initialized
  setTimeout(deferredWindowPlacementSanityChecks, 500);
}
function deferredWindowPlacementSanityChecks() {
  delayedActivate();
  
  // Grab all the values we'll need.
  var x; var oldx;
  var y; var oldy;
  oldx = x = parseInt(document.documentElement.boxObject.screenX);
  oldy = y = parseInt(document.documentElement.boxObject.screenY);
  
  var width = {
    actual: document.documentElement.boxObject.width,
    xul: document.documentElement.getAttribute("width"), // the property as set on XUL or by persist
    css: getStyle(document.documentElement, "width"),
    min: getStyle(document.documentElement, "min-width") || 16, // ensure windows aren't crushed unsizably w/fallback value
    max: getStyle(document.documentElement, "max-width"),
  };
  var height = {
    actual: document.documentElement.boxObject.height,
    xul: document.documentElement.getAttribute("height"), // the property as set on XUL or by persist
    css: getStyle(document.documentElement, "height"),
    min: getStyle(document.documentElement, "min-height") || 16, // ensure windows aren't crushed unsizably w/fallback value
    max: getStyle(document.documentElement, "max-height")
  };
  for (var i in width ) { width[i]  = parseInt(width[i])  }
  for (var i in height) { height[i] = parseInt(height[i]) }
  
  // note: This code should work correctly, but will always be told that the window is positioned 
  //       relative to the main screen.
  //
  //       This is caused by mozbug 407405, and should auto-correct when the bug goes away.
  //       
  //       -pvh dec07
  
  // move offscreen windows back onto the center of the screen
  if ((x - screen.left > screen.availWidth ) || // offscreen right
      (x - screen.left + width.actual  < 0)  || // offscreen left
      (y - screen.top > screen.availHeight ) || // offscreen bottom
      (y - screen.top + height.actual  < 0)     // offscreen top
  ) { 
    x = screen.availWidth/2 - window.outerWidth/2; 
    x = (x < 0) ? 0 : x; // don't move window left of zero. 
    y = screen.availHeight/2 - window.outerHeight/2; 
    y = (y < 0) ? 0 : y; // don't move window above zero. 
  }
  
  /// correct width
  var newWidth = width.actual;
  if (!width.xul) { // if we have a xul/persist do not override CSS
    // first try the css
    if (width.css) { newWidth = width.css; }
    
    // then make sure we aren't poking off the screen (we allow the user to save a partially offscreen position)
    var pokeyOutie = x + newWidth - screen.availWidth;
    if (pokeyOutie > 0) { newWidth -= pokeyOutie; }
  }
  if (width.min && newWidth < width.min) { newWidth = width.min; }   // now correct for minsize

  /// correct height
  var newHeight = height.actual;
  if (!height.xul) { // if we have a xul/persist do not override CSS
    // first try the css
    if (height.css) { newHeight = height.css; }

    // then make sure we aren't poking off the screen (we allow the user to save a partially offscreen position)
    var pokeyOutie = y + newHeight - screen.availHeight;
    if (pokeyOutie > 0) { newHeight -= pokeyOutie; }
  }
  if (height.min && newHeight < height.min) { newHeight = height.min; }  // now correct for minsize

  // Now update the values on the actual window itself.
  if (x != oldx || y != oldy) { window.moveTo(x, y); }
  if (newHeight != height.actual || newWidth != width.actual) { window.resizeTo(newWidth, newHeight); }

}
/**
 * \brief Get a style property from an element in the window in the current context.
 * \param el The element.
 * \param styleProp The style property.
 * \return The computed style value.
 */
function getStyle(el,styleProp)
{
  var v;
  if (el) {
    var s = document.defaultView.getComputedStyle(el,null);
    v = s.getPropertyValue(styleProp);
  }
  return v;
}

/**
 * \brief Get a XULWindow (nsIXULWindow) from a regular window.
 * \param win The window for which you want the nsIXULWindow
 * \return The XULWindow for the window or null.
 */
function getXULWindowFromWindow(win) // taken from venkman source
{
    var rv;
    try
    {
        var requestor = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor);
        var nav = requestor.getInterface(Components.interfaces.nsIWebNavigation);
        var dsti = nav.QueryInterface(Components.interfaces.nsIDocShellTreeItem);
        var owner = dsti.treeOwner;
        requestor = owner.QueryInterface(Components.interfaces.nsIInterfaceRequestor);
        rv = requestor.getInterface(Components.interfaces.nsIXULWindow);
    }
    catch (ex)
    {
        rv = null;
    }
    return rv;
}

/**
 * \brief Open a modal dialog.
 * Opens a modal dialog and ensures proper accessibility for this modal dialog.
 */
function SBOpenModalDialog( url, param1, param2, param3, parentWindow )
{
  if (!parentWindow) parentWindow = window;
  // bonus stuff to shut the mac up.
  var chromeFeatures = ",modal=yes,resizable=no";
  if (SBDataGetBoolValue("accessibility.enabled")) chromeFeatures += ",titlebar=yes";
  else chromeFeatures += ",titlebar=no";

  param2 += chromeFeatures;
  var retval = parentWindow.openDialog( url, param1, param2, param3 );
  return retval;
}

/**
 * \brief Open a window.
 * Opens a window and ensures proper accessibility.
 */
function SBOpenWindow( url, param1, param2, param3, parentWindow )
{
  if (!parentWindow) parentWindow = window;
  var titlebar = ",modal=no";
  if (SBDataGetBoolValue("accessibility.enabled")) {
    titlebar += ",titlebar=yes";
    // if in accessible mode, resizable flag determines whether or not the window is resizable
  } else {
    titlebar += ",titlebar=no";
    // if not in accessible mode, resizable flag does not determine if the window is resizable
    // or not, that's determined by the presence or absence of resizers in the xul.
    // on the other hand, if resizable=yes is present in the flags, that create a border
    // around the window in OSX, so remove it
    var flags = param2.split(",");
    for (var i = flags.length - 1 ; i >= 0; --i) {
      if (flags[i] == "resizable=yes" ||
          flags[i] == "resizable")
        flags.splice(i, 1);
    }
    param2 = flags.join(",");
  }

  param2 += titlebar;
  var retval = window.openDialog( url, param1, param2, param3 );

  return retval;
}

/**
 * \brief Quit the application.
 */
function quitApp( )
{
  // Why not stop playback, too?
  try {
    gPPS.stop();
  } catch (e) {
    dump("windowUtils.js:quitApp() Error: could not stop playback.\n");
  }

  // Defer to toolkit/globalOverlay.js
  return goQuitApplication();
}


/**
 * \brief Attempt to restart the application.
 */
function restartApp( )
{

  // Notify all windows that an application quit has been requested.
  var os = Components.classes["@mozilla.org/observer-service;1"]
                     .getService(Components.interfaces.nsIObserverService);
  var cancelQuit = Components.classes["@mozilla.org/supports-PRBool;1"]
                             .createInstance(Components.interfaces.nsISupportsPRBool);
  os.notifyObservers(cancelQuit, "quit-application-requested", "restart");

  // Something aborted the quit process.
  if (cancelQuit.data)
    return;

  // attempt to restart
  var as = Components.classes["@mozilla.org/toolkit/app-startup;1"]
                     .getService(Components.interfaces.nsIAppStartup);
  as.quit(Components.interfaces.nsIAppStartup.eRestart |
          Components.interfaces.nsIAppStartup.eAttemptQuit);

  onExit( );
}


/**
 * \brief Hide an element in the window in the current context.
 * \param e The element to hide.
 */
function hideElement(e) {
  var element = document.getElementById(e);
  if (element) element.setAttribute("hidden", "true");
}

/**
 * \brief Move an element before another element in the window in the current context.
 * \param e The element to hide.
 */
function moveElement(e, before) {
  var element = document.getElementById(e);
  var beforeElement = document.getElementById(before);
  if (element && beforeElement) {
    element.parentNode.removeChild(element);
    beforeElement.parentNode.insertBefore(element, beforeElement);
  }
}

/**
 * \brief Get the name of the platform we are running on.
 * \return The name of the OS platform. (ie. Windows).
 * \retval Windows_NT Running under Windows.
 * \retval Darwin Running under Darwin/OS X.
 * \retval Linux Running under Linux.
 */
function getPlatformString()
{
  try {
    var sysInfo =
      Components.classes["@mozilla.org/system-info;1"]
                .getService(Components.interfaces.nsIPropertyBag2);
    return sysInfo.getProperty("name");
  }
  catch (e) {
    dump("System-info not available, trying the user agent string.\n");
    var user_agent = navigator.userAgent;
    if (user_agent.indexOf("Windows") != -1)
      return "Windows_NT";
    else if (user_agent.indexOf("Mac OS X") != -1)
      return "Darwin";
    else if (user_agent.indexOf("Linux") != -1)
      return "Linux";
    return "";
  }
}

/**
 * \brief Verify if a key event is an ALT-F4 key event.
 * \param evt Key event.
 */
function checkAltF4(evt)
{
  if (evt.keyCode == 0x73 && evt.altKey)
  {
    evt.preventDefault();
    quitApp();
  }
}

var SBStringBundleBundle = Components.classes["@mozilla.org/intl/stringbundle;1"]
                                     .getService(Components.interfaces.nsIStringBundleService)
                                     .createBundle("chrome://songbird/locale/songbird.properties");

/**
 * \brief Lookup a string in the songbird.properties locale file.
 * \param key The key for the string.
 * \param dflt The
 * \param bundle Optional string bundle.
 */
function SBString( key, dflt, bundle )
{
  // Get the string bundle.
  var stringBundle = bundle ? bundle : SBStringBundleBundle;

  // If there is no default, the key is the default.
  var retval = (dflt) ? dflt : key;
  try {
    retval = stringBundle.GetStringFromName(key);
  } catch (e) {}
  return retval;
}

/**
 * \brief Get the formatted localized string with the key specified by aKey
 *        using the format parameters specified by aParams and the string bundle
 *        specified by aStringBundle.
 *        If no string bundle is specified, get the string from the Songbird
 *        bundle.  If a string cannot be found, return aKey.
 *
 * \param aKey                  Localized string key.
 * \param aParams               Format params array.
 * \param aStringBundle         Optional string bundle.
 */

function SBFormattedString(aKey, aParams, aStringBundle) {
  // Get the string bundle.
  var stringBundle = aStringBundle ? aStringBundle : SBStringBundleBundle;

  // Set the default value.
  var value = aKey;

  // Try formatting string from bundle.
  try {
    value = stringBundle.formatStringFromName(aKey, aParams, aParams.length);
  } catch(ex) {}

  return value;
}

/**
 * \brief Convert a string containing binary values to hex.
 * \param input Input string to convert to hex.
 * \return The hex encoded string.
 */
function binaryToHex(input)
{
  var result = "";

  for (var i = 0; i < input.length; ++i)
  {
    var hex = input.charCodeAt(i).toString(16);

    if (hex.length == 1)
      hex = "0" + hex;

    result += hex;
  }

  return result;
}

/**
 * \brief Makes a new URI from a url string
 * \param aURLString String URL.
 * \return nsIURI object.
 */
function newURI(aURLString)
{
  var ioService =
    Components.classes["@mozilla.org/network/io-service;1"]
              .getService(Components.interfaces.nsIIOService);

  try {
    return ioService.newURI(aURLString, null, null);
  }
  catch (e) { }

  return null;
}

/**
 * \brief List all properties on an object and display them in a message box.
 * \param obj The object.
 * \param objName The readable name of the object, helps format the output.
 */
function listProperties(obj, objName)
{
    var columns = 3;
    var count = 0;
    var result = "";
    for (var i in obj)
    {
        try {
          result += objName + "." + i + " = " + obj[i] + "\t\t\t";
        } catch (e) {
          result += objName + "." + i + " = [exception thrown]\t\t\t";
        }
        count = ++count % columns;
        if ( count == columns - 1 )
        {
          result += "\n";
        }
    }
    alert(result);
}


/**
 * \brief event handler for the always-on-top menu item
 */
var alwaysOnTopCommandHandler = {
  handleEvent: function handleEvent(event) {
    // get some services
    var feathersManager = Components.classes[
      '@songbirdnest.com/songbird/feathersmanager;1']
      .getService(Components.interfaces.sbIFeathersManager);
    var nativeWindowManager = Components.classes[
      '@songbirdnest.com/integration/native-window-manager;1']
      .getService(Components.interfaces.sbINativeWindowManager);
   
    // should we be on top 
    var onTop = event.target.getAttribute('checked') == "true";

    // tell the window manager if we want to be on top
    nativeWindowManager.setOnTop(window, onTop);

    // tell the feathers manager if we want to be on top
    feathersManager.setOnTop(feathersManager.currentLayoutURL, 
      feathersManager.currentSkinName, onTop);
  }
}


/**
 * \brief handler for the window menu showing event
 */
var windowPopupMenuShowingHandler = {
  handleEvent: function handleEvent(event) {
    // get the feathers manager
    var feathersManager = Components.classes[
      '@songbirdnest.com/songbird/feathersmanager;1']
      .getService(Components.interfaces.sbIFeathersManager);

    // is this feather on top?
    var onTop = feathersManager.isOnTop(feathersManager.currentLayoutURL, 
        feathersManager.currentSkinName);

    // update the menu item state
    var alwaysOnTopMenuItem = document.getElementById('alwaysOnTop');
    alwaysOnTopMenuItem.setAttribute('checked', onTop?'true':'false');
    
  }
}


/**
 * \brief Handle initialization of layout windows
 */
function onLayoutLoad(event) {
  // don't leak, plz
  window.removeEventListener('load', onLayoutLoad, false);

  var feathersManager = Components.classes[
    '@songbirdnest.com/songbird/feathersmanager;1']
    .getService(Components.interfaces.sbIFeathersManager);
  if (feathersManager.currentLayoutURL == window.location.href) {
    // this is the primary window for the current layout

    var alwaysOnTopMenuItem = document.getElementById('alwaysOnTop');
    if (alwaysOnTopMenuItem) {
      // the alwaysOnTop menu item exists

      // get the native window manager service
      var nativeWindowManager = Components.classes[
        '@songbirdnest.com/integration/native-window-manager;1']
        .getService(Components.interfaces.sbINativeWindowManager);
      // can we always-on-top, and do we want to?
      if (nativeWindowManager && nativeWindowManager.supportsOnTop &&
          feathersManager.canOnTop(feathersManager.currentLayoutURL, 
            feathersManager.currentSkinName)) {

        var onTop = feathersManager.isOnTop(feathersManager.currentLayoutURL, 
            feathersManager.currentSkinName);

        // this feather can go on top let's set the checkbox state correctly
        alwaysOnTopMenuItem.setAttribute('checked', onTop?'true':'false');

        // add a handler for the menu item
        alwaysOnTopMenuItem.addEventListener('command', 
            alwaysOnTopCommandHandler, false);

        // set the always on top state with the window manager
        nativeWindowManager.setOnTop(window, onTop);

      } else {
        // if the feather can't go on top then let's hide the menu item
        alwaysOnTopMenuItem.setAttribute('hidden', 'true');
      }
    }

    // when the popup menu shows...
    var windowPopupMenu = document.getElementById('windowPopupMenu');
    if (windowPopupMenu) {
      windowPopupMenu.addEventListener('popupshowing', 
          windowPopupMenuShowingHandler, false);
    }
  } else {
    // this is some window other than the primary window for the current layout
  }

}
window.addEventListener('load', onLayoutLoad, false);


/**
 * \brief Get the main window browser.
 *
 * \return Main window browser.
 */

function SBGetBrowser() 
{
  // Return global browser if defined.
  if (typeof gBrowser != 'undefined') {
    return gBrowser;
  }

  // Get the main window.
  var mainWindow = window
                    .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                    .getInterface(Components.interfaces.nsIWebNavigation)
                    .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                    .rootTreeItem
                    .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                    .getInterface(Components.interfaces.nsIDOMWindow);

  // Return the main window browser.
  if (typeof mainWindow.gBrowser != 'undefined') {
    return mainWindow.gBrowser;
  }

  return null;
}

var SBWindow = {
  /**
   * \brief Open the modal dialog specified by aURL.  The parent window of the
   *        dialog is specified by aParent.  The name of the dialog is specified
   *        by aName.  The dialog options are specified by aOptions.  Pass the
   *        arguments specified by the array aInArgs in an nsIDialogParamBlock
   *        to the dialog.  The arguments may be strings or nsISupports.
   *        Strings may be specified as locale string bundle keys.  In addition,
   *        if an array of strings is specified as an argument, the first string
   *        is the locale key for a formatted string, and the remaining strings
   *        are the format arguments.
   *        Set the value field of the objects within the array aOutArgs to the
   *        arguments returned by the dialog.
   *        A locale string bundle may be optionally specified by aLocale.  If
   *        one is not specified, the Songbird locale bundle is used.
   *
   * \param aParent             Dialog parent window.
   * \param aURL                URL of dialog chrome.
   * \param aName               Dialog name.
   * \param aOptions            Dialog options.
   * \param aInArgs             Array of arguments passed into dialog.
   * \param aOutArgs            Array of argments returned from dialog.
   * \param aLocale             Optional locale string bundle.
   */

  openModalDialog: function SBWindow_openModalDialog(aParent,
                                                     aURL,
                                                     aName,
                                                     aOptions,
                                                     aInArgs,
                                                     aOutArgs,
                                                     aLocale) {
    // Set the dialog arguments.
    var dialogPB = null;
    if (aInArgs)
      dialogPB = this._setArgs(aInArgs, aLocale);

    // Open the dialog.
    SBOpenModalDialog(aURL, aName, aOptions, dialogPB, aParent);

    // Get the dialog arguments.
    if (aOutArgs)
      this._getArgs(dialogPB, aOutArgs);
  },


  /**
   * \brief Create and return a dialog parameter block set with the arguments
   *        contained in the array specified by aArgs.  Look up string arguments
   *        as keys in the locale string bundle specified by aLocale; use the
   *        Songbird locale string bundle if aLocale is not specified.
   *
   * \param aArgs               Array of dialog arguments to set.
   * \param aLocale             Optional locale string bundle.
   */

  _setArgs: function SBWindow__setArgs(aArgs, aLocale) {
    // Get a dialog param block.
    var dialogPB = Cc["@mozilla.org/embedcomp/dialogparam;1"]
                     .createInstance(Ci.nsIDialogParamBlock);

    /* Put arguments into param block. */
    for (var i = 0; i < aArgs.length; i++) {
      // Get the next argument.
      var arg = aArgs[i];

      // If arg is an nsISupports, add it to the objects field.  Otherwise, add
      // it to the string list.
      if (arg instanceof Ci.nsISupports) {
        if (!dialogPB.objects) {
          dialogPB.objects = Cc["@mozilla.org/array;1"]
                               .createInstance(Ci.nsIMutableArray);
        }
        dialogPB.objects.appendElement(arg, false);
      } else {
        dialogPB.SetString(i, this._getArgString(arg, aLocale));
      }
    }

    return dialogPB;
  },


  /**
   * \brief Get the dialog arguments from the parameter block specified by
   *        aDialogPB and return them in the value field of the objects within
   *        the array specified by aArgs.
   *
   * \param aDialogPB           Dialog parameter block.
   * \param aArgs               Array of dialog arguments to get.
   */

  _getArgs: function SBWindow__getArgs(aDialogPB, aArgs) {
    // Get arguments from param block.
    for (var i = 0; i < aArgs.length; i++)
        aArgs[i].value = aDialogPB.GetString(i);
  },


  /**
   * \brief Parse the argument specified by aArg and return a formatted,
   *        localized string using the locale string bundle specified by
   *        aLocale.  If aLocale is not specified, use the Songbird locale
   *        string bundle.
   *
   * \param aArg                Argument to parse.
   * \param aLocale             Optional locale string bundle.
   *
   * \return                    Formatted, localized string.
   */

  _getArgString: function SBWindow__getArgString(aArg, aLocale) {
    if (aArg instanceof Array)
      return SBFormattedString(aArg[0], aArg.slice(1), aLocale);
    else
      return SBString(aArg, aLocale);
  }
};

