var Queue           = require('./models/queue');
module.exports = function(q, log_id, userId, game, platform, region, modeName, modePlayers, atf, logIdArr) {
	var json = {
		game          : game,
		platform      : platform, 
		region        : region,
		modeName      : modeName,
		modePlayers   : modePlayers
	};
	Queue.findOne({game: json.game, platform: json.platform, region: json.region, modeName: json.modeName, modePlayers: json.modePlayers},
	function(err, queue) {
		if (queue) {
			q[queue.qNr].push({log_id: log_id, userId: userId, modePlayers: modePlayers, i: queue.qNr, atf: atf, logIdArr: logIdArr}, function(err) {

			});
		}
	});
}