var TAG = "Player Widget";
var iwcClient;
var player;
var videourl; //NEEDED
var videoName; //NEEDED
var pictureurl; //NEEDED

var lasurl = "http://steen.informatik.rwth-aachen.de:9914/";
// var lasurl = "http://gentileschi.informatik.rwth-aachen.de:9914/";
var appCode = "vc";
var lasClient;
var duiClient;
var isWaitingForSession = false; //NEW ADDED
var playerState = null;
var allowSendGetLasInfo = true;
var isIPadLoggedIn = false;
var jump = false;
var playerCurrentTime = 0; //NEEDED

/***********************Cookie related******************************************/
var androidOnline = "false";
var ipadOnline = "false";

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
    return null;
}

function eraseCookie(c_name) {
    setCookie(c_name, "", -1);
}
/***********************Cookie related end ****************************************/

var lasFeedbackHandler = function(statusCode, message) {
    switch (statusCode) {
        case Enums.Feedback.Success:
        case Enums.Feedback.Error:
        case Enums.Feedback.PingError:
        case Enums.Feedback.InvocationSuccess:
        case Enums.Feedback.InvocationWorking:
        case Enums.Feedback.InvocationAbort:
        case Enums.Feedback.InvocationError:
        case Enums.Feedback.Success:
            // ignore above 
            break;
        case Enums.Feedback.LoginSuccess:
            //document.getElementById("output").innerHTML = message + "SESSION ID is: " +  lasClient.getSessionId(); 
            // maximize();
            onLogin();

            //	-------------------------------------------------------------------keli
            console.log(isWaitingForSession + "," + videourl + "," + videoName + "," + pictureurl);
            if (isWaitingForSession) {
                // $("#finjump").text("login");
                if (videourl != null && videoName != null && pictureurl != null) {
                    loadPlayer(videourl, videoName, pictureurl);
                    if (playerState == "PLAYING" && playerCurrentTime > 0) {
                        jump = true;
                        player.play(true);
                    }
                    isWaitingForSession = false;
                }
            } else {
                playerCurrentTime = getCookie("playerCurrentTime") == null ? 0 : getCookie("playerCurrentTime");
                if (playerCurrentTime > 0)
                    jump = true;
                if (videourl != null)
                    loadPlayer(videourl, videoName, pictureurl);
            }
            //	---------------------------------------------------------------------
            break;
        case Enums.Feedback.LogoutSuccess:
            onLogout();
            //minimize();
            break;
        case Enums.Feedback.LoginError:
            alert("Login failed! Message: " + message);
            document.getElementById("output").innerHTML = message;
            break;
        case Enums.Feedback.LogoutError:
            alert("Logout failed! Message: " + message);
            document.getElementById("output").innerHTML = message;
            break;
        case Enums.Feedback.Warning:
        case Enums.Feedback.PingSuccess:
            // just ignoring this one... 
            break;
        default:
            //ignore it.... 
            break;
    }

    console.log("Feedback: " + statusCode + ", " + message);

};

lasClient = new LasAjaxClient("sevianno", lasFeedbackHandler);

function minimize() {
    gadgets.window.adjustHeight(0);
}

function maximize(h) {
    var height = h || 250;
    gadgets.window.adjustHeight(height);
    console.log("Maximizing height to " + height);
}

function loadPlayer(videoURL, videoName, thumbnailURL) {
    console.log(videoURL + videoName);

    document.getElementById("videoName").innerHTML = videoName;
    $("#debug").text("setting up at time: " + playerCurrentTime);
    jwplayer("container").setup({
        autostart: false,
        width: "100%", 
				height: "90%",
        allowScriptAccess: "always",
        image: thumbnailURL,
        events: {
            onReady: function(evt) {
                console.log("Ready");
                //gadgets.window.adjustHeight();
            },
            onIdle: function(evt) {
                console.log("Stopped");
            },
            onBuffer: function(evt) {
                console.log("Buffering");
            },
            onPlay: function(evt) {
                if (jump) {
                    jump = false;
                    var time = playerCurrentTime;
                    setTimeout(function() {
                        player.seek(time);
                        $("#debug").text("seek time: " + time);
                    }, 1000);
                }
                console.log("Playing");
                var intent1 = {
                    "component": "",
                    "action": "ACTION_PLAY_VIDEO",
                    "data": videoURL,
                    "dataType": "text/html",
                    "flags": ["PUBLISH_GLOBAL"]
                };
                sendIntent(intent1);
            },
            onPause: function(evt) {
                console.log("Paused");

                var intent = {
                    "component": "",
                    "action": "ACTION_PAUSE",
                    "data": "http://tosini.informatik.rwth-aachen.de:8134/videos/KarlGrosse.mp4",
                    "dataType": "text/html",
                    "flags": ["PUBLISH_GLOBAL"]
                };
                sendIntent(intent);
            },
            onComplete: function(evt) {
                console.log("Finished");
                playerCurrentTime = 0;
                pos = 0;
                eraseCookie("playerCurrentTime");
                player.remove();
                loadPlayer(videoURL, videoName, thumbnailURL);
            },
            onTime: function(evt) {
                pos = Math.floor(evt.position);
                if (Math.abs(pos - playerCurrentTime) >= 1) {
                    setCookie("playerCurrentTime", pos, 10);
                    setAnnotations(pos);
                }
            }
        },
        file: videoURL // new in JWPlayer 6 
				/* works in JWPlayer 5
        modes: [{
                type: 'html5',
                config: {
                    file: videoURL
                }
            } //,
						*/

            //	{ type: "flash", 
            //			   src: "http://dbis.rwth-aachen.de/~nicolaescu/fw/widget/jwplayer/player.swf", 
            //			   config: { file: videoName, 
            //						 streamer: "rtmp://tosini.informatik.rwth-aachen.de/simplevideostreaming/_definst_/mp4", 
            //						 provider: "rtmp" } }

        /*] // works in JWPlayer 5*/
    });
    player = jwplayer();
}

function setAnnotations(pos) {
    time = "";
    intTime = "";

    time = getTimeFromPos(pos);

    playerCurrentTime = pos;
    console.log("second updated: " + pos);
    console.log("intTime: " + time);

    var intent = {
        "component": "",
        "action": "ACTION_SEND_SEARCH_ANNOTATIONS_AT_TIME",
        "data": "www.example.org",
        "dataType": "text/html",
        "flags": ["PUBLISH_GLOBAL"],
        "extras": {
            "time": time
        }
    };
    sendIntent(intent);
}

function getTimeFromPos(pos) {
    if (pos > 3600) {
        hour = Math.floor(pos / 3600);
        mins = 0;
        secs = 0;
        secs = pos % 3600;
        if (secs >= 60) {
            mins = Math.floor(secs / 60);
            secs = secs % 60;
        }
        if (hour < 10) {
            hour = "0" + hour;
        }
        if (mins < 10) {
            mins = "0" + mins;
        }
        if (secs < 10) {
            secs = "0" + secs;
        }
        time = hour + ":" + mins + ":" + secs;

    } else {
        mins = Math.floor(pos / 60);
        secs = pos % 60;

        if (mins < 10) {
            mins = "0" + mins;
        }
        if (secs < 10) {
            secs = "0" + secs;
        }
        time = mins + ":" + secs;

    }
    return time;
}

function isiPad() {
    // For use within iPad developer UIWebView
    var ua = navigator.userAgent;
    var isiPad = /iPad/i.test(ua) || /iPhone OS 3_1_2/i.test(ua) || /iPhone OS 3_2_2/i.test(ua);
    return isiPad;
}

function iwcCallback(intent) {
    console.log(TAG + "********************************************");
    console.log(intent);
    console.log("********************************************");
    //	var output = document.getElementById("output");
    //		var oldLog = output.innerHTML;
    //		output.innerHTML = oldLog + JSON.stringify(intent) + "<br/>";
    //		output.scrollTop = output.scrollHeight;


    if (intent.action == "ACTION_OPEN" && intent.dataType == "video/mp4" && intent.data != null) {
        //maximize();
        videourl = intent.data;
        pictureurl = intent.extras.thumbnail;
        // videoName = parseUrl(intent.data).file;
        videoName = intent.extras.videoName;
        playerCurrentTime = 0;
        loadPlayer(videourl, videoName, pictureurl);
        console.log("received video open event");
    }

    if (intent.action == "ACTION_START_VIDEO" && intent.dataType == "text/html") {
        //	if((jwplayer().getState()!="buffering")&&(jwplayer().getState()!="playing")&&(jwplayer().getState()!="idle")){

        player.play(true);
        //	}
        console.log("received video start event");
    }

    if (intent.action == "ACTION_PLAY_VIDEO" && intent.dataType == "text/html") {
        //&&(jwplayer().getState()!="idle")
        if ((player.getState() != "BUFFERING") && (player.getState() != "PLAYING")) {
            player.play(true);
        }
        console.log("received video start event");
    }


    if (intent.action == "ACTION_SEEK" && intent.dataType == "video/mp4" && intent.extras["position"] != null) {
        console.log("received video seek event");
        var time = intent.extras["position"];
        playerCurrentTime = time - 0.5;
        setAnnotations(time);
        player.seek(time);

    }

    if (intent.action == "ACTION_PAUSE" && intent.dataType == "text/html") {
        //console.log("received video pause event");
        if (player.getState() != "PAUSED") {
            player.pause(true);
        }
    }
    if (intent.action == "ACTION_ADD_DURATION" && intent.dataType == "text/html") {
        console.log("received request to set duration");
        // $('#setEndTimeButton').attr('disabled', false);
        // $('#setEndTimeButton').show();
    }

    /*
	if (intent.action=="ACTION_SEND_PLAYER_ON_IPAD" && intent.dataType == "text/html"){
		console.log("maximized the player on iPad");
		//jwplayer().callInternal("jwSetFullscreen",true);
		
			if (isiPad()){
			
				var my_params = {
					videoID : videourl,
					name : videoName,
					thumbnail : pictureurl
				};
			gotoCanvas(my_params);
			}
	}
	*/

    if (intent.action == "ACTION_SEND_PLAYER_ON_COMPUTER" && intent.dataType == "text/html") {
        console.log("minimized the player on iPad");
        // For use within normal web clients 
        if (!isiPad()) {
            maximize();
        }
    }

    if (intent.action == "ACTION_MOBILE_LOGGED_IN") {
        deviceType = intent.extras.mobileDevice;
        if (deviceType == "iPad") {
            if (!isiPad()) {
                $("#iPadPlayerOnline").show();
            }
        }
        if (deviceType == "android") {
            $("#androidPlayerOnline").show();
        }
    }

    if (intent.action == "ACTION_LOGIN" && intent.dataType == "text/html" && intent.data != null) {
        sessionId = intent.extras.sessionId;
        user = intent.extras.user;
        console.log("Sesssion ID in Player " + sessionId + "and user is" + user + "and las client is" + lasClient);
        lasClient.setCustomSessionData(sessionId, user, lasurl, appCode);
        //	lasClient.verifyStatus();
        //	console.log("logged in");

    }

    //-------------------------------------------------------------------------------------keli				
    if (intent.action == "LAS_INFO") {
        console.log("jwplayer: LAS_INFO.");
        allowSendGetLasInfo = false;
        if (lasClient.getStatus() != "loggedIn" && intent.extras != null && intent.extras.userName != null && intent.extras.session != null)
            lasClient.setCustomSessionData(intent.extras.session,
                intent.extras.userName,
                lasurl,
                appCode);
        return;
    }

    if (intent.action == "GET_LAS_INFO")
        allowSendGetLasInfo = false;

    if (intent.action == "RESTORE_LAS_SESSION") {
        if (lasClient.getStatus() == "loggedIn") {
            var userName = lasClient.getUsername();
            var sessionId = lasClient.getSessionId();
            var sessionInfo = {
                "userName": userName,
                "session": sessionId
            };
            var resIntent = {
                "action": "LAS_SESSION",
                "component": "",
                "data": "",
                "dataType": "",
                "extras": sessionInfo
            };
            duiClient.publishToUser(resIntent);
        }
    }

    if (intent.action == "ACTION_LOGOUT") {
        lasClient.logout();
        allowSendGetLasInfo = true;
    }
    //------------------------------------------------------------------------------------------


    if (intent.action == "ACTION_MOBILE_LOGGED_OUT") {
        deviceType = intent.extras.mobileDevice;

        if (deviceType == "iPad") {
            $("#iPadPlayerOnline").hide();
        }
        if (deviceType == "android") {
            $("#androidPlayerOnline").hide();
        }
    }

    if (intent.action == "ACTION_ANNOTATIONS_GET_TIME_PAUSE" && intent.dataType == "text/html") {

        player.pause(true);

        currentTime = player.getPosition();

        var intent = {
            "component": "",
            "action": "ACTION_RESPONSE_SEND_TIME",
            "data": "www.example.org",
            "dataType": "text/html",
            "flags": ["PUBLISH_GLOBAL"],
            "extras": {
                "position": currentTime
            }
        };
        sendIntent(intent);
        console.log("received video start event");

    }

}

function computeEndTime(startTime, durationH, durationM, durationS) {
    var startTimeElems = startTime.split(":");

    if ((startTimeElems[0]).substr(0, 1) == "0") {
        startTimeElems[0] = (startTimeElems[0]).substr(1);
    }
    if ((startTimeElems[1]).substr(0, 1) == "0") {
        startTimeElems[1] = (startTimeElems[1]).substr(1);
    }

    if ((durationH).substr(0, 1) == "0") {
        durationH = (durationH).substr(1);
    }
    if ((durationM).substr(0, 1) == "0") {
        durationM = (durationM).substr(1);
    }
    if ((durationS).substr(0, 1) == "0") {
        durationS = (durationS).substr(1);
    }

    if (startTimeElems.length == 3) {
        if ((startTimeElems[2]).substr(0, 1) == "0") {
            startTimeElems[2] = (startTimeElems[2]).substr(1);
        }

        endTimeSeconds = 3600 * (parseInt(startTimeElems[0]) + parseInt(durationH)) + 60 * (parseInt(startTimeElems[1]) + parseInt(durationM)) + parseInt(startTimeElems[2]) + parseInt(durationS);
    } else {
        endTimeSeconds = 60 * (parseInt(startTimeElems[0]) + parseInt(durationM)) + parseInt(startTimeElems[1]) + parseInt(durationS);
    }
    return getTimeFromPos(endTimeSeconds);



}


function parseUrl(data) {
    var e = /((http|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+\.[^#?\s]+)(#[\w\-]+)?/;

    if (data.match(e)) {
        return {
            file: RegExp.$6
        };
    } else {
        return {
            file: ""
        };
    }
}

function addEndTime() {

    player.pause(true);
    time = player.getPosition();

    var intent = {
        "component": "",
        "action": "ACTION_RESPONSE_SEND_ANNOTATION_END_TIME",
        "data": "www.example.org",
        "dataType": "text/html",
        "flags": ["PUBLISH_GLOBAL"],
        "extras": {
            "endTime": time
        }
    };
    // $('#setEndTimeButton').attr('disabled', true);
    // $('#setEndTimeButton').hide();
    sendIntent(intent);
    console.log("sent end time");
}

/*
		function sendPlayerOnIpad(){
				console.log("SENT PLAYER ON IPAD");
				var intent = {
						"component":"",					
						"action":"ACTION_SEND_PLAYER_ON_IPAD",
						"data":"www.example.org",
						"dataType":"text/html",
						"flags":["PUBLISH_GLOBAL"],
						"extras":{"videourl":videourl,"videoName":videoName,"pictureurl":pictureurl}
					};
					
										
					sendIntent(intent);
					minimize();
					console.log("received video start event");
		}
		*/



function navigateTo(dest, params) {

    var supported_views = gadgets.views.getSupportedViews();
    gadgets.views.requestNavigateTo(supported_views[dest], params);
};

/**
 * When called, this method asks the container to switch to the canvas
 */

function gotoCanvas(params) {
    navigateTo("canvas", params);
};

/**
 * When called, this method asks the container to switch to the home
 */

function gotoHome() {
    navigateTo("home");
};
//----------------------------------------------------------------keli	
var onUpdateState = function(intent) {
    // $("#onfinish").text("onupdate");
    var appStates = null;
    if (typeof intent.extras.appStates != "undefined") {
        appStates = intent.extras.appStates;
        if (typeof appStates.videourl != "undefined" && videourl != appStates.videourl) {
            videourl = appStates.videourl;
            pictureurl = appStates.pictureurl;
            videoName = parseUrl(videourl).file;
            isWaitingForSession = true;
            if (lasClient.getStatus() == "loggedIn") {
                isWaitingForSession = false;
                if (videourl != null)
                    loadPlayer(videourl, videoName, pictureurl);
                return;
            }
        }
    }
    if (lasClient.getStatus() != "loggedIn" && allowSendGetLasInfo) {
        var lasIntent = {
            "action": "GET_LAS_INFO",
            "component": "",
            "data": "",
            "dataType": "",
        };
        duiClient.publishToUser(lasIntent);
    }
};

var onFinishMig = function(intent) {
    var states = intent.extras.widgetStates;
    //TODO do sth. set params for continuous video playing

    videourl = states.videourl; //NEEDED
    videoName = states.videoName; //NEEDED
    pictureurl = states.pictureurl; //NEEDED
    playerCurrentTime = states.playerCurrentTime; //NEEDED
    playerState = states.playerState;
    isWaitingForSession = true;
    // $("#onfinish").text("finish mig time: " + playerCurrentTime);

    if (lasClient.getStatus() == "loggedIn") {
        console.log(isWaitingForSession + "," + videourl + "," + videoName + "," + pictureurl);
        if (videourl != null && videoName != null && pictureurl != null) {
            loadPlayer(videourl, videoName, pictureurl);
            if (playerState == "PLAYING" && playerCurrentTime > 0) {
                jump = true;
                // $("#finjump").text("wanna jump to time: " + playerCurrentTime);
                player.play(true);
            }
            isWaitingForSession = false;
        }
    } else {
        // $("#finjump1").text("notlogin");
        if (allowSendGetLasInfo) {
            var lasIntent = {
                "action": "GET_LAS_INFO",
                "component": "",
                "data": "",
                "dataType": "",
            };
            duiClient.publishToUser(lasIntent);
        }
    }
};

var getState = function(isForMig) {
    var state = {};
    if (isForMig) {
        //TODO collect the states for continuous migration
        state = {
            "videourl": videourl,
            "videoName": videoName,
            "pictureurl": pictureurl,
            "playerCurrentTime": player == null ? 0 : player.getPosition(),
            "playerState": player == null ? null : player.getState()
        };
        //console.log("jwplayer status is");
        //console.log(jwplayer()==null?"null":jwplayer().getState());
        if (player != null)
            player.stop();
    }
    return state;
};

var prepareMig = function() {
    //TODO do sth.
    eraseCookie("playerCurrentTime");
    duiClient.prepareMigDone();
};
//--------------------------------------------------------------------



function init() {
    //iwcClient = new iwc.Client(["*"]);

    //iwcClient.connect(iwcCallback);

    //minimize();
    gadgets.window.adjustHeight(250);

    //lasClient = new LasAjaxClient("sevianno",lasFeedbackHandler);
    //-----------------------------------------------------------------------------------keli				
    duiClient = new DUIClient();
    duiClient.connect(iwcCallback);
    duiClient.finishMigration = onFinishMig;
    duiClient.getWidgetState = getState;
    duiClient.prepareMigration = prepareMig;
    //	duiClient.changeWithApp
    duiClient.updateState = onUpdateState;
    duiClient.initOK();
    //-------------------------------------------------------------------------------------	 
    lasClient.verifyStatus();
    if (lasClient.getStatus() != "loggedIn") {
        onLogout();
    }
}


function sendIntent(intent) {
    if (iwc.util.validateIntent(intent)) {
        duiClient.sendIntent(intent);
    } else {
        alert("Intent not valid!");
    }
}

function onLogin() {
    document.getElementsByClassName("fadeMe")[0].setAttribute("style", "display:none");
}

function onLogout() {
    document.getElementsByClassName("fadeMe")[0].setAttribute("style", "display:block");
    if ( !! player)
        player.pause();
}

gadgets.util.registerOnLoadHandler(init);
/*
var adjustWidgetHeightOnResize = function() {
	// console.log(document.width);
	//gadgets.window.adjustHeight(document.width-100);
	// var newHeight = Math.ceil(250 * (1 + (document.width - 292) / document.width)); //adjust to the same ratio 
	var newHeight = Math.ceil(250  + 15/28 * (document.width - 292));
	// newHeight += 30; //plus add 23px for the header
	// newHeight = Math.max(280, newHeight);
	if (newHeight < 260) {
		newHeight = 280;
	} 
	$(this.frameElement.parentNode.parentNode).height(newHeight);
	console.log("Document height: " + document.width);
	console.log("Widget wrapper height: " + newHeight);
	// gadgets.window.adjustHeight();
}

window.addEventListener('resize', adjustWidgetHeightOnResize, false);*/
