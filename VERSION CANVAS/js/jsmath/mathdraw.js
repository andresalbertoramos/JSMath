var gWidth = 400;
var gHeight = 400;

var rangoX = {min: -5, max: 5};
var rangoY = {min: -5, max: 5};

var escalaX = gWidth / (rangoX.max - rangoX.min);

var escalaY = gHeight / (rangoY.max - rangoY.min);

var parser = new SintacticParser();

var ancho = 4;

var arrayFunctions = new Array();

var savedFunctions = new Array();

var defFunction = null;


function drawAxis(ctx) {

	ctx.beginPath();
	
	for (var x = 0.5; x < gWidth; x += escalaX) {
		ctx.moveTo(x, 0);
		ctx.lineTo(x, gHeight);
	}

	for (var y = 0.5; y < gHeight; y += escalaY) {
		ctx.moveTo(0, y);
		ctx.lineTo(gWidth, y);
	}
	
	ctx.strokeStyle = '#eee';
	ctx.lineWidth = 1.5;
	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	
	ctx.moveTo(getXPixel(0) + 0.5, 0);
	ctx.lineTo(getXPixel(0) + 0.5, gHeight);

	ctx.moveTo(0, getYPixel(0) + 0.5);
	ctx.lineTo(gWidth, getYPixel(0) + 0.5);
	
	ctx.strokeStyle = 'black';
	ctx.stroke();
	ctx.closePath();
}

function getXPixel(xValue) {

	return (xValue - rangoX.min) * escalaX;
}

function getYPixel(yValue) {

	return Math.round((rangoY.max - yValue) * escalaY);
}

function getXValue(xPixel) {
	return (xPixel / escalaX) + rangoX.min;
}

function getYValue(yPixel) {

	return rangoY.max - (yPixel / escalaY);
}

function createFunction() {
	clearMessageError();
	
	var textFunction = $("#expresion").val();

	if (textFunction.length == 0) {
		showMessageError('Ingrese una expresión matemática para que sea evaluada.');
	} else {

		defFunction = parser.parseExpresion(textFunction);

		if (defFunction == null) {
			errorMessage.innerText = parser.errorMessage;
		}
	}
}

function drawFunction() {

	clearMessageError();
	
	if (defFunction) {
		var parameters = new ArrayParameters();

		var variables = defFunction.getVariables();

		var param = new Parameter('x', 0);

		if (variables.length > 1) {

			showMessageError('No es posible graficar expresiones con más de una variable.');

		} else {

			if (variables.length == 1) {
				param.setName(variables[0]);
				parameters.addParameter(param);
			}

			var ctx = $("#grafico")[0].getContext('2d');
			
			var result = drawFunctionValues($("#grafico")[0].getContext('2d'), defFunction, '#' + hexFromRGB($("#red").slider("value"), $("#green").slider("value"), $("#blue").slider("value")), ancho);

			if (result) {
				arrayFunctions.push({func: defFunction, color: ctx.strokeStyle, ancho: ancho});
			}
		}
	} else {
			showMessageError('Ingrese la expresión matemática que desea graficar.');
	}
}

function drawFunctionValues(ctx, func, color, width) {
	var error = false;

	var parameters = new ArrayParameters();

	var variables = func.getVariables();

	var param = new Parameter('x', 0);

	if (variables.length == 1) {
		param.setName(variables[0]);
		parameters.addParameter(param);
	}

	ctx.save();
	ctx.strokeStyle = color; 
	ctx.lineCap = 'round';
	ctx.lineJoin = 'bevel';
	ctx.lineWidth = width;
	ctx.beginPath();
	
	var parcialErrorMessage = '';

	var drawing = false;
	
	var first = true;
	
	for (var i = parseInt(ancho/2) + 1; i < gWidth - parseInt(ancho/2) + 1 && !error; i++) {

		var xVal = getXValue(i);

		param.setValue(xVal);

		var yVal = func.eval(parameters);

		if (isNaN(yVal)) {
			if (yVal != 'DOMINIO_INVALIDO' && yVal != 'DIVISION_X_ZERO') {
				showMessageError(yVal);
				error = true;
			} else {
				parcialErrorMessage = yVal;
			}
		} else {

			var pixelY = getYPixel(yVal);

			if (pixelY > parseInt(ancho/2) + 1 && pixelY < gHeight - parseInt(ancho/2)) {

				drawing = true;

				if (first) {
					ctx.moveTo(i, pixelY);
					first = false;
				}
				
				ctx.lineTo(i, pixelY); 
			} else {
				first = true;
			}
		}
	}
	if (parcialErrorMessage.length > 0 && !drawing) {

		showMessageError(parcialErrorMessage);

	} 
	
	ctx.stroke();
	ctx.closePath();
	
	return !error;
}


function derive() {

	clearMessageError();

	if (defFunction) {
		var variables = defFunction.getVariables();

		var variable = 'X';

		if (variables.length > 0) {
			variable = variables[0];
		}

		defFunction = defFunction.derive(variable);

		$("#expresion").val(defFunction.toString());
	} else {
		showMessageError('Ingrese la expresión matemática que desea derivar.');
	}
}

function clearTable() {
	clearMessageError();
	
	var ctx = $("#grafico")[0].getContext('2d');

	clearContext(ctx);
	
	drawAxis(ctx);

	$("#expresion").val('');
	
	defFunction = null;

	arrayFunctions.length = 0;
}

function clearContext(ctx) {
	ctx.beginPath();
	ctx.clearRect(0, 0, gWidth, gHeight);
	ctx.closePath();
}


function reSize(ctx, x, y) {
	gWidth = x;
	gHeight = y;

	ctx.canvas.width = x;
	ctx.canvas.height = y;
	escalaX = gWidth / (rangoX.max - rangoX.min);

	escalaY = gHeight / (rangoY.max - rangoY.min);

	drawAxis(ctx);
	
	for (var i = 0; i < arrayFunctions.length; i++) {
		drawFunctionValues(ctx, arrayFunctions[i].func, arrayFunctions[i].color, arrayFunctions[i].ancho);
	}	

}

function save() {

	clearMessageError();

	if (defFunction) {
		var tableView = $("#tableViewID")[0];

		var nrow = tableView.insertRow(tableView.rows.length);

		var ncol = nrow.insertCell(nrow.cells.length);

		var idButton = "function_" + tableView.rows.length;
		
		ncol.innerHTML = "<button id=\"" + idButton + "\" onclick=\"reviewFunction(event)\">" + defFunction.toString() + "</button>";
		
		savedFunctions[idButton] = defFunction.toString();
		$("#" + idButton).button();
		$('#tabs').tabs('select', 1);
		
	} else {
		showMessageError('Ingrese la expresión matemática que desea guardar.');
	}

}

function reviewFunction(e) {
	var elemento = (document.all) ? e.srcElement : e.target;

	$("#expresion")[0].value = savedFunctions[elemento.id];
	
	createFunction();
	$('#tabs').tabs('select', 0);
}


function simplify() {

	clearMessageError();

	if (defFunction) {
		defFunction = defFunction.simplify();

		$("#expresion").val(defFunction.toString());
	} else {
		showMessageError('Ingrese la expresión matemática que desea simplificar.');
	}
}

