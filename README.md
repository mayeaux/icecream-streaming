# Icecast web source client

`icecream` is a web browser based icecast video source client allows you to stream audio and video from your web browser to an icecast server.

It is based on a simple nodejs component that runs on a server (which does not have to be the same server as your icecast server). The server must have ffmpeg installed.

## Installing and Running

Start with:

    npm install

Then, edit www/js/config.js and www/index.html to your liking.

Then, run with:

    npm start

And then connect via http://localhost:3000/ (replace localhost with any domain that points to an IP address in use on your device).

## Auto start via systemd

First, create a non privileged user called icecream.

Then, add the file /etc/systemd/system/icecream.service:

    [Unit]
    Description=Start icecream, our icecast web source client

    [Service]
    WorkingDirectory=/home/icecream/icecream/
    ExecStart=/usr/bin/node server.js
    User=icecream
    Restart=always

    [Install]
    WantedBy=multi-user.target

## Screen grab

![Screen grab of broadcaster](docs/screengrab.png)

## Proxy via Nginx

Here is a minimal sample configuration for nginx.

    server {
      server_name live.mayfirst.org; 
      listen *:80;

      # Ensure access to letsencrypt via http for certificate creation.
      location /.well-known/acme-challenge/ {
        root /var/www/live;
      }
      # Everyone else gets redirected to https.
      location / {
        return 301 https://live.mayfirst.org$request_uri;	
      }
    }

    upstream websocket{
      server localhost:3000;
    }

    map $http_upgrade $connection_upgrade {
      default Upgrade;
      '' close;
    }

    server {
      listen *:443;
      access_log /dev/null;
      server_name live.mayfirst.org; 
      # Root is only used for letsencrypt.
      root  /var/www/live;

      location / {
        proxy_pass http://localhost:3000/;
      }

      location /stream {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
      }

      location = /robots.txt {
        allow all;
        log_not_found off;
        access_log off;
      }

      # Ensure access to letsencrypt (stanza below will block it)
      location /.well-known/acme-challenge/ {
        allow all;
      }
        
      # Block access to "hidden" files and directories whose names begin with a
      # period. This includes directories used by version control systems such
      # as Subversion or Git to store control files.
      location ~ (^|/)\. {
        return 403;
      }

      # Thanks to https://raymii.org/s/tutorials/Strong_SSL_Security_On_nginx.html
      ssl on;
      ssl_certificate_key /etc/letsencrypt/live/live.mayfirst.org/privkey.pem;
      ssl_certificate /etc/letsencrypt/live/live.mayfirst.org/fullchain.pem;

      ssl_ciphers 'AES128+EECDH:AES128+EDH:!aNULL';

      ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
      ssl_session_cache shared:SSL:10m;

      ssl_prefer_server_ciphers on;
      ssl_dhparam /etc/ssl/dhparam.pem;

      add_header Strict-Transport-Security max-age=63072000;
      add_header X-Content-Type-Options nosniff;
    }



## Limitations

This only works with Firefox and Chrome/Chromium. Users of iOS (iPhone or iPad) cannot broadcast or even view video that is sent.

## Credits 

Thanks https://github.com/Keyne for pointing me towards https://github.com/fbsamples/Canvas-Streaming-Example.

Thanks to D Sharon Pruitt for the picture of the ice cream cone (https://commons.wikimedia.org/wiki/File:Ice_cream_cone.jpg).
