var currentPlaylistIndex = -1;
var currentVideolistIndex = -1;

var playerReady = false;

var replayVideo = false;

var hideControlsTimeout;

var playerUnstartedTimer;

// Hide cursor after a period of inactivity
var cursorHidden = false;
var hideCursorTimer;

var progressTimer;
var currentVidUrl;

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

function getVideolist(playlistIndex) {
    return allPlaylists[playlistIndex][PLAYLIST_DATA_SONGS_INDEX];
}

function showPlaylists() {
    hideControls();

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

    var videolist = getVideolist(playlistIndex);
    for (var j = 0; j < videolist.length; j++) {
        $("#videolist").append("<li onclick=\"loadVideo(" + playlistIndex + ", " + j + ")\">" + videolist[j]["title"] + "<br/>" + videolist[j]["artist"] + "</li>");
    }

    $("#videolist li").hover(function() {
        $(this).addClass("hovering");
    }, function() {
        $(this).removeClass("hovering");
    });

    if (playlistIndex == currentPlaylistIndex) {
        $("#videolist li:nth-child(" + (currentVideolistIndex + 1) + ")").addClass("playing");
    }
}

function hidePlaylists() {
    $("#playlists-container").hide();
}

function previousVideo() {
    var previousPlaylistIndex = currentPlaylistIndex;
    var previousVideolistIndex = currentVideolistIndex;

    previousVideolistIndex = previousVideolistIndex - 1;

    if (previousVideolistIndex < 0) {
        previousPlaylistIndex = previousPlaylistIndex - 1;
        if (previousPlaylistIndex < 0) {
            previousPlaylistIndex = allPlaylists.length - 1;
        }

        previousVideolistIndex = getVideolist(previousPlaylistIndex).length - 1;
    }

    loadVideo(previousPlaylistIndex, previousVideolistIndex);    
}

function nextVideo() {
    var nextPlaylistIndex = currentPlaylistIndex;
    var nextVideolistIndex = currentVideolistIndex;

    nextVideolistIndex = nextVideolistIndex + 1

    if (nextVideolistIndex >= getVideolist(nextPlaylistIndex).length) {
        nextVideolistIndex = 0;

        nextPlaylistIndex = nextPlaylistIndex + 1;
        if (nextPlaylistIndex >= allPlaylists.length) {
            nextPlaylistIndex = 0;
        }
    }

    loadVideo(nextPlaylistIndex, nextVideolistIndex);
}

function loadVideo(playlistIndex, videolistIndex) {
    hidePlaylists();

    var videoData = getVideolist(playlistIndex)[videolistIndex];
    var start = videoData["start"] || 0;
    var end = videoData["end"];

    if (end == null) {
        getPlayer().loadVideoById(videoData["vid"], start);
    } else {
        getPlayer().loadVideoById(videoData["vid"], start, end);
    }

    currentPlaylistIndex  = playlistIndex;
    currentVideolistIndex = videolistIndex;

    var uri = new Uri(window.location.href);
    uri.replaceQueryParam("pl", currentPlaylistIndex.toString());
    uri.replaceQueryParam("vl", currentVideolistIndex.toString());

    history.replaceState(null, null, uri.toString());
}

function onYouTubePlayerReady(playerId) {
  	console.log("Player is ready! [" + playerId + "]");

  	getPlayer().addEventListener("onStateChange", "onYouTubePlayerEvent");

    if (!playerReady) {
        $(document).mousemove(showCursor);
        $(document).mousemove(showControls);

        $("#player-overlay").click(playerClick);

  	    $("#show-playlists").click(showPlaylists);
        $("#hide-playlists").click(hidePlaylists);

        $("#pause").click(pauseVideo);
        $("#play").click(playVideo);
        $("#replay").click(toggleReplayVideo);
        $("#previous").click(previousVideo);
        $("#next").click(nextVideo);
        $("#mute").click(mute);
        $("#unmute").click(unmute);
        $("#volume-slider").on("slide", volumeChange);

        playerReady = true;
    }

    var uri = new Uri(window.location.href);
    var playlistIndex = uri.getQueryParamValue("pl") || 0;
    var videolistIndex = uri.getQueryParamValue("vl") || 0;

    loadVideo(parseInt(playlistIndex), parseInt(videolistIndex));
}

function hideCursor() {
    $("html").css({cursor: "url(images/transparent.png), default"});
    cursorHidden = true;
    hideCursorTimer = null;
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

function hideControls() {
    $("#controls-container").hide();
}

function showControls(event) {
    if ((!$("#playlists-container").is(':visible') && event.pageX < 20) || $("#controls-container").is(':hover')) {
        // Show the controls if mouse is within 20 pixels from the left or we are hovering over it
        clearTimeout(hideControlsTimeout);
        hideControlsTimeout = null;
        $("#controls-container").show();
    } else if (!hideControlsTimeout) {
        hideControlsTimeout = setTimeout(hideControls, 2000);
    }
}

function pauseVideo() {
    getPlayer().pauseVideo();
}

function playVideo() {
    getPlayer().playVideo();
}

function toggleReplayVideo() {
    if (replayVideo) {
        $("#replay").attr("src", "images/replay.png");
        replayVideo = false;
    } else {
        $("#replay").attr("src", "images/replay-active.png");
        replayVideo = true;
    }
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
    progressTimer = null;
}

function stopUnstarted() {
    clearTimeout(playerUnstartedTimer);
    playerUnstartedTimer = null;
}

// Called when a video has not started after a given time
function unstarted() {
    stopUnstarted();
    nextVideo();
}

function onYouTubePlayerEvent(event) {
    console.log("player event [" + event + "]");

    if (event == YT.PlayerState.PLAYING) {
        stopUnstarted();

        var videoData = getVideolist(currentPlaylistIndex)[currentVideolistIndex];
        $("#title").html(videoData["title"]);
        $("#artist").html(videoData["artist"]);

        if ($("#playlists-container").is(":visible")) {
            $("#playlist li").removeClass("playing");
            $("#playlist li:nth-child(" + (currentPlaylistIndex + 1) + ")").addClass("playing");
            if ($("#playlist li:nth-child(" + (currentPlaylistIndex + 1) + ")").hasClass("selected")) {
                $("#videolist li").removeClass("playing");
                $("#videolist li:nth-child(" + (currentVideolistIndex + 1) + ")").addClass("playing");
            }
        }

        var vidUrl = getPlayer().getVideoUrl();
        if (vidUrl != currentVidUrl) {
            stopProgress();
            startProgress(vidUrl);
            currentVidUrl = vidUrl; 
        }    
    } else if (event == YT.PlayerState.ENDED) { // end of a playlist
        stopProgress();
        if (replayVideo) {
            currentVidUrl = null;
            loadVideo(currentPlaylistIndex, currentVideolistIndex);
        } else {
            nextVideo();
        }
    } else if (event == -1) {
        stopUnstarted();
        stopProgress();
        playerUnstartedTimer = setTimeout('unstarted()', 7000);
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
