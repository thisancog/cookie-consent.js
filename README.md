
# cookie-consent.js
A simple JavaScript class to handle cookie consent changes and notify cookie settings scripts. It is lean and does not impose any DOM elements or styling, leaving these decisions to the designer and developer.

[Find a working example here.](https://thisancog.github.io/cookie-consent.js/)

## Legal disclaimer
The author of this tool does not guarantee for it or any of its derivations to work on all devices and browsers, for it to be free of malfunctions or compliant with laws or regulations, especially regarding privacy laws, in any legislation. By using this tool, you acknowledge this disclaimer and agree to review and verify this tool's or its derivation's suitability for whatever intent or purpose prior to usage. You also agree that you are alone a culpable in the event of any damages resulting from the usage of this tool or its derivation.
and to renounce to seek compensation.

## How it works

cookie-consent.js provides a JavaScript class that responds cookie consent choices provided by the UI set up by the developer. Scripts and functions, which have been registered with this tool, will be notified on any consent changes. If consent is given, a cookie is being set which stores this decision so that for future page visits, no additional consent needs to be given (within a certain period of time).

cookie-consent.js uses the opt-in principle by default: The user needs to actively consent to the usage of cookies before any of the JavaScript functions or `<script>` elements registered with it can run.

cookie-consent.js needs to be provided with JavaScript functions or `<script>` elements it should monitor. The behaviour differs for each:

 - Functions will be called with the parameter `consent`, a Boolean indicating if consent was given (`true` or `false`).
 - Script elements will be automatically monitored if their `type` attribute is set to `text/plain` and if they contain a class matching the string given by the `scriptTagClass` parameter (`"cc-script"`) by default.  They will be executed once consent is given.

## Usage

### 1. Include the file and fire up the class

Include the file `cookie-consent.js` in your project and instantiate its CookieConsent class as such:

    const parameters = { … };
    const cookieConsent = new CookieConsent(parameters);

Find a full list of parameters below.

### 2. Prepare `<script>` tags, if needed

All `<script>` tags containing code to only run when consent is given, need to be prepared:

 - Set the `type` parameter to `"text/plain"`. This makes sure they don't run after page load.
 - Add the HTML class `"cc-script"` (can be changed to something else, see *scriptTagClass* parameter). 
 
The tags should look like this:
 
    <script src="/path/to/some/blocked/script.js" type="text/plain" class="cc-script"></script>

Alternative to the HTML class approach, you can instantiate the class with a list of `<script>` tags with the help of the *cookieScriptTags* parameter.

### 3. Register JavaScript functions, if needed

You can also provide the class with callback functions that will be executed every time the consent changes. You can either register them when you instantiate the class (see *cookieFunctions* parameter) or add them later on (see *registerCookieFunction* method).

### 4. Set up DOM elements and CSS styles

Typically, you'd like to set up a cookie notice bar, a button to signify consent and another button to signify rejection. None of these are required and you might want to add additional rejection buttons, e.g. within a privacy declaration enabling the user to revoke consent and delete all cookies.

The cookie bar element, if specified, will receive HTML classes "show" and "hide" based on any consent changes. You will need to supply your own CSS declarations to reflect this update in the layout.

[Find a working example here.](https://thisancog.github.io/cookie-consent.js/)	 

## Parameters

The class can be instantiated with an object detailing a few parameters.

    const parameters = {
        cookieFunctions:                   [],
        cookieScriptTags:                  null,
        cookiesAllowedCookie:              'cookiesallowed',
        cookiesAllowedCookieMaxAge:        2592000,
        cookiesAllowedCookiePath:          '/',
        deleteAllCookiesOnRevokedConsent:  true,
        elemNoticeBar:                     document.querySelector('.cookie-bar'),
        elemsAccept:                       null,
        elemsDeny:                         null,
        reloadOnRevokeConsent:             false,
        scriptTagClass:                    'cc-script',
    };

**cookieFunctions** (array of functions, *default:* `[]`):

Functions to be called when cookie consent changes. Called with parameter "consent" (Boolean): true if consent was given, false if it was revoked or denied.

**cookieScriptTags** (NodeList or array of HTML Elements, *default:* `null`):

List of script tags set to type="text/plain" to de/activate when consent changes. If it is null (as per default), it will be filled with scripts set to `type="text/plain"` with the class stated by parameter "scriptTagClass".

**cookiesAllowedCookie** (string, *default:* `"cookiesallowed"`):

Name of cookie to be saved if consent is given.

**cookiesAllowedCookiePath** (string, *default:* `"/"`):

Path relative to the host name of the website for which the cookies allowed cookie should be stored. The default value `"/"` signifies the root of the host, i.e. `http://example.com`.

**cookiesAllowedCookieMaxAge** (number, *default:* `2592000`):

The maximum time for the consent to be stored as a cookie, if it has been given (in seconds). The default 2592000 will keep the cookie stored for 30 days. 

**deleteAllCookiesOnRevokedConsent** (Boolean, *default:* `true`):

If all cookies stored by this website should we deleted if consent was revoked or denied. This will delete all cookies saved for this domain regardless of the subdomain, but only if there was no path parameter given and if the `HttpOnly` flag was not set when they were saved.

**elemNoticeBar** (HTML Element, *default:* first element matching the selector `".cookie-bar"`):

The cookie consent notice bar or modal.

**elemsAccept** (NodeList or array of HTML Elements, *default:* `null`):

List of elements to give cookie consent, when clicked. If it is `null` (as per default), the first child element of *elemNoticeBar* matching the selector `".accept"` will be used.

**elemsDeny** (NodeList or array of HTML Elements, *default:* `null`):

List of elements to deny or revoke cookie consent, when clicked. If it is `null` (as per default), the first child element of *elemNoticeBar* matching the selector `".deny"` will be used.

**reloadOnRevokeConsent** (Boolean, *default:* `true`):

Whether the page should reload when consent, which was given before, has been revoked. Use this to stop scripts which would otherwise continue to run.

**scriptTagClass** (string, *default:* `"cc-script"`):

The HTML class of script tags set to `type="text/plain"` to de/activate when consent changes.

## Methods

After the CookieConsent class has been instantiated, a few methods can be used, primarily to add or remove functions and scripts from the watchlist:

**checkCookieConsent** (no parameters):

Force the reevaluation of the cookie consent, i.e. see if the cookie storing prior consent (see parameter *cookiesAllowedCookie*) is present.

**registerCookieFunction** (*func* (required): function)

Register a function *func* to be notified of any changes made to the cookie consent. On any change as well as right after the registration, it will be called with the parameter `consent`, a Boolean indicating if consent was given (`true` or `false`).

**deregisterCookieFunction** (*func* (required): function)

Deregister a function *func* to be notified of any changes made to the cookie consent.

**registerCookieScriptTag** (*tag* (required): `<script>` element)

Register a `<script>` element *tag* to be de-/activated when any changes are being made to the cookie consent. Immediately after registration, *tag* will be de-/activated based on the current choice.

**deregisterCookieScriptTag** (*tag* (required): `<script>` element)

Deregister a `<script>` element *tag* to be de-/activated when any changes are being made to the cookie consent.
