// Given a canvas, renders the ZFP communication sprites into it.

// Possible future configuration options: 
// * Different conversation *.txt file.
// * Different collection of *.ani frames.
// * Different definition of how *.ani frames are used.

function ZoqFotPikComm(targetCanvas) {

	// Constants for use with setTarget
	const FOCUS_ZOQ = "ZOQ";
	const FOCUS_PIK = "PIK";

	var targetCanvas = targetCanvas;

	var offscreenCanvas;
	var canvasValid = true;
	var sizeValid = false;

	var frames = new Array();
	var animations = new Array();

	var conversations = new Array();

	// Called by anybody who thinks we need to redraw.
	var invalidate = function() {
		if (canvasValid) {
			canvasValid = false;
			window.requestAnimationFrame(drawFrame);
		}
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

		if (!sizeValid)
		{
			// We don't care who is in charge of the width of the target canvas. We
			// just care to adjust the height in order to maintain aspect ratio.
			var aspectRatio = offscreenCanvas.getAttribute("width") / offscreenCanvas.getAttribute("height");

			targetCanvas.height = targetCanvas.width / aspectRatio;

			sizeValid = true;
		}
		var targetCanvasContext = targetCanvas.getContext('2d');
		targetCanvasContext.drawImage(offscreenCanvas, 0, 0, targetCanvas.width, targetCanvas.height);

		canvasValid = true;
	}

	// Current focus of the ZFP trio, used to determine what graphics to show. 
	// * FOCUS_ZOQ when Zoq is talking
	// * FOCUS_PIK when Pik is talking
	// * null when nobody is talking.
	var zfpFocus = null;

	/////////////////////////////////////////////////////////////////////////
	// Zoq animation section

	var zoqGulpAnimation;
	var zoqTalkAnimation;
	var zoqTimeout;

	var zoqAnimationUpdate = function() {
		if (zoqGulpAnimation.currentDrawFrame() == -1 &&
			zoqTalkAnimation.currentDrawFrame() == -1) {

			// No animation in progress, and we're about to kick off another
			// one. Stop any that might be already pending.
			clearTimeout(zoqTimeout);

			if (zfpFocus==FOCUS_ZOQ) {
				zoqTimeout = setTimeout(zoqTalkAnimation.advanceDrawFrame.bind(zoqTalkAnimation), 1000/12);
			} else {
				zoqTimeout = setTimeout(zoqGulpAnimation.advanceDrawFrame.bind(zoqGulpAnimation), 10000);
			}
		} else {
			// Animation in progress, we'll be called again when it is done.
		}
	};

	/////////////////////////////////////////////////////////////////////////
	// Fot animation section
	
	var fotBlinkAnimation;
	var fotLookAnimation;
	var fotTimeout;

	var fotAnimationUpdate = function() {
		if (fotBlinkAnimation.currentDrawFrame() == -1 &&
			fotLookAnimation.currentDrawFrame() == -1) {
			clearTimeout(fotTimeout);
			fotTimeout = setTimeout(fotBlinkAnimation.advanceDrawFrame.bind(fotBlinkAnimation), 7500);
		} 

		if (zfpFocus == FOCUS_ZOQ ) {
			fotLookAnimation.setTargetFrame(0);
		} else if (zfpFocus == FOCUS_PIK) {
			fotLookAnimation.setTargetFrame(4);
		} else {
			fotLookAnimation.setTargetFrame(2);
		}
	};

	/////////////////////////////////////////////////////////////////////////
	// Pik animation section
	
	var pikSmokeAnimation;
	var pikTalkAnimation;
	var pikTimeout;

	var pikAnimationUpdate = function() {
		if (pikSmokeAnimation.currentDrawFrame() == -1 &&
			pikTalkAnimation.currentDrawFrame() == -1) {

			// No animation in progress, and we're about to kick off another
			// one. Stop any that might be already pending.
			clearTimeout(pikTimeout);

			if (zfpFocus==FOCUS_PIK) {
				pikTimeout = setTimeout(pikTalkAnimation.advanceDrawFrame.bind(pikTalkAnimation), 1000/12);
			} else {
				pikTimeout = setTimeout(pikSmokeAnimation.advanceDrawFrame.bind(pikSmokeAnimation), 2000);
			}
		} else {
			// Animation in progress, we'll be called again when it is done.
		}
	};

	/////////////////////////////////////////////////////////////////////////
	// Animation setup and management

	var setZfpFocus = function(focusOn) {
		if (zfpFocus != focusOn)
		{
			zfpFocus = focusOn;

			zoqAnimationUpdate();
			fotAnimationUpdate();
			pikAnimationUpdate();
		}
	};

	// Once the first frame of animations (aka the background) has loaded, we
	// can start preparing the various animations.
	var setupAnimation = function() {
		var backgroundImage = frames[0].img;

		// Offscreen canvas sized to match the background image
		offscreenCanvas = document.createElement("canvas");
		offscreenCanvas.setAttribute("width", backgroundImage.width);
		offscreenCanvas.setAttribute("height", backgroundImage.height);

		// Create all the animation objects we need.
		// Timers are set up to start ambient animations.
		zoqGulpAnimation = new CircularAnimation(10, 8, 1000/15, invalidate, zoqAnimationUpdate);
		zoqTimeout = setTimeout(zoqGulpAnimation.advanceDrawFrame.bind(zoqGulpAnimation), 5000);
		animations.push(zoqGulpAnimation);

		zoqTalkAnimation = new CircularAnimation(18, 5, 1000/15, invalidate, zoqAnimationUpdate);
		animations.push(zoqTalkAnimation);

		fotBlinkAnimation = new YoyoAnimation(1, 4, 1000/24, invalidate, fotAnimationUpdate);
		fotTimeout = setTimeout(fotBlinkAnimation.advanceDrawFrame.bind(fotBlinkAnimation), 10000); 
		animations.push(fotBlinkAnimation);

		fotLookAnimation = new TargetIndexAnimation([25,24,23,27,28], 2, 1000/30, invalidate, fotAnimationUpdate);
		animations.push(fotLookAnimation);

		pikSmokeAnimation = new CircularAnimation(5, 5, 7000/120, invalidate, pikAnimationUpdate);
		pikTimeout = setTimeout(pikSmokeAnimation.advanceDrawFrame.bind(pikSmokeAnimation), 1000);
		animations.push(pikSmokeAnimation);

		pikTalkAnimation = new CircularAnimation(29, 2, 1000/15, invalidate, pikAnimationUpdate);
		animations.push(pikTalkAnimation);

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
				// changes, we'll have to do something other than just push.
				frames.push(frame);
			}
		}
	};

	var currentConvLabel = null;
	var currentConvIndex = 0;
	var currentLineIndex = 0;
	var currentFocus = FOCUS_ZOQ;

	var placeholderConversation = function() {
		var conv;
		var currentResponse = null;

		for( var i = 0; i < conversations.length; i++ ) {
			conv = conversations[i];

			if (conv.label.startsWith(currentResponse)) {
				continue;
			}

			if (conv.label.charAt(conv.label.length-1) === '0' ) {
				currentResponse = conv.label.substr(0, conv.label.length-1);

				var btn = $("<button/>", {
					text      : currentResponse,
					"onclick" : "say('"+currentResponse+"')"
				});

				$("#conversationList").append(btn);
				
			}
		}
	}

	var nextLine = function() {
		var newLine = null;

		if (currentConvLabel != null) {
			conv = conversations[currentConvIndex];

			currentLineIndex++;

			if (currentLineIndex >= conv.lines.length) {
				// Time to move on to the next item - if we have one.
				currentLineIndex = 0;

				currentConvIndex++;
				if (currentConvIndex < conversations.length &&
					conversations[currentConvIndex].label.startsWith(currentConvLabel)) {
					// Next item is part of same convesation. Swap focus as per ZFP SOP
					if (zfpFocus === FOCUS_ZOQ) {
						setZfpFocus(FOCUS_PIK);
					} else {
						setZfpFocus(FOCUS_ZOQ);
					}

					newLine = conversations[currentConvIndex].lines[currentLineIndex];

				} else {
					// We're done with this conversation.
					currentConvLabel = null;
					currentConvIndex = 0;
					setZfpFocus(null);
					$("#zoqText").text("");
					$("#pikText").text("");
					$("#conversationList").toggle();
				}

			} else {
				var newLine = conv.lines[currentLineIndex];
			}

			if (newLine != null) {
				if (zfpFocus === FOCUS_ZOQ) {
					$("#zoqText").text(newLine);
					$("#pikText").text("");
				} else {
					$("#zoqText").text("");
					$("#pikText").text(newLine);
				}
			}
		}
	}

	var txtLoaded = function(data, textStatus, jqXHR) {
		// Regular expression to extract label 
		// 	WE_ARE0 from "#(WE_ARE0)	zoqfotpik-000.ogg"
		// ^ = start of the line
		// # = literal
		// \\( = open parentese
		//       \ escape JS string literal meaning for \
		//       \ escape special RegEx meaning for (
		//       ( actual literal to use.
		// ( = start extracting content
		// . = any single character that's not newline
		// + = repeat previous thing (.) one or more times.
		// ) = done extracting content
		// \\) = close parentese
		//       \ escape JS string literal meaning for \
		//       \ escape special RegEx meaning for (
		//       ) actual literal to use.
		// \\s = whitespace character
		var reLabel = new RegExp("^#\\((.+)\\)\\s","m");

		// Regular expression to extract sound file name
		//	zoqfotpik-001.ogg from "#(WE_ARE0)	zoqfotpik-000.ogg"
		// \\s = whitespace character
		// ( = start extracting content
		// \\b = start of a word boundary
		// . = any single character that's not newline
		// + = repeat previous thing (.) one or more times.
		// \\. = period
		//       \ escape JS string literal meaning for \
		//       \ escape special RegEx meaning for (
		//       . actual literal to use.
		// . = any single character that's not newline
		// + = repeat previous thing (.) one or more times.
		// ) = done extracting content
		// $ = end of the line
		var reFilename = new RegExp("\\s(\\b.+\\..+)$", "m");

		var conversation = null;
		var txtLines = data.split("\n");

		for (var i = 0; i < txtLines.length; i++) {
			if (txtLines[i].length > 1) {
				var l = txtLines[i];
				var label = reLabel.exec(l);
				var fileName = reFilename.exec(l);

				if( label != null ) {
					if (conversation != null) {
						conversations.push(conversation);
					}

					conversation = { "label" : label[1]};

					if (fileName != null) {
						conversation["fileName"] = fileName[1];
					}

					conversation["lines"] = new Array();
				} else {
					conversation["lines"].push(l);
				}
			}
		}

		if (conversation != null) {
			conversations.push(conversation);
		}
		
		placeholderConversation();
	};

	var ajaxFail = function(jqXHR, textStatus, errorThrown) {
		console.log("General AJAX Error " + textStatus);
	};

	/////////////////////////////////////////////////////////////////////////
	//
	//	Public methods
	//

	// Start the process to load resources
	this.start = function() {
		if (targetCanvas.getContext) {
			// Kick off loading the animation frame definitions
			$.ajax({url:"zoqfotpik.ani", type:"GET", dataType:"text"}).done(aniLoaded).fail(ajaxFail);

			// Kick off loading the conversation text
			$.ajax({url:"zoqfotpik.txt", type:"GET", dataType:"text"}).done(txtLoaded).fail(ajaxFail);
		} else {
			console.log("Failed to acquire canvas drawing context.");
		}
	}

	// Invalid size means we need to resize AND redraw everything
	this.invalidateSize = function() {
		if (sizeValid) {
			sizeValid = false;
			invalidate();
		}
	}

	this.startTalking = function(label) {
		var firstLabel = label+"0";
		var i;

		currentConvLabel = null;
		currentConvIndex = 0;
		currentLineIndex = 0;

		for (i = 0; i < conversations.length; i++) {
			if (conversations[i].label == firstLabel) {
				currentConvLabel = label;
				currentConvIndex = i;
				currentLineIndex = 0;
				break;
			}
		}

		if (currentConvLabel != null) {
			setZfpFocus(FOCUS_ZOQ);
			$("#zoqText").text(conversations[currentConvIndex].lines[currentLineIndex]);
			$("#pikText").text("");
		}

		$("#conversationList").toggle();
	}

	this.keyDown = function(event) {
		nextLine();
	}

	this.click = function(event) {
		nextLine();
	}
}