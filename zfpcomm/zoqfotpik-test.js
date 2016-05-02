var zfpComm;

function zfpActivate() {
	var target = document.getElementById('commTarget');
	zfpComm = new ZoqFotPikComm(target);

	zfpComm.start();
	windowResize();
	$(document).keydown(zfpComm.keyDown);
	$(document).mousedown(zfpComm.click);
}

function say(label) {
	zfpComm.startTalking(label);
}

function windowResize() {
	$("#commTarget").attr("width", $("#commParent").innerWidth());
	zfpComm.invalidateSize();
}

$(document).ready( function() {
	$(window).resize(windowResize);
})