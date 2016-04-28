// There should be a base class for all the commonalities... but I haven't figured out how to make that work in JS yet.

function CircularAnimation(startIndex, length, frameRate, initialStart, restart, blockerCallback, updatedCallback) {
	// Starting point of the animation frames
	var startIndex = startIndex;

	// Number of frames to advance startIndex
	var length = length;

	// Amount of time, in milliseconds, between advancing frames.
	var frameRate = frameRate;

	// Amount of time, in milliseconds, before starting the first frame.
	var restart = restart;

	// Callback method to check if advanceDrawFrame should hold off.
	var blockerCallback = blockerCallback;

	// Callback method to notify that a new frame is available via currentDrawFrame
	var updatedCallback = updatedCallback;

	// Current frame index. -1 when inactive.
	var currentFrame = -1;

	// Called by the timer to calculate the next frame.
	this.advanceDrawFrame = function() {
		// If we are currently inactive, check if we're blocked from starting.
		if (currentFrame == -1) {
			if (blockerCallback()) {
				// Set a timer to check back after the equivalent of a full cycle.
				setTimeout(this.advanceDrawFrame.bind(this), (frameRate*length) + restart);
				return;
			}
		}

		// Advance to next frame
		currentFrame++;

		if (currentFrame < length) {
			// Set timer for the following frame.
			setTimeout(this.advanceDrawFrame.bind(this), frameRate);
		} else {
			// We're at the end of the sequence - reset and restart.
			currentFrame = -1;
			setTimeout(this.advanceDrawFrame.bind(this), restart);
		}

		// Notify of this update
		updatedCallback();
	}

	// Called by a render function to see which frame to draw. Returns -1 if the
	// animation is currently inactive.
	this.currentDrawFrame = function() {
		if (currentFrame == -1) {
			return -1;
		} else {
			return startIndex + currentFrame;
		}
	}

	// Using the initialStart parameter, sets a timer to kick off advancing frames.
	setTimeout(this.advanceDrawFrame.bind(this), initialStart);
};


function YoyoAnimation(startIndex, length, frameRate, initialStart, restart, blockerCallback, updatedCallback) {
	// Starting point of the animation frames
	var startIndex = startIndex;

	// Number of frames to advance startIndex
	var length = length;

	// Amount of time, in milliseconds, between advancing frames.
	var frameRate = frameRate;

	// Amount of time, in milliseconds, before starting the first frame.
	var restart = restart;

	// Callback method to check if advanceDrawFrame should hold off.
	var blockerCallback = blockerCallback;

	// Callback method to notify that a new frame is available via currentDrawFrame
	var updatedCallback = updatedCallback;

	// Current frame index. -1 when inactive.
	var currentFrame = -1;

	// Yo-yo direction. +1 for forward, -1 for backward.
	var yoyoDirection = +1;

	// Called by the timer to calculate the next frame.
	this.advanceDrawFrame = function() {
		// If we are currently inactive, check if we're blocked from starting.
		if (currentFrame == -1) {
			if (blockerCallback()) {
				// Set a timer to check back after the equivalent of a full cycle.
				setTimeout(this.advanceDrawFrame.bind(this), (frameRate*length) + restart);
				return;
			}
		}

		// Advance to next frame
		currentFrame += yoyoDirection;

		if (currentFrame <= -1 )
		{
			// We're at the end of the sequence - reset and restart.
			currentFrame = -1;
			yoyoDirection = +1;
			setTimeout(this.advanceDrawFrame.bind(this), restart);

		} else if (currentFrame >= length) {
			// Oops - we passed the end point. Should have gone backwards instead.
			currentFrame = length-2; 
			yoyoDirection = -1;
			setTimeout(this.advanceDrawFrame.bind(this), frameRate);
		} else {
			// Forward or backward - we're within range. 
			// Set timer for the following frame.
			setTimeout(this.advanceDrawFrame.bind(this), frameRate);
		}

		// Notify of this update
		updatedCallback();
	}

	// Called by a render function to see which frame to draw. Returns -1 if the
	// animation is currently inactive.
	this.currentDrawFrame = function() {
		if (currentFrame == -1) {
			return -1;
		} else {
			return startIndex + currentFrame;
		}
	}

	// Using the initialStart parameter, sets a timer to kick off advancing frames.
	setTimeout(this.advanceDrawFrame.bind(this), initialStart);
};
