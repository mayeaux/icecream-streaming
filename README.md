# Icecast web source client

`icecream` is a web-based icecast video source client that allows you to stream audio and video from your web browser to an [icecast](https://icecast.org/) server.

It is based on a simple nodejs component that runs on a server (which does not have to be the same server as your icecast server). The server must have [ffmpeg](https://ffmpeg.org/) installed.

It also includes a player page so people can easily view the live video created by `icecream`.

## Screen grab

![Screen grab of broadcaster](docs/screengrab.png)

## Install

See the [install docs](docs/INSTALL.md) for information on installing and configuring `icecream`.

## Limitations

Only Firefox, Chrome, and Chromium support the MediaRecorder API that is required for generating a video stream (and iOS devices neuter Firefox and Chrome so you simply can't publish a video stream on iPhones or iPads).

Viewing a stream is similarly limited to browsers that can stream webm/vp8 encoded video (Firefox, Chrome, Chromium, Opera among others) on Linux, Macintosh, Windows and Android. On iOS (iPhones and iPads) the media player provides a link to users making it easy to install the [VLC Media Player](https://www.videolan.org/vlc/) app and view the video via vlc with one click.

Helpful directions are provided to users of unsupported browsers.

## Credits 

Thanks https://github.com/Keyne for pointing me towards https://github.com/fbsamples/Canvas-Streaming-Example.

Thanks to D Sharon Pruitt for the picture of the ice cream cone (https://commons.wikimedia.org/wiki/File:Ice_cream_cone.jpg).

Thanks to [GiMaWolf](https://commons.wikimedia.org/w/index.php?title=User:GiMaWolf&action=edit&redlink=1) for the clipboard icon (https://commons.wikimedia.org/wiki/File:Clipboard_Pictogram.svg)

## License

What's with the Facebook license? Yeah, I know. Even though this project has *nothing* to do with Facebook and I hate the company, it is a derivative of [some code published to help people stream to Facebook](https://github.com/fbsamples/Canvas-Streaming-Example) which sadly was released under this license. Until we figure out a better alternative that allows us to fully release this software as GPL, we are including the license with the project.
