function Watch(config) {
  var watchUrl = config['watchUrl'] || 'https://example.org/';
  var mountPrefix = config['mountPrefix'] || 's_';
  var pageTitle = config['pageTitle'] || 'Icecream Icecast Video Source Client';

  var path = window.location.pathname;
  var mountPoint = path.substr(path.lastIndexOf('/') + 1);
  console.log("Mount Point:", mountPoint);

  document.querySelector('#titleHeader').innerHTML = pageTitle;

  // Set the right video dimensions.
  var v = document.querySelector("#v");
  v.height = config['videoIdealHeight'];
  v.width = config['videoIdealWidth'];

  // Set the right video source.
  var sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', watchUrl + mountPrefix + mountPoint + '?nocache=' +  Date.now());
  v.append(sourceEl);
}
