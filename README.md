# youparty

A web-based minimalist, distraction-free YouTube video player

## Description

[Demo](http://robertmaldon.github.io/demo/youparty/)

youparty is minimalist video player written in html/css/javascript. It uses the [YouTube javascript api](https://developers.google.com/youtube/js_api_reference) to load and play videos from YouTube. Videos are selected from curated play lists.

## Installation

The YouTube javascript api loads and manipulates a flash-based video player. The flash security model requires that flash player and the html/javascript that loads a flash player be served from an http server. Therefore you need to install the html/css/js/images on an http server.

If you want to test locally before deploying to a remote server, and you are developing on a Mac or Linux, then you can use the script dev/server.sh, which is a wrapper around Python's in-built SimpleHTTPServer (the "wrapper" sets HTTP cache headers to expire assets immediately):

    dev/server.sh

then simply point your browser at [http://localhost:8000/](http://localhost:8000/)

To get rid of YouTube ads you should install an ad blocker in your browser such as Adblock for Chrome or Adblock Plus for Firefox.

## Why did you choose the YouTube JavaScript API (which controls a Flash-based player)?

YouTube has a number of APIs to choose from, such as the [iframe api](https://developers.google.com/youtube/iframe_api_reference), the [javascript api](https://developers.google.com/youtube/js_api_reference) (which actually uses/manipluates a flash player) and the [flash api](https://developers.google.com/youtube/flash_api_reference).

At first glance the iframe api appears to be the best: it gives the opportunity for the browser to load either an html5 player or a flash player, depending on the capabilities of the browser. However, the videos served from this api have lots and lots of popups.

Videos served from the javascript api + a good ad blocker give almost distraction-free viewing of videos.

## Playlists

The playlists are currently configured in the playlists.js file. Feel free to add to it / modify it.

Each playlist is an array of song data tuples like the following:

    {
      "title": "Happiness (2010)",
      "artist": "Alexis Jordan",
      "vid": "26jKtELitQE",
      "start": 65
    },

where:
* "title" is the name of the song
* "artist" is the singer/band
* "vid" is the [YouTube video id](https://productforums.google.com/forum/#!topic/youtube/wv_aUD-QIvs).
* (Optional) "start" is the number of seconds into the video to start playing

## TODO

* Add the ability to load videos from a YouTube play list
* Allow users to define their own play lists and persist those list to a web-friend database such as FireBase

## License

[MIT license](LICENSE)

## Credits

As usual I stand on the shoulders of giants. youparty makes use of the following libraries:

* [jsUri](https://github.com/derek-watson/jsUri) - Uri parsing and manipulation

## Similar projects

* [yt_videos](http://www.sitepoint.com/youtube-rails/) presents recently uploaded YouTube videos pinterest-style. Uses the YouTube iframe api.
* [Youtube mixer](https://github.com/kristopolous/ytmix) grabs recently uploaded YouTube play lists and plays the songs while hiding the videos
* [The Nostalgia Machine](http://thenostalgiamachine.com/) is a curated collection of YouTube videos for songs from the Billboard Year-End Hot 100 singles charts.
* [YouTube Disco](https://www.youtube.com/disco) playlists for featured artists.
