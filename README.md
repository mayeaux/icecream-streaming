# Icecast web source client

The icecast-web-source-client allows you to stream audio and video from your web browser to an icecast server.

It is based on a simple nodejs component that runs on a server (which does not have to be the same server as your icecast server). The server must have ffmpeg installed.

## Installing and Running

Start with:

    npm install

Then, run with:

    ICE_DOMAIN=your.icecast.server.org ICE_PORT=8000 npm start

And then connect via http://localhost:3000/ (replace localhost with any domain that points to an IP address in use on your device).

## Screen grab

![Screen grab of broadcaster](docs/screengrab.png)

## Proxy via Nginx

Here is a minimal sample configuration for nginx.

    upstream websocket{
      server localhost:3000;
    }

    map $http_upgrade $connection_upgrade {
      default Upgrade;
      '' close;
    }

    server {
      listen *:443;

      location /broadcast/ {
        proxy_pass http://localhost:3000/;
      }

      location /broadcast/stream {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
      }
    }

## Limitations

This only works with Firefox, tested on version 58.

## Credits 

Thanks https://github.com/Keyne for pointing me towards https://github.com/fbsamples/Canvas-Streaming-Example.
