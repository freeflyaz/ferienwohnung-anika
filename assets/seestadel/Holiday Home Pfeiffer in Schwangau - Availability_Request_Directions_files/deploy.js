    window.__loadedJsLibraries = window.__loadedJsLibraries || (window.__loadedJsLibraries = new Object());
    window.__loadedCssLibraries = window.__loadedCssLibraries || (window.__loadedCssLibraries = new Object());
    if(window.__loadedJsLibraries["/.cm4all/e/assets/js/smartaccess.js"] !== true){
        window.__loadedJsLibraries["/.cm4all/e/assets/js/smartaccess.js"] = true;
        cm4all = cm4all || {};

cm4all.SmartAccess = {
	enabled: false,
	smartAccessButton: null,
	smartAccessMenu: null,
	toggleTimer: null,
	
	detectMobile: function() {
		cm4all.SmartAccess.smartAccessButton = document.querySelector(".cm-smart-access-button");
		cm4all.SmartAccess.smartAccessMenu = document.querySelector(".cm-smart-access-menu");
		cm4all.SmartAccess.smartAccessProtector = document.querySelector(".cm-smart-access-menu .protector");
		if (
			cm4all.SmartAccess.smartAccessButton && (
				document.location.hash.indexOf("mobile") >= 0 ||
				document.location.hash.indexOf("smartAccess") >= 0 ||
				window.Common && Common.MobileBrowserSwitch && Common.MobileBrowserSwitch.isMobileAgent(navigator.userAgent)
			)
		) {
			cm4all.SmartAccess.enabled = true;
			cm4all.SmartAccess.smartAccessButton.style.display = "block";
			window.onscroll = cm4all.SmartAccess.onScroll;
			if (cm4all.SmartAccess.smartAccessMenu) {
				cm4all.SmartAccess.smartAccessButton.onclick = cm4all.SmartAccess.toggleMenu;
				cm4all.SmartAccess.smartAccessMenu.addEventListener("transitionend", cm4all.SmartAccess.onTransitionEnd);
				cm4all.SmartAccess.smartAccessProtector.onclick = cm4all.SmartAccess.closeMenu;
				window.onhashchange = cm4all.SmartAccess.onHashChange;
				cm4all.SmartAccess.onHashChange(null, true);
				/* to prevent menu fading on initial loading */
				window.setTimeout(function() {
					cm4all.SmartAccess.smartAccessMenu.classList.add("transition");
				}, 0);
			} /* else: no menu, only one button enabled */
		} /* else: no mobile device or no button enabled */
	},
	
	toggleMenu: function(toggle) {
		if (cm4all.SmartAccess.menuOpen) {
			document.location.hash = "page";
		} else {
			document.location.hash = "smartAccess";
		}
	},

	closeMenu: function(toggle) {
		document.location.hash = "page";
	},
	
	onHashChange: function(ev, initializing) {
		if (!cm4all.SmartAccess.smartAccessMenu) {
			return;
		}
		
		/* to prevent button roatation on initial loading */
		if (!initializing) {
			cm4all.SmartAccess.smartAccessButton.classList.add("transition");
		}
		
		if (document.location.hash.indexOf("smartAccess") >= 0) {
			cm4all.SmartAccess.smartAccessButton.querySelector(".fa").classList.remove("fa-th");
			/* trigger css transition */
			cm4all.SmartAccess.smartAccessButton.offsetHeight;
			cm4all.SmartAccess.smartAccessButton.querySelector(".fa").classList.add("fa-close");
			cm4all.SmartAccess.smartAccessButton.querySelector(".scaler").style.transform = "";
			cm4all.SmartAccess.smartAccessMenu.classList.add("open");
			document.body.style.overflow = "hidden";
			cm4all.SmartAccess.menuOpen = true;
		} else {
			cm4all.SmartAccess.smartAccessButton.querySelector(".fa").classList.remove("fa-close");
			/* trigger css transition */
			cm4all.SmartAccess.smartAccessButton.offsetHeight;
			cm4all.SmartAccess.smartAccessButton.querySelector(".fa").classList.add("fa-th");
			/* change fa-th icon from rectangular to quadratical */
			cm4all.SmartAccess.smartAccessButton.querySelector(".scaler").style.transform = "scale(0.8, 1)";
			if (!initializing) {
				cm4all.SmartAccess.smartAccessMenu.classList.add("closing");
			}
			document.body.style.overflow = "";
			cm4all.SmartAccess.menuOpen = false;
		}
	},
	
	onScroll: function(ev) {
		if (!cm4all.SmartAccess.menuOpen) {
			if (!isNaN(cm4all.SmartAccess.scrollY) && window.scrollY === cm4all.SmartAccess.scrollY) {
				return;
			}
			cm4all.SmartAccess.scrollY = window.scrollY;
			cm4all.SmartAccess.smartAccessButton.style.right = "-60px";
			if (cm4all.SmartAccess.toggleTimer) {
				window.clearTimeout(cm4all.SmartAccess.toggleTimer);
			}
			cm4all.SmartAccess.toggleTimer = window.setTimeout(function(){
				cm4all.SmartAccess.smartAccessButton.style.right = "30px";
			}, 1000);
		}
	},
	
	onTransitionEnd: function() {
		if (!cm4all.SmartAccess.menuOpen) {
			cm4all.SmartAccess.smartAccessMenu.classList.remove("open");
			cm4all.SmartAccess.smartAccessMenu.classList.remove("closing");
		}
	}
}

window.onload = cm4all.SmartAccess.detectMobile;
    };
    if(window.__loadedJsLibraries["/.cm4all/e/assets/js/widget-helper.js"] !== true){
        window.__loadedJsLibraries["/.cm4all/e/assets/js/widget-helper.js"] = true;
        (function() {

  if (window.beng && window.beng.env && window.beng.env.mode != 'deploy') {
    return;
  }

  var DOM_PARSER = new DOMParser();

  function handleScript(script) {
    var SCRIPT = document.createElement('SCRIPT');
    [].forEach.call(script.attributes, function(attribute) {
      SCRIPT.setAttribute(attribute.name, attribute.value);
    });
    return SCRIPT;
  }


  function importDeep(node) {
    var imported;
    if ('NOSCRIPT' === node.nodeName) {
      return null;
    }
    if ('SCRIPT' === node.nodeName) {
      imported = handleScript(node);
    } else {
      imported = document.importNode(node, false);
    }
    for (var current = node.firstChild; current != null; current = current.nextSibling) {
      var importedNode = importDeep(current);
      if (importedNode) {
        imported.appendChild(importedNode);
      }
    }
    return imported;
  }

  function replaceWithAll(oldNode, newNodes, callback) {
    var all = document.createDocumentFragment();
    var allSaved;
    [].forEach.call(newNodes, function(node) {
      var importedNode = importDeep(node);
      if (importedNode) {
        all.appendChild(importedNode);
      }
    });
    allSaved = [].map.call(all.childNodes, function (n) { return n; } );
    if (oldNode && oldNode.parentNode) {
      oldNode.parentNode.replaceChild(all, oldNode);
    }
    allSaved.forEach(function (e) {
      if (!e.querySelectorAll) {
        return;
      }
      var links = [].map.call(e.querySelectorAll('a[href],form[action]'), function (a) { return a; });
      if (e.href) {
        links.push(e);
      }
      links.forEach(function (a) {
        var href, listen, submit, nextSibling, parentNode;
        switch (a.nodeName) {
          case 'A':
            href = a.href;
            listen = 'click';
            break;
          case "FORM":
            href = a.action;
            listen = 'submit';
            function mysubmit() {
              a.dispatchEvent(new CustomEvent('submit', {'bubbles':true, 'cancelable': true}));
            };
            if (typeof a.submit === 'function') {
              a.submit = mysubmit;
            } else if (a.submit instanceof HTMLElement) {
              submit = a.submit;
              nextSibling = submit.nextSibling;
              parentNode = submit.parentNode;
              parentNode.removeChild(submit);
              a.submit = mysubmit;
              parentNode.insertBefore(submit, nextSibling);
            }
            break;
        }
        if (new RegExp('focus=' + oldNode.dataset.wiid).test(href)) {
          a.addEventListener(listen, function(ev) {
            if (ev.defaultPrevented) {
              return;
            }
            ev.preventDefault();
            if (allSaved.length > 0) {
              allSaved[0].insertAdjacentElement('beforebegin', oldNode);
              _loadWidget(oldNode, a, ev, function() {
                allSaved.forEach(function (e, index) {
                  e.parentNode.removeChild(e);
                });
                var focusElement, hash = /#([^#]+)$/.exec(href);
                if (hash) {
                  focusElement = document.querySelector('[id=' + hash[1] + '],[name=' + hash[1] +']');
                  if (focusElement) {
                    focusElement.scrollIntoView();
                  }
                }        
              });
            }
          });
        }
      });
    });
    if (callback) {
      callback();
    }
  }

  function displayThirdpartyContent() {
    if (this.checked) {
      var inputList = document.querySelectorAll('.cm-wp-content-switcher__checkbox');
      for (var i = 0; i < inputList.length; i++) {
        var input = inputList[i];
        input.removeEventListener('change', displayThirdpartyContent);
        input.checked = true;
      }
      var cookieSettings = getCookieSettings();
      cookieSettings.thirdparty = true;
      setCookieSettings(cookieSettings);
    }
  }

  function showWidgetPlaceholder(a) {
    var wiid = a.dataset.wiid;
    if (!document.querySelector('[data-ph-wiid="' + wiid + '"]')) {
      var template = document.querySelector('.cm4all-cookie-policy-placeholder-template');
      if (template) {
        var placeholder = template.cloneNode(true);

        placeholder.classList.remove('cm4all-cookie-policy-placeholder-template');
        placeholder.style.display = '';
        placeholder.dataset.phWiid = wiid;
        placeholder.querySelector('input').addEventListener('change', displayThirdpartyContent);
        a.insertAdjacentElement('afterend', placeholder);
      }
    }
  }

  function showWidgetLoadingPlaceholder(a) {
    var wiid = a.dataset.wiid;
    if (!document.querySelector('[data-ph-wiid="' + wiid + '"]')) {
      var placeholder = document.createElement('div');
      // set minHeight asap to avoid too many intersection events before css is loaded
      placeholder.style.minHeight = '200px';
      placeholder.classList.add('cm-widget-loading-placeholder');
      placeholder.innerHTML = '<img src="' + window.beng.env.common_prefix + '/.cm4all/e/static/img/loading_128.gif"></img>'
      placeholder.dataset.phWiid = wiid;
      a.insertAdjacentElement('afterend', placeholder);
    }
  }


  function removeWidgetPlaceholder(a) {
    var placeholder = document.querySelector('[data-ph-wiid="' + a.dataset.wiid + '"]');
    if (placeholder) {
      placeholder.parentNode.removeChild(placeholder);
    }
  }

  var lazyWidgetObserver = null;
  if ("IntersectionObserver" in window) {
    lazyWidgetObserver = new IntersectionObserver(
      function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            let lazyWidgetContainer = entry.target;
            var lazyWidgetAnchor = lazyWidgetContainer.querySelector('a.cm4all-cookie-consent');
            lazyWidgetObserver.unobserve(lazyWidgetContainer);
            _loadWidget(lazyWidgetAnchor);
          }
        }
      );
    });
  }


  function _loadWidget(widgetAnchor, followElement, evt, callback) {
    if (!followElement || followElement instanceof Function) {
      callback = followElement;
      followElement = widgetAnchor;
    }

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status === 200) {
        var html = DOM_PARSER.parseFromString(
          '<x-cm4all-root>'
          + xhr.responseText +
          '</x-cm4all-root>', 'text/html')
          .querySelector('x-cm4all-root').childNodes;
        window.requestAnimationFrame(function () {
          replaceWithAll(widgetAnchor, html, callback);
          removeWidgetPlaceholder(widgetAnchor);
        });
      } else {
        console.log('HTTP error ' + xhr.status + ' ' + xhr.statusText);
      }
    }
    
    var submitter = evt && evt.submitter;
    setTimeout(function(){
      if (followElement.nodeName === 'A') {
        xhr.open('GET', followElement.href);
        xhr.send();
      } else if (followElement.nodeName === 'FORM') {
        var formData = new FormData(followElement), 
            entry, toSend = '', contentType = '', action = followElement.action, 
            method = (followElement.method || 'POST').toUpperCase();
        if (method === 'GET') {
          action = new HttpURL(action);
          for (entry of formData.entries()) {
            action.setParameter(entry[0], entry[1]);
          }
          if (submitter && submitter.name) {
            action.setParameter(submitter.name, submitter.value);
          }
          action = action.toExternalForm();
          
        } else if (followElement.enctype === 'application/x-www-form-urlencoded') {
          contentType = followElement.enctype;
          for (entry of formData.entries()) {
            toSend += '&' + encodeURIComponent(entry[0]).replace(/%20/g, "+") + 
              '=' + encodeURIComponent(entry[1]).replace(/%20/g, "+");
          }
          if (submitter && submitter.name) {
            toSend += '&' + 
                    encodeURIComponent(submitter.name).replace(/%20/g, "+") + 
                    '=' + encodeURIComponent(submitter.value).replace(/%20/g, "+");
          }
          toSend = toSend.substr(1);
          
        } else {
          toSend = formData;
        }
        xhr.open(method, action);
        if (contentType) {
          xhr.setRequestHeader('Content-Type', contentType);
        }
        xhr.send(toSend);
      } else {
        if(callback) {
          callback();
          return;
        }
      }
    });
  }

  function loadWidget(a) {
    if (a.dataset.isLoading !== 'true') {
      a.dataset.isLoading = 'true';
      if (a.dataset.lazy === 'true' && lazyWidgetObserver !== null) {
        lazyWidgetObserver.observe(a.parentNode);
      } else {
        _loadWidget(a);
      }
    }
  }


  function loadWidgets() {

    var cookieSettings;
    if (typeof(getCookieSettings) === "function") {
      cookieSettings = getCookieSettings();
    } else {
      // there is no CookiePolicy Widget loaded
      cookieSettings = {
        essential: true,
        statistics: true,
        thirdparty: true,
        enabled: false,
        tracking: false
      };
    }

    var widgetAnchorList = document.querySelectorAll('a.cm4all-cookie-consent');

    var widgetsToLoad = [];

    for (var i = 0; i < widgetAnchorList.length; i++) {
      var a = widgetAnchorList[i];
      // var cookieInfo = JSON.parse(widget.dataset.cookieInfo);
      var allowRendering = !cookieSettings.enabled
        || (
          (cookieSettings.thirdparty === true || a.dataset.thirdparty !== 'true')
          &&
          (cookieSettings.statistics === true || a.dataset.statistics !== 'true')
        );
      if (!allowRendering) {
        if (a.dataset.thirdparty === 'true') {
          showWidgetPlaceholder(a);
        }
      } else {
        widgetsToLoad.push(a);
        showWidgetLoadingPlaceholder(a);
      }
    }

    widgetsToLoad.forEach(function(a) {
      loadWidget(a);
    })

    if (!cookieSettings.enabled || cookieSettings.statistics || cookieSettings.tracking === false) {
      var scriptList = document.querySelectorAll('script[type="application/x-cm4all-cookie-consent"]');
      for (var i = 0; i < scriptList.length; i++) {
        var script = scriptList[i];
        var html = DOM_PARSER.parseFromString(
          '<x-cm4all-root>' +
          script.dataset.code +
          '</x-cm4all-root>',
          'text/html'
        ).querySelector('x-cm4all-root').childNodes;

        replaceWithAll(script, html);
      }
    }

    var untrustedWidgetAnchorList = document.querySelectorAll('a.cm4all-untrusted-widget');
    for (var i = 0; i < untrustedWidgetAnchorList.length; i++) {
      var a = untrustedWidgetAnchorList[i];
      // todo wiid in dataset
      var wiid = a.id.replace(/^anchor_/, '');
      if (cookieSettings.thirdparty && window.cm4all.initializeUntrustedWidgets) {
        removeWidgetPlaceholder(a);
      } else {
        showWidgetPlaceholder(a);
      }
    }
    if (cookieSettings.thirdparty && window.cm4all.initializeUntrustedWidgets) {
      window.cm4all.initializeUntrustedWidgets();
    }
  }

  window.addEventListener('CookieSettingsChanged', loadWidgets);

  if (document.readyState === 'complete') {
    loadWidgets();
  } else {
    document.addEventListener('DOMContentLoaded', loadWidgets);
  }
})();


(function() {

  function initializeUntrustedWidgets() {
    /*
      iframe per javascript rausschreiben, da ansonsten beim Browser-Back eine alte URL mit ungueltiger
      TransactionId aufgerufen wird. Der IFrame braucht immer eine neue ID/Namen (wegen eines Netscape Memory Leaks)

      Um diverse Bugs mit untrusted-Widgets zu fixen / workarounden, wird folgendes gemacht:
        - Der Translation-Server uebergibt dem xslt-Prozessor seine scope-ID. Diese ID wird vom TS benötigt,
          um den entsprechenden Webspace zu ermitteln.
        - Ist das untrusted-Widget in einer PW-geschuetzten Seite eingebunden, wird die trusted-Variante genommen,
          allerdings wird das sandbox-Attribut angehangen. Dadurch hat das Embed-Widget keinen Zugriff mehr auf Cookies
        - Ansonsten (also außerhalb von PW-geschützten Seiten) wird sichergestellt,
          dass der Scope im Hostnamen des untrusted-Widgets steht.
          Das ist, wenn ein User auf der Webseite eingeloggt ist, eine andere ID.
    */
    if (!window.iframe_suffix){
      window.iframe_suffix = new Date().getTime();
    }
    [].forEach.call(document.querySelectorAll('a.cm4all-untrusted-widget'), function (a) {
      var iframeId = a.id.replace(/^anchor/,'iframe') + '_' + window.iframe_suffix;
      if (document.querySelector('iframe#' +iframeId)) {
        return;
      }
      var iframe = document.createElement('iframe');
      iframe.setAttribute('allowTransparency', 'true');
      iframe.setAttribute('id', iframeId);
      iframe.setAttribute('name', iframeId);
      if (window.beng.env.isProtected) {
        iframe.setAttribute('sandbox', 'allow-modals allow-forms allow-popups allow-scripts');
      }
      iframe.style.width='100%';
      iframe.style.height='100%';
      iframe.style.backgroundColor = 'transparent';
      iframe.style.border ='none';
      iframe.style.display ='block';
      iframe.classList.add('untrustedWidgetFrame');

      a.parentNode.insertBefore(iframe, a.nextSibling);

      if (!window.beng.env.isProtected && window.beng.env.scope) {
        var re = new RegExp("^([a-z0-9A-Z].*)(-fix4this.*)$");
        var match = re.exec(a.host);
        if (match && match[1] !== window.beng.env.scope.toLowerCase()) {
          a.host = window.beng.env.scope.toLowerCase() + match[2];
        }
      }
      var href = a.href;
      if (href.startsWith('http:') && href.indexOf('fix4this') != -1) {
        href = 'https:' + href.substring(5);
      }
      var xfti = new window.cm4all.XFrameTunnelInitiator(iframe);
      xfti.open(href);
    });
  }

  if (window.beng.env.mode != 'deploy') {
    if (document.readyState === 'complete') {
      initializeUntrustedWidgets();
    } else {
      document.addEventListener('DOMContentLoaded', initializeUntrustedWidgets);
    }
  }

  window.cm4all || {};
  window.cm4all.initializeUntrustedWidgets = initializeUntrustedWidgets;
})();
    };
    window.__loadedCssLibraries["/.cm4all/e/assets/css/base.css"] = true;
    window.__loadedCssLibraries["/.cm4all/e/assets/css/smartaccess.css"] = true;
