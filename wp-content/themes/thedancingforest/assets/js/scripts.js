if ($(document.documentElement).hasClass("fr")) {
	MooTools.lang.setLanguage("fr-FR");
}

var pageTracker;

// Add Google Analytics to donate buttons

$$("form.donate").addEvent("submit", function () {
	if (pageTracker) {
		pageTracker._trackPageview("/donation/");
	}
});


// Add milkbox to gallery

var photoGallery = $$(".gallery img");

if (photoGallery.length > 0) {
	photoGallery.each(function (el) {
		if (el.getParent("a")) {
			el.getParent("a").set({
				rel: "milkbox:gal1",
				title: el.get("title")
			});
		}
	});
	
	var milkbox = new Milkbox({
		overlayOpacity: 0.7
	});
}


// Auto-select text area

$$("textarea.code").addEvent("focus", function () {
	(function () {
		this.select();
	}).delay(200, this);
});


// Multi-page accordion

var labelsML = {
	en: {
		open: "Open panel",
		close: "Close panel"
	},
	fr: {
		open: "Ouvrir le panneau",
		close: "Fermer le panneau"
	}
};

var labels = labelsML.en;

if ($(document.documentElement).get("lang") == "fr-FR") {
	labels = labelsML.fr;
}


// Multi page accordion

$$("div.accordion").each(function (element) {
	var togglers = element.getElements("h3");
	var panels = element.getElements("div.section-wrapper");
	
	element.getElements("div.section:odd").addClass("odd");
	
	togglers.each(function (toggler) {
		var toggle = new Element("a", {
			"href": "#",
			"text": labels.open,
			"events": {
				"click": function (evt) {
					evt.preventDefault();
				}
			}
		});
		toggle.inject(toggler);
		toggler.store("toggle", toggle);
	});
	
	var accordion = new Fx.Accordion(togglers, panels, {
		initialDisplayFx: false,
		alwaysHide: true,
		onActive: function (toggler, element) {
			toggler.addClass("open");
			toggler.retrieve("toggle").set("text", labels.close);
		},
		onBackground: function (toggler, element) {
			toggler.removeClass("open");
			toggler.retrieve("toggle").set("text", labels.open);
		}
	});
});


// Video box

var stoppedOnce = false;

var videoBox = new Swiff.Video.Box({
	playerPath: assetsRoot + "/flash/videoplayer.swf",
	width: 700,
	height: 423,
	opacity: 0.7,
	playerOptions: {
		controlbar: assetsRoot + "/flash/controls.swf",
		preload: "start",
		volume: 80,
		onStop: function () {
			if (stoppedOnce) {
				videoBox.hide();
			}
			stoppedOnce = true;
		}
	}
});

$$("p.video a").addEvent("click", function (e) {
	e.stop();
	videoBox.show(this.get("href"));
	if (pageTracker) {
		pageTracker._trackPageview("/play_trailer/");
	}
});


// Form validation

$$("form.buy").each(function (form) {
	var validator = new Form.Validator.Inline(form, {
		stopOnFailure: true,
		errorPrefix: "",
		scrollToErrorsOnSubmit: true,
		onFormValidate: function (valid, form, evt) {
			if (evt && valid) {
				if (pageTracker) {
					pageTracker._trackPageview("/buy/");
				}
			}
		}
	});
	
	MooTools.lang.set('en-US', 'Form.Validator', {
		quality: "Please enter a valid quantity greater than 0.",
	});
	
	MooTools.lang.set('fr-FR', 'Form.Validator', {
		quality: "Veuillez saisir une quantité valide supérieur à 0.",
	});
	
	validator.add("validate-quantity", {
	    errorMsg: function () {
			return Form.Validator.getMsg('quality');
		},
	    test: function (field) {
			return (/^(-?[1-9]\d*|0)$/).test(field.get('value')) && field.get('value') > 0;
	    }
	});
});