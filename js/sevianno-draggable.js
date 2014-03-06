   
var init_dragable = function(){
    if(typeof $("#q").draggable !== 'function') 
            gadgets.util.registerOnLoadHandler(init_dragable);
    else { 
        $("#q").draggable({
           axis: "y",
            start: function(){
                var $c = $("#canvas-frame");
                $c.css('bottom', 'inherit');
                $(this).css('height',50);
            },
            drag: function( event, ui ) {
                var height = ui.position.top;
                $("#canvas-frame").css('height', height);
                gadgets.window.adjustHeight();
            },
            stop: function(){
                $(this).css('height',3);
                gadgets.window.adjustHeight();
                $(this).css('top','');
            }
        });
    }
}
gadgets.util.registerOnLoadHandler(init_dragable);
