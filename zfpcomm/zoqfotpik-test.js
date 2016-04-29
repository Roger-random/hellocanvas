var zfpComm;

function zfpActivate() {
	var target = document.getElementById('commTarget');
	zfpComm = new ZoqFotPikComm(target);

	zfpComm.start();
}

function zoqSpeak() {
	zfpComm.setZfpFocus("ZOQ");
}

function noSpeak() {
	zfpComm.setZfpFocus(null);
}

function pikSpeak() {
	zfpComm.setZfpFocus("PIK");
}