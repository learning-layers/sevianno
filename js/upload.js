// LAS Connection Related 
var appCode = "vc"; 
var lasurl = "http://steen.informatik.rwth-aachen.de:9914/"; 
var lasSessionId = "";
var lasUser = "";
var duiClient;
var lasClient;


// Upload Button related
function loaduploadView(){
  $('#swfupload-control').swfupload({
    upload_url: "http://merian.informatik.rwth-aachen.de:5080/ClViTra/FileUploadServlet",
    //upload_url: "http://localhost:8080/ClViTra/FileUploadServlet",
    file_post_name: lasUser+":"+lasSessionId,
    file_size_limit : "1048576",
    file_types : "*.mp4;*.avi;*.mpg;*.flv;*.wmv;*.3gp;*.mov;*.mts;*.swf",
    file_types_description : "Video files",
    file_upload_limit : 10,
    flash_url : "http://dl.dropbox.com/u/18619630/widgets/sevianno/upload/js/swfupload/swfupload.swf",
    button_image_url : 'https://raw.github.com/DadaMonad/sevianno/master/images/wdp_buttons_upload_114x29.png',
    button_width : 114,
    button_height : 29,
    button_placeholder : $('#button')[0],
    debug: false
  })
    .bind('fileQueued', function(event, file){
      var listitem='<li id="'+file.id+'" >'+
        'File: <em>'+file.name+'</em> ('+Math.round(file.size/1024)+' KB) <span class="progressvalue" ></span>'+
        '<div class="progressbar" ><div class="progress"></div></div>'+
        '<p class="status" >Pending</p>'+
        '<span class="cancel" >&nbsp;</span>'+
        '</li>';
      $('#log').append(listitem);
      $('li#'+file.id+' .cancel').bind('click', function(){
        var swfu = $.swfupload.getInstance('#swfupload-control');
        swfu.cancelUpload(file.id);
        $('li#'+file.id).slideUp('fast');
        gadgets.window.adjustHeight();
      });
      // start the upload since it's queued
      $(this).swfupload('startUpload');
      
    })
    .bind('fileQueueError', function(event, file, errorCode, message){
      alert('Size of the file '+file.name+' is greater than limit');
    })
    .bind('fileDialogComplete', function(event, numFilesSelected, numFilesQueued){
      $('#queuestatus').text('Files Selected: '+numFilesSelected+' / Queued Files: '+numFilesQueued);
      gadgets.window.adjustHeight();
    })
    .bind('uploadStart', function(event, file){
      $('#log li#'+file.id).find('p.status').text('Uploading...');
      $('#log li#'+file.id).find('span.progressvalue').text('0%');
      $('#log li#'+file.id).find('span.cancel').hide();
    })
    .bind('uploadProgress', function(event, file, bytesLoaded){
      //Show Progress
      var percentage=Math.round((bytesLoaded/file.size)*100);
      $('#log li#'+file.id).find('div.progress').css('width', percentage+'%');
      $('#log li#'+file.id).find('span.progressvalue').text(percentage+'%');
    })
    .bind('uploadSuccess', function(event, file, serverData){
      var item=$('#log li#'+file.id);
      item.find('div.progress').css('width', '100%');
      item.find('span.progressvalue').text('100%');
      var pathtofile='<a target="_newtab" href="http://merian.informatik.rwth-aachen.de:5080/ClViTra/gallery.jsp" >view &raquo;</a>';
      item.addClass('success').find('p.status').html('Done!!! | '+pathtofile);
    })
    .bind('uploadComplete', function(event, file){
      // upload has completed, try the next one in the queue
      $(this).swfupload('startUpload');
    });
  
} 

var lasFeedbackHandler = function(statusCode, message) { 
  switch(statusCode) { 
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
    //alert("Logged in successfully SS!"); 
    //document.getElementById("output").innerHTML = message + "SESSION ID is: " +  lasClient.getSessionId(); 
    lasSessionId = lasClient.getSessionId();
    lasUser = lasClient.getUsername();
    document.getElementById("swfupload-control").style.display = "";
    loaduploadView();
    showUpload();
  break; 
  case Enums.Feedback.LogoutSuccess: 
    //alert("Logged out successfully sss!"); 
    document.getElementById("swfupload-control").style.display = "none";
  break; 
  case Enums.Feedback.LoginError: alert("Login failed! Message: " + message); 
  //document.getElementById("output").innerHTML = message; 
  break; 
  case Enums.Feedback.LogoutError: alert("Logout failed! Message: " + message); 
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
};

lasClient = new LasAjaxClient("sevianno",lasFeedbackHandler);



function showUpload(){
  if(lasClient.getStatus() == "loggedIn"){
    console.log("loggedIn true!");
    gadgets.window.adjustHeight();
  }else{
    console.log("not loggedIn!");
    gadgets.window.adjustHeight(0);
  }
}

gadgets.util.registerOnLoadHandler(init);

function iwcCallback(intent){
  
  console.log("***************upload**********");
  console.log(intent);
  
  if(intent.action == "ADDED_TO_MPEG7"){
    console.log("************************* ADDED_TO_MPEG7----ADDED_TO_MPEG7");
    //document.getElementById("output").innerHTML = "Video is added to MPEG7 "+ intent.extras["videoURL"]; 
    console.log(intent);
    gadgets.window.adjustHeight();
  }else if(intent.action == "LAS_INFO"){  
    
    if (intent.extras != null && intent.extras.userName != null && intent.extras.session != null){
      lasSessionId = intent.extras.session;
      lasUser = intent.extras.userName;
      lasClient.setCustomSessionData(intent.extras.session, intent.extras.userName, lasurl, appCode); 
    }
  }else if(intent.action == "ACTION_LOGOUT"){   
    lasClient.logout();
  }
  
  
}

//------------------------------------------------------------------------------------keli
  var onFinishMig = function(intent){};
//---------------------------------------------------------------------------------------
  
function init(){
  console.log("init is called");
  //iwcClient = new iwc.Client(["*"]);

  //iwcClient.connect(iwcCallback);
  
//-----------------------------------------------------------------------------------keli       
  duiClient = new DUIClient();
  duiClient.connect(iwcCallback);
  duiClient.finishMigration = onFinishMig;
//  duiClient.getWidgetState
//  duiClient.prepareMigration
//  duiClient.changeWithApp
//  duiClient.updateState
  duiClient.initOK();
  if (lasClient.getStatus() != "loggedIn"){
    var lasIntent = {
        "action": "GET_LAS_INFO",
        "component": "",
        "data": "",
        "dataType": "",
      };
    duiClient.publishToUser(lasIntent);
  }
//------------------------------------------------------------------------------------- 
}

