function Broadcast(config) { 
  // Break out configuration parameters.
  var pageTitle = config['pageTitle'] || 'Icecream Icecast Video Source Client';
  var iceServerDomain = config['iceServerDomain'] || 'example.org';
  var iceServerPort = config['iceServerPort'] || 8000;
  var enableMountPointSelection = config['enableMountPointSelection'] || false;
  var mountPrefix = config['mountPrefix'] || 's_';
  var watchUrl = config['watchUrl'] || 'https://example.org/';
  var videoMinWidth = config['videoMinWidth'] || 320;
  var videoIdealWidth = config['videoIdealWidth'] || 320;
  var videoMaxWidth = config['videoMmaxWidth'] || 320;
  var videoMinHeight = config['videoMinWidth'] || 240;
  var videoIdealHeight = config['videoIdealWidth'] || 240;
  var videoMaxHeight = config['videoMmaxWidth'] || 240;
  var audioBitsPerSecond = config['audioBitsPerSecond'] || 128000;
  var videoBitsPerSecond = config['audioBitsPerSecond'] || 1500000;


  // Declare the video stream being captured by the user. This will get
  // sent back to the server if the user clicks the broadcast button.
  var videoStream; 
  var v = document.getElementById('v');

  v.height = videoIdealHeight;
  v.width = videoIdealWidth;

  // Set display string values based on user configuration.
  document.querySelector('#titleHeader').innerHTML = pageTitle;

  document.querySelector('#broadcaststop').disabled = true;

  if (!enableMountPointSelection) {
    document.querySelector('#mount-point-selection').style.display = 'none';
  }

  // Setup the video and audio devices.
  var constraints = { 
    video: {
      width: { 
        min: videoMinWidth, ideal: videoIdealWidth, max: videoMaxWidth 
      }, 
      height: { 
        min: videoMinHeight, ideal: videoIdealHeight, max: videoMaxHeight 
      }
    },
    audio: true
  }

  // Immediately request access and begin playing back.
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {
    videoStream = stream;
    v.srcObject = stream;
    v.play();
  })
  .catch(function(err) { 
    console.log(err.name + ": " + err.message); 
    if (err.name == 'NotAllowedError') {
      alert("Could not get access to camera and mic.");
    }
  });
  
  // Action to take when start is pressed.
  document.querySelector('#broadcaststart').addEventListener('click', (e) => {
    console.log("Broadcast start button clicked.");

    // Make sure we have a icecast target URL.
    var iceUser = document.querySelector('#iceUser').value;
    var icePassword = document.querySelector('#icePassword').value;
    var iceMount = document.querySelector('#iceMount').value;

    // The streamName is the name of the stream without the mount
    // point prefix.
    var streamName = iceMount;

    if (!iceMount) {
      // Setting a default mount point based on username means less confusing
      // options for the user.
      iceMount = mountPrefix + iceUser;
      streamName = iceUser;
    }

    if (!iceUser || !icePassword || !iceMount) {
      alert("Please fill in your username, password and room.");
      return;
    }
    document.querySelector('#broadcaststart').disabled = true;
    document.querySelector('#broadcaststop').disabled = false;

    // Start streaming the video via web sockets to our server.js code.
    const ws = new WebSocket(
      window.location.protocol.replace('http', 'ws') + '//' + // http: -> ws:, https: -> wss:
        window.location.host + 
        '/stream/' +
        encodeURIComponent(iceUser) + '/' + 
        encodeURIComponent(icePassword) + '/' + 
        encodeURIComponent(iceMount) + '/'
    );

    // Update the status.
    updateStatus("BROADCASTING");
    // Clear any errors
    updateMessage(null);

    // Display the directions on how to view the stream.
    document.querySelector('#outreach-directions').style.display = 'block';

    // Make the plain link show the right link.
    var viewLink = window.location.origin + '/w/' + streamName;
    document.querySelector('#view-link').src = viewLink; 
    document.querySelector('#view-link').innerHTML = viewLink;

    // Setup the embed code.
    var embed_code = '<video controls><source src="' + watchUrl + iceMount + '"></source></video>';
    embed_code = embed_code.replace(/\</g, '&lt;');
    embed_code = embed_code.replace(/\>/g, '&gt;');
    document.querySelector('#embed-code').innerHTML = embed_code;

    ws.addEventListener('open', (e) => {
      console.log('WebSocket Open', e);
      var mediaRecorder;
      // mediaStream = document.querySelector('canvas').captureStream(10); // 30 FPS
      mediaRecorder = new MediaRecorder(videoStream, {
        mimeType: 'video/webm;codecs=vp8',
        audioBitsPerSecond : audioBitsPerSecond,
        videoBitsPerSecond : videoBitsPerSecond,
      });

      mediaRecorder.addEventListener('dataavailable', (e) => {
        ws.send(e.data);
      });

      mediaRecorder.addEventListener('stop', ws.close.bind(ws));

      mediaRecorder.start(1000);
    
    });

    document.querySelector('#broadcaststop').addEventListener('click', (e) => {
      console.log("Broadcast stop button clicked.");
      document.querySelector('#broadcaststart').disabled = false;
      document.querySelector('#broadcaststop').disabled = true;
      ws.close();
    });

    ws.addEventListener('close', (e) => {
      console.log('WebSocket Close', e);
      // Shut it all down.
      document.querySelector('#outreach-directions').style.display = 'none';
      updateStatus("Not broadcasting");
      document.querySelector('#broadcaststart').disabled = false;
      document.querySelector('#broadcaststop').disabled = true;
    });

    ws.addEventListener('message', (m) => {
      console.log(m);
      if (m.data.match(/^401:/)) {
        updateMessage("Incorrect username or password.");
      }
      else if (m.data.match(/^52[23]:/)) {
        updateMessage("Failed to connect to icecast server. Please contact the server admin.");
      }
    });

    function updateStatus(msg) {
      document.querySelector('#streaming-status').innerHTML = msg;
    }
    function updateMessage(msg) {
      document.querySelector('#streaming-message').innerHTML = msg;
    }

  });
}

