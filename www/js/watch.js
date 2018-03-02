function Watch(config) {
  var watchUrl = config['watchUrl'] || 'https://example.org/';
  var mountPrefix = config['mountPrefix'] || 's-';
  var pageTitle = config['pageTitle'] || 'Icecream Icecast Video Source Client';
  var videoIdealHeight = config['videoIdealHeight'] || 240;
  var videoIdealWidth = config['videoIdealHeight'] || 320;

  var path = window.location.pathname;
  var mountPoint = path.substr(path.lastIndexOf('/') + 1);
  console.log("Mount Point:", mountPoint);

  document.querySelector('#titleHeader').innerHTML = pageTitle;

  // Set the right video dimensions.
  var v = document.querySelector("#v");
  v.height = videoIdealHeight;
  v.width = videoIdealWidth;

  // Set the right video source.
  var sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', watchUrl + mountPrefix + mountPoint + '?nocache=' +  Date.now());
  
  // Handle errors.
  sourceEl.addEventListener("error", function (err) {
    console.log("Checking...");
    console.log(this);
  });
  
  v.append(sourceEl);
}

function failed(e) {
  console.log("Dudes alot");
  console.log(e);
}
