function zfpActivate() {
	var target = document.getElementById('commTarget');
	var zfpComm = new ZoqFotPikComm(target);

	zfpComm.start();
}