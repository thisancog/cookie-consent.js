# cookie-consent.js
A simple JavaScript class to handle cookie consent changes and notify cookie settings scripts.

## Legal disclaimer
The author of this tool does not guarantee for it or any of its derivations to work on all devices and browsers, for it to be free of malfunctions or compliant with laws or regulations, especially regarding privacy laws, in any legislation. By using this tool, you acknowledge this disclaimer and agree to review and verify this tool's or its derivation's suitability for whatever intent or purpose prior to usage. You also agree that you are alone a culpable in the event of any damages resulting from the usage of this tool or its derivation.
and to renounce to seek compensation.

## How it works

cookie-consent.js provides a JavaScript class that responds cookie consent choices provided by the UI set up by the developer. Scripts and functions, which have been registered with this tool, will be notified on any consent changes. If consent is given, a cookie is being set which stores this decision so that for future page visits, no additional consent needs to be given (within a certain period of time).

cookie-consent.js uses the opt-in principle by default: The user needs to actively consent to the usage of cookies before any of the JavaScript functions or `<script>` elements registered with it can run.

cookie-consent.js needs to be provided with JavaScript functions or `<script>` elements it should monitor. The behaviour differs for each:

 - Functions will be called with the parameter `consent`, a Boolean indicating if consent was given (`true` or `false`).
 - Script elements need will be monitored if their `type` attribute is set to `text/plain` and if they contain a class matching the string given by the `scriptTagClass` parameter (`"cc-script"`) by default.

## Usage

Include the file `cookie-consent.js` in your project and instantiate its CookieConsent class as such:

    const parameters = { … };
    const cookieConsent = new CookieConsent(parameters);

Typically, you'd like to set up a cookie notice bar, a button to signify consent and another button to signify rejection. None of these are required and you might want to add additional rejection buttons, e.g. within a privacy declaration enabling the user to revoke consent and delete all cookies.

The cookie bar element, if specified, will receive HTML classes "show" and "hide" based on any consent changes. You will need to supply your own CSS declarations to reflect this update in the layout.

Example:

    <html>
	    <head>
		    <script src="cookie-consent.js" type="text/javascript"></script>
		    <script type="text/javascript">
			    const parameters = { … };
			    const cookieConsent = new CookieConsent(parameters);
		    </script>
		    
		    <script src="this-will.be/blocked.js" type="text/plain" class="cc-script"></script>
		    <script type="text/plain" class="cc-script">
			    console.log('I will wait until consent is given.');
			    /* … */
		    </script>

			<style>
				.cookie-bar.hide { display: none; }
			</style>
		    
		</head>
		<body>
			<!-- some content -->
			
			<section class="cookie-bar">
				<p>Do you like some cookies?</p>
				<button type="button" class="accept">Yes, I do</button>
				<button type="button" class="deny">Nah</button>
			</section>
		</body>
	</html>
		 

### Parameters

The class can be initiated with an object detailing a few parameters, including:

**cookieFunctions** (array of functions, *default:* `[]`):
Functions to be called when cookie consent changes. Called with parameter "consent" (Boolean): true if consent was given, false if it was revoked or denied.

**cookieScriptTags** (NodeList or array of HTML Elements, *default:* `null`):
List of script tags set to type="text/plain" to de/activate when consent changes. If it is null (as per default), it will be filled with scripts set to `type="text/plain"` with the class stated by parameter "scriptTagClass".

**cookiesAllowedCookie** (string, *default:* `"cookiesallowed"`):
Name of cookie to be saved if consent is given.

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

### Methods

After the CookieConsent class has been initialised, a few methods can be used, primarily to add or remove functions and scripts from the watchlist:

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
