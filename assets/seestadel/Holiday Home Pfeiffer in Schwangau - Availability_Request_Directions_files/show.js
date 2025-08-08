
function selectAllCookieTypes() {
  document.getElementById('cookieSettingsEssential').checked = true;
  document.getElementById('cookieSettingsStatistics').checked = true;
  document.getElementById('cookieSettingsThirdparty').checked = true;
}

function rejectAllCookieTypes() {
  document.getElementById('cookieSettingsEssential').checked = true;
  document.getElementById('cookieSettingsStatistics').checked = false;
  document.getElementById('cookieSettingsThirdparty').checked = false;
}

function dispatchCookieSettingsEvent() {
  var event;
  if (typeof (Event) === 'function') {
    event = new Event('CookieSettingsChanged');
  } else {
    // do not crash the IE
    event = document.createEvent('Event');
    event.initEvent('CookieSettingsChanged', true, true);
  }
  window.dispatchEvent(event);
}

function setCookieSettings(_cookieSettings) {
  var cookieSettings = {
    // dont save unused keys
    essential: _cookieSettings.essential || true,
    statistics: _cookieSettings.statistics || false,
    thirdparty: _cookieSettings.thirdparty || false,
    cookiesAccepted: _cookieSettings.cookiesAccepted || false,
  };
  if (cookieSettings) {
    localStorage.setItem('cookieSettings', JSON.stringify(cookieSettings));
  } else {
    localStorage.removeItem('cookieSettings');
  }
  dispatchCookieSettingsEvent();
}

function getCookieSettings() {
  var thisScript = document.getElementById('cookieSettingsScript');
  var enabled = thisScript.dataset.cookieSettingsEnabled === 'true';
  var tracking = thisScript.dataset.tracking === 'true';

  if (!enabled) {
    return {
      essential: true,
      statistics: true,
      thirdparty: true,
      cookiesAccepted: true,
      enabled: false,
      tracking: false
    };
  }

  var defaultCookieSettings = {
    essential: true,
    statistics: false,
    thirdparty: false,
    cookiesAccepted: false,
  };

  var cookieSettings = null;

  try {
    cookieSettings = JSON.parse(localStorage.getItem('cookieSettings'));
  } catch(e) {
    console.log(e);
  }

  if (!cookieSettings) {
    cookieSettings = defaultCookieSettings;
    // setCookieSettings(cookieSettings);
  }

  cookieSettings.enabled = enabled;
  cookieSettings.tracking = tracking;
  return cookieSettings;
}

function initCookieSettingsDialog() {
  var cookieSettings = getCookieSettings();
  document.getElementById('cookieSettingsStatistics').checked = cookieSettings.statistics === true;
  document.getElementById('cookieSettingsThirdparty').checked = cookieSettings.thirdparty === true;
}

function openCookieSettings() {
  initCookieSettingsDialog();
  document.getElementById('cookieSettingsDialog').classList.remove('cm-hidden');
}

function closeCookieSettings() {
  document.getElementById('cookieSettingsDialog').classList.add('cm-hidden');
}

function saveCookieSettings() {
  var cookieSettings = getCookieSettings();
  var statistics = document.getElementById('cookieSettingsStatistics').checked === true;
  var thirdparty = document.getElementById('cookieSettingsThirdparty').checked === true;
  var reboot = cookieSettings.statistics && !statistics || cookieSettings.thirdparty && !thirdparty;
  cookieSettings.cookiesAccepted = true;
  cookieSettings.statistics = statistics;
  cookieSettings.thirdparty = thirdparty;
  setCookieSettings(cookieSettings);
  closeCookieSettings();
  if (reboot) {
    document.location.reload();
  }
}

function resetCookieSettings() {
  setCookieSettings(null);
}

(function() {
  var cookieSettings = getCookieSettings();
  if (cookieSettings.enabled) {
    window.addEventListener('CookieSettingsChanged', initCookieSettingsDialog);
    // changed outside this document
    window.addEventListener('storage', dispatchCookieSettingsEvent);
    if (!cookieSettings.cookiesAccepted) {
      openCookieSettings();
    }
  }
})();


// neu

document.addEventListener('DOMContentLoaded', function() {
  // set popup to display none if the close btn was clicked
  var closeBtn = document.querySelector('.cm-cookie-header__close-button');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCookieSettings);
    closeBtn.addEventListener('keypress', function(ev) {
      if (ev.keyCode === 32 || ev.keyCode === 13) {
        closeCookieSettings();
      }
    });
  }

  /* keyboard control for switches */
  var switchWrapper = document.querySelectorAll(
    '#cookieSettingsDialog .cm-cookie-switch-wrapper, .cm-wp-container .cm-wp-content-switcher');
  for (var i = 0; i < switchWrapper.length; i++) {
    switchWrapper[i].addEventListener('keypress', function(ev) {
      if (ev.keyCode === 32 || ev.keyCode === 13) {
       ev.target.querySelector('input').click();
       ev.target.setAttribute("aria-checked", ev.target.querySelector('input').checked ? 'true' : 'false');
      }
    });
  }

  /* keyboard control for buttons */
  var cookieButton = document.querySelectorAll('#cookieSettingsDialog .cm-cookie-button');
  for (var i = 0; i < cookieButton.length; i++) {
    cookieButton[i].addEventListener('keypress', function(ev) {
      if (ev.keyCode === 32 || ev.keyCode === 13) {
        ev.target.click();
      }
    });
  }

  // open the expansion panels and rotating the icon
  var toggleExpansion = function(elem) {
    var expansionButton = elem.querySelector('.cm-cookie-content-expansion-button');
    var expansionPanel = elem.closest('.cm-cookie-controls').querySelector('.cm-cookie-content-expansion-text');
    expansionButton.classList.toggle('cm-cookie-content-expansion-button--rotate');
    expansionPanel.classList.toggle('cm-cookie-content-expansion-text--open');
    expansionButton.setAttribute("aria-expanded", expansionPanel.classList.contains('cm-cookie-content-expansion-text--open') ? 'true' : 'false');
  };

  var expandBtn = document.querySelectorAll('.cm-cookie-expand-wrapper');
  for(var i = 0; i < expandBtn.length; i++ ) {
    expandBtn[i].addEventListener('click', function() {
      toggleExpansion(this);
    });
    expandBtn[i].addEventListener('keypress', function(ev) {
      if (ev.keyCode === 32 || ev.keyCode === 13) {
        toggleExpansion(this);
      }
    });
  }

  /* keyboard control for footer link (space) */
  var footerLink = document.querySelector('#cookieSettingsDialog .cm-cookie-footer__link');
  if (footerLink) {
    footerLink.addEventListener('keypress', function(ev) {
      if (ev.keyCode === 32) {
        ev.target.click();
      }
    });
  }
});
