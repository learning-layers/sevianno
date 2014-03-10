var TAG = "Video List";
var lasurl = "http://steen.informatik.rwth-aachen.de:9914/";
// var lasurl = "http://gentileschi.informatik.rwth-aachen.de:9914/";
var appCode = "vc";
var allowSendGetLasInfo = true;
var iwcClient;
var duiClient;
// var sevianno;

// OpenApp: space as a resource
// var space = new openapp.oo.Resource(openapp.param.space());

//------------------------------------------------------------------------------------keli
var onUpdateState = function(intent) {
    onFinishMig(intent);
};

var onFinishMig = function(intent) {
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
//---------------------------------------------------------------------------------------	

function init() {
    //iwcClient = new iwc.Client(["*"]);

    //iwcClient.connect(iwcCallback);
    //	lasClient.login(lasurl, appCode); 
    //-----------------------------------------------------------------------------------keli	
    duiClient = new DUIClient();
    duiClient.connect(iwcCallback);
    duiClient.finishMigration = onFinishMig;
    //	duiClient.getWidgetState
    //	duiClient.prepareMigration
    //	duiClient.changeWithApp
    duiClient.updateState = onUpdateState;
    duiClient.initOK();
    //-------------------------------------------------------------------------------------			
    // minimize();
    // sevianno = new Sevianno(space);

    lasClient.verifyStatus();
    if (lasClient.getStatus() != "loggedIn") {
        onLogout();
    }


		// init search field
		$("#searchField").keyup(
			function (){
				var s = $("#searchField").val();
				buildAllVideos(videoURLs, thumbnailsURLs, s);
			}
		);

}


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
        case Enums.Feedback.LoginSuccess: //alert("Logged in successfully!");
            onLogin();
            idsArray = getMpeg7MediaIds();
            //document.getElementById("output").innerHTML = message + "SESSION ID is: " +  lasClient.getSessionId(); 
            // maximize();
            break;
        case Enums.Feedback.LogoutSuccess: //alert("Logged out successfully!"); 
            //minimize();
            onLogout();
            break;
        case Enums.Feedback.LoginError:
            alert("Login failed! Message: " + message);
            //document.getElementById("output").innerHTML = message; 
            break;
        case Enums.Feedback.LogoutError:
            alert("Logout failed! Message: " + message);
            //document.getElementById("output").innerHTML = message; 
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

var lasClient = new LasAjaxClient("sevianno", lasFeedbackHandler);

function sendIntent(intent) {
    if (iwc.util.validateIntent(intent)) {
        duiClient.sendIntent(intent);
    } else {
        alert("Intent not valid!");
    }
}


function iwcCallback(intent) {
    console.log("********************************************");
    console.log(intent);
    console.log("********************************************");
    //	var output = document.getElementById("output");
    //		var oldLog = output.innerHTML;
    //		output.innerHTML = oldLog + JSON.stringify(intent) + "<br/>";
    //		output.scrollTop = output.scrollHeight;

    /*			
				if(intent.action == "ACTION_LOGIN" && intent.dataType == "text/html" && intent.data != null){
					sessionId = intent.extras.sessionId.value;
					console.log("Sesssion ID in all Movies "+sessionId);
					lasClient.verifyStatus();
					console.log("logged in");
					
				}
				*/

    if (intent.action == "ADDED_TO_MPEG7" && intent.data != null) {
        newlyUploadedId = intent.extras.videoURL;
        //alert(newlyUploadedId);
        console.log(newlyUploadedId);
        addUploadedVideoToList(newlyUploadedId);

    }


    if (intent.action == "ACTION_LOGOUT" && intent.dataType == "text/html" && intent.data != null) {
        lasClient.logout();
        console.log("logged out");
        allowSendGetLasInfo = true;
    }
    //-------------------------------------------------------------------------------------keli				
    if (intent.action == "LAS_INFO") {
        console.log("allmovies: LAS_INFO.");
        allowSendGetLasInfo = false;
        if (lasClient.getStatus != "loggedIn" && intent.extras != null && intent.extras.userName != null && intent.extras.session != null)
            lasClient.setCustomSessionData(intent.extras.session, intent.extras.userName, lasurl, appCode);
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


    //------------------------------------------------------------------------------------------	
}

function getMpeg7MediaIds() {
	videoURLs = null;
	thumbnailsURLs = null;
	videoNames = new Array();
	uploaderNames = new Array();
    serviceName = "mpeg7_multimediacontent_service";
    methodName2 = "getMediaURLs";
    uploader = "uploader"
    parametersAsJSONArray = new Array();
    console.log(lasClient);
    lasClient.invoke(serviceName, methodName2, parametersAsJSONArray, getMpeg7MediaIdsHandler);
}



function sendVideoInformation(id) {

    var title = $('img[name="' + id + '"]').attr("alt");
    var thumbnail = $('img[name="' + id + '"]').attr("src");

    var intent = {
        "component": "",
        "action": "ACTION_OPEN",
        "data": id,
        "dataType": "video/mp4",
        "flags": ["PUBLISH_GLOBAL"],
        "extras": {
            "videoUrl": id,
            "thumbnail": thumbnail,
            "videoName": title
        }
    };
    sendIntent(intent);
    duiClient.setAppState({
        "videourl": id,
        "pictureurl": thumbnail
    });
    // sevianno.setAppState({"id":id});

    /* it doesn't work */
    // save video id in app data
    // var req = opensocial.newDataRequest();
    // req.add(
    // req.newUpdatePersonAppDataRequest("VIEWER", "videoId", id),
    // "set_data");
    // req.send(setAppDataCallback);
}

// function setAppDataCallback(response) {
// if (response.get("set_data").hadError()) {
// /* The update failed ... insert code to handle the error */
// console.log(TAG + ": saving app data failed!");
// } else {
// /* The update was successful ... continue execution */
// console.log(TAG + ": saving app data succeeded!");
// };
// };

var videoURLs;
var thumbnailsURLs;
var videoNames = new Array();
var uploaderNames = new Array();

function getMpeg7MediaIdsHandler(status, result) {
    videoURLs = result.value;
    if (status == '200') {
        console.log(videoURLs);
        getThumbnails(videoURLs);
    }
	var s = $("#searchField").val();
	buildAllVideos(videoURLs, thumbnailsURLs, s);
}

// Parameter $search is optional
function buildAllVideos(videoURLs, thumbnailsURLs, search) {
		$("#myCarousel").empty();
		var count = 0;
    for (i = videoURLs.length - 1; i >= 0; i--) {
				if(search === undefined || search === null || (""+videoNames[i]).toLowerCase().search((""+search).toLowerCase())>-1){
								$("#myCarousel").append('<li> <span> <a href="#" id="' + videoURLs[i] + '" onclick=sendVideoInformation(id)><img name="' + videoURLs[i] + '" alt="' + videoNames[i] + '" width ="200" src="' + thumbnailsURLs[i] + '" /> </a> <br/> <b>' + videoNames[i] + '</b> <br/> Uploaded by "' + uploaderNames[i] + '" <br/> <a href="#" id="' + videoURLs[i] + 'XX" onclick=removeVideo(id)>remove</a></span></li>');
								count++;
				}
    }
    $("#numberOfAvailableVideos").html(count);
}

function getThumbnails(videoURLs) {
    //	alert(videoURLs[i]);
    serviceName = "mpeg7_multimediacontent_service";
    methodName2 = "getVideoThumbnails";
    parametersAsJSONArray = new Array();

    parametersAsJSONArray[0] = {
        "type": "String[]",
        "value": videoURLs
    };

    console.log(lasClient);
    lasClient.invoke(serviceName, methodName2, parametersAsJSONArray, getThumbnailfromURLHandler);
}



function getThumbnailfromURLHandler(status, result) {
    if (status == '200') {
        console.log(result);
        thumbnailsURLs = result.value;
        //getting the titles and uploaders of all the media uris
        serviceName = "mpeg7_multimediacontent_service";
        methodName2 = "getMediaCreationTitles";
        //uploader = "uploader"
        parametersAsJSONArray = new Array();
        parametersAsJSONArray[0] = {
            "type": "String[]",
            "value": videoURLs
        };
        console.log("GET THE TITLES");
        var videoNameTemp;
        lasClient.invoke(serviceName, methodName2, parametersAsJSONArray, function(status, response) {
            if (status == 200) {
                videoNamesUploaders = response.value;

                for (i = 0; i < videoNamesUploaders.length; i++) {
                    var videoName = (videoNamesUploaders[i].split("####"))[0];
                    var uploaderName = (videoNamesUploaders[i].split("####"))[1];
                    videoNames.push(videoName);
                    uploaderNames.push(uploaderName);
                }

                buildAllVideos(videoURLs, thumbnailsURLs);
            } else {
                alert("An error occured while getting the names and uploaders of the given media URIs");
            }

        });

    }

}

function addUploadedVideoToList(newlyUploadedId) {

    serviceName = "mpeg7_multimediacontent_service";
    methodName2 = "getVideoThumbnailUploaderTitle";
    parametersAsJSONArray = new Array();
    videoURLs.push(newlyUploadedId);
    parametersAsJSONArray[0] = {
        "type": "String",
        "value": newlyUploadedId
    };

    lasClient.invoke(serviceName, methodName2, parametersAsJSONArray, addNewlyUploadedVideoHandler);



}

function addNewlyUploadedVideoHandler(status, result) {
    if (status == '200') {
        console.log(result);
        videoExtraInformation = result.value;
        thumbnailsURLs.push(videoExtraInformation[0]);
        videoNames.push(videoExtraInformation[2]);
        uploaderNames.push(videoExtraInformation[1]);
        $("#numberOfAvailableVideos").empty();
        $("#myCarousel").empty();
        buildAllVideos(videoURLs, thumbnailsURLs);
    }
}

function removeVideo(id) {
    var strippedId = id.substring(0, id.length - 2);
    serviceName = "mpeg7_multimediacontent_service";
    methodName2 = "removeMediaDescription";
    parametersAsJSONArray = new Array();
    parametersAsJSONArray[0] = {
        "type": "String",
        "value": strippedId
    };

    // remove video from list
/*    var index_rem = videoURLs.indexOf(strippedId);
    videoURLs.remove(index_rem);
    $("#searchField").val("");
	buildAllVideos(videoURLs, thumbnailsURLs, s);*/

    document.getElementsByClassName("fadeMe")[0].setAttribute("style", "display:block");
    lasClient.invoke(serviceName, methodName2, parametersAsJSONArray, removeVideoHandler);
}

function removeVideoHandler(status, result) {
    console.log(status);
    console.log(result);
    if(status == '200'){
    	getMpeg7MediaIds();
    	document.getElementsByClassName("fadeMe")[0].setAttribute("style", "display:none");
    }
}

function minimize() {
    gadgets.window.adjustHeight(0);
};

function maximize() {
    gadgets.window.adjustHeight(400);
};

function onLogin() {
    document.getElementsByClassName("fadeMe")[0].setAttribute("style", "display:none");
}

function onLogout() {
    console.log("on logout. login status:" + lasClient.getStatus());
    document.getElementsByClassName("fadeMe")[0].setAttribute("style", "display:block");
    videoURLs = null;
    thumbnailsURLs = null;
    videoNames = Array();
    uploaderNames = Array();
}

gadgets.util.registerOnLoadHandler(init);
