var TAG = "Semantic Annotations Table";
var mygrid;
var duiClient;
var allowSendGetLasInfo = true;
var lasurl = "http://steen.informatik.rwth-aachen.de:9914/";
// var lasurl = "http://gentileschi.informatik.rwth-aachen.de:9914/";
var appCode = "vc";
var videourl = null;
var isMig = false;
var isInit = true;
var lasClient;
var unCheckDeleterow;
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
		onLogin();
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
						parametersAsJSONArray,
						getAudioVisualSegmentsHandlerForMig);
				showLoadingOverlay();
			}
		}
		break;
	case Enums.Feedback.LogoutSuccess:
		onLogout();
		break;
	case Enums.Feedback.LoginError:
		break;
	case Enums.Feedback.LogoutError:
		break;
	case Enums.Feedback.Warning:
	case Enums.Feedback.PingSuccess:
		// just ignoring this one...
		break;
	default:
		// ignore it....
		break;
	}
	console.log("Feedback: " + statusCode + ", " + message);
};

lasClient = new LasAjaxClient("sevianno", lasFeedbackHandler);
function init() {
	// -----------------------------------------------------------------------------------keli
	duiClient = new DUIClient();
	duiClient.connect(iwcCallback);
	duiClient.finishMigration = onFinishMig;
	duiClient.getWidgetState = getState;
	// duiClient.prepareMigration
	// duiClient.changeWithApp
	duiClient.updateState = onUpdateState;
	// -------------------------------------------------------------------------------------

	mygrid = new dhtmlXGridObject('gridbox');
	mygrid
			.setImagePath("https://raw.github.com/DadaMonad/sevianno/master/images/imgs/");
	mygrid.setHeader("Type, Annotation, Start, End, Author,Remove,Update");
	mygrid.setColAlign("left,left,left,left, left,center,center");
	mygrid.setColTypes("ro,ro,ro,ro,ro,img,img");
	mygrid.setColSorting("str,str,str,str,str,str,str");
	// mygrid.style.width = "100%";
	// mygrid.style.height = "100%";
	mygrid.enableAutoWidth(true);
	// mygrid.enableMultiselect(true);
	mygrid.enableCellIds(true);
	mygrid.init();
	mygrid.setSkin("dhx_skyblue");
	mygrid
			.attachEvent(
					"onRowSelect",
					function(id, ind) {
						startTime = mygrid.cellById(id, 2).getValue();
						var timeAr = startTime.split(":");
						var seconds;
						if (timeAr != null) {
							if (timeAr.length > 2) {
								seconds = parseInt(timeAr[0]) * 3600
										+ parseInt(timeAr[1]) * 60
										+ parseInt(timeAr[2]);
							} else if (timeAr.length = 2) {
								seconds = parseInt(timeAr[0]) * 60
										+ parseInt(timeAr[1]);
							} else {
								seconds = parseInt(timeAr[0]);
							}
							// if(unCheckDeleterow != 1){
							console.log("unCheckDeleterow" + unCheckDeleterow);
							var intent = {
								"component" : "",
								"action" : "ACTION_SEEK",
								"data" : "http://tosini.informatik.rwth-aachen.de:8134/videos/KarlGrosse.mp4",
								"dataType" : "video/mp4",
								"flags" : [ "PUBLISH_GLOBAL" ],
								"extras" : {
									"position" : seconds
								}
							};
							console.log("what the hell");
							sendIntent(intent);
							// }
						} else {
							mygrid.clearSelection();
						}
					});
	// duiClient.getAppState();
	// --------------------------------------------------------------------------keli
	duiClient.initOK();
	// ------------------------------------------------------------------------------

	lasClient.verifyStatus();
	if (lasClient.getStatus() != "loggedIn") {
		onLogout();
	}
	// renderUI();
	// DUIClient.getAppState();
}

// ------------------------------------------------------------------------------------keli
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
					showLoadingOverlay();
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
					getAudioVisualSegmentsHandlerForMig);
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
// ---------------------------------------------------------------------------------------

var iwcCallback = function(intent) {
	console.log(TAG + "*****************************************");
	console.log(intent);
	console.log("********************************************");

	if (intent.action == "ACTION_HIDELOADING_OVERLAY") {
		//TODO: hideLoadingOverlay();
	}
	if (intent.action == "ACTION_SHOWLOADING_OVERLAY") {
		//TODO: showLoadingOverlay();
	}
	// code to end the deletion motion

	if (intent.action == "ACTION_END_TABLE_MODIFICATION"
			&& intent.dataType == "text/html") {
		hideLoadingOverlay();

		isMig = true;
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
			showLoadingOverlay();
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

	if (intent.action == "ACTION_SEND_ANNOTATIONS_JSON_FORMAT"
			&& intent.dataType == "text/html") {
		jsonString = intent.extras.jsonString;
		console.log("create the table");
		// clear the data in the annotations tables
		mygrid.clearAll();
		// populate the table with the new data
		mygrid.parse(jQuery.parseJSON(jsonString), "json");
		// make sure each cell has an attached id
		mygrid.enableCellIds(true);
		mygrid.sortRows(2, "str", "asc");
	}
	// -------------------------------------------------------------------------------------keli
	if (intent.action == "LAS_INFO") {
		console.log("annotable: LAS_INFO.");
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
		videourl = intent.data;
		isMig = true;
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
			showLoadingOverlay();
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
	if (intent.action == "ACTION_LOGOUT") {
		allowSendGetLasInfo = true;
		lasClient.logout();
	}
	// ------------------------------------------------------------------------------------------

	if (intent.action == "ACTION_ADD_NEW_ANNOTATION_TO_TABLE"
			&& intent.dataType == "text/html") {
		var id = intent.extras.id;
		var type = intent.extras.type;
		var startTime = intent.extras.startTime;
		var endTime = intent.extras.endTime;
		var description = intent.extras.description;
		var author = intent.extras.author;
		var arrayOfElems = new Array();
		arrayOfElems.push(type);
		arrayOfElems.push(description);
		arrayOfElems.push(startTime);
		arrayOfElems.push(endTime);
		arrayOfElems.push(author);

		mygrid.addRow(id, arrayOfElems);
		var userName = lasClient.getUsername();

		mygrid
				.forEachRow(function(id) {
					var authorid = mygrid.cellById(id, 4).getValue();
					console.log("author= " + authorid);
					if (authorid == userName || authorid == "admin") {
						console.log("inside author= " + authorid);

						mygrid
								.cellById(id, 5)
								.setValue(
										"https://raw.github.com/DadaMonad/sevianno/master/images/DELETE.png^delete annotations^javascript:deleteAnnotations(mygrid.getSelectedId(),mygrid.cellById(id,0).getValue(),mygrid.getRowsNum())^_self");
						console.log("test");
						mygrid
								.cellById(id, 6)
								.setValue(
										"https://raw.github.com/DadaMonad/sevianno/master/images/update.gif^update annotations^javascript:updateAnnotations(mygrid.getSelectedId(),mygrid.cellById(id,1).getValue(),mygrid.getRowsNum())^_self");
					} else {
						mygrid.cellById(id, 5).setValue("");
						mygrid.cellById(id, 6).setValue("");
					}
				})
		mygrid.sortRows(2, "str", "asc");

	}

	if (intent.action == "ACTION_ADD_NEW_PLACE_ANNOTATION_TO_TABLE"
			&& intent.dataType == "text/html") {
		// the place annotation is the onbly one sent via an intent; we should
		// make sure that we do not add duplicates when more add annotations
		// widgets are
		// waiting for place types events
		var id = intent.extras.id;
		var type = intent.extras.type;
		var startTime = intent.extras.startTime;
		var endTime = intent.extras.endTime;
		var description = intent.extras.description;
		var author = intent.extras.author;
		var arrayOfElems = new Array();
		arrayOfElems.push(type);
		arrayOfElems.push(description);
		arrayOfElems.push(startTime);
		arrayOfElems.push(endTime);
		arrayOfElems.push(author);

		if (checkIfNewRowIsUnique(arrayOfElems)) {
			mygrid.addRow(id, arrayOfElems);
			mygrid
					.forEachRow(function(id) {
						var authorid = mygrid.cellById(id, 4).getValue();
						if (authorid == userName || authorid == "admin") {
							mygrid
									.cellById(id, 5)
									.setValue(
											"https://raw.github.com/DadaMonad/sevianno/master/images/DELETE.png^delete annotations^javascript:deleteAnnotations(mygrid.getSelectedId(),mygrid.cellById(id,0).getValue(),mygrid.getRowsNum())^_self");
							mygrid
									.cellById(id, 6)
									.setValue(
											"https://raw.github.com/DadaMonad/sevianno/master/images/update.gif^update annotations^javascript:updateAnnotations(mygrid.getSelectedId(),mygrid.cellById(id,1).getValue(),mygrid.getRowsNum())^_self");
						} else {
							mygrid.cellById(id, 5).setValue("");
							mygrid.cellById(id, 6).setValue("");
						}
					})

			mygrid.sortRows(2, "str", "asc");
		}

	}
	if (intent.action == "ACTION_SEND_SEARCH_ANNOTATIONS_AT_TIME"
			&& intent.dataType == "text/html") {
		console.log("got the intent");
		var time = intent.extras.time;
		var allRowIds = mygrid.getAllRowIds();
		mygrid.clearSelection();
		if (allRowIds != null) {
			var ids = allRowIds.split(",");
			var mapids = [];
			$.each(ids, function(index, value) {
				startTime = mygrid.cellById(value, 2).getValue();
				endTime = mygrid.cellById(value, 3).getValue();
				type = mygrid.cellById(value, 0).getValue();
				if (time.localeCompare(startTime) >= 0
						&& time.localeCompare(endTime) <= 0) {
					mygrid.setRowColor(value, "#B1F49A");
					if (type == "SemanticPlace")
						mapids.push(value);
				} else {
					rowIndex = mygrid.getRowIndex(value);
					if (rowIndex % 2 == 0) {
						mygrid.setRowColor(value, "#E3EFFF");
					} else {
						mygrid.setRowColor(value, "#FFFFFF");
					}
				}
			});
			if (mapids.length > 0) {
				var mapIntent = {
					"component" : "",
					"categories" : [],
					"action" : "ACTION_PLACETAGS",
					"data" : "",
					"dataType" : "",
					"flags" : [ "PUBLISH_GLOBAL" ],
					"extras" : mapids
				};
				sendIntent(mapIntent);
			}
		}

	}

};

function checkIfNewRowIsUnique(newElemsArray) {
	var allRowIds = mygrid.getAllRowIds();
	// var isUnique = false;
	if (allRowIds != null) {
		var ids = allRowIds.split(",");
		for (var i = 0; i < ids.length; i++) {
			if ((newElemsArray[0] == mygrid.cellById(ids[i], 0).getValue())
					&& (newElemsArray[1] == mygrid.cellById(ids[i], 1)
							.getValue())
					&& (newElemsArray[2] == mygrid.cellById(ids[i], 2)
							.getValue())
					&& (newElemsArray[3] == mygrid.cellById(ids[i], 3)
							.getValue())) {
				return false;
			}
		}

	}
	return true;
}

function sendIntent(intent) {
	if (iwc.util.validateIntent(intent)) {
		duiClient.sendIntent(intent);
	} else {
		alert("Intent not valid!");
	}
}
function XMLFromString(sXML) {
	if (window.ActiveXObject) {
		var oXML = new ActiveXObject("Microsoft.XMLDOM");
		oXML.loadXML(sXML);
		return oXML;
	} else {
		return (new DOMParser()).parseFromString(sXML, "text/xml");
	}
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
		endTimeSeconds = 3600
				* (parseInt(startTimeElems[0]) + parseInt(durationH)) + 60
				* (parseInt(startTimeElems[1]) + parseInt(durationM))
				+ parseInt(startTimeElems[2]) + parseInt(durationS);
	} else {
		endTimeSeconds = 60
				* (parseInt(startTimeElems[0]) + parseInt(durationM))
				+ parseInt(startTimeElems[1]) + parseInt(durationS);
	}
	return getTimeFromPos(endTimeSeconds);
}
function getAudioVisualSegmentsHandlerForMig(status, result) {
	console.log("status of getAudioVisualSegmentsHandlerForMig " + status);
	console.log(result.value);
	// create the json file
	// start the json
	data = '{"rows": [';
	console.log("starting the parse");
	console.log(result);
	// info for a segment
	var startTimePoint = "";
	var durationH = "00";
	var durationM = "00";
	var durationS = "01";
	var endTimePoint = "";
	// arrays when semantic info for all the segments is stored
	var ids = new Array();
	var types = new Array();
	var startTimePoints = new Array();
	var endTimePoints = new Array();
	var author = new Array();
	var descriptions = new Array();
	var isusername = new Array();
	var i = 0; // current index in the vectors above
	// arrays containing info about the annotations, that will be used when
	// adding new concepts
	var allocations = new Array(); // it will have the same size as the vectors
									// above; each annotation will have an
									// assigned allocation
	var uniqueDurations = new Array(); // this might have another size,
										// according to how many different
										// timepoints we have
	var uniqueTimepoints = new Array(); // this might have another size,
										// according to how many different
										// timepoints we have
	// bug in the mpge7MultimediaContentService -> setAudioVisualSegmentsWith
	// Duration: the array with unoque durations
	// must have the same length with the array of uniqueTimepoints; that is:
	// one cannot add two annotations
	// starting at the same time point but having different durations
	var uniqueTimepointsIndex = 0; // current index in the uniqueTimepoints and
									// uniqueDurations
	var segmentTimepointInOriginalFormat = null;
	var segmentDurationInOriginalFormat = "PT00H00M01S";
	// vectors for the place types
	var placeTypeAnnotationsIds = new Array();
	var placeTypesAnnotationsDescs = new Array();
	var placeTypesAnnotationsLats = new Array();
	var placeTypesAnnotationsLongs = new Array();
	var placeTypesAnnotationsAlts = new Array();
	var deleteIdentities;
	// for all the segments -> parse them to get annotation information
	$
			.each(
					result.value,
					function(index, value) {
						// we now parse the current segment
						console.log($(value));
						xmlObj = $.parseXML(value);
						// all the annotations in a segment share the same start
						// time point and the same duration
						// we take the start time point of all the annotations
						// defined in this segment
						$(xmlObj)
								.find('MediaTimePoint')
								.each(
										function() {

											var regexp = /T(\d\d:\d\d:\d\d):/;
											startTimePoint = $(this).text()
													.match(regexp)[1];
											var elems = startTimePoint
													.split(":");
											if (elems[0] == "00") {
												startTimePoint = elems[1] + ":"
														+ elems[2];
											}
											var regexp = /T\d\d:\d\d:\d\d:\d\d\dF\d\d\d\d/;
											segmentTimepointInOriginalFormat = $(
													this).text().match(regexp)[0];

										});
						// we take the duration of all the annotations defined
						// in this segment
						$(xmlObj).find('MediaDuration').each(
								function() {
									if ($(this).text() != "undefined"
											&& $(this).text().length == 9) {
										var regexp = /PT(\d\d)H/;
										durationH = $(this).text()
												.match(regexp)[1];
										regexp = /(\d\d)M/;
										durationM = $(this).text()
												.match(regexp)[1];
										regexp = /(\d\d)S/;
										durationS = $(this).text()
												.match(regexp)[1];
										var regexp = /PT\d\dH\d\dM\d\dS/;
										segmentDurationInOriginalFormat = $(
												this).text().match(regexp)[0];
									}
								});
						// we compute the end time point of the annotations in
						// the current segment
						endTimePoint = computeEndTime(startTimePoint,
								durationH, durationM, durationS);

						var valueOfAllocation = null;
						var foundIdenticalTimepoint = false;
						if (uniqueTimepoints != null
								&& uniqueTimepoints != "undefined"
								&& uniqueTimepoints.length != 0) {
							jQuery
									.each(
											uniqueTimepoints,
											function(indexUT, valueUT) {
												if (valueUT == segmentTimepointInOriginalFormat) {
													foundIdenticalTimepoint = true;
													valueOfAllocation = indexUT;
												}
											});
						}
						if (!foundIdenticalTimepoint) {
							uniqueTimepoints[uniqueTimepointsIndex] = segmentTimepointInOriginalFormat;
							uniqueDurations[uniqueTimepointsIndex] = segmentDurationInOriginalFormat;
							valueOfAllocation = uniqueTimepointsIndex;
							uniqueTimepointsIndex = uniqueTimepointsIndex + 1;
						}

						// now we read all the annotations defined in this
						// segment
						$(xmlObj).find('SemanticBaseRef').each(function() {
							hrefString = $(this).attr("href");
							console.log($(this).attr("href"));
							var regexp = /id="(.*)"]/;
							var testRE = hrefString.match(regexp);
							id = testRE[1];
							type = id.split("_")[0];
							type = type.substring(0, type.length - 4);
							// we add the info of the current annotation in the
							// arrays containing semantic info
							ids[i] = id;
							types[i] = type;
							startTimePoints[i] = startTimePoint;
							endTimePoints[i] = endTimePoint;
							allocations[i] = valueOfAllocation;
							i++;
						});

					});
	// now we get the descriptions of the found annotations
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
																	var regexp2;
																	var userName = lasClient
																			.getUsername();
																	responseId = (value
																			.match(regexp))[1];
																	// console.log("responseId
																	// "+responseId);
																	if (responseId == valueId) {
																		regexp = /####name=(.*)####definition=/;
																		// new
																		// regular
																		// expression
																		regexp2 = /_([a-z]*)/;
																		descriptions[indexId] = (value
																				.match(regexp))[1];
																		author[indexId] = (value
																				.match(regexp2))[1];
																		if ((value
																				.match(regexp2))[1] == userName
																				|| (value
																						.match(regexp2))[1] == "admin") {
																			isusername[indexId] = new Image();
																			isusername[indexId].src = 'http://www-i5.informatik.rwth-aachen.de/~srivatsan/image.png';
																		} else {
																			isusername[indexId] = "";
																		}
																		console
																				.log("is user name = "
																						+ indexId
																						+ "asasas"
																						+ isusername[indexId]);
																		// here
																		// we
																		// will
																		// call
																		// the
																		// las
																		// service
																		// to
																		// get
																		// langitude
																		// and
																		// latitude
																		// of
																		// the
																		// place
																		// annotations
																		if (types[indexId] == "SemanticPlace") {
																			placeTypeAnnotationsIds
																					.push(ids[indexId]);
																			placeTypesAnnotationsDescs
																					.push(descriptions[indexId]);
																		}
																	}
																});
											});
							jQuery.each(ids, function(index, value) {
								data = data + '{ "id": "' + ids[index]
										+ '", "data": ["' + types[index]
										+ '", "' + descriptions[index] + '", "'
										+ startTimePoints[index] + '", "'
										+ endTimePoints[index] + '", "'
										+ author[index] + '", "'
										+ isusername[index] + '", "yyy"]}';
								if (index != ids.length - 1) {
									data = data + ',';
								}
							});
						}
						data = data + "]}";
						// after we have finished building the json with
						// semantic annotations, we send it to the
						// annotationsTable widget
						// for being displayed in a user readable format
						console.log("create the table");
						// clear the data in the annotations tables
						mygrid.clearAll();
						// populate the table with the new data
						mygrid.parse(jQuery.parseJSON(data), "json");
						// console.log(data);
						// make sure each cell has an attached id

						var userName = lasClient.getUsername();

						mygrid
								.forEachRow(function(id) {
									var authorid = mygrid.cellById(id, 4)
											.getValue();
									// console.log(authorid);
									// mygrid.cellById(id,5).setDisabled(true);
									// mygrid.cellById(id,5).setValue(0);
									if (authorid == userName
											|| authorid == "admin") {
										mygrid
												.cellById(id, 5)
												.setValue(
														"https://raw.github.com/DadaMonad/sevianno/master/images/DELETE.png^delete annotations^javascript:deleteAnnotations(mygrid.getSelectedId(),mygrid.cellById(id,0).getValue(),mygrid.getRowsNum())^_self");
										mygrid
												.cellById(id, 6)
												.setValue(
														"https://raw.github.com/DadaMonad/sevianno/master/images/update.gif^update annotations^javascript:updateAnnotations(mygrid.getSelectedId(),mygrid.cellById(id,1).getValue(),mygrid.getRowsNum())^_self");

									} else {
										mygrid.cellById(id, 5).setValue("");
										mygrid.cellById(id, 6).setValue("");
									}
								})
						// --------------------------------------------------
						mygrid.sortRows(2, "str", "asc");

						hideLoadingOverlay();
					});
}
function getAudioVisualSegmentsHandlerForMig(status, result) {
	console.log("status of getAudioVisualSegmentsHandlerForMig " + status);
	console.log(result.value);
	// create the json file
	// start the json
	data = '{"rows": [';
	console.log("starting the parse");
	console.log(result);
	// info for a segment
	var startTimePoint = "";
	var durationH = "00";
	var durationM = "00";
	var durationS = "01";
	var endTimePoint = "";
	// arrays when semantic info for all the segments is stored
	var ids = new Array();
	var types = new Array();
	var startTimePoints = new Array();
	var endTimePoints = new Array();
	var author = new Array();
	var descriptions = new Array();
	var isusername = new Array();
	var semanticId = new Array();
	var i = 0; // current index in the vectors above
	// arrays containing info about the annotations, that will be used when
	// adding new concepts
	var allocations = new Array(); // it will have the same size as the vectors
									// above; each annotation will have an
									// assigned allocation
	var uniqueDurations = new Array(); // this might have another size,
										// according to how many different
										// timepoints we have
	var uniqueTimepoints = new Array(); // this might have another size,
										// according to how many different
										// timepoints we have
	// bug in the mpge7MultimediaContentService -> setAudioVisualSegmentsWith
	// Duration: the array with unoque durations
	// must have the same length with the array of uniqueTimepoints; that is:
	// one cannot add two annotations
	// starting at the same time point but having different durations
	var uniqueTimepointsIndex = 0; // current index in the uniqueTimepoints and
									// uniqueDurations
	var segmentTimepointInOriginalFormat = null;
	var segmentDurationInOriginalFormat = "PT00H00M01S";
	// vectors for the place types
	var placeTypeAnnotationsIds = new Array();
	var placeTypesAnnotationsDescs = new Array();
	var placeTypesAnnotationsLats = new Array();
	var placeTypesAnnotationsLongs = new Array();
	var placeTypesAnnotationsAlts = new Array();
	var deleteIdentities;
	var semanticIdentities;
	var rowsNo;
	// for all the segments -> parse them to get annotation information
	$
			.each(
					result.value,
					function(index, value) {
						// we now parse the current segment
						console.log($(value));
						xmlObj = $.parseXML(value);
						// all the annotations in a segment share the same start
						// time point and the same duration
						// we take the start time point of all the annotations
						// defined in this segment
						$(xmlObj)
								.find('MediaTimePoint')
								.each(
										function() {

											var regexp = /T(\d\d:\d\d:\d\d):/;
											startTimePoint = $(this).text()
													.match(regexp)[1];
											var elems = startTimePoint
													.split(":");
											if (elems[0] == "00") {
												startTimePoint = elems[1] + ":"
														+ elems[2];
											}
											var regexp = /T\d\d:\d\d:\d\d:\d\d\dF\d\d\d\d/;
											segmentTimepointInOriginalFormat = $(
													this).text().match(regexp)[0];

										});
						// we take the duration of all the annotations defined
						// in this segment
						$(xmlObj).find('MediaDuration').each(
								function() {
									if ($(this).text() != "undefined"
											&& $(this).text().length == 9) {
										var regexp = /PT(\d\d)H/;
										durationH = $(this).text()
												.match(regexp)[1];
										regexp = /(\d\d)M/;
										durationM = $(this).text()
												.match(regexp)[1];
										regexp = /(\d\d)S/;
										durationS = $(this).text()
												.match(regexp)[1];
										var regexp = /PT\d\dH\d\dM\d\dS/;
										segmentDurationInOriginalFormat = $(
												this).text().match(regexp)[0];
									}
								});
						// we compute the end time point of the annotations in
						// the current segment
						endTimePoint = computeEndTime(startTimePoint,
								durationH, durationM, durationS);

						var valueOfAllocation = null;
						var foundIdenticalTimepoint = false;
						if (uniqueTimepoints != null
								&& uniqueTimepoints != "undefined"
								&& uniqueTimepoints.length != 0) {
							jQuery
									.each(
											uniqueTimepoints,
											function(indexUT, valueUT) {
												if (valueUT == segmentTimepointInOriginalFormat) {
													foundIdenticalTimepoint = true;
													valueOfAllocation = indexUT;
												}
											});
						}
						if (!foundIdenticalTimepoint) {
							uniqueTimepoints[uniqueTimepointsIndex] = segmentTimepointInOriginalFormat;
							uniqueDurations[uniqueTimepointsIndex] = segmentDurationInOriginalFormat;
							valueOfAllocation = uniqueTimepointsIndex;
							uniqueTimepointsIndex = uniqueTimepointsIndex + 1;
						}

						// now we read all the annotations defined in this
						// segment
						$(xmlObj).find('SemanticBaseRef').each(function() {
							hrefString = $(this).attr("href");
							console.log($(this).attr("href"));
							var regexp = /id="(.*)"]/;
							var testRE = hrefString.match(regexp);
							id = testRE[1];
							type = id.split("_")[0];
							type = type.substring(0, type.length - 4);
							// we add the info of the current annotation in the
							// arrays containing semantic info
							ids[i] = id;
							types[i] = type;
							startTimePoints[i] = startTimePoint;
							endTimePoints[i] = endTimePoint;
							allocations[i] = valueOfAllocation;
							i++;
						});

					});
	// now we get the descriptions of the found annotations
	console.log("start the semantic base");
	console.log(ids);
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
																	semanticId[indexId] = ids;
																	var regexp = /id=(.*)####name=/;
																	var regexp2;
																	var userName = lasClient
																			.getUsername();
																	responseId = (value
																			.match(regexp))[1];
																	// console.log("responseId
																	// "+responseId);
																	if (responseId == valueId) {
																		regexp = /####name=(.*)####definition=/;
																		// new
																		// regular
																		// expression
																		regexp2 = /_([a-z]*)/;
																		descriptions[indexId] = (value
																				.match(regexp))[1];
																		author[indexId] = (value
																				.match(regexp2))[1];
																		if ((value
																				.match(regexp2))[1] == userName
																				|| (value
																						.match(regexp2))[1] == "admin") {
																			// isusername[indexId]
																			// =
																			// new
																			// Image();
																			// isusername[indexId].src
																			// =
																			// 'http://www-i5.informatik.rwth-aachen.de/~srivatsan/image.png';
																		} else {
																			// isusername[indexId]
																			// =
																			// "";
																		}
																		// console.log("is
																		// user
																		// name
																		// = "
																		// +indexId
																		// +"asasas"
																		// +isusername[indexId]);
																		// here
																		// we
																		// will
																		// call
																		// the
																		// las
																		// service
																		// to
																		// get
																		// langitude
																		// and
																		// latitude
																		// of
																		// the
																		// place
																		// annotations
																		if (types[indexId] == "SemanticPlace") {
																			placeTypeAnnotationsIds
																					.push(ids[indexId]);
																			placeTypesAnnotationsDescs
																					.push(descriptions[indexId]);
																		}
																	}
																});
											});
							jQuery.each(ids, function(index, value) {
								data = data + '{ "id": "' + ids[index]
										+ '", "data": ["' + types[index]
										+ '", "' + descriptions[index] + '", "'
										+ startTimePoints[index] + '", "'
										+ endTimePoints[index] + '", "'
										+ author[index] + '", "'
										+ isusername[index] + '", "yyy"]}';
								if (index != ids.length - 1) {
									data = data + ',';
								}
							});
						}
						data = data + "]}";
						// after we have finished building the json with
						// semantic annotations, we send it to the
						// annotationsTable widget
						// for being displayed in a user readable format
						console.log("create the table");
						// clear the data in the annotations tables
						mygrid.clearAll();
						// populate the table with the new data
						mygrid.parse(jQuery.parseJSON(data), "json");
						// console.log(data);
						// make sure each cell has an attached id

						mygrid.enableCellIds(true);

						// -------------------------------------------------
						var userName = lasClient.getUsername();
						mygrid
								.forEachRow(function(id) {
									var authorid = mygrid.cellById(id, 4)
											.getValue();
									// console.log(authorid);
									// mygrid.cellById(id,5).setDisabled(true);
									// mygrid.cellById(id,5).setValue(0);
									if (authorid == userName
											|| authorid == "admin") {

										mygrid
												.cellById(id, 5)
												.setValue(
														"https://raw.github.com/DadaMonad/sevianno/master/images/DELETE.png^delete annotations^javascript:deleteAnnotations(mygrid.getSelectedId(),mygrid.cellById(id,0).getValue(),mygrid.getRowsNum())^_self");
										mygrid
												.cellById(id, 6)
												.setValue(
														"https://raw.github.com/DadaMonad/sevianno/master/images/update.gif^update annotations^javascript:updateAnnotations(mygrid.getSelectedId(),mygrid.cellById(id,1).getValue(),mygrid.getRowsNum())^_self");
									} else {

										mygrid.cellById(id, 5).setValue("");
										mygrid.cellById(id, 6).setValue("");
									}
									if (authorid == " "
											|| authorid == "undefined") {
										console.log("amazxing" + authorid);
										mygrid.deleteRow(id);
									}
								})
						// --------------------------------------------------
						mygrid.sortRows(2, "str", "asc");

						hideLoadingOverlay();
					});
}
function getAudioVisualSegmentsHandler(status, result) {
	console.log("status of getAudioVisualSegmentsHandler " + status);
	console.log(result.value);
	// create the json file
	// start the json
	data = '{"rows": [';
	console.log("starting the parse");
	console.log(result);
	// info for a segment
	var startTimePoint = "";
	var durationH = "00";
	var durationM = "00";
	var durationS = "01";
	var endTimePoint = "";
	// arrays when semantic info for all the segments is stored
	var ids = new Array();
	var types = new Array();
	var startTimePoints = new Array();
	var endTimePoints = new Array();
	var author = new Array();
	var descriptions = new Array();
	var isusername = new Array();
	var semanticId = new Array();
	var i = 0; // current index in the vectors above
	// vectors for the place types
	var placeTypeAnnotationsIds = new Array();
	var placeTypesAnnotationsDescs = new Array();
	var placeTypesAnnotationsLats = new Array();
	var placeTypesAnnotationsLongs = new Array();
	var placeTypesAnnotationsAlts = new Array();
	// for all the segments -> parse them to get annotation information
	$.each(result.value, function(index, value) {
		// we now parse the current segment
		console.log($(value));
		xmlObj = $.parseXML(value);
		// all the annotations in a segment share the same start time point and
		// the same duration
		// we take the start time point of all the annotations defined in this
		// segment
		$(xmlObj).find('MediaTimePoint').each(function() {
			var regexp = /T(\d\d:\d\d:\d\d):/;
			startTimePoint = $(this).text().match(regexp)[1];
			var elems = startTimePoint.split(":");
			if (elems[0] == "00") {
				startTimePoint = elems[1] + ":" + elems[2];
			}
		});
		// we take the duration of all the annotations defined in this segment
		$(xmlObj).find('MediaDuration').each(function() {
			if ($(this).text() != "undefined" && $(this).text().length == 9) {
				var regexp = /PT(\d\d)H/;
				durationH = $(this).text().match(regexp)[1];
				regexp = /(\d\d)M/;
				durationM = $(this).text().match(regexp)[1];
				regexp = /(\d\d)S/;
				durationS = $(this).text().match(regexp)[1];
			}
		});
		// we compute the end time point of the annotations in the current
		// segment
		endTimePoint = computeEndTime(startTimePoint, durationH, durationM,
				durationS);

		// now we read all the annotations defined in this segment
		$(xmlObj).find('SemanticBaseRef').each(function() {
			hrefString = $(this).attr("href");
			console.log($(this).attr("href"));
			var regexp = /id="(.*)"]/;
			var testRE = hrefString.match(regexp);
			id = testRE[1];

			type = id.split("_")[0];
			// remove 'Type' wordat the end
			type = type.substring(0, type.length - 4);
			// we add the info of the current annotation in the arrays
			// containing semantic info
			ids[i] = id;
			types[i] = type;
			startTimePoints[i] = startTimePoint;
			endTimePoints[i] = endTimePoint;
			i++;
		});
	});
	// now we get the descriptions of the found annotations
	console.log("start the semantic base");
	console.log(ids);
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
																	semanticId[indexId] = ids;
																	var regexp = /id=(.*)####name=/;
																	var regexp2;
																	var userName = lasClient
																			.getUsername();
																	responseId = (value
																			.match(regexp))[1];
																	// console.log("responseId
																	// "+responseId);
																	if (responseId == valueId) {
																		regexp = /####name=(.*)####definition=/;
																		// new
																		// regular
																		// expression
																		regexp2 = /_([a-z]*)/;
																		descriptions[indexId] = (value
																				.match(regexp))[1];
																		author[indexId] = (value
																				.match(regexp2))[1];
																		console
																				.log(value);
																		if ((value
																				.match(regexp2))[1] == " "
																				|| (value
																						.match(regexp2))[1] == "undefined") {
																			console
																					.log("try");
																		} else {
																			// isusername[indexId]
																			// =
																			// "";
																		}
																		// console.log("is
																		// user
																		// name
																		// = "
																		// +indexId
																		// +"asasas"
																		// +isusername[indexId]);
																		// here
																		// we
																		// will
																		// call
																		// the
																		// las
																		// service
																		// to
																		// get
																		// langitude
																		// and
																		// latitude
																		// of
																		// the
																		// place
																		// annotations
																		if (types[indexId] == "SemanticPlace") {
																			placeTypeAnnotationsIds
																					.push(ids[indexId]);
																			placeTypesAnnotationsDescs
																					.push(descriptions[indexId]);
																		}
																	}
																});
											});
							jQuery.each(ids, function(index, value) {
								data = data + '{ "id": "' + ids[index]
										+ '", "data": ["' + types[index]
										+ '", "' + descriptions[index] + '", "'
										+ startTimePoints[index] + '", "'
										+ endTimePoints[index] + '", "'
										+ author[index] + '", "'
										+ isusername[index] + '", "yyy"]}';
								if (index != ids.length - 1) {
									data = data + ',';
								}
							});
						}
						data = data + "]}";
						//after we have finished building the json with semantic annotations, we send it to the annotationsTable widget
						//for being displayed in a user readable format
						console.log("create the table");
						//clear the data in the annotations tables
						mygrid.clearAll();
						//populate the table with the new data
						mygrid.parse(jQuery.parseJSON(data), "json");
						// console.log(data);
						//make sure each cell has an attached id

						mygrid.enableCellIds(true);

						// -------------------------------------------------
						var userName = lasClient.getUsername();
						var rownumber = mygrid.getRowsNum();
						mygrid
								.forEachRow(function(id) {
									var authorid = mygrid.cellById(id, 4)
											.getValue();
									//console.log(authorid);
									//mygrid.cellById(id,5).setDisabled(true);
									//mygrid.cellById(id,5).setValue(0);
									console.log(rownumber);

									if (authorid == userName
											|| authorid == "admin") {

										mygrid
												.cellById(id, 5)
												.setValue(
														"https://raw.github.com/DadaMonad/sevianno/master/images/DELETE.png^delete annotations^javascript:deleteAnnotations(mygrid.getSelectedId(),mygrid.cellById(id,0).getValue(),mygrid.getRowsNum())^_self");
										mygrid
												.cellById(id, 6)
												.setValue(
														"https://raw.github.com/DadaMonad/sevianno/master/images/update.gif^update annotations^javascript:updateAnnotations(mygrid.getSelectedId(),mygrid.cellById(id,1).getValue(),mygrid.getRowsNum())^_self");

									} else {

										mygrid.cellById(id, 5).setValue("");
										mygrid.cellById(id, 6).setValue("");
									}

								})
						// --------------------------------------------------
						mygrid.sortRows(2, "str", "asc");

						hideLoadingOverlay();
						//map json

						//de aici
						/*
						 serviceName= "mpeg7_semanticbasetype_service";
						 methodName2 = "getSemanticPlaceType";
						 parametersAsJSONArray = new Array();
						 console.log("WILL GET THE PLACE TYPE"); 
						 var lat = 0;
						 var longitude = 0;
						 var alt = 0;
						 var callbackCounter = 0;
						 $(placeTypeAnnotationsIds).each(function(indexId,valueId){
						 parametersAsJSONArray[0] ={"type": "String", "value": valueId};
						 lasClient.invoke(serviceName, methodName2, parametersAsJSONArray, function(status,result){
						 callbackCounter = callbackCounter +1;
						 console.log(result);
						 //this function returns UNFORTUNATELY an xml; we now parse it, to get the latitude, longitude and altitude
						 placeXmlObj = $.parseXML(result.value);
						 console.log("#$%^&*^%$#@$%^&*^%$#$%^&*^%$#");
						 console.log(placeXmlObj);
						 $(placeXmlObj).find('Point').each(function(){
						 alt = $(this).attr("altitude");
						 lat = $(this).attr("latitude");
						 longitude = $(this).attr("longitude");
						 });
						 placeTypesAnnotationsLats.push(lat);
						 placeTypesAnnotationsLongs.push(longitude);
						 placeTypesAnnotationsAlts.push(alt);    
						 if (callbackCounter == placeTypeAnnotationsIds.length){
						 //sendMapIntent(placeTypeAnnotationsIds,placeTypesAnnotationsDescs,placeTypesAnnotationsLats,placeTypesAnnotationsLongs, placeTypesAnnotationsAlts);
						 }
						 });
						 });//pana aici
						 */
					});
}
function sendMapIntent(placeTypeAnnotationsIds, placeTypesAnnotationsDescs,
		placeTypesAnnotationsLats, placeTypesAnnotationsLongs,
		placeTypesAnnotationsAlts) {
	var mapJson = buildJsonForMap(placeTypeAnnotationsIds,
			placeTypesAnnotationsDescs, placeTypesAnnotationsLats,
			placeTypesAnnotationsLongs, placeTypesAnnotationsAlts);
	var mapJsonObject = jQuery.parseJSON(mapJson);
	//we send the vectors that are needed when adding new annotations to the addAnnotations widget
	var intent4 = {
		"component" : "",
		"action" : "ACTION_SEND_PLACE_TYPES_CONCEPTS",
		"data" : "www.example.org",
		"dataType" : "text/html",
		"flags" : [ "PUBLISH_GLOBAL" ],
		"extras" : {
			"mapJson" : mapJsonObject
		}
	};
	sendIntent(intent4);
	console
			.log("send intent with vecotors needed to add concepts to the add annotations widget");
}
function buildJsonForMap(placeTypeAnnotationsIds, placeTypesAnnotationsDescs,
		placeTypesAnnotationsLats, placeTypesAnnotationsLongs,
		placeTypesAnnotationsAlts) {
	var mapJson = '{ "tags" : [';
	jQuery.each(placeTypeAnnotationsIds, function(index, value) {
		mapJson = mapJson + '{"lat" : ' + placeTypesAnnotationsLats[index]
				+ ', "lng" : ' + placeTypesAnnotationsLongs[index]
				+ ', "alt" : ' + placeTypesAnnotationsAlts[index]
				+ ',"title" : "' + placeTypesAnnotationsDescs[index]
				+ '", "id" : "' + value + '"}';
		if (index != placeTypeAnnotationsIds.length - 1) {
			mapJson = mapJson + ',';
		}
	});
	mapJson = mapJson + '] ,"data_type": "placeTags" }';
	console.log("mapjson =" + mapJson);
	return mapJson;
}
function onLogin() {
	document.getElementsByClassName("fadeMe")[0].setAttribute("style",
			"display:none");
}
function onLogout() {
	document.getElementsByClassName("fadeMe")[0].setAttribute("style",
			"display:block");
}
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

//deletion of annotations 

function deleteAnnotations(deleteIdentities, semanticIdentities, rowsNo) {
	unCheckDeleterow = 1;
	showLoadingOverlay();
	console.log("1= " + deleteIdentities);
	console.log("2= " + deleteIdentities);
	console.log(rowsNo);
	var index = rowsNo;
	console.log(semanticIdentities);
	var intent = {
		"component" : "",
		"action" : "ACTION_ANNOTATIONS_GET_TIME_PAUSE",
		"data" : "www.example.org",
		"dataType" : "text/html",
		"flags" : [ "PUBLISH_GLOBAL" ]
	};
	sendIntent(intent);

	var intent = {
		"component" : "",
		"action" : "ACTION_DELETE_ANNOTATIONS",
		"data" : "www.example.org",
		"dataType" : "text/html",
		"flags" : [ "PUBLISH_GLOBAL" ],
		"extras" : {
			"index" : index,
			"semantic" : deleteIdentities
		}
	};
	sendIntent(intent);
	//hideLoadingOverlay();

	// mygrid.deleteRow(deleteIdentities);
	console.log(deleteIdentities);
	// serviceName= "mpeg7_semanticbasetype_service";
	// methodName = "removeConceptType";
	// parametersAsJSONArray = new Array();
	// parametersAsJSONArray[0] = {"type": "String", "value": deleteIdentities};
	// lasClient.invoke(serviceName, methodName, parametersAsJSONArray, function(status, response){
	// if(status==200)
	// {
	// console.log("removeConceptType");
	// console.log(response);
	// }
	//})

}

//update semantics

function updateAnnotations(deleteIdentities, annotationType, rowsNo) {
	//unCheckDeleterow = 1;
	var intent = {
		"component" : "",
		"action" : "ACTION_ANNOTATIONS_GET_TIME_PAUSE",
		"data" : "www.example.org",
		"dataType" : "text/html",
		"flags" : [ "PUBLISH_GLOBAL" ]
	};
	var index = rowsNo;
	sendIntent(intent);

	var intent = {
		"component" : "",
		"action" : "ACTION_UPDATE_ANNOTATIONS",
		"data" : "www.example.org",
		"dataType" : "text/html",
		"flags" : [ "PUBLISH_GLOBAL" ],
		"extras" : {
			"index" : index,
			"semantic" : deleteIdentities,
			"type" : annotationType
		}
	};
	sendIntent(intent);

}

gadgets.util.registerOnLoadHandler(init);
