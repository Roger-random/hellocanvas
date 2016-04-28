// Given a canvas, renders the ZFP communication sprites into it.

// Possible future configuration options: 
// * Different conversation *.txt file.
// * Different collection of *.ani frames.
// * Different definition of how *.ani frames are used.

function ZoqFotPikComm(targetCanvas) {
	var targetCanvas = targetCanvas;

	var offscreenCanvas;
	var canvasValid = true;

	var frames = new Array();
	var animations = new Array();

	// var lastTimestamp;
	var state = 0;

	// Checked by the Zoq gulp ambient animation to see if it should start
	// another loop. Will return true when Zoq is talking and can't gulp.
	var blockZoqGulp = function() {
		return false;
	}

	// Checked by the Fot blink ambient animation to see if it should
	// start a blink. Will return true if Fot is looking at either Zoq
	// or Pik and shouldn't blink.
	var blockFotBlink = function() {
		return false;
	}

	// Checked by the Pik smoke ambient animation to see if it should start
	// another puff. Will return true if Pik is talking and shouldn't smoke
	var blockPikSmoke = function() {
		return false;
	}

	// Called by anybody who thinks we need to redraw.
	var invalidate = function() {
		if (canvasValid) {
			canvasValid = false;
			window.requestAnimationFrame(drawFrame);
		}
	}

	// We don't care who is in charge of the width of the target canvas. We
	// just care to adjust the height in order to maintain aspect ratio.
	var resizeTarget = function() {
		var aspectRatio = offscreenCanvas.getAttribute("width") / offscreenCanvas.getAttribute("height");

		targetCanvas.height = targetCanvas.width / aspectRatio;

		invalidate();
	}

	// Draw the background then any applicable sprites on to the offscreen
	// canvas in 1:1 pixel mode. Then transfer the result all together to the 
	// target canvas, scaling as necessary. We need to composit the sprites
	// while in 1:1 pixel mode before scaling because otherwise we'll get
	// visible seams introduced by the scaling sampling algorithm.
	var drawFrame = function(timestamp) {
		offscreenCanvasContext = offscreenCanvas.getContext('2d');
		offscreenCanvasContext.drawImage(frames[0].img, 0, 0);

		for(var i = 0; i < animations.length; i++) {
			var frameToDraw = animations[i].currentDrawFrame();

			if (frameToDraw != -1) {
				var frame = frames[frameToDraw];

				offscreenCanvasContext.drawImage(frame.img, 0-frame.x, 0-frame.y);
			}
		}

		var targetCanvasContext = targetCanvas.getContext('2d');
		targetCanvasContext.drawImage(offscreenCanvas, 0, 0, targetCanvas.width, targetCanvas.height);

		canvasValid = true;

        // if (lastTimestamp!=undefined) {
        //     console.log("redraw interval " + (timestamp - lastTimestamp));
        // }
        // lastTimestamp = timestamp;
	}

	// Once the first frame of animations (aka the background) has loaded, we
	// can start preparing the various animations.
	var setupAnimation = function() {
		var backgroundImage = frames[0].img;

		// Offscreen canvas sized to match the background image
		offscreenCanvas = document.createElement("canvas");
		offscreenCanvas.setAttribute("width", backgroundImage.width);
		offscreenCanvas.setAttribute("height", backgroundImage.height);

		var animation;

		//function CircularAnimation(startIndex, length, frameRate, initialStart, restart, blockerCallback, updatedCallback) {

		// Zoq gulp animation
		animations.push(new CircularAnimation(10, 8, 1000/15, 5000, 10000, blockZoqGulp, invalidate));

		// Fot blink animation
		animations.push(new YoyoAnimation(1, 4, 1000/24, 10000, 10000, blockZoqGulp, invalidate));

		// Pik smoke animation
		animations.push(new CircularAnimation(5, 5, 7000/120, 1000, 2000, blockPikSmoke, invalidate));

		resizeTarget();
		drawFrame();
	};

	// Once zoqfotpik.ani is loaded, parse the animation frames.
	var aniLoaded = function(data, textStatus, jqXHR) {
		// Expect result to be in a text file, one frame per line separated by \n
		var frameList = data.split("\n");

		for (var i = 0; i < frameList.length; i++)
		{
			var frameLine = frameList[i].split(" ");
			// Within each line, we expect 5 items separated by spaces.
			// 	0: Filename for the frame
			//  1: (Ignored) Index to color represent transparency.
			//  2: (Ignored) Color map index.
			//  3: X offset. Render frame at OriginX-OffsetX (note MINUS!)
			//  4: Y offset. Render frame at OriginY-OffsetY (note MINUS!)

			// Skip all lines that don't have at least 5 elements.
			if (frameLine.length >= 5)
			{
				var img = document.createElement("img");
				img.setAttribute("src", frameLine[0]);

				// Once frame zero (background) is loaded, we can put it on screen.
				if (i == 0) {
					img.onload = setupAnimation;
				}

				// Parse the X,Y offsets
				var offsetX = parseInt(frameLine[3]);
				var offsetY = parseInt(frameLine[4]);

				// Pack the three pieces of data into an object, append to the list of frames.
				var frame = { "img" : img, "x" : offsetX, "y" : offsetY };

				// Right now all the frames come in-order, starting with zero, 
				// so the frame number matches the array index. If this ever 
				// changes, we'll do something other than just push.
				frames.push(frame);
			}
		}
		state++;
	};

	var txtLoaded = function(data, textStatus, jqXHR) {
		console.log("Text file load " + textStatus);
		state++;
	};


	var ajaxFail = function(jqXHR, textStatus, errorThrown) {
		console.log("General AJAX Error " + textStatus);
	};

	this.start = function() {
		if (targetCanvas.getContext) {
			// Kick off loading the animation frame definitions
			$.ajax({url:"zoqfotpik.ani", type:"GET", dataType:"text"}).done(aniLoaded).fail(ajaxFail);

			// Kick off loading the conversation text
			$.ajax({url:"zoqfotpik.txt", type:"GET", dataType:"text"}).done(txtLoaded).fail(ajaxFail);

			state++;
		} else {
			console.log("Failed to acquire canvas drawing context.");
		}
	}
}