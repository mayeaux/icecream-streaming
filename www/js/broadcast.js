function Broadcast(config) { 
  // Break out configuration parameters.
  var iceServerDomain = config['iceServerDomain'] || 'example.org';
  var iceServerPort = config['iceServerPort'] || 8000;
  var enableMountPointSelection = config['enableMountPointSelection'] || false;
  var mountPrefix = config['mountPrefix'] || 's-';
  var watchUrl = config['watchUrl'] || 'https://example.org/';
  var videoWidth = config['videoWidth'] || 320;
  var videoHeight = config['videoHeight'] || 240;
  var audioBitsPerSecond = config['audioBitsPerSecond'] || 128000;
  var videoBitsPerSecond = config['audioBitsPerSecond'] || 500000;

  // Run common code.
  Icecream(config);

  // The user variables change depending on user input. 
  var userMenuSelected = 'login';
  var userIsStreaming = false;
  var userAdditionalMessage = null;

  // Declare the video stream being captured by the user. This will get
  // sent back to the server if the user clicks the broadcast button.
  var videoStream; 

  function init() {
    setMountPointSelection();
    setStreamQuality();
    setMenuItems();
    setStartStopButtons();
    setEventListeners();
  }

  function setMountPointSelection() {
    if (!enableMountPointSelection) {
      document.querySelector('#mount-point-selection').style.display = 'none';
    }
  }

  function setMessageArea() {
    if (userIsStreaming) {
      document.querySelector('#status-message').innerHTML = 'BROADCASTING';
    }
    else {
      document.querySelector('#status-message').innerHTML = 'Not broadcasting';
    }
    if (userAdditionalMessage) {
      document.querySelector('#additional-message').innerHTML = userAdditionalMessage;
    }
    else {
      document.querySelector('#additional-message').innerHTML = null;
    }
  }

  // Request access to camera and mic. 
  function requestMedia() {
    // Setup the video and audio devices.
    var constraints = { 
      video: {
        width: videoWidth,
        height: videoHeight
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
  }

  // Disable/enable start/stop buttons.
  function setStartStopButtons() {
    if (userIsStreaming) {
      document.querySelector('#broadcast-start').disabled = true;
      document.querySelector('#broadcast-stop').disabled = false;
    }
    else {
      document.querySelector('#broadcast-start').disabled = false;
      document.querySelector('#broadcast-stop').disabled = true;
    }
  }

  // Set video quality.
  function setStreamQuality() {
    document.querySelector('#v').width = videoWidth;
    document.querySelector('#v').height = videoHeight;
    document.querySelector('#videoWidth').value = videoWidth;
    document.querySelector('#videoHeight').value = videoHeight;
    document.querySelector('#videoBitsPerSecond').value = videoBitsPerSecond / 1000;
    document.querySelector('#audioBitsPerSecond').value = audioBitsPerSecond / 1000;

    // Always request media again to properly set height/width.
    requestMedia();
  } 

  // Ensure the menus are displayed properly. This is called every time
  // a menu item is clicked.
  function setMenuItems() {
    var items = [ "login", "advanced", "share" ];
    for (var i = 0; i < items.length; i++) {
      var itemId = "#menu-item-" + items[i];
      var areaId = "#menu-area-" + items[i];
      var className = "pure-menu-item ";
      if (userMenuSelected == items[i]) {
        className += "pure-menu-active ";
        document.querySelector(areaId).style.display = 'block';
        // If share is selected, make sure we have the right share values
        // displayed.
        if (items[i] == 'share') {
          setShareValues();
        }
      }
      else {
        document.querySelector(areaId).style.display = 'none';
      }
      if (!userIsStreaming && items[i] == 'share') {
        className += "pure-menu-disabled ";
      }
      document.querySelector(itemId).className = className;
    }
  }

  // Ensure our links in the share area are correct.
  function setShareValues() {
    var iceMount = document.querySelector('#iceMount').value;
    var iceUser = document.querySelector('#iceUser').value;
    var streamName;

    if (iceMount) {
      streamName = iceMount;
    }
    else {
      iceMount = mountPrefix + iceUser;
      streamName = iceUser;
    }

    // Make the plain link show the right link.
    var viewLink = window.location.origin + '/w/' + streamName;
    document.querySelector('#view-link').href = viewLink; 

    var socialMessage = "Watch us live now! " + viewLink;
    var socialLink = encodeURIComponent(socialMessage)
    var twitterLink = 'https://twitter.com/home?status=' + socialMessage;
    document.querySelector('#twitter-link').href = twitterLink; 
    var facebookLink = 'https://www.facebook.com/sharer/sharer.php?u=' + socialMessage;
    document.querySelector('#facebook-link').href = facebookLink; 

    // Setup the embed code.
    var embed_code = '<video controls><source src="' + watchUrl + iceMount + '"></source></video>';
    document.querySelector('#embed-code').value = embed_code;
  }

  function setEventListeners() {
    document.querySelector('#menu-link-login').addEventListener('click', (e) => {
      userMenuSelected = 'login';
      setMenuItems();
      e.preventDefault();
    });
    document.querySelector('#menu-link-share').addEventListener('click', (e) => {
      if (userIsStreaming) {
        userMenuSelected = 'share';
        setMenuItems();
      }
      e.preventDefault();
    });
    document.querySelector('#menu-link-advanced').addEventListener('click', (e) => {
      userMenuSelected = 'advanced';
      setMenuItems();
      e.preventDefault();
    });

    document.querySelector('#advanced-apply').addEventListener('click', (e) => {
      if (userIsStreaming) {
        alert("Please stop streaming before applying changes.");
        return;
      }
      videoBitsPerSecond = document.querySelector('#videoBitsPerSecond').value * 1000;
      audioBitsPerSecond = document.querySelector('#audioBitsPerSecond').value * 1000;
      videoWidth = document.querySelector('#videoWidth').value;
      videoHeight = document.querySelector('#videoHeight').value;
      setStreamQuality();
    });

    // Action to take when start is pressed.
    document.querySelector('#broadcast-start').addEventListener('click', (e) => {
      console.log("Broadcast start button clicked.");

      // Make sure we have a icecast target URL.
      var iceUser = document.querySelector('#iceUser').value;
      var icePassword = document.querySelector('#icePassword').value;
      var iceMount = document.querySelector('#iceMount').value;

      if (!iceMount) {
        // Setting a default mount point based on username means less confusing
        // options for the user.
        iceMount = mountPrefix + iceUser;
      }

      if (!iceUser || !icePassword || !iceMount) {
        alert("Please fill in your username and password.");
        return;
      }

      // Start streaming the video via web sockets to our server.js code.
      const ws = new WebSocket(
        window.location.protocol.replace('http', 'ws') + '//' + // http: -> ws:, https: -> wss:
          window.location.host + 
          '/ws/stream/' +
          encodeURIComponent(iceUser) + '/' + 
          encodeURIComponent(icePassword) + '/' + 
          encodeURIComponent(iceMount) + '/'
      );

      // Update the status.
      userIsStreaming = true;
      userAdditionalMessage = null;
      setMessageArea();
      setStartStopButtons();
      setMenuItems();

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

      document.querySelector('#broadcast-stop').addEventListener('click', (e) => {
        console.log("Broadcast stop button clicked.");
        userIsStreaming = false;
        ws.close();
      });

      ws.addEventListener('close', (e) => {
        console.log('WebSocket Close', e);
        if (userIsStreaming) {
          // Uh oh. The websocket closed, but we didn't stop it ourselves.
          if (!userAdditionalMessage) {
            userAdditionalMessage = "The broadcast suddenly stopped. Please check your network and consider lowering your video quality.";
          }
          userIsStreaming = false;
        }

        // Shut it all down.
        setMessageArea();
        setMenuItems();
        setStartStopButtons();
      });

      ws.addEventListener('message', (m) => {
        console.log(m);
        if (m.data.match(/^401:/)) {
          userAdditionalMessage = "Incorrect username or password";
        }
        else if (m.data.match(/^52[23]:/)) {
          userAdditionalMessage = "Failed to connect to icecast server. Please contact the server admin.";
        }
        setMessageArea();
      });
    });
  }

  // Start everything.
  init();
  
}

