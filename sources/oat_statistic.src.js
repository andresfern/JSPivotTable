

	OAT.Statistics = {
		list: [{
			longDesc: "Count",
			shortDesc: "COUNT",
			func: "count"
		}, {
			longDesc: "Sum",
			shortDesc: "SUM",
			func: "sum"
		}, {
			longDesc: "Product",
			shortDesc: "PRODUCT",
			func: "product"
		}, {
			longDesc: "Arithmetic mean",
			shortDesc: "MEAN",
			func: "amean"
		}, {
			longDesc: "Maximum",
			shortDesc: "MAX",
			func: "max"
		}, {
			longDesc: "Minimum",
			shortDesc: "MIN",
			func: "min"
		}, {
			longDesc: "Distinct values",
			shortDesc: "DISTINCT",
			func: "distinct"
		}, {
			longDesc: "Variance",
			shortDesc: "VAR",
			func: "variance"
		}, {
			longDesc: "Standard deviation",
			shortDesc: "STDDEV",
			func: "deviation"
		}, {
			longDesc: "Median",
			shortDesc: "MEDIAN",
			func: "median"
		}, {
			longDesc: "Mode",
			shortDesc: "MODE",
			func: "mode"
		}],
		count: function (a) {
			return a.length
		},
		sum: function (a) {
			if (a == "#FoE#") return "#NaV#"
			var allNuN = (a.length > 0);
			for (var c = 0, b = 0; b < a.length; b++) {
				if (a[b] != "#NuN#") allNuN = false;
				if (!isNaN(a[b]))
					c += a[b];
			}
			if (allNuN) return "#NuN#"
			return c
		},
		product: function (a) {
			for (var c = 1, b = 0; b < a.length; b++)
				c *= a[b];
			return c
		},
		amean: function (a) {
			for (var c = 0, b = 0; b < a.length; b++)
				c += a[b];
			return c = a.length ? c / a.length : 0
		},
		max: function (a) {
			for (var c = Number.MIN_VALUE, b = 0; b < a.length; b++)a[b] > c && (c = a[b]);
			return c
		},
		min: function (a) {
			for (var c = Number.MAX_VALUE, b = 0; b < a.length; b++)a[b] < c && (c = a[b]);
			return c
		},
		distinct: function (a) {
			for (var c = 0, b = {}, d = 0; d < a.length; d++)
				b[a[d]] = 1;
			for (p in b)
				c++;
			return c
		},
		deviation: function (a) {
			a = OAT.Statistics.variance(a);
			return Math.sqrt(a)
		},
		variance: function (a) {
			if (2 > a.length)
				return 0;
			for (var c = 0, b = OAT.Statistics.amean(a), d = 0; d < a.length; d++)
				c += (a[d] - b) * (a[d] - b);
			return c / (a.length - 1)
		},
		median: function (a) {
			return a.sort(function (a, b) { return a - b })[Math.floor(a.length / 2)]
		},
		mode: function (a) {
			for (var c = {}, b = 0; b < a.length; b++) {
				var d = a[b] + "";
				d in c ? c[d]++ : c[d] = 1
			}
			var a = 0, b = "", e;
			for (e in c) d = c[e], d > a && (a = d, b = e);
			return parseFloat(b)
		}
	};
	try {
		OAT.Loader.featureLoaded("statistics");
	} catch (ERROR) {

	}

	OAT.WinData = {
		TYPE_TEMPLATE: -1,
		TYPE_AUTO: 0,
		TYPE_MS: 1,
		TYPE_MAC: 2,
		TYPE_ROUND: 3,
		TYPE_RECT: 4,
		TYPE_ODS: 5
	};
	OAT.Win = function (a) {
		var b = this;
		this.options = {
			title: "",
			x: 0,
			y: 0,
			visibleButtons: "cmMfr",
			enabledButtons: "cmMfr",
			innerWidth: 0,
			innerHeight: 0,
			outerWidth: 350,
			outerHeight: !1,
			stackGroupBase: 100,
			type: OAT.WinData.TYPE_AUTO,
			template: !1,
			className: !1
		};
		for (var c in a)
			this.options[c] = a[c];
		b.dom = {
			buttons: {
				c: !1,
				m: !1,
				M: !1,
				f: !1,
				r: !1
			},
			container: !1,
			content: !1,
			title: !1,
			caption: !1,
			status: !1,
			resizeContainer: !1
		};
		b.moveTo = function (a, c) {
			b.dom.container.style.left = a + "px";
			b.dom.container.style.top = c + "px"
		};
		b.innerResizeTo = function () {
		};
		b.outerResizeTo = function () {
		};
		b.show = function () {
			document.body.appendChild(b.dom.container);
			OAT.Dom.show(b.dom.container)
		};
		b.hide = function () {
			OAT.Dom.hide(b.dom.container)
		};
		b.close = b.hide();
		b.minimize = function () {
		};
		b.maximize = function () {
		};
		b.flip = function () {
		};
		b.accomodate = function (a) {
			a = OAT.Dom.getWH(a);
			b.innerResizeTo(a[0], a[1])
		};
		b.options.type == OAT.WinData.TYPE_TEMPLATE && OAT.WinTemplate(b);
		b.options.type == OAT.WinData.TYPE_MS && OAT.WinMS(b);
		b.options.type == OAT.WinData.TYPE_MAC && OAT.WinMAC(b);
		b.options.type == OAT.WinData.TYPE_RECT && OAT.WinRECT(b, a.containerQuery);
		b.options.type == OAT.WinData.TYPE_ROUND && OAT.WinROUND(b);
		b.options.type == OAT.WinData.TYPE_ODS && OAT.WinODS(b);
		-1 != b.options.enabledButtons.indexOf("m") && b.dom.buttons.m && OAT.Dom.attach(b.dom.buttons.m, "click", b.minimize);
		-1 != b.options.enabledButtons.indexOf("M") && b.dom.buttons.M && OAT.Dom.attach(b.dom.buttons.M, "click", b.maximize);
		-1 != b.options.enabledButtons.indexOf("c") && b.dom.buttons.c && OAT.Dom.attach(b.dom.buttons.c, "click", b.hide);
		-1 != b.options.enabledButtons.indexOf("f") && b.dom.buttons.f && OAT.Dom.attach(b.dom.buttons.f, "click", b.flip);
		-1 != b.options.enabledButtons.indexOf("r") && b.dom.buttons.r && OAT.Resize.create(b.dom.buttons.r, b.dom.resizeContainer, OAT.Resize.TYPE_XY);
		b.dom.title && OAT.Drag.create(b.dom.title, b.dom.container);
		b.moveTo(b.options.x, b.options.y);
		(b.options.outerWidth || b.options.outerHeight) && b.outerResizeTo(b.options.outerWidth, b.options.outerHeight);
		(b.options.innerWidth || b.options.innerHeight) && b.innerResizeTo(b.options.innerWidth, b.options.innerHeight);
		b.dom.caption && (OAT.addTextNode(b.dom.caption, b.options));
		b.options.stackGroupBase && OAT.WinManager.addWindow(b.options.stackGroupBase, b.dom.container);
		b.hide()
	};
	OAT.WinTemplate = function (a) {
		var b = a.options.template;
		if (b) {
			for (var c = "function" == typeof b ? b() : OAT.$(b).cloneNode(!0), g = {
				oat_w_ctr: "container",
				oat_w_title_ctr: "title",
				oat_w_title_t_ctr: "caption",
				oat_w_content: "content",
				oat_w_max_b: ["buttons", "M"],
				oat_w_min_b: ["buttons", "m"],
				oat_w_close_b: ["buttons", "c"],
				oat_w_flip_b: ["buttons", "f"],
				oat_w_resize_handle: ["buttons", "r"]
			}, e = [c], b = c.getElementsByTagName("*"), c = 0; c < b.length; c++)
				e.push(b[c]);
			for (c = 0; c < e.length; c++) {
				var b = e[c], f;
				for (f in g)
					if (OAT.Dom.isClass(b, f)) {
						var d = g[f];
						d instanceof Array ? a.dom[d[0]][d[1]] = b : a.dom[d] = b
					}
			}
			a.moveTo = function (b, c) {
				a.dom.container.style.left = b + "px";
				a.dom.container.style.top = c + "px"
			};
			a.outerResizeTo = function (b, c) {
				a.dom.container.style.width = b ? b + "px" : "auto";
				a.dom.container.style.height = c ? c + "px" : "auto"
			};
			a.innerResizeTo = function (b, c) {
				a.dom.content.style.width = b ? b + "px" : "auto";
				a.dom.content.style.height = c ? c + "px" : "auto"
			}
		} else
			alert("OAT Window cannot be created, as a template is required but not specified!")
	};
	OAT.WinMS = function (a) {
		OAT.Style.include("winms.css");
		a.dom.container = OAT.Dom.create("div", {
			position: "absolute"
		}, "oat_winms_container");
		a.dom.resizeContainer = a.dom.container;
		a.dom.content = OAT.Dom.create("div", {}, "oat_winms_content");
		a.dom.title = OAT.Dom.create("div", {}, "oat_winms_title");
		a.dom.caption = OAT.Dom.create("span", {}, "oat_winms_caption");
		a.dom.status = OAT.Dom.create("div", {}, "oat_winms_status");
		OAT.Dom.append([a.dom.container, a.dom.title, a.dom.content, a.dom.status]);
		-1 != a.options.visibleButtons.indexOf("c") && (a.dom.buttons.c = OAT.Dom.create("div", {}, "oat_winms_close_b"), OAT.Dom.append([a.dom.title, a.dom.buttons.c]));
		-1 != a.options.visibleButtons.indexOf("M") && (a.dom.buttons.M = OAT.Dom.create("div", {}, "oat_winms_max_b"), OAT.Dom.append([a.dom.title, a.dom.buttons.M]));
		-1 != a.options.visibleButtons.indexOf("m") && (a.dom.buttons.m = OAT.Dom.create("div", {}, "oat_winms_min_b"), OAT.Dom.append([a.dom.title, a.dom.buttons.m]));
		-1 != a.options.visibleButtons.indexOf("r") && (a.dom.buttons.r = OAT.Dom.create("div", {}, "oat_winms_resize_b"), OAT.Dom.append([a.dom.container, a.dom.buttons.r]));
		OAT.Dom.append([a.dom.title, a.dom.caption]);
		a.outerResizeTo = function (b, c) {
			a.dom.container.style.width = b ? b + "px" : "auto";
			a.dom.container.style.height = c ? c + "px" : "auto"
		}
	};
	OAT.WinMAC = function (a) {
		OAT.Style.include("winmac.css");
		a.dom.container = OAT.Dom.create("div", {
			position: "absolute"
		}, "oat_winmac_container");
		a.dom.resizeContainer = a.dom.container;
		a.dom.content = OAT.Dom.create("div", {}, "oat_winmac_content");
		a.dom.title = OAT.Dom.create("div", {}, "oat_winmac_title");
		a.dom.caption = OAT.Dom.create("span", {}, "oat_winmac_caption");
		a.dom.status = OAT.Dom.create("div", {}, "oat_winmac_status");
		OAT.Dom.append([a.dom.container, a.dom.title, a.dom.content, a.dom.status]);
		a.dom.buttons.lc = OAT.Dom.create("div", {}, "oat_winmac_leftCorner");
		OAT.Dom.append([a.dom.title, a.dom.buttons.lc]);
		a.dom.buttons.rc = OAT.Dom.create("div", {}, "oat_winmac_rightCorner");
		OAT.Dom.append([a.dom.title, a.dom.buttons.rc]);
		-1 != a.options.visibleButtons.indexOf("c") && (a.dom.buttons.c = OAT.Dom.create("div", {}, "oat_winmac_close_b"), OAT.Dom.append([a.dom.title, a.dom.buttons.c]));
		-1 != a.options.visibleButtons.indexOf("M") && (a.dom.buttons.M = OAT.Dom.create("div", {}, "oat_winmac_max_b"), OAT.Dom.append([a.dom.title, a.dom.buttons.M])); -1 != a.options.visibleButtons.indexOf("m") && (a.dom.buttons.m = OAT.Dom.create("div", {}, "oat_winmac_min_b"), OAT.Dom.append([a.dom.title, a.dom.buttons.m]));
		-1 != a.options.visibleButtons.indexOf("r") && (a.dom.buttons.r = OAT.Dom.create("div", {}, "oat_winmac_resize_b"), OAT.Dom.append([a.dom.container, a.dom.buttons.r]));
		OAT.Dom.append([a.dom.title, a.dom.caption]);
		a.outerResizeTo = function (b, c) {
			a.dom.container.style.width = b ? b + "px" : "auto";
			a.dom.container.style.height = c ? c - 8 + "px" : "auto"
		}
	};
	OAT.WinRECT = function (a, className) {
		//OAT.Style.include("winrect.css");
		if (className != undefined)
			a.dom.container = OAT.Dom.create("div", {
				position: "absolute"
			}, className + " oat_winrect_container");
		else
			a.dom.container = OAT.Dom.create("div", {
				position: "absolute"
			}, "oat_winrect_container");

		a.dom.resizeContainer = a.dom.container;
		//a.dom.content = OAT.Dom.create("div", {}, "oat_winrect_content");

		
		if ( OAT.isSD() ) {
			a.dom.content = OAT.Dom.create("div", {}, "oat_winrect_content oat_winrect_content_small");
			a.dom.title = OAT.Dom.create("div", {}, "oat_winrect_title oat_winrect_title_small");
		} else {
			a.dom.content = OAT.Dom.create("div", {}, "oat_winrect_content");
			a.dom.title = OAT.Dom.create("div", {}, "oat_winrect_title");
		}


		a.dom.caption = OAT.Dom.create("span", {}, "oat_winrect_caption");
		a.dom.status = OAT.Dom.create("div", {}, "oat_winrect_status");

		OAT.Dom.append([a.dom.container, a.dom.title, a.dom.content, a.dom.status]);

		if ( OAT.isSD() ) {
			a.dom.buttons.c = OAT.Dom.create("div", {}, "oat_winrect_close_b oat_winrect_close_small");
		} else {
			a.dom.buttons.c = OAT.Dom.create("div", {}, "oat_winrect_close_b");
		}
		OAT.addImageNode(a.dom.buttons.c, "close", "");

		OAT.Dom.append([a.dom.title, a.dom.buttons.c]);

		a.outerResizeTo = function (b, c) {
			a.dom.container.style.width = b ? b + "px" : "auto";
			a.dom.container.style.height = c ? c + "px" : "auto"
		}
	};
	OAT.WinROUND = function (a) {
		OAT.Style.include("winround.css");
		a.dom.container = OAT.Dom.create("div", {
			position: "absolute"
		}, "oat_winround_container");
		a.dom.resizeContainer = a.dom.container;
		a.dom.table = OAT.Dom.create("table", {}, "oat_winround_wrapper");
		a.dom.tr_t = OAT.Dom.create("tr", {});
		a.dom.td_lt = OAT.Dom.create("td", {}, "oat_winround_lt");
		a.dom.td_t = OAT.Dom.create("td", {}, "oat_winround_t");
		a.dom.td_rt = OAT.Dom.create("td", {}, "oat_winround_rt");
		a.dom.tr_m = OAT.Dom.create("tr", {});
		a.dom.td_l = OAT.Dom.create("td", {}, "oat_winround_l");
		a.dom.td_m = OAT.Dom.create("td", {}, "oat_winround_m");
		a.dom.td_r = OAT.Dom.create("td", {}, "oat_winround_r");
		a.dom.tr_b = OAT.Dom.create("tr", {});
		a.dom.td_lb = OAT.Dom.create("td", {}, "oat_winround_lb");
		a.dom.td_b = OAT.Dom.create("td", {}, "oat_winround_b");
		a.dom.td_rb = OAT.Dom.create("td", {}, "oat_winround_rb");
		a.dom.content = OAT.Dom.create("div", {}, "oat_winround_content");
		a.dom.title = OAT.Dom.create("div", {}, "oat_winround_title");
		a.dom.caption = OAT.Dom.create("span", {}, "oat_winround_caption");
		a.dom.status = OAT.Dom.create("div", {}, "oat_winround_status");
		-1 != a.options.visibleButtons.indexOf("c") && (a.dom.buttons.c = OAT.Dom.create("div", {}, "oat_winround_close_b"), OAT.Dom.append([a.dom.title, a.dom.buttons.c]));
		-1 != a.options.visibleButtons.indexOf("r") && (a.dom.buttons.r = OAT.Dom.create("div", {}, "oat_winround_resize_b"), OAT.Dom.append([a.dom.td_rb, a.dom.buttons.r]));
		OAT.Dom.append([a.dom.title, a.dom.caption]);
		OAT.Browser.isIE ? (
			OAT.addTextNode(a.dom.container, '<table class="oat_winround_wrapper"><tr><td class="oat_winround_lt"></td><td class="oat_winround_t"></td><td class="oat_winround_rt"></td></tr><tr><td class="oat_winround_l"></td><td class="oat_winround_m"></td><td class="oat_winround_r"></td></tr><tr><td class="oat_winround_lb"></td><td class="oat_winround_b"></td><td class="oat_winround_rb"></td></tr></table>'),
			a.dom.container.childNodes[0].childNodes[0].childNodes[0].childNodes[1].appendChild(a.dom.title), a.dom.container.childNodes[0].childNodes[0].childNodes[1].childNodes[1].appendChild(a.dom.content), a.dom.container.childNodes[0].childNodes[0].childNodes[2].childNodes[1].appendChild(a.dom.status), a.dom.container.childNodes[0].childNodes[0].childNodes[2].childNodes[2].appendChild(a.dom.buttons.r)) : (OAT.Dom.append([a.dom.tr_t, a.dom.td_lt, a.dom.td_t, a.dom.td_rt]), OAT.Dom.append([a.dom.tr_m, a.dom.td_l, a.dom.td_m, a.dom.td_r]), OAT.Dom.append([a.dom.tr_b, a.dom.td_lb, a.dom.td_b, a.dom.td_rb]), OAT.Dom.append([a.dom.table, a.dom.tr_t, a.dom.tr_m, a.dom.tr_b]), OAT.Dom.append([a.dom.td_t, a.dom.title]), OAT.Dom.append([a.dom.td_m, a.dom.content]), OAT.Dom.append([a.dom.td_b, a.dom.status]), OAT.Dom.append([a.dom.container, a.dom.table]));
		a.outerResizeTo = function (b, c) {
			a.dom.container.style.width = b ? b + "px" : "auto";
			a.dom.container.style.height = c ? c + "px" : "auto"
		}
	};
	OAT.WinODS = function (a) {
		OAT.Style.include("winods.css");
		a.dom.container = OAT.Dom.create("div", {
			position: "absolute"
		}, "oat_winods_container");
		a.dom.resizeContainer = a.dom.container;
		a.dom.content = OAT.Dom.create("div", {}, "oat_winods_content");
		a.dom.title = OAT.Dom.create("div", {}, "oat_winods_title");
		a.dom.caption = OAT.Dom.create("span", {}, "oat_winods_caption");
		a.dom.status = OAT.Dom.create("div", {}, "oat_winods_status");
		OAT.Dom.append([a.dom.container, a.dom.title, a.dom.content, a.dom.status]);
		-1 != a.options.visibleButtons.indexOf("c") && (a.dom.buttons.c = OAT.Dom.create("div", {}, "oat_winods_close_b"), OAT.Dom.append([a.dom.title, a.dom.buttons.c]));
		-1 != a.options.visibleButtons.indexOf("r") && (a.dom.buttons.r = OAT.Dom.create("div", {}, "oat_winods_resize_b"), OAT.Dom.append([a.dom.container, a.dom.buttons.r]));
		OAT.Dom.append([a.dom.title, a.dom.caption]);
		a.outerResizeTo = function (b, c) {
			a.dom.container.style.width = b ? b + "px" : "auto";
			a.dom.container.style.height = c ? c + "px" : "auto"
		}
	};
	OAT.WinManager = {
		stackingGroups: {},
		addWindow: function (a, b) {
			if (a in OAT.WinManager.stackingGroups)
				var c = OAT.WinManager.stackingGroups[a];
			else
				c = new OAT.Layers(a), OAT.WinManager.stackingGroups[a] = c
			c.addLayer(b, "click")
		},
		removeWindow: function () {
			if (zI in OAT.WinManager.stackingGroups)
				var a = OAT.WinManager.stackingGroups[zI];
			else
				a = new OAT.Layers(zI), OAT.WinManager.stackingGroups[zI] = a
			a.removeLayer(container)
		}
	};
	try {
		OAT.Loader.featureLoaded("win");
	} catch (ERROR) {

	}

	OAT.Resize = {
		TYPE_X: 1, TYPE_Y: 2, TYPE_XY: 3, element: [], mouse_x: 0, mouse_y: 0, move: function (a) {
			if (OAT.Resize.element.length) {
				for (var e = a.clientX - OAT.Resize.mouse_x, f = a.clientY - OAT.Resize.mouse_y, b = 1, c = 0; c < OAT.Resize.element.length; c++) {
					var d = OAT.Resize.element[c][0], d = OAT.Dom.getWH(d), i = OAT.Resize.element[c][2], g = e, h = f; switch (OAT.Resize.element[c][1]) {
						case OAT.Resize.TYPE_X: h = 0; break; case -OAT.Resize.TYPE_X: g = -e; h = 0; break; case OAT.Resize.TYPE_Y: g = 0; break; case -OAT.Resize.TYPE_Y: g = 0; h = -f; break; case -OAT.Resize.TYPE_XY: g =
							-e, h = -f
					}i(d[0] + g, d[1] + h) && (b = 0)
				} if (b) {
					for (c = 0; c < OAT.Resize.element.length; c++)switch (d = OAT.Resize.element[c][0], OAT.Resize.element[c][1]) { case OAT.Resize.TYPE_X: OAT.Dom.resizeBy(d, e, 0); break; case -OAT.Resize.TYPE_X: OAT.Dom.resizeBy(d, -e, 0); break; case OAT.Resize.TYPE_Y: OAT.Dom.resizeBy(d, 0, f); break; case -OAT.Resize.TYPE_Y: OAT.Dom.resizeBy(d, 0, -f); break; case OAT.Resize.TYPE_XY: OAT.Dom.resizeBy(d, e, f); break; case -OAT.Resize.TYPE_XY: OAT.Dom.resizeBy(d, -e, -f) }OAT.Resize.mouse_x = a.clientX; OAT.Resize.mouse_y =
						a.clientY
				}
			}
		}, up: function () { for (var a = 0; a < OAT.Resize.element.length; a++)OAT.Resize.element[a][3](); OAT.Resize.element = [] }, create: function (a, e, f, b, c) {
			var d = OAT.$(a), a = OAT.$(e), e = function () { return !1 }, i = function () { return !1 }; b && (e = b); c && (i = c); switch (f) { case OAT.Resize.TYPE_XY: d.style.cursor = "nw-resize"; break; case OAT.Resize.TYPE_X: d.style.cursor = "w-resize"; break; case OAT.Resize.TYPE_Y: d.style.cursor = "n-resize" }b = function (a) {
				OAT.Resize.element = d._Resize_movers; OAT.Resize.mouse_x = a.clientX; OAT.Resize.mouse_y = a.clientY;
				a.cancelBubble = !0
			}; d._Resize_movers || (OAT.Dom.attach(d, "mousedown", b), d._Resize_movers = []); d._Resize_movers.push([a, f, e, i])
		}, remove: function (a, e) { var f = OAT.$(a); OAT.$(e); if (f._Resize_movers) { for (var b = -1, c = 0; c < f._Resize_movers.length; c++)f._Resize_movers[c][0] == e && (b = c); -1 != b && f._Resize_movers.splice(b, 1) } }, removeAll: function (a) { a = OAT.$(a); a._Resize_movers && (a._Resize_movers = []) }, createDefault: function (a, e, f) {
			if (OAT.Preferences.allowDefaultResize) {
				var b = OAT.Dom.create("div", {
					position: "absolute", width: "10px",
					height: "10px", right: "0px", fontSize: "1px", bottom: "0px"
				}); a.appendChild(b); OAT.Resize.create(b, a, OAT.Resize.TYPE_XY, e, f); OAT.Dom.hide(b); var c = function () { b._Resize_pending && OAT.Dom.hide(b) }; OAT.Dom.attach(a, "mouseover", function () { OAT.Dom.show(b); b._Resize_pending = 0 }); OAT.Dom.attach(a, "mouseout", function () { b._Resize_pending = 1; setTimeout(c, 2E3) })
			}
		}
	};
	if(typeof document != "undefined") { 
		OAT.Dom.attach(document, "mousemove", OAT.Resize.move);
		OAT.Dom.attach(document, "mouseup", OAT.Resize.up);
	}
	try {
		OAT.Loader.featureLoaded("resize");
	} catch (ERROR) {

	}

	OAT.XMLHTTP = function () {
		this.obj = this.iframe = !1;
		this.open = function (a, c, d) {
			this.iframe ? this.temp_src = c : this.obj.open(a, c, d)
		};
		this.send = function (a) {
			this.iframe ? this.ifr.src = this.temp_src : this.obj.send(a)
		};
		this.setResponse = function (a) {
			this.iframe ? OAT.Dom.attach(this.ifr, "load", a) : this.obj.onreadystatechange = a
		};
		this.getResponseText = function () {

		};
		this.getResponseXML = function () {
			return this.iframe ? (alert("IFRAME mode active -> XML data not supported"), "") : this.obj.responseXML
		};
		this.getReadyState = function () {
			return this.iframe ? 4 : this.obj.readyState
		};
		this.getStatus = function () {
			return this.iframe ? 200 : this.obj.status
		};
		this.setRequestHeader = function (a, c) {
			this.iframe || this.obj.setRequestHeader(a, c)
		};
		this.getAllResponseHeaders = function () {
			return !this.iframe ? this.obj.getAllResponseHeaders() : {}
		};
		this.isIframe = function () {
			return this.iframe
		};
		window.XMLHttpRequest ? this.obj = new XMLHttpRequest : window.ActiveXObject && (this.obj = new ActiveXObject("Microsoft.XMLHTTP"));
		this.obj || (this.iframe = !0, this.ifr = OAT.Dom.create("iframe"), this.ifr.style.display = "none", this.ifr.src = "javascript:;", document.body.appendChild(this.ifr))
	};
	OAT.XMLHTTP_supported = function () {
		return !(new OAT.XMLHTTP).isIframe()
	};
	try {
		OAT.Loader.featureLoaded("ajax");
	} catch (ERROR) {

	}


	OAT.AnchorData = { active: !1, window: !1 };
	OAT.Anchor = {
		appendContent: function (b) {
			if (b.content && b.window) {
				"function" == typeof b.content && (b.content = b.content());
				var d = b.window;
				OAT.Dom.clear(d.dom.content);
				d.dom.content.appendChild(b.content); OAT.Anchor.fixSize(d)
			}
		},
		callForData: function (b, d) {
			var e = b.window;
			b.stat = 1;

			b.status && (OAT.addTextNode(e.dom.status, b.status));
			var a = b.datasource;
			if (a) {
			a.connection = b.connection; var f = b.elm.innerHTML, c = function () {
				e.dom.caption.innerHTML = b.elm.innerHTML;
				if (b.title) e.dom.caption.innerHTML = b.title
			}; a.bindRecord(c); a.bindEmpty(c)
			}
			switch (b.result_control) {
				case "grid": c = new OAT.FormObject.grid(0, 0, 0, 1); c.showAll = !0; b.content = c.elm; c.elm.style.position = "relative"; c.init(); a.bindRecord(c.bindRecordCallback); a.bindPage(c.bindPageCallback); a.bindHeader(c.bindHeaderCallback); break; case "form": var h = !1; b.content = OAT.Dom.create("div");
					h = new OAT.Form(b.content, { onDone: function () { e.resizeTo(h.totalWidth + 5, h.totalHeight + 5); b.anchorTo(d[0], d[1]) } }); a.bindFile(function (a) {
						a = OAT.Xml.createXmlDoc(a);
						h.createFromXML(a)
					}); break; case "timeline": c = new OAT.FormObject.timeline(0, 20, 0); b.content = c.elm; c.elm.style.position = "relative"; c.elm.style.width = b.width - 5 + "px"; c.elm.style.height = b.height - 65 + "px"; c.init(); for (var i = 0; i < c.datasources[0].fieldSets.length; i++)c.datasources[0].fieldSets[i].realIndexes = [i]; a.bindPage(c.bindPageCallback)
			}OAT.Anchor.appendContent(b); if (a) {
				a.options.query = a.options.query.replace(/\$link_name/g, f); b.connection.options.endpoint = b.href; b.connection.options.url = b.href; switch (a.type) {
					case OAT.DataSourceData.TYPE_SPARQL: f =
						new OAT.SparqlQuery; f.fromString(a.options.query); f = f.variables.length ? "format=xml" : "format=rdf"; a.options.query = "query=" + encodeURIComponent(a.options.query) + "&" + f; break; case OAT.DataSourceData.TYPE_GDATA: a.options.query = a.options.query ? "q=" + encodeURIComponent(a.options.query) : ""
				}a.advanceRecord(0)
			}
		}, fixSize: function (b) {
			setTimeout(
				function () {
					/*if(OAT.AJAX.requests.length)
						OAT.Anchor.fixSize(b);
					else
						for(var d = OAT.Dom.getWH(b.dom.content)[1]; OAT.Dom.getWH(b.dom.content)[1] + 50 > OAT.Dom.getWH(b.dom.container)[1]; ) {650 > OAT.Dom.getWH(b.dom.container)[0] && (b.dom.container.style.width = OAT.Dom.getWH(b.dom.container)[0] + 100 + "px");
							if(d == OAT.Dom.getWH(b.dom.content)[1]) {
								b.dom.container.style.width = OAT.Dom.getWH(b.dom.container)[0] - 100 + "px";
								300 < OAT.Dom.getWH(b.dom.content)[1] && (b.dom.content.style.height = "300px", b.dom.content.style.overflow = "auto");
								b.dom.container.style.height = OAT.Dom.getWH(b.dom.content)[1] + 40 + "px";
								break
							}
							d = OAT.Dom.getWH(b.dom.content)[1]
						}*/
				}
				, 50)
		}
		, assign: function (b, d) {
			var e = OAT.$(b),
				a = {
					href: !1,
					newHref: "javascript:void(0)",
					connection: !1,
					datasource: !1,
					content: !1,
					status: !1,
					title: !1,
					result_control: "grid",
					activation: "hover",
					width: 340,
					height: !1,
					elm: e,
					window: !1,
					arrow: !1,
					type: OAT.WinData.TYPE_RECT,
					visibleButtons: "cr",
					enabledButtons: "cr",
					template: !1
				},
				f;
			for (f in d)
				a[f] = d[f];
			var c = new OAT.Win({
				outerWidth: a.width,
				outerHeight: a.height,
				title: "",
				type: a.type,
				status: a.status,
				visibleButtons: a.visibleButtons,
				enabledButtons: a.enabledButtons,
				template: a.template,
				containerQuery: a.containerQuery
			});
			OAT.Dom.attach(c.dom.container, "mouseover", function () {
				var a = OAT.AnchorData.active; a && "hover" == a.activation && a.endClose()
			});
			OAT.Dom.attach(c.dom.container, "mouseout", function () {
				var a = OAT.AnchorData.active;
				a && "hover" == a.activation && a.startClose()
			});
			f = OAT.Dom.create("div", {});
			//OAT.Dom.append([c.dom.container, f]);

			//a.arrow = f;
			a.window = c;
			c.close = function () {
				OAT.Dom.hide(c.dom.container)
			};
			c.onclose = c.close;
			c.close();
			a.stat = 0;
			!a.href && "href" in e && (a.href = e.href);
			"a" == e.tagName.toString().toLowerCase() && OAT.Dom.changeHref(e, a.newHref);
			a.displayRef = function (b) {
				var c = a.window;
				c.hide();
				OAT.AnchorData.active = a;
				b = OAT.Dom.eventPos(b);
				OAT.AnchorData.window = c;
				a.stat ? OAT.Anchor.appendContent(a) : OAT.Anchor.callForData(a, b);
				a.activation == "focus" && (b = OAT.Dom.position(e));
				a.anchorTo(b[0], b[1]);
				c.show();
				a.anchorTo(b[0], b[1])
			};
			a.displayRef2 = function (b) {
				var c = a.window;
				c.hide();
				OAT.AnchorData.active = a;
				//b = OAT.Dom.eventPos(b);
				OAT.AnchorData.window = c;
				a.stat ? OAT.Anchor.appendContent(a) : OAT.Anchor.callForData(a, b);
				a.activation == "focus" && (b = OAT.Dom.position(e));
				a.anchorTo(b[0], b[1]);
				c.show();
				a.anchorTo(b[0], b[1])
			};
			a.anchorTo = function (b, c) {
				var e = a.window, d = OAT.Dom.getFreeSpace(b, c), f = OAT.Dom.getWH(e.dom.container);
				if (d[1])
					var j = c - 30 - f[1], g = "bottom";
				else {
					j = c + 30;
					g = "top"
				}
				if (d[0]) {
					d = b + 20 - f[0];
					g = g + "right"
				} else {
					d = b - 30;
					g = g + "left"
				} d < 0 && (d = 10);
				j < 0 && (j = 10);
				//OAT.Dom.addClass(a.arrow, "oat_anchor_arrow_" + g);
				e.moveTo(d, j - 20)
			};
			a.closeRef = function () {

				if (a.closeFlag) {
					a.window.hide();
					OAT.AnchorData.active = false
				}
			};
			a.close = function () { a.window.hide() };
			a.startClose = function () { a.closeFlag = 1; setTimeout(a.closeRef, 1E3) };
			a.endClose = function () { a.closeFlag = 0 };
			switch (a.activation) {
				case "hover": OAT.Dom.attach(e, "mouseover", a.displayRef);
					OAT.Dom.attach(e, "mouseout", a.startClose);
					break; case "click": OAT.Dom.attach(e, "click", a.displayRef);
					break; case "dblclick": OAT.Dom.attach(e, "dblclick", a.displayRef);
					break; case "focus": OAT.Dom.attach(e, "focus", a.displayRef), OAT.Dom.attach(e, "blur", a.close)
			}

			return a

		},


		close: function (b, d) {
			b = OAT.$(b);
			"BODY" != b.tagName && (b.className.match(/^oat_win.+_container$/) ? (OAT.Dom.hide(b), d && this.close(b.parentNode)) : this.close(b.parentNode))
		},
		openAnchor: function () {
			var c = this.window;
			c.hide();
			OAT.AnchorData.active = this;
			b = OAT.Dom.eventPos(b);
			OAT.AnchorData.window = c;
			a.stat ? OAT.Anchor.appendContent(a) : OAT.Anchor.callForData(a, b);
			a.activation == "focus" && (b = OAT.Dom.position(e));
			a.anchorTo(b[0], b[1]);
			c.show();
			a.anchorTo(b[0], b[1])
		}
	};
	try {
		OAT.Loader.featureLoaded("anchor");
	} catch (ERROR) {

	}


	OAT.Animation = function (f, d) {
		var b = this;
		this.elm = OAT.$(f);
		this.options = {
			delay: 50,
			startFunction: function () {
			},
			conditionFunction: function () {
			},
			stepFunction: function () {
			},
			stopFunction: function () {
			}
		};
		for (var e in d)
			b.options[e] = d[e];
		this.step = function () {
			setTimeout(function () {
				b.running && (b.options.conditionFunction(b) ? (b.running = 0, b.options.stopFunction(b), OAT.MSG.send(b, OAT.MSG.ANIMATION_STOP, b)) : (b.options.stepFunction(b), b.step(b)))
			}, b.options.delay)
		};
		this.start = function () {
			b.running = 1;
			b.options.startFunction(b);
			b.step()
		};
		this.stop = function () {
			b.running = 0
		}
	};
	OAT.AnimationSize = function (f, d) {
		var b = this;
		this.options = {
			width: -1,
			height: -1,
			delay: 50,
			speed: 1
		};
		for (var e in d)
			b.options[e] = d[e];
		this.animation = new OAT.Animation(f, {
			delay: b.options.delay,
			startFunction: function (a) {
				a.stepX = 0;
				a.stepY = 0;
				var c = OAT.Dom.getWH(a.elm);
				a.width = c[0];
				a.height = c[1];
				a.diffX = -1 == b.options.width ? 0 : b.options.width - c[0];
				a.diffY = -1 == b.options.height ? 0 : b.options.height - c[1];
				a.signX = 0 <= a.diffX ? 1 : -1;
				a.signY = 0 <= a.diffY ? 1 : -1;
				var c = a.diffX * a.diffX, d = a.diffY * a.diffY;
				a.stepX = a.signX * Math.sqrt(b.options.speed * b.options.speed * c / (c + d));
				a.stepY = a.signY * Math.sqrt(b.options.speed * b.options.speed * d / (c + d))
			},
			stopFunction: function (a) {
			-1 != b.options.width && (a.elm.style.width = b.options.width + "px");
				-1 != b.options.height && (a.elm.style.height = b.options.height + "px")
			},
			conditionFunction: function (a) {
				var c = 0 < a.signX ? a.width >= b.options.width : a.width <= b.options.width, a = 0 < a.signY ? a.height >= b.options.height : a.height <= b.options.height;
				-1 == b.options.width && (c = 1);
				-1 == b.options.height && (a = 1);
				return c && a
			},
			stepFunction: function (a) {
				a.width += a.stepX;
				a.height += a.stepY;
				var c = parseInt(a.width), d = parseInt(a.height);
				-1 != b.options.width && (a.elm.style.width = (0 <= c ? c : 0) + "px");
				-1 != b.options.height && (a.elm.style.height = (0 <= d ? d : 0) + "px")
			}
		});
		this.start = b.animation.start;
		this.stop = b.animation.stop
	};
	OAT.AnimationPosition = function (f, d) {
		var b = this;
		this.options = {
			left: -1,
			top: -1,
			delay: 50,
			speed: 1
		};
		for (var e in d)
			b.options[e] = d[e];
		this.animation = new OAT.Animation(f, {
			delay: b.options.delay,
			startFunction: function (a) {
				a.stepX = 0;
				a.stepY = 0;
				var c = OAT.Dom.getLT(a.elm);
				a.left = c[0];
				a.top = c[1];
				a.diffX = -1 == b.options.left ? 0 : b.options.left - c[0];
				a.diffY = -1 == b.options.top ? 0 : b.options.top - c[1];
				a.signX = 0 <= a.diffX ? 1 : -1;
				a.signY = 0 <= a.diffY ? 1 : -1;
				var c = a.diffX * a.diffX, d = a.diffY * a.diffY;
				a.stepX = a.signX * Math.sqrt(b.options.speed * b.options.speed * c / (c + d));
				a.stepY = a.signY * Math.sqrt(b.options.speed * b.options.speed * d / (c + d))
			},
			stopFunction: function (a) {
			-1 != b.options.left && (a.elm.style.left = b.options.left + "px");
				-1 != b.options.top && (a.elm.style.top = b.options.top + "px")
			},
			conditionFunction: function (a) {
				var c = 0 < a.signX ? a.left >= b.options.left : a.left <= b.options.left, a = 0 < a.signY ? a.top >= b.options.top : a.top <= b.options.top;
				-1 == b.options.left && (c = 1);
				-1 == b.options.top && (a = 1);
				return c && a
			},
			stepFunction: function (a) {
				a.left += a.stepX;
				a.top += a.stepY;
				var c = parseInt(a.left), d = parseInt(a.top);
				-1 != b.options.left && (a.elm.style.left = c + "px");
				-1 != b.options.top && (a.elm.style.top = d + "px")
			}
		});
		this.start = b.animation.start;
		this.stop = b.animation.stop
	};
	OAT.AnimationOpacity = function (f, d) {
		var b = this;
		this.options = {
			opacity: 1,
			delay: 50,
			speed: 0.1
		};
		for (var e in d)
			b.options[e] = d[e];
		this.animation = new OAT.Animation(f, {
			delay: b.options.delay,
			startFunction: function (a) {
				a.opacity = 1;
				(!OAT.Dom.isKHTML() && navigator.userAgent.match(/Gecko/i)) && (a.opacity = parseFloat(OAT.Dom.style(a.elm, "opacity")));
				if (OAT.isIE()) {
					var c = OAT.Dom.style(a.elm, "filter").match(/alpha\(opacity=([^\)]+)\)/);
					c && (a.opacity = parseFloat(c[1]) / 100)
				}
				a.step_ = 1;
				a.diff = b.options.opacity - a.opacity;
				a.sign = 0 <= a.diff ? 1 : -1;
				a.step_ = a.sign * b.options.speed
			},
			stopFunction: function (a) {
				OAT.Style.opacity(a.elm, b.options.opacity)
			},
			conditionFunction: function (a) {
				return 0 < a.sign ? a.opacity + 1.0E-4 >= b.options.opacity : a.opacity - 1.0E-4 <= b.options.opacity
			},
			stepFunction: function (a) {
				a.opacity += a.step_;
				OAT.Style.opacity(a.elm, a.opacity)
			}
		});
		this.start = b.animation.start;
		this.stop = b.animation.stop
	};
	OAT.AnimationCSS = function (f, d) {
		var b = this;
		this.options = {
			delay: 50,
			property: !1,
			start: 0,
			step: 1,
			stop: 10
		};
		for (var e in d)
			b.options[e] = d[e];
		this.animation = new OAT.Animation(f, {
			delay: b.options.delay,
			startFunction: function (a) {
				a[b.options.property] = b.options.start;
				a.elm.style[b.options.property] = b.options.start
			},
			stopFunction: function (a) {
				a.elm.style[b.options.property] = b.options.stop
			},
			conditionFunction: function (a) {
				return a[b.options.property] == b.options.stop
			},
			stepFunction: function (a) {
				a[b.options.property] += b.options.step;
				a.elm.style[b.options.property] = a[b.options.property]
			}
		});
		this.start = b.animation.start;
		this.stop = b.animation.stop
	};
	try {
		OAT.Loader.featureLoaded("animation");
	} catch (ERROR) {

	}

	OAT.getURL = function () {
		try {
			var dir = location.href.substring(0, location.href.lastIndexOf('\/'));
			var dom = dir;
			if (dom.substr(0, 7) == 'http:\/\/')
				dom = dom.substr(7);
			var path = '';
			var pos = dom.indexOf('\/');
			if (pos > -1) {
				path = dom.substr(pos + 1);
				dom = dom.substr(0, pos);
			}
			var page = location.href.substring(dir.length + 1, location.href.length + 1);
			var pos = page.indexOf('?');
			if (pos > -1) {
				page = page.substring(0, pos);
			}
			pos = page.indexOf('#');
			if (pos > -1) {
				page = page.substring(0, pos);
			}
			var ext = '';
			pos = page.indexOf('.');
			if (pos > -1) {
				ext = page.substring(pos + 1);
				page = page.substr(0, pos);
			}
			var file = page;
			if (ext != '')
				file += '.' + ext;
			if (file == '')
				page = 'index';
			args = location.search.substr(1).split("?");

			return path + page;
		} catch (ERROR) {
			return "";
		}
	}

	OAT.PartialSort = function (data, a, z, index, arrayLength, sortIntMemory) {
		var partialArray = []
		for (var p = 0; p <= z - a; p++) {
			partialArray[p] = data[a + p]
		}

		if (sortIntMemory[index]) {
			partialArray.sort((function (index) {
				return function (a, b) {
					return (parseInt(a[index]) === parseInt(b[index]) ? 0 : (parseInt(a[index]) < parseInt(b[index]) ? -1 : 1));
				};
			})(index));
		} else {
			partialArray.sort((function (index) {
				return function (a, b) {
					return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
				};
			})(index));
		}

		//recursive call
		if (index < arrayLength - 1) {
			var actualVal = partialArray[0][index];
			var initPos = 0;
			for (var i = 0; i < partialArray.length; i++) {
				if ((actualVal != partialArray[i][index])) {
					actualVal = partialArray[i][index]
					partialArray = OAT.PartialSort(partialArray, initPos, i - 1, index + 1, arrayLength, sortIntMemory)
					initPos = i;
				} else if ((i == partialArray.length - 1)) {
					partialArray = OAT.PartialSort(partialArray, initPos, i, index + 1, arrayLength, sortIntMemory)
				}
			}
		}

		for (var p = a; p <= z; p++) {
			data[p] = partialArray[p - a]
		}
		return data
	}


