/*
 * Some helper functions shared by widgets
 */


/*
	searches under the given elem for an element called "subname" and returns this nodes TEXT_NODE child
	Example : getTextFromElement(entry, "name") -> returns "VALUE"
	<entry>
		<name>VALUE</name>
	</entry>
*/

function widgets_utils_getText(elem, subname, unescape, escape) {
    unescape = unescape === true;
    escape = escape === true;
    var node;
    for (node = elem.firstChild; node != null; node = node.nextSibling) {
        if (node.nodeType != Node.ELEMENT_NODE)
            continue;
        if (node.nodeName != subname)
            continue;

        var textnode = node.firstChild;
        if (textnode) {
            var result = textnode.nodeValue;
            if (unescape) {
                result = result.replace(/&lt;/g, "<");
                result = result.replace(/&gt;/g, ">");
                result = result.replace(/&amp;/g, "&");
            }
            if (escape) {
                result = result.replace(/\&/g, "&amp;");
                result = result.replace(/</g, "&lt;");
                result = result.replace(/>/g, "&gt;");
            }
            return result;
        } else {
            return "";
        }
    }

    return "";
}

function widgets_utils_debugMsg(msg, severity) {
    try {
        Common.log(msg);
    } catch (e) {
        // alert( msg );
    }
}
