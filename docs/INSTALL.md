# Installing and Running Icecream

Start with:

    npm install

Then, edit www/js/config.js and www/index.html to your liking.

Then, run with:

    npm start

And then connect via http://localhost:3000/ (replace localhost with any domain that points to an IP address in use on your device).

## Auto start via systemd

First, create a non privileged user called icecream.

Then, copy the provided icream.service file to /etc/systemd/system/icecream.service.

## Proxy via Nginx

Please see nginx.conf for a minimal configuration file for proxying to icecream. Be sure to edit it for your environment.

