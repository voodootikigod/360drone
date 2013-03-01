var XboxController = require("xbox-controller");
var arDrone = require('ar-drone');
var drone = new arDrone.createClient();
var xbox = new XboxController();
// give your laptop eyes

var http = require("http"),
    drone = require("dronestream");




var ANIMATION_LENGTH = 10000;   // in ms
var INFLIGHT = false;
var mapping = {
	"lefttrigger": "counterClockwise",
	"righttrigger": "clockwise",
	"dup:press": "front",
	"ddown:press": "back",
	"dleft:press": "left",
	"dright:press": "right",
	"back:press": "wave",
	"x:press": "up",
	"y:press": "down",
	"leftshoulder:press": "flipLeft",
	"rightshoulder:press": "flipRight"
};
xbox.on('start:press', function(position){
  if(INFLIGHT) {
		drone.stop();
		drone.land();		
	} else {
		drone.disableEmergency();
		drone.takeoff();
	}
	this.started = !this.started;
})



for (var e in mapping) {
	var startAnimation = (function (action) {
		return function (position) {
			if (typeof drone[action] == "function") {
				drone[action](1)
			} else {
				drone.animate(action, (action.indexOf("flip") >=0 ? 100 : ANIMATION_LENGTH));
			}
		};
	}(mapping[e]));
	var stopAnimation = (function (action) { 
		return function (position) {
			if (typeof drone[action] == "function") {
				drone[action](0)
			}
		};
	}(mapping[e]));
	xbox.on(e, startAnimation);
	if (e.indexOf(":press") >= 0) {
		xbox.on(e.replace(":press", ":release"), stopAnimation);	
	}
}



var server = http.createServer(function(req, res) {
  require("fs").createReadStream(__dirname + "/index.html").pipe(res);
});

drone.listen(server);
server.listen(5555);
//open up and watch.
require("child_process").exec("open http://127.0.0.1:5555/");