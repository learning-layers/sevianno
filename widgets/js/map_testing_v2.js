var TAG = "Map Widget"
var iwcClient;
var lasurl = "http://steen.informatik.rwth-aachen.de:9914/";
// var lasurl = "http://gentileschi.informatik.rwth-aachen.de:9914/";
var appCode = "vc";
var duiClient;
var allowSendGetLasInfo = true;
var map;
var geocoder;
var placeTags = []; //added
var videourl = null; //added
var isMig = false;
var isActive = true;
var isInit = true;

var markersArray = [];

var lat_in = 0;
var lng_in = 0;
var zoom_in = 0;

var arrayTags;

var currentTime = 0;
var placeName = "";

var tmpMarkerArray = [];

var lasClient;

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

		// var idspec = opensocial.newIdSpec({ "userId" : "VIEWER", "groupId" : "SELF" });
		// var req = opensocial.newDataRequest();
		// req.add(req.newFetchPersonRequest("VIEWER"), "oViewer");
		// req.add(
		// req.newFetchPersonAppDataRequest(idspec, "videoId"),
		// "get_data");
		// req.send(getAppDataCallback);

		if (isMig) {
			isMig = false;
			if (videourl != null) {
				serviceName = "mpeg7_multimediacontent_service";
				methodName = "getAudioVisualSegments";
				parametersAsJSONArray = new Array();
				parametersAsJSONArray[0] = {
					"type" : "String",
					"value" : videourl
				};
				lasClient.invoke(serviceName, methodName,
						parametersAsJSONArray, getAudioVisualSegmentsHandler);
			}
		}
		//	document.getElementById("output").innerHTML = message + "SESSION ID is: " +  lasClient.getSessionId();
		//maximize();
		break;
	case Enums.Feedback.LogoutSuccess: //alert("Logged out successfully!");
		//	minimize();
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
	//alert("Feedback: " + statusCode + ", " + message);
};

lasClient = new LasAjaxClient("sevianno", lasFeedbackHandler);

//------------------------------------------------------------------------------------keli
var onUpdateState = function(intent) {
	var appStates = null;
	if (typeof intent.extras.appStates != "undefined") {
		appStates = intent.extras.appStates;
		if (typeof appStates.videourl != "undefined"
				&& videourl != appStates.videourl) {
			videourl = appStates.videourl;
			isMig = true;
			if (lasClient.getStatus() == "loggedIn") {
				isMig = false;
				if (videourl != null) {
					serviceName = "mpeg7_multimediacontent_service";
					methodName = "getAudioVisualSegments";
					parametersAsJSONArray = new Array();
					parametersAsJSONArray[0] = {
						"type" : "String",
						"value" : videourl
					};
					lasClient.invoke(serviceName, methodName,
							parametersAsJSONArray,
							getAudioVisualSegmentsHandler);
				}
				return;
			}
		}
	}
	if (lasClient.getStatus() != "loggedIn" && allowSendGetLasInfo) {
		var lasIntent = {
			"action" : "GET_LAS_INFO",
			"component" : "",
			"data" : "",
			"dataType" : "",
		};
		duiClient.publishToUser(lasIntent);
	}
};

var onFinishMig = function(intent) {
	var states = intent.extras.widgetStates;
	videourl = states.videourl;
	isMig = true;
	if (lasClient.getStatus() == "loggedIn") {
		isMig = false;
		if (videourl != null) {
			serviceName = "mpeg7_multimediacontent_service";
			methodName = "getAudioVisualSegments";
			parametersAsJSONArray = new Array();
			parametersAsJSONArray[0] = {
				"type" : "String",
				"value" : videourl
			};
			lasClient.invoke(serviceName, methodName, parametersAsJSONArray,
					getAudioVisualSegmentsHandler);
		}
	} else if (allowSendGetLasInfo) {
		var lasIntent = {
			"action" : "GET_LAS_INFO",
			"component" : "",
			"data" : "",
			"dataType" : "",
		};
		duiClient.publishToUser(lasIntent);
	}
};

var getState = function(isForMig) {
	var state = {
		"videourl" : videourl
	};
	return state;
};
//---------------------------------------------------------------------------------------

function init() {
	//-----------------------------------------------------------------------------------keli
	duiClient = new DUIClient();
	duiClient.connect(iwcCallback);
	duiClient.finishMigration = onFinishMig;
	duiClient.getWidgetState = getState;
	duiClient.updateState = onUpdateState;
	//	duiClient.prepareMigration
	//	duiClient.changeWithApp

	//-------------------------------------------------------------------------------------
	var myLatlng = new google.maps.LatLng(50.801216, 6.479573);
	//var myLatlng2 = new google.maps.LatLng(-25.363882,131.044922);
	//var myLatlng3 = new google.maps.LatLng(-25.363882,-131.044922);
	var myOptions = {
		zoom : 1,
		center : myLatlng,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	adjustMapOnResize();
	//GEOCODER
	geocoder = new google.maps.Geocoder();
	/*
	google.maps.event.addListener(map, 'zoom_changed', function() {
	
	//setTimeout(mapParSend,1);
	if (isActive==true)
	mapParSend();
	});
	google.maps.event.addListener(map, 'dragend', function() {
	
	//setTimeout(mapParSend,1);
	if (isActive==true)
	mapParSend();
	});
	 */

	// On right click save the annoation at that point
	google.maps.event.addListener(map, 'rightclick', function(event) {
		mapAnnotate(event.latLng);
	});

	//duiClient.getAppState();

	//	minimize();
	//-----------------------------------------------------------------------------------keli
	duiClient.initOK();
	//-------------------------------------------------------------------------------------

	console.log("retrieving app data");
	lasClient.verifyStatus();
	if (lasClient.getStatus() != "loggedIn") {
		onLogout();
	}
}

var iwcCallback = function(intent) {
	console.log(TAG + "********************************************");
	console.log(intent);
	console.log("********************************************");

	//-------------------------------------------------------------------------------------keli
	if (intent.action == "LAS_INFO") {
		console.log("allmovies: LAS_INFO.");
		allowSendGetLasInfo = false;
		if (lasClient.getStatus() != "loggedIn" && intent.extras != null
				&& intent.extras.userName != null
				&& intent.extras.session != null)
			lasClient.setCustomSessionData(intent.extras.session,
					intent.extras.userName, lasurl, appCode);
		return;
	}
	if (intent.action == "GET_LAS_INFO")
		allowSendGetLasInfo = false;

	if (intent.action == "ACTION_LOGOUT") {
		lasClient.logout();
		allowSendGetLasInfo = true;
	}

	if (intent.action == "RESTORE_LAS_SESSION") {
		if (lasClient.getStatus() == "loggedIn") {
			var userName = lasClient.getUsername();
			var sessionId = lasClient.getSessionId();
			var sessionInfo = {
				"userName" : userName,
				"session" : sessionId
			};
			var resIntent = {
				"action" : "LAS_SESSION",
				"component" : "",
				"data" : "",
				"dataType" : "",
				"extras" : sessionInfo
			};
			duiClient.publishToUser(resIntent);
		}
	}

	if (intent.action == "ACTION_OPEN" && intent.dataType == "video/mp4"
			&& intent.data != null) {
		// maximize();
		videourl = intent.data;
		isMig = true;
		clearOverlays();
		clearOverlays_tmp();
		if (lasClient.getStatus() == "loggedIn") {
			isMig = false;
			serviceName = "mpeg7_multimediacontent_service";
			methodName = "getAudioVisualSegments";
			parametersAsJSONArray = new Array();
			parametersAsJSONArray[0] = {
				"type" : "String",
				"value" : videourl
			};
			lasClient.invoke(serviceName, methodName, parametersAsJSONArray,
					getAudioVisualSegmentsHandler);
		} else if (allowSendGetLasInfo) {
			var lasIntent = {
				"action" : "GET_LAS_INFO",
				"component" : "",
				"data" : "",
				"dataType" : "",
			};
			duiClient.publishToUser(lasIntent);
		}
	}

	//------------------------------------------------------------------------------------------

	if (intent.action == "ACTIVATE_TABLET" && intent.dataType == "text/html") {
		isActive = false;
	}
	if (intent.action == "DEACTIVATE_TABLET" && intent.dataType == "text/html") {
		isActive = true;
	}

	if (intent.action == "ACTION_RESPONSE_SEND_TIME"
			&& intent.dataType == "text/html") {
		currentTime = intent.extras.position;
	}
	//	if (rcv_data.data_type == "PlaceTagResponse")
	//	var rcv_data = JSON.parse(intent.data);
	//	annotateMap(rcv_data);

	if (intent.action == "ACTION_PLACETAGS") {
		var mapids = intent.extras;
		var rcv_data = {};
		var tags = [];
		for (var i = 0; i < mapids.length; i++) {
			for (var j = 0; j < placeTags.length; j++)
				if (placeTags[j].id == mapids[i]) {
					tags.push(placeTags[j]);
					break;
				}
		}
		rcv_data["tags"] = tags;
		arrayTags = rcv_data;
		if (rcv_data["tags"].length > 0) {
			setMarkers0(rcv_data);
		}
	}

	if (intent.action == "ACTION_FOCUS") {
		var rcv_data = JSON.parse(intent.data);
		focusTag(rcv_data);
	}

	if (intent.action == "MAP_UPDATE") {
		var rcv_data = JSON.parse(intent.data);
		syn_map(rcv_data);
	}
};

// to be called in callback if map parametrs got from other widget
function setMarkers0(rcv_data) {
	var zoom;
	clearOverlays();
	var i = 0;
	for (i = 0; i < rcv_data.tags.length; i++) {
		var marker = new google.maps.Marker({
			position : new google.maps.LatLng(rcv_data.tags[i].lat,
					rcv_data.tags[i].lng),
			map : map,
			title : rcv_data.tags[i].title
		});
		markersArray.push(marker);
	}
	var lat_lng = new google.maps.LatLng(rcv_data.tags[i - 1].lat,
			rcv_data.tags[i - 1].lng);
	map.setCenter(lat_lng);
	zoom = Math.round(rcv_data.tags[i - 1].alt) || 1; //stupid thing here, i'm just confused 
	map.setZoom((zoom <= 0) ? 1 : zoom);
};

function activate() {
	isActive = true;
};

function deactivate() {
	isActive = false;
};

function addNewSemanticPlaceType() {
	placeName = document.getElementById("username").value;
	var placeDescription = "";
	var latitude = document.getElementById("lat").value;
	var longitude = document.getElementById("lng").value;
	var zoom = map.getZoom();

	//alert ("placeName "+placeName+" latitude "+latitude+" longitude "+longitude+" zoom "+zoom);

	serviceName = "mpeg7_semanticbasetype_service";
	methodName = "addNewSemanticPlaceType";
	parametersAsJSONArray = new Array();
	parametersAsJSONArray[0] = {
		"type" : "String",
		"value" : placeName
	};
	parametersAsJSONArray[1] = {
		"type" : "String",
		"value" : placeDescription
	};
	parametersAsJSONArray[2] = {
		"type" : "double",
		"value" : latitude
	};
	parametersAsJSONArray[3] = {
		"type" : "double",
		"value" : longitude
	};
	parametersAsJSONArray[4] = {
		"type" : "double",
		"value" : zoom
	};

	console.log("!!!!!!!!!!!!!! MAP LAS");
	console.log(lasClient.getSessionId());
	lasClient.invoke(serviceName, methodName, parametersAsJSONArray, function(
			status, result) {
		var id = result.value;
		placeTags.push({
			"lat" : latitude,
			"lng" : longitude,
			"alt" : zoom,
			"title" : placeName,
			"id" : id
		});
		var durationInSeconds = 1;
		var startTime = currentTime;

		var intent = {
			"component" : "",
			"action" : "SAVE_PLACETYPE",
			"data" : "http://example.org",
			"dataType" : "text/html",
			"categories" : [ "example1", "example2" ],
			"flags" : [ "PUBLISH_GLOBAL" ],
			"extras" : {
				"id" : id,
				"durationInSeconds" : durationInSeconds,
				"startTime" : startTime,
				"Name" : placeName
			}
		};

		//var par= { "id" : id, "durationInSeconds"  : durationInSeconds,"startTime": startTime, "Name":placeName}
		//intent.extras= JSON.stringify(par);
		//alert(intent.extras);
		sendIntent(intent);

		//addAnnotationsSegment(id,startTime,durationInSeconds);
	});
}

// to be called when update from widget annotate
annotateMap = function(rcv_data) {
	map.setZoom(rcv_data.zoom);
	clearOverlays();

	var marker = new google.maps.Marker({
		position : new google.maps.LatLng(rcv_data.lat, rcv_data.lng),
		map : map
	});
	markersArray.push(marker);
};

function mapAnnotate(location) {
	document.getElementById("login_box").style.visibility = "visible";
	clearOverlays_tmp();

	var marker = new google.maps.Marker({
		position : location,
		map : map
	});
	tmpMarkerArray.push(marker);

	document.getElementById("lat").value = location.lat();
	document.getElementById("lng").value = location.lng();

	//call the video widget, pause the player and get current time
	var intent = {
		"component" : "",
		"action" : "ACTION_ANNOTATIONS_GET_TIME_PAUSE",
		"data" : "www.example.org",
		"dataType" : "text/html",
		"flags" : [ "PUBLISH_GLOBAL" ]
	};
	sendIntent(intent);

	geocoder
			.geocode(
					{
						'latLng' : location
					},
					function(results, status) {
						if (status == google.maps.GeocoderStatus.OK) {
							if (results[0]) {
								//$('#address').val(results[0].formatted_address);
								//	$('#latitude').val(marker.getPosition().lat());
								//	$('#longitude').val(marker.getPosition().lng());
								document.getElementById("username").value = results[0].formatted_address;
							}
						}
					});
};

function save() {
	clearOverlays_tmp();
	//markersArray.push(tmpMarkerArray[tmpMarkerArray.length-1]);

	//send intent to start video
	var intent = {
		"component" : "",
		"action" : "ACTION_START_VIDEO",
		"data" : "www.example.org",
		"dataType" : "text/html",
		"flags" : [ "PUBLISH_GLOBAL" ]
	};

	sendIntent(intent);
	addNewSemanticPlaceType();
	var marker = new google.maps.Marker({
		position : new google.maps.LatLng(document.getElementById("lat").value,
				document.getElementById("lng").value),
		map : map
	});

	markersArray.push(marker);
	//document.getElementById("login_box").style.visibility = "hidden";
}

function minimize() {
	gadgets.window.adjustHeight(0);
};

function maximize() {
	gadgets.window.adjustHeight(450);
};

// called when cancel to annotate is called
cancel = function() {
	//send intent to start video
	var intent = {
		"component" : "",
		"action" : "ACTION_START_VIDEO",
		"data" : "www.example.org",
		"dataType" : "text/html",
		"flags" : [ "PUBLISH_GLOBAL" ]
	};

	sendIntent(intent);
	document.getElementById("username").value = '';
	document.getElementById("login_box").style.visibility = "hidden";
	clearOverlays_tmp();
	//map.setZoom(1);
};

// focuses/zooms on tha map event received
function focusTag(rcv_data) {
	var lat_lng = new google.maps.LatLng(rcv_data.lat, rcv_data.lng);
	map.setCenter(lat_lng);
	map.setZoom(5);
};

// synchronize the two maps
function syn_map(rcv_data) {
	var lat_lng = new google.maps.LatLng(rcv_data.lat, rcv_data.lng);
	map.setCenter(lat_lng);
	map.setZoom(rcv_data.zoom);

	lat_in = rcv_data.lat;
	lng_in = rcv_data.lng;
	zoom_in = rcv_data.zoom;
};

// Removes the overlays from the map, but keeps them in the array
function clearOverlays() {
	if (markersArray) {
		for (i in markersArray) {
			markersArray[i].setMap(null);
		}
	}
};

function clearOverlays_tmp() {
	if (tmpMarkerArray) {
		for (i in tmpMarkerArray) {
			tmpMarkerArray[i].setMap(null);
		}
	}
};

//iwcClient.connect(iwcCallback);
var gui_sendIntent = function() {
	var intent = JSON.parse(document.getElementById("msg").value);
	if (iwc.util.validateIntent(intent)) {
		duiClient.sendIntent(intent);
	} else {
		alert("Intent not valid!");
	}
};

function sendIntent(intent) {
	if (iwc.util.validateIntent(intent)) {
		duiClient.sendIntent(intent);
	} else {
		alert("Intent not valid!");
	}
};

var oldzoom = 0;
var oldlat = 0;
var oldlng = 0;

// sends the map parameters to the other map when map moved or zoomed by the user
function mapParSend() {
	var c = map.getCenter();
	//	var st=c.toString();
	var z = map.getZoom();
	var ll = c.lat();
	var ln = c.lng();

	if (zoom_in != z || lat_in != ll || lng_in != ln) {
		var intent = {
			"component" : "",
			"action" : "MAP_UPDATE_widget",
			"data" : "http://example.org",
			"dataType" : "text/html",
			"categories" : [ "example1", "example2" ],
			"flags" : [ "PUBLISH_GLOBAL" ],
			"extras" : {
				"examplekey" : "examplevalue"
			}
		};
		var par = {
			"lat" : ll,
			"lng" : ln,
			"zoom" : z,
			"data_type" : "mapParSend"
		};
		intent.data = JSON.stringify(par);
		intent.extras = JSON.stringify(par);

		if (iwc.util.validateIntent(intent)) {
			duiClient.sendIntent(intent);
		} else {
			alert("Intent not valid!");
		}
		oldzoom = z;
		oldlat = ll;
		oldlng = ln;
	}
}

//sets all markers for semantic place types
function navigateTo(dest, params) {
	console.log('weill navigate');
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

gadgets.util.registerOnLoadHandler(init);

function getAudioVisualSegmentsHandler(status, result) {
	
	//showLoadingOverlay();
	console.log("status of getAudioVisualSegmentsHandler " + status);
	console.log(result.value);
	console.log("starting the parse");
	console.log(result);

	//arrays when semantic info for all the segments is stored
	var ids = new Array();
	var types = new Array();
	//var authors = new Array();
	var descriptions = new Array();
	var i = 0; //current index in the vectors above
	//vectors for the place types
	var placeTypeAnnotationsIds = new Array();
	var placeTypesAnnotationsDescs = new Array();

	//for all the segments -> parse them to get annotation information
	$.each(result.value, function(index, value) {
		//we now parse the current segment
		// console.log($(value));
		xmlObj = $.parseXML(value);
		//now we read all the annotations defined in this segment
		$(xmlObj).find('SemanticBaseRef').each(function() {
			hrefString = $(this).attr("href");
			console.log($(this).attr("href"));
			var regexp = /id="(.*)"]/;
			var testRE = hrefString.match(regexp);

			id = testRE[1];
			type = id.split("_")[0];

			//we add the info of the current annotation in the arrays containing semantic info
			ids[i] = id;
			types[i] = type;
			i++;
		});
	});

	//now we get the descriptions of the found annotations
	serviceName = "mpeg7_semanticbasetype_service";
	methodName = "getSemanticDescriptionInformationSet";
	parametersAsJSONArray = new Array();
	parametersAsJSONArray[0] = {
		"type" : "String[]",
		"value" : ids
	};
	lasClient
			.invoke(
					serviceName,
					methodName,
					parametersAsJSONArray,
					function(status, response) {
						if (status == 200) {
							console.log("getSemanticDescriptionInformationSet");
							console.log(response);

							jQuery
									.each(
											response.value,
											function(index, value) {
												jQuery
														.each(
																ids,
																function(
																		indexId,
																		valueId) {
																	var regexp = /id=(.*)####name=/;
																	responseId = (value
																			.match(regexp))[1];
																	// console.log("responseId "+responseId);

																	if (responseId == valueId) {
																		regexp = /####name=(.*)####definition=/;
																		descriptions[indexId] = (value
																				.match(regexp))[1];
																		//here we will call the las service to get langitude and latitude of the place annotations

																		if (types[indexId] == "SemanticPlaceType") {
																			placeTypeAnnotationsIds
																					.push(ids[indexId]);
																			placeTypesAnnotationsDescs
																					.push(descriptions[indexId]);
																		}
																	}

																});
											});
						}

						//map json

						//de aici
						serviceName = "mpeg7_semanticbasetype_service";
						methodName2 = "getSemanticPlaceType";

						parametersAsJSONArray = new Array();

						console.log("WILL GET THE PLACE TYPE");
						var lat = 0;
						var longitude = 0;
						var alt = 0;

						var callbackCounter = 0;
						$(placeTypeAnnotationsIds)
								.each(
										function(indexId, valueId) {
											parametersAsJSONArray[0] = {
												"type" : "String",
												"value" : valueId
											};

											lasClient
													.invoke(
															serviceName,
															methodName2,
															parametersAsJSONArray,
															function(status,
																	result) {
																callbackCounter = callbackCounter + 1;

																console
																		.log(TAG
																				+ " *******************");
																console
																		.log(result);
																//this function returns UNFORTUNATELY an xml; we now parse it, to get the latitude, longitude and altitude
																placeXmlObj = $
																		.parseXML(result.value);

																console
																		.log("#$%^&*^%$#@$%^&*^%$#$%^&*^%$#");
																console
																		.log(placeXmlObj);
																$(placeXmlObj)
																		.find(
																				'Point')
																		.each(
																				function() {
																					alt = $(
																							this)
																							.attr(
																									"altitude");
																					lat = $(
																							this)
																							.attr(
																									"latitude");
																					longitude = $(
																							this)
																							.attr(
																									"longitude");
																				});
																var tag = {
																	"lat" : lat,
																	"lng" : longitude,
																	"alt" : alt,
																	"title" : placeTypesAnnotationsDescs[indexId],
																	"id" : valueId
																};
																placeTags
																		.push(tag);
																/*
																if (callbackCounter == placeTypeAnnotationsIds.length)
																	 hideLoadingOverlay();
																	 */
															});

										});
					});

}

function onLogin() {
    var o = document.getElementsByClassName("fadeMe")[0];
    if(o !== undefined)
        o.setAttribute("style", "display:none");
};

function onLogout() {
	document.getElementsByClassName("fadeMe")[0].setAttribute("style",
			"display:block");
	placeTags = [];
	videourl = null;
	markersArray = [];
	lat_in = 0;
	lng_in = 0;
	zoom_in = 0;
	arrayTags = null;
	placeName = "";
	tmpMarkerArray = [];
};
function showLoadingOverlay() {
	document.getElementsByClassName("ajaxLoader")[0].setAttribute("style",
			"display:block");
	document.getElementsByClassName("fadeMe")[0].setAttribute("style",
			"display:block");
}

function hideLoadingOverlay() {
	document.getElementsByClassName("ajaxLoader")[0].setAttribute("style",
			"display:none");
	document.getElementsByClassName("fadeMe")[0].setAttribute("style",
			"display:none");
}
var adjustMapOnResize = function() {
	if (map != null) {
		google.maps.event.trigger(map, 'resize');
	}
}

window.addEventListener('resize', adjustMapOnResize, false);
