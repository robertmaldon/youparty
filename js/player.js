var currentPlaylistIndex = -1;
var currentVidUrl;

var playerReady = false;

// Hide cursor after a period of inactivity
var cursorHidden = false;
var hideCursorTimer;

var progressTimer;

var PLAYLIST_DATA_NAME_INDEX  = 0;
var PLAYLIST_DATA_SONGS_INDEX = 1;

var WIDTH = 0;
var HEIGHT = 1;

function getPlayer() {
    return document.getElementById("player");
}

function calculatePlayerSize() {
    var w = $(window).width() - 80;
    var h = $(window).height() - 50;

    if ($("#playlists-container").is(':visible')) {
        w = w - $("#playlists-container").width();
    }

    return [w, h];
}

function initPlayer() {
    var swfUrl = 'http://www.youtube.com/apiplayer?enablejsapi=1&modestbranding=1&version=3&playerapiid=player';

    // allowScriptAccess must be set to allow the Javascript from one 
    // domain to access the swf on the youtube domain
    var params = { allowScriptAccess: "always", bgcolor: "#ffffff" };

    var flashvars = {};

    var playerSize = calculatePlayerSize();

    // This sets the ID of the DOM object or embed tag to 'player'.
    // You can use this ID to access the swf and call the player's API
    var atts = { id: "player" }; // 640 x 360
    swfobject.embedSWF(swfUrl, "player-placeholder", playerSize[WIDTH], playerSize[HEIGHT], "9", null, flashvars, params, atts);

    // Init the volume slider
    $("#volume-slider").noUiSlider({
        start: 50,
        step: 1,
        orientation: "vertical",
        direction: "rtl",
        connect: "lower",
        range: {
          'min': [   0 ],
          'max': [ 100 ]
        }
    });
}

function showPlaylists() {
    $("#controls-container").hide();

    $("#playlist").empty();
    for (var i = 0; i < allPlaylists.length; i++) {
        $("#playlist").append("<li onclick=\"showVideolist(" + i + ")\">" + allPlaylists[i][PLAYLIST_DATA_NAME_INDEX] + "</li>");
    }
    $("#playlist li:nth-child(" + (currentPlaylistIndex + 1) + ")").addClass("playing");

    $("#playlist li").hover(function() {
        $(this).addClass("hovering");
    }, function() {
        $(this).removeClass("hovering");
    });

    showVideolist(currentPlaylistIndex);

    resizePlaylists();
    $("#playlists-container").show();
}

function showVideolist(playlistIndex) {
    $("#playlist li").removeClass("selected");
    $("#playlist li:nth-child(" + (playlistIndex + 1) + ")").addClass("selected");

    $("#videolist").empty();

    var videolist = allPlaylists[playlistIndex][PLAYLIST_DATA_SONGS_INDEX];
    for (var j = 0; j < videolist.length; j++) {
        $("#videolist").append("<li onclick=\"loadVideo(" + playlistIndex + ", " + j + ")\">" + videolist[j]["title"] + "<br/>" + videolist[j]["artist"] + "</li>");
    }

    $("#videolist li").hover(function() {
        $(this).addClass("hovering");
    }, function() {
        $(this).removeClass("hovering");
    });

    if (playlistIndex == currentPlaylistIndex) {
        var player = document.getElementById("player");
        var currentVideoIndex = player.getPlaylistIndex();
        $("#videolist li:nth-child(" + (currentVideoIndex + 1) + ")").addClass("playing");
    }
}

function hidePlaylists() {
    if ($("#playlists-container").is(':visible')) {
        $("#playlists-container").hide(150, function() {
                $("#controls-container").show();
            }
        );
    }
}

function previousVideo() {
    var player = getPlayer();

    var currentPlaylist = player.getPlaylist();
    var currentVideo    = player.getPlaylistIndex();

    if (currentVideo == 0) {
        var previousPlaylist = currentPlaylistIndex - 1;
        if (previousPlaylist < 0) {
            previousPlaylist = allPlaylists.length - 1;
        }
        loadVideo(previousPlaylist, allPlaylists[previousPlaylist][PLAYLIST_DATA_SONGS_INDEX].length - 1);
    } else {
        player.previousVideo();
    }
}

function nextVideo() {
    var player = getPlayer();

    var currentPlaylist = player.getPlaylist();
    var currentVideo    = player.getPlaylistIndex();

    if (currentVideo == currentPlaylist.length - 1) {
        var nextPlaylist = currentPlaylistIndex + 1;
        if (nextPlaylist >= allPlaylists.length) {
            nextPlaylist = 0;
        }
        loadVideo(nextPlaylist, 0);
    } else {
        player.nextVideo();
    }
}

function loadVideo(playlistIndex, videoIndex) {
    hidePlaylists();

	var playlistVids = [];

    var playlistMetaData = allPlaylists[playlistIndex];

    var playlistData = playlistMetaData[PLAYLIST_DATA_SONGS_INDEX];
    for (var i = 0; i < playlistData.length; i++) {
        playlistVids.push(playlistData[i]["vid"]);
    }

    getPlayer().loadPlaylist(playlistVids, videoIndex);

    currentPlaylistIndex = playlistIndex;
}

function onYouTubePlayerReady(playerId) {
  	console.log("Player is ready! [" + playerId + "]");

  	getPlayer().addEventListener("onStateChange", "onYouTubePlayerEvent");

    if (!playerReady) {
        $(document).mousemove(showCursor);

        $("#player-overlay").click(playerClick);

  	    $("#show-playlists").click(showPlaylists);
        $("#hide-playlists").click(hidePlaylists);

        $("#pause").click(pauseVideo);
        $("#play").click(playVideo);
        $("#replay").click(replayVideo);
        $("#previous").click(previousVideo);
        $("#next").click(nextVideo);
        $("#mute").click(mute);
        $("#unmute").click(unmute);
        $("#volume-slider").on("slide", volumeChange);

        playerReady = true;
    }

    loadVideo(0, 0);
}

function hideCursor() {
    $("html").css({cursor: "url(images/transparent.png), default"});
    cursorHidden = true;
    hideCursorTimer = undefined;
    hideProgress();
}

function showCursor() {
    clearTimeout(hideCursorTimer);
    if (cursorHidden) {
        $("html").css({cursor: "default"});
        cursorHidden = false;
    }
    hideCursorTimer = setTimeout('hideCursor()', 5000);
    showProgress();
}

function pauseVideo() {
    getPlayer().pauseVideo();
}

function playVideo() {
    getPlayer().playVideo();
}

function replayVideo() {
    var player = getPlayer();
    player.seekTo(0, true);
    player.playVideo(); // Resume playing a video if it has been paused. If video is already playing then doing this has no effect.
}

function mute() {
    getPlayer().mute();
    $("#mute").hide();
    $("#unmute").show();
    $("#volume").hide();
}

function unmute() {
    getPlayer().unMute();
    $("#unmute").hide();
    $("#mute").show();
    $("#volume").show();
}

function volumeChange() {
    var volume = parseInt($("#volume-slider").val());
    getPlayer().setVolume(volume);
    $("#volume-label").html(volume + "%");
}

function playerClick() {
    if ($("#pause").is(":visible")) {
        pauseVideo();
    } else {
        playVideo();
    }
}

function showProgress() {
    $("#progress-slider-container").show();
}

function hideProgress() {
    $("#progress-slider-container").hide();
}

function formatProgressTime(time) {
    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;

    var formattedTime = "";
    if (minutes > 0) {
        formattedTime = minutes + ":";
        if (seconds < 10) {
            formattedTime = formattedTime + "0";
        }
    }

    formattedTime = formattedTime + seconds; 

    return formattedTime;
}

function updateProgress() {
    var player = getPlayer();
    var duration = parseInt(player.getDuration());
    var currentTime = parseInt(player.getCurrentTime());

    $("#progress-slider").val(currentTime);
    $("#progress-time").html(formatProgressTime(currentTime) + " / " + formatProgressTime(duration));
}

function changeProgress() {
    var progress = parseInt($("#progress-slider").val());
    getPlayer().seekTo(progress, true);    
}

function startProgress() {
    $("#progress-slider-container").append("<div id=\"progress-slider\"></div><span id=\"progress-time\"></span>");
    $("#progress-slider").noUiSlider({
            start: 0,
            step: 1,
            connect: "lower",
            range: {
              "min": [   0 ],
              "max": [ player.getDuration() ]
            }
    });
    $("#progress-slider").on("slide", changeProgress);
    progressTimer = setInterval(updateProgress, 1000);
}

function stopProgress() {
    clearTimeout(progressTimer);
    $("#progress-slider-container").empty();
    progressTimer = undefined;
}

function onYouTubePlayerEvent(event) {
    console.log("player event [" + event + "]");

    if (event == YT.PlayerState.PLAYING) {
        var player = getPlayer();
        var playlistIndex = player.getPlaylistIndex();

        var videoData = allPlaylists[currentPlaylistIndex][PLAYLIST_DATA_SONGS_INDEX][playlistIndex];
        $("#title").html(videoData["title"]);
        $("#artist").html(videoData["artist"]);

        if ($("#playlists-container").is(":visible")) {
            $("#playlist li").removeClass("playing");
            $("#playlist li:nth-child(" + (currentPlaylistIndex + 1) + ")").addClass("playing");
            if ($("#playlist li:nth-child(" + (currentPlaylistIndex + 1) + ")").hasClass("selected")) {
                $("#videolist li").removeClass("playing");
                var currentVideoIndex = player.getPlaylistIndex();
                $("#videolist li:nth-child(" + (currentVideoIndex + 1) + ")").addClass("playing");
            }
        }

        var vidUrl = player.getVideoUrl();
        if (vidUrl != currentVidUrl) {
            stopProgress();
            startProgress(vidUrl);
            currentVidUrl = vidUrl; 
        }    
    } else if (event == YT.PlayerState.ENDED) { // end of a playlist
        stopProgress();
        nextVideo();
    }

    manageControls(event);
}

function manageControls(event) {
    if (event == YT.PlayerState.PLAYING) {
        $("#play").hide();
        $("#pause").show();
        $("#replay").show();
        $("#next").show();
        $("#previous").show();

        var player = getPlayer();
        if (player.isMuted()) {
            $("#mute").hide();
            $("#unmute").show();
            $("#volume").hide();
        } else {
            $("#mute").show();
            $("#unmute").hide();
            var volume = player.getVolume();
            $("#volume-slider").val(volume);
            $("#volume-label").html(volume + "%");
            $("#volume").show();
        }
    } else if (event == YT.PlayerState.PAUSED) {
        $("#play").show();
        $("#pause").hide();
        $("#replay").show();
        $("#next").show();
        $("#previous").show();

        if (getPlayer().isMuted()) {
            $("#mute").hide();
            $("#unmute").show();
        } else {
            $("#mute").show();
            $("#unmute").hide();
        }
    } else {
        $("#play").hide();
        $("#pause").hide();
        $("#replay").hide();
        $("#next").hide();
        $("#previous").hide();
        $("#mute").hide();
        $("#unmute").hide();
        $("#volume").hide();
    }
}

function resizePlayer() {
    var player = $("#player");
    if (player.size() > 0) {
        var playerSize = calculatePlayerSize();
        player.animate({width: playerSize[WIDTH], height: playerSize[HEIGHT]}, 150, "swing", resizePlaylists);
    }
}

function resizePlaylists() {
    var height = $("#player-container").height();
    $("#playlists-container").css("height", height);
    $("#playlist-container").css("height", height);
    $("#videolist-container").css("height", height);
}

$(window).on("resize", function() {
    resizePlayer();
});

$(document).ready(function() {
    initPlayer();
});
