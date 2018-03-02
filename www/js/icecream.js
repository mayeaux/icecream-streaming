// Common functions for all pages.
function Icecream(config) {
  var pageTitle = config['pageTitle'] || 'Icecream Icecast Video Source Client';
  var logoPath = config['logoPath'] || '/images/icecream-small.png';
  var footer = config['footer'] || '<strong>Icecream</strong> is free software. Browse the <strong>icecream</strong> source code via <a href="https://gitlab.com/jamie/icecream">gitlab</a>.';

  document.querySelector('#titleHeader').innerHTML = pageTitle;
  document.querySelector('#logo').src = logoPath;
  document.querySelector('#footer').innerHTML = footer;
  
}
