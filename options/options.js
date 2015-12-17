var background = chrome.extension.getBackgroundPage();
var gaService = background.gaService;

function save_options() {
  var allowTracking = document.getElementById('allowTracking').checked;
  gaService.getConfig().addCallback(function(config) {
    config.setTrackingPermitted(allowTracking);
    display_options_saved_msg();
  });
}

function display_options_saved_msg() {
  var status = document.getElementById('status');
  status.textContent = 'Options saved.';
  setTimeout(function() {
    status.textContent = '';
  }, 750);
}

function restore_options() {
  gaService.getConfig().addCallback(function(config) {
    var allowTracking = config.isTrackingPermitted();
    document.getElementById('allowTracking').checked = allowTracking;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
