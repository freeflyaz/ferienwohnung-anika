
jQuery(document).ready(function () {

	// get current user agent
	var userAgent = navigator.userAgent.toLowerCase();
	// if android exits index > -1 will be returned
	var isAndroid = userAgent.indexOf("android") > -1;
	// if isAndroid == true then our double tab script will be executed
	if (isAndroid === true && navigator.maxTouchPoints > 0) {
		Common.doubleTapToGo("#cm_navigation li:has(ul)");
	}

	function setCmEmptyForElements(element, hiddenElement) {
		if (jQuery(element).hasClass('cm_empty')) {
			if (hiddenElement == undefined) {
				jQuery(element).addClass('cm-templates-empty');
			} else {
				jQuery(hiddenElement).addClass('cm-templates-empty');
			}
		}
	}

	// remove cm_empty container
	setTimeout(function () {
		setCmEmptyForElements('#logo_wrapper');
		setCmEmptyForElements('#title_wrapper');
		setCmEmptyForElements('#title');
		setCmEmptyForElements('#subtitle');
		setCmEmptyForElements('.cm-templates-footer');
		setCmEmptyForElements('#widgetbar_site_1');
		setCmEmptyForElements('#widgetbar_site_2');
		setCmEmptyForElements('#widgetbar_page_1');
		setCmEmptyForElements('#widgetbar_page_2');


		if (jQuery('#logo_wrapper').hasClass('cm_empty')) {
			jQuery('#head_wrapper').addClass('cm-templates-mobile');
		}


		if (jQuery('#widgetbar_site_1').hasClass('cm_empty') && jQuery('#widgetbar_page_1').hasClass('cm_empty') && jQuery('#widgetbar_page_2').hasClass('cm_empty')
			&& jQuery('#widgetbar_site_2').hasClass('cm_empty')) {
			jQuery('.cm-templates-sidebar-wrapper').addClass('cm-templates-empty');
			jQuery('.content_main_dho').addClass('cm-templates-mobile');
			jQuery('#content_wrapper').addClass('cm-templates-mobile');
			if(typeof cm4all === 'object' && cm4all.Common && typeof cm4all.Common.hintingHandler === 'function') {
				cm4all.Common.hintingHandler();
			}
		}

	}, 100);
});
