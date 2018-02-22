# Icecast web source client

The icecast-web-source-client allows you to stream audio and video from your web browser to an icecast server.

It is based on a simple nodejs component that runs on a server (which does not have to be the same server as your icecast server). The server must have ffmpeg installed.

## Installing and Running

Start with:

    npm install

Then, run with:

    npm start

And then connect via http://localhost:3000/ (replace localhost with any domain that points to an IP address in use on your device).

## Credits 

Thanks https://github.com/Keyne for pointing me towards https://github.com/fbsamples/Canvas-Streaming-Example.
