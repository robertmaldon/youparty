var currentPlaylistIndex = -1;

var playerReady = false;

var PLAYLIST_DATA_NAME_INDEX  = 0;
var PLAYLIST_DATA_SONGS_INDEX = 1;

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
    swfobject.embedSWF(swfUrl, "player-placeholder", playerSize[0], playerSize[1], "9", null, flashvars, params, atts);   	
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

    $("#playlists-container").show();

    resizePlayer(); 
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
                resizePlayer();
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
  	    $("#show-playlists").click(showPlaylists);
        $("#hide-playlists").click(hidePlaylists);

        $("#pause").click(pauseVideo);
        $("#play").click(playVideo);
        $("#replay").click(replayVideo);
        $("#previous").click(previousVideo);
        $("#next").click(nextVideo);
        $("#mute").click(mute);
        $("#unmute").click(unmute);

        playerReady = true;
    }

    loadVideo(0, 0);
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
}

function unmute() {
    getPlayer().unMute();
    $("#unmute").hide();
    $("#mute").show();
}

function onYouTubePlayerEvent(event) {
    console.log("player event [" + event + "]");

    if (event == YT.PlayerState.PLAYING) {
        var player = getPlayer();
        var playlistIndex = player.getPlaylistIndex();

        var videoData = allPlaylists[currentPlaylistIndex][PLAYLIST_DATA_SONGS_INDEX][playlistIndex];
        $("#title").html(videoData["title"]);
        $("#artist").html(videoData["artist"]);

        if ($("#playlists-container").is(':visible')) {
            $("#playlist li").removeClass("playing");
            $("#playlist li:nth-child(" + (currentPlaylistIndex + 1) + ")").addClass("playing");
            if ($("#playlist li:nth-child(" + (currentPlaylistIndex + 1) + ")").hasClass("selected")) {
                $("#videolist li").removeClass("playing");
                var currentVideoIndex = player.getPlaylistIndex();
                $("#videolist li:nth-child(" + (currentVideoIndex + 1) + ")").addClass("playing");
            }
        }
    } else if (event == YT.PlayerState.ENDED) { // end of a playlist
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

        if (getPlayer().isMuted()) {
            $("#mute").hide();
            $("#unmute").show();
        } else {
            $("#mute").show();
            $("#unmute").hide();
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
    }
}

function resizePlayer() {
    var player = $("#player");
    if (player.size() > 0) {
        var playerSize = calculatePlayerSize();
        player.animate({width: playerSize[0], height: playerSize[1]}, 150);
    }

    if ($("#playlists-container").is(':visible')) {
        $("#playlist-container").css({height: $(window).height() - 50});
        $("#videolist-container").css({height: $(window).height() - 50});
    }
}

$(window).on("resize", function() {
    resizePlayer();
});

$(document).ready(function() {
    initPlayer();
});
