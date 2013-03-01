var XboxController = require("xbox-controller");
var arDrone = require('ar-drone');
var drone = new arDrone.createClient();

var xbox = new XboxController();
// give your laptop eyes

var http = require("http"),
    dronestream = require("dronestream");




var ANIMATION_LENGTH = 10000;   // in ms
var INFLIGHT = false;
var mapping = {
	"leftshoulder:press": "counterClockwise",
	"rightshoulder:press": "clockwise",
	"dup:press": "front",
	"ddown:press": "back",
	"dleft:press": "left",
	"dright:press": "right",
	"back:press": "wave",
	"y:press": "up",
	"x:press": "down",
	"lefttrigger": "flipLeft",
	"righttrigger": "flipRight"
};
xbox.on('start:press', function(position){
  if(INFLIGHT) {
		drone.stop();
		drone.land();		
	} else {
		drone.disableEmergency();
		drone.takeoff();
	}
	INFLIGHT = !INFLIGHT;
})



for (var e in mapping) {
	var startAnimation = (function (action) {
		return function (position) {
			console.log(position);
			console.log("start: "+ action);
			if (typeof drone[action] == "function") {
				console.log("action");
				drone[action](1)
			} else {
				console.log("animation");
				drone.animate(action, (action.indexOf("flip") >=0 ? 100 : ANIMATION_LENGTH));
			}
		};
	}(mapping[e]));
	var stopAnimation = (function (action) { 
		return function (position) {
			console.log(position);
			console.log("stop: "+ action);
			if (typeof drone[action] == "function") {
				console.log("stop action");
				drone[action](0)
			} else {
				console.log("stop animation");
				drone.animate(action, (action.indexOf("flip") >=0 ? 100 : ANIMATION_LENGTH));
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

dronestream.listen(server);
server.listen(5555);
//open up and watch.
require("child_process").exec("open http://127.0.0.1:5555/");