function Watch(config) {
  var watchUrl = config['watchUrl'] || 'https://example.org/';
  var mountPrefix = config['mountPrefix'] || 's-';
  var offerMp3 = iConfig['offerMp3'] || false;

  // Run common code.
  var icecream = Icecream(config);

  var path = window.location.pathname;
  var mountPoint = path.substr(path.lastIndexOf('/') + 1);

  var bareUrl = watchUrl + mountPrefix + mountPoint;
  var noCache = '?nocache=' +  Date.now();

  var player  = document.querySelector("#player");
  var message  = document.querySelector("#message");

  // What to display if the browser can't properly display the media.
  var generic_err_msg = 'Don\'t fret! You can still see the full video, you ' +
    'just need to open this address in a more functional browser. ' +
    'Try: <a target="_blank" href="https://getfirefox.com">Firefox</a>, ' +
    'Chromium, Chrome, or Opera.'; 

  // iOS is so broken they get their own error message.
  var ios_err_msg = 'Don\'t fret! You can still see the full video, ' +
    'you just need to install the ' + 
    '<a href="https://itunes.apple.com/app/apple-store/id650377962?mt=8">' +
    'VLC for Mobile</a> app. ';
  ios_err_msg += 'Then, <a href="vlc://' + bareUrl + '.webm' + noCache + 
    '">play the stream via vlc</a> (when prompted, click play, not download).';

  function cantPlay(msg) {
    if (icecream.iosCheck()) {
      player.innerHTML = msg + ios_err_msg;
    }
    else {
      player.innerHTML = msg + generic_err_msg;
    }
  }

  function loadFailOverIfConfigured() {
    var err_msg = "Uh oh, couldn't load the video! ";
    // Woops - there was an error loading. We assume it's because the
    // browser can't handle it.
    if (offerMp3) {
      loadFailOver();   
    }
    else {
      // Display error.
      cantPlay(err_msg);
    }
  }

  // Load the video player.
  function loadMedia() {
    var v = document.createElement('video');

    // Short circuit to see if we can play video/webm.
    var canPlay = v.canPlayType('video/webm');
    if (!canPlay) {
      loadFailOverIfConfigured();
      return;
    }
    v.controls = 'control';

    // Set the right video source.
    var sourceEl = document.createElement('source');
    sourceEl.setAttribute('src', bareUrl + '.webm' + noCache);
    
    // Handle errors.
    sourceEl.addEventListener("error", function (err) {
      console.log(this);
      loadFailOverIfConfigured();
    });
    
    // Get rid of our spinner
    player.innerHTML = "";

    // Add the player.
    v.appendChild(sourceEl);
    player.appendChild(v);
  }

  // If loading the video player fails, try to load just an mp3 file.
  function loadFailOver() {
    var a = document.createElement('audio');
    var canPlay = a.canPlayType('audio/mp3');
    if (!canPlay) {
      // You are really screwed if you can't load an mp3. 
      cantPlay("Uh oh, your browser does not support streaming media. ");
      return;
    }
    var audioSourceEl = document.createElement('source');
    audioSourceEl.setAttribute('src', bareUrl + '.mp3' + noCache);
    // Handle errors.
    audioSourceEl.addEventListener("error", function (err) {
      console.log(this);
      cantPlay("Uh oh, your browser does not support streaming media. ");
      return;
    });
    a.controls = 'control';
    // Replace the spinner.
    player.innerHTML = "";

    // Add the audio player.
    a.appendChild(sourceEl);
    player.appendChild(a);

    // Let them know how to get full video if they want it.
    var msg = "Uh oh, you are only getting audio, not the full video. ";
    if (icecream.iosCheck()) {
      message.innerHTML = msg + ios_err_msg;
    }
    else {
      message.innerHTML = msg + generic_err_msg;
    }
  }


  function init() {
    // Before doing anything, pass the url back to our server to see if it
    // is available. This way we can pass a friendly message saying the stream
    // is not available (if it isn't) rather than displaying a broken media
    // player and leaving the user wondering if something is broken.
    var ws = new WebSocket(
      window.location.protocol.replace('http', 'ws') + '//' + // http: -> ws:, https: -> wss:
      window.location.host + 
      '/ws/urlcheck/' + encodeURIComponent(bareUrl + '.webm') + '/'
    );

    // Wait for response from the server.
    ws.addEventListener('message', function(m) {
      console.log("Message", m);
      if (m.data == "200") {
        // This stream is available, let's do it.
        loadMedia();    
      }
      else if (m.data == "502") {
        // This seems to be sent by icecast when we are setting up the stream.
        player.innerHTML = 'The stream is just setting up and should be ready in a few second. Please try refreshing your browser.';
      }
      else {
        // uh oh - not ready.
        player.innerHTML = 'Uh oh, this stream is not available. Maybe it has not started yet? Try waiting a few minutes and reloading the page.';
      }
    });
    ws.addEventListener('close', function(e) {
      console.log("closed", e);
    });
  }

  init();

}
