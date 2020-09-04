Swiff.Video.Box = new Class({
	
	Implements: [Events, Options],
	
	options: {
		duration: 500,
		opacity: 0.5,
		container: null,
		initialWidth: 250,
		initialHeight: 250,
		width: 600,
		height: 250,
		classPrefix: "vBox-",
		playerPath: "videoplayer.swf",
		playerOptions: {}
	},
	
	playerLoaded: false,
	
	currentVideo: null,
	
	initialize: function (options) {
		this.setOptions(options);
		
		this.container = document.id(this.options.container || document.body);
		
		this.prepareUI();
	},
	
	preparePlayer: function () {
		this.options.playerOptions.container = this.canvas;
		this.options.playerOptions.width = this.options.width;
		this.options.playerOptions.height = this.options.height;
		this.options.playerOptions.onReady = this.playerReady.bind(this);
		
		this.player = new Swiff.Video(this.options.playerPath, this.options.playerOptions);
		
		this.playerLoaded = true;
	},
	
	prepareUI: function () {
		this.mask = new Mask(this.container, {
			"class": this.options.classPrefix + "overlay",
			"onShow": (function () {
				document.id(this.mask).fade(this.options.opacity);
			}).bind(this),
			"onHide": (function () {
				document.id(this.mask).fade(0);
			}).bind(this),
			"onClick": (function () {
				this.hide();
			}).bind(this)
		});
		document.id(this.mask).set("tween", {
			duration: this.options.duration
		});
		document.id(this.mask).fade("hide");
		
		this.box = new Element("div", {
			"class": this.options.classPrefix + "box",
			"styles": {
				"width": this.options.initialWidth,
				"height": this.options.initialHeight,
				"margin-left": -(this.options.initialWidth / 2)
			},
			"tween": {
				duration: this.options.duration
			},
			"morph": {
				duration: this.options.duration
			}
		}).inject(this.container);
		this.box.fade("hide");
		
		var closeBtn = new Element("a", {
			"href": "#",
			"text": "Close video player",
			"class": this.options.classPrefix + "close",
			"events": {
				"click": function(evt){
					evt.preventDefault();
					this.hide();
				}.bind(this)
			}
		});
		
		closeBtn.inject(this.box);
		
		this.canvas = new Element("div", {
			"class": this.options.classPrefix + "canvas"
		});
		this.canvas.inject(this.box);
	},
	
	show: function (video) {
		this.mask.show();
		this.box.fade("in");
		if (this.playerLoaded) {
			if (this.currentVideo != video ) {
				this.player.load(video);
			}
		} else {
			this.box.morph({
				"width": this.options.width,
				"height": this.options.height,
				"margin-left": -(this.options.width / 2)
			});
			this.preparePlayer.delay(1000, this);
		}
		if (video) {
			this.currentVideo = video;
		}
	},
	
	hide: function () {
		this.player.pause();
		this.mask.hide();
		this.box.fade("out");
	},
	
	playerReady: function () {
		if (this.currentVideo) {
			this.player.load(this.currentVideo);
		}
		this.fireEvent("playerReady");
	}
	
});