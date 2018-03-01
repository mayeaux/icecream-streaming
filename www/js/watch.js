function Watch(config) {
  var watchUrl = config['watchUrl'] || 'https://example.org/';
  var mountPrefix = config['mountPrefix'] || 's_';
  var pageTitle = config['pageTitle'] || 'Icecream Icecast Video Source Client';

  var path = window.location.pathname;
  var mountPoint = path.substr(path.lastIndexOf('/') + 1);
  console.log("Mount Point:", mountPoint);

  document.querySelector('#titleHeader').innerHTML = pageTitle;

  var sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', watchUrl + mountPrefix + mountPoint + '?nocache=' +  Date.now());
  document.querySelector("#v").append(sourceEl);
}
