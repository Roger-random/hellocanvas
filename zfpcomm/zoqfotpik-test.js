var zfpComm;

function zfpActivate() {
	var target = document.getElementById('commTarget');
	zfpComm = new ZoqFotPikComm(target);

	zfpComm.start();
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