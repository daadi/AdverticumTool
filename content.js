/**
 * content.js for Adverticum Zones extension
 *
 * Finds Adverticum Zones (only goAdverticum) and goa3.js instances in the page.
 *
 */

/* 
 * currently highlighted item
 * initialized in highlight()
 */
window.highlighted = null;

construct = function(){
	var zones = [];

	$(".goAdverticum").each(function(index, elem){
			var element = $(elem);
			var guid = element.attr("id").substr(4);
			
			zones.push({guid: guid, visible: element.is(":visible")});

			if (element.hasClass("___goaExtZone")){
				return;
			}

			element.prepend("<span class='___goaExtLabel'>Zone " + format("# ##0.", guid) + "</span>");
			element.addClass("___goaExtZone");
	});

	return zones;
}

getScripts = function(){
	var scripts = [];

	$("script[src$='goa3.js'],script[src$='g3.js']").each(function(index, element){
			var element = $(element);
			var src = element.attr("src");

			scripts.push({src: src, head: element.is("head *")});

			if (!element.prev().is(".___goaExtGoa3Script")) {
				element.before("<div class='___goaExtGoa3Script'>Goa3 (" + src + ")</div>");
			}
	});

	return scripts;
}

highlight = function(zoneId)
{
	if (window.highlighted) {
		// remove previous highlight, if any
		window.highlighted.removeClass("___goaExtHighlighted");
	}

	window.highlighted = $("#zone" + zoneId);

	window.highlighted.addClass("___goaExtHighlighted");

	$('html, body').animate({
		scrollTop: window.highlighted.offset().top - 100
		}, 200);
}

chrome.extension.onMessage.addListener(

		function(request, sender, sendResponse) {

			// get zone list
			if (request.command == "getZoneList") {
				sendResponse({
					zones: construct(), 
					highlighted: window.highlighted 
													? window.highlighted.attr("id").substr(4) 
													: null,
					scripts: getScripts()
				});
			}

			// highlight a given zone
			if (request.highlight)
				highlight(request.highlight);
	}
);
