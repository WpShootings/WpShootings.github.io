var rawData;
var raceChart;

document.addEventListener("DOMContentLoaded", function(event) {
	initializeChart();
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
		loadStateChart(rawData);
	});
}

function loadCharts(rawData) {
	loadRaceChart(rawData);
	loadDateChart(rawData);
	loadStateChart(rawData);
	loadGenderChart(rawData);
}

function initializeChart() {
	//var ctx = document.getElementById("myChart").getContext("2d");
	//var newChart = new Chart(ctx).PolarArea(data);
}

function loadCSVText() {
	console.log("Loading text");
	var rawFile = new XMLHttpRequest();
	rawFile.onreadystatechange = function () {
		console.log("state change " + rawFile.readyState + " " + rawFile.status);
		if (rawFile.readyState === 4) {
				if (rawFile.status === 200) {
					console.log("Sending to processData");
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
	console.log("Processing text");
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
	loadCharts(rawData);
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
			fillColor: "rgba(220,220,220,0.5)",
            strokeColor: "rgba(220,220,220,0.8)",
            highlightFill: "rgba(220,220,220,0.75)",
            highlightStroke: "rgba(220,220,220,1)",
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
		date = parseInt(date.substring(5, 6)) - 1;
		if (date != d.getMonth()) { //Prevent adding data for a month before the month is over
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
			fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
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

function loadStateChart(rawData) {
	var data = {};
	var states = {};
	var sorted = [];
	
	//This was so time consuming and boring to write out, you should check out Hippie Sabotage
	var statePercentage = {
		"CA": .1217, "TX": .0845, "FL": .0624, "NY": .0619, "IL": .0404, "PA": .0401, "OH": .0364, "GA": .0317, "NC": .0312, "MI": .0311, "NJ": .028, "VA": .0261, "WA": .0221, "MA": .0212, "AZ": .0211, "IN": .0207, "TN": .0205, "MO": .0190,
		"MD": .0187, "WI": .0181, "MN": .0171, "CO": .0168, "AL": .0152, "SC": .0152, "LA": .0146, "KY": .0138, "OR": .0125, "OK": .0122, "CT": .0113, "IA": .0097, "MS": .0094, "AR": .0093, "UT": .0092, "KS": .0091, "NV": .0089, "NM": .0065,
		"NE": .0059, "WV": .0058, "ID": .0051, "HI": .0045, "ME": .0042, "NH": .0042, "RI": .0033, "MT": .0032, "DE": .0029, "SD": .0027, "ND": .0023, "AK": .0023, "DC": .0021, "VT": .0020, "WY": .0018
	};
	
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
		for (var key in states) {
			total += states[key] / statePercentage[key];
		}
		
		for (var key in states) {
			sorted.push({name: key, val: (((states[key] / statePercentage[key]) / total) * 100).toFixed(1)});
		}			
	} else {
		for (var key in states) {
			sorted.push({name: key, val: states[key]});
		}	
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
				var cellText = document.createTextNode(sorted[r].name);
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

function loadGenderChart(rawChart) {
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
	console.log(gender);
	
	data[0] = {
		value: gender[0],
		color: "#46BFBD",
        highlight: "#5AD3D1",
		label: "Male"
	};
	
	data[1] = {
		value: gender[1],
        color:"#F7464A",
        highlight: "#FF5A5E",
		label: "Female"
	};
	
	var ctx = document.getElementById("genderChart").getContext("2d");
	var genderChart = new Chart(ctx).Pie(data);
}
