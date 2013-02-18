window.zones = [];
window.duplicates = [];
window.activeIndex = null;

init = function(response) {
	
	if (typeof(response.zones) == "undefined" || !response.zones)
		return;

	// check duplicates
	var duplicateCheck = {};
	$(response.zones).each(function(key, value){
			if (duplicateCheck[value.guid]){
				window.duplicates.push(value);
			} else {
				window.zones.push(value);
				duplicateCheck[value.guid] = true;
			};
	});

	// set activeIndex
	if (response.highlighted) {
		$(window.zones).each(function(index, value){
				if (value.guid == response.highlighted) {
					window.activeIndex = index;
				}
		});
	} else {
		window.activeIndex = 0;
	}

	// check for implementation errors

	$(window.duplicates).each(function(index, value){
			message("warning", "Zone " + format("# ##0.", value.guid) + " is duplicated");
	});

	if (!response.scripts || response.scripts.length == 0) {
		message("error", "Missing goa3.js");
	} else {
		if (response.scripts.length > 1)
			message("warning", "Multiple instances of goa3.js");

		$(response.scripts).each(function(index, value){
				if (value.head) {
					message("error", "goa3.js in &lt;head&gt;");
				}
		});
	}

	render();
}

next = function() {
	if (window.zones.length - 1 > window.activeIndex) {
		window.activeIndex++;
	} else {
		window.activeIndex = 0;
	}
	render();
}

prev = function() {
	if (window.activeIndex > 0) {
		window.activeIndex--;
	} else {
		window.activeIndex = window.zones.length - 1;
	}
	render();
}

render = function() {
	var z = window.zones[window.activeIndex];
	if (!z) {
		// error?
		return;
	}

	var msg = format("# ##0.", z.guid);
	if (!z.visible) {
		msg += " (invisible)";
	}
	$("#label").val(msg);
	$("#count").text(window.activeIndex + 1 + " of " + window.zones.length);

	// tell content.js that we want to highlight a zone
	if (z.visible) {
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendMessage(tab.id, {highlight: window.zones[window.activeIndex].guid}, null);
		});
	}
}

$(document).ready(function() {

	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendMessage(tab.id, {command: "getZoneList"}, init);
	});

	$("#next").click(function() {next()});
	$("#prev").click(function() {prev()});

	$(document).keypress(function(e) {
		if(e.which == 13) {
			if (e.shiftKey) {
				prev()
			} else {
				next();
			}
		}
	});

});

message = function(level, message) {
	var msg = "<div>";
	if (level == "warning") {
		msg += "<i class='warning icon-warning-sign'></i>"
	} else if (level == "combo") {
		msg += "<i class='combo icon-trophy'></i>"
	} else if (level == "info") {
		msg += "<i class='info icon-comment-alt'></i>"
	} else if (level == "error") {
		msg += "<i class='error icon-exclamation-sign'></i>"
	}
	msg += "<span>" + message + "</span></div>";
	$("#messages").append(msg);
	$("#messages").css("display", "block");
}

