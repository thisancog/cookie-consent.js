(function() {

	/***************************************
		Parameters: (object where keys are parameters and values are their settings)

		cookieFunctions:
			setting: Functions to be called when cookie consent changes.
					 Called with parameter "consent" (Boolean): true if consent was given, false if it was revoked or denied.
			expects: array of functions
			default: []

		cookieScriptTags:
			setting: List of script tags set to type="text/plain" to de/activate when consent changes.
			expects: NodeList or array of HTML Elements
			default: null (will be filled scripts set to type="text/plain" with the class stated by parameter "scriptTagClass")

		cookiesAllowedCookie:
			setting: Name of cookie to be saved if consent is given.
			expects: string
			default: 'cookiesallowed'

		cookiesAllowedCookieMaxAge:
			setting: The maximum time for the consent to be stored as a cookie, if it has been given (in seconds).
			expects: number
			default: 2592000 (30 days)

		deleteAllCookiesOnRevokedConsent:
			setting: If all cookies stored by this website should we deleted if consent was revoked or denied.
					 This will delete all cookies saved for this domain regardless of the subdomain, if there was no path
					 parameter given not the HttpOnly flag set when they were saved.
			expects: Boolean
			default: true

		elemNoticeBar:
			setting: The cookie consent bar or modal.
			expects: HTML Element
			default: document.querySelector('.cookie-bar')

		elemsAccept:
			setting: List of elements to give cookie consent, when clicked.
			expects: NodeList or array of HTML Elements
			default: null (child element of elemNoticeBar matching '.accept')

		elemsDeny:
			setting: List of elements to deny or revoke cookie consent, when clicked.
			expects: NodeList or array of HTML elements
			default: null (child element of elemNoticeBar matching '.deny')

		reloadOnRevokeConsent:
			setting: Whether the page should reload when consent, which was given before, has been revoked. Use this to stop scripts which would otherwise continue to run.
			expects: Boolean
			default: fals		

		scriptTagClass:
			setting: The class of script tags set to type="text/plain" to de/activate when consent changes.
			expects: String
			default: 'cc-script'

	***************************************/


	class CookieConsent {
		constructor(params) {
			params = params == null ? {} : params;

			this.defaults = {
				cookieFunctions: 					[],
				cookieScriptTags: 					null,
				cookiesAllowedCookie:				'cookiesallowed',
				cookiesAllowedCookieMaxAge: 		2592000,
				deleteAllCookiesOnRevokedConsent:	true,
				elemNoticeBar: 						document.querySelector('.cookie-bar'),
				elemsAccept: 						null,
				elemsDeny: 							null,
				reloadOnRevokeConsent:				false,
				scriptTagClass:						'cc-script',
			};


			this.backupScripts = [];
			this.consentGiven  = false;

			this.processParameters(params);
			this.registerEvents();
			this.checkCookieConsent();
		}


		/**************************************************
			Process parameters
		**************************************************/

		processParameters(params) {
			params      = params == null ? {} : params;
			this.params = Object.assign({}, this.defaults, params);

			this.processBoolParam('deleteAllCookiesOnRevokedConsent');
			this.processBoolParam('reloadOnRevokeConsent');

			this.processStringParam('scriptTagClass');
			this.processStringParam('cookiesAllowedCookie');
			this.params.cookiesAllowedCookie = encodeURIComponent(this.params.cookiesAllowedCookie);

			this.processNumberParam('cookiesAllowedCookieMaxAge');

			this.processNodeListParam('cookieScriptTags', document.querySelectorAll('script.' + this.params.scriptTagClass));
			this.processNodeListParam('elemsAccept', this.params.elemNoticeBar.querySelectorAll('.accept'));
			this.processNodeListParam('elemsDeny', this.params.elemNoticeBar.querySelectorAll('.deny'));
		}

		processBoolParam(param) {
			if (typeof this.params[param] !== 'boolean')
				this.params[param] = !!this.defaults[param];
		}

		processStringParam(param) {
			if (this.params[param] === '' || typeof this.params[param] !== 'string')
				this.params[param] = this.defaults[param];
		}

		processNumberParam(param) {
			this.params[param] = Math.round(typeof this.params[param] !== 'number' ? this.defaults[param] : this.params[param]);
		}

		processNodeListParam(param, defaultList) {
			this.params[param] = [].slice.call(this.params[param] == null ? defaultList : this.params[param]);
		}



		/**************************************************
			Register events
		**************************************************/

		/* register click handlers for HTML Elements that give or deny/revoke cookie consent */
		registerEvents() {
			this.params.elemsAccept.forEach(elem => elem.addEventListener('click', (function() { this.giveCookieConsent(); }).bind(this)));
			this.params.elemsDeny.forEach(elem   => elem.addEventListener('click', (function() { this.revokeCookieConsent(); }).bind(this)));
		}



		/**************************************************
			Check if consent is given
		**************************************************/

		/* check if consent has been given before and notify all cookie functions */
		checkCookieConsent() {
			this.consentGiven = this.checkIfCookieExists(this.params.cookiesAllowedCookie);

			if (this.consentGiven) {
				this.giveCookieConsent(false);
			} else {
				this.showCookieBar();
				this.updateCookieScripts();	
			}
		}



		/**************************************************
			Update cookie consent
		**************************************************/

		/* give consent - default: set or update cookie consent cookie even if has been set already */
		giveCookieConsent(setConsentCookie) {
			setConsentCookie = setConsentCookie == null ? true : setConsentCookie;

			this.consentGiven = true;
			this.updateCookieScripts();
			this.hideCookieBar();

			if (setConsentCookie)
				this.setCookieConsentCookie();
		}

		/* store the cookie consent decision in a cookie */
		setCookieConsentCookie() {
			document.cookie = this.params.cookiesAllowedCookie + '=true; max-age=' + this.params.cookiesAllowedCookieMaxAge + ';samesite=strict;path=/';
		}

		/* revoke cookie consent and remove either just the cookie consent cookie or all cookies */
		revokeCookieConsent() {
			var consentWasGiven = this.consentGiven;
			
			this.consentGiven = false;
			this.updateCookieScripts();
			this.hideCookieBar();

			if (this.params.deleteAllCookiesOnRevokedConsent)	this.removeAllCookies();
			else 												this.removeCookieConsentCookie();

			if (this.params.reloadOnRevokeConsent && consentWasGiven)
				window.location.reload();
		}

		/* notify all registered functions of and update all registered script tags according to consent changes */
		updateCookieScripts(consent) {
			consent = consent == null ? this.consentGiven : consent;

			this.notifyCookieFunctions(consent);
			this.updateCookieScriptTags(consent);
		}

		/* notify all registered functions of consent changes */
		notifyCookieFunctions(consent) {
			this.params.cookieFunctions.forEach(func => func(consent));
		}

		/* update all registered script tags according to consent changes */
		updateCookieScriptTags(consent) {
			var type = consent ? 'text/javascript' : 'text/plain';

			this.params.cookieScriptTags = this.params.cookieScriptTags.map(function(oldScript) {
				if (oldScript.getAttribute('type') == type) return oldScript;

				var newScript = document.createElement('script'),
					content   = oldScript.innerText,
					source    = oldScript.getAttribute('src');

				newScript.setAttribute('type', type);
				newScript.innerText = content;
				if (source)
					newScript.src   = source;


				oldScript.parentNode.replaceChild(newScript, oldScript);
				return newScript;
			});
		}



		/**************************************************
			Register and deregister cookie functions
		**************************************************/

		/* register a new cookie function and notify it immediately of the current consent status */
		registerCookieFunction(func) {
			if (typeof func !== 'function' || this.params.cookieFunctions.indexOf(func) !== -1) return;
			this.params.cookieFunctions.push(func);
			func(this.consentGiven);
		}

		/* deregister a cookie function */
		deregisterCookieFunction(func) {
			if (typeof func !== 'function' || this.params.cookieFunctions.indexOf(func) == -1) return;
			this.params.cookieFunctions.splice(this.params.cookieFunctions.indexOf(func), 1);
		}


		/**************************************************
			Register and deregister cookie script tags
		**************************************************/

		/* register a new cookie script tag and update it immediately based on the current consent status */
		registerCookieScriptTag(tag) {
			if (!(tag instanceof Element) || tag.tagName.toLowerCase() !== 'script' || this.params.cookieScriptTags.indexOf(tag) !== -1) return;
			this.params.cookieScriptTags.push(tag);
			tag.setAttribute('type', this.consentGiven ? 'text/javascript' : 'text/plain');
		}

		/* deregister a cookie script tag */
		deregisterCookieScriptTag(tag) {
			if (!(tag instanceof Element) || tag.tagName.toLowerCase() !== 'script' || this.params.cookieScriptTags.indexOf(tag) == -1) return;
			this.params.cookieScriptTags.splice(this.params.cookieScriptTags.indexOf(tag), 1);
		}



		/**************************************************
			Helper functions
		**************************************************/

		/* check if cookie with the name "name" exists */
		checkIfCookieExists(name) {
			if (!name) return;
			return document.cookie.split(';').some(function(cookie) {
				return cookie.trim().indexOf(name + '=') == 0;
			});
		}

		/* get a cookie's value */
		readCookie(name) {
			if (!name) return;
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				if (cookies[i].indexOf(name) == -1) continue;

				var value = cookies[i].split('=');
				return value.length == 2 ? value[1] : false;
			}

			return null;
		}

		/* remove the cookie storing the consent decision */
		removeCookieConsentCookie() {
			document.cookie = this.params.cookiesAllowedCookie + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
		}

		/* remove all cookies for this host */
		removeAllCookies() {
			var cookies      = document.cookie.split(';');

			console.log(cookies);

			for (var i = 0; i < cookies.length; i++) {
				var hostSegments = window.location.hostname.split('.'),
					minLength    = hostSegments.length == 1 ? 1 : 2;
					
				while (hostSegments.length >= minLength) {
					var cookie       = cookies[i].trim(),
						name         = cookie.split(';')[0].split('=')[0],
						base         = encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT',
						baseHosts    = base + '; domain=' + hostSegments.join('.') + '; path=',
						pathSegments = window.location.pathname.split('/');

					document.cookie = base;
					console.log(base);

					while (pathSegments.length > 0) {
						document.cookie = baseHosts + pathSegments.join('/');
						document.cookie = baseHosts + pathSegments.join('/') + '/';

						console.log(baseHosts + pathSegments.join('/'));
						console.log(baseHosts + pathSegments.join('/') + '/');
						pathSegments.pop();
					}

					
					hostSegments.shift();
				}
			}

			console.log(cookies);
		}

		/* show the cookie bar */
		showCookieBar() {
			if (!this.params.elemNoticeBar) return;
			this.params.elemNoticeBar.classList.add('show');
			this.params.elemNoticeBar.classList.remove('hide');
		}

		/* hide the cookie bar */
		hideCookieBar() {
			if (!this.params.elemNoticeBar) return;
			this.params.elemNoticeBar.classList.remove('show');
			this.params.elemNoticeBar.classList.add('hide');
		}
	}

	window.CookieConsent = CookieConsent;
})();