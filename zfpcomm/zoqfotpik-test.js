var zfpComm;

function zfpActivate() {
	var target = document.getElementById('commTarget');
	zfpComm = new ZoqFotPikComm(target);

	zfpComm.start();
	windowResize();
}

function zoqSpeak() {
	zfpComm.zoqTalking();
}

function noSpeak() {
	zfpComm.noTalking();
}

function pikSpeak() {
	zfpComm.pikTalking();
}

function windowResize() {
	$("#commTarget").attr("width", $("#commParent").innerWidth());
	zfpComm.invalidateSize();
}

$(document).ready( function() {
	$(window).resize(windowResize);
})