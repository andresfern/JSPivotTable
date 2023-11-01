//FILE oat_grid -----------------------------------------------------------------------------------------------------------------------------------------------




	OAT.GridData = {
		index: 0,        /* column in action */
		LIMIT: 15,       /* minimum width */
		ALIGN_CENTER: 1,
		ALIGN_START: 2,
		ALIGN_END: 3,
		ALIGN_RIGHT: 4,
		SORT_NONE: 1,
		SORT_ASC: 2,
		SORT_DESC: 3,
		TYPE_STRING: 1,
		TYPE_NUMERIC: 2,
		TYPE_AUTO: 3
	} /* GridData */

	OAT.Grid = function (element, controlName, query, columnsDataType, colms, QueryViewerCollection,
		pageSize, disableColumnSort, UcId, IdForQueryViewerCollection, rememberLayout, serverPaging, HideDataFilds, OrderFildsHidden, TableDataFilds, relativePath, selection, GridTitle, translations) {
		var self = this;
		self.controlName = controlName;
		self.columnsDataType = columnsDataType;
		self.query = query;
		self.rowsPerPage = "";
		self.columns = colms;
		self.QueryViewerCollection = QueryViewerCollection;
		self.InitPageSize = pageSize;
		self.disableColumnSort = disableColumnSort
		self.UcId = UcId;
		self.IdForQueryViewerCollection = IdForQueryViewerCollection;
		self.rememberLayout = rememberLayout;
		self.serverPaging = serverPaging;
		self.HideDataFilds = HideDataFilds;
		self.OrderFildsHidden = OrderFildsHidden;
		self.TableDataFilds = TableDataFilds;
		self.relativePath = relativePath;
		self.selection = selection;
		self.translations = translations
		self.isSD = OAT.isSD() 

		self.conditions = new Array(columnsDataType.length);
		for (iC = 0; iC < columnsDataType.length; iC++) {
			self.conditions[iC] = {
				blackList: [],
				sort: 1
			};
		};

		this.init = function () {

			var topDiv;

			if ((jQuery("#" + self.controlName + "_grid_top_div").length == 0)
				|| (self.QueryViewerCollection[self.IdForQueryViewerCollection]._ControlRenderedTo == undefined)) {
				var divContainer = OAT.$(element);
				self.ContainerName = divContainer.getAttribute("id")
				OAT.Dom.clear(divContainer);

				var divIeContainer = document.createElement("div");
				divIeContainer.setAttribute("class", "divIeContainer");
				divIeContainer.setAttribute("style", "position: relative;opacity: 0");
				divContainer.appendChild(divIeContainer);
				self.div = divIeContainer;


				topDiv = OAT.Dom.create("div");

				if (self.isSD) { //android
					topDiv.setAttribute("class", "oatgrid_top_div oatgrid_top_div_small");
				} else {
					topDiv.setAttribute("class", "oatgrid_top_div");
				}
				
				if (GridTitle) {
					OAT.addTextNode(topDiv, " " + GridTitle)
				} else {
					OAT.addTextNode(topDiv, "")
				}
				
				topDiv.setAttribute("id", self.controlName + "_grid_top_div");
				var hide = OAT.Dom.create("a");
				hide.href = "#";

				OAT.addTextNode(hide, document.createTextNode("GXPL_QViewerJSVisibleColumns"))

				self.div.appendChild(topDiv);

				OAT.Dom.makePosition(self.div);
				self.html = OAT.Dom.create("table");
				OAT.Dom.addClass(self.html, "oatgrid");
				OAT.Dom.setIdPropertyValue(self.html, self.controlName);
				self.header = new OAT.GridHeader(self);

				self.rows = [];
				self.rowBlock = OAT.Dom.create("tbody");
				OAT.Dom.append([self.div, self.html], [self.html, self.header.html, self.rowBlock]);

			} else {

				var divContainer = OAT.$(element);
				self.ContainerName = divContainer.getAttribute("id")

				self.div = jQuery("#" + self.ContainerName).find(".divIeContainer")[0]

				topDiv = jQuery("#" + self.ContainerName).find(".oatgrid_top_div")[0]
				OAT.Dom.clear(topDiv);
				if (GridTitle) {
					OAT.addTextNode(topDiv, " " + GridTitle)
				} else {
					OAT.addTextNode(topDiv, "")
				}

				self.html = jQuery("#" + self.ContainerName).find("table")[0]

				var previousThead = jQuery("#" + self.ContainerName).find("thead")[0]
				OAT.Dom.clear(previousThead);
				self.header = new OAT.GridHeader(self, previousThead);

				self.rows = [];
				self.rowBlock = jQuery("#" + self.ContainerName).find("tbody")[0]
				OAT.Dom.clear(self.rowBlock);
			}



			//draw export image and pop up of export options
			var exportImg = OAT.Dom.create("div");
			exportImg.href = "#";
			if (self.isSD) { //android
				exportImg.setAttribute("class", "exportOptionsAnchor exportOptionsAnchor_small");
			} else {
				exportImg.setAttribute("class", "exportOptionsAnchor");
			}
			self.exportPage = OAT.Dom.create("div", { padding: "0px" });
			
			OAT.addImageNode(exportImg, "menu", "")

			var checkToClose = function (b) {
				source = OAT.Event.source(b);
				var clean = false;
				var closing = false;
				var isInside = false
				for (var i = 0; i < jQuery(".oat_winrect_container").length; i++) {
					var obj = jQuery(".oat_winrect_container")[i];
					if (!(source == obj) && !OAT.Dom.isChild(source, obj)) {
						clean = true;
					} else {
						clean = false; isInside = true; break;
					}
				}
				for (var i = 0; i < jQuery(".oat_winrect_container").length; i++) {
					if (jQuery(".oat_winrect_container")[i].style.display != "none") {
						closing = true;
					}
				}
				if (((source.getAttribute("class") == "oat_winrect_close_b") || (!OAT.Dom.isChild(source, obj))) &&
					(closing)) {
					self.oat_component.resetAllScrollValue(self.UcId);
				}
				if (clean) {
					jQuery(".oat_winrect_container").css({ display: "none" });
				}
			};

			OAT.Dom.attach(document, "mousedown", checkToClose)

			OAT.Anchor.assign(exportImg, {
				title: " ",
				content: self.exportPage,
				result_control: false,
				activation: "click",
				type: OAT.WinData.TYPE_RECT,
				width: "auto",
				containerQuery: self.QueryViewerCollection[IdForQueryViewerCollection].ControlName + "-table" + " ExportPopup "
				
			});

			var generatePair = function (index) {
				
				if (OAT_JS.grid.gridData[self.UcId].rowsMetadata.columns[index].getAttribute("visible") != "Never"){	
				
					var state = (self.header.cells[index].html.style.display != "none");
					var pair = OAT.Dom.create("div");
					var check_class = (state) ? "check_item_img" : "uncheck_item_img";
					if (self.isSD) {//android
						check_class = (state) ? "check_item_img_small" : "uncheck_item_img_small";
					}
					OAT.addImageNode(pair, state ? "check_box" : "check_box_outline_blank", "");
					pair.setAttribute("class", check_class);
					var span = OAT.Dom.create("span");

					OAT.addTextNode(span, " " + self.header.cells[index].value.textContent.replace("settings",""))
					pair.appendChild(span);
					OAT.Event.attach(pair, "click", function () { // this hide or show the columns
						var checkedClass = "check_item_img"
						var unCheckedClass = "uncheck_item_img"
						if (self.isSD) {//android
							checkedClass = "check_item_img_small"
							unCheckedClass = "uncheck_item_img_small"
						}

						var newClass = (this.getAttribute("class") === checkedClass) ? unCheckedClass : checkedClass;
						this.setAttribute("class", newClass);
					
						jQuery(this).find("i")[0].textContent = (this.getAttribute("class") === checkedClass) ? "check_box" : "check_box_outline_blank";

						var newdisp = (self.header.cells[index].html.style.display == "none" ? "" : "none");
						self.header.cells[index].html.style.display = newdisp;
						var numCol = index;//self.columnsDataType.length - 1 - index;

						for (var i = 0; i < self.rows.length; i++) {
							self.rows[i].cells[numCol].html.style.display = newdisp;
						}
						
					
						OAT_JS.grid.setColumnVisibleValue(self.UcId, numCol, (newdisp == ""))
				

					});
					return pair;
				
				} else {
					return false;
				}
			}

			var clickRef = function (event) {
				var coords = OAT.Event.position(event);
				self.exportPage.style.left = coords[0] + "px";
				self.exportPage.style.top = coords[1] + "px";
				self.exportPage.id = "exportOptionsContainer";
				if (OAT.isIE()) {
					self.exportPage.id = "exportOptionsContainerGrid";
					self.exportPage.className = "export_option_container"
				}


				var screenWidth = window.innerWidth;
				var initialPopUpWidth = Math.max(jQuery(".ExportPopup")[0].clientWidth, 300)
				var offsetLeft = jQuery(event.currentTarget).offset().left

				var iconExport = event.currentTarget

				jQuery(".ExportPopup").css({ left: -2500 + "px", top: 0 + "px" })

				//title
				jQuery(".oat_winrect_title").find(".winrect_title_label").remove()

				var spantitle = OAT.Dom.create("label");
				if (self.isSD) {
					jQuery(".oat_winrect_container").addClass("oat_winrect_container_small")
					spantitle.setAttribute("class", "winrect_title_label winrect_title_label_small");
				} else {
					spantitle.setAttribute("class", "winrect_title_label");
				}
				OAT.addTextNode(spantitle,  self.translations.GXPL_QViewerPopupTitle); //gx.getMessage("GXPL_QViewerPopupTitle"));
				jQuery(".oat_winrect_title").append(spantitle)

				OAT.Dom.clear(self.exportPage);
				//botton to allow show all filters in pop up
				var someExport = false;
				var div_upper = document.createElement("div");
				div_upper.setAttribute("class", "upper_container");

				jQuery('#divtoxml').remove();
				jQuery('#divtoxls').remove();
				jQuery('#divtoxlsx').remove();
				jQuery('#divtoexport').remove();
				jQuery('#divtohtml').remove();
				someExport = self.appendExportToXmlOption(div_upper, someExport);
				someExport = self.appendExportToHtmlOption(div_upper, someExport);
				someExport = self.appendExportToPdfOption(div_upper, someExport);
				someExport = self.appendExportToExcelOption(div_upper, someExport);
				someExport = self.appendExportToExcel2010Option(div_upper, someExport);

				self.exportPage.appendChild(div_upper);


				if (someExport) {
					var hr = OAT.Dom.create("hr", {});
					self.exportPage.appendChild(hr);
				}

				var div_down = document.createElement("div");
				div_down.setAttribute("class", "down_container");
				self.exportPage.appendChild(div_down);

				var label = document.createElement("span");
				label.textContent = self.translations.GXPL_QViewerJSVisibleColumns;//gx.getMessage("GXPL_QViewerJSVisibleColumns");
				var div_label = document.createElement("div");
				div_label.setAttribute("class", "div_label_win");
				div_label.appendChild(label);
				div_down.appendChild(div_label);


				for (var c = 0; c < self.columns.length; c++) {
					for (var i = 0; i < self.header.cells.length; i++) {
						if (self.header.cells[i].dataField == self.columns[c].getAttribute("dataField")){ 
							var pair = generatePair(i);
							if (pair)
								div_down.appendChild(pair);
						}
					}
				}



				setTimeout(function () {

					var screenWidth = window.innerWidth;
					var initialPopUpWidth = jQuery(".ExportPopup")[0].clientWidth


					if (initialPopUpWidth == 0) {
						var last = jQuery(".ExportPopup").length;
						initialPopUpWidth = jQuery(".ExportPopup")[last - 1].clientWidth
					}

					if (self.isSD) {//android
						if (initialPopUpWidth < 235) {
							initialPopUpWidth = 235
						}

						var padding = (screenWidth - initialPopUpWidth) / 2 + jQuery(window).scrollLeft()

						jQuery(".ExportPopup").css({ left: padding + "px", top: jQuery(iconExport).offset().top + "px", width: initialPopUpWidth + "px" })

					} else {

						var offsetLeft = jQuery(iconExport).offset().left

						if (offsetLeft + initialPopUpWidth + 15 < screenWidth) {
							jQuery(".ExportPopup").css({ left: jQuery(iconExport).offset().left + "px", top: jQuery(iconExport).offset().top + "px" })
						} else {
							jQuery(".ExportPopup").css({ left: (offsetLeft - initialPopUpWidth + 16) + "px", top: jQuery(iconExport).offset().top + "px" })
						}
					}
				}, 50)
			}

			OAT.Event.attach(exportImg, "click", clickRef);
			topDiv.appendChild(exportImg);

		}
		
		this.setPageDataForTable = function(resXML) {
			switch(self.oat_component.lastCallToQueryViewer) {
				case "getDataForTable":
					if (self.oat_component.lastCallData.PageNumber == 0) { self.oat_component.lastCallData.PageNumber = 1, self.oat_component.lastCallData.RecalculateCantPages = false; }
					OAT_JS.grid.redraw(self.oat_component.lastCallData.self, self.oat_component.lastCallData.UcId, resXML, self.oat_component.lastCallData.RecalculateCantPages, self.oat_component.lastCallData.DataFieldOrder != "", self.oat_component.lastCallData.PageNumber, self.oat_component.lastCallData.fromExternalRefresh)
				break;
				case "getAllDataRowsForExport":
					var dataString = resXML;
					var stringRecord = dataString.split("<Record>");
					var data = [];
					var UcId = self.oat_component.lastCallData.UcId
					var fileName = self.oat_component.lastCallData.fileName
					var _selfgrid = self.oat_component.lastCallData._selfgrid
					var format = self.oat_component.lastCallData.format
					for (var i = 1; i < stringRecord.length; i++) {
						var recordData = [];
						for (var j = 0; j < OAT_JS.grid.gridData[UcId].grid.columns.length; j++) {
							recordData[j] = "#NuN#"
							var dt = stringRecord[i].split("<" + OAT_JS.grid.gridData[UcId].grid.columns[j].getAttribute("dataField") + ">")
							if (dt.length > 1) {
								var at = dt[1].split("</" + OAT_JS.grid.gridData[UcId].grid.columns[j].getAttribute("dataField") + ">")
								recordData[j] = at[0]
							}
						}
						data.push(recordData)

						if (format != "xlsx") {
							if ((i > OAT_JS.grid.gridData[UcId].rowsPerPage) && !(OAT_JS.grid.gridData[UcId].rowsPerPage == "")) {
								OAT.CreateGridRow(recordData, OAT_JS.grid.gridData[UcId], true)
							}
						}
					}

					switch (format) {
						case "pdf": OAT.ExportToPdf(_selfgrid, fileName); break;
						case "xml": OAT.ExportToXML(_selfgrid, fileName); break;
						case "html": OAT_JS.grid.gridData[UcId].grid.ExportToHtml(_selfgrid, fileName); break;
						case "xls": OAT.ExportToExcel(_selfgrid, fileName); break;
						case "xlsx": OAT.ExportToExcel2010(_selfgrid, fileName, true, data, UcId); break;
					}

					OAT_JS.grid.gridData[UcId].grid.removeAllCollapseRows()
				break;
			}
		}
		
		this.setAttributeForTable = function(resJSON){
			var res = JSON.parse(resJSON);
			switch(self.oat_component.lastCallToQueryViewer) {
				case "getValuesForColumn":
					OAT_JS.grid.changeValues(self.oat_component.lastCallData.UcId, self.oat_component.lastCallData.dataField, self.oat_component.lastCallData.columnNumber, res, self.oat_component.lastCallData.filterValue);
				break;
				case "readScrollValue":
					OAT_JS.grid.appendNewValueData(self.oat_component.lastCallData.UcId, res);
				
				break;
				case "readScrollValueFilter":
					OAT_JS.grid.appendNewFilteredValueData(self.oat_component.lastCallData.UcId, res, self.oat_component.lastCallData.posColumnNumber, self.oat_component.lastCallData.filterText)
				case "initValueRead":
					OAT_JS.grid.initValueLoad(res, self.oat_component.lastCallData.UcId, self.oat_component.lastCallData.dataField)
				break;
				case "filterChange":
					OAT_JS.grid.appendNewValueData(self.oat_component.lastCallData.UcId, res, true)
					OAT_JS.grid.setFilterChangedWhenServerPagination(self.oat_component.lastCallData.UcId, self.oat_component.lastCallData.oatDimension)
				break;
			}	
		}
		
		
		this.setDataSynForTable = function(dataSync){
			_self = self.oat_component.lastCallData.self
			
			OAT.ClickHandle(_self, self.oat_component.lastCallData.elemvalue, dataSync)
		}
		
		this.appendExportToXmlOption = function (content, someExport) {
			var exportXMLButton;
			var fileName = this.query;
			if (fileName == "") {
				try {
					fileName = self.controlName.substr(4).split("_")[0]
				} catch (error) { }
			}
			if (self.QueryViewerCollection[self.IdForQueryViewerCollection].ExportToXML) {
				
					exportXMLButton = OAT.Dom.create("div");
					var exportButtonSub = self.createExportButton(exportXMLButton)

					var pvpl = OAT.Dom.create("label");
					OAT.addTextNode(pvpl, self.translations.GXPL_QViewerContextMenuExportXml)//gx.getMessage("GXPL_QViewerContextMenuExportXml"))
					pvpl.htmlFor = "pivot_checkbox_restoreview";
					exportXMLButton.appendChild(pvpl);

					OAT.Dom.attach(exportButtonSub, "click", function () {
						OAT_JS.grid.getAllDataRowsForExport(self.UcId, { grid: self }, fileName, "xml")
					}
					);
				

				content.appendChild(exportXMLButton);
				if (!someExport) someExport = true;
			}
			return someExport;
		}

		this.appendExportToHtmlOption = function (content, someExport) {
			var exportHTMLButton;
			var fileName = this.query;
			if (fileName == "") {
				try {
					fileName = self.controlName.substr(4).split("_")[0]
				} catch (error) { }
			}
			if (self.QueryViewerCollection[self.IdForQueryViewerCollection].ExportToHTML) {
				
					exportHTMLButton = OAT.Dom.create("div");
					var exportButtonSub = self.createExportButton(exportHTMLButton)

					var pvpl = OAT.Dom.create("label");
					OAT.addTextNode(pvpl, self.translations.GXPL_QViewerContextMenuExportHtml)//gx.getMessage("GXPL_QViewerContextMenuExportHtml"))
					pvpl.htmlFor = "pivot_checkbox_restoreview";
					exportHTMLButton.appendChild(pvpl);

					OAT.Dom.attach(exportButtonSub, "click", function () { 
						OAT_JS.grid.getAllDataRowsForExport(self.UcId, self, fileName, "html")
					});
				
				content.appendChild(exportHTMLButton);
				if (!someExport) someExport = true;
			}
			return someExport;
		}

		this.ExportToHtml = function (self, fileName) {
			var dir = OAT.resourceURL(self.relativePath + 'QueryViewer/oatPivot/css/grid.css')
			var str = "<!DOCTYPE><HTML><BODY>";

			str = str + "<HEAD>";
			str = str + '<META content="text/html; charset=utf-8" http-equiv="Content-Type"/>'

			str = str + '<link id="gxtheme_css_reference" rel="stylesheet" type="text/css" href="' + dir + '" />'
			
			//add other css file
			for(var i = 0; i < jQuery('link').length; i++)
			{
				if (jQuery('link')[i].href.indexOf("QueryViewer.css") < 0) {
					str = str + '<link id="gxtheme_css_reference" rel="stylesheet" type="text/css" href="' + jQuery('link')[i].href + '" />'
				}
			}
			
			str = str + "</STYLE>"
			str = str + "</HEAD>"
			
			str = str + '<div class="gx_usercontrol qv-table QueryViewer-table">'
			
			str = str + '<table class="oatgrid"  style="width: 100%;">'
			
			str = str + OAT.removeIconFont(jQuery("#" + self.controlName)[0].innerHTML.replace(/visibility: collapse;/g, "").replace(/visibility:collapse;/g, ""))
			
			str = str + '</table>'
			
			str = str + '</div>'
			str = str + "</BODY></HTML>";
			
			
			isSD = OAT.isSD(); 
			

			if (OAT.isSafari() || (isSD)) { 
				window.open('data:text/html,' + str);
			} else {
				var blob = new Blob([str], { type: "text/html" });
				saveAs(blob, fileName + ".html");
			}
		}

		this.appendExportToPdfOption = function (content, someExport) {
			var fileName = this.query;
			if (fileName == "") {
				try {
					fileName = self.controlName.substr(4).split("_")[0]
				} catch (error) { }
			}
			var exportPDFButton;
			if (self.QueryViewerCollection[self.IdForQueryViewerCollection].ExportToPDF) {
				
					exportPDFButton = OAT.Dom.create("div");
					var exportButtonSub = self.createExportButton(exportPDFButton)

					var pvpl = OAT.Dom.create("label");
					OAT.addTextNode(pvpl, self.translations.GXPL_QViewerContextMenuExportPdf); //gx.getMessage("GXPL_QViewerContextMenuExportPdf"))
					pvpl.htmlFor = "pivot_checkbox_restoreview";
					exportPDFButton.appendChild(pvpl);

					
					OAT.Dom.attach(exportButtonSub, "click", function () {
						OAT_JS.grid.getAllDataRowsForExport(self.UcId, { grid: self }, fileName, "pdf")
					});
					
				

				content.appendChild(exportPDFButton);
				if (!someExport) someExport = true;
			}

			return someExport;
		}

		this.appendExportToExcelOption = function (content, someExport) {
			var fileName = this.query;
			if (fileName == "") {
				try {
					fileName = self.controlName.substr(4).split("_")[0]
				} catch (error) { }
			}
			var exportXLSButton
			if (self.QueryViewerCollection[self.IdForQueryViewerCollection].ExportToXLS) {
				
					exportXLSButton = OAT.Dom.create("div");

					var exportButtonSub = self.createExportButton(exportXLSButton)

					var pvpl = OAT.Dom.create("label");
					OAT.addTextNode(pvpl, self.translations.GXPL_QViewerContextMenuExportXls2003); //gx.getMessage("GXPL_QViewerContextMenuExportXls2003"))
					pvpl.htmlFor = "pivot_checkbox_restoreview";
					exportXLSButton.appendChild(pvpl);

					OAT.Dom.attach(exportButtonSub, "click", function () {
						OAT_JS.grid.getAllDataRowsForExport(self.UcId, { grid: self }, fileName, "xls")
					});
				

				content.appendChild(exportXLSButton);
				if (!someExport) someExport = true;
			}

			return someExport;
		}

		this.appendExportToExcel2010Option = function (content, someExport) {
			var fileName = this.query;
			if (fileName == "") {
				try {
					fileName = self.controlName.substr(4).split("_")[0]
				} catch (error) { }
			}
			var exportXLSButton
			if (self.QueryViewerCollection[self.IdForQueryViewerCollection].ExportToXLSX) {
				
					exportXLSButton = OAT.Dom.create("div");

					var exportButtonSub = self.createExportButton(exportXLSButton)


					var pvpl = OAT.Dom.create("label");
					OAT.addTextNode(pvpl, self.translations.GXPL_QViewerContextMenuExportXlsx);// gx.getMessage("GXPL_QViewerContextMenuExportXlsx"))
					pvpl.htmlFor = "pivot_checkbox_restoreview";
					exportXLSButton.appendChild(pvpl);

					OAT.Dom.attach(exportButtonSub, "click", function () {
						OAT_JS.grid.getAllDataRowsForExport(self.UcId, { grid: self }, fileName, "xlsx")
					});
				

				content.appendChild(exportXLSButton);
				if (!someExport) someExport = true;
			}

			return someExport;
		}

		this.createExportButton = function (divContainer) {

			var exportButtonSub = OAT.Dom.create("div", {});
			exportButtonSub.setAttribute('id', 'divtoxml');
			divContainer.appendChild(exportButtonSub);

			if (self.isSD) {//android				
				exportButtonSub.setAttribute("class", "download_file_img_small");
			} else {
				exportButtonSub.setAttribute("class", "download_file_img");
			}
			
			OAT.addImageNode(exportButtonSub, "download", "");

			divContainer.setAttribute("class", "export_item_div");
			if (self.isSD) { //android		
				divContainer.setAttribute("class", "export_item_div export_item_div_small");
			}
			return divContainer;
		}


		this.clearData = function () {
			self.rows = [];
			OAT.Dom.clear(self.rowBlock);
		}

		this.appendHeader = function (paramsObj, dataField, index) { /* append one header */
			var i = (!index ? self.header.cells.length : index);
			var cell = self.header.addCell(paramsObj, "character", i, dataField);
			for (var i = 0; i < self.header.cells.length; i++) {
				self.header.cells[i].number = i;
			}
			return cell;
		}

		this.ieFix = function () {
			for (var i = 0; i < self.header.cells.length; i++) {
				var html = self.header.cells[i].html;
				OAT.Dom.addClass(html, "hover");
				OAT.Dom.removeClass(html, "hover");
				var value = self.header.cells[i].value;
				var dims = OAT.Dom.getWH(value);
			}
		}

		this.createHeader = function (paramsList, fieldList) { /* add new header */
			self.header.clear();

			for (var i = 0; i < paramsList.length; i++) {
				self.appendHeader(paramsList[i], fieldList[i]);
			}
			if (OAT.isIE()) { self.ieFix(); }
		} /* Grid::createHeader */

		this.getHeaders = function (){
			var actualHeaders = []
			
			for (var i = 0; i < self.header.cells.length; i++) {
				actualHeaders.push(self.header.cells[i].value.textContent);
			}
			
			return actualHeaders
		}

		this.createRow = function (paramsList, columnsDataType, defaultPicture, customPicture, conditionalFormatsColumns, formatValues, customFormat, column, index, columnVisibility) { /* add new row */
			var number = (!index ? self.rows.length : index);
			var row = new OAT.GridRow(self, number);
			if (index == number || number == self.rows.length) {
				self.rowBlock.appendChild(row.html);
			} else {
				self.rowBlock.insertBefore(row.html, self.rowBlock.childNodes[number]);
			}
			OAT.underRecursionStyle = [];
			for (var i = 0; i < paramsList.length; i++) {
				row.addCell(paramsList[i], columnsDataType[i], defaultPicture, customPicture[i], conditionalFormatsColumns, formatValues, customFormat, i, index, columnVisibility[i]);
			}
			self.rows.splice(number, 0, row);
			return row.html;
		} /* Grid::createRow() */

		this.loadDifferentValues = function (columnNumber, values) {
			self.conditions[columnNumber].differentValue = [];
			for (var i = 0; i < values.length; i++) {
				self.conditions[columnNumber].differentValue.push(values[i]);
			}
		}

		this.removeAllRows = function () {
			var totalRows = self.rows.length
			for (var l = 0; l < totalRows; l++) {
				self.removeRow(0)
			}
		}

		this.removeAllHiddenRows = function () {
			var totalRows = self.rows.length
			var rowNumber = self.rows.length - 1;
			while ((rowNumber > 0) && (self.rows[rowNumber].html.style.display == "none")) {
				self.removeRow(rowNumber);
				rowNumber--;
			}
		}

		this.removeAllCollapseRows = function () {
			var totalRows = self.rows.length
			var rowNumber = self.rows.length - 1;
			while ((rowNumber > 0) && (self.rows[rowNumber].html.style.visibility == "collapse")) {
				self.removeRow(rowNumber);
				rowNumber--;
			}
		}

		this.removeRow = function (rowNumber) {
			jQuery(self.rows[rowNumber].html).remove()

			self.rows.splice(rowNumber, 1);
		}

		this.removeColumn = function (index) {
			self.header.removeColumn(index);
			for (var i = 0; i < self.rows.length; i++) { self.rows[i].removeColumn(index); }
		}

		this.hideColumnHeader = function (index) {
			var headerPos = /*self.columnsDataType.length - 1 -*/ index;
			self.header.cells[headerPos].html.style.display = "none";
		}

		this.showColumnHeader = function (index) {
			//var headerPos = self.columnsDataType.length - 1 - index;
			//self.header.cells[headerPos].html.style.display = "";
			self.header.cells[index].html.style.display = "";
		}

		this.sort = function (index, type, numCol) {
			for (var i = 0; i < self.header.cells.length; i++) {
				/* aca cambio la info de estado sobre las oredenaciones de las columnas */
				self.conditions[i].sort = 1;
				self.header.cells[i].changeSort(OAT.GridData.SORT_NONE);
			}
			self.conditions[index].sort = type;
			self.header.cells[numCol].changeSort(type);
			/* sort elements here */
			var coltype = self.header.cells[numCol].options.type;
			var c1, c2;
			switch (type) {
				case OAT.GridData.SORT_ASC: c1 = 1; c2 = -1; break;
				case OAT.GridData.SORT_DESC: c1 = -1; c2 = 1; break;
			}

			var useCustomOrder = (OAT_JS.grid.gridData[self.UcId].customOrderValues)
				&& (OAT_JS.grid.gridData[self.UcId].customOrderValues[index] != false)
				&& (OAT_JS.grid.gridData[self.UcId].customOrderValues[index].length > 0)


			var numCmp = function (row_a, row_b) {
				var a = row_a.cells[index].options.value;
				var b = row_b.cells[index].options.value;
				if (a == b) { return 0; }
				return (parseFloat(a) > parseFloat(b) ? c1 : c2);
			}
			var strCmp = function (row_a, row_b) {
				var a = row_a.cells[index].options.value;
				var b = row_b.cells[index].options.value;
				if (a == b) { return 0; }
				return (a > b ? c1 : c2);
			}
			var cusCmp = function (row_a, row_b) {
				var a = row_a.cells[index].options.value;
				var b = row_b.cells[index].options.value;
				var indexA = OAT_JS.grid.gridData[self.UcId].customOrderValues[index].indexOf(a)
				var indexB = OAT_JS.grid.gridData[self.UcId].customOrderValues[index].indexOf(b)
				if (indexA == indexB) { return 0; }
				return (indexA > indexB ? c1 : c2);
			}
			var cmp;


			
		} /* Grid::sort() */

		this.applySaveState = function (actualPagesize) {
			if ((self.rememberLayout) && (self.rememberLayout != "false")) {
				self = this;
				var exists = OAT.getState(self, actualPagesize);
				if (exists) {
					OAT.filterRows(self);


					for (var jC = 0; jC < self.columnsDataType.length; jC++) {
						if (self.conditions[jC].sort != 1) {
							self.sort(jC, self.conditions[jC].sort, /*self.columnsDataType.length -1 -*/ jC);
						}
					}
				}
			}
		}

		this.applySortOrderType = function (columnNumber, sortOrder) {
			self.sort(columnNumber, sortOrder, /*self.columnsDataType.length -1 -*/ columnNumber)
		}

		this.applyCustomSort = function (columnNumber, sortData, dataRows) {
			var distinctValues = [];
			for (var h = 0; h < sortData.childNodes.length; h++) {
				if ((sortData.childNodes[h] != undefined) &&
					(sortData.childNodes[h].localName != undefined) &&
					(sortData.childNodes[h].localName === "customOrder")) {
					for (var n = 0; n < sortData.childNodes[h].childNodes.length; n++) {
						if (sortData.childNodes[h].childNodes[n].localName == "Value") {
							distinctValues.push(sortData.childNodes[h].childNodes[n].textContent.trimpivot());
						}
					}
				}
			}

			for (var d = 0; d < dataRows.length; d++) {
				if (distinctValues.indexOf(dataRows[d][columnNumber].trimpivot()) == -1) {
					distinctValues.push(dataRows[d][columnNumber])
				}
			}

			var temp = dataRows;
			dataRows = [];
			for (var i = 0; i < distinctValues.length; i++) {
				for (var j = 0; j < temp.length; j++) {
					if (temp[j][columnNumber].trimpivot() === distinctValues[i].trimpivot()) {
						dataRows.push(temp[j]);
					}
				}
			}
			return [dataRows, distinctValues];
		}

		this.applyCustomFilter = function (columnNumber, filterData) {
			try {
				var includeValues = []; //the only values to show
				var applyFilter = false;
				for (var h = 0; h < filterData.childNodes.length; h++) {
					if ((filterData.childNodes[h] != undefined) &&
						(filterData.childNodes[h].localName != undefined) &&
						(filterData.childNodes[h].localName === "include")) {
						applyFilter = true;
						for (var n = 0; n < filterData.childNodes[h].childNodes.length; n++) {
							if ((filterData.childNodes[h].childNodes[n].localName != null) &&
								(filterData.childNodes[h].childNodes[n].localName.toLowerCase() === "value")) {
								includeValues.push(filterData.childNodes[h].childNodes[n].textContent);
							}
						}
					}
				}

				if (applyFilter) {
					self.conditions[columnNumber].blackList = [];

					var dataFieldId = OAT_JS.grid.gridData[self.UcId].columnDataField[columnNumber];
					OAT_JS.grid.gridData[self.UcId].blackLists[dataFieldId].state = ""
					OAT_JS.grid.gridData[self.UcId].blackLists[dataFieldId].defaultAction = "Exclude"
					OAT_JS.grid.gridData[self.UcId].blackLists[dataFieldId].hiddens = []
					for (var i = 0; i < includeValues.length; i++) {
						if (includeValues[i] != "TOTAL")
							OAT_JS.grid.gridData[self.UcId].blackLists[dataFieldId].visibles.push(includeValues[i]);
					}
					for (var i = 0; i < self.rows.length; i++) {
						var col = columnNumber;
						if ((includeValues.findIndex(self.rows[i].cells[col].options.value) === -1)
							&& (includeValues.findIndex(self.rows[i].cells[col].options.value.trimpivot()) === -1)
							&& (self.conditions[col].blackList.findIndex(self.rows[i].cells[col].options.value) === -1)) {
							self.conditions[col].blackList.push(self.rows[i].cells[col].options.value);
							OAT.HideGridRow({ grid: self }, columnNumber, self.rows[i].cells[columnNumber].options.value);
							OAT.actualizeBlackList("push", self, columnNumber, self.rows[i].cells[columnNumber].options.value, false);
						}
					}
				}
			} catch (error) {

			}
		}

		this.moveToNextPage = function () {
			self.oat_component.moveToNextPage(self.UcId);
		}

		this.moveToFirstPage = function () {
			self.oat_component.moveToFirstPage(self.UcId);
		}

		this.moveToLastPage = function () {
			self.oat_component.moveToLastPage(self.UcId);
		}

		this.moveToPreviousPage = function () {
			self.oat_component.moveToPreviousPage(self.UcId);
		}
		
		this.selectValue = function (selection) {
			//clear previous selection
			OAT_JS.grid.gridData[self.UcId].selection.SelectedNode = [];
			OAT.ClearSelectedNodes(jQuery(self.html));
				
			//find column number first condition
			var s = 0;
			var colNumber = OAT_JS.grid.gridData[self.UcId].columnDataField.indexOf(selection[s].DataField);
				
			OAT.SelectNodes({grid: self}, selection[s].Value, false, colNumber, -1, s, selection);
		}
		
		this.deselectValue = function(){
			OAT_JS.grid.gridData[self.UcId].selection.SelectedNode = [];
			OAT.ClearSelectedNodes(jQuery(self.html));
		}
		
		this.refreshPivot = function (metadata, data, sameQuery) {

			if ((metadata != "") && (data != "")) {
				var parser = new DOMParser();
				var xmlData = parser.parseFromString(metadata, 'text/xml');
				var dimensions = xmlData.getElementsByTagName("OLAPDimension");

				var dataFieldOrderChanged = "";
				var OrderChanged = "";
				var colPosition = [];
				for (var dim = 0; dim < dimensions.length; dim++) { //for every dimensions of the other querie
					var dimID = dimensions[dim].getElementsByTagName("name")[0].childNodes[0].nodeValue; //get the name - "Identifier" of this dimension

					//now search for this name at this querie
					var dimPos = -1; //the columns number of the dimension in this table
					var dimHeader = -1; //the number of the title (bug!)
					for (var itC = 0; itC < self.columns.length; itC++) {
						if (self.columns[itC].attributes.getNamedItem("name").nodeValue === dimID) {
							var display = self.columns[itC].attributes.getNamedItem("displayName").nodeValue
							//search in the header for "display" name to know the position
							for (var pD = 0; pD < self.header.cells.length; pD++) {
								if (self.header.cells[pD].options.value === display) {
									dimPos = self.header.cells.length - 1 - pD;		//this is the number of the columns of the dimesnion at this table
									dimHeader = pD;
								}
							}
						}
					}

					if (dimPos != -1) { //the dimension exists in this table
						//make the changes
						var position = dimensions[dim].getElementsByTagName("condition")[0].childNodes[0].nodeValue;
						if (position === "none") {
							var newdisp = "none";
							self.header.cells[dimHeader].html.style.display = newdisp;
							for (var i = 0; i < self.rows.length; i++) {
								self.rows[i].cells[dimPos].html.style.display = newdisp;
							}
							OAT_JS.grid.setColumnVisibleValue(self.UcId, dimHeader, (newdisp == ""))
						} else {
							var newdisp = "";
							self.header.cells[dimHeader].html.style.display = newdisp;
							for (var i = 0; i < self.rows.length; i++) {
								self.rows[i].cells[dimPos].html.style.display = newdisp;
							}
							OAT_JS.grid.setColumnVisibleValue(self.UcId, dimHeader, (newdisp == ""))
						}

						//set column position
						try {
							
							var dataFieldId = OAT_JS.grid.gridData[self.UcId].columnDataField[dimHeader];
							colPosition[parseInt(dimensions[dim].getElementsByTagName("position")[0].childNodes[0].nodeValue)] = dataFieldId
							
						} catch (error) { }
						//reset blacklists
						
						var dataFieldId = OAT_JS.grid.gridData[self.UcId].columnDataField[dimHeader];
						OAT_JS.grid.updateFilterInfo(self.UcId, dataFieldId, { op: "all", values: [] });
						

						//set order value if changed
						var order = dimensions[dim].getElementsByTagName("order")[0].childNodes[0].nodeValue;
						if ((order == "ascending") && (self.conditions[dimPos].sort == 3)) {
							self.sort(dimPos, OAT.GridData.SORT_ASC, dimHeader);
							OrderChanged = "Ascending"
							dataFieldOrderChanged = dimensions[dim].getElementsByTagName("dataField")[0].childNodes[0].nodeValue

							
						} else if ((order == "descending") && (self.conditions[dimPos].sort != 3)) {
							self.sort(dimPos, OAT.GridData.SORT_DESC, dimHeader);

							OrderChanged = "Descending"
							dataFieldOrderChanged = dimensions[dim].getElementsByTagName("dataField")[0].childNodes[0].nodeValue

						}

						var hides = dimensions[dim].getElementsByTagName("hide")[0].childNodes;
						for (var sofs = 0; sofs < hides.length; sofs++) {
							if (hides[sofs].tagName === "value") {
								
									var dataFieldId = OAT_JS.grid.gridData[self.UcId].columnDataField[dimHeader];
									var distinctValues = OAT_JS.grid.gridData[self.UcId].differentValues[dataFieldId];
									for (var i = 0; i < distinctValues.length; i++) {
										if (distinctValues[i].trimpivot() == hides[sofs].textContent) {
											OAT_JS.grid.updateFilterInfo(self.UcId, dataFieldId, { op: "push", values: distinctValues[i] });
										}
									}
								
							}
						}
					} //else the dimension doesnt exist in this table

				}


				
				if (colPosition.length != OAT_JS.grid.gridData[self.UcId].columnDataField.length) {
					colPosition = [];
				}
				var dimensions = xmlData.getElementsByTagName("OLAPDimension");
				OAT_JS.grid.refreshPivotWhenServerPagination(self.UcId, dataFieldOrderChanged, OrderChanged, colPosition);
				
			}

		}

		this.getDataXML = function (serverData) {

				//spl = self.IdForQueryViewerCollection;
				//var temp = self.QueryViewerCollection[spl].getPivottableDataSync();

				var dataStr = serverData.split("<Recordset")[1];

				dataStr = "<Recordset" + dataStr;

	
				return dataStr;
		}

		this.getFilteredDataXML = function (serverData) {
			return OAT_JS.grid.getTableWhenServerPagination(self.UcId, serverData);
		}


		this.getMetadataXML = function () {


			var xml = '<OLAPCube format="' + "compact" + '" thousandsSeparator="' + "," + '" decimalSeparator="' + "." + '" dateFormat="' + "MDY" + '">';

			for (var iCV = 0; iCV < self.columns.length; iCV++) {
				
				var isMeasure = (self.columns[iCV].getAttribute("isMeasure") != undefined)
				
				if (isMeasure)
					xml = xml + '<OLAPMeasure> ';
				else
					xml = xml + '<OLAPDimension> ';

				xml = xml + OAT.createXMLDimensionInfo(self, iCV);

				var columnaentabla = 0
				for (var celdaHeader = 0; celdaHeader < self.header.cells.length; celdaHeader++){
					if (self.header.cells[celdaHeader].dataField == self.columns[iCV].getAttribute("dataField")){ 
						columnaentabla = celdaHeader
						if (self.header.cells[celdaHeader].html.style.display == "none") {
							xml = xml + '<hidden>true</hidden>'
						}
					}
				}

				if (self.columns[iCV].getAttribute("picture") === "") {
					xml = xml + '<picture/> '
				} else {
					xml = xml + '<picture>' + self.columns[iCV].getAttribute("picture") + '</picture> ';
				}

				if (self.columns[iCV].getAttribute("format") === "") {
					xml = xml + '<format/> ';
				} else {
					xml = xml + '<format>' + self.columns[iCV].getAttribute("format") + '</format> ';
				}
				
				
				var cantVisibles = 0
				var located = false
				var pos = -1;
				for (var colGrid = 0; (colGrid < OAT_JS.grid.gridData[self.UcId].columnDataField.length) && (!located); colGrid++)
				{
					var dataFieldColumn = OAT_JS.grid.gridData[self.UcId].columnDataField[colGrid];
					var isHidden = false;
					for (var columnI = 0; columnI < self.columns.length; columnI++){
						if (dataFieldColumn == self.columns[columnI].getAttribute("dataField"))
							isHidden = (self.columns[columnI].getAttribute("visible").toLowerCase() == "never")
					}
					if (!isHidden)
						cantVisibles=cantVisibles+1
					if (dataFieldColumn==self.columns[iCV].getAttribute("dataField")){
						located=true;
						if (!isHidden) pos = cantVisibles
					}
				}
				
				if (pos>0)
					xml = xml + '<position>' + pos + '</position> ';
				else
					xml = xml + '<position/>'
				
				
				if (OAT_JS.grid.gridData[self.UcId].dataFieldOrder == self.columns[iCV].getAttribute("dataField")){
					if (OAT_JS.grid.gridData[self.UcId].orderType == "Descending")
						xml = xml + '<order>descending</order> '
					else
						xml = xml + '<order>ascending</order> '
					
				} else {
					xml = xml + '<order>none</order> '
				}
				
								

				xml = xml + '<customOrder/> ';
				xml = xml + '<include> ';

				var previusValue = [];
				for (var i = 0; i < self.rows.length; i++) {
					if (self.rows[i].cells[columnaentabla] != undefined) {
						if (previusValue.findIndex(self.rows[i].cells[columnaentabla].options.value) === -1) {
							if (self.conditions[iCV].blackList.findIndex(self.rows[i].cells[columnaentabla].options.value) === -1) {
								xml = xml + '<value>' + self.rows[i].cells[columnaentabla].options.value + '</value> ';
								previusValue.push(self.rows[i].cells[columnaentabla].options.value);
							}
						}
					}
				}

				xml = xml + '<value>TOTAL</value> </include> <collapse/> ';

				if (isMeasure)
					xml = xml + '</OLAPMeasure>';
				else
					xml = xml + ' </OLAPDimension>';
			}

			xml = xml + "</OLAPCube>";

			return xml;
		}

		self.init();




		var itvl = setInterval(function () {
			
			
			if ((jQuery("#" + self.controlName).length > 0) && (jQuery("#" + self.controlName)[0].getAttribute("class") === "oatgrid")) {
				var actual_rowsPerPage = 0;
				if (jQuery("#" + self.controlName + "tablePagination_rowsPerPage").length > 0) {

					if (!OAT_JS.grid.gridData[self.UcId].autoResize){
						var containerWidth = jQuery("#" + self.ContainerName)[0].clientWidth

						jQuery("#" + self.controlName).css({
							width: containerWidth + "px"
						});
					} else {
						containerWidth = jQuery("#" + self.controlName)[0].clientWidth
					}
					

					actual_rowsPerPage = parseInt(jQuery("#" + self.controlName + "tablePagination_rowsPerPage")[0].value);
					if (!isNaN(actual_rowsPerPage)) {
						if (self.rowsPerPage != actual_rowsPerPage) {
							var stateChange = (self.rowsPerPage != "")
							self.rowsPerPage = actual_rowsPerPage;
							var conteiner = {
								grid: self
							};
							
						} else {
							self.rowsPerPage = actual_rowsPerPage;
						}
					}
					var wd2 = containerWidth;

					jQuery("#" + self.controlName + "_tablePagination").css({
						width: wd2 + "px"
					});
					jQuery("#" + self.controlName + "_grid_top_div").css({
						width: wd2 + "px"
					});

					//ajustar ancho de footer y top div si el contenido sobrepasa al contenedor
					var widthTable = jQuery("#" + self.controlName)[0].clientWidth
					
					if ((widthTable > (containerWidth + 10)) || (jQuery("#" + self.controlName).closest(".gxwebcomponent").length > 0)) {
						jQuery("#" + self.controlName + "_tablePagination").css({
							width: (widthTable+1) + "px"
						});
						jQuery("#" + self.controlName + "_grid_top_div").css({
							width: (widthTable+1) + "px"
						});
					}
					
				} else {

					if (!OAT_JS.grid.gridData[self.UcId].autoResize){
						var containerWidth = jQuery("#" + self.ContainerName)[0].clientWidth
						
						jQuery("#" + self.controlName).css({
							width: containerWidth + "px"
						});
					} else {
						containerWidth = jQuery("#" + self.controlName)[0].clientWidth
					}

					var wid_topBar = containerWidth;

					jQuery("#" + self.controlName + "_grid_top_div").css({
						width: wid_topBar + "px"
					})
					jQuery(".oatgrid").css({ marginBottom: "0px" })

					//ajustar ancho de footer y top div si el contenido sobrepasa al contenedor
					var widthTable = jQuery("#" + self.controlName)[0].clientWidth
					
					if ((widthTable > (containerWidth + 10)) || (jQuery("#" + self.controlName).closest(".gxwebcomponent").length > 0)) { 
						jQuery("#" + self.controlName + "_grid_top_div").css({
							width: (widthTable+1) + "px"
						});
					}
				}

				jQuery(".divIeContainer").css({ opacity: "1" });

				//actualizar colores

				if (jQuery("#" + self.controlName + " tr").length < 500) {
					var nP = 1;
					for (var i = 1; i < jQuery("#" + self.controlName + " tr").length; i++) {
						if (jQuery("#" + self.controlName + " tr")[i].style.display != "none") {
							if (nP % 2 === 1) {
								jQuery("#" + self.controlName + " tr")[i].className = 'odd';
							} else {
								jQuery("#" + self.controlName + " tr")[i].className = 'even';
							}
							nP++;
						}
					}
				}

				if ((jQuery("#" + self.controlName + "tablePagination_rowsPerPage").length > 0) && (self.QueryViewerCollection.length === 0)) {
					jQuery(".pivot_pag_div").css({
						marginBottom: "0px"
					})
				}
			}

		}, 150);




	}  /* Grid */

	OAT.GridHeader = function (grid, previousTHead) {
		var self = this;
		this.cells = [];
		this.grid = grid;
		if (previousTHead) {
			this.html = previousTHead;
		} else {
			this.html = OAT.Dom.create("thead");
		}
		this.container = OAT.Dom.create("tr");
		this.html.appendChild(self.container);

		this.clear = function () {
			OAT.Dom.clear(self.container);
			self.cells = [];
		}

		this.addCell = function (params, columnsDataType, index, dataField) {
			var cell = new OAT.GridHeaderCell(self.grid, params, index, dataField);
			var tds = self.container.childNodes;

			if (tds.length && index < tds.length) {
				self.container.insertBefore(cell.html, tds[index]);
			} else { self.container.appendChild(cell.html); }

			self.cells.splice(index, 0, cell);
			return cell;
		}

		self.removeColumn = function (index) {
			OAT.Dom.unlink(self.cells[index].html);
			self.cells.splice(index, 1);
			for (var i = 0; i < self.cells.length; i++) { self.cells[i].number = i; }
		}
	} /* GridHeader */

	OAT.GridHeaderCell = function (grid, params_, number, dataField) {
		var self = this;
		this.options = {
			value: "",
			sortable: 1,
			//draggable:1,
			//resizable:0,
			align: OAT.GridData.ALIGN_START,
			sort: OAT.GridData.SORT_NONE,
			type: OAT.GridData.TYPE_AUTO
		}

		var params = (typeof (params_) == "object" ? params_ : { value: params_ });
		for (var p in params) { self.options[p] = params[p]; }

		this.changeSort = function (type) {
			self.options.sort = type;
			self.updateSortImage();
		}

		this.updateSortImage = function () {
			if (!self.sorter) { return; }
			var path = "none";
			switch (self.options.sort) {
				case OAT.GridData.SORT_NONE: path = "none"; break;
				case OAT.GridData.SORT_ASC: path = "asc"; break;
				case OAT.GridData.SORT_DESC: path = "desc"; break;
			}
			self.sorter.className = "table-sort-image table-sort-" + path;
			jQuery(self.sorter).find("i")[0].textContent = (path == "none") ? "" : (path == "asc") ? "arrow_drop_up" : "arrow_drop_down";
		}

		this.signal = 0;
		this.number = number;
		this.grid = grid;
		this.dataField = dataField;

		this.html = OAT.Dom.create("td"); /* cell */
		this.container = OAT.Dom.create("div", { position: "relative" }); /* cell interior */
		this.value = OAT.Dom.create("div", { overflow: "hidden" });
		OAT.Dom.addClass(self.value, "header_value");

		OAT.addTextNode(this.value, params.value.replace(/ /g, "\u00A0"))
		this.value.setAttribute("title_v", params.value);
		this.value.setAttribute("dataField", dataField);
		this.html.setAttribute("title_v", params.value);
		this.html.setAttribute("dataField", dataField);

		var divIcon = OAT.Dom.create("div");
		divIcon.className = "div_settings";
		OAT.addImageNode(divIcon, "settings", "");
		OAT.Dom.append([self.html, self.container], [self.container, self.value], [self.value, divIcon]);
		
		if (self.options.sortable) {
			self.html.style.cursor = "pointer";
			self.sorter = OAT.Dom.create("div", { position: "absolute", right: "6px", bottom: "4px" });
			OAT.addImageNode(self.sorter, "arrow_drop_up", "");
			
			self.container.appendChild(self.sorter);
			self.updateSortImage();
			var divCont;
			if (OAT.isIE()) {
				var className = "oatfilterwindowGrid"
				if (grid.isSD) { //android
					divCont = OAT.Dom.create("div", "", "oatfilterwindowGrid oatfilterwindow_small");
				} else {
					divCont = OAT.Dom.create("div", "", "oatfilterwindowGrid");
				}
			} else {
				var className = "oatfilterwindow"
				if (grid.isSD) {//android
					divCont = OAT.Dom.create("div", "", "oatfilterwindow oatfilterwindow_small");
				} else {
					divCont = OAT.Dom.create("div", "", "oatfilterwindow");
				}
			}
			OAT.Anchor.assign(self.container, {
				title: " ",
				content: divCont,
				result_control: false,
				activation: "click",
				type: OAT.WinData.TYPE_RECT,
				width: "auto",
				containerQuery: self.grid.QueryViewerCollection[IdForQueryViewerCollection].ControlName + "-table" + " FilterPopup "
				
			});
			var callback = function (event) {
				var type = OAT.GridData.SORT_NONE;
				switch (self.options.sort) {
					case OAT.GridData.SORT_NONE: type = OAT.GridData.SORT_ASC; break;
					case OAT.GridData.SORT_ASC: type = OAT.GridData.SORT_DESC; break;
					case OAT.GridData.SORT_DESC: type = OAT.GridData.SORT_ASC; break;
				}
				
				
				
					
					if (OAT_JS.grid.gridData[self.grid.UcId].differentValuesPaginationInfo[dataField].previousPage == 0)
					{
						OAT_JS.grid.initValueRead(self.grid.UcId, 0, dataField)
						jQuery(".oat_winrect_container").css({ left:  "-10000000px", top: "-10000000px" })
						var clickEvent = jQuery.extend(true, {}, event);
						var wait = function(){
							if (OAT_JS.grid.gridData[self.grid.UcId].differentValuesPaginationInfo[dataField].previousPage == 0) {
								setTimeout( wait , 100)
							} else {
								OAT.showPopup(clickEvent, self, type, divCont);
							}
						}
						wait();
					} else {
						OAT.showPopup(event, self, type, divCont);
					}
				
				
			}
			OAT.Event.attach(self.container, "click", callback);

		}



		switch (self.options.align) {
			case OAT.GridData.ALIGN_START: self.html.style.textAlign = "start"; break;
			case OAT.GridData.ALIGN_CENTER: self.html.style.textAlign = "center"; break;
			case OAT.GridData.ALIGN_END: self.html.style.textAlign = "end"; break;
		}

		var mouseover = function (event) { OAT.Dom.addClass(self.html, "hover"); }
		var mouseout = function (event) { OAT.Dom.removeClass(self.html, "hover"); }
		OAT.Event.attach(self.html, "mouseover", mouseover);
		OAT.Event.attach(self.html, "mouseout", mouseout);
	} /* GridHeaderCell */

	OAT.GridRow = function (grid, number) {
		var self = this;

		this.clear = function () {
			OAT.Dom.clear(self.html);
			self.cells = [];
		}

		this.removeColumn = function (index) {
			OAT.Dom.unlink(self.cells[index].html);
			self.cells.splice(index, 1);
		}
		this.isDecimal = function (expression, max) {
			var decimal = /^[0-9]+(\.[0-9]+)+$/;
			if (expression.match(decimal)) {
				return true;
			} else {
				return false;
			}
		}
		this.addCell = function (params, columnsDataType, defaultPicture, customPicture, conditionalFormatsColumns, formatValues, customFormat, numCol, index, cellVisible) {
			var i = (!index ? self.cells.length : index);
			if (params == undefined) {
				params = ""
			}

			var cell = new OAT.GridRowCell(params, i, columnsDataType, defaultPicture, customPicture, conditionalFormatsColumns, formatValues, customFormat, numCol, cellVisible);
			var tds = self.html.childNodes;
			if (tds.length && i != tds.length) {
				self.html.insertBefore(cell.html, tds[i]);
				if (!cellVisible) tds[i].style.display = "none"
			} else {
				self.html.appendChild(cell.html);
				if (!cellVisible) cell.html.style.display = "none"
			}

			OAT.setClickEventHandlers(self, tds[tds.length - 1], params, "DIMENSION", numCol, self.grid.rows.length);

			self.cells.splice(i, 0, cell);
			return cell.value;
		}

		this.select = function () {
			self.selected = 1;
			//OAT.Dom.addClass(self.html, "selected");
		}

		this.deselect = function () {
			self.selected = 0;
			OAT.Dom.removeClass(self.html, "selected");
		}

		this.grid = grid; /* parent */
		this.cells = [];
		this.html = OAT.Dom.create("tr");
		this.selected = 0;

		OAT.Dom.addClass(self.html, (number % 2 ? "even" : "odd"));

		var mouseover = function (event) { OAT.Dom.addClass(self.html, "hover"); }
		var mouseout = function (event) { OAT.Dom.removeClass(self.html, "hover"); }
		var click = function (event) {
			if (!event.shiftKey && !event.ctrlKey) {
				/* deselect all */
				for (var i = 0; i < self.grid.rows.length; i++) {
					var r = self.grid.rows[i];
					if (r != self) { r.deselect(); }
				}
			}
			if (event.shiftKey) {
				/* select all above */
				var firstAbove = -1;
				var lastBelow = -1;
				var done = 0;
				for (var i = 0; i < self.grid.rows.length; i++) {
					var r = self.grid.rows[i];
					if (r != self) {
						if (!done && r.selected) { firstAbove = i; } /* first selected above */
						if (!done && firstAbove != -1) { r.select(); }
						if (done && r.selected) { lastBelow = i; } /* last selected below */
					} else {
						done = 1;
					}
				} /* all rows */
				/* if none are above, then try below */
				if (firstAbove == -1 && lastBelow != -1) {
					var done = 0;
					for (var i = 0; i < self.grid.rows.length; i++) {
						var r = self.grid.rows[i];
						if (r == self) { done = 1; }
						if (done && r != self && i < lastBelow) { r.select(); }
					} /* all rows */
				} /* below */
			} /* if shift */

			self.selected ? self.deselect() : self.select();
		}

		OAT.Event.attach(self.html, "mouseover", mouseover);
		OAT.Event.attach(self.html, "mouseout", mouseout);
		OAT.Event.attach(self.html, "click", click);

	}      /* GridRow */

	OAT.GridRowCell = function (params_, number, columnsDataType, defaultPicture, customPicture, conditionalFormatsColumns, formatValues, customFormat, numCol, visible) {
		var self = this;

		this.options = {
			value: "",
			align: OAT.GridData.ALIGN_START
		}

		var params = (typeof (params_) == "object" ? params_ : { value: params_ });
		for (p in params) { self.options[p] = params[p]; }

		this.html = OAT.Dom.create("td");
		this.container = OAT.Dom.create("div");
		this.value = OAT.Dom.create("div", { overflow: "hidden" });
		OAT.Dom.addClass(self.value, "row_value");

		OAT.addTextNode(this.value, OAT.ApplyPictureValue(self.options.value, columnsDataType, defaultPicture, customPicture).trim().replace(/ /g, "\u00A0"))
		
		var cellvalue =  self.options.value
		if (columnsDataType == "date") {
			cellvalue = OAT.ApplyPictureValue(self.options.value, columnsDataType, defaultPicture, customPicture)
		}
		this.html = OAT.applyFormatValues(this.html, cellvalue, columnsDataType, numCol, formatValues, conditionalFormatsColumns, customFormat, defaultPicture); /* Apply Format */

		this.html.setAttribute("title", OAT.ApplyPictureValue(self.options.value, columnsDataType, defaultPicture, customPicture));//self.options.value);
		OAT.Dom.append([self.html, self.container], [self.container, self.value]);
		this.html.setAttribute("sin_pictureValue", params_);
		//align numbers right
		if ((columnsDataType != "character") && (columnsDataType != "guid")){
			if (!isNaN(self.options.value)) {
				self.options.align = 4; //right
			}
			if (self.options.value) {
				self.options.align = 4; //right
			}
		}
		if (columnsDataType === 'date') {
			self.options.align = 4;
		}
		switch (self.options.align) {
			case OAT.GridData.ALIGN_START: self.html.style.textAlign = "start"; break;
			case OAT.GridData.ALIGN_CENTER: self.html.style.textAlign = "center"; break;
			case OAT.GridData.ALIGN_END: self.html.style.textAlign = "end"; break;
			case OAT.GridData.ALIGN_RIGHT: self.html.style.textAlign = "right"; break;
		}

	}         /* GridRowCell */

	OAT.underRecursionStyle = [];
	OAT.applyFormatValues = function (td, value, datatype, columnNumber, formatValues, conditionalFormatsColumns, customFormat) { /* Format for dimensions ("header columns") */
		var measureDataType = datatype;

		//apply default format
		var defaultFormats = customFormat[columnNumber];
		if ((defaultFormats != null) && (defaultFormats != "")) {
			td = OAT.setStyleValues(td, defaultFormats);
		}
		//apply format value
		if (OAT.underRecursionStyle.length > 0) {
			for (var i = 0; i < OAT.underRecursionStyle.length; i++) {
				td = OAT.setStyleValues(td, OAT.underRecursionStyle[i].format);
			}
		}

		for (var i = 0; i < formatValues.length; i++) {
			if (formatValues[i].columnNumber == columnNumber) { //a format for this column
				if (formatValues[i].value === value.trimpivot()) {
					td = OAT.setStyleValues(td, formatValues[i].format);
					if ((self.formatValues[i].recursive != undefined) && (self.formatValues[i].recursive == "yes")) {
						OAT.underRecursionStyle.push(formatValues[i])
					}
				}
			}
		}
		//apply conditional values
		var equal = [];
		var notequal = [];
		var greaterThan = [];
		var greaterOrEqual = [];
		var lessThan = [];
		var lessOrEqual = [];
		var greaterOrEqual = [];
		var between = [];
		for (var i = 0; i < conditionalFormatsColumns.length; i++) {
			if (conditionalFormatsColumns[i].columnNumber == columnNumber) {
				if (conditionalFormatsColumns[i].operation1 == "equal") {
					if ((measureDataType === "real") || (measureDataType === "integer")) {
						equal[0] = parseFloat(conditionalFormatsColumns[i].value1);
					} else {
						equal[0] = conditionalFormatsColumns[i].value1
					}
					equal[1] = conditionalFormatsColumns[i].format;
				}
				if (conditionalFormatsColumns[i].operation1 == "notequal") {
					if ((measureDataType === "real") || (measureDataType === "integer")) {
						notequal[0] = parseFloat(conditionalFormatsColumns[i].value1);
					} else {
						notequal[0] = conditionalFormatsColumns[i].value1
					}
					notequal[1] = conditionalFormatsColumns[i].format;
				}
				if (conditionalFormatsColumns[i].operation1 == "less") {
					if ((measureDataType === "real") || (measureDataType === "integer")) {
						lessThan[0] = parseFloat(conditionalFormatsColumns[i].value1);
					} else {
						lessThan[0] = conditionalFormatsColumns[i].value1;
					}
					lessThan[1] = conditionalFormatsColumns[i].format;
				}
				if (conditionalFormatsColumns[i].operation1 == "lessequal") {
					if ((measureDataType === "real") || (measureDataType === "integer")) {
						lessOrEqual[0] = parseFloat(conditionalFormatsColumns[i].value1);
					} else {
						lessOrEqual[0] = conditionalFormatsColumns[i].value1
					}
					lessThan[1] = conditionalFormatsColumns[i].format;
				}
				if (conditionalFormatsColumns[i].operation1 == "greater") {
					if ((measureDataType === "real") || (measureDataType === "integer")) {
						greaterThan[0] = parseFloat(conditionalFormatsColumns[i].value1);
					} else {
						greaterThan[0] = conditionalFormatsColumns[i].value1;
					}
					greaterThan[1] = conditionalFormatsColumns[i].format;
				}
				if ((conditionalFormatsColumns[i].operation1 == "greaterequal") && (conditionalFormatsColumns[i].operation2 == undefined)) { 
					if ((measureDataType === "real") || (measureDataType === "integer")) {
						greaterOrEqual[0] = parseFloat(conditionalFormatsColumns[i].value1);
					} else {
						greaterOrEqual[0] = conditionalFormatsColumns[i].value1;
					}
					greaterThan[1] = conditionalFormatsColumns[i].format;
				}
				if (conditionalFormatsColumns[i].operation2 && conditionalFormatsColumns[i].operation1 == "greaterequal") {
					//greaterOrEqual = []
					if ((measureDataType === "real") || (measureDataType === "integer")) {
						between[0] = parseFloat(conditionalFormatsColumns[i].value1);
					} else {
						between[0] = conditionalFormatsColumns[i].value1;
					}
					if (conditionalFormatsColumns[i].operation2 && conditionalFormatsColumns[i].operation2 == "lessequal") {
						if ((measureDataType === "real") || (measureDataType === "integer")) {
							between[1] = parseFloat(conditionalFormatsColumns[i].value2);
						} else {
							between[1] = conditionalFormatsColumns[i].value2;
						}
						between[2] = conditionalFormatsColumns[i].format;
					}
				}
			}
		}

		var comparisons = new Array(3);

		if (measureDataType === "real") {
			value = parseFloat(value);
			if ((greaterThan[0] != undefined) && (greaterThan[0] != "")) {
				comparisons[0] = parseFloat(greaterThan[0]);
			}
			if ((lessThan[0] != undefined) && (lessThan[0] != "")) {
				comparisons[1] = parseFloat(lessThan[0]);
			}
			if ((between[0] != undefined) && (between[0] != "")) {
				comparisons[2] = parseFloat(between[0]);
			}
		}

		if (measureDataType === "integer") {
			value = parseInt(value);
			if ((greaterThan[0] != undefined) && (greaterThan[0] != "")) {
				comparisons[0] = parseInt(greaterThan[0]);
			}
			if ((lessThan[0] != undefined) && (lessThan[0] != "")) {
				comparisons[1] = parseInt(lessThan[0]);
			}
			if ((between[0] != undefined) && (between[0] != "")) {
				comparisons[2] = parseInt(between[0]);
			}

		}


		if (measureDataType === "date") {
			var dates = value.split("-");

			var dateElements = new Array(3);
			dateElements[0] = parseInt(dates[0]);
			dateElements[1] = parseInt(dates[1]);
			dateElements[2] = parseInt(dates[2]);

			try {
				if ((equal[0] != undefined) || (greaterOrEqual[0] != undefined) || (lessOrEqual[0] != undefined)) {
					var cmpar;
					if (equal[0] != undefined) {
						cmpar = equal[0].split("-");
					} else if (greaterOrEqual[0] != undefined) {
						cmpar = greaterOrEqual[0].split("-");
					} else if (greaterOrEqual[0] != undefined) {
						cmpar = lessOrEqual[0].split("-");
					}
					var cmparElements = new Array(3);
					cmparElements[1] = parseInt(cmpar[1]);
					cmparElements[2] = parseInt(cmpar[2]);
					cmparElements[0] = parseInt(cmpar[0]);

					if ((cmparElements[0] == dateElements[0]) || ((cmparElements[0] == dateElements[0]) && (cmparElements[1] == dateElements[1]))) {
						if (equal[1] != undefined)
							td = OAT.setStyleValues(td, equal[1]);
						else if (greaterThan[1] != undefined)
							td = OAT.setStyleValues(td, greaterThan[1]);
						else if (lessThan[1] != undefined)
							td = OAT.setStyleValues(td, lessThan[1]);
					}

				}

				if ((notequal[0] != undefined)) {
					var cmpar = notequal[0].split("-");
					var cmparElements = new Array(3);
					cmparElements[1] = parseInt(cmpar[1]);
					cmparElements[2] = parseInt(cmpar[2]);
					cmparElements[0] = parseInt(cmpar[0]);

					if ((cmparElements[0] != dateElements[0]) || ((cmparElements[0] != dateElements[0]) && (cmparElements[1] != dateElements[1]))) {
						td = OAT.setStyleValues(td, notequal[1]);
					}

				}


				if ((greaterThan[0] != undefined) || (greaterOrEqual[0] != undefined)) {
					var cmpar;
					if (greaterThan[0].split("-") != undefined) {
						cmpar = greaterThan[0].split("-");
					} else {
						cmpar = greaterOrEqual[0].split("-");
					}
					cmparElements[1] = parseInt(cmpar[1]);
					cmparElements[2] = parseInt(cmpar[2]);
					cmparElements[0] = parseInt(cmpar[0]);

					if ((cmparElements[0] < dateElements[0]) || ((cmparElements[0] <= dateElements[0]) && (cmparElements[1] < dateElements[1]))
						|| ((cmparElements[0] <= dateElements[0]) && (cmparElements[1] <= dateElements[1]) && (cmparElements[2] < dateElements[2]))) {
						td = OAT.setStyleValues(td, greaterThan[1]);
					}

				}


				if ((lessThan[0] != undefined) || (lessOrEqual[0] != undefined)) {
					var cmpar;
					if (lessThan[0].split("-") != undefined) {
						cmpar = lessThan[0].split("-");
					} else {
						cmpar = lessOrEqual[0].split("-");
					}
					cmparElements = new Array(3);
					cmparElements[1] = parseInt(cmpar[1]);
					cmparElements[2] = parseInt(cmpar[2]);
					cmparElements[0] = parseInt(cmpar[0]);

					if ((cmparElements[0] > dateElements[0]) || ((cmparElements[0] >= dateElements[0]) && (cmparElements[1] > dateElements[1]))
						|| ((cmparElements[0] >= dateElements[0]) && (cmparElements[1] >= dateElements[1]) && (cmparElements[2] > dateElements[2]))) {
						td = OAT.setStyleValues(td, lessThan[1]);
					}

				}

				if ((between[0] != undefined) && (between[1] != undefined)) {
					var cmpar = between[0].split("-");
					var cmpar2 = between[1].split("-");
					cmparElements = new Array(3);
					cmparElements2 = new Array(3);
					cmparElements[1] = parseInt(cmpar[1]);
					cmparElements[2] = parseInt(cmpar[2]);
					cmparElements[0] = parseInt(cmpar[0]);

					cmparElements2[1] = parseInt(cmpar2[1]);
					cmparElements2[2] = parseInt(cmpar2[2]);
					cmparElements2[0] = parseInt(cmpar2[0]);

					if (((cmparElements[0] <= dateElements[0]) || ((cmparElements[0] <= dateElements[0]) && (cmparElements[1] < dateElements[1]))
						|| ((cmparElements[0] <= dateElements[0]) && (cmparElements[1] <= dateElements[1]) && (cmparElements[2] < dateElements[2])))
						&&
						((cmparElements2[0] > dateElements[0]) || ((cmparElements2[0] >= dateElements[0]) && (cmparElements2[1] > dateElements[1]))
							|| ((cmparElements2[0] >= dateElements[0]) && (cmparElements2[1] >= dateElements[1]) && (cmparElements2[2] > dateElements[2])))
					) {
						td = OAT.setStyleValues(td, between[2]);
					}

				}

			} catch (ERROR) {

			}

		}

		if (measureDataType != "date") {
			if ((equal[0] != undefined) && (value == equal[0])) {
				td = OAT.setStyleValues(td, equal[1]);
			}
			if ((notequal[0] != undefined) && (value != notequal[0])) {
				td = OAT.setStyleValues(td, notequal[1]);
			}
			if (((greaterThan[0] != undefined) && (value > greaterThan[0])) ||
				((greaterOrEqual[0] != undefined) && (value >= greaterOrEqual[0]))) {
				td = OAT.setStyleValues(td, greaterThan[1]);
			}
			if (((lessThan[0] != undefined) && (value < lessThan[0])) ||
				((lessOrEqual[0] != undefined) && (value <= lessOrEqual[0]))) {
				td = OAT.setStyleValues(td, lessThan[1]);
			}
			if ((between[0] != undefined && between[1] != undefined) && (value >= between[0] && value <= between[1])) {
				td = OAT.setStyleValues(td, between[2]);
			}
		}

		return td;
	}

	OAT.setStyleValues = function (elem, styleValues) {
		if (styleValues == undefined)
			return elem;
		function hexToRgb(hex) {
			// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
			var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			hex = hex.replace(shorthandRegex, function (m, r, g, b) {
				return r + r + g + g + b + b;
			});

			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		}

		var styleSplit = styleValues.split(";");
		for (var j = 0; j < styleSplit.length; j++) {
			var particularStyleSplit = styleSplit[j].split(":");
			var property = particularStyleSplit[0].replace(/^[\s]+/, '').replace(/[\s]+$/, '').replace(/[\s]{2,}/, ' '); 
			var value = particularStyleSplit[1].replace(/^[\s]+/, '').replace(/[\s]+$/, '').replace(/[\s]{2,}/, ' '); 

			switch (property) {
				case "color": if ((value[0] != undefined) && (value[0] === '#')) {
					elem.style.color = 'rgb(' + hexToRgb(value).r + ',' + hexToRgb(value).g + ',' + hexToRgb(value).b + ')'
				} else {
					elem.style.color = value;
				}
					break;
				case "fontStyle": elem.style.fontStyle = value;
					break;
				case "backgroundColor": elem.style.backgroundColor = value;
					break;
				case "textDecoration": elem.style.textDecoration = value;
					break;
				case "fontWeight": elem.style.fontWeight = value;
					break;
				case "fontFamily": elem.style.fontFamily = value;
					break;
				case "fontVariant": elem.style.fontVariant = value;
					break;
				case "fontSize": elem.style.fontSize = value.replace("px", "") + "px";
					break;
				case "textAlign": elem.style.textAlign = value;
					break;
				case "lineHeight": elem.style.lineHeight = value;
					break;
				case "textIndent": elem.style.textIndent = value;
					break;
				case "verticalAlign": elem.style.verticalAlign = value;
					break;
				case "wordSpacing": elem.style.wordSpacing = value;
					break;
				case "display": elem.style.display = value;
					break;
				case "borderThickness": elem.style.borderThickness = value;
					elem.style.borderWidth = value + "px";
					break;
				case "borderColor": elem.style.borderColor = value;
					break;
				case "borderWith": elem.style.borderWith = value;
					break;
				case "borderStyle": elem.style.borderStyle = value;
					break;
				case "padding": elem.style.padding = value;
					break;
				case "paddingBottom": elem.style.paddingBottom = value;
					break;
				case "paddingLeft": elem.style.paddingLeft = value;
					break;
				case "paddingRight": elem.style.paddingRight = value;
					break;
				case "paddingTop": elem.style.paddingTop = value;
					break;
			}
		}
		return elem;
	}

	OAT.GenerateFormatDateForGrid = function (value, picture) {
		var dividepicture = picture.split(" ");
		var valueSplit = value[0].split("-");
		var newValue = ""
		switch (picture) {
			case "99/99/9999":
				newValue = valueSplit[1] + "/" + valueSplit[2] + "/" + valueSplit[0];
				break;
			case "99/99/99":
				if (valueSplit[0].length == 4) {
					valueSplit[0] = valueSplit[0].substr(valueSplit[0].length - 2, 2);
				}
				newValue = valueSplit[1] + "/" + valueSplit[2] + "/" + valueSplit[0];
				break;
			default:
				newValue = valueSplit[2] + "/" + valueSplit[1] + "/" + valueSplit[0];
		}
		return newValue;
	}

	OAT.HideGridRow = function (_self, colNumber, value) {

		for (var i = 0; i < _self.grid.rows.length; i++) {
			if (_self.grid.rows[i].cells[colNumber].options.value.toString().trimpivot() === value.toString().trimpivot()) {
				_self.grid.rows[i].html.style.display = "none";
				_self.grid.rows[i].html.setAttribute('visibQ', 'tf');
			}
		}

	}

	OAT.ShowGridRow = function (_self, colNumber, value) {

		for (var i = 0; i < _self.grid.rows.length; i++) {
			if (_self.grid.rows[i].cells[colNumber].options.value.toString().trimpivot() === value.toString().trimpivot()) {
				_self.grid.rows[i].html.style.display = "";
				_self.grid.rows[i].html.setAttribute('visibQ', 'tt');
			}
		}

	}

	OAT.RestoreGridRow = function (_self) { /* restore GRID  */

		for (var i = 0; i < _self.grid.rows.length; i++) {
			//if (_self.grid.rows[i].html.getAttribute('visib')!='fp'){
			_self.grid.rows[i].html.style.display = "";
			//}
			_self.grid.rows[i].html.setAttribute('visibQ', 'tt');
		}

		for (var colNum = 0; colNum < _self.grid.columnsDataType.length; colNum++) {
			_self.grid.conditions[colNum].blackList = [];
		}
	}

	OAT.RestoreGridOrder = function (_self) {
		//for (var colNum = 0; colNum < _self.grid.columnsDataType.length; colNum++){
		//		if (_self.grid.conditions[colNum].sort != 1){
		//			_self.grid.sort( colNum, 1, _self.grid.columnsDataType.length -1 - colNum);					
		// 	}		
		//}
		_self.grid.sort(0, 2, _self.grid.columnsDataType.length - 1 - 0);
		_self.grid.sort(0, 1, _self.grid.columnsDataType.length - 1 - 0);
	}

	OAT.RestoreGridColumns = function (_self) {
		for (var tC = 0; tC < _self.grid.columnsDataType.length; tC++) {
			_self.grid.header.cells[tC].html.style.display = "";
			var j = 0;
			var numCol = _self.grid.columnsDataType.length - 1 - tC;
			for (j = 0; j < _self.grid.rows.length; j++) {
				_self.grid.rows[j].cells[numCol].html.style.display = "";
			}
		}
	}
	
	
	OAT.CreateGridRow = function (RowData, GridData, collapse){
		var dataByField = []; var tempcolumnsDataType = []; var tempforPivotCustomPicture = []; var tempforPivotCustomFormat = []; var tempcolumnVisible = [];
		for (var p = 0; p < GridData.columnDataField.length; p++) {
			var pos = GridData.originalColumnDataField.indexOf(GridData.columnDataField[p])
			dataByField[p] = RowData[pos];
			tempcolumnsDataType[p] = GridData.rowsMetadata.columnsDataType[pos];
			tempforPivotCustomPicture[p] = GridData.rowsMetadata.forPivotCustomPicture[pos]
			tempforPivotCustomFormat[p] = GridData.rowsMetadata.forPivotCustomFormat[pos]
			tempcolumnVisible[p] = GridData.columnVisible[pos]
		}
		var row = GridData.grid.createRow(dataByField, tempcolumnsDataType, GridData.rowsMetadata.defaultPicture,
			tempforPivotCustomPicture, GridData.rowsMetadata.conditionalFormatsColumns,
			GridData.rowsMetadata.formatValues, tempforPivotCustomFormat, GridData.rowsMetadata.columns,
			null, tempcolumnVisible);
		if (collapse)
			row.style.visibility = "collapse";
	}
	
	OAT.filterRows = function (grid) {

		var conteiner = {
			grid: grid
		}

		for (var colNum = 0; colNum < grid.columnsDataType.length; colNum++) {

			for (var item = 0; item < grid.conditions[colNum].blackList.length; item++) {
				OAT.HideGridRow(conteiner, colNum, grid.conditions[colNum].blackList[item]);
				OAT.actualizeBlackList("push", grid, colNum, grid.conditions[colNum].blackList[item], false);
			}
		}
	}

	OAT.actualizeBlackList = function (oper, grid, colNumber, value, serverPaging) { //oper = push add value to blackList
		if (oper === "push") {
			if (grid.conditions[colNumber].blackList.indexOf(value) === -1)
				grid.conditions[colNumber].blackList.push(value);
		} else { //pop
			var index = grid.conditions[colNumber].blackList.indexOf(value);
			if (index != -1)
				grid.conditions[colNumber].blackList.splice(index, 1);
		}

	}


	OAT.showPopup = function (pos, _self, _type, div) {

		var toAppend = [];


		var refresh = function () {
			jQuery(".oat_winrect_container").css({ display: "none" });
		}

		var colNumber = _self.number;
		if (OAT_JS.grid.gridData[_self.grid.UcId].redrawHeader){
			var columnCount = 0
			for( var t=0; t<_self.grid.columns.length; t++){
				if (OAT_JS.grid.gridData[_self.grid.UcId].columnVisible[t])
					columnCount = columnCount + 1
				if (_self.grid.columns[t].getAttribute("dataField") == _self.dataField)
					colNumber = columnCount-1
			}		
		}

		var coords = pos;
		var event = pos;

		if (_self.grid.isSD) { //android
			jQuery(".oat_winrect_container").css({ left: "-1500px", top: jQuery(event.currentTarget).offset().top + "px" })
		} else {
			jQuery(".oat_winrect_container").css({ left: jQuery(event.currentTarget).offset().left + "px", top: jQuery(event.currentTarget).offset().top + "px" })
		}

		OAT.Dom.clear(div);
		toAppend.push(div);
		/* contents */

		//add title
		jQuery(".oat_winrect_title").find(".winrect_title_label").remove()

		var spantitle = OAT.Dom.create("label");
		if (_self.grid.isSD) { //android
			jQuery(".oat_winrect_container").addClass("oat_winrect_container_small")
			spantitle.setAttribute("class", "winrect_title_label winrect_title_label_small");
		} else {
			spantitle.setAttribute("class", "winrect_title_label");
		}
		
		var dimension_Title = _self.grid.columns[colNumber].getAttribute("displayName")
		for(var iC = 0; iC < _self.grid.columns.length; iC++)
		{
			if (_self.dataField == _self.grid.columns[iC].getAttribute("dataField"))
			{
				dimension_Title = _self.grid.columns[iC].getAttribute("displayName")
			}
		}
		OAT.addTextNode(spantitle, dimension_Title);
		
		//OAT.addTextNode(spantitle, _self.grid.columns[colNumber].getAttribute("displayName"));
		jQuery(".oat_winrect_title").append(spantitle)

		
		var cached = Math.floor(Math.random() * 10000)
		
		if (!_self.grid.disableColumnSort) {
			var div_order = document.createElement("div");
			div_order.setAttribute("class", "first_popup_subdiv");

			var asc = OAT.Dom.radio("order");
			
			var ascForId = "pivot_order_asc" + "_" + _self.grid.ContainerName + "_" + _self.grid.TableDataFilds[_self.number] + cached;
			asc.id = ascForId;
			asc.className = "input_radio_popup"
			asc.checked = (_self.grid.conditions[colNumber].sort === 2);  // _self.grid.conditions[colNumber] puede dar undefined
			OAT.Dom.attach(asc, "change", function () { });
			OAT.Dom.attach(asc, "click", function () {
				var previousSortValue = _self.grid.conditions[colNumber].sort;
				_self.grid.sort(colNumber, OAT.GridData.SORT_ASC, _self.number);
				var currentSortValue = _self.grid.conditions[colNumber].sort;
				/*if (qv.util.isGeneXusPreview()) {
					if (currentSortValue != previousSortValue && previousSortValue != OAT.GridData.SORT_NONE) {		// First ascending sort must not fire event
						try {
							var datastr = "<DATA event=\"OrderChanged\" name=\"" + _self.grid.columns[_self.number].getAttribute("name") + "\" displayName=\"" + _self.grid.columns[_self.number].getAttribute("displayName") + "\"  order=\"ascending\">"
							datastr = datastr + "</DATA>"
							window.external.SendText(qv.collection[OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection].ControlName, datastr);
						} catch (error) { }
					}
				}*/
				
					var origen = _self.container.parentNode.cellIndex; 
					var dataFieldId;
					if (origen < 0) 
						dataFieldId = _self.dataField
					else
					    dataFieldId = OAT_JS.grid.gridData[_self.grid.UcId].columnDataField[origen];
					self.getDataForTable(_self.grid.UcId, 1, _self.grid.rowsPerPage, false, dataFieldId, "Ascending", "", "")
				
				var idI = "i_" + this.getAttribute("id");
				var inputAsc = document.getElementById(idI);
				inputAsc.textContent = "radio_button_checked";
				var inputDsc = document.getElementById(idI.replace("asc", "desc"));
				inputDsc.textContent = "radio_button_unchecked";
				
			});
			div_order.appendChild(asc);

			var alabel = OAT.Dom.create("label");
			alabel.className = "first_div_label";
			alabel.htmlFor = ascForId;
			
			var IStyle = OAT.isIE() ? "top:-10px;" : ""; 
			OAT.addImageNode(alabel, (_self.grid.conditions[colNumber].sort === 2)?"radio_button_checked":"radio_button_unchecked", IStyle, "i_"+ascForId);
			OAT.addTextNode(alabel, self.translations.GXPL_QViewerJSAscending); //gx.getMessage("GXPL_QViewerJSAscending"))
			div_order.appendChild(alabel);
			div_order.appendChild(OAT.Dom.create("br"));
			
			var desc = OAT.Dom.radio("order");
			var dscForId = "pivot_order_desc" + "_" + _self.grid.ContainerName + "_" + _self.grid.TableDataFilds[_self.number] + cached;
			desc.id = dscForId;
			desc.className = "input_radio_popup"
			desc.checked = (_self.grid.conditions[colNumber].sort === 3);
			OAT.Dom.attach(desc, "change", function () { });
			OAT.Dom.attach(desc, "click", function () {
				var previousSortValue = _self.grid.conditions[colNumber].sort;
				_self.grid.sort(colNumber, OAT.GridData.SORT_DESC, _self.number);
				var currentSortValue = _self.grid.conditions[colNumber].sort;
				/*if (qv.util.isGeneXusPreview()) {
					if (currentSortValue != previousSortValue) {
						try {
							var datastr = "<DATA event=\"OrderChanged\" name=\"" + _self.grid.columns[_self.number].getAttribute("name") + "\" displayName=\"" + _self.grid.columns[_self.number].getAttribute("displayName") + "\"  order=\"descending\">"
							datastr = datastr + "</DATA>"
							window.external.SendText(qv.collection[OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection].ControlName, datastr);
						} catch (error) { }
					}
				}*/

					var origen = _self.container.parentNode.cellIndex; 
					var dataFieldId;
					if (origen < 0) 
						dataFieldId = _self.dataField
					else
					    dataFieldId = OAT_JS.grid.gridData[_self.grid.UcId].columnDataField[origen]; //_self.grid.columns[colNumber].getAttribute("dataField"); 
					self.getDataForTable(_self.grid.UcId, 1, _self.grid.rowsPerPage, false, dataFieldId, "Descending", "", "");
				
				var idI = "i_" + this.getAttribute("id");
				var inputDsc = document.getElementById(idI);
				inputDsc.textContent = "radio_button_checked";
				var inputAsc = document.getElementById(idI.replace("desc", "asc"));
				inputAsc.textContent = "radio_button_unchecked";
				
			});
			var dlabel = OAT.Dom.create("label");
			dlabel.className = "first_div_label";
			dlabel.htmlFor = dscForId;
			OAT.addImageNode(dlabel, (_self.grid.conditions[colNumber].sort === 3)?"radio_button_checked":"radio_button_unchecked", IStyle, "i_"+dscForId);
			OAT.addTextNode(dlabel, self.translations.GXPL_QViewerJSDescending); //gx.getMessage("GXPL_QViewerJSDescending"))

			div_order.appendChild(desc);
			div_order.appendChild(dlabel);

			toAppend.push(div_order);

			if (self.header.length > 1) {
				var hr4 = OAT.Dom.create("hr", {});
				//begin drag options
				toAppend.push(hr4);
			}
		}

		var hr3 = OAT.Dom.create("hr", {});

		//to left
		var dragDiv = OAT.Dom.create("div");
		if (_self.grid.disableColumnSort) {
			dragDiv.setAttribute("class", "first_popup_subdiv");
		}
		if ((_self.container.parentNode.cellIndex > 0)) {

			var dragDiv_L_sel_div = document.createElement("div");
			dragDiv_L_sel_div.setAttribute("class", "move_item_img");

			OAT.Dom.attach(dragDiv_L_sel_div, "click", function () {
				var origen = _self.container.parentNode.cellIndex; //the real position of the item click
				var destino = origen - 1;
				
				while ((destino >= 0) && (_self.container.parentNode.parentNode.children[destino].clientWidth == 0))
				{
					destino = destino - 1
				}
				if (destino == -1) return; 
				
				var i1 = 0;
				var i2 = 0;

				var strDestino = _self.container.parentNode.parentNode.children[destino].getAttribute('title_v');
				for (var i = 0; i < _self.grid.header.cells.length; i++) {
					if (_self.container.children[0].getAttribute('title_v') === _self.grid.header.cells[i].value.firstChild.textContent.replace(/\u00A0/g, " ")) {
						i1 = i; //pos on cell array
					}
					if (strDestino === _self.grid.header.cells[i].value.firstChild.textContent.replace(/\u00A0/g, " ")) {
						i2 = i;
					}
				}

				_self.grid.header.cells[i1].html.parentNode.insertBefore(_self.grid.header.cells[i1].html, _self.grid.header.cells[i2].html);

				
					OAT_JS.grid.gridData[_self.grid.UcId].redrawHeader = true;
					for (var i = 0; i < _self.grid.rows.length; i++) {
						_self.grid.rows[i].cells[i1].html.parentNode.insertBefore(_self.grid.rows[i].cells[i1].html, _self.grid.rows[i].cells[i2].html);
					}
				

				var dataFieldsPos = [];
				for (var idF = 0; idF < jQuery("#" + _self.grid.controlName).find("thead td").length; idF++) {
					dataFieldsPos.push(jQuery("#" + _self.grid.controlName).find("thead td")[idF].getAttribute("dataField"))
				}
				OAT_JS.grid.setDataFieldPosition(_self.grid.UcId, dataFieldsPos);
				refresh();
			});

			var draglabel = OAT.Dom.create("label");
			OAT.addTextNode(draglabel, self.translations.GXPL_QViewerJSMoveColumnToLeft); //gx.getMessage("GXPL_QViewerJSMoveColumnToLeft"))
			draglabel.htmlFor = "move_column_to_left" + cached;
			dragDiv_L_sel_div.appendChild(draglabel);

			OAT.Dom.append([dragDiv, dragDiv_L_sel_div]);
			if (_self.container.parentNode.cellIndex >= _self.grid.header.cells.length - 2) { 
				toAppend.push(dragDiv);
			}
		}

		//to right
		if (_self.container.parentNode.cellIndex < _self.grid.header.cells.length - 1) { //si no es la ultima columna

			var dragDiv_R_sel_div = document.createElement("div");
			dragDiv_R_sel_div.setAttribute("class", "move_item_img");

			OAT.Dom.attach(dragDiv_R_sel_div, "click", function () {
				var origen = _self.container.parentNode.cellIndex; //the real position of the item click
				if (origen == -1){
					for (var c = 0; c < _self.grid.html.tHead.rows[0].cells.length; c++){
						if (_self.container.children[0].getAttribute('title_v') == _self.grid.html.tHead.rows[0].cells[c].getAttribute('title_v')){
							origen = c;
						}
					}
				}
				var destino = origen + 1;
				
				var headers = _self.container.parentNode.parentNode
				
				if (_self.container.parentNode.parentNode == undefined)
					headers = _self.grid.div.children[1].children[0].children[0]
				
				while ((destino < headers.children.length-1) && (headers.children[destino].clientWidth == 0))
				{
					destino = destino + 1
				}
				if (destino >= headers.children.length) return;
				
				var i1 = 0;
				var i2 = 0;

				//var strDestino = _self.container.parentNode.parentNode.children[destino].textContent;
				var strDestino;
				if (_self.container.parentNode.parentNode != undefined){
					strDestino = _self.container.parentNode.parentNode.children[destino].getAttribute('title_v');
				} else {
					strDestino = _self.grid.html.tHead.rows[0].cells[destino].getAttribute('title_v')
				}
				for (var i = 0; i < _self.grid.header.cells.length; i++) {
					if (_self.container.children[0].getAttribute('title_v') /*textContent*/ === _self.grid.header.cells[i].value.firstChild.textContent.replace(/\u00A0/g, " ")) {
						i1 = i; //pos on cell array
					}
					if (strDestino === _self.grid.header.cells[i].value.firstChild.textContent.replace(/\u00A0/g, " ")) {
						i2 = i;
					}
				}

				_self.grid.header.cells[i1].html.parentNode.insertBefore(_self.grid.header.cells[i2].html, _self.grid.header.cells[i1].html);

				
					OAT_JS.grid.gridData[_self.grid.UcId].redrawHeader = true;
					for (var i = 0; i < _self.grid.rows.length; i++) {
						_self.grid.rows[i].cells[i1].html.parentNode.insertBefore(_self.grid.rows[i].cells[i2].html, _self.grid.rows[i].cells[i1].html);
					}
				
				var dataFieldsPos = [];
				for (var idF = 0; idF < jQuery("#" + _self.grid.controlName).find("thead td").length; idF++) {
					dataFieldsPos.push(jQuery("#" + _self.grid.controlName).find("thead td")[idF].getAttribute("dataField"))
				}
				OAT_JS.grid.setDataFieldPosition(_self.grid.UcId, dataFieldsPos);
				refresh();
			});


			var draglabelR = OAT.Dom.create("label");
			OAT.addTextNode(draglabelR, self.translations.GXPL_QViewerJSMoveColumnToRight)//gx.getMessage("GXPL_QViewerJSMoveColumnToRight"))
			draglabelR.htmlFor = "move_column_to_right" + cached;
			dragDiv_R_sel_div.appendChild(draglabelR);
			OAT.Dom.append([dragDiv, dragDiv_R_sel_div]);
			toAppend.push(dragDiv);
		}
		//end drag options

		if (OAT.gridStateChanged(_self)) {

			var restoreview = OAT.Dom.create("div");
			var restoreview_sel_div = document.createElement("div");

			OAT.Dom.attach(restoreview_sel_div, "click", function () {
				self.getDataForTable(_self.grid.UcId, 1, _self.grid.rowsPerPage, true, "", "", "", "", true)
				refresh()
			});

			var rl = OAT.Dom.create("label");
			OAT.addTextNode(rl, self.translations.GXPL_QViewerJSRestoreDefaultView);//gx.getMessage("GXPL_QViewerJSRestoreDefaultView"))
			rl.htmlFor = "pivot_checkbox_restoreview";
			restoreview_sel_div.appendChild(rl);
			OAT.Dom.append([restoreview, restoreview_sel_div]);
			toAppend.push(restoreview);
		}

		var distinct = OAT.Dom.create("div");
		distinct.setAttribute("class", "last_div_popup");
		OAT.distinctDivs(_self, distinct);
		toAppend.push(hr3);

		toAppend.push(distinct);


		OAT.Dom.append(toAppend);




		//for smart device center pop-up
		if (_self.grid.isSD) {//android
			setTimeout(function () {

				var screenWidth = window.innerWidth;
				var initialPopUpWidth = jQuery(".oat_winrect_container")[0].clientWidth


				if (initialPopUpWidth == 0) {
					var last = jQuery(".oat_winrect_container").length;
					initialPopUpWidth = jQuery(".oat_winrect_container")[last - 1].clientWidth
				}


				if (initialPopUpWidth < 220) {
					initialPopUpWidth = 220
				}

				var padding = (screenWidth - initialPopUpWidth) / 2 + jQuery(window).scrollLeft()

				jQuery(".oat_winrect_container").css({ left: padding + "px", width: initialPopUpWidth + "px" })


			}, 50)
		}

	}

	OAT.distinctDivs = function (_self, div) { /* set of distinct values checkboxes */
		var colNumber = _self.grid.columns.length - 1 - _self.number;
		var realColNumber = _self.container.parentNode.cellIndex; //the real position of the item click
	
			if (realColNumber > -1) {
				colNumber = realColNumber
			} else {
				colNumber = _self.number
			}
		

		//var colNumber = _self.grid.rows[0].cells.length - 1 - _self.number;
		var getPair = function (text, id) {
			var div = OAT.Dom.create("div");
			var ch = OAT.Dom.create("input");
			//ch.type = "checkbox";
			//ch.id = id;
			var t = OAT.Dom.create("label");

			OAT.addTextNode(t, text)
			t.htmlFor = id;
			//div.appendChild(ch);
			div.appendChild(t);
			return [div, ch];
		}
		
		var getPairWithIcon = function (text, id, checked_value) {
			var div = OAT.Dom.create("div");
			var ch = OAT.Dom.create("input");
			//ch.type = "checkbox";
			//ch.id = id;
			var t = OAT.Dom.create("label");

			OAT.addTextNode(t, text)
			t.htmlFor = id;
			//div.appendChild(ch);
			
			OAT.addImageNode(div, checked_value ? "check_box" : "check_box_outline_blank", "");
			
			div.appendChild(t);
			return [div, ch];
		}

		var getRef = function (ch, value) {
			return function () {
				if (ch.checked) {
					OAT.ShowGridRow(_self, colNumber, value);
					OAT.actualizeBlackList("pop", _self.grid, colNumber, value, _self.grid.serverPaging);
				} else {
					OAT.HideGridRow(_self, colNumber, value);
					OAT.actualizeBlackList("push", _self.grid, colNumber, value, _self.grid.serverPaging);
				}
				OAT.onFilteredChangedEventHandle(_self, colNumber);
			}
		}

		var getRefBool = function (checked, value) {
			var oper = "pop";
			if (checked) {

				OAT.actualizeBlackList("pop", _self.grid, colNumber, value, _self.grid.serverPaging);
			} else {

				oper = "push";
				OAT.actualizeBlackList("push", _self.grid, colNumber, value, _self.grid.serverPaging);
			}

			
				var dataFieldId = OAT_JS.grid.gridData[_self.grid.UcId].columnDataField[colNumber];//_self.grid.columns[colNumber].getAttribute("dataField")
				self.getDataForTable(_self.grid.UcId, 1, _self.grid.rowsPerPage, true, "", "", dataFieldId, { op: oper, values: value })
			

			OAT.onFilteredChangedEventHandle(_self, colNumber);
		}

		var allRef = function () {
			
				var dataFieldId = OAT_JS.grid.gridData[_self.grid.UcId].columnDataField[colNumber];
				//_self.grid.conditions[colNumber].blackList = [];
				self.getDataForTable(_self.grid.UcId, 1, _self.grid.rowsPerPage, true, "", "", dataFieldId, { op: "all", values: [] })
			
			OAT.onFilteredChangedEventHandle(_self, colNumber);
			OAT.distinctDivs(_self, div);
		}

		var noneRef = function () {
			
				var dataFieldId = OAT_JS.grid.gridData[_self.grid.UcId].columnDataField[colNumber];
				self.getDataForTable(_self.grid.UcId, 1, _self.grid.rowsPerPage, true, "", "", dataFieldId, { op: "none", values: [] })
			

			OAT.onFilteredChangedEventHandle(_self, colNumber);
			OAT.distinctDivs(_self, div);
		}

		var reverseRef = function () {
			
				var dataFieldId = OAT_JS.grid.gridData[_self.grid.UcId].columnDataField[colNumber];
				self.getDataForTable(_self.grid.UcId, 1, _self.grid.rowsPerPage, true, "", "", dataFieldId, { op: "reverse", values: [] })
			

			OAT.distinctDivs(_self, div);
			OAT.onFilteredChangedEventHandle(_self, colNumber);
		}

		var searchFilterClick = function () {
			self.getValuesForColumn(_self.grid.UcId, colNumber, this.value)
		}

		OAT.Dom.clear(div);
		var d = OAT.Dom.create("div");
		d.setAttribute("class", "div_buttons_popup");

		var all = document.createElement("button");
		all.textContent = self.translations.GXPL_QViewerJSAll; //gx.getMessage("GXPL_QViewerJSAll");
		all.setAttribute("class", "btn");
		jQuery(all).click(allRef);

		var none = document.createElement("button");
		none.textContent = self.translations.GXPL_QViewerJSNone; //gx.getMessage("GXPL_QViewerJSNone");
		none.setAttribute("class", "btn");
		jQuery(none).click(noneRef);

		var reverse = document.createElement("button");
		reverse.textContent = self.translations.GXPL_QViewerJSReverse; //gx.getMessage("GXPL_QViewerJSReverse");
		reverse.setAttribute("class", "btn");
		jQuery(reverse).click(reverseRef);

		OAT.Dom.append([d, all, none, reverse], [div, d]);

		var div_search = OAT.Dom.create("div");
		div_search.setAttribute("class", "div_filter_input");
		OAT.addImageNode(div_search, "search", "");

		
			var searchInput = document.createElement("input");
			searchInput.textContent = "none";
			searchInput.setAttribute("class", "search_input");
			searchInput.setAttribute("type", "text");
			searchInput.setAttribute("label", self.translations.GXPL_QViewerSearch); //gx.getMessage("GXPL_QViewerSearch"));
			searchInput.setAttribute("title", self.translations.GXPL_QViewerSearch);  
			searchInput.setAttribute("placeholder", self.translations.GXPL_QViewerSearch); 
			searchInput.setAttribute("id", _self.grid.UcId + OAT_JS.grid.gridData[_self.grid.UcId].columnDataField[colNumber]);
			jQuery(searchInput).keyup(searchFilterClick);

			OAT.Dom.append([div_search, searchInput], [div, div_search]);
		

		var fixHeigthDiv = OAT.Dom.create("div");


			var cantPairs = OAT_JS.grid.getCantDifferentValues(_self.grid.UcId, colNumber);
			for (var i = 0; i < cantPairs; i++) {
				var pairData = OAT_JS.grid.getDifferentValues(_self.grid.UcId, colNumber, i)
				if (pairData) {
					var value = pairData.value;
					var pict_value = pairData.pict_value;
					if ((pairData.value == "#NuN#") || (pict_value.trimpivot() == "")) {
						pict_value = pict_value + "\u00A0"
					}
					pict_value = pict_value.replace(/\&amp;/g, "&").replace(/\u00A0/g, " ")
					if (pict_value.length > 33) {
						var resto = (pict_value.substring(32, pict_value.length).trimpivot().length > 0) ? '...' : '';
						pict_value = pict_value.substring(0, 32) + resto
					}
					pict_value = pict_value.replace(/ /g, "\u00A0") + '\u00A0\u00A0\u00A0\u00A0\u00A0'
					
					var checked_value = pairData.checked;
					
					var pair = getPairWithIcon(pict_value, "pivot_distinct_" + i, checked_value);
					pair[0].setAttribute('value', value);
					fixHeigthDiv.appendChild(pair[0]);

					var class_check_div = (checked_value) ? "check_item_img" : "uncheck_item_img";
					if (_self.grid.isSD) {//android
						var class_check_div = (checked_value) ? "check_item_img_small" : "uncheck_item_img_small";
					}
					pair[0].setAttribute("class", class_check_div);
					
					
					
					OAT.Dom.attach(pair[0], "click", function () {
						var checkedClass = "check_item_img"
						var unCheckedClass = "uncheck_item_img"
						if (_self.grid.isSD) {//android
							checkedClass = "check_item_img_small"
							unCheckedClass = "uncheck_item_img_small"
						}
						var checked = !(this.getAttribute("class") === checkedClass);
						var newClass = (this.getAttribute("class") === checkedClass) ? unCheckedClass : checkedClass;
						this.setAttribute("class", newClass);
						
						jQuery(this).find("i")[0].textContent = checked ? "check_box" : "check_box_outline_blank";
						
						getRefBool(checked, this.getAttribute("value"));
					});
				}
			}
			if (OAT_JS.grid.getCantDifferentValues(_self.grid.UcId, colNumber) <= 9) {
				fixHeigthDiv.setAttribute("class", "pivot_popup_auto");
			} else {
				fixHeigthDiv.setAttribute("class", "pivot_popup_fix");
			}
			fixHeigthDiv.setAttribute("ucid", _self.grid.UcId);
			fixHeigthDiv.setAttribute("columnnumber", colNumber);
			fixHeigthDiv.setAttribute("id", "values_" + _self.grid.UcId + "_" + OAT_JS.grid.gridData[_self.grid.UcId].columnDataField[colNumber])//_self.grid.UcId + "_" + colNumber)
		


		div.appendChild(fixHeigthDiv);
	}


	OAT.appendNewPairToPopUp = function (_self, value, colNumber, checked, pict_value, dataField) {
		var getPair = function (text, id) {
			var div = OAT.Dom.create("div");
			var ch = OAT.Dom.create("input");
			var t = OAT.Dom.create("label");
			OAT.addTextNode(t, text)
			t.htmlFor = id;
			div.appendChild(t);
			return [div, ch];
		}
		
		var getPairWithIcon = function (text, id, checked_value) {
			var div = OAT.Dom.create("div");
			var ch = OAT.Dom.create("input");
			var t = OAT.Dom.create("label");
			OAT.addTextNode(t, text)
			t.htmlFor = id;
			OAT.addImageNode(div, checked_value ? "check_box" : "check_box_outline_blank", "");
			div.appendChild(t);
			return [div, ch];
		}

		var getRefBool = function (checked, value) {
			var oper = "pop";
			if (!checked) {
				oper = "push";
			}
			var filteredValues = _self.grid.conditions[colNumber].blackList
			self.getDataForTable(_self.grid.UcId, 1, _self.grid.rowsPerPage, true, "", "", dataField, { op: oper, values: value })

			OAT.onFilteredChangedEventHandle(_self, colNumber);
		}

		var pict_value = pict_value;
		if (value == "#NuN#") {
			pict_value = "\u00A0"
		}
		pict_value = pict_value.replace(/\&amp;/g, "&").replace(/\u00A0/g, " ")
		if (pict_value.length > 33) {
			var resto = (pict_value.substring(32, pict_value.length).trimpivot().length > 0) ? '...' : '';
			pict_value = pict_value.substring(0, 32) + resto
		}
		pict_value = pict_value.replace(/ /g, "\u00A0") + '\u00A0\u00A0\u00A0\u00A0\u00A0'
		var pair = getPairWithIcon(pict_value, "pivot_distinct_" + i, checked);
		pair[0].setAttribute('value', value);
		var fixHeigthDiv = jQuery("#values_" + _self.grid.UcId + "_" + dataField)[0]//colNumber)[0]
		fixHeigthDiv.appendChild(pair[0]);

		var checked_value = checked;
		var class_check_div = (checked_value) ? "check_item_img" : "uncheck_item_img";
		if (_self.grid.isSD) {//android
			var class_check_div = (checked_value) ? "check_item_img_small" : "uncheck_item_img_small";
		}
		pair[0].setAttribute("class", class_check_div);

		OAT.Dom.attach(pair[0], "click", function () {
			var checkedClass = "check_item_img"
			var unCheckedClass = "uncheck_item_img"
			if (_self.grid.isSD) {//android
				checkedClass = "check_item_img_small"
				unCheckedClass = "uncheck_item_img_small"
			}
			var checked = !(this.getAttribute("class") === checkedClass);
			var newClass = (this.getAttribute("class") === checkedClass) ? unCheckedClass : checkedClass;
			
			jQuery(this).find("i")[0].textContent = checked ? "check_box" : "check_box_outline_blank";
			
			this.setAttribute("class", newClass);
			getRefBool(checked, this.getAttribute("value"));
		});

	}

	OAT.removeAllPairsFromPopUp = function (_self, colNumber, withScroll) {
		var checkedClass = "check_item_img"
		var unCheckedClass = "uncheck_item_img"
		if (_self.grid.isSD) { //android
			checkedClass = "check_item_img_small"
			unCheckedClass = "uncheck_item_img_small"
		}

		jQuery("#values_" + _self.grid.UcId + "_" + OAT_JS.grid.gridData[_self.grid.UcId].columnDataField[colNumber]).find("." + checkedClass).remove()
		jQuery("#values_" + _self.grid.UcId + "_" + OAT_JS.grid.gridData[_self.grid.UcId].columnDataField[colNumber]).find("." + unCheckedClass).remove()

		jQuery(".last_div_popup ." + checkedClass).remove()
		jQuery(".last_div_popup ." + unCheckedClass).remove()

		//set class of pairs container
		if (withScroll) {
			jQuery("#values_" + _self.grid.UcId + "_" + OAT_JS.grid.gridData[_self.grid.UcId].columnDataField[colNumber]).removeClass("pivot_popup_auto");
			jQuery("#values_" + _self.grid.UcId + "_" + OAT_JS.grid.gridData[_self.grid.UcId].columnDataField[colNumber]).addClass("pivot_popup_fix");
		} else {
			jQuery("#values_" + _self.grid.UcId + "_" + OAT_JS.grid.gridData[_self.grid.UcId].columnDataField[colNumber]).removeClass("pivot_popup_fix");
			jQuery("#values_" + _self.grid.UcId + "_" + OAT_JS.grid.gridData[_self.grid.UcId].columnDataField[colNumber]).addClass("pivot_popup_auto");
		}
	}
	/* statefull Rutines */
	OAT.onFilteredChangedEventHandle = function (self, dimensionNumber) {

			
			var dimensionDataField = self.dataField
			
			var columnNumber = dimensionNumber
			for(var col=0; col < self.grid.columns.length; col++)
			{
				if (dimensionDataField == self.grid.columns[col].getAttribute("dataField"))
					columnNumber = col;
			}
			
			return OAT_JS.grid.setFilterChangedWhenServerPagination(self.grid.UcId, self.grid.columns[columnNumber]);

	}

	OAT.setClickEventHandlers = function (self, td, itemValue, MeasureOrDimension, dimensionNumber, itemData) {
		var span = jQuery(td).find("#span_txt_pivot")[0];
		if (span) {
			jQuery(td).data('itemValue', itemValue);
			jQuery(td).data('numberMorD', dimensionNumber);
			jQuery(td).data('itemInfo', itemData);
			
			jQuery(span).data('itemValue', itemValue);
			jQuery(span).data('typeMorD', MeasureOrDimension);
			jQuery(span).data('numberMorD', dimensionNumber);
			jQuery(span).data('itemInfo', itemData);
			var qViewer = self.grid.QueryViewerCollection[self.grid.IdForQueryViewerCollection];
			
			var RaiseItemClick = true;
			for (var iT = 0; iT < qViewer.Metadata.Axes.length; iT++){
				if (self.grid.TableDataFilds[dimensionNumber] == qViewer.Metadata.Axes[iT].DataField)
				{
					RaiseItemClick = qViewer.Metadata.Axes[iT].RaiseItemClick
				}
			}
			for (var iT = 0; iT < qViewer.Metadata.Data.length; iT++){
				if (self.grid.TableDataFilds[dimensionNumber] == qViewer.Metadata.Data[iT].DataField)
				{
					RaiseItemClick = qViewer.Metadata.Data[iT].RaiseItemClick
				}
			}
			
			
			if (qViewer.ItemClick && RaiseItemClick){//qViewer.Metadata.Axes[dimensionNumber].RaiseItemClick) {
				span.onclick = function () { 
						OAT.onClickEventHandle(self, this); 
						if (OAT_JS.grid.gridData[self.grid.UcId].selection.Allow){ 
							OAT.onClickSelectNode(td, self);
						}
					}
				span.classList.add("gx-qv-clickable-element");
			} else if (OAT_JS.grid.gridData[self.grid.UcId].selection.Allow){ 
				span.onclick = function () { OAT.onClickSelectNode(td, self); }
			}
		}
	}

	var alreadyclicked = false;
	var alreadyclickedTimeout;
	OAT.onClickEventHandle = function (self, elemvalue) {
		var datastr = OAT.PreClickHandle(self, elemvalue);
		

	}
	


	OAT.PreClickHandle = function (self, elemvalue) {
		//if (self.grid.HideDataFilds.length) {
			OAT_JS.grid.lastCallData = { "self": self, "elemvalue": elemvalue }
			if (self.grid.HideDataFilds.length) {
				OAT_JS.grid.requestDataSynForTable(self.grid.IdForQueryViewerCollection)
			} else {
				OAT.ClickHandle(self, elemvalue);
			}	
		//}
	}

	OAT.ClickHandle = function (self, elemvalue, dataSync) {
		if (self.grid.HideDataFilds.length) {
			var spl = self.grid.IdForQueryViewerCollection
			var temp = dataSync //self.grid.QueryViewerCollection[spl].getPivottableDataSync();

			self.grid.allRowsPivot = []
			self.grid.allFullRowsPivot = []
			var stringRecord = temp.split("<Record>")
			for (var i = 1; i < stringRecord.length; i++) {
				var recordData = [];
				var fullRecordData = [];
				for (var j = 0; j < self.grid.TableDataFilds.length; j++) {
					recordData[j] = "#NuN#"
					var dt = stringRecord[i].split("<" + self.grid.TableDataFilds[j] + ">")
					if (dt.length > 1) {
						var at = dt[1].split("</" + self.grid.TableDataFilds[j] + ">")
						recordData[j] = at[0]
						fullRecordData[j] = recordData[j]
					} else {
						if (stringRecord[i].indexOf("<" + self.grid.TableDataFilds[j] + "/>") >= 0) {
							recordData[j] = ""
							fullRecordData[j] = ""
						} else {
							recordData[j] = "#NuN#"
							fullRecordData[j] = "#NuN#"
						}
					}
				}
				self.grid.allRowsPivot.push(recordData);

				//add hide columns values
				for (var j = 0; j < self.grid.HideDataFilds.length; j++) {
					var dt = stringRecord[i].split("<" + self.grid.HideDataFilds[j] + ">")
					if (dt.length > 1) {
						var at = dt[1].split("</" + self.grid.HideDataFilds[j] + ">")
						fullRecordData[fullRecordData.length + j] = at[0]
					} else {
						if (stringRecord[i].indexOf("<" + self.grid.HideDataFilds[j] + "/>") >= 0) {
							fullRecordData[fullRecordData.length + j] = ""
						} else {
							fullRecordData[fullRecordData.length + j]  = "#NuN#"	
						}
					}
				}
				self.grid.allFullRowsPivot.push(fullRecordData);

			}
		}

		var pseudoRow = []

		var value = jQuery(elemvalue).data('itemValue');
		var type = jQuery(elemvalue).data('typeMorD');
		var number = jQuery(elemvalue).data('numberMorD');
		var columnNumber = jQuery(elemvalue).data('itemInfo');
		var selected = OAT.IsNodeSelected(self.cells[number].html);
		var datastr = "<DATA><ITEM type=\"" + type + "\" ";
		
		datastr = datastr + "name=\"" + self.grid.columns[number].getAttribute("name") + "\" ";
		datastr = datastr + "displayName=\"" + self.grid.columns[number].getAttribute("displayName") + "\" ";
		datastr = datastr + "selected=\"" + selected.toString() + "\" ";
		datastr = datastr + "location=\"rows\">"
		datastr = datastr + value


		datastr = datastr + "</ITEM>";

		datastr = datastr + "<CONTEXT>";
		datastr = datastr + "<RELATED>";
		for (var i = 0; i < self.grid.rows[columnNumber].cells.length; i++) {
			datastr = datastr + "<ITEM name=\"" + self.grid.columns[i].getAttribute("name") + "\">";
			datastr = datastr + "<VALUES";
			var existNullValue = false;
			var stringValues = "";
			
			if (self.grid.rows[columnNumber].cells[i].options.value != "#NuN#"){
				stringValues = stringValues + "<VALUE>" + self.grid.rows[columnNumber].cells[i].options.value + "</VALUE>";
			} else {
				existNullValue = true
			}
			pseudoRow.push(self.grid.rows[columnNumber].cells[i].options.value)
			
			if (existNullValue){
				datastr = datastr + " Null=\"true\""
			}
			datastr = datastr + ">" + stringValues 
			datastr = datastr + "</VALUES>";
			datastr = datastr + "</ITEM>";
		}
		if (self.grid.HideDataFilds.length) {
			var coinc = function (row1, row2) {
				for (var o = 0; o < row1.length; o++) {
					if ((row1[o] != undefined) && (row1[o] != row2[o])) {
						return false;
					}
				}
				return true;
			}
			for (var r = 0; r < self.grid.allFullRowsPivot.length; r++) {
				if (coinc(pseudoRow, self.grid.allFullRowsPivot[r])) {
					for (var h = 0; h < self.grid.HideDataFilds.length; h++) {
						datastr = datastr + "<ITEM name=\"" + self.grid.OrderFildsHidden[h] + "\">";
						datastr = datastr + "<VALUES";
						var existNullValue = false;
						var stringValues = "";
						
						if (self.grid.rows[columnNumber].cells[i].options.value != "#NuN#"){
							stringValues = stringValues + "<VALUE>" + self.grid.allFullRowsPivot[r][h + self.grid.rows[columnNumber].cells.length] + "</VALUE>";
						} else {
							existNullValue = true
						}
						
						if (existNullValue){
							datastr = datastr + " Null=\"true\""
						}
						datastr = datastr + ">" + stringValues 
						datastr = datastr + "</VALUES>";
						datastr = datastr + "</ITEM>";
					}
				}
			}

		}
		datastr = datastr + "</RELATED>";
		datastr = datastr + "<FILTERS>";
		datastr = datastr + "</FILTERS>";
		datastr = datastr + "</CONTEXT>";

		datastr = datastr + "</DATA>"


		var spl = self.grid.IdForQueryViewerCollection;
		OAT_JS.grid.fireOnItemClickEvent(self.grid.QueryViewerCollection[spl], datastr, false)
		//return datastr;
	}

	OAT.onClickSelectNode = function (elemvalue, self) {
		 
		var value = jQuery(elemvalue).data('itemValue');
		var number = jQuery(elemvalue).data('numberMorD');
		var rowNumber = jQuery(elemvalue).data('itemInfo');
		
		var colNumber = OAT_JS.grid.gridData[self.grid.UcId].columnDataField.indexOf(self.grid.TableDataFilds[number]);
		
		if (OAT_JS.grid.gridData[self.grid.UcId].selection.Allow){ 
			OAT.SelectNodes(self, value, false, colNumber, rowNumber);
		}
			
	}


	OAT.SelectNodes = function(self, value, isRefresh, colNumber, rowNumber, selectedItemNumber, conditions) {
		if (rowNumber >= 0) {

			var row = jQuery("#" + self.grid.controlName + " tbody").find("tr")[rowNumber];

			if (OAT.IsNodeSelected(jQuery(row).find("td")[colNumber])) {
				OAT.ClearSelectedNodes(jQuery(self.grid.html));
				OAT_JS.grid.gridData[self.grid.UcId].selection.SelectedNode = [];
			} else {

				if (!isRefresh) {
					OAT.SetSelectedNodeBackgroundColor(jQuery(row).find("td")[colNumber], self.grid.selection.Color, jQuery(self.grid.html))

					//save selected node
					OAT_JS.grid.gridData[self.grid.UcId].selection.SelectedNode = []
					OAT_JS.grid.gridData[self.grid.UcId].selection.SelectedNode[0] = {
						value : value,
						dataField : OAT_JS.grid.gridData[self.grid.UcId].columnDataField[colNumber],
						rowData : [OAT_JS.grid.gridData[self.grid.UcId].rowsData[rowNumber]],
						clicked : true
					}
				} else {

					OAT.SetNodeBackgroundColor(jQuery(row).find("td")[colNumber], self.grid.selection.Color);
				}

				if (OAT_JS.grid.gridData[self.grid.UcId].selection.EntireLine) {
					for (var t = 0; t < self.grid.rows[rowNumber].cells.length; t++) {
						if (t != colNumber) {
							OAT.SetNodeBackgroundColor(jQuery(row).find("td")[t], OAT_JS.grid.gridData[self.grid.UcId].selection.Color)
						}
					}
				}
			}
		} else {

			//search for row
			if (!isRefresh)
				OAT_JS.grid.gridData[self.grid.UcId].selection.SelectedNode[selectedItemNumber] = {
					value : value,
					dataField : OAT_JS.grid.gridData[self.grid.UcId].columnDataField[colNumber],
					rowData : [],
					clicked : false,
					conditions : conditions
				}

			for (var i = 0; i < jQuery("#" + self.grid.controlName + " tbody").find("tr").length; i++) {

				var dataType = self.grid.columnsDataType[ self.grid.TableDataFilds.indexOf(OAT_JS.grid.gridData[self.grid.UcId].columnDataField[colNumber])];

				var cellValue = OAT_JS.grid.gridData[self.grid.UcId].rowsData[i][self.grid.TableDataFilds.indexOf(OAT_JS.grid.gridData[self.grid.UcId].columnDataField[colNumber])];
				var sameValue = false;

				if ((dataType == "real") || (dataType == "integer")) {
					sameValue = (parseFloat(value) == cellValue);
				} else {
					sameValue = (cellValue.trim() == value.trim());
				}

				if (sameValue) {
					//check all conditions
					if (OAT.checkConditions(self, OAT_JS.grid.gridData[self.grid.UcId].rowsData[i], conditions)) {
						var row = jQuery("#" + self.grid.controlName + " tbody").find("tr")[i];

						OAT.SetNodeBackgroundColor(jQuery(row).find("td")[colNumber], self.grid.selection.Color, jQuery(self.grid.html))
						//save selected node
						OAT_JS.grid.gridData[self.grid.UcId].selection.SelectedNode[selectedItemNumber].rowData.push(OAT_JS.grid.gridData[self.grid.UcId].rowsData[i]);

						if (OAT_JS.grid.gridData[self.grid.UcId].selection.EntireLine) {
							for (var t = 0; t < self.grid.rows[i].cells.length; t++) {
								if (t != colNumber) {
									OAT.SetNodeBackgroundColor(jQuery(row).find("td")[t], OAT_JS.grid.gridData[self.grid.UcId].selection.Color)
								}
							}
						}
					}
				}
			}
		}
	}
	
	OAT.checkConditions = function(self, rowData, conditions){
		var sameRow = true;
		
		for(var s = 0; s < conditions.length; s++){
			var colNumber = OAT_JS.grid.gridData[self.grid.UcId].columnDataField.indexOf(conditions[s].DataField);
			var dataType = self.grid.columnsDataType[ self.grid.TableDataFilds.indexOf(OAT_JS.grid.gridData[self.grid.UcId].columnDataField[colNumber])];
			var sameValue = true;
			if ((dataType == "real") || (dataType == "integer")) {
				sameValue = (parseFloat(conditions[s].Value) == parseFloat(rowData[colNumber]));
			} else {
				sameValue = (conditions[s].Value.trim() == rowData[colNumber].trim());
			}
			if (!sameValue){
				return false;
			}		
		}
		
		return sameRow;
	}
	
	OAT.RedrawSelectedNode = function(grid){
		if (OAT_JS.grid.gridData[grid.UcId].selection.SelectedNode) {
			OAT.ClearSelectedNodes(jQuery(grid.html));
			
			for (var s = 0; s < OAT_JS.grid.gridData[grid.UcId].selection.SelectedNode.length; s++) {
			
				if (OAT_JS.grid.gridData[grid.UcId].selection.SelectedNode[s].clicked){
					//search for row
					for (var r = 0; r < OAT_JS.grid.gridData[grid.UcId].selection.SelectedNode[s].rowData.length; r++){
						var selectedRow = OAT_JS.grid.gridData[grid.UcId].selection.SelectedNode[s].rowData[r];
						for (var i = 0; i < OAT_JS.grid.gridData[grid.UcId].rowsData.length; i++){
							var sameRow = true;
							for (var j = 0; j < OAT_JS.grid.gridData[grid.UcId].rowsData[i].length; j++)
							{
								if (OAT_JS.grid.gridData[grid.UcId].rowsData[i][j] != selectedRow[j])
									sameRow = false;
							}
				
							if (sameRow)
								OAT.SelectNodes({grid: grid}, OAT_JS.grid.gridData[grid.UcId].selection.SelectedNode[s].value, true, OAT_JS.grid.gridData[self.UcId].columnDataField.indexOf(OAT_JS.grid.gridData[grid.UcId].selection.SelectedNode[s].dataField), i)
							
						}
					}
				} else {
				
					OAT.SelectNodes({grid: grid}, OAT_JS.grid.gridData[grid.UcId].selection.SelectedNode[s].value, true, OAT_JS.grid.gridData[self.UcId].columnDataField.indexOf(OAT_JS.grid.gridData[grid.UcId].selection.SelectedNode[s].dataField), -1, s, OAT_JS.grid.gridData[grid.UcId].selection.SelectedNode[s].conditions);
				}
			}
		}
	}

	OAT.gridStateChanged = function (self) { //true is state changed
		
		return OAT_JS.grid.getStateChange(self.grid.UcId)
		
	}

	OAT.createXMLDimensionInfo = function (self, iCV) {
		return  '<name>' + self.columns[iCV].getAttribute("name") + '</name> '
				+ '<displayName>' + self.columns[iCV].getAttribute("displayName") + '</displayName> '
		 		+ '<description>' + self.columns[iCV].getAttribute("description") + '</description> '
				+ '<dataField>' + self.columns[iCV].getAttribute("dataField") + '</dataField> '
		 		+ '<dataType>' + self.columns[iCV].getAttribute("dataType") + '</dataType> '
		 		+ '<summarize>' + self.columns[iCV].getAttribute("summarize") + '</summarize> '
				+ '<align>' + self.columns[iCV].getAttribute("align") + '</align> '
			 	+ '<axis>' + self.columns[iCV].getAttribute("axis") + '</axis> ';
	}
	
	OAT.createXMLMetadata = function (self, columnNumber, serverPagination) {

		var xml = '<OLAPCube format="' + "compact" + '" thousandsSeparator="' + "," + '" decimalSeparator="' + "." + '" dateFormat="' + "MDY" + '">';

		for (var iC = 0; iC <= self.grid.columns.length - 1; iC++) {
			var iCV = iC;
			
			xml = xml + '<OLAPDimension> ';
			
			xml = xml + OAT.createXMLDimensionInfo(self.grid, iCV);
			
			var posHeader = 0
			for(var pH = 0; pH < self.grid.header.cells.length; pH++){
				if (self.grid.header.cells[pH].dataField == self.grid.columns[iCV].getAttribute("dataField")){
					posHeader = pH
				}				
			}
			if (self.grid.header.cells[posHeader].html.style.display == "none") {
				xml = xml + '<hidden>true</hidden>'
			}

			if (self.grid.columns[iCV].getAttribute("picture") === "") {
				xml = xml + '<picture/> '
			} else {
				xml = xml + '<picture>' + self.grid.columns[iCV].getAttribute("picture") + '</picture> ';
			}

			if (self.grid.columns[iCV].getAttribute("picture") === "") {
				xml = xml + '<format/> ';
			} else {
				xml = xml + '<format>' + self.grid.columns[iCV].getAttribute("format") + '</format> ';
			}

			if (OAT_JS.grid.gridData[self.grid.UcId].dataFieldOrder == self.grid.columns[iCV].getAttribute("dataField")){
				if (OAT_JS.grid.gridData[self.grid.UcId].orderType == "Descending")
					xml = xml + '<order>descending</order> '
				else
					xml = xml + '<order>ascending</order> '
			} else {
				xml = xml + '<order>none</order> '
			}

			xml = xml + '<customOrder/> ';
			xml = xml + '<include> ';

			
				var dF = self.grid.columns[iCV].getAttribute("dataField");
				if ((self.blackLists[dF].state != "none") && (self.blackLists[dF].state != "all")) {
					for (var i = 0; i < self.blackLists[dF].visibles.length; i++) {
						xml = xml + '<value>' + self.blackLists[dF].visibles[i].trimpivot() + '</value> ';
					}
				} else if (self.blackLists[dF].state != "none") {
					for (var i = 0; i < self.differentValues[dF].length; i++) {
						xml = xml + '<value>' + self.differentValues[dF][i].trimpivot() + '</value> ';
					}
				}
			
			xml = xml + '<value>TOTAL</value> </include> <collapse/> ';

			xml = xml + '<hide> '
			
				var dF = self.grid.columns[iCV].getAttribute("dataField");
				if ((self.blackLists[dF].state != "none") && (self.blackLists[dF].state != "all")) {
					for (var i = 0; i < self.blackLists[dF].hiddens.length; i++) {
						xml = xml + '<value>' + self.blackLists[dF].hiddens[i].trimpivot() + '</value> ';
					}
				} else if (self.blackLists[dF].state != "all") {
					for (var i = 0; i < self.differentValues[dF].length; i++) {
						xml = xml + '<value>' + self.differentValues[dF][i].trimpivot() + '</value> ';
					}
				}
			
			xml = xml + '</hide> '

			var numCol = self.grid.columnsDataType.length - 1 - iCV;
			try {
				if (self.grid.header.cells[numCol] != undefined) {
					if (self.grid.header.cells[numCol].html.style.display === "") {
						xml = xml + '<condition>table</condition> ';
						xml = xml + '<filterbar>no</filterbar> ';
						//xml = xml + '<position>' + self.columnDataField.indexOf(self.grid.columns[iCV].getAttribute("dataField")) + '</position>'
					} else {
						xml = xml + '<condition>none</condition> ';
						xml = xml + '<filterbar>yes</filterbar> ';
						//xml = xml + '<position>' + self.columnDataField.indexOf(self.grid.columns[iCV].getAttribute("dataField")) + '</position>'
					}
				}
			} catch (ERROR) { }
			
			var cantVisibles = 0
			var located = false
			var pos = -1;
			for (var colGrid = 0; (self.columnDataField) && (colGrid < self.columnDataField.length) && (!located); colGrid++)
				{
					var dataFieldColumn = self.columnDataField[colGrid];
					var isHidden = false;
					for (var columnI = 0; columnI < self.grid.columns.length; columnI++){
						if (dataFieldColumn == self.grid.columns[columnI].getAttribute("dataField"))
							isHidden = (self.grid.columns[columnI].getAttribute("visible").toLowerCase() == "never")
					}
					if (!isHidden)
						cantVisibles=cantVisibles+1
					if (dataFieldColumn==self.grid.columns[iCV].getAttribute("dataField")){
						located=true;
						if (!isHidden) pos = cantVisibles
					}
				}
				
				if (pos>0)
					xml = xml + '<position>' + pos + '</position> ';
				else
					xml = xml + '<position/>'
			
			
			/*try {
				var axisOrder = self.columnDataField.indexOf(self.grid.columns[iCV].getAttribute("dataField")) + 1
				xml = xml + '<axisOrder>' + axisOrder + '</axisOrder>'
			} catch (ERROR) { }*/

			xml = xml + '<restoreview>no</restoreview> ';
			xml = xml + ' </OLAPDimension>';
		}


		xml = xml + "</OLAPCube>";

		return xml;
	}

	OAT.ExportToPdf = function (_self, fileName) {
		//count hidden columns
		var hiddenColumns = [];
		for (var i = 0; i < 1; i++) {
			var tRow = jQuery("#" + _self.grid.controlName + " tr")[i];
			for (var j = 0; j < tRow.children.length; j++) {
				if (tRow.children[j].style.display == "none") {
					hiddenColumns.push(j);
				}
			}
		}


		//calc max length of paper
		var hgt = 20 + jQuery("#" + _self.grid.controlName + " tr").length * 30 + 5;
		if (hgt < 841) {
			hgt = 841;
		}

		//calc max width of paper
		var wdt = 0;
		var tRow = jQuery("#" + _self.grid.controlName + " tr")[0].children.length - hiddenColumns.length;
		wdt = 20 + tRow * (30 + 65) + 5;
		if (wdt < 595) {
			wdt = 595;
		}

		//calculate columns width
		var columnsWidth = [];

		for (var i = 0; i < jQuery("#" + _self.grid.controlName + " tr").length; i++) {

			var tRow = jQuery("#" + _self.grid.controlName + " tr")[i];
			var columnInPdf = 0;
			for (var j = 0; j < tRow.children.length; j++) {//for every cell in the row
				var childText = tRow.children[j].textContent;
				var hidden = tRow.children[j].getAttribute('hidden');

				if (tRow.children[j].style.display != "none") {

					if (hidden === null) {
						if (columnsWidth[columnInPdf] == undefined) {
							columnsWidth[columnInPdf] = 30;
						}


						//japanese character
						var jChar = 0;
						for (var p = 0; p < childText.length; p++) {
							if (childText.charCodeAt(p) > 1000) {
								jChar++;
							}
						}

						if (jChar === 0) {
							if (childText.length > 14) {
								if (childText.length * 1.68 > columnsWidth[columnInPdf]) {
									columnsWidth[columnInPdf] = childText.length * 1.68;
								}
							}
						} else {
							var w = jChar * 2.8 + (childText.length - jChar) * 1.68;
							if (w > columnsWidth[columnInPdf]) {
								columnsWidth[columnInPdf] = w;
							}
						}

						columnInPdf = columnInPdf + 1;
					}
				}
			}
		}
		//recalculate width
		var nw = 0
		for (var i = 0; i < columnsWidth.length; i++) {
			nw = nw + columnsWidth[i] * 2.5 + 65;
		}
		nw = 20 + nw + 5;
		if (nw > wdt) {
			wdt = nw;
		}

		var getXOffset = function (colNro, columnsWidth) {
			var offset = 0;
			for (var i = 0; i < colNro; i++) {
				offset = offset + columnsWidth[i];
			}
			return offset;
		}

		var getYOffset = function (rowNro, rowsHeight) {
			var offsety = 0;
			for (var j = 0; j < rowNro; j++) {
				offsety = offsety + rowsHeight[j];
			}
			return offsety;
		}

		var doc;
		if (wdt <= hgt) {
			doc = new jsPDF('portrait', 'mm', 'a4', false, wdt, 792); //landscape or portrait
		} else {
			doc = new jsPDF('landscape', 'mm', 'a4', false, wdt, 792); //landscape or portrait
		}
		doc.setFontSize(8);

		doc.line(18, 13, 20 + getXOffset(jQuery("#" + _self.grid.controlName + " tr")[0].children.length - hiddenColumns.length, columnsWidth), 13);

		var y = -1;
		var nroPag = 1
		var verticalHeight = Math.min((jQuery("#" + _self.grid.controlName + " tr").length) - (nroPag - 1) * 26, 26)
		for (var i = 0; i < jQuery("#" + _self.grid.controlName + " tr").length; i++) {
			y++;
			var tRow = jQuery("#" + _self.grid.controlName + " tr")[i];

			var columnInPdf = 0;

			for (var j = 0; j < tRow.children.length; j++) {//for every cell in the row

				if (tRow.children[j].style.display != "none") {
					//vertical line
					doc.line(18 + getXOffset(columnInPdf, columnsWidth), 13, 18 + getXOffset(columnInPdf, columnsWidth), 23 + (verticalHeight - 1) * 10);

					var childText = OAT.removeIconFont(tRow.children[j].textContent);
					var hidden = tRow.children[j].getAttribute('hidden');

					var imgTxtData = []
					if (childText.charCodeAt(0) > 1000) {
						for (var cNo = 0; cNo < childText.length; cNo++) {
							imgTxtData[cNo] = OAT.getCharacterImg(childText.charCodeAt(cNo))
						}
					} else {
						var posI = -1;
						for (var p = 1; p < childText.length; p++) {
							if (childText.charCodeAt(p) > 1000) {
								posI = p;
								break;
							}
						}
						if (posI > 0) {
							var tempchildText = childText.substring(0, posI);
							var posE = 0
							for (var cNo = posI; cNo < childText.length; cNo++) {
								imgTxtData[posE] = OAT.getCharacterImg(childText.charCodeAt(cNo))
								posE++;
							}
							childText = tempchildText;
						}
					}

					//set styles
					var hasBackground = false;
					doc.setTextColor(0, 0, 0);
					doc.setFontStyle('normal');
					var IsTextAlignRight = !isNaN(parseFloat(childText));
					var textWidht = doc.getStringUnitWidth(childText);
					if ((tRow.children[j].getAttribute("style") != undefined) && (tRow.children[j].getAttribute("style") != null)) {
						var attributes = tRow.children[j].getAttribute("style").split(";");
						for (var at = 0; at < attributes.length; at++) {
							var detail = attributes[at].split(":");
							if (detail[0].replace(/^\s+|\s+$/g, '') === "color") {
								var rgb = detail[1].replace(/^\s+|\s+$/g, '');
								rgb = rgb.substring(4, rgb.length);
								rgb = rgb.substring(0, rgb.length - 1);
								doc.setTextColor(parseInt(rgb.split(",")[0]), parseInt(rgb.split(",")[1]), parseInt(rgb.split(",")[2]));

							} else if (detail[0].replace(/^\s+|\s+$/g, '') === "text-align") {
								//var alg = detail[1].replace(/^\s+|\s+$/g, '');
								IsTextAlignRight = (detail[1].replace(/^\s+|\s+$/g, '') == "right")
							} else if (detail[0].replace(/^\s+|\s+$/g, '') === "font-style") {
								doc.setFontStyle('italic')
							} else if (detail[0].replace(/^\s+|\s+$/g, '') === "font-weight") {
								if (detail[1].replace(/^\s+|\s+$/g, '') === "bold") {
									doc.setFontStyle('bold')
								}
							} else if (detail[0].replace(/^\s+|\s+$/g, '') === "background-color") {
								var rgb = detail[1].replace(/^\s+|\s+$/g, '');
								rgb = rgb.substring(4, rgb.length);
								rgb = rgb.substring(0, rgb.length - 1);
								doc.setFillColor(parseInt(rgb.split(",")[0]), parseInt(rgb.split(",")[1]), parseInt(rgb.split(",")[2]));
								hasBackground = true;
							} else if (detail[0].replace(/^\s+|\s+$/g, '') === "border-color") {
								var rgb = detail[1].replace(/^\s+|\s+$/g, '');
								rgb = rgb.substring(4, rgb.length);
								rgb = rgb.substring(0, rgb.length - 1);
								doc.setDrawColor(parseInt(rgb.split(",")[0]), parseInt(rgb.split(",")[1]), parseInt(rgb.split(",")[2]));
							}

						}
					}

					if ((hasBackground) && (j == (tRow.children.length - 1))) {//for the last column more width
						doc.rect(18 + getXOffset(columnInPdf, columnsWidth), 23 + (y - 1) * 10, 32, 10, 'FD');
					} else if (hasBackground) {
						doc.rect(18 + getXOffset(columnInPdf, columnsWidth), 23 + (y - 1) * 10, 30, 10, 'FD');
					}

					doc.setDrawColor(0, 0, 0);
					doc.setFontSize(8);

					if ((hidden === null) /*&& (tRow.children[j].style.display != "none")*/) {
						var preImage = 0;
						if (childText.charCodeAt(0) < 1000) {
							preImage = childText.length + 2
							if (IsTextAlignRight) {
								doc.text(20 + getXOffset(columnInPdf + 1, columnsWidth) - textWidht * 3 - 4, 20 + y * 10, childText);
							} else {
								doc.text(20 + getXOffset(columnInPdf, columnsWidth), 20 + y * 10, childText);
							}
						}
						if (imgTxtData.length > 0) {
							for (var cNo = 0; cNo < imgTxtData.length; cNo++) {
								doc.addImage(imgTxtData[cNo], 'JPEG', 20 + getXOffset(columnInPdf, columnsWidth) + preImage + cNo * 2.5, 20 + y * 10 - 2.5, 2.5, 2.5);
							}
						}
					}

					columnInPdf = columnInPdf + 1;

				}

			}
			//last vertical line
			doc.line(20 + getXOffset(tRow.children.length - hiddenColumns.length, columnsWidth), 13, 20 + getXOffset(tRow.children.length - hiddenColumns.length, columnsWidth), 23 + (verticalHeight - 1) * 10);

			doc.line(18, 23 + y * 10, 20 + getXOffset(tRow.children.length - hiddenColumns.length, columnsWidth), 23 + y * 10);
			if (y >= 25) {
				doc.setDrawColor(0, 0, 0)
				nroPag++
				verticalHeight = Math.min((jQuery("#" + _self.grid.controlName + " tr").length - 1) - (nroPag - 1) * 26 + 1, 26)
				y = -1
				doc.addPage()
				//top horizontal line
				doc.line(18, 13, 20 + getXOffset(jQuery("#" + _self.grid.controlName + " tr")[0].children.length - hiddenColumns.length, columnsWidth), 13);
			}
		}
		
		isSD = OAT.isSD();
		
		if (OAT.isSafari() || (isSD)) { //for safari
			doc.output('dataurlnewwindow');
		} else  {
			doc.save(fileName + '.pdf');
		}
	}

	OAT.ExportToExcel = function (_self, fileName) {
		
		var table = '<table><tbody>'

		for (var i = 0; i < jQuery("#" + _self.grid.controlName + " tr").length; i++) {//for every row
			table = table + '<tr>';

			var tRow = jQuery("#" + _self.grid.controlName + " tr")[i];
			for (var j = 0; j < tRow.children.length; j++) {//for every cell in the row
				var childText;
				if (i === 0) {
					childText = tRow.children[j].getAttribute("title_v");
					if (childText === undefined) {
						childText = OAT.removeIconFont(tRow.children[j].textContent).trim();
					}
				} else {
					childText = tRow.children[j].getAttribute("title"); 
					//childText = OAT.removeIconFont(tRow.children[j].title/*.textContent*/).trim();
					if (childText === undefined) {
						childText = tRow.children[j].textContent;
					}
					/*if (((_self.grid.columns[j].getAttribute("dataType") == "date") || (_self.grid.columns[j].getAttribute("dataType") == "datetime")) 
						&& (OAT_JS.grid.gridData[UcId].rowsMetadata.defaultPicture.getAttribute("dateFormat") == "YMD"))
					{
						childText = '="' + childText + '"';
					}*/
				}
				
				
				
				childText = childText.replace(/\u00A0/g, " ")
				var hidden = tRow.children[j].getAttribute('hidden');
				if (tRow.children[j].style.display != "none") {
					if (hidden === null) {
						var rowSpan = tRow.children[j].getAttribute('rowspan');
						var colSpan = tRow.children[j].getAttribute('colspan');

						var styleString = "";
						if ((tRow.children[j].getAttribute("style") != undefined) && (tRow.children[j].getAttribute("style") != null)) {
							styleString = " style=\"" + tRow.children[j].getAttribute("style") + "\" ";
						}
						
						/*if (((_self.grid.columns[j].getAttribute("dataType") == "date") || (_self.grid.columns[j].getAttribute("dataType") == "datetime")) 
						&& (OAT_JS.grid.gridData[UcId].rowsMetadata.defaultPicture.getAttribute("dateFormat") == "YMD"))
						{
							if (_self.grid.columns[j].getAttribute("dataType") == "date")
								styleString = ' style="width:80px;" ';
							else
								styleString = ' style="width:140px;" ';
						}*/
						
						if ((rowSpan === null) && (colSpan === null)) {
							table = table + '<td ' + styleString + '>' + childText + '</td>';
						} else if (colSpan === null) {
							table = table + '<td ' + styleString + ' rowspan="' + rowSpan + '">' + childText + '</td>';
						} else if (rowSpan === null) {
							table = table + '<td ' + styleString + ' colspan="' + colSpan + '">' + childText + '</td>';
						} else {
							table = table + '<td ' + styleString + ' colspan="' + colSpan + '" rowspan="' + rowSpan + '">' + childText + '</td>';
						}
					}
				}
			}

			table = table + '</tr>';
		}


		table = table + '</tbody></table>';
		
		//add header for special characters 
		var header = '<head><meta http-equiv="Content-Type" content="text/html;charset=utf-8"></head><body>'
		table = header + table + '</body>'
		
		var dtltbl = table;
		
		isSD = OAT.isSD();
		
		
		if (OAT.isSafari() || (isSD)){
			window.open('data:application/vnd.ms-excel,' + encodeURIComponent(dtltbl));
		} else {
			return dtltbl;
		}


	}


	OAT.ExportToExcel2010 = function (_self, fileName, serverPagination, recordData, UcId) {


		function componentToHex(c) {
			var hex = c.toString(16);
			return hex.length == 1 ? "0" + hex : hex;
		}

		function rgbToHex(r, g, b) {
			return componentToHex(r) + componentToHex(g) + componentToHex(b);
		}



		dataTable = [];

		var rowsToAdd = jQuery("#" + _self.grid.controlName + " tr").length;
		if ((serverPagination != undefined) && (serverPagination)) {
			rowsToAdd = 1;
		}

		var hiddenColumns = []

		for (var i = 0; i < rowsToAdd; i++) {//for every row
			dataRow = [];

			var tRow = jQuery("#" + _self.grid.controlName + " tr")[i];
			for (var j = 0; j < tRow.children.length; j++) {//for every cell in the row
				var childText = tRow.children[j].textContent;
				var hidden = tRow.children[j].getAttribute('hidden');
				if (tRow.children[j].style.display != "none") {
					if (hidden === null) {
						var rowSpan = tRow.children[j].getAttribute('rowspan');
						var colSpan = tRow.children[j].getAttribute('colspan');

						var styleString = "";
						var cellObject = { value: childText };
						if ((tRow.children[j].getAttribute("style") != undefined) && (tRow.children[j].getAttribute("style") != null)) {
							var attributes = tRow.children[j].getAttribute("style").split(";");
							for (var at = 0; at < attributes.length; at++) {
								var detail = attributes[at].split(":");
								if (detail[0].replace(/^\s+|\s+$/g, '') === "color") {
									var rgb = detail[1].replace(/^\s+|\s+$/g, '');
									rgb = rgb.substring(4, rgb.length);
									rgb = rgb.substring(0, rgb.length - 1);
									var hex = rgbToHex(parseInt(rgb.split(",")[0]), parseInt(rgb.split(",")[1]), parseInt(rgb.split(",")[2]))
									cellObject.fontColor = hex;
								} else if (detail[0].replace(/^\s+|\s+$/g, '') === "text-align") {
									var alg = detail[1].replace(/^\s+|\s+$/g, '');
									cellObject.hAlign = alg;
								} else if (detail[0].replace(/^\s+|\s+$/g, '') === "font-style") {
									if (detail[1].replace(/^\s+|\s+$/g, '') === "italic") {
										cellObject.italic = 1;
									}
								} else if (detail[0].replace(/^\s+|\s+$/g, '') === "font-weight") {
									if (detail[1].replace(/^\s+|\s+$/g, '') === "bold") {
										cellObject.bold = 1;
									}
								} else if (detail[0].replace(/^\s+|\s+$/g, '') === "background-color") {
									var rgb = detail[1].replace(/^\s+|\s+$/g, '');
									rgb = rgb.substring(4, rgb.length);
									rgb = rgb.substring(0, rgb.length - 1);
									var hex = rgbToHex(parseInt(rgb.split(",")[0]), parseInt(rgb.split(",")[1]), parseInt(rgb.split(",")[2]))
									cellObject.fill = hex;
								}

							}
						}

						if ((rowSpan === null) && (colSpan === null)) {
							dataRow.push(cellObject)
						} else if (colSpan === null) {
							cellObject.rowSpan = parseInt(rowSpan);
							dataRow.push(cellObject)
						} else if (rowSpan === null) {
							cellObject.colSpan = parseInt(colSpan);
							dataRow.push(cellObject)
						} else {
							cellObject.colSpan = parseInt(colSpan);
							cellObject.rowSpan = parseInt(rowSpan);
							dataRow.push(cellObject)
						}
					}
				} else {
					hiddenColumns.push(j);
				}
			}

			dataTable.push(dataRow);
		}


		if ((serverPagination != undefined) && (serverPagination)) {
			for (var i = 0; i < recordData.length; i++) {
				dataRow = [];
				for (var j = 0; j < recordData[i].length; j++) {
					if (hiddenColumns.indexOf(j) == -1) {
						var childText = OAT.ApplyPictureValue(recordData[i][j], "", OAT_JS.grid.gridData[UcId].rowsMetadata.defaultPicture, OAT_JS.grid.gridData[UcId].rowsMetadata.forPivotCustomPicture[j]) /* Apply Picture */

						var td = OAT.Dom.create("td");

						td.setAttribute("title", childText);
						
						var cellvalue =  recordData[i][j]
						if (_self.grid.columnsDataType[j] == "date") {
							cellvalue = OAT.ApplyPictureValue(recordData[i][j], _self.grid.columnsDataType[j], OAT_JS.grid.gridData[UcId].rowsMetadata.defaultPicture, OAT_JS.grid.gridData[UcId].rowsMetadata.forPivotCustomPicture[j]) /* Apply Picture */
						}
						td = OAT.applyFormatValues(td, cellvalue, _self.grid.columnsDataType, j, OAT_JS.grid.gridData[UcId].rowsMetadata.formatValues, OAT_JS.grid.gridData[UcId].rowsMetadata.conditionalFormatsColumns, OAT_JS.grid.gridData[UcId].rowsMetadata.forPivotCustomFormat);

						//align numbers right
						if ( ((_self.grid.columnsDataType[j] != "character") && (_self.grid.columnsDataType[j] != "guid")) || (_self.grid.columnsDataType[j] === 'date')) {
							td.style.textAlign = "right";
						} else {
							//td.style.textAlign = "left";
						}
						
						
						
						
						var cellObject = { value: childText };
						
						if ( !isNaN(parseFloat(childText)) && (_self.grid.columnsDataType[j] != "character")
							 && (_self.grid.columnsDataType[j] != "date") && (_self.grid.columnsDataType[j] != "datetime") && (_self.grid.columnsDataType[j] != "guid") ) 
						{
							cellObject = { value: parseFloat(childText) + "" };	
						}
						
						if ((td.getAttribute("style") != undefined) && (td.getAttribute("style") != null)) {
							var attributes = td.getAttribute("style").split(";");
							for (var at = 0; at < attributes.length; at++) {
								var detail = attributes[at].split(":");
								if (detail[0].replace(/^\s+|\s+$/g, '') === "color") {
									var rgb = detail[1].replace(/^\s+|\s+$/g, '');
									rgb = rgb.substring(4, rgb.length);
									rgb = rgb.substring(0, rgb.length - 1);
									var hex = rgbToHex(parseInt(rgb.split(",")[0]), parseInt(rgb.split(",")[1]), parseInt(rgb.split(",")[2]))
									cellObject.fontColor = hex;
								} else if (detail[0].replace(/^\s+|\s+$/g, '') === "text-align") {
									var alg = detail[1].replace(/^\s+|\s+$/g, '');
									cellObject.hAlign = alg;
								} else if (detail[0].replace(/^\s+|\s+$/g, '') === "font-style") {
									if (detail[1].replace(/^\s+|\s+$/g, '') === "italic") {
										cellObject.italic = 1;
									}
								} else if (detail[0].replace(/^\s+|\s+$/g, '') === "font-weight") {
									if (detail[1].replace(/^\s+|\s+$/g, '') === "bold") {
										cellObject.bold = 1;
									}
								} else if (detail[0].replace(/^\s+|\s+$/g, '') === "background-color") {
									var rgb = detail[1].replace(/^\s+|\s+$/g, '');
									rgb = rgb.substring(4, rgb.length);
									rgb = rgb.substring(0, rgb.length - 1);
									var hex = rgbToHex(parseInt(rgb.split(",")[0]), parseInt(rgb.split(",")[1]), parseInt(rgb.split(",")[2]))
									cellObject.fill = hex;
								}

							}
						}

						if ((_self.grid.columnsDataType[j] == "real") || (_self.grid.columnsDataType[j] == "integer")){
							cellObject.formatCode = OAT_JS.grid.gridData[UcId].rowsMetadata.forPivotCustomPicture[j].replace(/Z/g,"#").replace(/9/g, "0")
						}
						if (_self.grid.columnsDataType[j] == "date"){
							if (OAT_JS.grid.gridData[UcId].rowsMetadata.forPivotCustomPicture[j] != undefined){ 
								 var datePicture = OAT_JS.grid.gridData[UcId].rowsMetadata.forPivotCustomPicture[j].trim()
								 var dateDefaultFormat = OAT_JS.grid.gridData[UcId].rowsMetadata.defaultPicture.getAttribute("dateFormat")
								 if (datePicture == "99/99/99")
								 {
								 	cellObject.formatCode = "mm/dd/yy"
									if (dateDefaultFormat == "DMY")
										cellObject.formatCode = "dd/mm/yy"
									if (dateDefaultFormat == "YMD")
										cellObject.formatCode = "yy/mm/dd"
								 }
								 if (datePicture == "99/99/9999"){
									cellObject.formatCode = "mm/dd/yyyy"
									if (dateDefaultFormat == "DMY")
										cellObject.formatCode = "dd/mm/yyyy"
									if (dateDefaultFormat == "YMD")
										cellObject.formatCode = "yyyy/mm/dd"
								 }
								 if (datePicture == "9999/99/99"){
									cellObject.formatCode = "yyyy/mm/dd"
									if (dateDefaultFormat == "YDM")
										cellObject.formatCode = "yyyy/dd/mm"
									if (dateDefaultFormat == "YMD")
										cellObject.formatCode = "yyyy/mm/dd"
								 }
							}
						}
						if (_self.grid.columnsDataType[j] == "datetime"){
							if (OAT_JS.grid.gridData[UcId].rowsMetadata.forPivotCustomPicture[j] != undefined){ 
								var datePicture = OAT_JS.grid.gridData[UcId].rowsMetadata.forPivotCustomPicture[j].trim().split(" ")
								var formatDatePicture = ""
								var dateTimeDefaultFormat = OAT_JS.grid.gridData[UcId].rowsMetadata.defaultPicture.getAttribute("dateFormat")
								if (datePicture[0] == "99/99/99")
								{
								 	formatDatePicture = "mm/dd/yy"
									if (dateTimeDefaultFormat == "DMY")
										cellObject.formatCode = "dd/mm/yy"
									if (dateTimeDefaultFormat == "YMD")
										cellObject.formatCode = "yy/mm/dd"
								}
								if (datePicture[0] == "99/99/9999"){
									formatDatePicture = "mm/dd/yyyy"
									if (dateTimeDefaultFormat == "DMY")
										cellObject.formatCode = "dd/mm/yyyy"
									if (dateTimeDefaultFormat == "YMD")
										cellObject.formatCode = "yyyy/mm/dd"
								}
								if (datePicture[0] == "9999/99/99"){
									formatDatePicture = "yyyy/mm/dd"
									if (dateTimeDefaultFormat == "YDM")
										cellObject.formatCode = "yyyy/dd/mm"
									if (dateTimeDefaultFormat == "YMD")
										cellObject.formatCode = "yyyy/mm/dd"
								}
								
								/*if (datePicture[1] == "99")
								{
									cellObject.formatCode = formatDatePicture + " hh"
								}
								if (datePicture[1] == "99:99")
								{
									cellObject.formatCode = formatDatePicture + " hh:mm"									
								}
								if (datePicture[1] == "99:99:99")
								{
									cellObject.formatCode = formatDatePicture + " hh:mm:ss"		
								}								
								if (datePicture[1] == "99:99:99.999")
								{
									cellObject.formatCode = formatDatePicture + " hh:mm:ss"
								}*/							
							}
						}

						cellObject.genexusType = _self.grid.columnsDataType[j];
						cellObject.genexusPicture = OAT_JS.grid.gridData[UcId].rowsMetadata.forPivotCustomPicture[j];

						dataRow.push(cellObject)
					}
				}
				dataTable.push(dataRow);
			}
		}

		var sheet = xlsx({
			creator: 'Genexus',
			lastModifiedBy: 'Genexus',
			pivot: false,
			worksheets: [{
				data: dataTable,
				name: 'Sheet 1'
			}]
		});
		
		isSD = OAT.isSD();
				
		if (OAT.isSafari() || (isSD)){ //for safari
			window.location = sheet.href();
		} else  {
			//window.location = sheet.href();
			var byteCharacters = atob(sheet.base64);
			function charCodeFromCharacter(c) {
				return c.charCodeAt(0);
			}

			var byteNumbers = Array.prototype.map.call(byteCharacters, charCodeFromCharacter);
			var uint8Data = new Uint8Array(byteNumbers);

			var blob = new Blob([uint8Data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
			saveAs(blob, fileName + ".xlsx");
		} 
	}

	OAT.ExportToXML = function (self, fileName) {
		var hiddenColumns = [];
		for (var i = 0; i < 1; i++) {
			var tRow = jQuery("#" + self.grid.controlName + " tr")[i];
			for (var j = 0; j < tRow.children.length; j++) {
				if (tRow.children[j].style.display == "none") {
					hiddenColumns.push(j);
				}
			}
		}

		var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><EXPORT format="XML" type="flat">';
		xml = xml + '<METADATA>';
		for (var iCV = 0; iCV < self.grid.columns.length; iCV++) {
			if (hiddenColumns.indexOf(iCV) == -1) {
				var position = 'row';

				xml = xml + '<OLAPDimension ';
				xml = xml + 'name="' + self.grid.columns[iCV].getAttribute("dataField") + '" ';
				xml = xml + 'label="' + self.grid.columns[iCV].getAttribute("displayName") + '" ';
				xml = xml + 'picture="' + self.grid.columns[iCV].getAttribute("picture") + '" ';
				xml = xml + 'datatype="' + self.grid.columns[iCV].getAttribute("dataType") + '" ';
				xml = xml + 'showAll="false" ';
				xml = xml + 'position="' + position + '">';


				var previusValue = [];
				for (var i = 0; i < self.grid.rows.length; i++) {
					if (previusValue.findIndex(self.grid.rows[i].cells[iCV].options.value) === -1) {
						xml = xml + '<VALUE CHECKED=';
						if (self.grid.conditions[iCV].blackList.findIndex(self.grid.rows[i].cells[iCV].options.value) === -1) {
							previusValue.push(self.grid.rows[i].cells[iCV].options.value);
							xml = xml + '"true"';
						} else {
							xml = xml + '"false"';
						}
						xml = xml + ' COLLAPSED="false">'

						/*Set the value with the original format, for numeric values*/
						var valuetoString = self.grid.rows[i].cells[iCV].options.value;
						if (!isNaN(parseFloat(self.grid.rows[i].cells[iCV].options.value))) {
							var numRecord = parseFloat(self.grid.rows[i].cells[iCV].options.value);
							if (data != undefined) {
								for (var di = 0; di < data.length; di++) {
									if (data[di] != undefined) {
										for (var dj = 0; dj < data[di].length; dj++) {
											if ((parseFloat(data[di][dj]) != undefined) && (!isNaN(data[di][dj]))) {
												if (parseFloat(data[di][dj]) === parseFloat(self.grid.rows[i].cells[iCV].options.value)) {
													valuetoString = data[di][dj];
												}
											}
										}
									}
								}
							}
						}

						xml = xml + valuetoString + '</VALUE>';
					}
				}

				xml = xml + '</OLAPDimension>';
			}
		}

		for (var iCV = 0; iCV < measures.length; iCV++) {
			xml = xml + '<OLAPMeasure ';
			xml = xml + 'name="' + measures[iCV].getAttribute("dataField") + '" ';
			xml = xml + 'label="' + measures[iCV].getAttribute("displayName") + '" ';
			xml = xml + 'picture="' + measures[iCV].getAttribute("picture") + '" ';
			xml = xml + 'datatype="' + measures[iCV].getAttribute("dataType") + '" ';
			xml = xml + 'showAll="true" ';
			xml = xml + 'aggregator="sum"/>';
		}

		xml = xml + '</METADATA>';

		xml = xml + '<FLATDATA>';
		if (data != undefined) {
			for (var i = 0; i < data.length; i++) {
				xml = xml + '<ROW ';
				for (var iCV = 0; iCV < data[0].length; iCV++) {
					if (hiddenColumns.indexOf(iCV) == -1) {
						var valuetoString = data[i][iCV];
						xml = xml + self.grid.columns[iCV].getAttribute("dataField") + '="' + valuetoString + '" ';
					}
				}
				xml = xml + '/>';
			}
		} else {
			for (var i = 0; i < self.grid.rows.length; i++) {
				xml = xml + '<ROW ';


				for (var iCV = 0; iCV < self.grid.rows[0].cells.length; iCV++) {
					/*Set the value with the original format, for numeric values*/
					var valuetoString = "";
					valuetoString = self.grid.rows[i].cells[iCV].options.value;
					if (!isNaN(parseFloat(self.grid.rows[i].cells[iCV].options.value))) {
						var numRecord = parseFloat(self.grid.rows[i].cells[iCV].options.value);
						if (data != undefined) {
							for (var di = 0; di < data.length; di++) {
								if (data[di] != undefined) {
									for (var dj = 0; dj < data[di].length; dj++) {
										if ((parseFloat(data[di][dj]) != undefined) && (!isNaN(data[di][dj]))) {
											if (parseFloat(data[di][dj]) === parseFloat(self.grid.rows[i].cells[iCV].options.value)) {
												valuetoString = data[di][dj];
											}
										}
									}
								}
							}
						}
					}
					xml = xml + self.grid.columns[iCV].getAttribute("dataField") + '="' + valuetoString + '" ';
				}

				xml = xml + '/>'
			}
		}
		xml = xml + '</FLATDATA>';


		xml = xml + '<HTML>';

		xml = xml + '<HEAD>';
		xml = xml + '<META content="text/html; charset=utf-8" http-equiv="Content-Type"/>';

		xml = xml + '<STYLE>';

		xml = xml + '.odd {background-color: #FEFEFE; font-family: Verdana; font-size: 10pt;}\n';
		xml = xml + '.event {background-color: #EBEBEB; font-family: Verdana; font-size: 10pt;}\n';
		xml = xml + '.even {background-color: #FEFEFE;	font-weight: normal; font-family: Verdana; font-size: 10pt;	padding: 5px; }\n';
		xml = xml + 'tr {border-left: 1px solid #BBBBBB; border-right: 1px solid #BBBBBB; line-height: 22px;}\n';
		xml = xml + 'table {border-collapse: collapse;}\n'

		xml = xml + '</STYLE>';
		xml = xml + '</HEAD>';
		xml = xml + '<BODY>';

		for (var i = 0; i < jQuery("#" + self.grid.controlName + " tr").length; i++) {//for every row
			xml = xml + '<TR>';

			var tRow = jQuery("#" + self.grid.controlName + " tr")[i];
			for (var j = 0; j < tRow.children.length; j++) {//for every cell in the row
				var childText = OAT.removeIconFont(tRow.children[j].textContent).trim();
				var hidden = tRow.children[j].getAttribute('hidden');
				if (tRow.children[j].style.display != "none") {
					if (hidden === null) {
						var rowSpan = tRow.children[j].getAttribute('rowspan');
						var colSpan = tRow.children[j].getAttribute('colspan');

						var styleString = "";
						if ((tRow.children[j].getAttribute("style") != undefined) && (tRow.children[j].getAttribute("style") != null)) {
							styleString = " style=\"" + tRow.children[j].getAttribute("style") + "\" ";
						}

						var classString = "";
						if ((tRow.getAttribute("class") != undefined) && (tRow.getAttribute("class") != null)) {
							classString = " class=\"" + tRow.getAttribute("class") + "\" ";
						}

						if ((rowSpan === null) && (colSpan === null)) {
							xml = xml + '<TD ' + classString + ' ' + styleString + ' >' + childText + '</TD>';
						} else if (colSpan === null) {
							xml = xml + '<TD ' + classString + ' ' + styleString + ' rowspan="' + rowSpan + '">' + childText + '</TD>';
						} else if (rowSpan === null) {
							xml = xml + '<TD ' + classString + ' ' + styleString + ' colspan="' + colSpan + '">' + childText + '</TD>';
						} else {
							xml = xml + '<TD ' + classString + ' ' + styleString + ' colspan="' + colSpan + '" rowspan="' + rowSpan + '">' + childText + '</TD>';
						}
					}
				}
			}

			xml = xml + '</TR>';
		}


		xml = xml + '</BODY>';
		xml = xml + '</HTML>';


		xml = xml + "</EXPORT>";

		var isSD = OAT.isSD();
		

		
			xml = xml.replace(/\&/g, "&amp;");
			if ((OAT.isSafari()) || (isSD)) { //for safari			
				window.open('data:text/xml,' + encodeURIComponent(xml));
			} else {
				var blob = new Blob([xml], { type: "text/xml" });
				saveAs(blob, fileName + ".xml");
			}
		
	}


	OAT.SaveStateWhenServerPaging = function (self, UcId) {
		localStorage.setItem(OAT.getURL() + self.grid.controlName + self.grid.query, JSON.stringify({
			pageSize: self.rowsPerPage,
			dataFieldOrder: self.dataFieldOrder,
			orderType: self.orderType,
			filters: self.filterInfo,
			blackLists: self.blackLists,
			columnVisible: self.columnVisible,
			columnDataField: self.columnDataField
		}));
	}

	OAT.getStateWhenServingPaging = function (controlName, queryName) {
		return JSON.parse(localStorage.getItem(OAT.getURL() + controlName + queryName));
	}




	OAT.getState = function (grid, actualPageSize) {
		if (typeof JSON.retrocycle !== 'function') {
			JSON.retrocycle = function retrocycle($) {
				'use strict';

				var px =
					/^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

				(function rez(value) {

					var i, item, name, path;

					if (value && typeof value === 'object') {
						if (Object.prototype.toString.apply(value) === '[object Array]') {
							for (i = 0; i < value.length; i += 1) {
								item = value[i];
								if (item && typeof item === 'object') {
									path = item.$ref;
									if (typeof path === 'string' && px.test(path)) {
										value[i] = eval(path);
									} else {
										rez(item);
									}
								}
							}
						} else {
							for (name in value) {
								if (typeof value[name] === 'object') {
									item = value[name];
									if (item) {
										path = item.$ref;
										if (typeof path === 'string' && px.test(path)) {
											value[name] = eval(path);
										} else {
											rez(item);
										}
									}
								}
							}
						}
					}
				}($));
				return $;
			};
		}
		var retrievedObject = localStorage.getItem(OAT.getURL() + grid.controlName + grid.query);
		var oldState = JSON.retrocycle(JSON.parse(retrievedObject));

		if ((oldState != null) && ((oldState.rowsPerPage + " ") == (actualPageSize + " "))) {

			for (var tC = 0; tC < grid.columnsDataType.length; tC++) {
				grid.header.cells[tC].html.style.display = oldState.columnDisplay[tC];
				var numCol = grid.columnsDataType.length - 1 - tC;
				var j = 0;
				for (j = 0; j < grid.rows.length; j++) {
					grid.rows[j].cells[numCol].html.style.display = oldState.columnDisplay[tC];
				}
			}

			grid.conditions = oldState.conditions;
			grid.rowsPerPage = oldState.rowsPerPage;
			return true;
		} else
			return false;

	}

	OAT.SaveMetadata = function (metaDataString, key) {
		try {
			if (!!window.localStorage) {
				localStorage.removeItem(OAT.getURL() + key);
				localStorage.setItem(OAT.getURL() + key, metaDataString);
			}
		} catch (error) {

		}
	}

	OAT.GetSavedMetadata = function (key) {
		try {
			if (localStorage.getItem(OAT.getURL() + key) != null) {
				var mdata = localStorage.getItem(OAT.getURL() + key);
				if ((mdata != undefined) && (mdata != null)) {
					return mdata;
				}
			}
		} catch (error) {
			return "";
		}
		return ""
	}


	try {
		OAT.Loader.featureLoaded("grid");
	} catch (ERROR) {

	}