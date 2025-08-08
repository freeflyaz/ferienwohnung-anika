    window.__loadedJsLibraries = window.__loadedJsLibraries || (window.__loadedJsLibraries = new Object());
    window.__loadedCssLibraries = window.__loadedCssLibraries || (window.__loadedCssLibraries = new Object());
    if(window.__loadedJsLibraries["/res/js/lib/wrkrndz/jquery-register.js"] !== true){
        window.__loadedJsLibraries["/res/js/lib/wrkrndz/jquery-register.js"] = true;
        window.$j = jQuery;
// clear noConflict, to prevent $ being overwritten with undefined!
if (window.$ === window.jQuery) {
    jQuery.noConflict();
}
/**
    @private
*/
jQuery.noConflict = function() {
    return jQuery;
};
    };
    if(window.__loadedJsLibraries["/res/js/lib/HttpURL.js"] !== true){
        window.__loadedJsLibraries["/res/js/lib/HttpURL.js"] = true;
        (function(PKG) {
"PKG:nomunge"
//-WRAP switch on library wrapping
/**
    In older browser versions encodeURIComponent/decodeURIComponent
    are not supported, so we simulate it with escape/unescape,
    HttpURL.escape and HttpURL.unescape post-process both to an unified form.

*/
if (typeof(window.encodeURIComponent) == "undefined") {
    /**
        @private
    */
    window.encodeURIComponent = function(s) {
        return window.escape(s);
    }
}
if (typeof(window.decodeURIComponent) == "undefined") {
    /**
        @private
    */
    window.decodeURIComponent = function(s) {
        return window.unescape(s);
    }
}

PKG.HttpURL = Class.create(
/**
    @lends HttpURL#
*/
{
    /**
        @description
            HttpURL Class for easy HTTP-URL handling.
        @constructs
        @param {string} spec
            A string containing an absoulte or relative URL
    */
    initialize: function(spec) {
        this.isAbsolute = (spec.startsWith("http://") || spec.startsWith("https://"));
        this.pathStartsWithSlash = true;
        if (!this.isAbsolute) {
            this.pathStartsWithSlash = /^\//.test(spec);
            spec = PKG.HttpURL.DUMMY_PREFIX + spec.replace(/^\//, "");
        }

        this.protocol = null;
        this.host = null;
        this.port = -1;
        this.file = null;
        this.query = null;
        this.authority = null;
        this.path = null;
        this.userInfo = null;
        this.ref = null;
        this.qParams = new Hash();

        var i, limit, c;

        var original = spec;
        var start = 0;
        var newProtocol = null;
        var aRef = false;

        limit = spec.length;

        while ((limit > 0) && (spec.charAt(limit - 1) <= ' ')) {
            limit--; //eliminate trailing whitespace
        }

        while ((start < limit) && (spec.charAt(start) <= ' ')) {
            start++; // eliminate leading whitespace
        }

        if (spec.substr(start, 4).toLowerCase() == "url:") {
            start += 4;
        }

        if (start < spec.length && spec.charAt(start) == '#') {
            /* we're assuming this is a ref relative to the context URL.
             * This means protocols cannot start w/ '#', but we must parse
             * ref URL's like: "hello:there" w/ a ':' in them.
             */
            aRef = true;
        }

        for (i = start; !aRef && (i < limit) && ((c = spec.charAt(i)) != '/'); i++) {

            if (c == ':') {
                var s = spec.substring(start, i).toLowerCase();

                //if (this.isValidProtocol(s)) {
                newProtocol = s;
                start = i + 1;
                //}

                break;
            }
        }

        // Only use our context if the protocols match.
        this.protocol = newProtocol;

        if (this.protocol == null) {
            // ignored here
        }

        i = spec.indexOf('#', start);

        if (i >= 0) {
            this.ref = spec.substring(i + 1, limit);
            limit = i;
        }

        this.parseURL(spec, start, limit);
        this.parseQueryString();
    },

    /**
        @private
    */
    parseURL: function(spec, start, limit) {
        var isRelPath = false;
        var queryOnly = false;

        // FIX: should not assume query if opaque
        // Strip off the query part
        if (start < limit) {
            var queryStart = spec.indexOf('?');
            queryOnly = (queryStart == start);

            if (queryStart != -1) {
                this.query = spec.substring(queryStart + 1, limit);

                if (limit > queryStart)
                    limit = queryStart;

                spec = spec.substring(0, queryStart);
            }
        }

        var i = 0;
        // Parse the authority part if any
        if ((start <= limit - 2) && (spec.charAt(start) == '/') && (spec.charAt(start + 1) == '/')) {
            start += 2;
            i = spec.indexOf('/', start);
            if (i < 0) {
                i = spec.indexOf('?', start);

                if (i < 0)
                    i = limit;
            }

            this.host = this.authority = spec.substring(start, i);

            var ind = this.authority.indexOf('@');

            if (ind != -1) {
                this.userInfo = this.authority.substring(0, ind);
                this.host = this.authority.substring(ind + 1);
            }

            ind = this.host.indexOf(':');
            this.port = -1;
            if (ind >= 0) {
                // port can be null according to RFC2396
                if (this.host.length > (ind + 1)) {
                    this.port = parseInt(this.host.substring(ind + 1));
                }
                this.host = this.host.substring(0, ind);
            }

            start = i;
            // If the authority is defined then the path is defined by the
            // spec only; See RFC 2396 Section 5.2.4.
            if (this.authority != null && this.authority.length > 0)
                this.file = "";
        }

        if (this.host == null) {
            this.host = "";
        }

        // Parse the file path if any
        if (start < limit) {
            if (spec.charAt(start) == '/') {
                this.file = spec.substring(start, limit);
            } else if (this.file != null && this.file.length > 0) {
                isRelPath = true;
                var ind = this.file.lastIndexOf('/');

                var seperator = "";

                if (ind == -1 && this.authority != null)
                    seperator = "/";

                this.file = this.file.substring(0, ind + 1) + seperator + spec.substring(start, limit);
            } else {
                var seperator = (this.authority != null) ? "/" : "";
                this.file = seperator + spec.substring(start, limit);
            }
        } else if (queryOnly && this.file != null) {
            var ind = this.file.lastIndexOf('/');
            if (ind < 0)
                ind = 0;
            this.file = this.file.substring(0, ind) + "/";
        }

        if (this.file == null)
            this.file = "";

        if (isRelPath) {
            // Remove embedded /./
            while ((i = this.file.indexOf("/./")) >= 0) {
                this.file = this.file.substring(0, i) + this.file.substring(i + 2);
            }
            // Remove embedded /../
            while ((i = this.file.indexOf("/../")) >= 0) {
                if ((limit = this.file.lastIndexOf('/', i - 1)) >= 0) {
                    this.file = this.file.substring(0, limit) + this.file.substring(i + 3);
                } else {
                    this.file = this.file.substring(i + 3);
                }
            }
            // Remove trailing ..
            while (this.file.substring(this.file.length - 3, this.file.length) == "/..") {
                //while (file.endsWith("/..")) {
                i = this.file.indexOf("/..");
                if ((limit = this.file.lastIndexOf('/', i - 1)) >= 0) {
                    this.file = this.file.substring(0, limit + 1);
                } else {
                    this.file = this.file.substring(0, i);
                }
            }
            // Remove trailing .
            if (this.file.substring(this.file.length - 2, this.file.length) == "/.")
            //if (file.endsWith("/."))
                this.file = this.file.substring(0, this.file.length() - 1);
        }
        if(!this.pathStartsWithSlash){
            this.file = this.file.replace(/^\//, "");
        }
        this.path = this.file;
        this.file = this.query == null ? this.file : this.file + "?" + this.query;
    },

    /**
        @private
    */
    parseQueryString: function() {
        if (this.query == null || this.query.length == 0) {
            return;
        }

        this.qParams = $H(this.query.toQueryParams());
    },

    /**
        @description
            Get a query parameter from HttpURL. This function always returns
            the first parameter when more than one exist
        @param {string} key
            the key of the query parameter to get
        @param {string} defval
            the default value to return, if no value for key is found
        @type
            string
    */
    getParameter: function(key, defval) {
        if (!key) {
            return defval;
        }

        var toret = this.qParams.get(key);
        return toret == null ? defval : Object.isArray(toret) ? toret.first() : toret;
    },

    /**
        @description
            Sets a query parameter to url.
        @param {string} key
            the key of the query parameter to set
        @param {string} val
            the value of the query parameter to set
        @param {boolean} replace
            decides, wether the value is added, or key/value-pair is replaced
        @type
            void
    */
    setParameter: function(key, val, replace) {
        if (!key) {
            return;
        }

        var valuez = this.qParams.get(key);
        // create an array, if only a string is contained
        if (Object.isString(valuez)) {
            this.qParams.set(key, [valuez]);
        }

        // create a new array, if replace is true
        if (replace || valuez == null) {
            this.qParams.set(key, new Array());
        }

        var data = this.qParams.get(key);
        if (Object.isArray(val)) {
            this.qParams.set(key, data.concat(val));
        } else {
            data.push(val);
        }
    },

    /**
        @description
            Sets query parameters to url from object.
        @param {Object} obj
            the object to set the query parameters from
        @param {boolean} replace
            decides, wether the value is added, or key/value-pair is replaced
        @type
            void
    */
    setParameters: function(obj, replace) {
        $H(obj || {}).each(function(kv) {
            this.setParameter(kv.key, kv.value, replace);
        }.bind(this));
    },

    /**
        @description
            Removes a key from query params
        @param {string} key
            the key of the query parameter to remove
        @type
            void
    */
    removeParameter: function(key) {
        this.qParams.unset(key);
    },

    /**
        @description
            Deletes all query params
        @type
            void
    */
    removeAllParams: function() {
        this.qParams = new Hash();
    },

    /**
        @description
            Get all query parameter values for a key
        @param {string} key
            the key of the query parameters to get
        @type
            string|string[]
    */
    getParameterValues: function(key) {
        return this.qParams.get(key);
    },

    /**
        @description
            Get all query parameter names
        @type
            string[]
    */
    getParameterNames: function() {
        return this.qParams.keys();
    },

    /**
        @see HttpURL#toExternalForm
    */
    toString: function() {
        return this.toExternalForm();
    },

    /**
        @description
            Converts a HttpURL back to a string
        @type
            string
    */
    toExternalForm: function() {
        return this._toExternalForm(false);
    },

    /**
        @private
    */
    _toExternalForm: function(skipQuery) {
        var result = this.protocol;

        result += ":";

        if (this.authority != null && this.authority.length > 0) {
            result += "//";
            result += this.authority;
        }

        if (this.path != null) {
            result += ((this.pathStartsWithSlash ? "" : "/") + this.path);
        }

        if (!skipQuery) {
            var query = this.qParams.toQueryString();

            if (query.length > 0) {
                result += "?" + query;
            }
        }

        if (this.ref != null) {
            result += "#";
            result += this.ref;
        }

        if (!this.isAbsolute) {
            result = result.substring(PKG.HttpURL.DUMMY_PREFIX.length - (this.pathStartsWithSlash ? 1 : 0));
        }

        return result;
    },

    /**
        @description
            Returns an Object containing url as 'url' and parameter
            as 'parameters' for use in prototype's Ajax object
        @type
            Object
    */
    getPrototypePair: function() {
        return {
            url: this._toExternalForm(true),
            parameters: this.qParams
        }
    },

    /**
        @description
            Debugs the url. If console.log is available the debug info is
            printed there, else it's alerted
        @type
            void
    */
    debug: function() {
        var debug = "protocol:  " + this.protocol + "\n" + "host:      " + this.host + "\n" + "port:      " + this.port + "\n" + "file:      " + this.file + "\n" + "userInfo:  " + this.userInfo + "\n" + "path:      " + this.path + "\n" + "ref:       " + this.ref + "\n" + "query:     " + this.query + "\n" + "authority: " + this.authority + "\n" + "qParams:   " + this.qParams.toQueryString() + "\n\n";

        if (typeof(console) != "undefined" && typeof(console.log) == "function") {
            console.log(debug);
        } else {
            alert(debug);
        }
    }
});

Object.extend(PKG.HttpURL,
/**
    @lends HttpURL
*/
{
    DUMMY_PREFIX: "http://dummy/",

    /**
        @description
            URL-encodes an string
        @param {string} s
            the string to encode
        @type
            string
    */
    urlencode: function(s) {
        var re1 = /\+/g;
        var re2 = /%20/g;
        var re3 = /'/g;
        s = encodeURIComponent(s);
        return s.replace(re1, "%2B").replace(re2, "+").replace(re3, "%27");
    },

    /**
        @description
            URL-decodes an string
        @param {string} s
            the string to decode
        @type
            string
    */
    urldecode: function(s) {
        var re = /\+/g;
        s = s.replace(re, "%20");
        return decodeURIComponent(s);
    },

    /**
        @see HttpURL.qualify
    */
    makeAbsolute: function(url) {
        return PKG.HttpURL.qualify(url);
    },

    /**
        @description
            makes an URL fully-qualified
        @param {string|HttpURL} s
            the string/HttpURL to qualify
        @type
            string
    */
    qualify: function(url) {
        if (!this.qualifyCache) {
            this.qualifyCache = {};
            this.anchor = new Element('a', {
                href: "#"
            }).update('x');
            // wird das div benoetigt?
            this.div = new Element('div').insert(
                this.anchor);
        }
        if (!this.qualifyCache[url]) {
            this.anchor.href = url;
            this.qualifyCache[url] = this.anchor.href;
        }
        return this.qualifyCache[url];
    },

    /**
        @private
    */
    quEscape: function(s) {
        return s.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
    }
});

// TODO: remove this
window.HttpURL = PKG.HttpURL;



/**
    @description
        HttpURLUtils Class for modifing a HttpURL.
*/
/* reverseString, get+setParameter are helper methods to workaround an IE8+ XSS-Filter issue */
window.HttpURLUtils = {
    /**
        @private
    */
    rotBase: 1,

    rotateString: function(text, base) {
        var keycode = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var textrot = new String();

        base = new Number(base);

        for (var i = 0; i < text.length; i++) {
            var codechar = text.substring(i, i + 1);
            var pos = keycode.indexOf(codechar.toUpperCase());

            if (pos >= 0) {
                pos = (pos + base) % keycode.length;
                codechar = (codechar == codechar.toUpperCase()) ? keycode.substring(pos, pos + 1) : keycode.substring(pos, pos + 1).toLowerCase();
            }
            textrot = textrot + codechar;
        }
        return textrot;
    },

    reverseString: function(str) {
        str = (str || "");
        return str.split("").reverse().join("");
    },

    /**
        @description
            set a parameter with the chararcters sorted in a reversed order.
            We need this to workaround an IE8+ XSS-Filter issue.
        @param {string|HttpURL} name
            parameter name
        @param {string|HttpURL} value
            parameter value
    */
    setReverseParameter: function(url, name, value) {
        var base = url.getParameter("rot-base");
        base = url.getParameter("rot-base");
        if (!base) {
            base = new HttpURL(document.location.href).getParameter("rot-base");
            if (base) {
                base = ((new Number(base) + 1) % 26) + 1;
            }
            if (!base) {
                base = ((HttpURLUtils.rotBase++) % 26) + 1;
            }
            url.setParameter("rot-base", base);
        }
        value = HttpURLUtils.rotateString(value, base);
        url.setParameter(name, HttpURLUtils.reverseString(value));
    },

    /**
        @description
            get a parameter with the chararcters sorted in a reversed order.
            We need this to workaround an IE8+ XSS-Filter issue.
        @param {string|HttpURL} name
            parameter name
        @param {string|HttpURL} value
            parameter value
        @param {string|HttpURL} _default
            default value

    */
    getReverseParameter: function(url, name, _default) {
        var value = HttpURLUtils.reverseString(url.getParameter(name));
        var base;
        if (value && (base = url.getParameter("rot-base")) != "") {
            base = 26 - new Number(base);
            /* alert(name + "\n" + value + "\n" + base + "\n" + HttpURLUtils.rotateString(value, base)); */
            value = HttpURLUtils.rotateString(value, base);
        }
        return (value || _default);
    }
};
})((function() {
    if (typeof LIBCM4ALL_JS_WIDGET_NAMESPACE == "object") {
        return LIBCM4ALL_JS_WIDGET_NAMESPACE;
    }
    if (typeof(window.cm4all) == "undefined") {
        window.cm4all = {};
    }
    return window.cm4all;
})());
    };
    if(window.__loadedJsLibraries["/res/js/lib/Common.js"] !== true){
        window.__loadedJsLibraries["/res/js/lib/Common.js"] = true;
        (function(PKG) {
"PKG:nomunge"
//-WRAP switch on library wrapping
/**
 @name LIBCM4ALL_JS_WIDGET_NAMESPACE
 @description
 This variable controls to which "namespace" the library is bound.
 If not set the default-namespace "cm4all" will be used.
 @example
 default:
 &lt;script src="Common.js">;&lt;/script>
 &lt;script src="HttpURL.js">;&lt;/script>
 &lt;script>
 var httpUrl = new cm4all.HttpURL();
 &lt;/script>

 example "juppes"-namespace:
 &lt;script>
 var juppes = LIBCM4ALL_JS_WIDGET_NAMESPACE = {};
 &lt;/script>
 &lt;script src="Common.js">;&lt;/script>
 &lt;script src="HttpURL.js">;&lt;/script>
 &lt;script>
 var httpUrl = new juppes.HttpURL();
 &lt;/script>

 to put classes into "global" namespace, use:
 &lt;script>
 LIBCM4ALL_JS_WIDGET_NAMESPACE = window;
 &lt;/script>
 &lt;script src="Common.js">;&lt;/script>
 &lt;script src="HttpURL.js">;&lt;/script>
 &lt;script>
 var httpUrl = new HttpURL();
 &lt;/script>

 */

/**
 * @name Common
 * @namespace
 * @description Base Object for all common stuff
 */



PKG.Common = ({
  notTooOften: function(obj, fn) { /* little helper function: we dont want to call a eventhandler (i.e. hintingHandler) too often */
    var lastCall = 0;
    var timerId = 0;
    if (obj) {
      fn = fn.bind(obj);
    }
    return function(ev) {
      if (timerId) {
        clearTimeout(timerId);
        timerId = 0;
      }
      const now = new Date();
      if (now - lastCall >= 150) {
        // dont wait more than 150 ms
        lastCall = now;
        fn(ev);
      } else {
        timerId = setTimeout(function() {
          lastCall = new Date();
          fn(ev);
        }, 150);
      }
    };
  }
});

Object.extend(PKG.Common, {
  /**
   * @lends Common
   */
  _defaultLogger: null,

  /**
   * @type string
   * @description returns the server from where you can load additional libraries -
   */

  getLibServer: function() {
    if (window.jslibServer) {
      return window.jslibServer;
    }
    if (window.beng && window.beng.env && window.beng.env.common_prefix) {
      return window.beng.env.common_prefix;
    }
    return "";
  },

  /**
   * @param {string|string[]|object|object[]}
   *            urls URLs of Javascript files to load as string or as object:<br/> { url :
   *            "&lt;url>", isLoaded : function() { return &lt;true-if-loaded> }}
   * @param {function}
   *            callback Callback function, which is invoked when all js files are loaded
   * @type void
   * @description Scripts are appended to &lt;head>, so document.write or similar funtions are
   *              not allowed here. An optional callback can be invoked after loading is done.
   *              Scripts, which are already loaded are not loaded again.
   * @example It's possible to load files parallel: [ [ "parallel-1a.js", "parallel-1b.js",
   *          "parallel-1c.js", "parallel-1d.js" ], "serial2.js", { url :
   *          "res/parallel-1a.js", isLoaded : function() { return false; } }, "serial3.js",
   *          "serial4.js" ]
   */
  requireLibrary: function(urls, callback) {
    var thiz = this;
    if (!Object.isArray(urls)) {
      urls = [urls];
    }

    var url = urls[0];

    if (Object.isArray(url)) {
      var newurls = urls.findAll(function(e) {
        return Object.isArray(e) ? Object.toJSON(e) != Object.toJSON(url) : true;
      });
      var _callback = function() {
        PKG.Common.requireLibrary.bind(thiz, newurls, callback).defer( /* break the recursion */ );
      };
      var _urls = {
        paylord: url
      };
      url.each(function(_url) {
        PKG.Common.__requireLibrary(_url, _urls, _callback, true);
      });
      return;
    } else
    // serial urls left ...
    if (url) {
      PKG.Common.__requireLibrary(url, {
        paylord: urls
      }, callback, false);
    } else
    // NO serial urls left ...
    if (typeof(callback) == "function") {
      callback();
    }

  },

  /**
   * @private
   */
  __requireLibrary: function(url, urls, callback, isParallel) {
    var test;
    var script = null;
    var func;
    var observe = Event.observe || Event.prototype.constructor.observe; // (PBT: #11772) IE
    // has another Event object if webcomponents-lite.js is loaded in page
    var ljl = window.__loadedJsLibraries || (window.__loadedJsLibraries = new Object());
    if (Object.isFunction(url.isLoaded)) {
      test = url.isLoaded();
    } else if (ljl[url] === true) {
      test = true;
    } else {
      test = (script = $$("script").find(function(e) {
        return (PKG.HttpURL.qualify(e.src) == PKG.HttpURL.qualify(url.url || url));
      })) ? true : false;
    }

    if (!test) {
      // import the file
      script = new Element('script');

      var head = PKG.Common.getOrCreateHeadElement();
      /**
       * @private
       */
      func = function() {
        var _url = url.url || url;
        if (!ljl[_url] && (!script.readyState || script.readyState == "loaded" || script
            .readyState == "complete")) {
          ljl[_url] = true;
          script.removeAttribute("dirty");
          PKG.Common.callbackFunc(url, urls, {
            callback: callback,
            script: script,
            skipCheck: false,
            isParallel: isParallel
          });
        }
      };

      /*
              Currently, it's not possible to decide whether loading
              script was successful in a cross-browser way, so the
              callback function is invoked also onerror, so that all
              browsers behave the same way ...
              FF3     : calls onload on success, onerror on error
              Safari3 : calls onload on success and error
              IE7     : calls onreadystatechange with readyState loaded
                        and complete on success and error
          */

      observe(script, "error", func);
      observe(script, "load", func);
      observe(script, "readystatechange", func);
      /*  set the src later, because starts loading immendiately
              after setting src */
      script.setAttribute("dirty", "dirty");
      script.src = url.url || url;

      head.insert({
        bottom: script
      });
      head = null;
    } else {
      // file is already loaded, just call the callback func
      func = function() {
        if (script && script.getAttribute("dirty")) {
          window.setTimeout(func, 10);
          return;
        }
        PKG.Common.callbackFunc(url, urls, {
          callback: callback,
          script: new Element('script'),
          skipCheck: true,
          isParallel: isParallel
        });
        script = null;
        func = null;
      };
      func.call(this);
    }
  },

  /**
   * @param {string|string[]}
   *            urls URLs of Javascript files to load
   * @param {string}
   *            insertPosition Position in the head where the link tag is inserted - 'bottom'
   *            or 'top'
   * @type void
   * @description CSSs are appended to &lt;head>, if a css was NOT loaded before
   */
  loadCss: function(urls, insertPosition) {
    if (!Object.isArray(urls)) {
      urls = [urls];
    }

    var head = PKG.Common.getOrCreateHeadElement();

    urls.each(function(url) {
      if (Object.isArray(url)) {
        PKG.Common.loadCss(url);
      } else {
        var test;
        var lcl = window.__loadedCssLibraries || (window.__loadedCssLibraries = new Object());
        if (lcl[url] === true) {
          test = true;
        } else {
          test = $$("link").any(function(e) {
            return (PKG.HttpURL.qualify(e.href) == PKG.HttpURL.qualify(url));
          });
        }
        if (!test) {
          var o = {};
          o[insertPosition || "bottom"] = new Element('link', {
            "type": "text/css",
            "rel": "stylesheet",
            "href": url
          });
          head.insert(o);
          lcl[url] = true;
        }
      }
    });
  },

  /**
   * @param (string)
   *            the css selector
   * @param ((object{})
   *            styles to set
   * @type void
   * @description
   *            adds css rules to the document heaad element
   * @example createCssRule("body", {"background-color": "red"});
   */
  createCssRule: function(selector, properties) {
    var $styleElement = jQuery("style#jslib-css");
    if ($styleElement.length == 0) {
      $styleElement = jQuery("<style></style>");
      jQuery("head").append($styleElement);
    }
    var rule = selector + " {";
    jQuery.each(properties,
      function(key, value) {
        rule += key + ":" + value + ";\n";
      }
    );
    rule += "};"
    $styleElement.append(rule);
  },


  /**
   * @param (object)
   *          the dom element where to start the search from
   * @param (string)
   *          the css name of the color to search for
   *          ["color", "background-color", "border-color"]
   * @param (string)
   *          the defaultColor. Can be empty
   * @description
   *          returns the computed css-color of a given element
   *          this function searches the element itself and all parents
   *          all colors like 'transparent' and rgba(*,*,*,0) will be ignored
   */

  findColor: function(elem, color, defaultColor) {
    color = color || "color";
    defaultColor = defaultColor || null;

    var ignoreRe = /rgba*\(\d+,\d+,\d+,0\)/;
    while (elem != document) {
      var compStyle = window.getComputedStyle(elem);
      if (compStyle) {
        var val = compStyle[color];
        val = val.replace(/\s/g, '');
        if (val !== 'transparent' && !ignoreRe.test(val)) {
          return val;
        }
      }
      elem = elem.parentNode;
    }
    return defaultColor;
  },


  /**
   * @param {object[]}
   *            requests Array of objects, each with two properties 'url' and 'options', which
   *            are passed to Ajax.Request
   * @param {function}
   *            callback Callback function, which is invoked after all ajax requests are
   *            finished
   * @type void
   * @description Loads multiple ajax requests in parallel and invokes the callback after all
   *              requests are finished. onSuccess/onFailure - if defined - are called for
   *              each request. method is set to 'GET' per default.
   * @example cm4all.Common.loadAssets([ { url : '/beng/designset.js', options : { onSuccess :
   *          this.onDesignSetLoaded.bind(this), onFailure : this.onDesignSetFailed.bind(this) } }, {
   *          url : '/beng/colorsets.js', options : { onSuccess :
   *          this.onColorSetsLoaded.bind(this) } }, { url :
   *          createBengRequestUrl('/.cm4all/e/Editor', {action: 'setDesignData'}),
   *          options : { method : 'post', postBody : this.designdataDoc, contentType :
   *          'text/xml', onSuccess: this.onDesignDataSaved.bind(this) } } ],
   *          this.myCallback.bind(this));
   *
   */
  loadAssets: function(requests, callback) {
    requests = Object.ensureArray(requests);
    if (requests.length == 0 && Object.isFunction(callback)) {
      callback();
      return;
    }

    requests.each(function(req) {
      req.options.method = req.options.method || 'get';
      var origFuncs = {
        onSuccess: req.options.onSuccess || null,
        onFailure: req.options.onFailure || null
      };
      var onResponse = function(func, res) {
        if (origFuncs[func]) {
          try {
            origFuncs[func](res);
          } catch (e) {
            if (typeof console != 'undefined') {
              console.log("Error in callback after loading " + req.url);
              console.log(e);
            }
          }
        }
        req.ready = true;
        if (requests.pluck('ready').all() && Object.isFunction(callback)) {
          callback();
        }
      };
      req.options.onSuccess = onResponse.curry('onSuccess');
      req.options.onFailure = onResponse.curry('onFailure');
      new Ajax.Request(req.url, req.options);
    });
  },

  /**
   * @param {string}
   *            message the message to log
   * @type void
   * @description Logs a message, if a non-blocking logging facility is available.
   * @deprecated Use a specific Logger instead <a href="Common.Logger.html">Common.Logger</a>
   */
  log: function(message) {
    if (PKG.Common._defaultLogger == null) {
      PKG.Common._defaultLogger = new PKG.Common.Logger();
    }
    PKG.Common._defaultLogger.debug(message);
  },

  /**
   * @param {string}
   *            category event category
   * @param {string}
   *            type event type
   * @param {object}
   *            [attributes] payload of the event
   * @param {function}
   *            [callback] optional callback function called on request completion with response parameter
   * @type void
   * @description Logs events generated in the frontend via history service backend.
   */
  logViaHistoryService: function(category, type, attributes, callback) {
    var serviceUrl = new PKG.HttpURL("/.cm4all/e/Editor/action=log/;translate=skipProcess$3Dtrue");
    serviceUrl.setParameter("category", category);
    serviceUrl.setParameter("type", type);
    new Ajax.Request(serviceUrl.toExternalForm(), {
      method: "post",
      contentType: "application/json",
      postBody: attributes ? Object.toJSON(attributes) : "{}",
      onComplete: function(response) {
        if (typeof callback == "function") {
          callback(response);
        }
      }
    });
  },

  /**
   * @param {string}
   *            CSS3 selector for elements to modifiy
   * @type void
   * @description Adds doubleTapToGo functionality to elements from selector
   */
  doubleTapToGo: function(selector) {

    if (navigator.userAgent.match(/iPhone|iPad|iPod/) &&
      Number((navigator.userAgent.match(/OS (\d+)_(\d+)/) || false)[1]) <= 7) {
      return;
    }

    (function($, window, document, undefined) {
      $.fn.doubleTapToGo = function(params) {
        if (!('ontouchstart' in window) &&
          !navigator.msMaxTouchPoints &&
          !navigator.userAgent.toLowerCase().match(/windows phone os 7/i)) return false;

        this.each(function() {
          var curItem = false;

          $(this).on('click', function(e) {
            var item = $(this);
            if (item[0] != curItem[0]) {
              e.preventDefault();
              curItem = item;
            }
          });

          $(document).on('click touchstart MSPointerDown', function(e) {
            var resetItem = true,
              parents = $(e.target).parents();

            for (var i = 0; i < parents.length; i++)
              if (parents[i] == curItem[0])
                resetItem = false;

            if (resetItem)
              curItem = false;
          });
        });
        return this;
      };
    })(jQuery, window, document);

    jQuery(selector).doubleTapToGo();
  },

  /**
   * @param {string|Element}
   *            content A HTML string or an element.
   * @param {number|string}
   *            options.width Width of the "fullscreen" layer. Number means pixel, string can
   *            be a percent value, e.g. "80%"
   * @param {number|string}
   *            options.height Height of the "fullscreen" layer. Number means pixel, string
   *            can be a percent value, e.g. "80%"
   * @param {number}
   *            options.left left margin of the "fullscreen" layer in pixel.
   * @param {number}
   *            options.right right margin of the "fullscreen" layer in pixel.
   * @param {number}
   *            options.top top margin of the "fullscreen" layer in pixel.
   * @param {number}
   *            options.bottom bottom margin of the "fullscreen" layer in pixel.
   * @param {string}
   *            options.scrollbars Allowed values: "x" "y" "xy". If set the, content will get
   *            scrollbars in the given directions if needed.
   * @type Element
   * @description "Opens" a layer with options.width and options.height. If the current
   *              viewport is smaller than width and/or height. The values are scaled to fit
   *              viewport keeping aspect ratio. <br/>
   */
  openFullscreen: function(content, options = {}) {
    // convert "123px" to numbers
    if (options.width && /px$/.test(options.width)) {
      options.width = Number(/(.*)px$/.exec(options.width)[1]);
    }

    if (options.height && /px$/.test(options.height)) {
      options.height = Number(/(.*)px$/.exec(options.height)[1]);
    }

    if (options.width && options.height && !/%$/.test(options.width)) {
      var dimz = document.viewport.getDimensions();
      dimz.width = dimz.width - 40;
      dimz.height = dimz.height - 40;

      if (options.width > dimz.width && !(/x/i).test(options.scrollbars)) {
        var aspect = options.height / options.width;
        options.width = dimz.width;
        options.height = options.width * aspect;
      }

      if (options.height > dimz.height && !(/y/i).test(options.scrollbars)) {
        var aspect = options.width / options.height;
        options.height = dimz.height;
        options.width = options.height * aspect;
      }
    }

    var lcontainer;
    var lbackground;
    var lcontent;
    var lcloser;
    var pnode;
    var rnode;

    if (Object.isElement(content)) {
      content = $(content);
      pnode = content.up();
      rnode = content.next();
    }

    lcontainer = new Element('div', { 'class': 'cm-fullscreen container' });
    lbackground = new Element('div', { 'class': 'cm-fullscreen background' });
    lcontent = new Element('div', { 'class': 'cm-fullscreen content' });
    lscrollbars = new Element('div', { 'class': 'cm-fullscreen scrollbars' });
    lborder = new Element('div', { 'class': 'cm-fullscreen border' });

    if ((/x/i).test(options.scrollbars)) {
      lscrollbars.addClassName("scrollbars-x");
    }
    if ((/y/i).test(options.scrollbars)) {
      lscrollbars.addClassName("scrollbars-y");
    }
    lcloser = new Element('div', { 'class': 'cm-fullscreen close' });
    lcloser.observe("click", function() {
      if (pnode) {
        pnode.insertBefore(content, rnode || null);
      }
      /* (PBT: #3911) */
      var iframes = lcontainer.select("iframe");
      iframes.each(function(iframe) {
        try {
          iframe.src = 'about:blank';
        } catch (e) {
          Common.log(e.message);
        }
      });
      lcontainer.remove();
    });

    if (options.width) {
      if (/%$/.test(options.width)) {
        lcontent.setStyle({
          width: options.width,
          minWidth: options.width,
        });
      } else {
        lcontent.style.width = options.width + 'px';
        lcontent.style.minWidth = options.width + 'px';
      }
    } else if (options.left && options.right) {
      lcontent.setStyle({
        left: options.left + 'px',
        right: options.right + 'px',
        transform: 'initial'
      });
    } else {
      throw new Error("Illegal Arguments: either options.width or options.left/options.right must be set");
    }

    if (options.height) {
      if (/%$/.test(options.height)) {
        lcontent.setStyle({
          height: options.height,
        });
      } else {
        lcontent.style.height = options.height + 'px';
      }
    } else if (!(options.top && options.bottom)) {
      throw new Error("Illegal Arguments: either options.height or options.top/options.bottom must be set");
    }
    if (options.top) {
      lcontent.setStyle({
        top: options.top + 'px',
      });
    } else if (options.bottom) {
      lcontent.setStyle({
        bottom: options.bottom + 'px'
      });
    }

    lcontainer.insert(lbackground);
    lcontainer.insert(lcontent);
    lcontent.insert(lscrollbars);
    lcontent.insert(lborder);
    lborder.insert(lscrollbars);
    lscrollbars.insert(content);

    // lborder.style.height = lbackground.offsetHeight + 'px';

    // iframes need a height
    let fec = lscrollbars.firstElementChild;
    if (fec && fec.tagName.toLowerCase() === 'iframe') {
       fec.style.height = options.height + 'px';
    }

    lborder.insert(lcloser);
    $(document.body).insert(lcontainer);

    return lcontent;
  },

  /**
   * @param {string|Element}
   *            imageUrl The url of the image to show.
   * @param {number}
   *            options.minWidth
   *              The minimal width of the image. If the image is narrower it will be upscaled.
   * @param {number}
   *            options.minHeight
   *              The minimal height of the image. If the image is smaller  it will be upscaled.
   * @type Element
   * @description Shows the image in its original size in a fullscreen layer.
   *                  If the image is larger than the viewport it is scaled down to fit the viewport.
   */
  openFullscreenImage: function(imageUrl, options) {
    options = options || {};
    var imageId = "cm4all-common-fullscreen-image-" +
      ((new Date().getTime() + Math.random()).toString(32).replace(/\./, "-"));

    // TODO : "auto" is not an option recognized by "openFullScreen" !
    var popup = PKG.Common.openFullscreen(`<img id="${imageId}" src="${imageUrl}" />`, {
      "width": "auto",
      "height": "auto"
    });

    var content = document.querySelector('.cm-fullscreen.content');
    var img = document.getElementById(imageId);

    content.style.minWidth = 'max-content';
    content.style.display = 'block';

    img = PKG.Common.scaleImage(img);

    if (options.minHeight || options.minWidth) {
      content.style.maxWidth = 'initial';
      img.style.minHeight = options.minHeight + 'px';
      img.style.minWidth = options.minWidth + 'px';
    } else {
      content.style.transform = 'translate(calc(-50%), calc(-50%))';
    }
    document.querySelector('.cm-fullscreen.scrollbars').style.maxHeight = img.style.maxHeight;
    document.querySelector('.cm-fullscreen.scrollbars').style.maxWidth = img.style.maxWidth;

    return popup;
  },

  getNativeDimension: function(url) {
    return new Promise(function( resolve, reject ) {
      var image = new Image();

      // Chrome default size for images without width or height. e.g. SVG;
      var dimension = {nativeWidth: 640, nativeHeight: 480, url: url, error: null};

      image.onload = function(event) {
          dimension.nativeWidth = this.width || dimension.nativeWidth;
          dimension.nativeHeight = this.height || dimension.nativeHeight;
          resolve(dimension);
      };

      image.onerror = function(event) {
          dimension.error = event;
          reject(dimension);
      };

      image.src = url;
    });
  },

  // ---------------------------------------------------------------------

  setImageHeightAndWidth: function(imageElement, targetHeight, targetWidth) {
    imageElement.style.maxHeight = targetHeight + 'px';
    imageElement.style.minHeight = targetHeight + 'px';
    imageElement.style.height = targetHeight + 'px';
    imageElement.closest('.cm-fullscreen.scrollbars').style.height = targetHeight + 'px';

    imageElement.style.maxWidth = targetWidth + 'px';
    imageElement.style.minWidth = targetWidth + 'px';
    imageElement.style.width = targetWidth + 'px'
    return imageElement;
  },

  scaleImage: function(imageElement) {
    if (imageElement != null) {
      PKG.Common.getNativeDimension([imageElement.src]).then(function(result) {
        var nativeWidth = result.nativeWidth;
        var nativeHeight = result.nativeHeight;

        var maxAvailableHeight = window.innerHeight - 40;
        var maxAvailableWidth = window.innerWidth - 40;

        var widthRatio = maxAvailableWidth / nativeWidth;
        var heightRatio = maxAvailableHeight / nativeHeight;

        var scale = Math.min(widthRatio, heightRatio);

        if (scale <= 1) {
          var targetDisplayHeight = (nativeHeight * scale);
          var targetDisplayWidth = (nativeWidth * scale);
          PKG.Common.setImageHeightAndWidth(imageElement, targetDisplayHeight, targetDisplayWidth);
        } else {
          PKG.Common.setImageHeightAndWidth(imageElement, nativeHeight, nativeWidth);
        }
      });
    }
    return imageElement;
  },

  /**
   * @param {string|Element}
   *            imageUrls Arrays of urls of the images to show.
   * @param {number}
   *            index of the image to show
   * @param {number}
   *            id of the img to change the picture
   * @type Element
   * @description Shows the next/prev image in its original size in a fullscreen layer.
   *              If the image is larger than the viewport it is scaled down to fit the viewport.
   */
  plusSlides: function(imageUrls, index, img) {
    index = (index + imageUrls.length) % imageUrls.length;
    img.src = imageUrls[index];
    img = PKG.Common.scaleImage(img);
  },

  /**
   * @param {string|Element}
   *            imageUrls Arrays of urls of the images to show.
   * @param {number}
   *            index of the image to show
   * @param {number}
   *            options.minWidth
   *              The minimal width of the image. If the image is narrower it will be upscaled.
   * @param {number}
   *            options.minHeight
   *              The minimal height of the image. If the image is smaller  it will be upscaled.
   * @type Element
   * @description Shows the image in its original size in a fullscreen layer.
   *                  If the image is larger than the viewport it is scaled down to fit the viewport.
   */
  openFullscreenImageSlideshow: function(imageUrls, index, options) {
    options = options || {};
    index = index || 0;
    var imageId = "cm4all-common-fullscreen-image-" + ((new Date().getTime() + Math.random()).toString(32).replace(/\./, "-"));
    var slideshow = '<div id="myModal" class="cm-fullscreen modal"><div class="cm-fullscreen modal-content">';
    slideshow += `<img id="${imageId}" src="${imageUrls[index]}">`;
    slideshow += '<a class="cm-fullscreen prev"></a><a class="cm-fullscreen next"></a></div></div>';

    // TODO : "auto" is not an option recognized by "openFullScreen" !
    var popup = PKG.Common.openFullscreen(slideshow, {
      "width": "auto",
      "height": "auto"
    });

    var content = document.querySelector('.cm-fullscreen.content');
    var img = document.getElementById(imageId);

    content.style.minWidth = 'max-content';
    content.style.display = 'block';

    img = PKG.Common.scaleImage(img);

    if (options.minHeight || options.minWidth) {
      content.style.maxWidth = 'initial';
      img.style.minHeight = options.minHeight + 'px';
      img.style.minWidth = options.minWidth + 'px';
    } else {
      img.style.width = '100%'
      content.style.transform = 'translate(calc(-50%), calc(-50%))';
    }

    var prev = document.querySelector('.cm-fullscreen.prev');
    var next = document.querySelector('.cm-fullscreen.next');
    prev.addEventListener('click', function prev() {
      PKG.Common.plusSlides(imageUrls, --index, img);
    })

    next.addEventListener('click', function next() {
      PKG.Common.plusSlides(imageUrls, ++index, img);
    })
    return popup;
  },
  /**
   * @private
   */
  callbackFunc: function(url, urls, data
    //    /**string|object*/   url,
    //    /**string[]*/ urls,
    //    /**function*/ callback,
    //    /**Element*/  script,
    //    /**boolean*/  skipCheck,
    //    /**boolean*/  isParallel
  ) {
    if (data.script.importDone) {
      return;
    }

    // skipCheck is here if script.readyState is not there anymore
    // on a later class ( IE 7 had a problem with it )
    if (!data.skipCheck && data.script.readyState && data.script.readyState != "loaded" && data
      .script.readyState != "complete") {
      return;
    }
    data.script.importDone = true; // dont call me twice
    urls.paylord = urls.paylord.findAll(function(e) {
      return Object.toJSON(e) != Object.toJSON(url);
    });

    if (urls.paylord.length == 0) { // all imports done?
      if (typeof(data.callback) == "function") {
        data.callback();
      }
      return;
    }

    if (!data.isParallel) {
      PKG.Common.requireLibrary.bind(this, urls.paylord, data.callback).defer( /* break the recursion */ );
    }
  },

  /**
   * @private
   */
  hintingHandler: function() {
    var hintingHandlerFn = function(ev, elem, parent) {
      //var viewportWidth = jQuery(window).width();
      var changed42 = false;
      var breakpoints = {
        'cm-pixel-small': function(w) {
          return w < 200;
        },
        'cm-pixel-medium': function(w) {
          return w >= 200 && w < 400;
        },
        'cm-pixel-large': function(w) {
          return w >= 400;
        },
        'cm-pixel-xlarge': function(w) {
          return w >= 550;
        }
      };
      var container_breakpoints = {
        'cm-container-small': breakpoints['cm-pixel-small'],
        'cm-container-medium': breakpoints['cm-pixel-medium'],
        'cm-container-large': breakpoints['cm-pixel-large'],
        'cm-container-xlarge': breakpoints['cm-pixel-xlarge'],
        'cm-container-no-columns-2': function(w) {
          return w < 660;
        },
        'cm-container-no-columns-3': function(w) {
          return w >= 660 && w < 740;
        },
        'cm-container-4-columns-to-2': function(w) {
          return w >= 660 && w < 1060;
        }
      };
      var processElems = function(breakpoints, i, elem) {
        var jElem = jQuery(elem);
        var width = jElem.width();

        jQuery.each(breakpoints, function(name, isBreakpoint) {
          if (isBreakpoint(width)) {
            jElem.addClass(name);
          } else {
            if (name == "cm-container-4-columns-to-2" && jElem.hasClass("cm-container-4-columns-to-2")) {
              changed42 = true;
            }
            jElem.removeClass(name);
          }
        });
      };

      if (elem) {
        jQuery(elem).filter(".cm_widget").each(processElems.curry(breakpoints));
        jQuery(elem).filter(".content_main_dho, [data-cm-hintable], [cm_type], #mobileContent, .cm_column").each(processElems
          .curry(container_breakpoints));
      } else {
        jQuery(".cm_widget", parent).each(processElems.curry(breakpoints));
        jQuery(".content_main_dho, [data-cm-hintable], [cm_type], #mobileContent, .cm_column", parent).each(processElems.curry(container_breakpoints));
      }

      /* Workaround for Chrome - Chrome doesn't handle display change correctly :( */
      if (changed42) {
        document.querySelectorAll(".cm_column_wrapper").forEach(function(e) {
          e.style.display = "block";
          window.setTimeout(function() {
            e.style.display = "";
          }, 0);
        });
      }

      PKG.Common.ensureFloatingSpace();
    }

    return PKG.Common.notTooOften(null, hintingHandlerFn);
  }(),



  /**
   *  Sets class "cm_empty" / "cm_empty_editor" to title-, subtitle-, sidebar-, and footer-container if contents is empty.
   */
  emptyHandler: function() {
    if (!window.beng || !beng.env) {
      return;
    }
    if (beng.env.mode != "edit" && !beng.env.hideEmptyAreas) {
      return;
    }

    var classname = "cm_empty";
    if (beng.env.mode == "edit") {
      classname = "cm_empty_editor";
    }

    var container = document.querySelectorAll("[cm_type=title], [cm_id=title], [cm_id=subtitle], [id=title], [id=subtitle], .title, .subtitle");
    [].forEach.call(container, function(elem) {
      /* Test if empty copied from EditorNG.__specialTreatment() */
      if (elem.innerHTML.stripTags().strip().blank() || elem.innerHTML == "&nbsp;" ||
        elem.textContent == elem.getAttribute("cm_defaultText")) {
        if (beng.env.hideEmptyAreas) {
          elem.addClassName(classname);
        } else {
          elem.removeClassName(classname);
        }
      }
    });
    var otherElements = document.querySelectorAll("[cm_type=sidebar], .sidebar, [cm_type=footer], #footer");
    [].forEach.call(otherElements, function(elem) {
      if (!elem.querySelector(".cm_widget") && !PKG.Common.containsTextNode_recourse(elem) || elem.textContent == elem.getAttribute("cm_defaultText")) {
        if (beng.env.hideEmptyAreas) {
          elem.addClassName(classname);
        } else {
          elem.removeClassName(classname);
        }
      }
    });

    PKG.Common.updateCanBeEmptys();

    if (typeof cmEmptyApply === 'function') {
      cmEmptyApply();
    }

  },

  updateCanBeEmptys: function() {
    if (!window.beng || !beng.env) {
      return;
    }
    if (beng.env.mode != "edit" && !beng.env.hideEmptyAreas) {
      return;
    }

    var classname = "cm_empty";
    if (beng.env.mode == "edit") {
      classname = "cm_empty_editor";
    }

    canBeEmptys = document.querySelectorAll(".cm_can_be_empty");
    for (var i = 0; i < canBeEmptys.length; i++) {
      var canBeEmpty = canBeEmptys[i];
      var container = canBeEmpty.querySelectorAll("[cm_type=title], [cm_id=title], [cm_id=subtitle], [id=title], [id=subtitle], .title, .subtitle, [cm_type=sidebar], .sidebar, [cm_type=footer], #footer, [cm_type=keyvisual], #keyvisual, [cm_type=logo], #logo");
      if (container.length <= 0) {
        continue;
      }
      var allEmpty = true;
      for (var j = 0; j < container.length && allEmpty; j++) {
        if ((canBeEmpty.getAttribute("cmtype") == "keyvisual" || canBeEmpty.id == "keyvisual") && !canBeEmpty.classList.contains("cm_empty") && !canBeEmpty.classList.contains("cm_empty_editor")) {
          allEmpty = false;
        } else {
          for (var j = 0; j < container.length && allEmpty; j++) {
            if (!container[j].classList.contains("cm_empty") && !container[j].classList.contains("cm_empty_editor")) {
              allEmpty = false;
              break;
            }
          }
        }
      }
      if (allEmpty) {
        canBeEmpty.addClassName(classname);
      } else {
        canBeEmpty.removeClassName(classname);
      }
    }
  },

  containsTextNode_recourse: function(element) {
    var i, node;
    var nodes = element.childNodes;
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      if (node.nodeType == Node.ELEMENT_NODE) {
        if (node.getAttribute("cm_dont_save") == "true" || node.getAttribute("id") == "dropmarker") {
          continue; // ignore cm_dont_save="true"
        }
        if (PKG.Common.containsTextNode_recourse(node)) {
          return true;
        }
      } else if (node.nodeType == Node.TEXT_NODE) {
        if (jQuery.trim(node.nodeValue) == "") {
          continue; // ignore whitespace
        }
        return true;
      }
    }
    return false;
  },

  /**
   * @private
   * Set width of floating images to 100% if there remains only a small space less than 150px for text.
   * This is called by hintingHandler.
   */
  ensureFloatingSpace: function() {
    if (!window.beng || !beng.env || beng.env.mode == 'edit') {
      return;
    }
    try {
      document.querySelectorAll('.cm_widget.cm_widget_float_left, .cm_widget.cm_widget_float_right').forEach(function(w) {
        if (w.dataset.originalWidth) {
          w.style.width = w.dataset.originalWidth; // reset to original width
          delete w.dataset.originalWidth;
        }
        if (w.closest('.cm-container-small, .cm-container-medium, .cm-container-large')) {
          if (w.parentNode.clientWidth - w.offsetWidth < 150) {
            if (!w.dataset.originalWidth) {
              w.dataset.originalWidth = w.style.width; // store original width
            }
            w.style.width = '100%';
          }
        }
      });
    } catch (e) {}
  },

  /**
   * @private
   */
  getOrCreateHeadElement: function() {
    var list = $$("head");

    if (list.first()) {
      return list.first();
    }

    var head = new Element("head");
    $$("html").first().insert({
      'top': head
    });

    return head;
  }
});

Object.extend(PKG.Common, {
  /**
   * @lends Common
   */
  /**
   * @constant
   *
   * @description
   *      Predefined categories for use with cm4all.Common.logViaHistoryService().
   */
  HISTORY_EVENT_CATEGORY_WIDGET: "editor-widget",
  HISTORY_EVENT_CATEGORY_DESIGN: "editor-design",
  HISTORY_EVENT_CATEGORY_SETTINGS: "editor-settings",
  HISTORY_EVENT_CATEGORY_MARKETING: "editor-marketing",
  HISTORY_EVENT_CATEGORY_PUBLISH: "editor-publish"
});

Object.extend(PKG.Common, {
  Logger: Class.create({
    /**
     * @lends Common.Logger#
     */
    _logMessages: "",
    _logLevel: null,

    /**
     * @description Logger class. Currently, logs via console.log if available.
     * @constructs
     * @param {string}
     *            [context=""] A string describing the logger (e.g. classname)
     */
    initialize: function(context) {
      this.context = context || "";
    },

    /**
     * @description Log an event with priority of "debug"
     */
    debug: function() {
      var args = $A(arguments);
      args.unshift(PKG.Common.Logger.DEBUG);
      this._log.apply(this, args);
    },

    /**
     * @description Log an event with priority of "info"
     */
    info: function() {
      var args = $A(arguments);
      args.unshift(PKG.Common.Logger.INFO);
      this._log.apply(this, args);
    },

    /**
     * @description Log an event with priority of "warn"
     */
    warn: function() {
      var args = $A(arguments);
      args.unshift(PKG.Common.Logger.WARN);
      this._log.apply(this, args);
    },

    /**
     * @description Log an event with priority of "error"
     */
    error: function() {
      var args = $A(arguments);
      args.unshift(PKG.Common.Logger.ERROR);
      this._log.apply(this, args);
    },

    /**
     * @description Log an event with priority of "fatal"
     */
    fatal: function() {
      var args = $A(arguments);
      args.unshift(PKG.Common.Logger.FATAL);
      this._log.apply(this, args);
    },

    /**
     * @description Sets the log level for <strong>this</strong> logger.
     * @param {level}
     *            level the log level to set
     */
    setLogLevel: function(level) {
      this._logLevel = level;
    },

    /**
     * @description Get the current log level or null if no log level has been set.
     *              <p>
     *              <i>In the future this should be set automatically via a configuration read
     *              from server. (log4j-like)</i>
     *              </p>
     * @type level
     */
    getLogLevel: function() {
      return this._logLevel;
    },

    /**
     * @private
     */
    _log: function(level, obj) {
      if (!PKG.Common.Logger.isEnabled()) {
        return;
      }
      var xlevel = this.getLogLevel() || PKG.Common.Logger.getLogLevel();
      if (level[0] < xlevel[0]) {
        return;
      }

      var message = (new Date().toString() + (this.context ? " [" + this.context + "]" : " [<default>]") +
        " " + level[1] + ": " + obj);

      if (typeof console != "undefined"
        /* we can't use Object.isFunction, cause IE8s console.log has the type 'object' */
        &&
        !Object.isUndefined(console.log)) {
        console.log(message);

        for (var i = 2; i < arguments.length; i++) {
          console.log(arguments[i]);
        }
      }
    }
  })
});

Object.extend(PKG.Common.Logger, {
  /**
   * @lends Common.Logger
   */
  /**
   * @constant
   */
  DEBUG: [0, "DEBUG"],
  /**
   * @constant
   */
  INFO: [1, "INFO"],
  /**
   * @constant
   */
  WARN: [2, "WARN"],
  /**
   * @constant
   */
  ERROR: [3, "ERROR"],
  /**
   * @constant
   */
  FATAL: [4, "FATAL"],

  /**
   * @constant
   */
  DISABLED: [5, ""],

  /**
   * @description You must enable the logger via console with "Common.Logger.enable();"
   */
  enable: function() {
    PKG.Common.Logger._enabled = true;
    getTopWindow().document.cookie = "cm_debug=true";
  },

  /**
   * @description See enable()
   */
  isEnabled: function() {
    if (typeof(PKG.Common.Logger._enabled) == 'undefined') {
      if (typeof(getTopWindow) == 'undefined') {
        return false;
      }
      PKG.Common.Logger._enabled = false;
      var c = getTopWindow().document.cookie;
      var i = c.indexOf("cm_debug=");
      if (i >= 0 && c.substring(i + 9, i + 9 + 4) == 'true') {
        PKG.Common.Logger._enabled = true;
      }
    }
    return PKG.Common.Logger._enabled;
  },

  /**
   * @description Sets the log level for <strong>all</strong> loggers, which is used if no log
   *              level for a specific logger instance has been set.
   * @param {level}
   *            level the log level to set
   */
  setLogLevel: function(level) {
    PKG.Common.Logger._logLevel = level;
    getTopWindow().document.cookie = "cm_debug_level=" + level[1];
  },

  /**
   * @description Get the current global log level. Returns a configuration specific log level.
   *              For development/debug installations this should be Common.Logger.DEBUG
   * @type level
   */
  getLogLevel: function() {
    if (typeof(PKG.Common.Logger._logLevel) == 'undefined') {
      if (typeof(getTopWindow) == 'undefined') {
        return false;
      }
      PKG.Common.Logger._logLevel = null;
      var c = getTopWindow().document.cookie;
      var i = c.indexOf("cm_debug_level=");
      if (i >= 0) {
        var jj = c.indexOf(";", i);
        PKG.Common.Logger._logLevel = PKG.Common.Logger[c.substring(i + 15, jj != -1 ? jj : c
          .length)];
      }
    }
    return PKG.Common.Logger._logLevel || PKG.Common.Logger.DEBUG;
  }
});

Object.extend(PKG.Common, {
  Lib: {
    _: (window.beng && window.beng.env && window.beng.env.common_prefix ? window.beng.env.common_prefix : "")
  }
});

Object.extend(PKG.Common.Lib, {
  scriptaculous: {
    builder: [PKG.Common.Lib._ + "/res/js/thirdparty/scriptaculous-1.8/builder.js"],
    effects: [PKG.Common.Lib._ + "/res/js/thirdparty/scriptaculous-1.8/effects.js"],
    slider: [PKG.Common.Lib._ + "/res/js/thirdparty/scriptaculous-1.8/slider.js"],
    sound: [PKG.Common.Lib._ + "/res/js/thirdparty/scriptaculous-1.8/sound.js"],
    unittest: [PKG.Common.Lib._ + "/res/js/thirdparty/scriptaculous-1.8/unittest.js"],
    dragdrop: [PKG.Common.Lib._ + "/res/js/thirdparty/scriptaculous-1.8/effects.js",
      PKG.Common.Lib._ + "/res/js/thirdparty/scriptaculous-1.8/dragdrop.js"
    ],
    controls: [PKG.Common.Lib._ + "/res/js/thirdparty/scriptaculous-1.8/effects.js",
      PKG.Common.Lib._ + "/res/js/thirdparty/scriptaculous-1.8/controls.js"
    ]
  },
  jquery: {
    ui: [
      PKG.Common.Lib._ + "/res/js/thirdparty/jquery-ui-1.8/ui/minified/jquery-ui.min.js",
      PKG.Common.Lib._ + "/res/js/thirdparty/jquery-ui-1.8/ui/i18n/jquery-ui-i18n.js"
    ],
    ui_datepicker: [
      PKG.Common.Lib._ + "/res/js/thirdparty/jquery-ui-1.8/ui/minified/jquery.ui.core.min.js",
      PKG.Common.Lib._ + "/res/js/thirdparty/jquery-ui-1.8/ui/minified/jquery.ui.datepicker.min.js",
      PKG.Common.Lib._ + "/res/js/thirdparty/jquery-ui-1.8/ui/i18n/jquery-ui-i18n.js"
    ]
  }
});

Object.extend(PKG.Common, {
  Css: {
    jquery: {
      ui: [PKG.Common.Lib._ + "/res/js/thirdparty/jquery-ui-1.8/themes/base/jquery.ui.all.css"],
      ui_datepicker: [
        PKG.Common.Lib._ + "/res/js/thirdparty/jquery-ui-1.8/themes/base/jquery.ui.base.css",
        PKG.Common.Lib._ + "/res/js/thirdparty/jquery-ui-1.8/themes/base/jquery.ui.datepicker.css"
      ],
      ui_theme: [PKG.Common.Lib._ + "/res/js/thirdparty/jquery-ui-1.8/themes/base/jquery.ui.theme.css"]
    }
  }
});

window.Common = PKG.Common;

// install size hinting & empty hinting
jQuery(document)
  .on("ready load pageshow", function(ev) {
    PKG.Common.emptyHandler.call(this, ev);
    setTimeout(function () {
      PKG.Common.hintingHandler.call(this, ev);
    }, 100);
  });
jQuery(window)
  .on("resize transitionend webkitTransitionEnd", PKG.Common.hintingHandler);

// install touch hinting
jQuery(window).one("touchstart", function() {
  jQuery(document.body).addClass("cm4all-touch-device");
})

jQuery(document).one("ready", function() {
  // install iframe not sizeable hinting
  (function() {
    const iframe = document.createElement("IFRAME");
    iframe.src = "data:text/html,%3Cdiv%20style%3D%22width%3A%20100%25%3Bheight%3A200px" +
      "%3B%22%3E%3C%2Fdiv%3E";

    function onLoad() {
      iframe.removeEventListener("error", onError);
      var reducedHeight = iframe.clientHeight - 1;
      iframe.style.height = reducedHeight + "px";
      var iframeHeight = iframe.clientHeight;
      iframe.parentNode.removeChild(iframe);
      if (iframeHeight !== reducedHeight) {
        jQuery(document.body).addClass("cm4all-iframe-not-sizable");
      }
    };

    function onError() {
      iframe.removeEventListener("load", onLoad);
      iframe.removeEventListener("error", onError);
      iframe.parentNode.removeChild(iframe);
    }
    iframe.addEventListener("load", onLoad);
    iframe.addEventListener("error", onError);
    document.body.appendChild(iframe);
  })();

  // hide anchor title on hover
  (function() {
    if (!window.beng || !beng.env || beng.env.mode == 'edit') {
      return;
    }
    document.querySelectorAll('.cm_anchor').forEach(function(a) {
      var t = a.title;
      if (t) {
        a.addEventListener('mouseenter', function() { a.title = ''; });
        a.addEventListener('mouseleave', function() { a.title = t; });
      }
    });
  })();
});

/**
 * @private
 */
window.createBengRequestUrl = function(url, parameterObj, headerObj, translationParameter, noCacheControl, focus, mode) {
  // Diese Methode erstellt eine URL, die einen direkten Request vom Browser an das ControlPanel ermöglicht,
  // ohne dazu widgets zu benötigen.
  // Parameter und Header müssen aus technischen Gründen als ExtraPathInfo übergeben werden.
  // In dieser EPI müssen % durch $ ersetzt und serverseitig zurückgesetzt werden.

  // Simuliert java.net.URLDecoder.encode()
  function jencode(s) {
    var re1 = /\+/g;
    var re2 = /%20/g;
    var re3 = /'/g;
    s = encodeURIComponent(s);
    return s.replace(re1, "%2B").replace(re2, "+").replace(re3, "%27");
  }

  headerObj = (headerObj || {});
  parameterObj = (parameterObj || {});
  translationParameter = (translationParameter || {});
  var header = "";
  var tparameter = "";
  var name, value;

  for (name in headerObj) {
    header += name + "=" + headerObj[name] + "&";
  }

  for (name in translationParameter) {
    tparameter += name + "=" + translationParameter[name] + "&";
  }

  header = jencode(header);
  var re = /%/g;

  header = header.replace(re, "$");

  for (var name in parameterObj) {
    value = jencode(parameterObj[name]);
    value = value.replace(re, "$");
    url += "/" + name + "=" + value;
  }

  if (header)
    url += "/header=" + header;

  if (!noCacheControl) {
    url += "/cc=" + new Date().getTime();
  }

  var sessionId = "";
  try {
    sessionId = getTopWindow().urlSessionId || "";
  } catch (e) {}

  url = beng_widget_uri(url, sessionId, null, typeof focus == "string" ? focus : null, mode || null, null, (tparameter != "" ? tparameter : null), null);
  return url;
};
})((function() {
    if (typeof LIBCM4ALL_JS_WIDGET_NAMESPACE == "object") {
        return LIBCM4ALL_JS_WIDGET_NAMESPACE;
    }
    if (typeof(window.cm4all) == "undefined") {
        window.cm4all = {};
    }
    return window.cm4all;
})());
    };
    if(window.__loadedJsLibraries["/res/js/lib/Common.Widget.js"] !== true){
        window.__loadedJsLibraries["/res/js/lib/Common.Widget.js"] = true;
        (function(PKG) {
"PKG:nomunge"
//-WRAP switch on library wrapping

Object.extend(PKG.Common, {
    Widget: Class.create(
    /**
        @lends Common.Widget#
    */
    {
        /**
            @description
                Contains helper functions for widgets. <br/>
                In an untrusted (iframed) widget you must include the library by your own.
            @example
&lt;c:widget xmlns:c="http://cm4all.com/ng/widget" type="widget-runtime-js" />
&lt;c:widget xmlns:c="http://cm4all.com/ng/widget" type="xframetunnel-loader-js">
    &lt;parameter name="jumpback" value="/.cm4all/widgetres.php/exampleWidget/res/jumpback.html" />
&lt;/c:widget>


            @constructs
            @param {string} definition.classId
            @param {string} definition.wiid
            @param {string} definition.base
            @param {string} definition.session
            @param {string} definition.frame
            @param {string} definition.path
        */
        initialize: function(definition) {
            this.definition = definition || {};
            this.__dirty = 0;
            PKG.Common.EventDispatcher.registerListener(PKG.Common.Event.WidgetConf, function(evt) {
                if (!Object.isUndefined(window.currentWidgetConf)) {
                    ++this.__dirty;
                }
            }.bind(this));
        },

        /**
            @description
                Creates an Ajax.Request
            @param {String} uri
                Relative request uri (createUrl is invoked)
            @param {Object} [ajaxOptions={}]
                Options passed to the Ajax.Request
            @param {Object} [queryParams={}]
                Query parameter passed to the Ajax.Request
            @param {Object} [proxyParams={doProcess: [false]}]
                If doProcess is set to true, beng proxy will process response
            @type Ajax.Request
        */
        doRequest: function(uri, ajaxOptions, queryParams, proxyParams) {
            // prepare it
            var httpUrl = new PKG.HttpURL(this.createUrl(uri, proxyParams));
            var options = $H(ajaxOptions || {});
            var params = options.get("parameters") || {};
            var pair = null;
            var _uri;

            // convert to hashtable
            params = $H(Object.isString(params) ? params.toQueryParams() : params);

            // merge params via httpUrl
            httpUrl.setParameters(queryParams);
            httpUrl.setParameters(params);
            pair = httpUrl.getPrototypePair();

            //
            if (options.get("postBody")) {
                _uri = httpUrl.toExternalForm();
            } else {
                _uri = pair.url;
                options.set("parameters", pair.parameters);
            }

            return new Ajax.Request(_uri, options.toObject());
        },

        /**
            @param {string} language
            @param {string} country
            @param {Function} callbackFn
            @type
                void
            @description
                calls Xlate.invoke, which invokes callbackFn with xlate-object as first parameter
        */
        invokeXlate: function(language, country, callbackFn) {
            Xlate.invoke({
                namespace: this.getCatalogNameFromClassId(),
                language: language,
                country: country,
                callback: callbackFn,
                urlGenerator: function(defaultUriIsIgnoredHere, namespace, language, country) {
                    return this.createUrl(
                        "res/LC_MESSAGES/" + language + (country ? "_" + country : "") + namespace + ".js");
                }.bind(this)
            });
        },

        /**
            @private
        */
        getCatalogNameFromClassId: function() {
            if (!this.definition.classId) {
                throw new Error("definition.classId must be set!");
            }

            return this.definition.classId.split(/\./).last().sub(/^./, function(match) {
                return match[0].toLowerCase();
            });
        },

        /**
            @private
        */
        getLocale: function() {
            var editro, locale, language_country, country;
            try{
                try{
                    editro = cm4all.Common.Widget.getEditro();
                }catch(e){
                    Common.log(e);
                }
                if(editro){
                    var xlate = editro.getXlate();
                    if(xlate){
                        return {
                            "language" : xlate.language,
                            "country" : xlate.country
                        };
                    }
                }
                locale = window.locale || parent.locale || navigator.language || navigator.browserLanguage;
                if(locale){
                    language_country = locale.split(/[-_]/);
                    country;
                    if(language_country.length < 2){
                        switch(language_country[0]){
                            case "en":
                                country = "US";
                                break;
                            default:
                                country = language_country[0].toUpperCase();
                        }
                    }else{
                        country = language_country[1];
                    }
                    return {
                        "language" : language_country[0],
                        "country" : country
                    };
                }
            }catch(e){
                Common.log(e);
                return {
                    language: "en",
                    country: "US"
                };
            }
            return {
                language: "en",
                country: "US"
            };
        },

        /**
            @param {Function} callbackFn
            @param {string|boolean} [selector|false(autoInit off)]
            @param {boolean} if true ui-theme.css is not loaded
            @type
                void
            @description
                <strong>Note: Not available on published website!</strong><br/>
                Loads all libraries required for GUI-Renderer and invokes
                callbackFn when finished.<br/>
                If selector is false, no automatic rendering is done.<br/>
                If selector is undefined, the first form is automatically rendered.<br/>
                If selector is a string, the form identified by the selector
                is automatically rendered.

                func

                {
                    onSuccess : func
                    onError : func
                }

        */
        loadGuiRenderer: function(callbackFn, selector, noUITheme) {
            var self = this;
            var onBootstrapLoaded = function() {
                var ld = {
                    css: [],
                    js: []
                };
                try {
                    ld = jQuery.cm4all.guilib.bootstrap.data;
                    if(!ld){
                        throw new Error("No data");
                    }
                } catch (e) {
                    PKG.Common.log("No guilib bootstrap data found");
                    try{
                        ld = PKG.Common.Widget.getMainWindow().jQuery.cm4all.guilib.bootstrap.data;
                    }catch(e){
                        PKG.Common.log("No guilib bootstrap data found in main window");
                    }
                }
                if (typeof ld.css == 'string') {
                    ld.css = [ld.css];
                }
                if(noUITheme !== true){
                    ld.css.push("/.cm4all/e/dynamic/ui-theme.css");
                }
                // load css stuff
                PKG.Common.loadCss(ld.css);
                // load libraries
                PKG.Common.requireLibrary(ld.js, function() {
                    var onRequireLibrary = function() {
                        var locale;
                        //support for guilib 2.1.x
                        if (window.cm4all.ui.OPTIONS && window.cm4all.ui.OPTIONS.RENDER_MODE) {
                            locale = self.getLocale();
                            Xlate.invoke({
                                namespace: "guilib",
                                language: locale.language,
                                country: locale.country,
                                callback: function(xlate) {

                                    var guilibLocale = !jQuery.isEmptyObject(xlate.data) ? xlate : {};
                                    guilibLocale[window.cm4all.ui.OPTIONS.I18N_LANGUAGE] = locale.language;
                                    guilibLocale[window.cm4all.ui.OPTIONS.I18N_COUNTRY] = locale.country;
                                    jQuery.cm4all.guilib.getRenderer().setOption(
                                        window.cm4all.ui.OPTIONS.I18N,
                                        guilibLocale);

                                    if (selector === false) {
                                        // no automatic rendering
                                        // only callback is called
                                        if (Object.isFunction(callbackFn)) {
                                            callbackFn(jQuery);
                                        }
                                    } else {
                                        var adaptOptions = {};
                                        adaptOptions[window.cm4all.ui.OPTIONS.RENDER_MODE] = window.cm4all.ui.VALUES.RENDER_MODE_CONFIG;

                                        // workaround for inline render mode
                                        var editro = null;
                                        try {
                                            editro = PKG.Common.Widget.getEditro();
                                        } catch (ignored) {
                                        }
                                        var stub = editro && editro.getStub() || null;
                                        if (stub && stub.skin == "toi") {
                                            try {
                                                if (self.definition && self.definition.base && self.definition.base.indexOf("action=showNotifications") != -1) { 
                                                   adaptOptions[ window.cm4all.ui.OPTIONS.RENDER_MODE ] = window.cm4all.ui.VALUES.RENDER_MODE_INLINE;
                                                }
                                            } catch (ignored) {}
                                        }

                                        // error callback is called if an error occures while rendering
                                        adaptOptions[window.cm4all.ui.OPTIONS.ERROR_CALLBACK] = function( /*the error*/ throwable) {
                                            window.console && window.console.error && window.console.error(throwable);
                                        };

                                        if (window.currentWidgetConf && window.currentWidgetConf.options) {
                                            adaptOptions[window.cm4all.ui.OPTIONS.DIALOG_TITLE] = window.currentWidgetConf.options.dialogTitle;
                                            if (window.currentWidgetConf.options.dialogSize) {
                                                //normalize dialog size
                                                var h = window.currentWidgetConf.options.dialogSize.height;
                                                var w = window.currentWidgetConf.options.dialogSize.width;
                                                var sizeClass;
                                                if (w <= 400 && h <= 150) {
                                                    sizeClass = 'xsmall';
                                                } else if (w <= 400) {
                                                    sizeClass = 'small';
                                                } else if (w <= 600) {
                                                    sizeClass = 'medium';
                                                } else {
                                                    sizeClass = 'large';
                                                }
                                                adaptOptions[window.cm4all.ui.OPTIONS.DIALOG_PREFERRED_SIZE] = sizeClass;
                                            }
                                        }

                                        if (parent.closeWidgetConfiguration) {
                                            adaptOptions[window.cm4all.ui.OPTIONS.DIALOG_CLOSE_ACTION] =
                                                parent.closeWidgetConfiguration.bind(parent, false);
                                        }

                                        // render callback is called after rendering
                                        if (Object.isFunction(callbackFn)) {
                                            adaptOptions[window.cm4all.ui.OPTIONS.RENDER_CALLBACK] = callbackFn;
                                        }

                                        window.cm4all.ui.adapt(
                                            jQuery(selector || 'form:first'),
                                            adaptOptions);
                                    }
                                }
                            });
                        } else {
                            //support guilib before 2.1.x
                            try {
                                /* Workaround for IE having problems with behaviours when overlay is loaded too late */
                                window.cm4all.ui.overlay(jQuery("<div id=\"io-" + (new Date().getTime()) + "\"></div>"), {
                                    "autoShow": false
                                });
                            } catch (e) {
                                PKG.Common.log(e.message);
                            }

                            if (selector === false) {
                                // no automatic rendering
                                // only callback is called
                                if (Object.isFunction(callbackFn)) {
                                    callbackFn(jQuery);
                                }
                            } else {
                                //support for guilib 2.0.x
                                var options = {};
                                // error callback is called if an error occures while rendering
                                options[jQuery.cm4all.guilib.theme.OPTIONS.ERROR_CALLBACK] = function( /*the error*/ throwable) {
                                    window.console && window.console.error && window.console.error(throwable);
                                };
                                // render callback is called after rendering
                                options[jQuery.cm4all.guilib.theme.OPTIONS.RENDER_CALLBACK] = Object.isFunction(callbackFn) ? callbackFn : function() {};
                                options[jQuery.cm4all.guilib.theme.OPTIONS.IS_WIDGET_CONFIG] = true;
                                if (jQuery.cm4all.guilib.themes.generic.OPTIONS.DIALOG_CLOSE_ACTION) {
                                    options[jQuery.cm4all.guilib.themes.generic.OPTIONS.DIALOG_CLOSE_ACTION] =
                                        parent.closeWidgetConfiguration ?
                                        parent.closeWidgetConfiguration.bind(parent, false) :
                                        false;
                                }
                                jQuery.cm4all.guilib.theme.adapt(
                                    jQuery(selector || 'form:first'),
                                // additional renderer options
                                options);
                            }
                        }
                    };
                    if (document.readyState != 'loading') {
                        onRequireLibrary();
                    } else {
                        document.addEventListener('DOMContentLoaded', onRequireLibrary);
                    }
                });
            };

            onBootstrapLoaded();
        },

        /**
            @private
            @param {Function} callbackFn
            @param {String|Array} [additionalLibs=[]]
            @type
                void
            @description
                Loads all libraries required for Widget Runtime and invokes
                callbackFn when finished
            @deprecated
                Since version 0.3.20<br/>
                Use <a href="Common.html#.requireLibrary">Common.requireLibrary</a> instead to load required libraries.<br/>
                The widget-runtime libraries are already loaded by including <strong>/res/js/lib/widget-runtime.js</strong>.<br/>
                This calls Common.requireLibrary for additionalLibs with callbackFn.
        */
        loadWidgetRuntime: function(callbackFn, additionalLibs) {
            // load libraries
            PKG.Common.requireLibrary(additionalLibs || [], callbackFn);
        },

        /**
            @param {string} path
                path to rewrite
            @param {Object} [proxyParams={doProcess: [false]}]
                If doProcess is set to true, beng proxy will process response
            @type
                string
            @description
                creates an url from an url relative to the widget for
                requesting e.g. resources
                The mode is proxy and partial when doProcess is set.
                See <a href="http://mke-doc.intern.cm-ag/doc/cm4all-beng-proxy-doc/beng.pdf">beng-proxy documentation</a>
                for details.
                If no beng-proxy is present, the path is returned unchanged.
        */
        createUrl: function(path, proxyParams) {
            if (typeof(beng_widget_uri) != "undefined" && Object.isFunction(beng_widget_uri)) {
                return beng_widget_uri(
                    this.definition.base, // base_uri
                    this.definition.session, // session_id
                    this.definition.frame, // frame
                    this.definition.path, // focus
                    "partial", // mode
                    path ? path : null, // path
                    null, // translate
                    null // view
                );
            }

            if (this.__dirty > 0) {
                path = path.replace(/\/cc=([0-9]+)/, "/cc=$1_" + this.__dirty);
            }

            return path;
        },

        /**
            @param {string} path
                path to rewrite
            @type
                string
            @description
                creates a static url relative to the widget class
        */
        createStaticClassUrl: function(path) {
            if (!this.definition.classId) {
                throw new Error("definition.classId must be set!");
            }
            return "/.cm4all/widgetres.php/" + this.definition.classId + (path.indexOf("/") != 0 ? "/" : "") + path;
        },

        /**
            @param {string} path
                path to rewrite
            @type
                string
            @description
                creates an url to a common resource
        */
        createCommonUrl: function(path) {
            if (window.beng && window.beng.env && window.beng.env.common_prefix) {
                return window.beng.env.common_prefix + path;
            }

            return path;
        },
        /**
            @param {Common.Event} eventClass
                the eventClass of the event to dispatch.
            @param {Array} constructorArguments
                event-specific array of arguments for the event-constructor. See
                documentation on each event-class for details.
            @type
                void
            @description
                fires a new event of the given event-class with the current widget-
                instance as event-source.
        */
        fireEvent: function(eventClass, constructorArguments) {
            var wiid = this.definition.frame;
            var editro = cm4all.Common.Widget.getEditro();
            var wcid = editro.widgetCatalog[wiid].wcid;
            var widget = cm4all.Common.Widget.getMainWindow().beng.WidgetManager.getInstance(wcid, wiid);
            constructorArguments.unshift(widget);
            constructorArguments.unshift(editro);
            // TODO: unschön hier: der Konstruktor wird 2mal aufgerufen. FIXME!
            var ev = new eventClass(editro, widget);
            ev.initialize.apply(ev, constructorArguments);
            PKG.Common.EventDispatcher.fireEvent(ev);
        },

        /**
            @param {string} maxWidth
                the maxWidth of the widgetContainer
            @param {string} mediaQuery
                a css mediaquery
            @type
                void
            @description
                adds a style element to the page to set the maxWidth
                of a widget container. Use the mediaquery for responsive designs.<br/>
                Used for display only; does not actually change the widget headers!
                Example:
                widget.setWidgetMaxWidth(
                        "30%",
                        "all and (max-width: 480px)"
                    );
        */
        setWidgetMaxWidth: function(maxWidth, mediaquery) {
            if (!this.definition.wiid) {
                throw new Error("definition.wiid must be set!");
            }
            var mqs = "";
            var mqe = "";
            if (mediaquery) {
                mqs = "@media " + mediaquery + " {";
                mqe = "}";
            }

            jQuery("<style>" + mqs + " #widgetcontainer_" + this.definition.wiid + "{max-width: " + maxWidth + " !important;}" + mqe + "</style>").appendTo("head");
        },

        /**
            @param {string} mediaQuery
                a css mediaquery
            @type
                void
            @description
                Changes the widget display from 'inline-block' to 'block'.<br/>
                Used for display only; does not actually change the widget headers!
                Example:
                widget.setWidgetToBlock(
                        "all and (max-width: 480px)"
                    );
            */
        setWidgetToBlock: function(mediaquery) {
            if (!this.definition.wiid) {
                throw new Error("definition.wiid must be set!");
            }
            var mqs = "";
            var mqe = "";
            if (mediaquery) {
                mqs = "@media " + mediaquery + " {";
                mqe = "}";
            }

            jQuery("<style>" + mqs + " #widgetcontainer_" + this.definition.wiid + "{width: 100% !important; max-width: 100% !important;}" + mqe + "</style>").appendTo("head");
        }
    })
});

Object.extend(PKG.Common.Widget,
/**
    @lends Common.Widget
*/
{
    /**
        @type
            cm4all.Editro
        @description
            returns the instance of editro
    */
    getEditro: function() {
        var editro = Try.these(function() {
            return cm4all.Editro.getInstance();
        }, function() {
            return parent.cm4all.Editro.getInstance();
        }, function() {
            return parent.parent.cm4all.Editro.getInstance();
        }, function() {
            return controlpanel.getEditorWnd().cm4all.Editro.getInstance();
        }, function() {
            return top.frames["main-frame"].cm4all.Editro.getInstance();            // sites + hcr
        }, function() {
            return top.frames["editorWebsiteIFrame"].cm4all.Editro.getInstance();   // w4b
        }) || null;
        if (!editro) {
            throw new Error("No editor context found! (Are you trying to access editor in published website?)");
        }
        return editro;
    },

    /**
        @type
            DOMWindow
        @description
            returns the main environment window (was: getTopWindow())
    */
    getMainWindow: function() {
        var editro = null;
        try {
            editro = PKG.Common.Widget.getEditro();
        } catch (ignoredinthiscontext) {}
        if (editro) {
            return editro.getMainWindow();
        } else {
            Common.log("Falling back to 'getTopWindow()'!");
            return getTopWindow();
        }
    },

    /**
        @type
            DOMWindow
        @description
            returns the a Popup implementation instance
    */
    getPopupImpl: function() {
        var popup = Try.these(function() {
            return PKG.Common.Widget.getEditro().getStub().getPopupImpl();
        }, function() {
            // this only works if guistrap is already loaded in main window
            return new (Common.Widget.getMainWindow()).cm4all.Infrastructure.GuistrapPopup();
        }, function() {
            // this only works if guistrap is already loaded
            return new cm4all.Infrastructure.GuistrapPopup();
        }, function() {
            // this only works if guilib is already loaded
            return new cm4all.Infrastructure.GuilibPopup();
        });
        return popup;
    }
});

/* works only with NS window.cm4all */
if (PKG === window.cm4all && !PKG.Common.Event) {
    Object.extend(PKG.Common, {
        Event: Class.create(
        /**
            @lends Common.Event#
        */
        {
            __isEvent: true,
            clsid: "PKG.Common.Event",
            /**
            @description
                Base class for events
            @constructs
            @param {Object} source
                the source to be reported by the event
            */
            initialize: function(source) {
                this.__source = source;
            },
            /**
             * @type
             *      Object
             * @description
             *      returns the event-source of this event-object
             */
            getSource: function() {
                return this.__source;
            }
        })
    });

    cm4all.Common.Event.WidgetConf = Class.create(cm4all.Common.Event, {
        clsid: "cm4all.Common.Event.WidgetConf",
        initialize: function($super, func) {
            $super(func);
        }
    });
}

if (PKG === window.cm4all && !PKG.Common.EventDispatcher) {
    Object.extend(PKG.Common,
    /**
        @lends Common
    */
    {
        /**
        @class
        @description
            Static object to register/unregister event-listeners and to fire events
        */
        EventDispatcher:
        /**
            @lends Common.EventDispatcher
        */
        {
            __id: new Date().toTimeString() + Math.random(),
            __eventListeners: {},

            /**
            @param {Common.Event} uiEvent
                the event instance to be fired
            @param {boolean} async
                if 'true' the event is fired in a separate thread.
            @type
                void
            @description
                fires the given event-instance -  all event-listeners registered for
                events of this class or any of this event's class superclasses in any
                window from the current window up to the top-window are notified.
            */
            fireEvent: function(uiEvent, async) {
                var currentClass, listenerList, i, oWindow, common;
                var cWindow = window;
                do {
                    common = cWindow.cm4all.Common;
                    if (common) {
                        currentClass = uiEvent.constructor;
                        do {
                            listenerList = common.EventDispatcher.__eventListeners[currentClass.prototype.clsid] || (common.EventDispatcher.__eventListeners[currentClass.prototype.clsid] = []);
                            if (listenerList) {
                                for (i = 0; i < listenerList.length; i++) {
                                    if (!async) {
                                        listenerList[i].call(cWindow, uiEvent);
                                    } else {
                                        (function() {
                                            var _cWindow = cWindow;
                                            var currentFunction = listenerList[i];
                                            _cWindow.setTimeout(function() {
                                                currentFunction.call(_cWindow, uiEvent);
                                            }, 0);
                                        })();
                                    }
                                }
                            }
                        } while (currentClass = /* sic! */ currentClass.superclass);
                    }
                    oWindow = cWindow;
                    cWindow = cWindow.parent;
                } while (oWindow != cWindow && cWindow.cm4all && cWindow.cm4all.Common);
            },

            /**
                @param {Common.Event} eventClass
                    the event-class to register a listener for
                @param {Function} listener
                    the listener function to be called if an event of the given
                    class is fired. the listener is passed the event-object as first
                    (and only) parameter.
                @type
                    void
                @description
                    registers a listener for events of the given class.
            */
            registerListener: function(eventClass, listener) {
                if (!eventClass.prototype.__isEvent) {
                    throw new Error("Not an Event class: " + eventClass.toString());
                }
                var common = PKG.Common;
                var listenerList = common.EventDispatcher.__eventListeners[eventClass.prototype.clsid] || (common.EventDispatcher.__eventListeners[eventClass.prototype.clsid] = []);
                listenerList.push(listener);
            },

            /**
                @param {Common.Event} eventClass
                    the event-class to deregister a listener for
                @param {Function} listener
                    the listener function that is to be removed form the list of registered
                    listeners. .
                @type
                    void
                @description
                    deregisters a listener for events of the given class.
                    NOTE: only listeners registered in the current window will
                    be removed, if the same listener is registered in different windows you have
                    to deregister it seperately
            */
            deregisterListener: function(eventClass, listener) {
                if (!eventClass.prototype.__isEvent) {
                    throw new Error("Not an Event class: " + eventClass.toString());
                }
                var common = PKG.Common;
                var listenerList = common.EventDispatcher.__eventListeners[eventClass.prototype.clsid] || (common.EventDispatcher.__eventListeners[eventClass.prototype.clsid] = []);
                var i;
                for (i = listenerList.length - 1; i >= 0; i--) {
                    if (listener === listenerList[i]) {
                        listenerList.splice(i, 1);
                    }
                }
            }
        }
    });
}

// TODO: remove this
window.Common.Widget = PKG.Common.Widget;
})((function() {
    if (typeof LIBCM4ALL_JS_WIDGET_NAMESPACE == "object") {
        return LIBCM4ALL_JS_WIDGET_NAMESPACE;
    }
    if (typeof(window.cm4all) == "undefined") {
        window.cm4all = {};
    }
    return window.cm4all;
})());
    };
    if(window.__loadedJsLibraries["/res/js/lib/Common.MobileBrowserSwitch.js"] !== true){
        window.__loadedJsLibraries["/res/js/lib/Common.MobileBrowserSwitch.js"] = true;
        (function(PKG) {
"PKG:nomunge"
//-WRAP switch on library wrapping
Object.extend(PKG.Common, {

    MobileBrowserSwitch: {

        mobileAgents: [
        /* DEVICES ... */
        /* Apple */
        "iphone", "ipod",
        /* Blackberry */
        "blackberry",
        /* Palm */
        "pre/", "palm", "hiptop", "avantgo", "plucker", "xiino", "blazer", "elaine",
        /* Bada */
        "bada/",
        /* E-Book-Reader */
        "kindle",
        /* OS ... */
        /* Android */
        "android",
        /* Windows Mobile */
        "iris", "3g_t", "windows ce",
        /* Windows Phone */
        "windows phone",
        /* BROWSERS ... */
        /* IE */
        "iemobile",
        /* Opera */
        "opera mini", "opera mobi"],

        isMobileAgent: function(_userAgent) {
            var i;
            _userAgent = _userAgent.toLowerCase();
            for (i = 0; i < MobileBrowserSwitch.mobileAgents.length; i++) {
                if (_userAgent.indexOf(MobileBrowserSwitch.mobileAgents[i]) != -1) {
                    return true;
                }
            }
            return false;
        }
    }
});

// deprecated
window.MobileBrowserSwitch = PKG.Common.MobileBrowserSwitch;})((function() {
    if (typeof LIBCM4ALL_JS_WIDGET_NAMESPACE == "object") {
        return LIBCM4ALL_JS_WIDGET_NAMESPACE;
    }
    if (typeof(window.cm4all) == "undefined") {
        window.cm4all = {};
    }
    return window.cm4all;
})());
    };
    if(window.__loadedJsLibraries["/res/js/lib/Strftime.js"] !== true){
        window.__loadedJsLibraries["/res/js/lib/Strftime.js"] = true;
        (function(PKG) {
"PKG:nomunge"
//-WRAP switch on library wrapping
// äöü utf-8 mode on

/**
    @name Strftime
    @namespace
    @description
        Javascript strftime implementation
*/
PKG.Strftime = ({});

Object.extend(PKG.Strftime,
/**
    @lends Strftime
*/
{
    /**
        @class
        @static
        @description
            Converts date strings to Date objects
    */
    Date: (
    /**
        @lends Strftime.Date
    */
    {
        /**
            @description
                Converts an UTC iso timestamp (yyyy-mm-dd HH:MM:SS)
                into a Date object
            @type Date
            @param {String} tstr
                datestring to convert in iso format
        */
        fromUtcIso: function(tstr) {
            return PKG.Strftime.Date.fromIso(tstr, true);
        },

        /**
            @description
                Converts an iso timestamp (yyyy-mm-dd HH:MM:SS)
                into a Date object
            @type Date
            @param {String} tstr
                datestring to convert in iso format
            @param {boolean} [isUtc=false]
                set to true, if datestring is utc or use {@link Strftime.Date.fromUtcIso}
        */
        fromIso: function(tstr, isUtc) {
            return PKG.Strftime.Date._fromPattern(tstr, [0, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19], isUtc);
        },

        /**
            @description
                Converts an UTC timestamp (yyyymmddHHMMSS)
                into a Date object
            @type Date
            @param {String} tstr
                datestring to convert as timestamp
        */
        fromUtcTimestamp: function(tstr) {
            return PKG.Strftime.Date.fromTimestamp(tstr, true);
        },

        /**
            @description
                Converts an timestamp (yyyymmddHHMMSS)
                into a Date object
            @type Date
            @param {String} tstr
                datestring to convert as timestamp
            @param {boolean} [isUtc=false]
                set to true, if datestring is utc or use {@link Strftime.Date.fromUtcTimestamp}
        */
        fromTimestamp: function(tstr, isUtc) {
            return PKG.Strftime.Date._fromPattern(tstr, [0, 4, 4, 6, 6, 8, 8, 10, 10, 12, 12, 14], isUtc);
        },

        /**
            @private
            @description
                Helper method to convert date strings to javascript Date objects
            @type Date
            @param {String} tstr
                Time string to convert to a date object
            @param {Number[]} p
                Number array, which contains information how to split the string in parts
            @example
                Strftime.Date._fromPattern("19740101180512", [0,4,4,6,6,8,8,10,10,12,12,14])
        */
        _fromPattern: function(tstr, p, isUtc) {
            return function(y, m, d, H, M, S) {
                return (isUtc ? new Date(Date.UTC(y, m, d, H, M, S)) : new Date(y, m, d, H, M, S));
            }.apply(
                this, [
                tstr.substring(p[0], p[1]),
                tstr.substring(p[2], p[3]) - 1,
                tstr.substring(p[4], p[5]),
                tstr.substring(p[6], p[7]),
                tstr.substring(p[8], p[9]),
                tstr.substring(p[10], p[11])
            ]);
        }
    }),

    /**
        @description
            Converts a strftime format string and a Date object to a date string
        @example
format: (currently supported subset of strftime)
    %a    The abbreviated weekday name according to the current locale.
    %A    The full weekday name according to the current locale.
    %b    The abbreviated month name according to the current locale.
    %B    The full month name according to the current locale.
    %d    The day of the month as a decimal number (range 01 to 31).
    %e    Like %d, the day of the month as a decimal number, but a leading
          zero is replaced by a space. (SU)
    %H    The  hour as a decimal number using a 24-hour clock (range 00 to
          23).
    %I    The  hour as a decimal number using a 12-hour clock (range 01 to
          12).
    %k    The hour (24-hour clock) as a decimal number (range  0  to  23);
          single digits are preceded by a blank. (See also %H.) (TZ)
    %l    The  hour  (12-hour  clock) as a decimal number (range 1 to 12);
          single digits are preceded by a blank. (See also %I.) (TZ)
    %m    The month as a decimal number (range 01 to 12).
    %M    The minute as a decimal number (range 00 to 59).
    %n    A newline character. (SU)
    %p    Either `AM' or `PM' according to the given time  value,  or  the
          corresponding  strings  for the current locale.  Noon is treated
          as `pm' and midnight as `am'.
    %S    The second as a decimal number (range 00 to 60).  (The range  is
          up to 60 to allow for occasional leap seconds.)
    %y    The year as a decimal number without a century (range 00 to 99).
    %Y    The year as a decimal number including the century.
        @param {String} format
            strftime format string (as described below)
        @param {Date} date
            Javascript Date object to format
        @param {String} language
            Language identifier in ISO format (e.g. en,de,..)
        @param {String} country
            Country identifier in ISO format (e.g. US,DE,..)
    */

    format: function(format, date, language, country) {
        var result = format;
        var config = PKG.Strftime.getConfig(language, country);
        var r_year = date.getFullYear();
        var r_month = date.getMonth();
        var r_date = date.getDate();
        var r_day = date.getDay();
        var r_hours = date.getHours();
        var r_minutes = date.getMinutes();
        var r_seconds = date.getSeconds();
        var year = "" + r_year;
        var usHours = (r_hours > 12 ? r_hours - 12 : (r_hours == 0 ? 12 : r_hours));
        var sNoon = (r_hours >= 12 ? "PM" : "AM");
        var ftable = [
                /%a/g, config.dayNames[r_day].substring(0, config.dayShortcutLength),
                /%A/g, config.dayNames[r_day],
                /%b/g, config.monthNames[r_month].substring(0, config.monthShortcutLength),
                /%B/g, config.monthNames[r_month],
                /%d/g, (r_date < 10 ? "0" : "") + r_date,
                /%e/g, (r_date < 10 ? " " : "") + r_date,
                /%H/g, (r_hours < 10 ? "0" : "") + r_hours,
                /%I/g, (usHours < 10 ? "0" : "") + usHours,
                /%k/g, (r_hours < 10 ? " " : "") + r_hours,
                /%l/g, (usHours < 10 ? " " : "") + usHours,
                /%m/g, (r_month < 9 ? "0" : "") + (r_month + 1),
                /%M/g, (r_minutes < 10 ? "0" : "") + r_minutes,
                /%n/g, "\n",
                /%p/g, sNoon,
                /%S/g, (r_seconds < 10 ? "0" : "") + r_seconds,
                /%y/g, year.substring(2, 4),
                /%Y/g, year
        ];

        for (var i = 0; i < ftable.length; i += 2) {
            result = result.replace(ftable[i], ftable[i + 1]);
        }

        return result;
    },

    /**
        @private
        @description
            Get a configuration object for Strftime
        @type Object
        @param {String} language
            Language identifier in ISO format (e.g. en,de,..)
        @param {String} country
            Country identifier in ISO format (e.g. US,DE,..)
    */
    getConfig: function(language, country) {
        return (PKG.Strftime.configuration[language] || PKG.Strftime.configuration["en"]);
    },

    /**
        @private
    */
    configuration: {

        de: {
            monthNames: ["Januar", "Februar", "März", "April", "May", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
            dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
            week: [1, 2, 3, 4, 5, 6, 0],
            monthShortcutLength: 3,
            dayShortcutLength: 2
        },

        en: {
            monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            week: [0, 1, 2, 3, 4, 5, 6],
            monthShortcutLength: 3,
            dayShortcutLength: 3
        },

        it: {
            monthNames: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
            dayNames: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
            week: [1, 2, 3, 4, 5, 6, 0],
            monthShortcutLength: 3,
            dayShortcutLength: 2
        },

        es: {
            monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
            dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
            week: [0, 1, 2, 3, 4, 5, 6],
            monthShortcutLength: 3,
            dayShortcutLength: 2
        },

        pt: {
            monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
            dayNames: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
            week: [0, 1, 2, 3, 4, 5, 6],
            monthShortcutLength: 3,
            dayShortcutLength: 3
        },

        jp: {
            monthNames: ["１月", "２月", "３月", "４月", "５月", "６月", "７月", "８月", "９月", "１０月", "１１月", "１２月"],
            dayNames: ["日", "月", "火", "水", "木", "金", "土"],
            week: [0, 1, 2, 3, 4, 5, 6],
            monthShortcutLength: 100,
            dayShortcutLength: 100
        },

        pl: {
            monthNames: ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "pazdziernika", "listopada", "grudnia"],
            dayNames: ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"],
            week: [1, 2, 3, 4, 5, 6, 0],
            monthShortcutLength: 3,
            dayShortcutLength: 3
        }
    }
});

window.Strftime = PKG.Strftime;
})((function() {
    if (typeof LIBCM4ALL_JS_WIDGET_NAMESPACE == "object") {
        return LIBCM4ALL_JS_WIDGET_NAMESPACE;
    }
    if (typeof(window.cm4all) == "undefined") {
        window.cm4all = {};
    }
    return window.cm4all;
})());
    };
    if(window.__loadedJsLibraries["/res/js/lib/Xlate.js"] !== true){
        window.__loadedJsLibraries["/res/js/lib/Xlate.js"] = true;
        (function(PKG) {
"PKG:nomunge"
//-WRAP switch on library wrapping
// äöü utf-8 mode on

PKG.Xlate = Class.create(
/**
    @lends Xlate#
*/
{
    namespace: null,
    language: null,
    country: null,
    /*
        translations : new Hash(),
        pluralrule : function() { return "r1"; }
    */
    data: null,

    /**
        @constructs
        @description
            Javascript xlate implementation.<br/>
            DO NOT generate the class directly, use {@link Xlate.load}
            or {@link Xlate.invoke} instead.
    */
    initialize: function(namespace, language, country, urlGenerator) {
        this.namespace = namespace;
        this.language = language;
        this.country = country;
        this.data = {};
    },

    /**
        @private
    */
    setData: function(data) {
        if (data != null) {
            this.data = data;
        }
    },

    /**
        @description
            Translates key using variables.
        @type void
        @param {String} key
            The xlate key
        @param {Object} [variables=null]
            An object containing name-value definition of variables used in
            key.
        @example
xlate.format("${#entries} entry/entries", { entries : 5 });
xlate.format(
    "${pubDate%T:%A, %e. %B %Y, %H:%M} ${author}",
    { pubDate : Strftime.Date.fromTimestamp("19740118180500"),
      author : "Me" }
);
    */
    format: function(key, variables) {

        var ns = this.data.translations;
        var ret = null;
        var numerus = null;

        variables = $H(variables || {});
        ret = ns ? ns.get(key) : key;

        if (ret != null) {

            var numerusIdx = key.indexOf("${#");
            if (numerusIdx != -1) {
                numerus = variables.get(key.substring(numerusIdx + 3, key.indexOf("}", numerusIdx + 3)));
            }

            if (numerus != null) {
                var plurals = ns ? ns.get(key) : key;

                // assure we got an object here
                if (!Object.isString(plurals)) {
                    ret = $H(plurals).get(this.data.pluralrule(numerus));
                }
            }
        }

        // if no translation was found do a fallback to provided key
        if (!ret) {
            ret = key;
        }

        variables.each(function(kvPair) {
            try {
                ret = ret.replace(new RegExp("\\$\\{\\#?" + kvPair.key + "(%T:[^}]*)?\\}", "g"), function(m, g) {
                    if (g && g.length > 3) {
                        return PKG.Strftime.format(g.substring(3), kvPair.value, this.language, this.country);
                    }
                    return kvPair.value;
                }.bind(this));
            } catch (e) {
                PKG.Common.log(ret + "\n" + kvPair.key + "\n" + this.namespace);
            }
        }.bind(this));

        return ret;
    },

    /**
        @description
            Checks if this xlate-object contains  the specified key
        @type boolean
    */
    hasKey: function(key) {
        var ret = ( !! (this.data.translations) &&
            ( !! (this.data.translations.get(key) == "") || !! (this.data.translations.get(key))));
        return ret;
    },

    /**
        @description
            Translates html with the language and namespace of this xlate object.
        @type void
        @param {window} wnd
                The window the elements to translate belong to
        @param {Element} rootElement (optional)
                The element which children are to be translated
        @example
&lt;body onload="xlate.translateHTML();">
    &lt;div lang="x-late">You have to create a new buddy first&lt;/div>
&lt;/body>
    */
    translateHTML: function(wnd, rootElement) {
        var elementsToXlate;
        if (rootElement && rootElement.querySelectorAll) {
            elementsToXlate = jQuery(rootElement.querySelectorAll("[lang=x-late]"));
        } else {
            elementsToXlate = (rootElement ? wnd.jQuery(rootElement).find("[lang^=x-late]") :
                wnd.jQuery("[lang^=x-late]"));
        }
        elementsToXlate.each(function(wnd, i, node) {
            node = wnd.$(node);
            var id = PKG.Xlate._extractId(node);
            var html = this.format(id);
            if (html == id && id.match(/&amp;/)) {
                id = id.replace(/&amp;/, "&");
                html = this.format(id);
            }
            if (html) {
                node.removeAttribute("xml:lang");
                node.setAttribute("lang", this.language + "-" + this.country);
                node.update(html);
                // (PBT: #9368) IE Workaround.
                // IE puts html into several text nodes here which angular cannot handle properly.
                // node.normalize() does not work here.
                // node.innerHTML = html doesn't work either.
                // Only this seemingly useless assignment merges all text nodes into one.
                node.innerHTML = node.innerHTML
            }
        }.bind(this, wnd));
    }
});

Object.extend(PKG.Xlate,
/**
    @lends Xlate
*/
{
    data: new Hash(),
    xlates: new Hash(),

    /**
        @description
            Javascript xlate factory.
        @type void
        @param {String|Array} definition.namespace
            Namespace(s) to load, e.g. "sites" or ["sites", "beng.editor"]
        @param {String} definition.language
            Language identifier in ISO format (e.g. en,de,..)
        @param {String} definition.country
            Country identifier in ISO format (e.g. US,DE,..)
        @param {String} definition.callback
            Callback function. The first parameter passed to the function
            is the loaded Xlate object
        @param {String|Function} [definition.urlGenerator=null]
            An url which prefixes the language definition urls, or a
            url generator function which must return a url to load
            the definition files
        @return {Promise} Returns a promise which will be resolved with the xlate object
        @example
function init() {
    Xlate.invoke({
        namespace : ["sites", "beng.editor"],
        language : "de",
        country : "DE",
        callback : init2
    });
}

or

function init() {
    Xlate.invoke({
        namespace : ["sites", "beng.editor"],
        language : "de",
        country : "DE"
    }).done(init2);
}

function init2(xlate) {
    // xlate object of first namespace of array of namespaces been loaded, here "sites".
    alert(xlate.format(
        "Only the following file types are supported: ${types}.",
        { types : "jpeg, png") }
    ));
}
    */
    invoke: function(definition) {
        var xlateDeferred = jQuery.Deferred();
        if (!Object.isArray(definition.namespace)) {
            definition.namespace = [definition.namespace];
        }

        // Ensure definition.language is exactly two lowercase letters
        if (
            typeof definition.language !== "string" ||
            !/^[a-z]{2}$/.test(definition.language)
        ) {
            xlateDeferred.reject("language must be a two-letter lowercase ISO code (e.g. 'en', 'de').");
            return xlateDeferred.promise();
        }
        // Ensure definition.country is exactly two uppercase letters
        if (
            typeof definition.country !== "string" ||
            !/^[A-Z]{2}$/.test(definition.country)
        ) {
            xlateDeferred.reject("country must be a two-letter uppercase ISO code (e.g. 'EN', 'DE').");
            return xlateDeferred.promise();
        }

        var refIds = definition.namespace.map(function(namespace) {
            return PKG.Xlate.createRefId(namespace, definition.language, definition.country);
        });
        var xlates = refIds.map(function(refId) {
            return PKG.Xlate.xlates.get(refId);
        });

        if (xlates.all()) {
            definition.callback(xlates[0]);
            xlateDeferred.resolve(xlates[0]);
        } else {
            var urlGenerator = definition.namespace.map(function(namespace, i) {
                var urlGenerator = Prototype.K;
                if (Object.isFunction(definition.urlGenerator)) {
                    urlGenerator = definition.urlGenerator;
                } else if (Object.isString(definition.urlGenerator)) {
                    urlGenerator = function(url) {
                        return definition.urlGenerator + url;
                    };
                } else if (Object.isArray(definition.urlGenerator)) {
                    urlGenerator = definition.urlGenerator[i] || Prototype.K;
                }
                return urlGenerator;
            });

            var urls = xlates.map(function(xlate, i) {
                if (xlate) {
                    // already loaded
                    return null;
                }
                var namespace = definition.namespace[i];
                return urlGenerator[i](
                    "/res/generated/i18n" + "/" + definition.language + "/" + definition.country + "/" + namespace + ".js",
                    namespace,
                    definition.language,
                    definition.country);
            }).filter(Prototype.K);
            PKG.Common.requireLibrary(
                urls, function() {
                // Merge all texts of additionally loaded namespaces to the first namespace.
                // First namespace must be installed.
                var data_0 = PKG.Xlate.data.get(refIds[0]);
                if (data_0) {
                    for (var i = 1; i < definition.namespace.length; i++) {
                        var data = PKG.Xlate.data.get(refIds[i]);
                        if (data) {
                            PKG.Xlate.set(definition.namespace[0], definition.language, definition.country,
                                data.translations, /*force*/ true, data_0.pluralrule);
                        }
                    }
                } else {
                    Common.log("po file not installed: " + refIds[0]);
                }
                var xlate = new PKG.Xlate(
                    definition.namespace[0],
                    definition.language,
                    definition.country);
                xlate.setData(PKG.Xlate.data.get(refIds[0]));
                PKG.Xlate.xlates.set(refIds[0], xlate);
                definition.callback(xlate);
                xlateDeferred.resolve(xlate);
            });
        }
        return xlateDeferred.promise();
    },

    /**
        @private
        @description
            The loaded language definition file calls this method after
            beeing loaded
    */
    set: function(namespace, language, country, obj, force, pluralrule) {
        var refId = PKG.Xlate.createRefId(namespace, language, country);
        var ns = (
            PKG.Xlate.data.get(refId) || PKG.Xlate.data.set(refId, {
            translations: new Hash(),
            pluralrule: new Hash()
        }));

        if (force) {
            // overwrite ns with values of obj
            ns.translations.update(obj);
            ns.pluralrule = pluralrule;
        } else {
            /*
                    merge ns into obj (overwriting obj-values with ns ones)
                    and replacing original reference with it
                */
            PKG.Xlate.data.set(refId, {
                translations: $H(obj).update(ns.translations),
                pluralrule: pluralrule
            });
        }
    },

    /**
        @private
        @description
            Creates key under which objects are stored.
    */
    createRefId: function(namespace, language, country) {
        return (language + "/" + country + "/" + namespace);
    },

    /**
        @description
            Translates html
        @type void
        @param {String} language
            Language identifier in ISO format (e.g. en,de,..)
        @param {String} country
            Country identifier in ISO format (e.g. US,DE,..)
        @param {String|Function} [urlGenerator=null]
            An url which prefixes the language definition urls, or a
            url generator function which must return a url to load
            the definition files
        @param {Element}  rootElement
            An optional element which children will be translated
        @example
&lt;body onload="Xlate.translateHTML('pl','PL');">
    &lt;div lang="x-late-extras">You have to create a new buddy first&lt;/div>
&lt;/body>
    */
    translateHTML: function(language, country, urlGenerator, rootElement) {
        var triggered = new Hash();
        (rootElement ? Element.select(rootElement, "[lang^=x-late-]") : $$("[lang^=x-late-]")).each(function(node) {
            var namespace = node.readAttribute("lang").substring(7).replace(/-/g, ".");

            if (!triggered.get(namespace)) {
                triggered.set(namespace, true);
                PKG.Xlate.invoke({
                    namespace: namespace,
                    language: language,
                    country: country,
                    urlGenerator: urlGenerator,
                    callback: function(xlate) {
                        (rootElement ? Element.select(rootElement, "[lang^=x-late-]") : $$("[lang^=x-late-]")).each(function(node) {
                            var id = PKG.Xlate._extractId(node);
                            var html = xlate.format(id);
                            if (html == id && id.match(/&amp;/)) {
                                id = id.replace(/&amp;/, "&");
                                html = xlate.format(id);
                            }
                            if (html) {
                                node.setAttribute("lang", xlate.language + "-" + xlate.country);
                                node.update(html);
                                // (PBT: #9368) IE Workaround.
                                // IE puts html into several text nodes here which angular cannot handle properly.
                                // node.normalize() does not work here.
                                // node.innerHTML = html doesn't work either.
                                // Only this seemingly useless assignment merges all text nodes into one.
                                node.innerHTML = node.innerHTML
                            }
                        });
                    }
                });
            }
        });
    },

    _extractId: function(node) {
        return PKG.Xlate._removeComments(node.cloneNode(true))
            .innerHTML.replace(/^\s*(.*?)\s*$/, "$1").replace(/\s+/g, " ");
    },

    _removeComments: function(node) {
        node = $(node);
        node.childElements().each(function(childNode) {
            PKG.Xlate._removeComments(childNode);
        });

        if (node.nodeType == Node.COMMENT_NODE) {
            node.remove();
        }

        return node;
    }
});

// TODO: remove this
window.Xlate = PKG.Xlate;

// legacy stuff
/**
    @name I18N
    @namespace
    @description
        Static legacy class to provide compatibility to I18N javascript files
*/
window.I18N = (
/**
    @lends I18N
*/
{
    loaded: {},

    //
    langObjects: {},
    language: (
           window.theLanguage
           || (document.documentElement.getAttribute('lang') || '').replace(/-.*$/,'')
           || getTopWindow().theLanguage
           || (getTopWindow().locale ? getTopWindow().locale.replace(/_.*/, "") : null)
           || (getTopWindow().beng && getTopWindow().beng.env && getTopWindow().beng.env.language ? getTopWindow().beng.env.language : null )
    ),
    country: (
            window.theCountry
            || (document.documentElement.getAttribute('lang') || '').replace(/^.*-/,'')
            || getTopWindow().theCountry
            || (getTopWindow().locale ? getTopWindow().locale.replace(/.*_/, "") : null)
            || (getTopWindow().beng && getTopWindow().beng.env && getTopWindow().beng.env.country ? getTopWindow().beng.env.country : null )
    ),
    /**
        @static
        @private
    */
    setTextObject: function(namespace, obj, force, pluralrule, language, country) {
        PKG.Xlate.set(namespace, language, country, obj, force, pluralrule);

        var refId = PKG.Xlate.createRefId(namespace, language, country);
        var xlate = new PKG.Xlate(namespace, language, country);

        xlate.setData(PKG.Xlate.data.get(refId));
        PKG.Xlate.xlates.set(refId, xlate);
    },

    load: function(namespaces, params, language, country) {
        if (language) I18N.language = language;
        if (country) I18N.country = country;

        params = params || {};
        namespaces = (namespaces instanceof Array ? namespaces : [namespaces]);

        var defs = [];

        for (var i = 0; i < namespaces.length; i++) {
            var xRef = I18N.language + "/" + I18N.country + "/" + namespaces[i];

            if (!I18N._createXRefClosure(xRef)()) {

                var xUrl = "/res/generated/i18n/" + xRef + ".js";

                if (params.url) {
                    if (typeof(params.url) == "function") {
                        xUrl = params.url(xUrl);
                    } else {
                        xUrl = params.url + xUrl;
                    }
                }

                defs.push({
                    url: xUrl,
                    test: I18N._createXRefClosure(xRef)
                });
            }
        }

        if (params.mode == "preload") {
            var def;
            while (defs.length > 0) {
                def = defs.shift();
                document.write('<SCRIPT src="' + def.url + '"></SCRIPT>');
            }
        } else {
            throw new Error("Operation not supported, use cm4all.Xlate object instead!");
        }
    },

    _createXRefClosure: function(xRef) {
        return function() {
            return typeof I18N.langObjects[xRef] != 'undefined';
        };
    },

    xlate: function(namespace, key, variables) {
        var xlate = PKG.Xlate.xlates.get(PKG.Xlate.createRefId(namespace, I18N.language, I18N.country));
        if (xlate) {
            return xlate.format(key, variables);
        } else if (typeof getTopWindow == "function" && getTopWindow() != window && getTopWindow().I18N) {
            return getTopWindow().I18N.xlate(namespace, key, variables);
        } else {
            return key;
        }
    }
});
})((function() {
    if (typeof LIBCM4ALL_JS_WIDGET_NAMESPACE == "object") {
        return LIBCM4ALL_JS_WIDGET_NAMESPACE;
    }
    if (typeof(window.cm4all) == "undefined") {
        window.cm4all = {};
    }
    return window.cm4all;
})());
    };
    if(window.__loadedJsLibraries["/res/js/lib/XSLTProcessor.js"] !== true){
        window.__loadedJsLibraries["/res/js/lib/XSLTProcessor.js"] = true;
        Transformer = Class.create({

    xslt: null,
    xml: null,

    _loadDocument: function(url) {
        if (Prototype.Browser.IE) {
            var doc = new ActiveXObject("Microsoft.XMLDOM");
            doc.async = false;
            doc.load(url);
            return doc;
        } else {
            var xmlhttp = new window.XMLHttpRequest();
            xmlhttp.open("GET", url, false);
            xmlhttp.send(null);
            return xmlhttp.responseXML.documentElement;
        }
    },

    setStylesheetUrl: function(url) {
        this.xslt = this._loadDocument(url);
        return this;
    },

    setDocumentUrl: function(url) {
        this.setDocument(this._loadDocument(url));
        return this;
    },
    setDocument: function(doc) {
        this.xml = doc;
        return this;
    },

    transform: function(elem) {
        var output;
        elem = $(elem);

        if (Prototype.Browser.IE) {
            output = this.xml.transformNode(this.xslt);
        } else {
            var processor = new XSLTProcessor();
            processor.importStylesheet(this.xslt);

            var XmlDom = processor.transformToDocument(this.xml);

            var serializer = new XMLSerializer();
            output = serializer.serializeToString(XmlDom.documentElement);
        }
        elem.update(output);
    }

});
    };
    if(window.__loadedJsLibraries["/res/js/lib/XFrameTunnel/Initiator.js"] !== true){
        window.__loadedJsLibraries["/res/js/lib/XFrameTunnel/Initiator.js"] = true;
        (function(window) {

    window.cm4all = window.cm4all  || {};

    cm4all.XFrameTunnelInitiator = Class.create({

        commands: null,
        alienFrame: null,
        alienOrigin: null,
        txnid: null,
        opener: null,

        initialize: function(ref, opener, commands) {
            var self = this;
            this.alienFrame = $(ref);
            this.txnid = Math.random().toString(16).replace(/^0./, "");
            this.opener = opener;
            this.commands = Object.extend(this, commands || cm4all.XFrameTunnelInitiator.defaultCommands);
            this.messageHandler = this.messageHandler.bind(this);
            (typeof getTopWindow !== 'undefined' && getTopWindow() || top).addEventListener("message", this.messageHandler, false);
            window.addEventListener("unload", function() {self.free.call(self)});
        },

        messageHandler: function(event) {
            var message = event.data;

            if (!message || message['xft-txnid'] !== this.txnid) {
                return;
            }
            var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
            if (origin !== this.alienOrigin) {
                return;
            }
            var command = message['xft-command'] || "";
            var data = message['xft-request'] || {};

            if (Object.isFunction(this.commands[command])) {
                if (this.commands[command](data)) {
                    var messageOut = {
                        "xft-txnid": this.txnid,
                        "xft-command": command,
                        "xft-response": {
                            'returnValue': 'OK',
                            'data': data
                        }
                    };
                    this.alienFrame.contentWindow.postMessage(messageOut, origin);
                }
            } else {
                console.log("INVALID COMMAND: " + command);
            }
        },

        open: function(url, callbackFn) {
            if (url.indexOf("javascript:") == 0) {
                return;
            }

            var xurl = new cm4all.HttpURL(url);
            HttpURLUtils.setReverseParameter(xurl, "xft-txnid", this.txnid);
            HttpURLUtils.setReverseParameter(xurl, "xft-base", cm4all.XFrameTunnelInitiator.getBaseUrl());
            HttpURLUtils.setReverseParameter(xurl, "xft-path", cm4all.XFrameTunnelInitiator.getPath());

            if (callbackFn) {
                var _load = function () {
                    this.alienFrame.stopObserving("load", _load);
                    callbackFn(this.alienFrame.contentWindow);
                }.bind(this);
                this.alienFrame.observe("load", _load);
            }

            this.alienFrame.src = xurl.toString();
            xurl.removeAllParams();
            xurl.path = '';
            this.alienOrigin = xurl.toString() ||
              /* xurl is a relative url, this means same proto and host as local window */ (location.protocol + "//" + location.host);
        },

        free: function() {
          (typeof getTopWindow !== 'undefined' && getTopWindow() || top).removeEventListener("message", this.messageHandler);
        }
    });

    Object.extend(cm4all.XFrameTunnelInitiator, {

        defaultCommands: {
            "popup-open": function(data) {
                var _data = Object.extend(Object.extend({}, data), {
                    url: "javascript:void(0)"
                });
                var iframe = Common.Widget.getPopupImpl().custom(_data).getFrame();
                if (iframe) {
                    var xfti = new cm4all.XFrameTunnelInitiator(iframe, this);
                    xfti.open(data.url);
                }
                return false;
            },
            "popup-close": function(data) {
                Common.Widget.getPopupImpl().peek().close();
                if (this.opener) {
                    try {
                        var messageOut = {
                            "xft-txnid": this.opener.txnid,
                            "xft-command": "popup-closed",
                            "xft-response": {
                                'returnValue': 'OK',
                                'data': data
                            }
                        };
                        this.opener.alienFrame.contentWindow.postMessage(messageOut, this.alienOrigin);
                    } catch (err) {
                        console.error(err);
                    }
                }
                return false;
            },
            "popup-closed": function(data) {
                return true;
            },
            "resize": function(data) {
                // Resizing must be done at the widgetcontainer
                var $alienFrame = jQuery(this.alienFrame);
                var container = $alienFrame.parent();
                if (container.length < 1) {
                    // alienframe has no parent? Maybe because it is not in the dom yet? So, the brutal way:
                    var id = this.alienFrame.id.substring(7, this.alienFrame.id.lastIndexOf("_"));
                    container = jQuery("#widgetcontainer_" + id);
                }
                var css = {};
                if (data.width && isNaN(data.width)) {
                    css.width = data.width; // with unit
                } else if (data.width) {
                    css.width = data.width + "px"; // unit-less
                }
                if (data.height && isNaN(data.height)) {
                    css.height = data.height;
                } else if (data.height) {
                    css.height = data.height + "px";
                }
                if(container.css("position") === "static"){
                    css.position = "relative";
                }
                container.css(css);
                $alienFrame.css({"position" : "absolute"});
                if (data.overflow) {
                    this.alienFrame.setAttribute('scrolling', (data.overflow == 'hidden') ? 'no' : 'auto');
                }
                return true;
            },
            "get-wrapper-style": function(cssObject) {
                var $wrapper = jQuery(this.alienFrame).parent();
                jQuery.each(cssObject, function(key, value) {
                    cssObject[key] = $wrapper.css(key);
                });
                return cssObject;
            },
            getContainerClass: function(data) {
                var container = jQuery(this.alienFrame).parent();
                var classname = container.closest("[data-container-class]").data("data-container-class");

                if (!classname) {
                    if (container.closest(".content_main").length > 0) {
                        classname="content_main";
                    } else if (container.closest(".content_main_dho").length > 0) {
                            classname="content_main_dho";
                    } else if (container.closest(".content_sidebar").length > 0) {
                        classname="content_sidebar";
                    } else if (container.closest(".content_mobile").length > 0) {
                        classname="content_mobile";
                    }
                }
                data.classname = classname || "";
                return true;
            },
            getCSS: function(data) {
                var list = [];
                var nl = document.getElementsByTagName("link");
                for (var i = 0; i < nl.length; i++) {
                    var href = nl.item(i).href;

                    if (href && (
                             href.match(/.*\/beng\/designs\/.*\.css/)
                          || href.match(/.*\/1,css,8,1/)
                          || href.match(/.*\/1,mcss,8,1/)
                          || href.match(/.*\/vars\.css/)
                          || href.match(/.*\/mvars\.css/)
                          || href.match(/.*\/.cm4all\/e\/Design\/action=getCss.*/
                    ))) {

                        if (href.indexOf("/") == 0)
                            href = "//" + document.location.host + href;
                        list.push(href);
                    }
                }
                data.cssUrls = list;
                return true;
            }
        },

        getBaseUrl: function() {
            var url = new cm4all.HttpURL(document.location.href);
            url.ref = null;
            url.path = "";
            return url.toString();
        },

        getPath: function() {
            var url = new cm4all.HttpURL(document.location.href);
            var path = url.path;
            // remove proxy session information
            path = path.replace(/;.*$/, "");
            return path;
        },
    });

    /* dummy implementation for demonstration */
    DummyPopup = Class.create({
        initialize: function(data) {
            data = data || {};
            var httpUrl = new HttpURL(data.url);

            var width = data.width || "80%";
            var height = data.height || "80%";
            var scrollbars = data.scrollbars || "";
            var checkRe = /^\d+(px|%)$/;

            if (!checkRe.test(width) || !checkRe.test(height)
                ||
                httpUrl.protocol != "http" && httpUrl.protocol != "https") {
                alert("illegal parameter");
                return;
            }

            this.popupDiv = Common.openFullscreen(
                "<iframe style='width: 100%; height: 100%; border: none;' ></iframe>",
                {
                    "width": width,
                    "height": height,
                    "scrollbars" : scrollbars
                }
            );
            this.iframe = jQuery("iframe", this.popupDiv)[0];
        },

        close: function() {
            jQuery(".close", this.popupDiv.parent()).click();
        },

        resize: function(w, h) {
            jQuery(this.iframe).parents(".cm-fullscreen.justify").css({
                width: w + 'px',
                height: h + 'px'
            });
        }
    });
})(window);
    };
    if(window.__loadedJsLibraries["/res/js/lib/DOM2JSON.js"] !== true){
        window.__loadedJsLibraries["/res/js/lib/DOM2JSON.js"] = true;
        (function(window) {

    /**
      @namespace
      @name cm4all
     */
    var cm4all = (window.cm4all = window.cm4all || {});

    // add trim if not present to trim text nodes
    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }
    var TEXT_ACCESSOR = "nodeValue";
    var IE8 = (document.documentMode && document.documentMode < 9);
    if (IE8) {
        /* IE8 fallback */
        Object.defineProperty = function(target, name, config) {
            if (config.value) {
                target[name] = config.value;
            } else {
                target[name] = (config.get || config.set) ? function() {
                    if (arguments.length > 0) {
                        /*setter*/
                        config.set.apply(target, arguments);
                    } else {
                        /*getter*/
                        return config.get();
                    }
                } : target[name];
            }
        };
    }

    /**
       Badgerfish wrapper for DOM
       
       Creates a badgerfish json-object which is synchronized to the given dom node.
       That means changes in the dom are directly reflected in the object and vice versa.
       
       Additionally you can gain access to dom elements by the special property '$dom' which is 
       available on json element objects;
        
       E.g.:
       var dom = <your dom>; // <root><element/></root>
       var json = new cm4all.DOM2JSON(dom)
       
       var element = json.root.element.$dom; // would give you the <element> node
       
       Another feature is the json-path selection:
       You can select child-json-objects with the $get method of all json element objects
       
       var json.$get("root.element"); // would give you the element json-object
       
       Cool is also the $set method:
       
       json.root.$set("element.child.grandchild[1]", { "@age" : "16", "$" : "hans"});
       
       this generates a json which corresponds to the xml:
       
       <root><element><child><grandchild></grandchild><grandchild age=16">hans</grandchild></child></element></root>
       
       
       
       RESTRICTIONS: 
       
       1) You cannot simply add completely new child-elements, attributes or text-nodes by assignment,
        you have to use the $set method. 
       
       So to add a new element named newelement to the root node, you would be doing this:
       
       json.root.$set("newelement", {});
       
       Same goes for new attributes:
       
       json.root.$set("@newatt" , "value");
       
       Same for text-nodes where no text-node was before:
       
       json.root.$set("$" ,"new text");
       
       2) If you want to support IE < 9 you MUST NOT use direct property access. You MUST only use
       the $get and $set methods!
       
        e.g 
        json.$get("root.element")
        json.$get("root").$get("element")
       
       @constructor
       @name cm4all.DOM2JSON
       @param {Node} the dom-node to synchronize with
       @return {cm4all.DOM2JSON} A synchronized  badgerfish json-object
     */

    cm4all.DOM2JSON = function(node) {
        if (node) {
            Object.defineProperty(this, "$dom", {
                enumerable: false,
                configurable: false,
                value: node
            });
            switch (node.nodeType) {
                case 3 /* TEXT_NODE */ :
                case 4 /* CDATA_SECTION_NODE */ :
                    text2json(node, this);
                    break;
                case 9 /* DOCUMENT_NODE */ :
                    element2json(node.documentElement, this);
                    break;
                case 1 /* ELEMENT_NODE */ :
                    element2json(node, this);
                    break;
                case 2 /* ATTRIBUTE_NODE */ :
                    attribute2json(node, this);
            }
        }
    };

    /**
       @constructor
       @name cm4all.JSONAccess
       @param o
       @return {cm4all.JSONAccess}
     */
    cm4all.JSONAccess = function(o) {
        this.o = o || window;
    };

    /**
       @param jsonPath
       @return {Object}
     */
    cm4all.JSONAccess.prototype.$get = function(jsonPath) {
        return $get.call(this.o, jsonPath);
    };

    /**
       @param jsonPath
       @param jsonObject
       @return {Object}
     */
    cm4all.JSONAccess.prototype.$set = function(jsonPath, jsonObject) {
        $set.call(this.o, jsonPath, jsonObject);
        return this.$get(jsonPath);
    };

    /**
       @param jsonPath
       @param baseObject
       @return {Object}
     */
    cm4all.DOM2JSON.prototype.$getValue = function(jsonPath, baseObject) {
        return cm4all.DOM2JSON.prototype.$get.call(baseObject || window, jsonPath);
    };

    /**
       Helper class to provide $get and $set methods on JSON Objects
       @constructor
       @name JSONAccess
       @private
     */

    function JSONAccess() {};

    JSONAccess.prototype.$get = function(jsonPath) {
        return $get.call(this, jsonPath);
    };
    Object.defineProperty(JSONAccess.prototype, "$get", {
        "enumerable": false
    });

    JSONAccess.prototype.$set = function(jsonPath, jsonObject) {
        $set.call(this, jsonPath, jsonObject);
        return this.$get(jsonPath);
    };
    Object.defineProperty(JSONAccess.prototype, "$set", {
        "enumerable": false
    });

    cm4all.DOM2JSON.prototype.$get = JSONAccess.prototype.$get;

    cm4all.DOM2JSON.prototype.$set = JSONAccess.prototype.$set;

    /**
       
       @param {String} jsonPath a path in json notation relative to the current object  
       @return {Object} The child object denoted by the given json path 
     */

    function $get(jsonPath) {
        try {
            return eval("this" + functionalizeNormalizedJsonPath(normalizeJsonPath(jsonPath)));
        } catch (e) {
            return undefined;
        }
    };

    /**
       
       @param {String} jsonPath a path in json notation relative to the current object
       @param {Object} jsonObject  
       @return {Object} The copy of the added object that is actually part of the json-tree
     */

    function $set(jsonPath, jsonObject) {
        jsonPath = normalizeJsonPath(jsonPath);
        var steps = jsonPath.split(/\[|\]?\[|\]/);
        if (steps[0] === "") {
            /* depending on browser the first step is an empty string */
            steps.shift();
        }
        try {
            ensureObject(steps, this, jsonObject);
        } catch (e) {
            Common.log(e.message);
        }
    };

    function ensureAttribute(element, name, value, jsonElement) {
        var valueType = typeof value;
        if (value !== null && valueType !== undefined && valueType !== "string") {
            Common.log("Illegal type for attribute value " + value);
            return;
        }
        var i;
        if (value == null || typeof value == "undefined") {
            element.removeAttribute(name);
            delete jsonElement["@" + name];
        } else {
            element.setAttribute(name, value);
        }
        children = element.attributes;
        for (i = 0; i < children.length; i++) {
            attribute2json(children.item(i), jsonElement);
        }
    }

    function ensureTextNode(element, text, jsonElement) {
        var valueType = typeof text;
        if (text !== null && valueType !== "undefined" && valueType !== "string") {
            return;
        }
        var textNode = element.ownerDocument.createTextNode(text);
        element.appendChild(textNode);
        text2json(textNode, jsonElement);

    }

    function appendElement(parentElement, parentJsonElement, name, childJsonElement) {
        var newElement = parentElement.ownerDocument.createElement(name);
        parentElement.appendChild(newElement);
        if (parentJsonElement) {
            element2json(newElement, parentJsonElement);
        }
        jsonElement2element(childJsonElement, newElement);
    }

    /**
       @private  
       @param {array} steps An array of path steps in the json-tree 
       @param {Object} current The object the steps are relative to  
       @param {Object} jsonObject The object to append to the last objcet in the steps
       @return {void}
     */

    function ensureObject(steps, current, jsonObject) {
        var
        element,
            step = steps.shift();
        step = step.trim();
        step = /^"/.test(step) ? step.replace(/^"(.*)"$/, "$1") : Number(step);
        element = resolve(current.$dom);
        if (typeof resolve(current[step]) === "undefined") {
            ensureJsonPath(steps, step, element, current, jsonObject);
            return;
        }
        if (Boolean(steps[0])) {
            ensureObject(steps, resolve(current[step]), jsonObject);
        } else {
            setJsonObject(step, element, current, jsonObject);
        }
    }

    function setJsonObject(step, element, current, jsonObject) {
        var
        currentElement,
            i,
            children;
        if (/^@/.test(step)) {
            /* an attribute */
            ensureAttribute(element, step.replace(/^@/, ""), jsonObject, current);
        } else if (/^\$$/.test(step)) {
            /* a text node */
            children = element.childNodes;
            for (i = children.length - 1; i >= 0; i--) {
                currentElement = children.item(i);
                switch (currentElement.nodeType) {
                    case 3 /* TEXT_NODE */ :
                    case 4 /* CDATA_SECTION_NODE */ :
                        element.removeChild(currentElement);
                }
            }
            ensureTextNode(element, jsonObject, current);
        } else if (typeof step === "number") {
            /* we replace a single element in a list of siblings with the same name */
            /* 
             * we have something like element[1] which translates to
             * { element : [{}, {}] }. The element selected here is 
             * the second of the array. 
             * */
            element = resolve(resolve(current[step]).$dom);
            jsonElement2element(jsonObject, element);
        } else {
            /* element node */
            children = element.childNodes;
            /* since the element node is replaced by the definitions in
             * jsonObject, we have to remove all already existing children 
             * with the same name 
             * */
            for (i = children.length - 1; i >= 0; i--) {
                currentElement = children.item(i);
                if (currentElement.nodeName === step) {
                    switch (currentElement.nodeType) {
                        case 1 /* ELEMENT_NODE */ :
                            element.removeChild(currentElement);
                    }
                }
            }
            if (jsonObject == null || jsonObject == undefined) {
                /* delete an element */
                return;
            }
            jsonObject = Object.isArray(jsonObject) ? jsonObject : [jsonObject];
            for (i = 0; i < jsonObject.length; i++) {
                appendElement(element, i === jsonObject.length - 1 ? resolve(current.$parent) : null, step, resolve(jsonObject[i]));
            }
        }
    }

    function ensureJsonPath(steps, step, element, current, jsonObject) {
        var
        i;
        /* ensure the current step */
        if (typeof step === "number") {
            element = resolve(resolve(current.$parent).$dom);
            for (i = Object.isArray(current) ? current.length : 1; i <= step; i++) {
                /* append the missing child elements to the parent */
                appendElement(element, resolve(current.$parent), resolve(current.$name), {});
            }
            /* reload the current element */
            current = resolve(resolve(current.$parent)[resolve(current.$name)]);

        } else {
            if (element) {
                if (/^@/.test(step)) {
                    /* case 2: missing attribute */
                    ensureAttribute(element, step.replace(/^@/, ""), "", current);
                } else if (/^\$$/.test(step)) {
                    /* case 3: missing text node */
                    ensureTextNode(element, "", current);
                } else {
                    /* add one child */
                    appendElement(element, current, step, {});
                }
            } else {
                Common.log("Expected element node but found other.");
            }
        }
        /* repeat this step */
        steps.unshift(String(typeof step === "number" ? step : "\"" + step + "\""));
        ensureObject(steps, current, jsonObject);

    }
    /**
       Normalizes a path in json notation to the square-bracket form.
       E.g.: 
       
       root.child[3].grandson["hans"]["17"] will be normalized to:
       
       ["root"]["child"][3]["grandson"]["hans"][17]
       
       @private
       @param {String} jsonPath A path in json notation.
     */

    function normalizeJsonPath(jsonPath) {
        return ("." + jsonPath /* trigger first step as  bracket-notation */ )
        /* replace all square brackets with point notation */
            .replace(/\[\s*"(.*?)"\s*\]/g, function($0, $1) {
            return "." + $1.replace(/\./g, "\\.") /* escape '.' to '\.' */ ;
        })
            .replace(/\[\s*'(.*?)'\s*\]/g, function($0, $1) {
            return "." + $1.replace(/\./g, "\\.") /* escape '.' to '\.' */ ;
        })
            .replace(/\[\s*(.*?)\s*\]/g, function($0, $1) {
            return "." + $1.replace(/\./g, "\\.") /* escape '.' to '\.' */ ;
        })
            .replace(/^\.\./, "." /* remove double .. induced by prefixing jsonPath with '.'*/ )
        /* replace point notation with bracket notation */
            .replace(/\.(([\\][\.]|[^.])*)/g, function($0, $1) {
            var val = $1.replace(/"/g, "\\\"") /* escape '"' to '\"' */
                .replace(/\\./g, "." /* unescape '\.'to '.' */ );
            var quote = isNaN(Number(val)) ? "\"" : "";
            return "[" + quote + val + quote + "]";
        });
    }

    function functionalizeNormalizedJsonPath(normalizedJsonPath) {
        return normalizedJsonPath.replace(/\]/g, IE8 ? "]()" : "]");
    }
    /**
       Sets the given element as child object on the given jsonElement
       
       @private
       @param {Object} jsonElement
       @param {Element} element
       
       @return {void}
     */

    function element2json(element, parentJsonElement) {
        if (element == null || element.nodeType == undefined || element.nodeType != 1)
            return;
        collectSiblingElements(parentJsonElement, element);
    };

    /**
       Parses the given element into a badgerfish json-object
       
       @private
       @param {Element} element
       
     */

    function element2jsonElement(element, parentJsonObject) {
        var i,
            jsonObject = new JSONAccess(),
            children = element.childNodes;
        Object.defineProperty(jsonObject, "$dom", {
            enumerable: false,
            configurable: false,
            value: element
        });
        Object.defineProperty(jsonObject, "$parent", {
            enumerable: false,
            configurable: false,
            value: parentJsonObject
        });
        Object.defineProperty(jsonObject, "$name", {
            enumerable: false,
            configurable: false,
            value: element.nodeName
        });

        for (i = 0; i < children.length; i++) {
            collectSiblingElements(jsonObject, children.item(i));
        }

        children = element.attributes;
        for (i = 0; i < children.length; i++) {
            attribute2json(children.item(i), jsonObject);
        }

        return jsonObject;
    };

    /**
       
     */

    function collectSiblingElements(parentJsonElement, element) {
        var parent = element.parentNode;
        switch (element.nodeType) {
            case 1 /* ELEMENT_NODE */ :
                if (!parentJsonElement.hasOwnProperty(element.nodeName)) {
                    Object.defineProperty(parentJsonElement, element.nodeName, {
                        configurable: true,
                        enumerable: true,
                        get: function() {
                            var store = [],
                                j,
                                elements = parent.childNodes;
                            for (j = 0; j < elements.length; j++) {
                                collectAllSiblingsWithNodeName(elements.item(j), element.nodeName, store, parentJsonElement);
                            }
                            if (store.length > 1) {
                                store.$parent = parentJsonElement;
                                store.$name = element.nodeName;
                                return store;
                            }
                            return resolve(store[0]);
                        },
                        set: function(newValue) {
                            /* delete all elements with this nodeName  */
                            var elements = parent.childNodes,
                                j, ce;
                            for (j = elements.length - 1; j >= 0; j--) {
                                ce = elements.item(j);
                                if (ce.nodeName === element.nodeName && ce.nodeType === 1 /* ELEMENT_NODE */ ) {
                                    parent.removeChild(ce);
                                }
                            }
                            if (newValue) {
                                newValue = Object.isArray(newValue) ? newValue : [newValue];
                                for (j = 0; j < newValue.length; j++) {
                                    appendElement(parent, parentJsonElement, element.nodeName, resolve(newValue[j]));
                                }
                            }
                        }
                    });
                }
                break;
            case 3 /* TEXT_NODE */ :
            case 4 /* CDATA_SECTION_NODE */ :
                text2json(element, parentJsonElement);
        }
    }

    /**
       
     */

    function collectAllSiblingsWithNodeName(element, nodeName, store, parentJsonObject) {
        /* collect all children with the same nodeName into an array */
        if (element.nodeName === nodeName) {
            switch (element.nodeType) {
                case 1 /* ELEMENT_NODE */ :
                    /* since we need a trigger to update the dom when array content is changed,
                     *  we have to use the defineProperty for setting the array content. This 
                     *  leads to an array with restricted modification access */
                    Object.defineProperty(store, store.length, {
                        configurable: true,
                        enumerable: true,
                        get: function() {
                            if (!element) {
                                return element;
                            }
                            return element2jsonElement(element, parentJsonObject);
                        },
                        set: function(newValue) {
                            if (!newValue) {
                                element.parentNode.removeChild(element);
                                element = undefined;
                            } else {
                                jsonElement2element(newValue, element);
                            }
                        }
                    });
            }
        }
    }

    /**
       
     */

    function jsonElement2element(
        jsonElement, element) {
        var key = undefined,
            value, children, current, i;


        children = element.childNodes;
        for (i = children.length - 1; i >= 0; i--) {
            element.removeChild(children.item(i));
        }

        children = element.attributes;
        for (i = children.length - 1; i >= 0; i--) {
            element.removeAttributeNode(children.item(i));
        }

        for (key in jsonElement) {
            value = resolve(jsonElement[key]);
            if (/^@/.test(key)) {
                element.setAttribute(key.replace(/^@/, ""), value);
            } else if (/^\$$/.test(key)) {
                element.appendChild(element.ownerDocument.createTextNode(value));
            } else if (Object.isArray(value)) {
                for (i = 0; i < value.length; i++) {
                    current = element.ownerDocument.createElement(key);
                    element.appendChild(current);
                    jsonElement2element(resolve(value[i]), current);
                }
            } else if (value) {
                current = element.ownerDocument.createElement(key);
                element.appendChild(current);
                jsonElement2element(value, current);
            }
        }

    }

    /**
       
     */

    function attribute2json(attribute, jsonElement) {
        Object.defineProperty(jsonElement, "@" + attribute.name, {
            configurable: true,
            enumerable: true,
            get: function() {
                return attribute.value;
            },
            set: function(newValue) {
                if (newValue == null || typeof newValue === "undefined") {
                    attribute.ownerElement.removeAttributeNode(attribute);
                } else {
                    attribute.value = newValue;
                }
            }
        });
    }

    /**
       
     */

    function text2json(textNode, jsonElement) {
        Object
            .defineProperty(
            jsonElement,
            "$", {
            configurable: true,
            enumerable: true,
            get: function() {
                var current, children = textNode.parentNode.childNodes,
                    i, text = undefined;
                for (i = 0; i < children.length; i++) {
                    current = children.item(i);
                    switch (current.nodeType) {
                        case 3 /* TEXT_NODE */ :
                        case 4 /* CDATA_SECTION_NODE */ :
                            text = (text || "") + current[TEXT_ACCESSOR];
                    }
                }
                return (text ? text.trim() : text);
            },
            set: function(newValue) {
                var parent = textNode.parentNode,
                    current, children = parent.childNodes,
                    i;
                for (i = children.length - 1; i >= 0; i--) {
                    current = children.item(i);
                    switch (current.nodeType) {
                        case 3 /* TEXT_NODE */ :
                        case 4 /* CDATA_SECTION_NODE */ :
                            if (i > 0) {
                                parent.removeChild(current);
                            } else {
                                current.data = newValue;
                                textNode = current;
                            }
                    }
                }
            }
        });
    }

    function resolve(o) {
        if (typeof o == "function") {
            return o();
        }
        return o;
    }

})(window);
    };
    window.__loadedCssLibraries["/res/js/lib/css/xlate.css"] = true;
    window.__loadedCssLibraries["/res/js/lib/css/fullscreen.css"] = true;
