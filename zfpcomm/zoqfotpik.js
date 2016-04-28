// Given a canvas, renders the ZFP communication sprites into it.

// Possible future configuration options: 
// * Different conversation *.txt file.
// * Different collection of *.ani frames.
// * Different definition of how *.ani frames are used.

function ZoqFotPikComm(targetCanvas) {
	var targetCanvas = targetCanvas;
	var targetContext;

	var frames = new Array();

	var state = 0;

	var draw = function() {
		targetContext.drawImage(frames[0].img, 0, 0);
	};

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
					img.onload = draw;
				}

				// Parse the X,Y offsets
				var offsetX = parseInt(frameLine[3]);
				var offsetY = parseInt(frameLine[4]);

				var frame = { "img" : img, "x" : offsetX, "y" : offsetY };

				console.log("Pushing " + frameLine[0] + " (" + offsetX + "," + offsetY + ")");
				frames.push(frame);
			}
			else
			{
				console.log("aniLoaded skipping line " + i);
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
			targetContext = targetCanvas.getContext('2d');

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