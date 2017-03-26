// Saves options to chrome.storage.sync.
function save_options(enabled) {
  chrome.storage.sync.set({
    mbfcanalytics: {
      enabled: enabled
    }
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = enabled ? "Thank you for helping!" : "No problem, nothing is tracked";
    close();
  });
}


function waitForElementToDisplay(selector, time, cb) {
  var el = document.querySelector(selector);
  if (el != null) {
    cb(el);
  }
  else {
    setTimeout(function () {
      waitForElementToDisplay(selector, time, cb);
    }, time);
  }
}


function activateFacebook() {
  chrome.tabs.query({
    url: "*://*.facebook.com/*"
  }, function(array_of_Tabs) {
    if (array_of_Tabs.length == 0) return;
    var tab = array_of_Tabs[0];
    console.log(tab);
    // Example:
    chrome.tabs.update(tab.id, {active: true});
  });
}

function close() {
  setTimeout(function() {
    //closeCurrent();
    activateFacebook();
  }, 3000);
}

waitForElementToDisplay('#yes', 500, function() {
  document.getElementById('yes').addEventListener('click',function() {save_options(true);});
  document.getElementById('no').addEventListener('click',function() {save_options(false);});
  document.getElementById('reset').addEventListener('click',function() {
    chrome.runtime.sendMessage({method: "resetIgnored"}, function (response) {
      var status = document.getElementById('resetStatus');
      status.textContent = 'Hidden flags reset.  Reload Facebook to activate';
      close();
    });
  });

});
