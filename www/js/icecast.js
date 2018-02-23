document.addEventListener('DOMContentLoaded', () => {    
  
  var globalStream; var v = document.getElementById('v');
  document.querySelector('#broadcaststop').disabled = true;

  // Setup the video and audio devices.
  // Limit resolution to ensure quality.
  var constraints = { 
    video: {
      width: { 
        min: 320, ideal: 320, max: 320 
      }, 
      height: { 
        min: 240, ideal: 240, max: 240 
      }
    },
    audio: true
  }
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {
    globalStream = stream;
    v.srcObject = stream;
    v.play();
  })
  .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.
  
  // Action to take when start is pressed.
  document.querySelector('#broadcaststart').addEventListener('click', (e) => {
    console.log("Broadcast start button clicked.");

    // Make sure we have a icecast target URL.
    iceUser = document.querySelector('#iceUser').value;
    icePassword = document.querySelector('#icePassword').value;
    iceRoom = document.querySelector('#iceRoom').value;

    if (!iceUser || !icePassword || !iceRoom) {
      alert("Please fill in your username, password and room.");
      return;
    }
    document.querySelector('#broadcaststart').disabled = true;
    document.querySelector('#broadcaststop').disabled = false;
    const ws = new WebSocket(
      window.location.protocol.replace('http', 'ws') + '//' + // http: -> ws:, https: -> wss:
        window.location.host + window.location.pathname +
        'stream/' +
        encodeURIComponent(iceUser) + '/' + 
        encodeURIComponent(icePassword) + '/' + 
        encodeURIComponent(iceRoom) + '/'
    );

    ws.addEventListener('open', (e) => {
      console.log('WebSocket Open', e);
      var mediaRecorder;
      // mediaStream = document.querySelector('canvas').captureStream(10); // 30 FPS
      mediaRecorder = new MediaRecorder(globalStream, {
        mimeType: 'video/webm;codecs=vp8',
        audioBitsPerSecond : 128000,
        videoBitsPerSecond : 1500000,
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
    });

  });
});

