
var OAT = {};


	/* global namespace */
	OAT.Preferences = {
		showAjax: 1, 
		useCursors: 1, 
		windowTypeOverride: 0, 
		version: "10.08.2023",
		httpError: 1, 
		allowDefaultResize: 1,
		allowDefaultDrag: 1
	}

	OAT.$ = function (something) {
		if (typeof (something) == "string") {
			var elm = document.getElementById(something);
		} else {
			var elm = something;
		}
		if (something instanceof Array) {
			var elm = [];
			for (var i = 0; i < something.length; i++) { elm.push(OAT.$(something[i])); }
		}
		if (!elm) return false;
		return elm;
	}

	OAT.$$ = function (className, root) {
		var e = root || document;
		var elms = e.getElementsByTagName("*");
		var matches = [];

		if (OAT.Dom.isClass(e, className)) { matches.push(e); }
		for (var i = 0; i < elms.length; i++) {
			if (OAT.Dom.isClass(elms[i], className)) { matches.push(elms[i]); }
		}
		return matches;
	}

	OAT.$v = function (something) {
		var e = OAT.$(something);
		if (!e) return false;
		if (!("value" in e)) return false;
		return e.value;
	}


	/* several helpful prototypes */
	Array.prototype.findIndex = function (str) {
		for (var i = 0; i < this.length; i++) if (this[i] == str) { return i; }
		return -1;
	}

	String.prototype.trimpivot = function () {
		var result = this.match(/^ *(.*?) *$/);
		return (result ? result[1] : this);
	}


	OAT.addTextNode = function (node, text) {
		var txtNode = document.createTextNode(text)
		var nodeJ = jQuery('<span id="span_txt_pivot"></span>')[0]
		nodeJ.appendChild(txtNode)
		node.appendChild(nodeJ)
	}
	
	
	OAT.addImageNode = function(parent, icon_name, style, id)
	{
		var icon = document.createElement("i");
		if (id!=undefined){
			icon.setAttribute("id", id);
		}
		icon.setAttribute("class", "material-icons");
		icon.setAttribute("style", style)
		icon.textContent = icon_name;  
		parent.appendChild(icon);	
	}

	OAT.replaceTextNode = function (node, text) {
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
		var txtNode = document.createTextNode(text)
		node.appendChild(txtNode)
	}
	
	OAT.AddItemToList = function (list, item) {
		if (list.indexOf(item) == -1) {
			list.push(item);
		}
		return list.sort(function(a, b) {
  				return a - b;
				});
	} 
	
	OAT.removeIconFont = function (text) {
		return text.replace(/arrow_drop_up/g, '').replace(/arrow_drop_down/g, '').replace(/remove/g, '').replace(/add/g, '').replace(/settings/g, '');
	}

	OAT.ApplyPictureValue = function (value, type, defaultPicture, picture) { /* function responsible for set pictures */
		if (value == "#NuN#") {
			var defaultNull = defaultPicture.getAttribute("textForNullValues");
			if (defaultNull == "") {
				return "\u00A0";
			}
			if (defaultNull != undefined) {
				return defaultNull;
			}
			return "\u00A0";

		}
		
			var decimalSeparator = (defaultPicture.getAttribute("decimalSeparator") != undefined && defaultPicture.getAttribute("decimalSeparator") != null) ? defaultPicture.getAttribute("decimalSeparator") : ".";
			var decimalPlaces = (defaultPicture.getAttribute("decimalPlaces") != undefined && defaultPicture.getAttribute("decimalPlaces") != null) ? defaultPicture.getAttribute("decimalPlaces") : 2;
			var thseparator = defaultPicture.getAttribute("thousandsSeparator")
			var defaultdate = defaultPicture.getAttribute("dateFormat")
			var newValue = value;
			var lastCharacter = false;

			var hasprefix = false;
			var prefix = "";
			if ((type == "integer") || (type == "real")) {
				if ((picture != undefined) || (picture != null)) {
					if ((picture[0] != "Z") || (picture[0] != "9") || (picture[0] != ",") || (picture[0] != ".")) {
						hasprefix = true;
						var index = 0;
						while ((picture.length > index) && (picture[index] != "Z") && (picture[index] != "9") && (picture[index] != ",") && (picture[index] != ".")) {
							index++;
						}
						prefix = picture.substring(0, index);
						picture = picture.substring(index);
					}
				}
			}

			var hassufix = false;
			var sufix = "";
			if ((type == "integer") || (type == "real")) {
				if ((picture != undefined) || (picture != null)) {
					if ((picture[picture.length - 1] != "Z") || (picture[picture.length - 1] != "9") || (picture[picture.length - 1] != ",") || (picture[picture.length - 1] != ".")) {
						hassufix = true;
						var index = picture.length - 1;
						while ((index > -1) && (picture[index] != "Z") && (picture[index] != "9") && (picture[index] != ",") && (picture[index] != ".")) {
							index--;
						}
						sufix = picture.substring(index + 1);
						picture = picture.substring(0, index + 1);
					}
				}
			}

			switch (type) {
				case "integer":
					decimalPlaces = 0;
				case "real":
					
					if ((picture != undefined) && (picture != "")) {
						
						if (typeof qv == "undefined")
							var newValue = parseFloat(value)
						else
							qv.util.formatNumber(parseFloat(value), decimalPlaces, picture, false);
						
					} else {
						var valueSplit = value.split(".");
						var useSeparator = true;
						if ((picture == "") && (type == "integer")) {
							useSeparator = false;
						}
						
						if (type == "real") {
							newValue = parseFloat(value).toFixed(2);
							valueSplit = newValue.split(".");
						}
					
						newValue = valueSplit[0];
					


						var z_pos = -1;
						if ((picture != undefined) && (picture != "")) {
							var picteSplit = picture.split(".");
							if (picteSplit.length > 1)
								z_pos = picteSplit[1].indexOf("Z");
						}

						if (valueSplit[1] == null) {
							if (useSeparator) {
								var numoblig = decimalPlaces;
								if (z_pos != -1) {
									numoblig = z_pos;
								}
								if (numoblig > 0) {
									newValue = newValue + decimalSeparator;
									for (var i = 0; i < numoblig; i++) {
										newValue = newValue + "0";
									}
								}
							}
						} else {
							if (useSeparator) {

								if (z_pos === -1) { //only 9s in decimal picture
									if (valueSplit[1].length < decimalPlaces) {
										newValue = newValue + decimalSeparator + valueSplit[1];
										for (var i = 0; i < decimalPlaces - valueSplit[1].length; i++) {
											newValue = newValue + "0";
										}

									} else {
										if (valueSplit[1].length > decimalPlaces) {
											var newArray = "";
											for (var i = 0; i < decimalPlaces; i++) {
												newArray = newArray + valueSplit[1].charAt(i);
											}
											newValue = newValue + decimalSeparator + newArray;
										} else {
											newValue = newValue + decimalSeparator + valueSplit[1];
										}
									}
								} else {
									var numberoblig = z_pos;
									if (valueSplit[1].length < decimalPlaces) {
										if ((valueSplit[1].length > 0) || (numberoblig > 0)) {
											newValue = newValue + decimalSeparator + valueSplit[1];
											for (var i = 0; i < numberoblig - valueSplit[1].length; i++) {
												newValue = newValue + "0";
											}
										}
									} else { //idem sin Z
										if (valueSplit[1].length > decimalPlaces) {
											var newArray = "";
											for (var i = 0; i < decimalPlaces; i++) {
												newArray = newArray + valueSplit[1].charAt(i);
											}
											newValue = newValue + decimalSeparator + newArray;
										} else {
											newValue = newValue + decimalSeparator + valueSplit[1];
										}
									}
								}

							}
						}

					}
					break;
				case "date":
					if (value == "") return "";
					if (picture === "") {
						var dates = value.split("-");
						var newValue = value;
						if ((defaultdate != undefined) && (defaultdate != null)) {//if default picture
							pict = defaultdate.split("");
							newValue = "";
							for (var i = 0; i <= 2; i++) {
								if (pict[i] === "M")
									newValue = newValue + dates[1];
								if (pict[i] === "D")
									newValue = newValue + dates[2];
								if (pict[i] === "Y")
									newValue = newValue + dates[0];
								if (i != 2)
									newValue = newValue + "/";
							}
						} else {
							newValue = dates[1] + "/" + dates[2] + "/" + dates[0];
						}
					} else {

						var valueSplit = value.split("-");
						newValue = "";
						if (picture == "99/99/9999") {
							if (valueSplit[0].length == 4) {
								if ((defaultdate == undefined) || (defaultdate == null) || (defaultdate == "MDY")) {
									newValue = valueSplit[1] + "/" + valueSplit[2] + "/" + valueSplit[0];
								} else if ((defaultdate != undefined) && (defaultdate == "YMD")) { //for japanese
									newValue = valueSplit[0] + "/" + valueSplit[1] + "/" + valueSplit[2];
								} else { //DMY
									newValue = valueSplit[2] + "/" + valueSplit[1] + "/" + valueSplit[0];
								}
							} else {
								newValue = value;
								while (newValue.indexOf("-") != -1) {
									newValue.replace("-", "/");
								}
							}
						} else

							if (picture == "99/99/99") {
								if (valueSplit[0].length == 4) {
									valueSplit[0] = valueSplit[0].substr(valueSplit[0].length - 2, 2);
								}
								if ((defaultdate == undefined) || (defaultdate == null) || (defaultdate == "MDY")) {
									newValue = valueSplit[1] + "/" + valueSplit[2] + "/" + valueSplit[0];
								} else if ((defaultdate != undefined) && (defaultdate == "YMD")) { //for japanese
									newValue = valueSplit[0] + "/" + valueSplit[1] + "/" + valueSplit[2];
								} else { //DMY
									newValue = valueSplit[2] + "/" + valueSplit[1] + "/" + valueSplit[0];
								}
							} else if (picture == "9999/99/99") {
								if ((defaultdate == undefined) || (defaultdate == null) || (defaultdate == "MDY")) {
									newValue = valueSplit[1] + "/" + valueSplit[2] + "/" + valueSplit[0];
								} else if ((defaultdate != undefined) && (defaultdate == "YMD")) { //for japanese
									newValue = valueSplit[0] + "/" + valueSplit[1] + "/" + valueSplit[2];
								} else { //DMY
									newValue = valueSplit[2] + "/" + valueSplit[1] + "/" + valueSplit[0];
								}
							}
							else {
								if (valueSplit[0].length == 4) {
									valueSplit[0] = valueSplit[0].substr(valueSplit[0].length - 2, 2);
								}
								if ((defaultdate == undefined) || (defaultdate == null) || (defaultdate == "MDY")) {
									newValue = valueSplit[1] + "/" + valueSplit[2] + "/" + valueSplit[0];
								} else if ((defaultdate != undefined) && (defaultdate == "YMD")) { //for japanese
									newValue = valueSplit[0] + "/" + valueSplit[1] + "/" + valueSplit[2];
								} else { //DMY
									newValue = valueSplit[2] + "/" + valueSplit[1] + "/" + valueSplit[0];
								}
							}



					}

					break; // End execution
				case "datetime":
					if (value == "") return "";
					var dividevalue = value.split("T");//separate date from hour
					if (value.indexOf("T") === -1) {
						dividevalue = value.split(" ");
					}
					//formatting date
					if (picture === "") {
						var dates = dividevalue[0].split("-");
						var newValue = value;
						if ((defaultdate != undefined) && (defaultdate != null)) {//if default picture
							pict = defaultdate.split("");
							newValue = "";
							for (var i = 0; i <= 2; i++) {
								if (pict[i] === "M")
									newValue = newValue + dates[1];
								if (pict[i] === "D")
									newValue = newValue + dates[2];
								if (pict[i] === "Y")
									newValue = newValue + dates[0];
								if (i != 2)
									newValue = newValue + "/";
							}
						} else {
							newValue = dates[1] + "/" + dates[2] + "/" + dates[0];
						}
					} else {
						var dividepicture = picture.split(" ");
						var valueSplit = dividevalue[0].split("-");
						newValue = "";
						if (dividepicture[0] == "99/99/9999") {
							if (valueSplit[0].length == 4) {
								if ((defaultdate == undefined) || (defaultdate == null) || (defaultdate == "MDY")) {
									newValue = valueSplit[1] + "/" + valueSplit[2] + "/" + valueSplit[0];
								} else if ((defaultdate != undefined) && (defaultdate == "YMD")) { //for japanese
									newValue = valueSplit[0] + "/" + valueSplit[1] + "/" + valueSplit[2];
								} else { //DMY
									newValue = valueSplit[2] + "/" + valueSplit[1] + "/" + valueSplit[0];
								}
							} else {
								newValue = value;
								while (newValue.indexOf("-") != -1) {
									newValue.replace("-", "/");
								}
							}
						} else

							if (dividepicture[0] == "99/99/99") {
								if (valueSplit[0].length == 4) {
									valueSplit[0] = valueSplit[0].substr(valueSplit[0].length - 2, 2);
								}
								if ((defaultdate == undefined) || (defaultdate == null) || (defaultdate == "MDY")) {
									newValue = valueSplit[1] + "/" + valueSplit[2] + "/" + valueSplit[0];
								} else if ((defaultdate != undefined) && (defaultdate == "YMD")) { //for japanese
									newValue = valueSplit[0] + "/" + valueSplit[1] + "/" + valueSplit[2];
								} else { //DMY
									newValue = valueSplit[2] + "/" + valueSplit[1] + "/" + valueSplit[0];
								}
							} else
								if (dividepicture[0] == "9999/99/99")
									if ((defaultdate == undefined) || (defaultdate == null) || (defaultdate == "MDY")) {
										newValue = valueSplit[1] + "/" + valueSplit[2] + "/" + valueSplit[0];
									} else if ((defaultdate != undefined) && (defaultdate == "YMD")) { //for japanese
										newValue = valueSplit[0] + "/" + valueSplit[1] + "/" + valueSplit[2];
									} else { //DMY
										newValue = valueSplit[2] + "/" + valueSplit[1] + "/" + valueSplit[0];
									}
								else {

									newValue = "";
								}
					}

					//formating hour

					if (picture === "") {
						if (dividevalue.length > 1) {
							var hourandms = dividevalue[1].split(".");

							newValue = newValue + " " + hourandms[0]
						}
					} else {
						var dividepicture = picture.split(" ");
						if ((picture.split(" ").length < 2) && (dividepicture[0] != "99/99/9999") && (dividepicture[0] != "9999/99/99") && (dividepicture[0] != "99/99/99")) {
							dividepicture.push(picture)
						}

						if (dividepicture.length > 1) {
							var digits;
							if (dividevalue.length > 1) {
								var hourandms = dividevalue[1].split(".");

								digits = hourandms[0].split(":");

								if (digits.length < 2) {
									digits[1] = "00";
									digits[2] = "00";
								}
								if (digits.length < 3) {
									digits[2] = "00";
								}
								if (hourandms.length < 2) {
									digits[3] = "000"
								} else {
									digits[3] = hourandms[1]
								}
							} else {
								digits = new Array(3)
								digits[0] = "00";
								digits[1] = "00";
								digits[2] = "00";
								digits[3] = "000";
							}



							switch (dividepicture[1]) {
								case "99":
									newValue = newValue + " " + digits[0];
									break;
								case "99:99":
									newValue = newValue + " " + digits[0] + ":" + digits[1];
									break;
								case "99:99:99":
									newValue = newValue + " " + digits[0] + ":" + digits[1] + ":" + digits[2];
									break;
								case "99:99:99.999":
									newValue = newValue + " " + digits[0] + ":" + digits[1] + ":" + digits[2] + "." + digits[3];
									break
								default:
									newValue = newValue + " " + digits[0] + ":" + digits[1] + ":" + digits[2];
							}

						}
					}
					break;
				case "character":
					newValue = OAT.Dom.fromSafeXML(value);
					if (picture == "@!") {
						newValue = value.toUpperCase();
					}
					break;
				default:

			}

			if (hasprefix) {
				newValue = prefix + newValue;
			}
			if (hassufix) {
				newValue = newValue + sufix;
			}

			return newValue;
		}
	
	
	//Allow Selection methods 
	OAT.SetSelectedNodeBackgroundColor = function(node, color, $container){
		OAT.ClearSelectedNodes($container)
		OAT.SetNodeBackgroundColor(node, color);
	}
	
	OAT.ClearSelectedNodes = function($container) {
		/*$container.find(".gx-qv-selected-element").each(function (index, value) {
			var previousColor = jQuery(value).attr("previousBackgroundColor");
			jQuery(value).css({backgroundColor: previousColor});
		});*/
		
		$container.find(".gx-qv-selected-element").removeClass("gx-qv-selected-element");
	}
	
	OAT.SetNodeBackgroundColor = function(node, color){
		if (!jQuery(node).hasClass("gx-qv-selected-element")){
			//var backgroundColor = jQuery(node).css("background-color");
			//jQuery(node).attr("previousBackgroundColor", backgroundColor);
		
			//jQuery(node).css({backgroundColor: color});
			jQuery(node).addClass("gx-qv-selected-element");
		}
	}
	
	OAT.IsNodeSelected = function(node){
		return jQuery(node).hasClass("gx-qv-selected-element")
	}
	
	OAT.SelectAllRow = function(row, color, avoid){
		for (var cell = 0; cell < row.children.length; cell++){
			if ((avoid == undefined) || (avoid != cell))
				OAT.SetNodeBackgroundColor(row.children[cell], color)
		}
	}
	//picture methods

	OAT.isSD = function(){
		var ua = navigator.userAgent.toLowerCase();
		var isAndroid = ua.indexOf("android") > -1;
		var isIOs = (ua.indexOf("iPhone") != -1) || (ua.indexOf("iPad") != -1) || (ua.indexOf("iPod") != -1)

		if (isAndroid || isIOs) {
			return true
		} else {
			return false
		}
	}
	
	OAT.isAndroid = function(){
		var ua = navigator.userAgent.toLowerCase();
		return ua.indexOf("android") > -1;
	}
	
	OAT.isSafari = function(){
		var ua = navigator.userAgent.toLowerCase();
		return ((ua.indexOf("Safari") != -1) && (ua.indexOf("Chrome") === -1))
	}	

	OAT.isIE = function(){
		if (window.document.documentMode)
			return true
		else
			return false
	}
	
	OAT.isWebkit = function(){
		var ua = navigator.userAgent.toLowerCase();
		return (ua.search(/webkit/ig) != -1)
	}
	
	OAT.resourceURL = function(path){
		return path;
	}
	
	OAT.charReplace = function (Value, Chars, Repls) {
		var Ret = '';
		var len = Value.length;
		for (var i = 0; i < len; i++) {
			var bFixed = false;
			var len1 = Chars.length;
			for (var c = 0; c < len1; c++) {
				if (Value.charAt(i) == Chars[c]) {
					if (c < Repls.length) {
						Ret += Repls[c];
						bFixed = true;
						break;
					}
				}
			}
			if (bFixed === false)
				Ret += Value.charAt(i);
		}
		return Ret;
	}
	
	OAT.Dom = { /* DOM common object */
		create: function (tagName, styleObj, className) {
			var elm = document.createElement(tagName);
			if (styleObj) {
				for (prop in styleObj) { elm.style[prop] = styleObj[prop]; }
			}
			if (className) { elm.className = className; }
			return elm;
		},

		createNS: function (ns, tagName) {
			if (document.createElementNS) {
				var elm = document.createElementNS(ns, tagName);
			} else {
				var elm = document.createElement(tagName);
				elm.setAttribute("xmlns", ns);
			}
			return elm;
		},

		text: function (text) {
			var elm = document.createTextNode(text);
			return elm;
		},

		button: function (label) {
			var b = OAT.Dom.create("input");
			b.type = "button";
			b.value = label;
			return b;
		},

		radio: function (name) {
			if (OAT.isIE()) {
				var elm = document.createElement('<input type="radio" name="' + name + '" />');
				return elm;
			} else {
				var elm = OAT.Dom.create("input");
				elm.name = name;
				elm.type = "radio";
				return elm;
			}
		},

		image: function (src, srcBlank, w, h) {
			w = (w ? w + 'px' : 'auto');
			h = (h ? h + 'px' : 'auto');
			var elm = OAT.Dom.create("img", { width: w, height: h });
			OAT.Dom.imageSrc(elm, src, srcBlank);
			return elm;
		},

		imageSrc: function (element, src, srcBlank) {
			var elm = OAT.$(element);
			var png = !!src.toLowerCase().match(/png$/);
			elm.src = src;
		},
		option: function (name, value, parent) {
			var opt = OAT.Dom.create("option");
			OAT.addTextNode(opt, name)
			opt.value = value;
			if (parent) { OAT.$(parent).appendChild(opt); }
			return opt;
		},
		append: function () {
			for (var i = 0; i < arguments.length; i++) {
				var arr = arguments[i];
				if (!(arr instanceof Array)) { continue; }
				if (arr.length < 2) { continue; }
				var parent = OAT.$(arr[0]);
				for (var j = 1; j < arr.length; j++) {
					var children = arr[j];
					if (!(children instanceof Array)) { children = [children]; }
					for (var k = 0; k < children.length; k++) {
						var child = children[k];
						parent.appendChild(OAT.$(child));
					}
				}
			}
		},

		hide: function (element) {
			if (arguments.length > 1) {
				for (var i = 0; i < arguments.length; i++) { OAT.Dom.hide(arguments[i]); }
				return;
			}
			if (element instanceof Array) {
				for (var i = 0; i < element.length; i++) { OAT.Dom.hide(element[i]); }
				return;
			}
			var elm = OAT.$(element);
			if (!elm) { return; }
			/* ie input hack */
			var inputs_ = elm.getElementsByTagName("input");
			var inputs = [];
			for (var i = 0; i < inputs_.length; i++) { inputs.push(inputs_[i]); }
			if (elm.tagName.toLowerCase() == "input") { inputs.push(elm); }
			for (var i = 0; i < inputs.length; i++) {
				var inp = inputs[i];
				if (inp.type == "radio" || inp.type == "checkbox") {
					if (!inp.__checked) { inp.__checked = (inp.checked ? "1" : "0"); }
				}
			}
			elm.style.display = "none";
		},

		show: function (element) {
			if (arguments.length > 1) {
				for (var i = 0; i < arguments.length; i++) { OAT.Dom.show(arguments[i]); }
				return;
			}
			if (element instanceof Array) {
				for (var i = 0; i < element.length; i++) { OAT.Dom.show(element[i]); }
				return;
			}
			var elm = OAT.$(element);
			if (!elm) { return; }
			elm.style.display = "";
			/* ie input hack */
			var inputs_ = elm.getElementsByTagName("input");
			var inputs = [];
			for (var i = 0; i < inputs_.length; i++) { inputs.push(inputs_[i]); }
			if (elm.tagName.toLowerCase() == "input") { inputs.push(elm); }
			for (var i = 0; i < inputs.length; i++) {
				var inp = inputs[i];
				if (inp.type == "radio" || inp.type == "checkbox") {
					if (inp["__checked"] && inp.__checked === "1") { inp.checked = true; }
					if (inp["__checked"] && inp.__checked === "0") { inp.checked = false; }
					inp.__checked = false;
				}
			}
		},

		clear: function (element) {
			var elm = OAT.$(element);
			while (elm.firstChild) { elm.removeChild(elm.firstChild); }
		},

		unlink: function (element) {
			var elm = OAT.$(element);
			if (!elm) { return; }
			if (!elm.parentNode) { return; }
			elm.parentNode.removeChild(elm);
		},

		center: function (element, x, y, reference) {
			var elm = OAT.$(element);
			var p = elm.offsetParent;
			if (reference) { p = reference; }
			if (!p) { return; }
			var par_dims = (p == document.body || p.tagName.toLowerCase() == "html" ? OAT.Dom.getViewport() : OAT.Dom.getWH(p));
			var dims = OAT.Dom.getWH(elm);
			var new_x = Math.round(par_dims[0] / 2 - dims[0] / 2);
			var new_y = Math.round(par_dims[1] / 2 - dims[1] / 2);
			if (new_y < 0) { new_y = 30; }
			var s = OAT.Dom.getScroll();
			if (p == document.body || p.tagName.toLowerCase() == "html") {
				new_x += s[0];
				new_y += s[1];
			}
			if (x) { elm.style.left = new_x + "px"; }
			if (y) { elm.style.top = new_y + "px"; }
		},

		isChild: function (child, parent) {
			var c_elm = OAT.$(child);
			var p_elm = OAT.$(parent);
			/* walk up from the child. if we find parent element, return true */
			var node = c_elm.parentNode;
			do {
				if (!node) { return false; }
				if (node == p_elm) { return true; }
				node = node.parentNode;
			} while (node != document.body && node != document);
			return false;
		},

		isKonqueror: function () { return (navigator.userAgent.match(/konqueror/i) ? true : false); },
		isKHTML: function () { return (navigator.userAgent.match(/khtml/i) ? true : false); },
		isIE: function () { return (document.attachEvent && !document.addEventListener ? true : false); },
		isIE7: function () { return (navigator.userAgent.match(/msie 7/i) ? true : false); },
		isIE6: function () { return (OAT.Dom.isIE() && !OAT.Dom.isIE7()); },
		isGecko: function () { return ((!OAT.Dom.isKHTML() && navigator.userAgent.match(/Gecko/i)) ? true : false); },
		isOpera: function () { return (navigator.userAgent.match(/Opera/) ? true : false); },
		isWebKit: function () { return (navigator.userAgent.match(/AppleWebKit/) ? true : false); },
		isMac: function () { return (navigator.platform.toString().match(/mac/i) ? true : false); },
		isLinux: function () { return (navigator.platform.toString().match(/linux/i) ? true : false); },
		isWindows: function () { return (navigator.userAgent.toString().match(/windows/i) ? true : false); },

		color: function (str) {
			var hex2dec = function (hex) { return parseInt(hex, 16); }
			/* returns [col1,col2,col3] in decimal */
			if (str.match(/#/)) {
				/* hex */
				if (str.length == 4) {
					var tmpstr = "#" + str.charAt(1) + str.charAt(1) + str.charAt(2) + str.charAt(2) + str.charAt(3) + str.charAt(3);
				} else {
					var tmpstr = str;
				}
				var tmp = tmpstr.match(/#(..)(..)(..)/);
				return [hex2dec(tmp[1]), hex2dec(tmp[2]), hex2dec(tmp[3])];
			} else {
				/* decimal */
				var tmp = str.match(/\(([^,]*),([^,]*),([^\)]*)/);
				return [parseInt(tmp[1]), parseInt(tmp[2]), parseInt(tmp[3])];
			}
		},

		isClass: function (something, className) {
			var elm = OAT.$(something);
			if (!elm) { return false; }
			if (className == "*") { return true; }
			if (className == "") { return false; }
			if (!elm.className) { return false; }
			var arr = elm.className.split(" ");
			var index = arr.indexOf(className);
			return (index != -1);
		},

		addClass: function (something, className) {
			var elm = OAT.$(something);
			if (!elm) { return; }
			if (OAT.Dom.isClass(elm, className)) { return; }
			var arr = elm.className.split(" ");
			arr.push(className);
			if (arr[0] == "") { arr.splice(0, 1); }
			elm.className = arr.join(" ");
		},

		setIdPropertyValue: function (something, value) {
			var elm = OAT.$(something);
			if (!elm) { return; }
			elm.id = value;
		},

		removeClass: function (something, className) {
			var elm = OAT.$(something);
			if (!elm) { return; }
			if (!OAT.Dom.isClass(elm, className)) { return; } /* cannot remove non-existing class */
			if (className == "*") { elm.className = ""; } /* should not occur */
			var arr = elm.className.split(" ");
			var index = arr.indexOf(className);
			if (index == -1) { return; } /* should NOT occur! */
			arr.splice(index, 1);
			elm.className = arr.join(" ");
		},

		getViewport: function () {
			if (OAT.isWebkit()) {
				return [window.innerWidth, window.innerHeight];
			}
			if ( (navigator.userAgent.match(/Opera/)) || document.compatMode == "BackCompat") {
				return [document.body.clientWidth, document.body.clientHeight];
			} else {
				return [document.documentElement.clientWidth, document.documentElement.clientHeight];
			}
		},

		position: function (something) {
			var elm = OAT.$(something);
			var parent = elm.offsetParent;
			if (elm == document.body || elm == document || !parent) { return OAT.Dom.getLT(elm); }
			var parent_coords = OAT.Dom.position(parent);
			var c = OAT.Dom.getLT(elm);
			/*
			var x = elm.offsetLeft - elm.scrollLeft + parent_coords[0];
			var y = elm.offsetTop - elm.scrollTop + parent_coords[1];
			*/

			/*
			this is interesting: Opera with no scrolling reports scrollLeft/Top equal to offsetLeft/Top for <input> elements
			*/
			var x = c[0];
			var y = c[1];
			if (!(navigator.userAgent.match(/Opera/)) || elm.scrollTop != elm.offsetTop || elm.scrollLeft != elm.offsetLeft) {
				x -= elm.scrollLeft;
				y -= elm.scrollTop;
			}

			if (OAT.isWebkit() && parent == document.body && OAT.Dom.style(elm, "position") == "absolute") { return [x, y]; }

			x += parent_coords[0];
			y += parent_coords[1];
			return [x, y];
		},

		getLT: function (something) {
			var elm = OAT.$(something);
			var curr_x, curr_y;
			if (elm.style.left && elm.style.position != "relative") {
				curr_x = parseInt(elm.style.left);
			} else {
				curr_x = elm.offsetLeft;
			}
			if (elm.style.top && elm.style.position != "relative") {
				curr_y = parseInt(elm.style.top);
			} else {
				curr_y = elm.offsetTop;
			}
			return [curr_x, curr_y];
		},

		getWH: function (something) {
			/*
			This is tricky: we need to measure current element's width & height.
			If this property was already set (thus available directly through elm.style),
			everything is ok.
			If nothing was set yet:
			* IE stores this information in offsetWidth and offsetHeight
			* Gecko doesn't count borders into offsetWidth and offsetHeight
			Thus, we need another means for counting real dimensions.
			*/
			var curr_w, curr_h;
			var elm = OAT.$(something);
			if (elm.style.width && !elm.style.width.match(/%/) && elm.style.width != "auto") {
				curr_w = parseInt(elm.style.width);
			} else if (OAT.Style.get(elm, "width") && !OAT.isIE()) {
				curr_w = Math.round(parseFloat(OAT.Style.get(elm, "width")));
			} else {
				curr_w = elm.offsetWidth;
				if (elm.tagName.toLowerCase() == "input") { curr_w += 5; }
			}

			if (elm.style.height && !elm.style.height.match(/%/) && elm.style.height != "auto") {
				curr_h = parseInt(elm.style.height);
			} else if (OAT.Style.get(elm, "height") && !OAT.isIE()) {
				curr_h = Math.round(parseFloat(OAT.Style.get(elm, "height")));
			} else {
				curr_h = elm.offsetHeight;
				if (elm.tagName.toLowerCase() == "input") { curr_h += 5; }
			}

			/* one more bonus - if we are getting height of document.body, take window size */
			if (elm == document.body) {
				curr_h = (OAT.isIE() ? document.body.clientHeight : window.innerHeight);
			}
			return [curr_w, curr_h];
		},

		moveBy: function (element, dx, dy) {
			var curr_x, curr_y;
			var elm = OAT.$(element);
			/*
			If the element is not anchored to left top corner, strange things will happen during resizing;
			therefore, we need to make sure it is anchored properly.
			*/
			if (OAT.Dom.style(elm, "position") == "absolute") {
				if (!elm.style.left) {
					elm.style.left = elm.offsetLeft + "px";
					elm.style.right = "";
				}
				if (!elm.style.top) {
					elm.style.top = elm.offsetTop + "px";
					elm.style.bottom = "";
				}
			}
			var tmp = OAT.Dom.getLT(elm);
			curr_x = tmp[0];
			curr_y = tmp[1];
			var x = curr_x + dx;
			var y = curr_y + dy;
			elm.style.left = x + "px";
			elm.style.top = y + "px";
		},

		resizeBy: function (element, dx, dy) {
			var curr_w, curr_h;
			var elm = OAT.$(element);
			/*
			If the element is not anchored to left top corner, strange things will happen during resizing;
			therefore, we need to make sure it is anchored properly.
			*/
			if (OAT.Dom.style(elm, "position") == "absolute" && dx) {
				if (!elm.style.left) {
					elm.style.left = elm.offsetLeft + "px";
					elm.style.right = "";
				}
				if (!elm.style.top && dy) {
					elm.style.top = elm.offsetTop + "px";
					elm.style.bottom = "";
				}
			}
			var tmp = OAT.Dom.getWH(elm);
			curr_w = tmp[0];
			curr_h = tmp[1];
			var w = curr_w + dx;
			var h = curr_h + dy;
			if (dx) { elm.style.width = w + "px"; }
			if (dy) { elm.style.height = h + "px"; }
		},

		decodeImage: function (data) {
			var decoded = OAT.Crypto.base64d(data);
			var mime = "image/";
			switch (decoded.charAt(1)) {
				case "I": mime += "gif"; break;
				case "P": mime += "png"; break;
				case "M": mime += "bmp"; break;
				default: mime += "jpeg"; break;

			}
			var src = "data:" + mime + ";base64," + data;
			return src;
		},

		removeSelection: function () {
			var selObj = false;
			if (document.getSelection && !(!OAT.Dom.isKHTML() && navigator.userAgent.match(/Gecko/i)) ) { selObj = document.getSelection(); }
			if (window.getSelection) { selObj = window.getSelection(); }
			if (document.selection) { selObj = document.selection; }
			if (selObj) {
				if (selObj.empty) { selObj.empty(); }
				if (selObj.removeAllRanges) { selObj.removeAllRanges(); }
			}
		},

		getScroll: function () {
			var l = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
			var t = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
			return [l, t];
		},

		getFreeSpace: function (x, y) {
			var scroll = OAT.Dom.getScroll();
			var port = OAT.Dom.getViewport();
			var spaceLeft = x - scroll[0];
			var spaceRight = port[0] - x + scroll[0];
			var spaceTop = y - scroll[1];
			var spaceBottom = port[1] - y + scroll[1];
			var left = (spaceLeft > spaceRight);
			var top = (spaceTop > spaceBottom);
			return [left, top];

		},

		toSafeXML: function (str) {
			if (typeof (str) != "string") { return str; }
			return str.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");
		},

		fromSafeXML: function (str) {
			return str.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<");
		},

		uriParams: function () {
			var result = {};
			var s = location.search;
			if (s.length > 1) { s = s.substring(1); }
			if (!s) { return result; }
			var parts = s.split("&");
			for (var i = 0; i < parts.length; i++) {
				var part = parts[i];
				if (!part) { continue; }
				var index = part.indexOf("=");
				if (index == -1) { result[decodeURIComponent(part)] = ""; continue; } /* not a pair */

				var key = part.substring(0, index);
				var val = part.substring(index + 1);
				key = decodeURIComponent(key);
				val = decodeURIComponent(val);

				var r = false;
				if ((r = key.match(/(.*)\[\]$/))) {
					key = r[1];
					if (key in result) {
						result[key].push(val);
					} else {
						result[key] = [val];
					}
				} else {
					result[key] = val;
				}
			}
			return result;
		},

		changeHref: function (elm, newHref) {
			/* opera cannot do this with elements not being part of the page :/ */
			var ok = false;
			var e = OAT.$(elm);
			var node = e;
			while (node.parentNode) {
				node = node.parentNode;
				if (node == document.body) { ok = true; }
			}
			if (ok) {
				e.href = newHref;
			} else if (e.parentNode) {
				var oldParent = e.parentNode;
				var next = e.nextSibling;
				document.body.appendChild(e);
				e.href = newHref;
				OAT.Dom.unlink(e);
				oldParent.insertBefore(e, next);
			} else {
				document.body.appendChild(e);
				e.href = newHref;
				OAT.Dom.unlink(e);
			}
		},

		makePosition: function (elm) {
			var e = OAT.$(elm);
			if (OAT.Dom.style(e, "position") != "absolute") {
				e.style.position = "relative";
			}
		}
	}

	OAT.Style = { /* Style helper */
		include: function (file, relativePath, force) {
			if (!file) return;
			file = relativePath + 'QueryViewer/oatPivot/css/' + file; /*OAT.Preferences.stylePath*/
			if (!force) { /* prevent loading when already loaded */
				var styles = document.getElementsByTagName('link');
				var host = location.protocol + '//' + location.host;
				for (var i = 0; i < styles.length; i++)
					if (file == styles[i].getAttribute('href') || host + file == styles[i].getAttribute('href'))
						return;
			}
			var elm = OAT.Dom.create("link");
			elm.rel = "stylesheet";
			elm.type = "text/css";
			elm.href = file;
			//document.getElementsByTagName("head")[0].appendChild(elm);
			jQuery("head").prepend(elm);
			
		},

		get: function (elm, property) {
			var element = OAT.$(elm);
			if (document.defaultView && document.defaultView.getComputedStyle) {
				var cs = document.defaultView.getComputedStyle(element, '');
				if (!cs) { return true; }
				return cs[property];
			} else {
				try {
					var out = element.currentStyle[property];
				} catch (e) {
					var out = element.getExpression(property);
				}
				return out;
			}
		},

		background: function (element, src) {
			var elm = OAT.$(element);
			var png = !!src.toLowerCase().match(/png$/);
			if (png && OAT.isIE()) {
				elm.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "', sizingMethod='crop')";
			} else {
				elm.style.backgroundImage = "url(" + src + ")";
			}
		},

		apply: function (something, obj) {
			var elm = OAT.$(something);
			if (!elm) { return; }
			for (var p in obj) { elm.style[p] = obj[p]; }
		},

		opacity: function (element, opacity) {
			var o = Math.max(opacity, 0);
			var elm = OAT.$(element);
			if (OAT.isIE()) {
				elm.style.filter = "alpha(opacity=" + Math.round(o * 100) + ")";
			} else {
				elm.style.opacity = o;
			}
		}
	}
	OAT.Dom.style = OAT.Style.get; /* backward compatibility */
	OAT.Dom.applyStyle = OAT.Style.apply; /* backward compatibility */

	//OAT.Browser = { /* Browser helper */
		/*isIE: OAT.Dom.isIE(),
		isIE6: OAT.Dom.isIE6(),
		isIE7: OAT.Dom.isIE7(),*/
		//isGecko: OAT.Dom.isGecko(),
		//isOpera: OAT.Dom.isOpera(),
		//isKonqueror: OAT.Dom.isKonqueror(),
		//isKHTML: OAT.Dom.isKHTML(),
		//isWebKit: OAT.Dom.isWebKit(),
		//isMac: OAT.Dom.isMac(),
		//isLinux: OAT.Dom.isLinux(),
		//isWindows: OAT.Dom.isWindows()
	//}

	OAT.Event = { /* Event helper */
		attach: function (elm, event, callback) {
			var element = OAT.$(elm);
			if (element.addEventListener) {	/* gecko */
				element.addEventListener(event, callback, false);
			} else if (element.attachEvent) { /* ie */
				element.attachEvent("on" + event, callback);
			} else { /* ??? */
				element["on" + event] = callback;
			}
		},
		detach: function (elm, event, callback) {
			var element = OAT.$(elm);
			if (element.removeEventListener) { /* gecko */
				element.removeEventListener(event, callback, false);
			} else if (element.detachEvent) { /* ie */
				element.detachEvent("on" + event, callback);
			} else { /* ??? */
				element["on" + event] = false;
			}
		},
		source: function (event) {
			return (event.target ? event.target : event.srcElement);
		},
		cancel: function (event) {
			event.cancelBubble = true;
			if (event.stopPropagation) { event.stopPropagation(); }
		},
		position: function (event) {
			var scroll = OAT.Dom.getScroll();
			return [event.clientX + scroll[0], event.clientY + scroll[1]];
		},
		prevent: function (event) {
			if (event.preventDefault) { event.preventDefault(); }
			//if (gx.util.browser.isIE()) {
			if (window.document.documentMode) {
				event.returnValue = false;
			}
		}
	}
	OAT.Dom.attach = OAT.Event.attach;
	OAT.Dom.detach = OAT.Event.detach;
	OAT.Dom.source = OAT.Event.source;
	OAT.Dom.eventPos = OAT.Event.position;
	OAT.Dom.prevent = OAT.Event.prevent;

	OAT.Loader = { /* first part of loader object */
		toolkitPath: false,
		loadOccurred: 0, /* was window.onload fired? */
		openAjax: false, /* OpenAjax.js included? */

		
	}

	OAT.MSG = { /* messages */
		DEBUG: 0,
		OAT_DEBUG: 0,
		OAT_LOAD: 1,
		ANIMATION_STOP: 2,
		TREE_EXPAND: 3,
		TREE_COLLAPSE: 4,
		DS_RECORD_PREADVANCE: 5,
		DS_RECORD_ADVANCE: 6,
		DS_PAGE_PREADVANCE: 7,
		DS_PAGE_ADVANCE: 8,
		AJAX_START: 9,
		AJAX_ERROR: 10,
		GD_START: 11,
		GD_ABORT: 12,
		GD_END: 13,
		DOCK_DRAG: 14,
		DOCK_REMOVE: 15,
		SLB_OPENED: 16,
		SLB_CLOSED: 17,
		registry: [],
		attach: function (sender, msg, callback) {
			if (!sender) { return; }
			OAT.MSG.registry.push([sender, msg, callback]);
		},
		detach: function (sender, msg, callback) {
			if (!sender) { return; }
			var index = -1;
			for (var i = 0; i < OAT.MSG.registry.length; i++) {
				var rec = OAT.MSG.registry[i];
				if (rec[0] == sender && rec[1] == msg && rec[2] == callback) { index = i; }
			}
			if (index != -1) { OAT.MSG.registry.splice(index, 1); }
		},
		send: function (sender, msg, event) {
			for (var i = 0; i < OAT.MSG.registry.length; i++) {
				var record = OAT.MSG.registry[i];
				var senderOK = (sender == record[0] || record[0] == "*");
				if (!senderOK) { continue; }
				var msgOK = (msg == record[1] || record[1] == "*");
				if (!msgOK && record[1].toString().match(/\*/)) { /* try regexp match */
					var re = new RegExp(record[1]);
					var str = "";
					for (var p in OAT.MSG) {
						var v = OAT.MSG[p];
						if (v == msg) { str = p; }
					}
					if (str.match(re)) { msgOK = true; }
				} /* regexp */
				if (msgOK) { record[2](sender, msg, event); }
			} /* for all listeners */
		} /* send message */
	}

	
	
	if (typeof window != "undefined"){
		OAT.Event.attach(window, "load", function () {
			OAT.Loader.loadOccurred = 1;
			OAT.Loader.callListeners();
		});
	}
	

	
	OAT.Loader.listeners = new Array();
	OAT.Loader.addListener = function (callback) {
		if (OAT.Loader.loadOccurred == 1)
			callback(); // Habr�a que ser un poco m�s defensivo ac�, chequer que el typeof sea function
		else {
			OAT.Loader.listeners.push(callback);
		}
	};

	OAT.Loader.callListeners = function () {
		for (var i = 0, len = this.listeners.length; i < len; i++)
			OAT.Loader.listeners[i](); // Habr�a que ser un poco m�s defensivo ac�, chequear que el typeof sea function
	};

	OAT.LoadJapanesseCharacters = function () {
		
		var uR = "";
		for (var i = 0; i < jQuery('script').length; i++) {
			var js_url = jQuery('script')[i].src
			if (js_url.indexOf("gxpivotjs") > 0) {
				uR = js_url
				break;
			}
		}

		OAT.rP = uR.substring(0, uR.indexOf("QueryViewer/oatPivot"));


		//load japanese lenguage character images files
		if ((gx.languageCode == "jap") || (gx.languageCode == "jpn") || (gx.languageCode == "jp") || (gx.languageCode == "ja") || (gx.languageCode == "jpx")
			|| (gx.languageCode == "ain") || (gx.languageCode == "jpns") || (gx.languageCode == "ams") || (gx.languageCode == 'japanese')
			|| (gx.languageCode == "JAP") || (gx.languageCode == "JP") || (gx.languageCode == "JA") || (gx.languageCode == "JPN")
			|| (gx.languageCode == "ja-JP") || (gx.languageCode == "ja_JP") || (gx.languageCode == "jp")) {




			var b = gx.util.resourceUrl(OAT.rP + 'QueryViewer/oatPivot/downloadify/' + 'jsPDF_japanese.js', true);


			var d = document.getElementsByTagName("head")[0] || document.documentElement;
			var s = d.getElementsByTagName("script");
			var prevLoad = false;
			for (var i = 0; s.length > i; i++) {
				if (s[i].src == b) {
					prevLoad = true;
				}
			}
			if (!prevLoad) {
				var e = document.createElement("script");
				e.type = "text/javascript";
				e.src = b;
				e.onerror = function () {
					var e = document.createElement("script");
					e.type = "text/javascript";
					e.src = gx.util.resourceUrl(OAT.rP + 'QueryViewer/oatPivot/downloadify/' + 'jsPDF_japanese.src.js', true);
					var d = document.getElementsByTagName("head")[0] || document.documentElement;
					d.insertBefore(e, d.lastChild);
				};
				e.onreadystatechange = function () {
					var document = this.readyState;
					if (document === "loaded" || document === "complete") {
						e.onreadystatechange = null;
					}
				};
				d.insertBefore(e, d.lastChild);
			}
		}
		
	}



	function loadJS(FILE_URL, async = true) {
		let scriptEle = document.createElement("script");

		scriptEle.setAttribute("src", FILE_URL);
		scriptEle.setAttribute("type", "text/javascript");
		scriptEle.setAttribute("async", async);

		document.body.appendChild(scriptEle);

  		// success event 
  		scriptEle.addEventListener("load", () => {
    		console.log("File loaded")
  		});
   		// error event
  		scriptEle.addEventListener("error", (ev) => {
    		console.log("Error on loading file", ev);
  		});
	}





	

	/*loadJS("QueryViewer/oatPivotTable/jsPDF_output.src.js", false);
	loadJS("QueryViewer/oatPivotTable/oat_dialog.src.js", false);
	loadJS("QueryViewer/oatPivotTable/oat_grid.src.js", false);
	loadJS("QueryViewer/oatPivotTable/oat_impl.src.js", false);
	loadJS("QueryViewer/oatPivotTable/oat_layers.src.js", false);
	loadJS("QueryViewer/oatPivotTable/oat_pivot.src.js", false);
	loadJS("QueryViewer/oatPivotTable/oat_statistic.src.js", false);
	loadJS("QueryViewer/oatPivotTable/oat_tablePagination.src.js", false);*/
