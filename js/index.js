var rawData;
var raceChart;

function googleAnalytics() {
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-64783852-1', 'auto');
	ga('send', 'pageview');
}

document.addEventListener("DOMContentLoaded", function(event) {
	loadCSVText();
	setupListeners();
});

function setupListeners() {
	var racePercentCheckBox = document.getElementById("racePercent");
	racePercentCheckBox.addEventListener("change", function() {
		raceChart.destroy();
		loadRaceChart(rawData);
	});
	
	var statePercentCheckBox = document.getElementById("statePercent");
	statePercentCheckBox.addEventListener("change", function() {
		var table = document.getElementById("stateTable");
		var tbody = document.getElementById("stateTBody");
		table.removeChild(tbody);
		loadStateMapAndChart(rawData, false);
	});
}

function loadCharts(rawData) {
	loadRaceChart(rawData);
	loadDateChart(rawData);
	loadStateMapAndChart(rawData, true);
	loadGenderChart(rawData);
	loadMentalIllnessChart(rawData);
	googleAnalytics();
}

function loadCSVText() {
	var rawFile = new XMLHttpRequest();
	rawFile.onreadystatechange = function () {
		if (rawFile.readyState === 4) {
				if (rawFile.status === 200) {
					var allText = rawFile.responseText;
					processData(allText);
				}
		}
	};
	rawFile.open("GET", "fatal-police-shootings-data.txt", true);
	rawFile.send(null);
}

//Adopted from http://stackoverflow.com/questions/7431268/how-to-read-data-from-csv-file-using-javascript
function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i=1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {
            var tarr = [];
            for (var j=0; j < headers.length; j++) {
                tarr.push(headers[j]+":"+data[j]);
            }
            lines.push(tarr);
        }
    }
	
	rawData = lines;
	loadCharts(rawData); //Initial chart loading call
}

function loadRaceChart(rawData) {
	var data = [];
	var races = {"Asian": 0, "White": 0, "Hispanic": 0, "Black": 0, "Other": 0};
	var total = rawData.length;
	
	for (var i = 1; i < rawData.length; i++) {
		var race = rawData[i][7];
		switch (race) {
			case "race:A":
				races["Asian"] += 1;
				break;
			case "race:W":
				races["White"] += 1;
				break;
			case "race:H":
				races["Hispanic"] += 1;
				break;
			case "race:B":
				races["Black"] += 1;
				break;
			case "race:O":
				races["Other"] += 1;
				break;
			default:
				total -= 1;
		}
	}
	
	var racePercentCheckBox = document.getElementById("racePercent");
	if (racePercentCheckBox.checked == true) {
		var total = races["Asian"] / .047 + races["White"] / .637 + races["Hispanic"] / .163 + races["Black"] / .122 + races["Other"] / .0295;
		races["Asian"] = (((races["Asian"] / .047) / total) * 100).toFixed(1);
		races["White"] = (((races["White"] / .637) / total) * 100).toFixed(1);
		races["Hispanic"] = (((races["Hispanic"] / .163) / total) * 100).toFixed(1);
		races["Black"] = (((races["Black"] / .122) / total) * 100).toFixed(1);
		races["Other"] = (((races["Other"] / .0295) / total) * 100).toFixed(1);
		data["labels"] = ["Other %", "Asian %", "Hispanic %", "Black %", "White %"];
	} else {
		data["labels"] = ["Other #", "Asian #", "Hispanic #", "Black #", "White #"];
	}
	
	/** Data format for polar graph, doesn't work well for Asian/Other who have low representation, works for PieCharts though
	data[0] = {value: races["Asian"], color:"#BDC3C7", highlight:"#D2D7D3", label:"Asian"};
	data[2] = {value: races["White"], color:"#BE90D4", highlight:"#AEA8D3", label:"White"};
	data[3] = {value: races["Hispanic"], color:"#1E8BC3", highlight:"#89C4F4", label:"Hispanic"};
	data[4] = {value: races["Black"], color:"#26A65B", highlight:"#90C695", label:"Black"};
	data[1] = {value: races["Other"], color:"#F89406", highlight:"#EB9532", label:"Other"};
	**/
	
	data["datasets"] = [
		{
			fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            highlightFill: "rgba(151,187,205,0.1)",
            highlightStroke: "rgba(151,187,205,1)",
			data: [races["Other"], races["Asian"], races["Hispanic"], races["Black"], races["White"]]
		}
	];
	
	var ctx = document.getElementById("raceChart").getContext("2d");
	raceChart = new Chart(ctx).Bar(data);
}

function loadDateChart(rawData) {
	var data = [];
	var dates = {};
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var d = new Date();
	
	for (var i = 0; i < rawData.length; i++) {
		var date = rawData[i][2];
		date = date.substring(5, 7);
		var year = rawData[i][2];
		year = year.substring(year.length - 4, year.length);

		// If not a two digit month then remove forward slash, two digit months won't have slash
		if (date.indexOf("/") == 1) {
			date = parseInt(date.substring(0, 1)) - 1;
		} else {
			date = parseInt(date) - 1;
		}
		
		if (parseInt(year) != d.getFullYear() || date != d.getMonth()) { //Prevent adding data for a month before the month is over, expect if year's already passed
			if (months[date] in dates) {
				dates[months[date]] += 1;
			} else {
				dates[months[date]] = 1;
			}
		}
	}
	
	date_values = [];
	for (var key in dates) {
		date_values.push(dates[key]);
	}
	
	data["labels"] = months;
	data["datasets"] = [
		{
			label: "Shootings by date",
			fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
			data: date_values
		}
	];
	
	var ctx = document.getElementById("dateChart").getContext("2d");
	dateChart = new Chart(ctx).Line(data, {
		bezierCurve: true,
		bezierCurveTension: 0.4,
		scaleOverride: true,
		scaleSteps: 3,
		scaleStepWidth: Math.ceil(100 / 3),
		scaleStartValue: 0,
		pointDotRadius: 4,
		pointHitDetectionRadius: 4
	});	
}

function loadStateMapAndChart(rawData, loadMap) {
	var data = {};
	var states = {};
	var sorted = [];
	var map = {};
	
	//This was so time consuming and boring to write out, you should check out Hippie Sabotage
	var statePercentage = {
		"CA": .1217, "TX": .0845, "FL": .0624, "NY": .0619, "IL": .0404, "PA": .0401, "OH": .0364, "GA": .0317, "NC": .0312, "MI": .0311, "NJ": .028, "VA": .0261, "WA": .0221, "MA": .0212, "AZ": .0211, "IN": .0207, "TN": .0205, "MO": .0190,
		"MD": .0187, "WI": .0181, "MN": .0171, "CO": .0168, "AL": .0152, "SC": .0152, "LA": .0146, "KY": .0138, "OR": .0125, "OK": .0122, "CT": .0113, "IA": .0097, "MS": .0094, "AR": .0093, "UT": .0092, "KS": .0091, "NV": .0089, "NM": .0065,
		"NE": .0059, "WV": .0058, "ID": .0051, "HI": .0045, "ME": .0042, "NH": .0042, "RI": .0033, "MT": .0032, "DE": .0029, "SD": .0027, "ND": .0023, "AK": .0023, "DC": .0021, "VT": .0020, "WY": .0018
	};
	
	var stateAbrFlipped = {"Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA","Colorado":"CO","Connecticut":"CT","Delaware":"DE","Florida":"FL","Georgia":"GA","Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS",
	"Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD","Massachusetts":"MA","Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ",
	"New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND","Ohio":"OH","Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT",
	"Vermont":"VT","Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY", "Washington DC":"DC"};
	
	//Didn't want to take the time to manually flip the key/value pairs I copy pasted so I'll let a for loop do it, efficient and lazy
	var stateAbr = {};
	for (var key in stateAbrFlipped) {
		stateAbr[stateAbrFlipped[key]] = key;
	}
	
	for (var i = 0; i < rawData.length; i++) {
		var state = rawData[i][9];
		state = state.substring(6);
		if (state in states) {
			states[state] += 1;
		} else {
			states[state] = 1;
		}
	}
	
	var statePercentCheckBox = document.getElementById("statePercent");
	if (statePercentCheckBox.checked == true) {
		var total = 0;
		// Sum up total to put states relative to
		for (var key in states) {
			total += states[key] / statePercentage[key];
		}

		for (var key in states) {
			sorted.push({name: key, val: (((states[key] / statePercentage[key]) / total) * 100).toFixed(1)});
			map[key] = {val : states[key]};
		}			
	} else {
		for (var key in states) {
			sorted.push({name: key, val: states[key]});
			map[key] = {val : states[key]};
		}	
	}

	// Don't load new map everytime
	if (loadMap) {
		var usaMap = new Datamap({
			scope: 'usa',
			element: document.getElementById('stateMap'),
			height: 350,
			width: 550,
			geographyConfig: {
				highlightBorderColor: '#bada55',
				popupTemplate: function(geography, data) {
					return '<div class="hoverinfo" style="position: absolute; left: 10px; background-color: black; color: white; opacity: 0.8; border-radius: 5px; width:100px"><strong>' + geography.properties.name + '</strong><br>Shootings: ' + data.val + '</div>';
				},
				highlightBorderWidth: 3
			},
			fills: {
				defaultFill: 'rgba(151,187,205,0.8)'
			},
			data: map
		});
		usaMap.labels();
	}

	
	sorted.sort(function(a,b) {
		return b.val - a.val;
	});
	
	var table = document.getElementById("stateTable");
	var tbody = document.createElement("tbody");
	tbody.setAttribute("id", "stateTBody");
	
	for (var r = 0; r < 10; r++) {
		var row = document.createElement("tr");
		for (var c = 0; c < 2; c++) {
			var cell = document.createElement("td");
			if (c == 0) {
				var cellText = document.createTextNode(stateAbr[sorted[r].name]);
			} else {
				if (statePercentCheckBox.checked == true) {
					var cellText = document.createTextNode(sorted[r].val + "%");
				} else {
					var cellText = document.createTextNode(sorted[r].val);
				}
			}
			cell.appendChild(cellText);
			row.appendChild(cell);
		}
		tbody.appendChild(row);
	}
	table.appendChild(tbody);
}

function loadGenderChart(rawData) {
	var data = [];
	var gender = [0, 0];
	
	for (var i = 0; i < rawData.length; i++) {
		var g = rawData[i][6];
		if (g === "gender:M") {
			gender[0] += 1;
		} else {
			gender[1] += 1;
		}
	}
	
	data[1] = {
		value: gender[0],
		color: "rgba(151,187,205,0.8)",
        highlight: "rgba(151,187,205, 0.6)",
		label: "Male"
	};
	
	data[0] = {
		value: gender[1],
        color:"rgba(247, 70, 74, 0.8)",
        highlight: "rgba(247, 70, 74, 0.6)",
		label: "Female"
	};
	
	var ctx = document.getElementById("genderChart").getContext("2d");
	var genderChart = new Chart(ctx).Doughnut(data);
}

function loadMentalIllnessChart(rawData) {
	var data = {};
	var races = {"race:A": 0, "race:W": 0, "race:H": 0, "race:B": 0, "race:O": 0};
	var total = {"race:A": 0, "race:W": 0, "race:H": 0, "race:B": 0, "race:O": 0};
	
	//var raceSelect = document.getElementById("raceSelect");
	
	for (var i = 0; i < rawData.length; i++) {
		var m = rawData[i][10];
		var r = rawData[i][7];
		if (m === "signs_of_mental_illness:TRUE") {
			races[r] += 1;
		}
		total[r] += 1;
	}
	
	data["labels"] = ["White", "Black", "Hispanic", "Asian", "Other"];
	data["datasets"] = [
		{
			label: "Mental Illness Percent by Race",
			fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
			data: [(races["race:W"]/total["race:W"] * 100).toFixed(2), (races["race:B"]/total["race:B"] * 100).toFixed(2), (races["race:H"]/total["race:H"] * 100).toFixed(2),
				(races["race:A"]/total["race:A"] * 100).toFixed(2), (races["race:O"]/total["race:O"] * 100).toFixed(2)]
		}
	];
	
	var ctx = document.getElementById("mentalChart").getContext("2d");
	var mentalChart = new Chart(ctx).Radar(data,
		{
			 pointLabelFontSize : 14,
			 pointDotRadius: 5
		}
	);
}
