/**
*	Use openapp to save app state.
**/

Sevianno = function(space) {

	var _space = space;
	var videoIdType = "http://dbis.rwth-aachen.de/gadgets/sevianno";
	
	this.setAppState = function(state) {
		var md = {"videoId":state.id};
		// md["videoId"] = state.id; 
		
		// OpenApp: within the space create a new data sub-resource as a new entry typed with the respective namespace (you defined above). 
		// also provide the metadata.
		_space.create({
			relation: openapp.ns.role + "data",
			type: "my:ns:note",
			representation: md,
			callback: function(sub) {
				console.log("app state saved! " + sub);
			}
		});
	};
	
	this.getAppState = function() {
		_space.getSubResources({
			  relation: openapp.ns.role + "data",
			  type: "my:ns:note",
			  onEach: function(note) {
					note.getRepresentation("rdfjson", function(r) {
						console.log(r.videoId);
					});
			}
		});
	}
	
};