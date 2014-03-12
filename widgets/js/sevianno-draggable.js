   
var init_dragable = function(){

    if($("#q") == null || typeof $("#q").draggable !== 'function') {
        //gadgets.util.registerOnLoadHandler(init_dragable);
		//throw new Error("please include $.ui");
    }else { 
	    if($(".sevianno_autoresize") != "undefined"){
			//$(".sevianno_autoresize").height("100%");
		}
        $("#q").draggable({
           axis: "y",
            start: function(){
                var $a = $(".sevianno_autoresize");
                $a.css('bottom', 'inherit');
				
				var $c = $("#canvas-frame");
                $c.css('bottom', 'inherit');
                $(this).css('height',20);
            },
            drag: function( event, ui ) {
                var height = ui.position.top-15;
                $("#canvas-frame").css('height', height);
                if($(".sevianno_autoresize") != "undefined"){
                    $(".sevianno_autoresize").css('height', height);
                }
				gadgets.window.adjustHeight();

            },
            stop: function(){
                $(this).css('height',5);
                gadgets.window.adjustHeight();
                $(this).css('top','');
            }
        });
    }
    
}
gadgets.util.registerOnLoadHandler(init_dragable);
