// There should be a base class for all the commonalities... but I haven't figured out how to make that work in JS yet.

function CircularAnimation(startIndex, length, frameRate, updatedCallback, completedCallback) {
	// Starting point of the animation frames
	var startIndex = startIndex;

	// Number of frames to advance startIndex
	var length = length;

	// Amount of time, in milliseconds, between advancing frames.
	var frameRate = frameRate;

	// Callback method to notify that a new frame is available via currentDrawFrame
	var updatedCallback = updatedCallback;

	// Callback method to notify that a new frame is available via currentDrawFrame
	var completedCallback = completedCallback;

	// Current frame index. -1 when inactive.
	var currentFrame = -1;

	// Called by the timer to calculate the next frame.
	this.advanceDrawFrame = function() {
		// Advance to next frame
		currentFrame++;

		if (currentFrame < length) {
			// Set timer for the following frame.
			setTimeout(this.advanceDrawFrame.bind(this), frameRate);
		} else {
			// We're at the end of the sequence - reset.
			currentFrame = -1;

			completedCallback();
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
};


function YoyoAnimation(startIndex, length, frameRate, updatedCallback, completedCallback) {
	// Starting point of the animation frames
	var startIndex = startIndex;

	// Number of frames to advance startIndex
	var length = length;

	// Amount of time, in milliseconds, between advancing frames.
	var frameRate = frameRate;

	// Callback method to notify that a new frame is available via currentDrawFrame
	var updatedCallback = updatedCallback;

	// Callback method to notify that a new frame is available via currentDrawFrame
	var completedCallback = completedCallback;

	// Current frame index. -1 when inactive.
	var currentFrame = -1;

	// Yo-yo direction. +1 for forward, -1 for backward.
	var yoyoDirection = +1;

	// Called by the timer to calculate the next frame.
	this.advanceDrawFrame = function() {
		// Advance to next frame
		currentFrame += yoyoDirection;

		if (currentFrame <= -1 )
		{
			// We're at the end of the sequence - reset and restart.
			currentFrame = -1;
			yoyoDirection = +1;
			
			completedCallback();
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
};

function TargetIndexAnimation(frameArray, neutralIndex, frameRate, updatedCallback, completedCallback) {
	var frameArray = frameArray;
	var neutralIndex = neutralIndex;
	var frameRate = frameRate;

	var updatedCallback = updatedCallback;
	var completedCallback = completedCallback;

	var currentFrame = neutralIndex;

	var targetFrame = neutralIndex;

	var nextFrameTimeout = null;

	this.advanceDrawFrame = function() {
		var scheduleNextFrame = false;
		nextFrameTimeout = null;

		if (currentFrame == neutralIndex &&
			currentFrame == targetFrame) {

			updatedCallback();
			completedCallback();
		} else if (currentFrame > targetFrame) {
			currentFrame--;

			scheduleNextFrame = true;
			updatedCallback();
		} else if (currentFrame < targetFrame) {
			currentFrame++;

			scheduleNextFrame = true;
			updatedCallback();
		} else {
			// target frame equals current frame but is not neutral frame 
			// Hold position, check back later.
			scheduleNextFrame = true;
		}

		if (scheduleNextFrame) {
			nextFrameTimeout = setTimeout(this.advanceDrawFrame.bind(this), frameRate);
		}
	}

	this.setTargetFrame = function(newTarget) {
		if (targetFrame != newTarget) {
			targetFrame = newTarget;
			if (nextFrameTimeout==null) {
				nextFrameTimeout = setTimeout(this.advanceDrawFrame.bind(this), frameRate);
			}			
		}
	}

	this.currentDrawFrame = function() {
		if (currentFrame == neutralIndex) {
			return -1;
		} else {
			return frameArray[currentFrame];
		}
	}
}
