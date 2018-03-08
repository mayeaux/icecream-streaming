function Watch(config) {
  var watchUrl = config['watchUrl'] || 'https://example.org/';
  var mountPrefix = config['mountPrefix'] || 's-';

  // Run common code.
  Icecream(config);

  var path = window.location.pathname;
  var mountPoint = path.substr(path.lastIndexOf('/') + 1);

  var url = watchUrl + mountPrefix + mountPoint + '?nocache=' +  Date.now();
  var ws = new WebSocket(
    window.location.protocol.replace('http', 'ws') + '//' + // http: -> ws:, https: -> wss:
    window.location.host + 
    '/ws/urlcheck/' + encodeURIComponent(url) + '/'
  );
  ws.addEventListener('message', (m) => {
    console.log("Message", m);
    var player  = document.querySelector("#player");
    if (m.data == "200") {
      // This stream is available, let's do it.
      var v = document.createElement('video');
      v.controls = 'control';

      // Set the right video source.
      var sourceEl = document.createElement('source');
      sourceEl.setAttribute('src', watchUrl + mountPrefix + mountPoint + '?nocache=' +  Date.now());
      
      // Handle errors.
      sourceEl.addEventListener("error", function (err) {
        console.log(this);
      });
      
      v.append(sourceEl);
      player.append(v);
    }
    else if (m.data == "502") {
      // This seems to be sent by icecast when we are setting up the stream.
      player.innerHTML = 'The stream is just setting up and should be ready in a few second. Please try refreshing your browser.';
    }
    else {
      // uh oh - not ready.
      player.innerHTML = 'Uh oh, this stream is not available. Maybe it has not started yet. Try waiting a few minutes and refreshing.';
    }
  });
  ws.addEventListener('close', (e) => {
    console.log("closed", e);
  });

  }
