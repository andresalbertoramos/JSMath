$(function(){

	$("#accordionConfig").accordion({ header: "h3",
					  autoHeight: false,
					  icons: {header: 'ui-icon-circle-plus',
						  headerSelected: 'ui-icon-circle-minus'}});

	$("#accordionHelp").accordion({ header: "h3",
					autoHeight: false,
					icons: {header: 'ui-icon-plusthick',
					        headerSelected: 'ui-icon-minusthick'}});

	$('#tabs').tabs();

	$("#red, #green, #blue").slider({
		orientation: 'horizontal',
		range: "min",
		max: 255,
		value: 127,
		slide: refreshSwatch,
		change: refreshSwatch
	});
	$("#red").slider("value", 255);
	$("#green").slider("value", 0);
	$("#blue").slider("value", 0);

	$("#anchoLinea").slider({
		value: ancho,
		min: 1,
		max: 10,
		step: 1,
		range: "min",
		slide: function(event, ui) {
			$("#ancho").val(ui.value + ' pixels');
			ancho = ui.value;
		}
	});
	$("#ancho").val($("#anchoLinea").slider("value") + ' pixels');

	$("#xRange").slider({
		range: true,
		min: -20,
		max: 20,
		values: [rangoX.min, rangoX.max],
		slide: function(event, ui) {
			$("#xMin").val(ui.values[0]);
			$("#xMax").val(ui.values[1]);
			rangoX.min = ui.values[0];
			rangoX.max = ui.values[1];
			clearContext($("#grafico")[0].getContext('2d'));
			updateContextViewValues(gWidth, gHeight);
			reSize($("#grafico")[0].getContext('2d'), gWidth, gHeight);
		}
	});
	$("#xMin").val($("#xRange").slider("values", 0));
	$("#xMax").val($("#xRange").slider("values", 1));

	$("#yRange").slider({
		range: true,
		min: -20,
		max: 20,
		values: [rangoY.min, rangoY.max],
		slide: function(event, ui) {
			$("#yMin").val(ui.values[0]);
			$("#yMax").val(ui.values[1]);
			rangoY.min = ui.values[0];
			rangoY.max = ui.values[1];
			clearContext($("#grafico")[0].getContext('2d'));
			updateContextViewValues(gWidth, gHeight);
			reSize($("#grafico")[0].getContext('2d'), gWidth, gHeight);
		}
	});
	$("#yMin").val($("#yRange").slider("values", 0));
	$("#yMax").val($("#yRange").slider("values", 1));

	$("#grafico").resizable({
		maxHeight: 450,
		maxWidth: 450,
		minHeight: 200,
		minWidth: 200,
		start: function(event, ui) {
			clearContext($("#grafico")[0].getContext('2d'));
		},
		resize: function(event, ui) {
			updateContextViewValues(ui.size.width, ui.size.height);
		},
		stop: function(event, ui) {
			updateContextViewValues(ui.size.width, ui.size.height);
			reSize($("#grafico")[0].getContext('2d'), ui.size.width, ui.size.height);
		}
	});

	updateContextViewValues($("#grafico").attr('width'), $("#grafico").attr('height'));
	
	drawAxis($("#grafico")[0].getContext('2d'));
	
	$("#expresion").val('');
	
	$("#drawButton").button();
	$("#clearButton").button();
	$("#deriveButton").button();
	$("#saveButton").button();
	$("#simplifyButton").button();
	
});

function updateContextViewValues(width, height) {
	$('#sizeXDIV').text(width);
	$('#sizeYDIV').text(height);

	escalaX = width / (rangoX.max - rangoX.min);
	escalaY = height / (rangoY.max - rangoY.min);
	
	$('#scaleX').text(escalaX);
	$('#scaleY').text(escalaY);
}

function hexFromRGB (r, g, b) {
	var hex = [
		r.toString(16),
		g.toString(16),
		b.toString(16)
	];
	$.each(hex, function (nr, val) {
		if (val.length == 1) {
			hex[nr] = '0' + val;
		}
	});
	return hex.join('').toUpperCase();
}

function refreshSwatch() {
	var hex = hexFromRGB($("#red").slider("value"),
			     $("#green").slider("value"),
			     $("#blue").slider("value"));
	$("#swatch").css("background-color", "#" + hex);
}

function showMessageError(message) {
	$("#errorMessage").text(message);
	$("#errorMessageDiv").css('display', 'block');
}

function clearMessageError() {
	$("#errorMessage").text('');
	$("#errorMessageDiv").css('display', 'none');
}