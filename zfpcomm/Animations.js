// Manages timer and advancing a index value through the given range at the given speed.
// * startIndex = Starting point of index.
// * length = Size of value range. Maximum index value is startIndex+length-1
// * frameRate = time between frames, in milliseconds.
// * updatedCallback = function to call after every index value change.
// * completedCallback = function to call upon complete traversal of value range.

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

	// Called by the owner or timer to calculate the next frame.
	this.advanceDrawFrame = function() {
		currentFrame++;

		if (currentFrame < length) {
			// Set timer for the following frame.
			setTimeout(this.advanceDrawFrame.bind(this), frameRate);
		} else {
			// We're at the end of the sequence - reset.
			currentFrame = -1;

			completedCallback();
		}

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

// Manages timer and advancing a index value through the given range then 
// "yo-yo" back to the starting index value. Index advances at the given speed.
// * startIndex = Starting point of index. Will go up to startIndex+length-1 
//   then back to startIndex.
// * length = Size of value range. Maximum index value is startIndex+length-1
// * frameRate = time between frames, in milliseconds.
// * updatedCallback = function to call after every index value change.
// * completedCallback = function to call upon complete traversal of value range.

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

	// Called by the owner or timer to calculate the next frame.
	this.advanceDrawFrame = function() {
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
			// Forward or backward - doesn't matter, we're within range. 
			// Set timer for the following frame.
			setTimeout(this.advanceDrawFrame.bind(this), frameRate);
		}

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

// Manages timer and advancing a index value through the given array of values
// heading towards a given target index at the given speed.
// * frameArray = array of integers to return as frame indices.
// * neutralIndex = index into frameArray representing the frame that is most
//   similar (ideally identical) to not drawing a frame at all. When animation
//   reaches this frame it is considered complete and the associated sprite
//   does not need to be rendered.
// * frameRate = time between frames, in milliseconds.
// * updatedCallback = function to call after every index value change.
// * completedCallback = function to call upon complete traversal of value range.

function TargetIndexAnimation(frameArray, neutralIndex, frameRate, updatedCallback, completedCallback) {
	var frameArray = frameArray;
	var neutralIndex = neutralIndex;
	var frameRate = frameRate;

	var updatedCallback = updatedCallback;
	var completedCallback = completedCallback;

	var currentFrame = neutralIndex;
	var targetFrame = neutralIndex;

	// Used to track if we already have a timer ticking to advance frames.
	var nextFrameTimeout = null;

	// Called by the owner or timer to calculate the next frame.
	this.advanceDrawFrame = function() {
		var scheduleNextFrame = false;
		nextFrameTimeout = null;

		if (currentFrame == neutralIndex &&
			currentFrame == targetFrame) {

			// Reached neutral frame as the intended target. Sequence is
			// considred complete at this point.
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
			// target frame equals current frame, but is not neutral frame 
			// Hold position, check back later.
			scheduleNextFrame = true;
		}

		if (scheduleNextFrame) {
			nextFrameTimeout = setTimeout(this.advanceDrawFrame.bind(this), frameRate);
		}
	}

	// Called by the owner to update the target. If the target has changed, 
	// and there isn't already a timer in place for the next frame, 
	// schedule one.
	this.setTargetFrame = function(newTarget) {
		if (targetFrame != newTarget) {
			targetFrame = newTarget;
			if (nextFrameTimeout==null) {
				nextFrameTimeout = setTimeout(this.advanceDrawFrame.bind(this), frameRate);
			}			
		}
	}

	// The current frame index. Neutral frame is considered unnecessary to
	// repaint so returns -1.
	this.currentDrawFrame = function() {
		if (currentFrame == neutralIndex) {
			return -1;
		} else {
			return frameArray[currentFrame];
		}
	}
}
