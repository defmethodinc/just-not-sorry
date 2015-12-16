// Saves options to chrome.storage.sync.
function save_options() {
  var allowTracking = document.getElementById('allowTracking').checked;
  chrome.storage.sync.set({
    allowTracking: allowTracking
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    // default
    allowTracking: true
  }, function(items) {
    document.getElementById('allowTracking').checked = items.allowTracking;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
