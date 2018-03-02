function Watch(config) {
  var watchUrl = config['watchUrl'] || 'https://example.org/';
  var mountPrefix = config['mountPrefix'] || 's-';
  var videoIdealHeight = config['videoIdealHeight'] || 240;
  var videoIdealWidth = config['videoIdealHeight'] || 320;

  // Run common code.
  Icecream(config);

  var path = window.location.pathname;
  var mountPoint = path.substr(path.lastIndexOf('/') + 1);

  // Set the right video dimensions.
  var v = document.querySelector("#v");
  v.height = videoIdealHeight;
  v.width = videoIdealWidth;

  // Set the right video source.
  var sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', watchUrl + mountPrefix + mountPoint + '?nocache=' +  Date.now());
  
  // Handle errors.
  sourceEl.addEventListener("error", function (err) {
    console.log(this);
  });
  
  v.append(sourceEl);
}
