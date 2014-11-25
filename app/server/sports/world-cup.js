module.exports = function () {
	var unirest = require('unirest');
	var fifaToISO = {
		BRA:"br", NED:"nl", AUS:"au", ESP:"es", CHI:"cl", CRO:"hr", CMR:"cm", COL:"co",
		MEX:"mx", CIV:"ci", ENG:"gb", URU:"uy", GRE:"gr", JPN:"jp", ITA:"it", CRC:"cr",
		FRA:"fr", SUI:"ch", ECU:"ec", HON:"hn", IRN:"iran", ARG:"ar", GER:"de", GHA:"gh",
		NGA:"ne", BIH:"ba", BEL:"be", RUS:"ru", POR:"pt", USA:"us", ALG:"dz", KOR:"kr"
	};
	var groupIdtoLetter = ["", "A", "B", "C", "D", "E", "F", "G", "H"];
	var exportVariable = {};
	var groups = { A:[], B:[], C:[], D:[], E:[], F:[], G:[], H:[] };
	//.headers({ 'Accept': 'application/json' })
	unirest.get('http://worldcup.sfg.io/teams/').send().end(function (response) {
		var teams = response.body;
		for (var x in teams) {
			teams[x].country_code = fifaToISO[teams[x].fifa_code];
			groups[groupIdtoLetter[teams[x].group_id]].push(teams[x]);
		}
		exportVariable.groups = groups;
		//console.log(groups);
	});
	return exportVariable;
};
