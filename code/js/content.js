console.log('Gmail is ', window.Gmail);
;(function() {
  console.log('CONTENT SCRIPT WORKS!');
  console.log('Gmail is ', window.Gmail);
  require('./modules/JustNotSorry').init();
})();
