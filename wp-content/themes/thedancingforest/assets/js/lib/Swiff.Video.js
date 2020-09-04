Swiff.Video = new Class({
	
	Extends: Swiff,
	
	Implements: Events,
	
	options: {
		width:	null,
		height:	null,
		controlbar: "",
		screencolor: null,
		autostop: true,
		preload: "off",
		stretching: true,
		smoothing: true,
		showcaptions: false,
		volume: 80,
		mute: false,
		debug: false
		/*
		onReady: $empty,
		onPlay: $empty,
		onStop: $empty,
		onPause: $empty,
		onStateChange: $empty,
		onFail: $empty
		*/
	},
	
	initialize: function (path, options) {
		this.setOptions(options);
		
		// Video player requires Flash 9
		if (Browser.Plugins.Flash.version < 9) {
			this.fireEvent("fail", ["flash"]);
			return;
		}
		
		this.options.params.allowFullScreen = true;
		
		this.options.id = "SwiffVideo_" + Swiff.Video.playerCounter++;
		this.options.properties.name = this.options.id;
		
		// Flash vars (prepend all with fv_)
		this.options.vars.fv_controlbar = this.options.controlbar;
		this.options.vars.fv_playerID = this.options.id;
		this.options.vars.fv_volume = this.options.volume;
		this.options.vars.fv_mute = this.options.mute;
		this.options.vars.fv_preload = this.options.preload;
		this.options.vars.fv_stretching = this.options.stretching;
		this.options.vars.fv_smoothing = this.options.smoothing;
		this.options.vars.fv_showcaptions = this.options.showcaptions;
		this.options.vars.fv_debug = this.options.debug;
		if (this.options.screenColor) {
			this.options.vars.fv_screencolor = this.options.screencolor;
		}
		
		this.options.callBacks = {
			fv_jsCallback: this.fireCallback.bind(this)
		};
		
		// Use container size if width and height were not specified
		if (this.options.container) {
			var containerSize = document.id(this.options.container).getSize();
			this.options.width = this.options.width || containerSize.x;
			this.options.height = this.options.height || containerSize.y;
		}
		
		this.parent(path);
		
		// Add video player to array of players on current page
		Swiff.Video.players.push(this);
		
		return this;
	},
	
	load: function (flvURL, captionsURL, stillURL, preload) {
		this.remote("loadVideo", flvURL, captionsURL, stillURL, preload);
	},
	
	play: function () {
		this.remote("playVideo");
	},
	
	pause: function () {
		this.remote("pauseVideo");
	},
	
	toggle: function () {
		this.remote("togglePlay");
	},
	
	stop: function () {
		this.remote("stopVideo");
	},
	
	seek: function (time) {
		this.remote("seek", time);
	},
	
	mute: function () {
		this.remote("mute");
	},
	
	setVolume: function (vol) {
		this.remote("volume", vol);
	},
	
	toggleCaptions: function (vol) {
		this.remote("toggleCaptions");
	},
	
	fireCallback: function (info) {
		switch (info.event) {
			case "onReady":
				this.fireEvent("ready");
				break;
			case "onPlay":
				Swiff.Video.players.each(function (player) {
					if (player != this && player.options.autoStop) player.pause();
				}, this);
				this.fireEvent("play");
				break;
			case "onStop":
				this.fireEvent("stop");
				break;
			case "onPause":
				this.fireEvent("pause");
				break;
			case "onStateChange":
				this.fireEvent("stateChange", [info]);
				break;
		}
	}
	
});

Swiff.Video.players = [];
Swiff.Video.playerCounter = 1;