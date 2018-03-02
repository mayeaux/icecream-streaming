const child_process = require('child_process'); // To be used later for running FFmpeg
const express = require('express');
const http = require('http');
const WebSocketServer = require('ws').Server;

const app = express();
const server = http.createServer(app).listen(3000, () => {
  console.log('Listening...');
});

// Set configuration options, or use defaults.
require('./www/js/config.js');
const iceServerDomain = iConfig['iceServerDomain'] || 'example.org'; 
const iceServerPort = iConfig['iceServerPort'] || '8000';

// Serve static files out of the www directory.
app.use(express.static(__dirname + '/www'));
app.use(/\/w\/.*/, express.static(__dirname + '/www/watch.html'));

const wss = new WebSocketServer({
  server: server
});

wss.on('connection', (ws, req) => {
  
  // Ensure that the URL has 'broadcast/stream/' in it, and extract the target user,
  // password and room.
  var match;
  if ( !(match = req.url.match(/^\/stream\/(.*)\/(.*)\/(.*)\/$/)) ) {
    console.log("Not a matching URL", req.url);
    ws.terminate(); // No match, reject the connection.
    return;
  }
  
  // Set both ICE_DOMAIN and ICE_PORT via environment variables. This ensures
  // we will only stream to our server to avoid having people use this nodejs
  // app (and it's CPU cycles) to stream to arbitrary icecast servers.
  

  const iceUser = match[1];
  const icePassword = match[2];
  const iceMountPoint = match[3];

  // User input comes in URI encoded. Decode for console output, but use
  // the encoded versions when we pass via command line to ffmpeg.
  console.log('Target user:', decodeURIComponent(iceUser));
  console.log('Target mount point:', decodeURIComponent(iceMountPoint));
  const iceUrl = 'icecast://' + iceUser + ':' + icePassword + '@' +
    iceServerDomain + ':' + iceServerPort + '/' + iceMountPoint;
  
  // Launch FFmpeg to handle all appropriate transcoding, muxing, and RTMP.
  // If 'ffmpeg' isn't in your path, specify the full path to the ffmpeg binary.
  const ffmpeg = child_process.spawn('ffmpeg', [
    // FFmpeg will read input video from STDIN.
    '-i', '-',
    '-f', 'webm', '-cluster_size_limit', '2M', '-cluster_time_limit', '5100', '-content_type', 'video/webm',
    // We should be getting video from the browser using a format that icecast
    // can handle so we can just copy to save CPU cycles on the server. 
    '-vcodec', 'copy',
    // Ditto for audio.
    '-acodec', 'copy',
    
    // The output  URL.
    iceUrl
  ]);
  
  // If FFmpeg stops for any reason, close the WebSocket connection.
  ffmpeg.on('close', (code, signal) => {
    console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
    ws.terminate();
  });
  
  // Handle STDIN pipe errors by logging to the console.
  // These errors most commonly occur when FFmpeg closes and there is still
  // data to write.  If left unhandled, the server will crash.
  ffmpeg.stdin.on('error', (e) => {
    console.log('FFmpeg STDIN Error', e);
  });
  
  // FFmpeg outputs all of its messages to STDERR.  Let's log them to the console.
  ffmpeg.stderr.on('data', (data) => {
    var err = data.toString();
    console.log('FFmpeg STDERR:', err);
    // Notify the client of particular errors. We try to use standard http error codes
    // (and cloudflare augmented ones based on https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)
    if (err.match(/401 Unauthorized/)) {
      // User/pass not correct
      ws.send("401: Unauthorized");
    }
    if (err.match(/Failed to resolve hostname/)) {
      ws.send("523: Failed to resolve hostname");
    }
    if (err.match(/Connection timed out/)) {
      ws.send("522: Connection timed out");
    }

  });

  // When data comes in from the WebSocket, write it to FFmpeg's STDIN.
  ws.on('message', (msg) => {
    console.log('DATA', msg);
    ffmpeg.stdin.write(msg);
  });
  
  // If the client disconnects, stop FFmpeg.
  ws.on('close', (e) => {
    ffmpeg.kill('SIGINT');
  });
  
});
