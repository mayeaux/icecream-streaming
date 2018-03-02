// Common functions for all pages.
function Icecream(config) {
  var pageTitle = config['pageTitle'] || 'Icecream Icecast Video Source Client';
  var logoPath = config['logoPath'] || '/images/icecream-small.png';

  document.querySelector('#titleHeader').innerHTML = pageTitle;
  document.querySelector('#logo').src = logoPath;
}
