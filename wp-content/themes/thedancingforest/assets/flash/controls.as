import mx.utils.Delegate;

// Initialise ActionScript broadcaster
AsBroadcaster.initialize(this);


// Position controls

play_btn._visible = true;
pause_btn._visible = false;
fullscreen_btn.enabled = false;

var currentVolume:Number = 0;

var ready:Boolean = true;

// This updates UI from state of player (triggered from player onStateChange events)
function onStateChange(playerState:Object):Void {
	if (!ready) {
		play();
		ready = true;
	}
	
	fullscreen_btn.enabled = playerState.status != "stopped";
	
	// Debug indicators
	//duration_txt.text = formatTime(playerState.duration);
	//time_txt.text = formatTime(playerState.time);
	
	// Load indicator
	setLoaded(playerState.loaded);
	
	// Progress bar
	switch (playerState.status) {
		case "stopped":
			setProgress(0);
			play_btn._visible = true;
			pause_btn._visible = false;
			disableProgressBar();
			break;
		
		case "paused":
			play_btn._visible = true;
			pause_btn._visible = false;
			enableProgressBar();
			break;
		
		case "playing":
			play_btn._visible = false;
			pause_btn._visible = true;
			enableProgressBar();
			if (!playerState.waitForSeek) {
				setProgress(playerState.progress);
			}
			break;
	}
	
	currentVolume = Number(playerState.volume);
	
	// Volume control
	if (playerState.muted) {
		disableVolumeBar();
	} else {
		setVolume(playerState.volume);
		enableVolumeBar();
	}
}


// Play/Pause buttons

play_btn.onRelease = Delegate.create(this, function () {
	broadcastMessage("uiEvent", "PLAY");
});

pause_btn.onRelease = Delegate.create(this, function () {
	broadcastMessage("uiEvent", "PAUSE");
});

fullscreen_btn.onRelease = Delegate.create(this, function () {
	broadcastMessage("uiEvent", "FULLSCREEN");
});


// Volume control

volume_mc.dragging = false;

function setVolume(vol:Number):Void {
	if (!volume_mc.dragging) {
		volume_mc.slider_mc._x = Math.round((vol / 100 * volume_mc.slider_mc._width) - volume_mc.slider_mc._width);
	}
}

volume_mc.track_mc.onPress = Delegate.create(this, function () {
	volume_mc.slider_mc._x = volume_mc.track_mc._xmouse - volume_mc.slider_mc._width;
	broadcastMessage("uiEvent", "VOLUME", { volume: Math.round((volume_mc.slider_mc._x + volume_mc.slider_mc._width) / volume_mc.slider_mc._width * 100) } );
	volume_mc.dragging = true;
});

volume_mc.track_mc.onRelease = volume_mc.track_mc.onReleaseOutside = Delegate.create(this, function () {
	volume_mc.dragging = false;
});

volume_mc.onMouseMove = Delegate.create(this, function () {
	var xMouse:Number = volume_mc.track_mc._xmouse;
	if (xMouse < 0) xMouse = 0;
	else if (xMouse > volume_mc.slider_mc._width) xMouse = volume_mc.slider_mc._width;
	if (volume_mc.dragging) {
		volume_mc.slider_mc._x = xMouse - volume_mc.slider_mc._width;
		broadcastMessage("uiEvent", "VOLUME", { volume: Math.round((volume_mc.slider_mc._x + volume_mc.slider_mc._width) / volume_mc.slider_mc._width * 100) } );
	}
});

function enableVolumeBar():Void {
	volume_mc.enabled = true;
}

function disableVolumeBar():Void {
	volume_mc.enabled = false;
	volume_mc.dragging = false;
}


// Progress bar

function enableProgressBar():Void {
	progress_mc.loader_mc.enabled = true;
}

function disableProgressBar():Void {
	progress_mc.loader_mc.enabled = false;
	progress_mc.dragging = false;
}

function getProgress():Number {
	return progress_mc.track_mc._width / 526;
}

function setProgress(progress:Number):Void {
	if (progress_mc.dragging) return;
	progress_mc.track_mc._visible = (progress > 0);
	progress_mc.track_mc._width = progress * 526;
}

function setLoaded(loaded:Number):Void {
	progress_mc.loader_mc._visible = (loaded > 0);
	progress_mc.loader_mc._width = loaded * 526;
}

setLoaded(0);
setProgress(0);

disableProgressBar();

progress_mc.loader_mc.onPress = Delegate.create(this, function () {
	progress_mc.dragging = true;
	progress_mc.track_mc._width = progress_mc._xmouse - 2;
	broadcastMessage("uiEvent", "SEEK_START");
});

progress_mc.loader_mc.onRelease = progress_mc.loader_mc.onReleaseOutside = Delegate.create(this, function () {
	progress_mc.dragging = false;
	broadcastMessage("uiEvent", "SEEK_END", { position: getProgress() });
});

progress_mc.loader_mc.onMouseMove = Delegate.create(this, function () {
	if (progress_mc.dragging) {
		var xMouse:Number = volume_mc._xmouse - 2;
		if (xMouse < 0) xMouse = 0;
		else if (xMouse > 526) xMouse = 526;
		progress_mc.track_mc._width = progress_mc._xmouse - 2;
	}
});


// Helper functions

/**
 * Format time function
 * @param time (in seconds)
 * @return formatted time string
 */
function formatTime(time:Number):String {
	var trkTimeInfo:Date = new Date();
	var seconds:Number, minutes:Number, hours:Number;
	var result:String;
	
	// Populate a date object (to convert from ms to hours/minutes/seconds)
	trkTimeInfo.setSeconds(int(time));
	trkTimeInfo.setMinutes(int((time)/60));
	trkTimeInfo.setHours(int(((time)/60)/60));
	
	// Get the values from date object
	seconds = trkTimeInfo.getSeconds();
	minutes = trkTimeInfo.getMinutes();
	hours = trkTimeInfo.getHours();
	
	// Build position string
	result = seconds.toString();
	if(seconds < 10) result = "0" + result;
	result = ":" + result;
	result = minutes.toString() + result;
	if(hours > 0)
	{
		if(minutes < 10) result = "0" + result;
		result = ":" + result;
		result = hours.toString() + result;
	}
	
	return result;
}