//OAT_IMPL file


	this.contains = function (a, obj) {
		for (var i = 0; i < a.length; i++) {
			if (a[i] === obj) {
				return i;
			}
		}
		return -1;
	}

if (typeof exports != "undefined") {
	
	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.renderJSPivot = void 0;
	exports.setPageDataForPivotTable = void 0;
	exports.setAttributeValuesForPivotTable = void 0;
	exports.setPivottableDataCalculation = void 0;
	exports.setDataSynForPivotTable = void 0;
	exports.setPageDataForTable = void 0;
	exports.setAttributeForTable = void 0;
	exports.setDataSynForTable = void 0;
	exports.getDataXML = void 0;
	exports.getFilteredDataXML = void 0;
	
}
	
	function renderJSPivot(pivotParams, QueryViewerCollection, translations, qViewer) {
		if (pivotParams.RealType != "Table") {
			pivotParams.ServerPaging = false;
		}
		if (pivotParams.RealType == "Table") {
			pivotParams.ServerPagingPivot = false;
			if (QueryViewerCollection.AutoRefreshGroup == "") {//if (qv.collection[pivotParams.UcId].AutoRefreshGroup == "") {
				jQuery(".oat_winrect_container").remove()
			}
		}
		OAT.Dom.attach(pivotParams.container, "mousemove", OAT.Drag.move);
	 	OAT.Dom.attach(pivotParams.container, "mouseup", OAT.Drag.up);
		OAT.Dom.attach(pivotParams.container, "mousemove", OAT.GhostDragData.move);
		OAT.Dom.attach(pivotParams.container, "mouseup", OAT.GhostDragData.up);
		if ((pivotParams.RememberLayout) && (pivotParams.ServerPaging) && (pivotParams.RealType != "PivotTable")) {
			var state = OAT.getStateWhenServingPaging(pivotParams.UcId + '_' + pivotParams.ObjectName.replace(/\./g, ""), pivotParams.ObjectName.replace(/\./g, ""))
			if (!state) {
				renderJSPivotInter(pivotParams, QueryViewerCollection,translations, null, qViewer)
			} else {
				var pageValue = 1;
				if (state.pageSize == "") { state.pageSize = undefined; pageValue = 0; }
				
				pivotParams.previousDataFieldOrder = state.dataFieldOrder;
				pivotParams.orderType = state.orderType;
				renderJSPivotInter(pivotParams, QueryViewerCollection,translations, state, qViewer)
			}
		} else {
			if (pivotParams.RealType != "Table") {
				renderJSPivotInter(pivotParams, QueryViewerCollection,translations, null, qViewer)
			} else {

				pivotParams.customFilterInfo = "";
				var xmlDoc = jQuery.parseXML(pivotParams.metadata);
				var columns = xmlDoc.getElementsByTagName("OLAPDimension");

				var withOrderCustom = false
				var dataFieldOrder = ""
				var orderType = ""

				for (var u = 0; u < columns.length; u++) {
					var dataField = columns[u].getAttribute("dataField")

					var includeValues = []; //the only values to show
					var applyFilter = false;
					for (var h = 0; h < columns[u].childNodes.length; h++) {
						if ((columns[u].childNodes[h] != undefined) &&
							(columns[u].childNodes[h].localName != undefined) &&
							(columns[u].childNodes[h].localName === "include")) {
							applyFilter = true;
							for (var n = 0; n < columns[u].childNodes[h].childNodes.length; n++) {
								if ((columns[u].childNodes[h].childNodes[n].localName != null) &&
									(columns[u].childNodes[h].childNodes[n].localName.toLowerCase() === "value")) {
									includeValues.push(columns[u].childNodes[h].childNodes[n].textContent);
								}
							}
						}
					}


					if (!withOrderCustom) {
						if ((columns[u].getAttribute("order") != undefined) && (columns[u].getAttribute("order") != "")) {
							dataFieldOrder = columns[u].getAttribute("dataField")
							orderType = (columns[u].getAttribute("order") == "descending") ? "Descending" : "Ascending";
							withOrderCustom = true//(columns[u].getAttribute("order") == "custom")  
						}
					}


					if (applyFilter) {

						var res = QueryViewerCollection[pivotParams.UcId].getAttributeValuesSync([columns[u].getAttribute("dataField"), 1, 0, ""]);
						var res = JSON.parse(res);
						var realValues = res.NotNullValues;
						var realIncludeValues = [];
						for (var j = 0; j < includeValues.length; j++) {
							for (var h = 0; h < realValues.length; h++) {
								if (realValues[h].trimpivot() == includeValues[j].trimpivot()) {
									realIncludeValues.push(realValues[h])
									break;
								}
							}
						}


						if (pivotParams.customFilterInfo == "") {
							pivotParams.customFilterInfo = [];
						}
						var obj = {
							DataField: columns[u].getAttribute("dataField"),
							NotNullValues: {
								DefaultAction: "Exclude",
								Excluded: "",
								Included: realIncludeValues
							},
							NullIncluded: true
						}
						pivotParams.customFilterInfo.push(obj)


					}
				}

				/*if (pivotParams.ServerPaging && (pivotParams.customFilterInfo != "" || dataFieldOrder != "")) {
					QueryViewerCollection[pivotParams.UcId].getPageDataForTable((function (resXML) {
						pivotParams.data = resXML;
						renderJSPivotInter(pivotParams, QueryViewerCollection, null, queryself)
					}).closure(this), [1, pivotParams.PageSize, true, dataFieldOrder, orderType, pivotParams.customFilterInfo, false]);
				} else {*/
					renderJSPivotInter(pivotParams, QueryViewerCollection, translations, null, qViewer)
				//}

			}
		}
	}

if (typeof exports != "undefined") {
	exports.renderJSPivot = renderJSPivot;
}


//PIVOT TABLE
	function setPageDataForPivotTable(oat_element, resXML){
		oat_element.setPageDataForPivotTable(resXML)
	}


if (typeof exports != "undefined") {
	exports.setPageDataForPivotTable = setPageDataForPivotTable;
}

function setAttributeValuesForPivotTable(oat_element, resJSON){
		oat_element.setAttributeValuesForPivotTable(resJSON);
	}

if (typeof exports != "undefined") {
	exports.setAttributeValuesForPivotTable = setAttributeValuesForPivotTable;
}

function setPivottableDataCalculation(oat_element, resText){
		oat_element.setPivottableDataCalculation(resText)
	}

if (typeof exports != "undefined") {
	exports.setPivottableDataCalculation = setPivottableDataCalculation;
}

function setDataSynForPivotTable(oat_element, result){
		oat_element.setDataSynForPivotTable(result)
	}

if (typeof exports != "undefined") {
	exports.setDataSynForPivotTable = setDataSynForPivotTable;
}

//TABLE
	function setPageDataForTable(oat_element, resXML){
		oat_element.setPageDataForTable(resXML)
	}


if (typeof exports != "undefined") {
	exports.setPageDataForTable = setPageDataForTable;
}


	function setAttributeForTable(oat_element, resJSON){
		oat_element.setAttributeForTable(resJSON)
	}


if (typeof exports != "undefined") {
	exports.setAttributeForTable = setAttributeForTable;
}


	function setDataSynForTable(oat_element, result){
		oat_element.setDataSynForTable(result)
	}

if (typeof exports != "undefined") {
	exports.setDataSynForTable = setDataSynForTable;
}

//EVENTS
	function getDataXML(oat_element, serverData){
		var oat_element_dataxml = oat_element.getDataXML(serverData)
		oat_element.EventForDataXMLRequest(oat_element.IdForQueryViewerCollection, oat_element_dataxml)
	}

if (typeof exports != "undefined") {
	exports.getDataXML = getDataXML;
}

	function getFilteredDataXML(oat_element, serverData){
		var oat_element_dataxml = oat_element.getFilteredDataXML(serverData)
		oat_element.EventForFilteredDataXMLRequest(oat_element.IdForQueryViewerCollection, oat_element_dataxml)
	}

if (typeof exports != "undefined") {
	exports.getFilteredDataXML = getFilteredDataXML;
}



	var renderJSPivotInter = function (pivotParams, QueryViewerCollection, translations, state, queryself) {
		var type = pivotParams.RealType
		var container = pivotParams.container
		var page = pivotParams.page
		var content = pivotParams.content
		var metadata = pivotParams.metadata
		renderJSPivotInter.dataString = pivotParams.data
		var queryName = pivotParams.ObjectName
		var controlName = pivotParams.ControlName
		var pageSize = parseInt(pivotParams.PageSize)
		var autoResize = pivotParams.AutoResize
		var DisableColumnSort = pivotParams.DisableColumnSort
		var UcId = pivotParams.UcId
		var rememberLayout = pivotParams.RememberLayout
		renderJSPivotInter.pivotParams = pivotParams
		renderJSPivotInter.serverPaging = pivotParams.ServerPaging
		renderJSPivotInter.previousDataFieldOrder = pivotParams.previousDataFieldOrder;
		renderJSPivotInter.previousOrderType = pivotParams.orderType;
		renderJSPivotInter.previousFilters = (state) ? state.filters : undefined;
		renderJSPivotInter.previousColumnVisible = (state) ? state.columnVisible : undefined; renderJSPivotInter.initialColumnVisible = []
		renderJSPivotInter.previousState = state
		renderJSPivotInter.customFilterInfo = pivotParams.customFilterInfo
		renderJSPivotInter.gridCacheSize = pivotParams.ServerPagingCacheSize;
		renderJSPivotInter.hasShowValuesAs = (pivotParams.metadata.indexOf("showValuesAs") > 0)

		//replace OLAPMeasure for OLAPDimensions
		if (pivotParams.RealType == "Table"){
			metadata = metadata.replace(/\<OLAPMeasure/g, '<OLAPMeasure axis="" isMeasure="true" '); 
			metadata = metadata.replace(/OLAPMeasure/g, "OLAPDimension")
		} 
		//replace OLAPMeasure for OLAPDimensions when isComponent=true
		if (pivotParams.RealType != "Table"){
			
			
			
			var splitMetadata = metadata.split('<OLAPMeasure');
			
			
			var changeMetadata = splitMetadata[0];
			
			for (var t=1; t < splitMetadata.length; t++)
			{
				var line = "";
				
				if (splitMetadata[t].indexOf('isComponent="true"') > -1)
				{
					line = '<OLAPDimension' + splitMetadata[t].replace(/OLAPMeasure/g, "OLAPDimension")
				}
				else
				{
					line = '<OLAPMeasure' + splitMetadata[t]
				}
				
				
				changeMetadata = changeMetadata + line
			}
			metadata = changeMetadata
		}
		
		var ShowMeasuresAsRows = (pivotParams.ShowDataLabelsIn == "Rows")
		if ((rememberLayout == undefined) || (rememberLayout == "false")) {
			rememberLayout = false
		}
		//recover metadata when metadata error, is there no metadata save it
		try {
			if (rememberLayout) {
				var savedMd = OAT.GetSavedMetadata(container.id + queryName + UcId + controlName + type + "metadata")
				if (savedMd === "") {
					OAT.SaveMetadata(metadata, container.id + queryName + UcId + controlName + type + "metadata")
				} else {
					var t1 = savedMd.split('OLAPDimension').length === metadata.split('OLAPDimension').length;
					var t2 = savedMd.split('OLAPMeasure').length === metadata.split('OLAPMeasure').length;
					var t3 = savedMd.split('name').length === metadata.split('name').length;
					var t4 = true
					if (t1 && t2 && t3) {
						for (var i = 1; i < savedMd.split('name').length; i++) {
							var name1 = savedMd.split('name')[i].substring(2, savedMd.split('name')[i].length).split("\"")[0];
							var name2 = metadata.split('name')[i].substring(2, metadata.split('name')[i].length).split("\"")[0];
							if (name1 != name2) {
								t4 = false;
							}
						}
					}
					if (!(t1 && t2 && t3 && t4)) {
						if (OAT.isIE()) {
							rememberLayout = false
						} else {
							try {
								if (!!window.localStorage) {
									localStorage.removeItem(OAT.getURL() + container.id + queryName + UcId + controlName + type + "metadata");
									localStorage.removeItem(OAT.getURL() + queryName + UcId);
								}
							} catch (ERROR) {

							}
						}
					}
				}
			}
		} catch (ERROR) {

		}
		var fullXmlData = jQuery.parseXML(metadata); //metada for formulas and hide columns
		renderJSPivotInter.InitMetadata = {};
		renderJSPivotInter.InitMetadata.Metadata = metadata
		renderJSPivotInter.InitMetadata.DataString = renderJSPivotInter.dataString;
		renderJSPivotInter.InitMetadata.Dimensions = []
		renderJSPivotInter.InitMetadata.Conditions = []
		renderJSPivotInter.InitMetadata.DataFields = []
		renderJSPivotInter.InitMetadata.RowsPerPage = pageSize
		var initColumns = fullXmlData.getElementsByTagName("OLAPDimension");
		for (var i = 0; i < initColumns.length; i++) {
			var objectColumn = {}
			objectColumn.name = initColumns[i].getAttribute("name")
			objectColumn.displayName = initColumns[i].getAttribute("displayName")
			objectColumn.description = initColumns[i].getAttribute("description")
			objectColumn.dataField = initColumns[i].getAttribute("dataField")
			
			/*calculate default and valid position*/
			
			var validPositions = ""
			
			var metadatavisible = initColumns[i].getAttribute("visible")
			if (metadatavisible == "Never"){
				objectColumn.defaultPosition = "hidden"
				objectColumn.Visible = false
			} else {
				if (metadatavisible == "No"){
					objectColumn.Visible = false
				} else {
					objectColumn.Visible = true
				}
				objectColumn.defaultPosition = initColumns[i].getAttribute("axis")
				var j = 0;
				validPositions = (initColumns[i].getAttribute("canDragToPages") == "true") ? "filters;" : ""
				validPositions = validPositions + "rows;columns;hidden"
			
			}
			
			objectColumn.validPosition = validPositions
			renderJSPivotInter.InitMetadata.Dimensions.push(objectColumn)
			renderJSPivotInter.InitMetadata.Conditions.push("")
			renderJSPivotInter.InitMetadata.DataFields.push(objectColumn.dataField)
		}
		renderJSPivotInter.InitMetadata.Measures = []
		var initMeasures = fullXmlData.getElementsByTagName("OLAPMeasure");
		for (var i = 0; i < initMeasures.length; i++) {
			var measureObject = {}
			measureObject.name = initMeasures[i].attributes.getNamedItem("name").nodeValue;
			measureObject.displayName = initMeasures[i].attributes.getNamedItem("displayName").nodeValue;
			measureObject.dataField = initMeasures[i].attributes.getNamedItem("dataField").nodeValue;
			measureObject.dataType = initMeasures[i].attributes.getNamedItem("dataType").nodeValue;
			
			measureObject.Visible = initMeasures[i].attributes.getNamedItem("visible").nodeValue.toLowerCase() == "yes"
			
			if (initMeasures[i].attributes.getNamedItem("visible").nodeValue.toLowerCase() != "never") {
				measureObject.defaultPosition = (initMeasures[i].attributes.getNamedItem("axis")) ? initMeasures[i].attributes.getNamedItem("axis") : "data"
				measureObject.validPosition = "data;hidden"
			} else {
				measureObject.defaultPosition = "hidden"
				measureObject.validPosition = "hidden"
			}
			
			//measureObject.Visible = measureObject.defaultPosition != "hidden"
			renderJSPivotInter.InitMetadata.Measures.push(measureObject)
		}
		renderJSPivotInter.InitMetadata.DimensionPosition = []

		//parse metadata
		renderJSPivotInter.HideDataFilds = []

		var result;
		var previousState = OATgetState(queryName, UcId.replace(/,/g, "").replace(/\./g, ""))
		if ((rememberLayout) && (previousState != undefined)) {
			var hideDimension = [];
			for (var i = 0; i < previousState.Dimensions.length; i++) {
				if (!previousState.Dimensions[i].Visible) {
					hideDimension.push(previousState.Dimensions[i].dataField)
				}
			}
			var hideMeasures = [];
			for (var i = 0; i < previousState.Measures.length; i++) {
				if (!previousState.Measures[i].Visible) {
					hideMeasures.push(previousState.Measures[i].dataField)
				}
			}

			renderJSPivotInter.InitMetadata.Measures = previousState.Measures
			renderJSPivotInter.InitMetadata.Dimensions = previousState.Dimensions
			renderJSPivotInter.InitMetadata.DataFields = previousState.DataFields
			renderJSPivotInter.InitMetadata.DimensionPosition = previousState.DimensionPosition

			if (pivotParams.ServerPagingPivot) {
				renderJSPivotInter.InitMetadata.Conditions = previousState.Conditions
			}

			result = OATParseMetadata(metadata, hideDimension, hideMeasures, pivotParams.ServerPagingPivot, translations)
		} else {
			var hideDimension = [];
			for (var i = 0; i < renderJSPivotInter.InitMetadata.Dimensions.length; i++) {
				if (!renderJSPivotInter.InitMetadata.Dimensions[i].Visible) {
					hideDimension.push(renderJSPivotInter.InitMetadata.Dimensions[i].dataField)
				}
			}

			var hideMeasures = [];
			for (var i = 0; i < renderJSPivotInter.InitMetadata.Measures.length; i++) {
				if (!renderJSPivotInter.InitMetadata.Measures[i].Visible) {
					hideMeasures.push(renderJSPivotInter.InitMetadata.Measures[i].dataField)
				}
			}
			if ((pivotParams.RealType == "Table")) {
				result = OATParseMetadata(metadata, [], hideMeasures, pivotParams.ServerPagingPivot, translations)
			} else {
				result = OATParseMetadata(metadata, hideDimension, hideMeasures, pivotParams.ServerPagingPivot, translations)
			}
		}
		
		renderJSPivotInter.InitMetadata.GrandTotalVisibility = { TotalForRows: pivotParams.TotalForRows, TotalForColumns: pivotParams.TotalForColumns }
		

		metadata = result[0]; var orderFildsHidden = result[1]; var nameFildsHidden = result[3]; renderJSPivotInter.HideDataFilds = result[2];


		var xmlDoc = jQuery.parseXML(metadata);

		var defaultPicture = xmlDoc.childNodes[0];

		renderJSPivotInter.IdForQueryViewerCollection = UcId;
		UcId = UcId.replace(/,/g, "").replace(/\./g, "")
		renderJSPivotInter.UcId = UcId;
		renderJSPivotInter.pivotDiv = container.id;
		renderJSPivotInter.query = queryName;
		renderJSPivotInter.control = controlName;
		renderJSPivotInter.pageSize = pageSize;
		renderJSPivotInter.autoResize = autoResize;
		renderJSPivotInter.disableColumnSort = DisableColumnSort;
		renderJSPivotInter.header = [];
		renderJSPivotInter.data = [];
		renderJSPivotInter.columnNumbers = [];
		renderJSPivotInter.rowNumbers = [];
		renderJSPivotInter.filterNumbers = [];
		renderJSPivotInter.cols = 0;
		renderJSPivotInter.conditionalFormats = [];
		renderJSPivotInter.conditionalFormatsColumns = []; //conditional format for columns - needed?
		renderJSPivotInter.formatValues = [];
		renderJSPivotInter.formatValuesMeasures = [];

		renderJSPivotInter.forPivotFormatValues = [];
		renderJSPivotInter.forPivotFormats = [];
		renderJSPivotInter.forPivotCustomPicture = [];
		renderJSPivotInter.forPivotCustomFormat = [];


		//Columns and measures names
		var columns = xmlDoc.getElementsByTagName("OLAPDimension");
		var columnNames = [];
		var rowNames = [];
		var filterNames = [];
		renderJSPivotInter.measures = xmlDoc.getElementsByTagName("OLAPMeasure");

		var columnsDataType = [];
		var measureNames = []; var measuresNamesWidthHidden = [];
		var j = 0;
		var k = 0;
		var preHeader = [];
		var formulaInfo = { measureFormula: [], itemPosition: [] }
		//handle pictures
		var orderFilds = [];
		var datePictures = [];
		var intPictures = [];
		var dateFields = [];
		var intFields = [];

		if ((pivotParams.RealType == "Table")) {
			for (var i = 0; i < columns.length; i++) {
				renderJSPivotInter.initialColumnVisible[i] = true
				if (columns[i].attributes.getNamedItem("visible").nodeValue != "Yes") {
					renderJSPivotInter.initialColumnVisible[i] = false
				}
			}
		}

		//get columns
		for (var i = 0; i < columns.length; i++) {

			if ((columns[i].attributes.getNamedItem("axis").nodeValue == "Rows")
				|| (pivotParams.RealType == "Table") || (renderJSPivotInter.InitMetadata.Dimensions[i].validPosition == "")) {
				columnNames[j] = columns[i].attributes.getNamedItem("displayName").nodeValue;
				preHeader[i] = columnNames[j];
				j++;
			}
			if (columns[i].attributes.getNamedItem("axis").nodeValue == "Columns") {
				rowNames[k] = columns[i].attributes.getNamedItem("displayName").nodeValue;
				preHeader[i] = rowNames[k];
				k++;
			}
			if (columns[i].attributes.getNamedItem("axis").nodeValue == "Pages") {
				filterNames[k] = columns[i].attributes.getNamedItem("displayName").nodeValue;
				preHeader[i] = filterNames[k];
				k++;
			}
			if (pivotParams.ServerPagingPivot && (columns[i].attributes.getNamedItem("axis").nodeValue == "")) {
				for (var t = 0; t < renderJSPivotInter.InitMetadata.Dimensions.length; t++) {
					if (renderJSPivotInter.InitMetadata.Dimensions[t].dataField == columns[i].attributes.getNamedItem("dataField").nodeValue) {
						if (renderJSPivotInter.InitMetadata.Dimensions[t].Visible) {
							columnNames[j] = columns[i].attributes.getNamedItem("displayName").nodeValue;
							j++;
							preHeader[i] = columns[i].attributes.getNamedItem("displayName").nodeValue;
						}
					}
				}
			}
			
			columnsDataType[i] = columns[i].attributes.getNamedItem("dataType").nodeValue;
			//handle formats values
			if (columns[i].childNodes.length > 0) {
				if (columns[i].childNodes != null) {
					for (var m = 0; m < columns[i].childNodes.length; m++) {
						if (columns[i].childNodes[m].localName == "formatValues") {
							for (var n = 0; n < columns[i].childNodes[m].childNodes.length; n++) {
								if (columns[i].childNodes[m].childNodes[n].localName == "value") {
									var value = {};
									value.format = columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("format").nodeValue;
									value.recursive = columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("recursive").nodeValue;
									var crude = columns[i].childNodes[m].childNodes[n].textContent;
									value.value = crude.replace(/^\s+|\s+$/g, '');
									value.columnNumber = i;
									renderJSPivotInter.formatValues.push(value);
								}
							}
						}
					}
				}
			}//handle conditional formats
			if (columns[i].childNodes.length > 0) {
				if (columns[i].childNodes != null) {
					for (var m = 0; m < columns[i].childNodes.length; m++) {
						if (columns[i].childNodes[m].localName == "conditionalFormats") {
							for (var n = 0; n < columns[i].childNodes[m].childNodes.length; n++) {
								if (columns[i].childNodes[m].childNodes[n].localName == "rule") {
									var format = {};
									format.format = columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("format").nodeValue;
									format.operation1 = columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("op1").nodeValue;
									format.value1 = columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("value1").nodeValue;
									if (columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("op2") != null) {
										format.operation2 = columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("op2").nodeValue;
										format.value2 = columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("value2").nodeValue;
									}
									format.columnNumber = i;
									renderJSPivotInter.conditionalFormatsColumns.push(format);
								}
							}
						}

					}
				}
			}

			//manage pictures
			if (columns[i].attributes.getNamedItem("picture").nodeValue != "") {
				if (columns[i].attributes.getNamedItem("dataType").nodeValue == "date") {
					datePictures.push(columns[i].attributes.getNamedItem("picture").nodeValue);
					dateFields.push(columns[i].attributes.getNamedItem("dataField").nodeValue);
				}
				//if (columns[i].attributes.getNamedItem("dataType").nodeValue == "integer" || measures[i].attributes.getNamedItem("dataType").nodeValue == "real") {
				if (columns[i].attributes.getNamedItem("dataType").nodeValue == "integer") {
					intPictures.push(columns[i].attributes.getNamedItem("picture").nodeValue);
					intFields.push(columns[i].attributes.getNamedItem("dataField").nodeValue);
				}

			}
			renderJSPivotInter.forPivotCustomPicture.push(columns[i].attributes.getNamedItem("picture").nodeValue);
			renderJSPivotInter.forPivotCustomFormat.push(columns[i].attributes.getNamedItem("format").nodeValue);
			orderFilds.push(columns[i].attributes.getNamedItem("dataField").nodeValue);

		}

		//var measures;
		for (var i = 0; i < renderJSPivotInter.measures.length; i++) {

			measureNames[i] = renderJSPivotInter.measures[i].attributes.getNamedItem("displayName").nodeValue;
			//manage format values
			if (renderJSPivotInter.measures[i].childNodes.length > 0) {
				if (renderJSPivotInter.measures[i].childNodes != null) {
					for (var m = 0; m < renderJSPivotInter.measures[i].childNodes.length; m++) {
						if (renderJSPivotInter.measures[i].childNodes[m].localName == "formatValues") {
							for (var n = 0; n < renderJSPivotInter.measures[i].childNodes[m].childNodes.length; n++) {
								if (renderJSPivotInter.measures[i].childNodes[m].childNodes[n].localName == "value") {
									var value = {};
									value.format = renderJSPivotInter.measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("format").nodeValue;
									value.recursive = renderJSPivotInter.measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("recursive").nodeValue;
									var crude = renderJSPivotInter.measures[i].childNodes[m].childNodes[n].textContent;
									value.value = crude.replace(/^\s+|\s+$/g, '');
									value.columnNumber = i;
									formatValuesMeasures.push(value);
								}
							}
						}

					}
				}
			}
			//manage conditional formats
			if (renderJSPivotInter.measures[i].childNodes.length > 0) {
				if (renderJSPivotInter.measures[i].childNodes != null) {
					for (var m = 0; m < renderJSPivotInter.measures[i].childNodes.length; m++) {
						if (renderJSPivotInter.measures[i].childNodes[m].localName == "conditionalFormats") {
							for (var n = 0; n < renderJSPivotInter.measures[i].childNodes[m].childNodes.length; n++) {
								if (renderJSPivotInter.measures[i].childNodes[m].childNodes[n].localName == "rule") {
									var format = {};
									format.format = renderJSPivotInter.measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("format").nodeValue;
									format.operation1 = renderJSPivotInter.measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("op1").nodeValue;
									format.value1 = renderJSPivotInter.measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("value1").nodeValue;
									if (renderJSPivotInter.measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("op2") != null) {
										format.operation2 = renderJSPivotInter.measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("op2").nodeValue;
										format.value2 = renderJSPivotInter.measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("value2").nodeValue;
									}
									format.columnNumber = i; //+ columns.length; Only the measure number
									conditionalFormats.push(format);
								}
							}
						}
					}
				}
			}

			//manage pictures
			if (renderJSPivotInter.measures[i].attributes.getNamedItem("picture").nodeValue != "") {
				if (renderJSPivotInter.measures[i].attributes.getNamedItem("dataType").nodeValue == "date") {
					datePictures.push(renderJSPivotInter.measures[i].attributes.getNamedItem("picture").nodeValue);
					dateFields.push(renderJSPivotInter.measures[i].attributes.getNamedItem("dataField").nodeValue);
				}
				if (renderJSPivotInter.measures[i].attributes.getNamedItem("dataType").nodeValue == "integer" || renderJSPivotInter.measures[i].attributes.getNamedItem("dataType").nodeValue == "real") {
					intPictures.push(renderJSPivotInter.measures[i].attributes.getNamedItem("picture").nodeValue);
					intFields.push(renderJSPivotInter.measures[i].attributes.getNamedItem("dataField").nodeValue);/* */
				}
			}

			//manage formula
			if ((renderJSPivotInter.measures[i].attributes.getNamedItem("formula") != undefined) && (renderJSPivotInter.measures[i].attributes.getNamedItem("formula").nodeValue != "")) {
				formulaInfo.measureFormula.push({ hasFormula: true, textFormula: renderJSPivotInter.measures[i].attributes.getNamedItem("formula").nodeValue })
			} else {
				formulaInfo.measureFormula.push({ hasFormula: false })
			}

			renderJSPivotInter.forPivotCustomPicture.push(renderJSPivotInter.measures[i].attributes.getNamedItem("picture").nodeValue);
			orderFilds.push(renderJSPivotInter.measures[i].attributes.getNamedItem("dataField").nodeValue);
		}


		renderJSPivotInter.header = preHeader.concat(measureNames);

		renderJSPivotInter.getDataFromXML = function (dataString, tableOrderField){
			var stringRecord = dataString.split("<Record>")

			//get server pagination info
			if (renderJSPivotInter.serverPaging) {
				renderJSPivotInter.ServerRecordCount = parseToIntRegisterValue(stringRecord[0], "RecordCount")
				renderJSPivotInter.ServerPageCount = parseToIntRegisterValue(stringRecord[0], "PageCount")
				renderJSPivotInter.ServerPageNumber = parseToIntRegisterValue(stringRecord[0], "PageNumber")
			}
			//get records of the table
			var filds = tableOrderField;
			
			for (var i = 1; i < stringRecord.length; i++) {
				var recordData = [];
				var fullRecordData = [];
				for (var j = 0; j < filds.length; j++) {
					recordData[j] = "#NuN#"
					var dt = stringRecord[i].split("<" + filds[j] + ">")
					if (dt.length > 1) {
						var at = dt[1].split("</" + filds[j] + ">")
						/*var rp = at[0].replace(/^\s+|\s+$/g, '')
						recordData[j] = (rp != "") ? rp : undefined*/
						recordData[j] = at[0]
						fullRecordData[j] = recordData[j]
					} else {
						if (stringRecord[i].indexOf("<" + filds[j]) >= 0) {
							recordData[j] = ""
							fullRecordData[j] = ""
						}

					}
				}
				renderJSPivotInter.data.push(recordData);

				var pos_init = filds.length;
				for (var j = 0; j < renderJSPivotInter.HideDataFilds.length; j++) {
					fullRecordData[pos_init + j] = undefined
					var dt = stringRecord[i].split("<" + renderJSPivotInter.HideDataFilds[j] + ">")
					if (dt.length > 1) {
						var at = dt[1].split("</" + renderJSPivotInter.HideDataFilds[j] + ">")
						fullRecordData[pos_init + j] = at[0]
					}
				}
				renderJSPivotInter.fullRecord.push(fullRecordData);
				if (fullRecordData.length > renderJSPivotInter.maxLengthRecord) renderJSPivotInter.maxLengthRecord = fullRecordData.length;
			}
		}

		renderJSPivotInter.maxLengthRecord = 0;
		renderJSPivotInter.data = []
		renderJSPivotInter.fullRecord = []  //array to store extra data for formulas
		renderJSPivotInter.orderFildsHidden = orderFildsHidden
		renderJSPivotInter.TableOrderFilds = orderFilds;
		if (!pivotParams.ServerPagingPivot) {
			renderJSPivotInter.getDataFromXML(pivotParams.data, renderJSPivotInter.TableOrderFilds);
		} else {
			
			ShowMeasuresAsRows = ((ShowMeasuresAsRows) && (renderJSPivotInter.measures.length > 1))
			renderJSPivotInter.pagingData = {}//OATGetDataFromXMLForPivot(renderJSPivotInter.dataString, ShowMeasuresAsRows);
			renderJSPivotInter.pagingData.dataFields = orderFilds;
		}

		var furmulaIndex = {}
		for (var j = 0; j < orderFildsHidden.length; j++) {
			furmulaIndex[orderFildsHidden[j]] = orderFilds.length + j
		}
		renderJSPivotInter.orderFildsHidden = nameFildsHidden
		formulaInfo.itemPosition = furmulaIndex
		formulaInfo.recordDataLength = renderJSPivotInter.maxLengthRecord;
		formulaInfo.cantFormulaMeasures = 0;

		for (var n = 0; n < formulaInfo.measureFormula.length; n++) {
			if (formulaInfo.measureFormula[n].hasFormula) {
				formulaInfo.cantFormulaMeasures++;

				var inlineFormula = formulaInfo.measureFormula[n].textFormula

				var inline = inlineFormula
				var opers = ['*', '-', '+', '/', '(', ')']
				for (var j = 0; j < opers.length; j++) {
					var inline2 = inline.split(opers[j])
					if (inline2.length > 1) {
						inline = ""
						for (var i = 0; i < inline2.length - 1; i++) {
							inline = inline + inline2[i] + " " + opers[j] + " "
						}
						inline = inline + inline2[inline2.length - 1]
					}
				}

				var polishNot = InfixToPostfix(inline)
				formulaInfo.measureFormula[n].polishNotationText = polishNot
				var items = polishNot.split(" ")
				while (items.indexOf("") != -1) {
					items.splice(items.indexOf(""), 1)
				}
				var relatedMeasure = []
				for (var k = 0; k < items.length; k++) {
					if ((opers.indexOf(items[k]) == -1) && (isNaN(parseInt(items[k])))) {
						//add item
						var operPositionInDataRow = formulaInfo.itemPosition[items[k]]
						if (relatedMeasure.indexOf(operPositionInDataRow) == -1)
							relatedMeasure.push(operPositionInDataRow)
					}
				}

				formulaInfo.measureFormula[n].relatedMeasures = relatedMeasure

				var arrayNot = polishNot.split(" ")
				while (arrayNot.indexOf("") != -1) {
					arrayNot.splice(arrayNot.indexOf(""), 1)
				}
				formulaInfo.measureFormula[n].PolishNotation = arrayNot
			}
		}

		var l = 0;
		var m = 0;
		var d = 0;
		for (var i = 0; i < preHeader.length; i++) {
			if (contains2(columnNames, preHeader[i]) != -1) {
				renderJSPivotInter.columnNumbers[l] = i;
				l++;
			}
			if (contains2(rowNames, preHeader[i]) != -1) {
				renderJSPivotInter.rowNumbers[m] = i;
				m++;
			}
			if (contains2(filterNames, preHeader[i]) != -1) {
				renderJSPivotInter.filterNumbers[d] = i;
				d++;
			}
		}

		//crear arreglo de columnas
		var colms = new Array();
		for (var t = 0; t < columns.length; t++) {
			colms[t] = columns[t];
		}

		var urlRelative = ""

		for (var i = 0; i < jQuery('script').length; i++) {
			var js_url = jQuery('script')[i].src
			if (js_url.indexOf("gxpivotjs") > 0) {
				urlRelative = js_url
				break;
			}
			if (js_url.indexOf("oat_loader") > 0) {
				urlRelative = js_url
				break;
			}
			
		}

		var relativePath = urlRelative.substring(0, urlRelative.indexOf("QueryViewer/oatPivot"));
		renderJSPivotInter.relativePath = relativePath
	
		renderJSPivotInter.fireOnPageChangeTable = function(UcId, move, container){
			setTimeout( function() {
				var paramobj = {"QueryviewerId": UcId, "Navigation": move};
				var evt = new Event("Events");
				evt.initEvent("TableOnPageChangeEvent", true, true);
				evt.parameter = paramobj;
				container.dispatchEvent(evt);
			}, 0)
		}
	
		var pivot;

		queryName = queryName.replace(/\./g, "")
		renderJSPivotInter.query = queryName
		renderJSPivotInter.translations = translations
		if (type == "PivotTable") {
			pivot = OAT_JS.pivot.cb(renderJSPivotInter, renderJSPivotInter.pivotDiv, page, content, defaultPicture, QueryViewerCollection, colms,
				renderJSPivotInter.formatValues, renderJSPivotInter.conditionalFormatsColumns, renderJSPivotInter.formatValuesMeasures, renderJSPivotInter.autoResize, renderJSPivotInter.disableColumnSort, renderJSPivotInter.UcId, renderJSPivotInter.IdForQueryViewerCollection,
				rememberLayout, ShowMeasuresAsRows, formulaInfo, renderJSPivotInter.fullRecord,
				pivotParams.ServerPagingPivot, renderJSPivotInter.pagingData, renderJSPivotInter.HideDataFilds, renderJSPivotInter.orderFildsHidden, renderJSPivotInter.InitMetadata, renderJSPivotInter.relativePath,
			    renderJSPivotInter.pivotParams );
			if (pivot == 'error') {
				return;
			}
		} else {
			if (type == "Table") {
				pivot = OAT_JS.grid.cb(renderJSPivotInter.pivotDiv, renderJSPivotInter.UcId + '_' + queryName, columnsDataType, defaultPicture, renderJSPivotInter.forPivotCustomPicture, renderJSPivotInter.conditionalFormatsColumns,
					renderJSPivotInter.formatValues, renderJSPivotInter.forPivotCustomFormat, colms, columns, QueryViewerCollection, renderJSPivotInter.pageSize, renderJSPivotInter.disableColumnSort, renderJSPivotInter.UcId, renderJSPivotInter.IdForQueryViewerCollection,
					rememberLayout, renderJSPivotInter);
			}
		}
		//add pagination functionality
		if (type == "Table") {
			renderJSPivotInter.pageSize = (renderJSPivotInter.previousState) ? renderJSPivotInter.previousState.pageSize : pageSize;

			var rowNum = renderJSPivotInter.pageSize;
			if ((pivot.rowsPerPage != undefined) && (pivot.rowsPerPage != "")) {
				rowNum = pivot.rowsPerPage;
			}

			if (QueryViewerCollection[renderJSPivotInter.UcId]._ControlRenderedTo) {
				jQuery("#"+renderJSPivotInter.UcId + "_" + renderJSPivotInter.query + "_tablePagination").remove(); //jQuery(".pivot_pag_div").remove()
			}

			if (renderJSPivotInter.pageSize) {
				
					var options = {
						currPage: renderJSPivotInter.ServerPageNumber,
						ignoreRows: jQuery('tbody tr[visibQ=tf]', jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query)),
						optionsForRows: OAT.AddItemToList([10, 15, 20], renderJSPivotInter.InitMetadata.RowsPerPage),
						rowsPerPage: rowNum != 'undefined' ? rowNum : 10,
						jstype: "table",
						topNav: false,
						controlName: renderJSPivotInter.UcId + "_" + renderJSPivotInter.query,
						cantPages: renderJSPivotInter.ServerPageCount,
						controlUcId: renderJSPivotInter.UcId,
						translations: translations,
						control: renderJSPivotInter
					}
					OAT.partialTablePagination(jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query),options);
					var wd2 = jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query)[0].clientWidth - 1;
					jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query + "_tablePagination").css({ width: wd2 + "px" });
					if (jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query + "_tablePagination").css('display') === 'none') {
						jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query).css({ marginBottom: "0px" });
					} else {
						jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query).css("margin-bottom", "0px");
					}

					if ((jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query + "_tablePagination_paginater").length > 0) && (jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query + "_tablePagination")[0].getBoundingClientRect().bottom < jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query + "_tablePagination_paginater")[0].getBoundingClientRect().bottom)) {
						jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query + "_tablePagination").css({ marginBottom: "0px" })
					}
					var wd = jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query)[0].offsetWidth - 4;
					jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query + "_grid_top_div").css({ width: wd + "px" });

					if ((renderJSPivotInter.serverPaging) && ((renderJSPivotInter.pageSize == 10) || (renderJSPivotInter.ServerRecordCount < 10))) {
						if (renderJSPivotInter.ServerPageCount <= 1) { //hide pagiantion
							jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query + "_tablePagination").css({ display: "none" });
						}
					}
				

			}
			var wd = jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query)[0].offsetWidth - 4;
			try {
				if (jQuery("#MAINFORM")[0].className.indexOf("form-horizontal") > -1) {
					wd = wd + 4;
				}
			} catch (Error) {
			}
			jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query + "_grid_top_div").css({ width: wd + "px" });

			//set interval for handler values infinite scroll
			if (self.serverPaging) {
				setInterval(function () {
					for (var t = 0; t < jQuery(".oat_winrect_container .pivot_popup_fix").length; t++) {
						if ((!jQuery(".oat_winrect_container .pivot_popup_fix").closest(".oat_winrect_container")[t].style.display) ||
							(jQuery(".oat_winrect_container .pivot_popup_fix").closest(".oat_winrect_container")[t].style.display != "none")) {

							if (jQuery(".oat_winrect_container .pivot_popup_fix").length > 0) {
								var element = jQuery(".oat_winrect_container .pivot_popup_fix")[t];
								var scrollBottom = element.scrollHeight - element.clientHeight - element.scrollTop
								if (scrollBottom < 25) {
									var UcId = element.getAttribute("ucid")
									var columnNumber = parseInt(element.getAttribute("columnNumber"))
									OAT_JS.grid.readScrollValue(UcId, columnNumber)
								}
							}
						}
					}
				},
					250)
			}

		}

		if (!pivotParams.ServerPagingPivot) {
			if (renderJSPivotInter.autoResize) {
				jQuery("#" + renderJSPivotInter.UcId + "_" + renderJSPivotInter.query).css({ minWidth: "10px" });
			}
		}

		renderJSPivotInter.getDataForTable = function (UcId, pageNumber, rowsPerPage, recalculateCantPages, DataFieldOrder, OrderType, DataFieldFilter, DataFieldBlackList, restoreDefaultView, fromExternalRefresh) {
			var layoutChanged = false;
			if ((recalculateCantPages) || (DataFieldOrder != "") || (DataFieldFilter != "")) {
				OAT_JS.grid.cleanCache(renderJSPivotInter, UcId);
				layoutChanged = true;
			}
			if (DataFieldOrder != "") OAT_JS.grid.gridData[UcId].dataFieldOrder = DataFieldOrder;
			if (OrderType != "") OAT_JS.grid.gridData[UcId].orderType = OrderType;
			if (DataFieldFilter != "") OAT_JS.grid.updateFilterInfo(UcId, DataFieldFilter, DataFieldBlackList);
			if (restoreDefaultView) { OAT_JS.grid.restoreDefaultView(UcId); rowsPerPage = OAT_JS.grid.gridData[UcId].rowsPerPage }

			OAT_JS.grid.gridData[UcId].rowsPerPage = rowsPerPage
			if ((recalculateCantPages) || (DataFieldOrder != "") || (DataFieldFilter != "")) {//save state
				OAT.SaveStateWhenServerPaging(OAT_JS.grid.gridData[UcId], UcId, OAT_JS.grid.gridData[UcId].blackLists, OAT_JS.grid.gridData[UcId].columnVisible, OAT_JS.grid.gridData[UcId].columnDataField)
			}

			
			if (rowsPerPage == "") { rowsPerPage = undefined; pageNumber = 0; }

			if (!OAT_JS.grid.pageInCache(UcId, pageNumber)) {
				
				OAT_JS.grid.lastCallToQueryViewer = "getDataForTable"
				OAT_JS.grid.lastCallData = { "self": renderJSPivotInter, "UcId": OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection, "RecalculateCantPages":recalculateCantPages, "DataFieldOrder":DataFieldOrder, "PageNumber": pageNumber, "fromExternalRefresh": fromExternalRefresh}
				renderJSPivotInter.requestPageDataForTable(pageNumber, rowsPerPage, recalculateCantPages, OAT_JS.grid.gridData[UcId].dataFieldOrder, OAT_JS.grid.gridData[UcId].orderType, OAT_JS.grid.gridData[UcId].filterInfo, layoutChanged, OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection, OAT_JS.grid.gridData[UcId].Container)
				
				/*qv.collection[OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection].getPageDataForTable((function (resXML) {
					if (pageNumber == 0) { pageNumber = 1, recalculateCantPages = false; }
					OAT_JS.grid.redraw(renderJSPivotInter, UcId, resXML, recalculateCantPages, DataFieldOrder != "", pageNumber, fromExternalRefresh)
				}).closure(renderJSPivotInter), [pageNumber, rowsPerPage, recalculateCantPages, OAT_JS.grid.gridData[UcId].dataFieldOrder, OAT_JS.grid.gridData[UcId].orderType, OAT_JS.grid.gridData[UcId].filterInfo, layoutChanged]);*/
			} else {
				OAT_JS.grid.redraw(renderJSPivotInter, UcId, OAT_JS.grid.pageInCache(UcId, pageNumber), false, false, pageNumber, true)
			}
		}
		
		
		renderJSPivotInter.requestPageDataForTable = function(PageNumber, PageSize, recalculateCantPages, DataFieldOrder, OrderType, Filters, LayoutChange, IdForQueryViewerCollection , container){
			setTimeout( function() {
				var paramobj = {  "PageNumber": PageNumber, "PageSize": PageSize,"RecalculateCantPages":recalculateCantPages, "DataFieldOrder":DataFieldOrder, 
					"OrderType":OrderType, "Filters":Filters, "LayoutChange":LayoutChange, "QueryviewerId": IdForQueryViewerCollection};
				var evt = new Event("Events");
				evt.initEvent("RequestPageDataForTable", true, true);
				evt.parameter = paramobj;
				container.dispatchEvent(evt);
			}, 0)
		}
		
		
		
		
		renderJSPivotInter.getActualCantPages = function(UcId){  
		 	return OAT_JS.grid.gridData[UcId].actualCantPages
		}
		
		renderJSPivotInter.getValuesForColumn = function (UcId, columnNumber, filterValue) {
			var dataField = OAT_JS.grid.gridData[UcId].columnDataField[columnNumber]
			if (filterValue != "") {
				var page = 1;
				
				OAT_JS.grid.lastCallToQueryViewer = "getValuesForColumn"
				OAT_JS.grid.lastCallData = { "self": renderJSPivotInter, "UcId": UcId, "columnNumber": columnNumber, "filterValue": filterValue, "dataField": dataField }
				
				renderJSPivotInter.requestAttributeForTable(UcId, dataField, page, filterValue, 10, OAT_JS.grid.gridData[UcId].Container)
				/*qv.collection[OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection].getAttributeValues((function (resJSON) {
					var res = JSON.parse(resJSON);
					OAT_JS.grid.changeValues(UcId, dataField, columnNumber, res, filterValue);
				}).closure(renderJSPivotInter), [dataField, page, 10, filterValue]);*/
			} else {
				OAT_JS.grid.resetScrollValue(UcId, dataField, columnNumber)
			}
		}
		
		
		renderJSPivotInter.requestAttributeForTable = function(UcId, dataField, page, filterValue, pageSize, container){
			setTimeout( function() {
				var paramobj = {  "Page": page, "PageSize": pageSize, "DataField": dataField, "Filters":filterValue, "QueryviewerId": UcId};
				var evt = new Event("Events");
				evt.initEvent("RequestAttributeForTable", true, true);
				evt.parameter = paramobj;
				container.dispatchEvent(evt);
			}, 0)
		}
		
		
		renderJSPivotInter.fireOnFilterChanged = function(UcId, FilterChangedData, container){
			setTimeout( function() {
				var paramobj = {"QueryViewerd": UcId, "FilterChangedData": FilterChangedData};
				var evt = new Event("Events");
				evt.initEvent("TableOnFilterChangedEvent", true, true);
				evt.parameter = paramobj;
				container.dispatchEvent(evt);
			}, 0)
		}
		
		queryself.oat_element = pivot;


	}

	var OAT_JS = {};

	OAT_JS.grid = {
		panel: 1,
		tab: 4,
		div: "",
		needs: ["grid"],
		gridData: [],
		cb: function (content, controlName, columnsDataType, defaultPicture, forPivotCustomPicture, conditionalFormatsColumns, formatValues, forPivotCustomFormar, colms, columns,
			QueryViewerCollection, pageSize, disableColumnSort, UcId, IdForQueryViewerCollection, rememberLayout, _mthis) {
			this.gridData[UcId] = {};
			this.gridData[UcId].div = content;
			this.gridData[UcId].controlName = controlName;

			this.gridData[UcId].actualPageNumber = 1;
			this.gridData[UcId].rowsPerPage = (_mthis.previousState) ? _mthis.previousState.pageSize : pageSize;
			this.gridData[UcId].actualCantPages = _mthis.ServerPageCount;
			
			this.gridData[UcId].autoResize = _mthis.autoResize;
			this.gridData[UcId].selection = {Allow: _mthis.pivotParams.AllowSelection, EntireLine: _mthis.pivotParams.SelectLine, SelectedNode: []};
			
			this.gridData[UcId].Container = _mthis.pivotParams.container 
			
			this.gridData[UcId].grid = new OAT.Grid(content, controlName, _mthis.query, columnsDataType, colms, QueryViewerCollection, this.gridData[UcId].rowsPerPage,
				disableColumnSort, UcId, IdForQueryViewerCollection, rememberLayout, _mthis.serverPaging, _mthis.HideDataFilds, _mthis.orderFildsHidden, _mthis.TableOrderFilds, _mthis.relativePath,
				this.gridData[UcId].selection, _mthis.pivotParams.Title, _mthis.translations );
			this.gridData[UcId].grid.oat_component = this;
			this.gridData[UcId].QueryViewerCollectionItem = QueryViewerCollection[IdForQueryViewerCollection];
			this.gridData[UcId].Events = _mthis;
			this.gridData[UcId].translations = _mthis.translations;
			//initialize 
			this.gridData[UcId].columnDataField = []
			if ((_mthis.previousState) && (_mthis.previousState.columnDataField)){
				this.gridData[UcId].columnDataField = _mthis.previousState.columnDataField
				var header = [];
			
				for(var i = 0; i < this.gridData[UcId].columnDataField.length; i++){
					var dtF = this.gridData[UcId].columnDataField[i]
					for(var j = 0 ; j < columns.length; j++){
						if (dtF == columns[j].getAttribute("dataField"))
						{
							header.push(columns[j].getAttribute("displayName"));
						}
					}
				}
				this.gridData[UcId].grid.createHeader(header, this.gridData[UcId].columnDataField);
			} else {
				for (var id = 0; id < columns.length; id++) {
					this.gridData[UcId].columnDataField[id] = columns[id].getAttribute("dataField");
				}
				this.gridData[UcId].grid.createHeader(_mthis.header, this.gridData[UcId].columnDataField);
			}

			
			this.gridData[UcId].redrawHeader = false
			
			//initialize default data
			this.gridData[UcId].defaultValues = {}
			this.gridData[UcId].defaultValues.rowsPerPage = pageSize;
			this.gridData[UcId].defaultValues.dataFieldOrder = "";
			this.gridData[UcId].defaultValues.orderType = ""
			this.gridData[UcId].defaultValues.filterInfo = [];


			this.gridData[UcId].IdForQueryViewerCollection = IdForQueryViewerCollection;
			this.gridData[UcId].TableOrderFields = _mthis.TableOrderFilds;

			//initialize cache
			this.gridData[UcId].cacheSize = (_mthis.gridCacheSize == 0) ? (_mthis.ServerPageCount * ((this.gridData[UcId].rowsPerPage > 0) ? this.gridData[UcId].rowsPerPage : 1)) : _mthis.gridCacheSize;
			this.gridData[UcId].gridCache = [];
			this.gridData[UcId].gridCache[0] = { page: 1, pageData: _mthis.dataString };
			this.gridData[UcId].nextCachePos = 1;
			//end initialize cache
			
			//initialize  dataFields
			this.gridData[UcId].originalColumnDataField = []
			for (var id = 0; id < columns.length; id++) {
				this.gridData[UcId].originalColumnDataField[id] = columns[id].getAttribute("dataField");
			}
			
			//initialize column visibility
			this.gridData[UcId].columnVisible = [];
			for (var id = 0; id < columns.length; id++) {
				this.gridData[UcId].columnVisible[id] = true
				if (_mthis.previousColumnVisible) {
					this.gridData[UcId].columnVisible[id] = _mthis.previousColumnVisible[id]
					if (!this.gridData[UcId].columnVisible[id]){
						var dtF = this.gridData[UcId].originalColumnDataField[id]	
						this.gridData[UcId].grid.hideColumnHeader(this.gridData[UcId].columnDataField.indexOf(dtF));
					}
				} else if (_mthis.initialColumnVisible) {
					this.gridData[UcId].columnVisible[id] = _mthis.initialColumnVisible[id]
					if (!this.gridData[UcId].columnVisible[id])
						this.gridData[UcId].grid.hideColumnHeader(id);
				}
			}
			

			//initialize filter info
			this.gridData[UcId].filterInfo = [];
			this.gridData[UcId].differentValues = [];
			this.gridData[UcId].blackLists = [];
			this.gridData[UcId].differentValuesPaginationInfo = [];
			this.gridData[UcId].filteredValuesPaginationInfo = [];
			for (var id = 0; id < columns.length; id++) {
				this.gridData[UcId].differentValues[columns[id].getAttribute("dataField")] = [];
				this.gridData[UcId].blackLists[columns[id].getAttribute("dataField")] = { state: "all", visibles: [], hiddens: [], defaultAction: "Include", hasNull: true };
				this.gridData[UcId].differentValuesPaginationInfo[columns[id].getAttribute("dataField")] = {
					blocked: false, previousPage: 0,
					totalPages: true, filtered: false
				}
				this.gridData[UcId].filteredValuesPaginationInfo[columns[id].getAttribute("dataField")] = { previousPage: 0, totalPages: 0, filteredText: "", values: [] }
			}

			this.gridData[UcId].defaultNullText = defaultPicture.getAttribute("textForNullValues");

			if (_mthis.previousFilters != undefined) {//load previus state filter info
				this.gridData[UcId].filterInfo = _mthis.previousFilters;
				for (var u = 0; u < this.gridData[UcId].filterInfo.length; u++) {
					for (var t = 0; t < this.gridData[UcId].filterInfo[u].NotNullValues.Included.length; t++) {
						var val = this.gridData[UcId].filterInfo[u].NotNullValues.Included[t];
						if (this.gridData[UcId].blackLists[this.gridData[UcId].filterInfo[u].DataField].visibles.indexOf(val) == -1) {
							this.gridData[UcId].blackLists[this.gridData[UcId].filterInfo[u].DataField].visibles.push(val);
						}
					}

					for (var t = 0; t < this.gridData[UcId].filterInfo[u].NotNullValues.Excluded.length; t++) {
						var val = this.gridData[UcId].filterInfo[u].NotNullValues.Excluded[t];
						if (this.gridData[UcId].blackLists[this.gridData[UcId].filterInfo[u].DataField].hiddens.indexOf(val) == -1) {
							this.gridData[UcId].blackLists[this.gridData[UcId].filterInfo[u].DataField].hiddens.push(val);
						}
					}

					if (this.gridData[UcId].filterInfo[u].NotNullValues.Included.length > 0) {
						this.gridData[UcId].blackLists[this.gridData[UcId].filterInfo[u].DataField].state = "";
					} else {
						this.gridData[UcId].blackLists[this.gridData[UcId].filterInfo[u].DataField].state = "none";
					}

					this.gridData[UcId].blackLists[this.gridData[UcId].filterInfo[u].DataField].defaultAction = this.gridData[UcId].filterInfo[u].NotNullValues.DefaultAction;

				}
			} else {
				if ((_mthis.customFilterInfo != undefined) & (_mthis.customFilterInfo != "")) {
					this.gridData[UcId].filterInfo = _mthis.customFilterInfo;
				}
			}
			//end initialize filter info
			//initialize order info
			this.gridData[UcId].dataFieldOrder = (_mthis.previousDataFieldOrder != undefined) ? _mthis.previousDataFieldOrder : ""
			this.gridData[UcId].orderType = (_mthis.previousOrderType != undefined) ? _mthis.previousOrderType : ""
			//end initialize order info
			//for custom order
			this.gridData[UcId].customOrderValues = [];
			for (var index = 0; index < columns.length; index++) {
				if ((columns[index].getAttribute("order") != undefined) && (columns[index].getAttribute("order") === "custom")) {
					result = this.gridData[UcId].grid.applyCustomSort(index, columns[index], _mthis.data);
					_mthis.data = result[0]
					this.gridData[UcId].customOrderValues[index] = result[1]
				} else {
					this.gridData[UcId].customOrderValues[index] = false
				}
			}

			this.gridData[UcId].rowsMetadata = {
				columnsDataType: columnsDataType, defaultPicture: defaultPicture, forPivotCustomPicture: forPivotCustomPicture,
				conditionalFormatsColumns: conditionalFormatsColumns, formatValues: formatValues, forPivotCustomFormat: _mthis.forPivotCustomFormat, columns: columns
			}
			this.gridData[UcId].rowsData = _mthis.data;
			for (var i = 0; i < _mthis.data.length; i++) {
				OAT.CreateGridRow(_mthis.data[i], this.gridData[UcId])
			}

			//for ascending or descending order
			if (!_mthis.serverPaging) {
				for (var index = 0; index < columns.length; index++) {
					if ((columns[index].getAttribute("order") != undefined) && (columns[index].getAttribute("order") === "ascending")) {
						this.gridData[UcId].grid.applySortOrderType(index, 2);
					}
					if ((columns[index].getAttribute("order") != undefined) && (columns[index].getAttribute("order") === "descending")) {
						this.gridData[UcId].grid.applySortOrderType(index, 3);
					}
					if (columns[index].getAttribute("order") != undefined) {
						break;
					}
				}
			} else {
				var withOrderCustom = false
				for (var index = 0; index < columns.length; index++) {
					if ((columns[index].getAttribute("order") != undefined) && (columns[index].getAttribute("order") != "")) {
						this.gridData[UcId].dataFieldOrder = columns[index].getAttribute("dataField")
						this.gridData[UcId].orderType = (columns[index].getAttribute("order") == "descending") ? "Descending" : "Ascending";
						withOrderCustom = (columns[index].getAttribute("order") == "custom")
						break;
					}
				}

				if ((this.gridData[UcId].dataFieldOrder != "") && (!withOrderCustom)) {
					var columnOrderNumber = 0;
					for (var t = 0; t < this.gridData[UcId].grid.columns.length; t++) {
						if (this.gridData[UcId].dataFieldOrder == this.gridData[UcId].columnDataField[t]) { //this.gridData[UcId].grid.columns[t].getAttribute("dataField")){
							columnOrderNumber = t;
							break;
						}
					}
					//var colNumber = columns.length - 1 - columnOrderNumber;
					this.gridData[UcId].grid.applySortOrderType(columnOrderNumber, (this.gridData[UcId].orderType.toLowerCase() == "ascending") ? 2 : 3);
				}
			}

			//apply custom filters
			//this.gridData[UcId].mustRedraw = false; 
			for (var index = 0; index < columns.length; index++) {
				this.gridData[UcId].grid.applyCustomFilter(index, columns[index]);
				//var toRedraw = this.gridData[UcId].grid.applyCustomFilter(index, columns[index]);
				//if (toRedraw) { this.gridData[UcId].mustRedraw = true; }
			}

			//load different values
			if (_mthis.serverPaging) {
				//OAT_JS.grid.initValueRead(UcId, 0)
				this.gridData[UcId].endValueRead = false
				//call OnFirstPage on load
				QueryViewerCollection[this.gridData[UcId].IdForQueryViewerCollection].CurrentPage = 1;//qv.collection[this.gridData[UcId].IdForQueryViewerCollection].CurrentPage = 1;
				//if (typeof (qv.collection[this.gridData[UcId].IdForQueryViewerCollection].OnFirstPage) == 'function')
				if (typeof (QueryViewerCollection[this.gridData[UcId].IdForQueryViewerCollection].OnFirstPage) == 'function') 
					//qv.collection[this.gridData[UcId].IdForQueryViewerCollection].OnFirstPage()
					self.fireOnPageChangeTable(this.gridData[UcId].IdForQueryViewerCollection, "OnFirstPage", this.gridData[UcId].Container)
			}

			if (!_mthis.serverPaging) {
				this.gridData[UcId].grid.applySaveState(this.gridData[UcId].rowsPerPage);
			}

			if (_mthis.previousState) {
				var __mthis = this;
				var _UcId = UcId;
				setTimeout( function() {
					__mthis.gridData[_UcId].Events.getDataForTable(_UcId, 1, __mthis.gridData[_UcId].rowsPerPage, true, __mthis.gridData[_UcId].dataFieldOrder, __mthis.gridData[_UcId].orderType, "", "", "", false);
				} , 0)
			}

			return this.gridData[UcId].grid;
		},
		redraw: function (_mthis, UcId, xmlData, recalculateCantPages, moveToFirstPage, pageNumber, fromExternalRefresh) {
			//add data to cache
			if (!this.pageInCache(UcId, pageNumber)) {
				this.gridData[UcId].gridCache.push({ page: pageNumber, pageData: xmlData })
				if (this.gridData[UcId].gridCache.length > this.gridData[UcId].cacheSize) {
					this.gridData[UcId].gridCache.splice(0, 1)
				}
			} else {
				var indCache = -1;
				for (var cP = 0; cP < this.gridData[UcId].gridCache.length; cP++) {
					if (this.gridData[UcId].gridCache[cP].page == pageNumber) {
						indCache = cP;
					}
				}
				this.gridData[UcId].gridCache.splice(indCache, 1)
				this.gridData[UcId].gridCache.push({ page: pageNumber, pageData: xmlData })
			}
			//end add data to cache
			_mthis.data = []
			_mthis.getDataFromXML(xmlData, this.gridData[UcId].TableOrderFields);
			if (_mthis.ServerPageCount >= 0) {
				this.gridData[UcId].actualCantPages = _mthis.ServerPageCount;
			}
			
			//redraw header when neded
			if (this.gridData[UcId].redrawHeader){
				var actualheader = [];
			
				for(var i = 0; i < this.gridData[UcId].columnDataField.length; i++){
					var dtF = this.gridData[UcId].columnDataField[i]
					for(var j = 0 ; j < this.gridData[UcId].rowsMetadata.columns.length; j++){
						if (dtF == this.gridData[UcId].rowsMetadata.columns[j].getAttribute("dataField"))
						{
							actualheader.push(this.gridData[UcId].rowsMetadata.columns[j].getAttribute("displayName"));
						}
					}
				}
			
				this.gridData[UcId].grid.createHeader(actualheader, this.gridData[UcId].columnDataField);
			
				if ((this.gridData[UcId].dataFieldOrder != "")){ //&& (!withOrderCustom)) {
					var columnOrderNumber = 0;
					for (var t = 0; t < this.gridData[UcId].grid.columns.length; t++) {
						if (this.gridData[UcId].dataFieldOrder == this.gridData[UcId].columnDataField[t]) { //this.gridData[UcId].grid.columns[t].getAttribute("dataField")){
							columnOrderNumber = t;
							break;
						}
					}
					this.gridData[UcId].grid.applySortOrderType(columnOrderNumber, (this.gridData[UcId].orderType.toLowerCase() == "ascending") ? 2 : 3);
				}
				
				//hide hidden columns
				for(var i = 0; i < this.gridData[UcId].columnVisible.length; i++){
					if (!this.gridData[UcId].columnVisible[i]){
						var dtF = this.gridData[UcId].originalColumnDataField[i]
						this.gridData[UcId].grid.hideColumnHeader(this.gridData[UcId].columnDataField.indexOf(dtF));
					}
				}				
				
			}			
			//end redraw header
			
			this.gridData[UcId].grid.removeAllRows();
			if (recalculateCantPages) {
				if (jQuery("#" + this.gridData[UcId].controlName + "_tablePagination " + "#tablePagination_totalPages").length > 0) {
					OAT.replaceTextNode(jQuery("#" + this.gridData[UcId].controlName + "_tablePagination " + "#tablePagination_totalPages")[0], " " + _mthis.ServerPageCount)
					if ((_mthis.ServerPageCount <= 1) /*&& (this.gridData[UcId].rowsPerPage == 10)*/) { //hide pagiantion
						jQuery("#" + this.gridData[UcId].controlName + "_tablePagination ").css({ display: "none" });
					} else {
						jQuery("#" + this.gridData[UcId].controlName + "_tablePagination ").css({ display: "" });
						if (_mthis.ServerPageCount == 1) {
							jQuery('#' + this.gridData[UcId].controlName + '_tablePagination_paginater').css('display', 'none');
						} else {
							jQuery('#' + this.gridData[UcId].controlName + '_tablePagination_paginater').css('display', '');
						}
					}
				}
			}

			//call navigational events
			if (OAT_JS.grid.gridData[UcId].actualPageNumber != pageNumber) {
				this.gridData[UcId].QueryViewerCollectionItem.CurrentPage = pageNumber;//qv.collection[this.gridData[UcId].IdForQueryViewerCollection].CurrentPage = pageNumber;
				if (pageNumber == 1) {
					if (typeof (this.gridData[UcId].QueryViewerCollectionItem.OnFirstPage) == 'function') 
					//qv.collection[this.gridData[UcId].IdForQueryViewerCollection].OnFirstPage()
					self.fireOnPageChangeTable(this.gridData[UcId].IdForQueryViewerCollection, "OnFirstPage", this.gridData[UcId].Container)
				} else if (pageNumber == this.gridData[UcId].actualCantPages) {
					if (typeof (this.gridData[UcId].QueryViewerCollectionItem.OnLastPage) == 'function') 
					//qv.collection[this.gridData[UcId].IdForQueryViewerCollection].OnLastPage()
					self.fireOnPageChangeTable(this.gridData[UcId].IdForQueryViewerCollection, "OnLastPage", this.gridData[UcId].Container)
				} else if (pageNumber < OAT_JS.grid.gridData[UcId].actualPageNumber) {
					if (typeof (this.gridData[UcId].QueryViewerCollectionItem.OnPreviousPage) == 'function') //qv.collection[this.gridData[UcId].IdForQueryViewerCollection].OnPreviousPage()
					self.fireOnPageChangeTable(this.gridData[UcId].IdForQueryViewerCollection, "OnPreviousPage", this.gridData[UcId].Container)
				} else {
					if (typeof (this.gridData[UcId].QueryViewerCollectionItem.OnNextPage) == 'function') //qv.collection[this.gridData[UcId].IdForQueryViewerCollection].OnNextPage()
					self.fireOnPageChangeTable(this.gridData[UcId].IdForQueryViewerCollection, "OnNextPage", this.gridData[UcId].Container)
				}

			}

			//call autorefresh
			if ((!fromExternalRefresh) && (this.gridData[UcId].QueryViewerCollectionItem.AutoRefreshGroup != "")) {
				
				
				OAT_JS.grid.initValueRead(UcId, 0)
				
				var wait = function(){
					if (!OAT_JS.grid.gridData[UcId].endValueRead) {
						setTimeout( wait , 100)
					} else {
						var meta = OAT.createXMLMetadata(OAT_JS.grid.gridData[UcId], null, true);
						var spl = OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection;
						var container = OAT_JS.grid.gridData[UcId].Container
						//var listennings = qv.collection[spl];
						/*if ((listennings != "") && (listennings != null) && (listennings != undefined)) {
							qv.util.autorefresh.UpdateLayoutSameGroup(listennings, qv.pivot.GetRuntimeMetadata(meta, listennings.RealType), true);
						}*/
						
						
						setTimeout( function() {
				
									var paramobj = {  "QueryviewerId": spl, "Metadata": meta};
									var evt = new Event("Events"); 
									evt.initEvent("RequestUpdateLayoutSameGroup", true, true);
									evt.parameter = paramobj;
									container.dispatchEvent(evt);
				
								}, 50)
					}
				}
				wait();
			}

			//set new current page
			OAT_JS.grid.gridData[UcId].actualPageNumber = pageNumber
			currPageNumber[this.gridData[UcId].controlName] = pageNumber
			jQuery("#" + this.gridData[UcId].controlName + "_tablePagination " + "#tablePagination_currPage").val(pageNumber)
			
			this.gridData[UcId].rowsData = _mthis.data;
			for (var i = 0; i < _mthis.data.length; i++) {
				OAT.CreateGridRow(_mthis.data[i], this.gridData[UcId])
			}
			
			//redraw selection
			OAT.RedrawSelectedNode(this.gridData[UcId].grid)
		},
		getDifferentValues: function (UcId, columnNumber, iter) { //return the list of distint values of a column, and if it checked or not
			var dataField = this.gridData[UcId].columnDataField[columnNumber];//this.gridData[UcId].grid.columns[columnNumber].getAttribute("dataField")
			var value = this.gridData[UcId].differentValues[dataField][iter]
			var pos = this.gridData[UcId].originalColumnDataField.indexOf(this.gridData[UcId].columnDataField[columnNumber])
			var pict_value = OAT.ApplyPictureValue(value.trimpivot(), this.gridData[UcId].rowsMetadata.columnsDataType[pos],
				this.gridData[UcId].rowsMetadata.defaultPicture, this.gridData[UcId].rowsMetadata.forPivotCustomPicture[pos]).replace(/ /g, "\u00A0");

			if ((this.gridData[UcId].blackLists[dataField].hasNull) && (value.trimpivot() == this.gridData[UcId].defaultNullText)) {
				value = "#NuN#" //tomo este valor como el null
				return false;//{value: "", checked: true, pict_value: ""} 
			}
			var checked = true;
			if (this.gridData[UcId].blackLists[dataField].state != "all") {
				if (this.gridData[UcId].blackLists[dataField].visibles.indexOf(value) < 0) {
					checked = false;
				}
			}

			return { value: value, checked: checked, pict_value: pict_value };
		},
		getCantDifferentValues: function (UcId, columnNumber) {
			var dataField = this.gridData[UcId].columnDataField[columnNumber];//this.gridData[UcId].grid.columns[columnNumber].getAttribute("dataField")
			return this.gridData[UcId].differentValues[dataField].length
		},
		cleanCache: function (_mthis, UcId) {
			for (var cP = 0; cP < this.gridData[UcId].gridCache.length; cP++) {
				this.gridData[UcId].gridCache[cP] = { page: -1, pageData: "" };
			}
			this.gridData[UcId].nextCachePos = 0;
		},
		pageInCache: function (UcId, pageNumber) {
			for (var cP = 0; cP < this.gridData[UcId].gridCache.length; cP++) {
				if (this.gridData[UcId].gridCache[cP].page == pageNumber) {
					return this.gridData[UcId].gridCache[cP].pageData;
				}
			}
			return false;
		},
		updateFilterInfo: function (UcId, DataFieldFilter, NewFilter) {
			if (NewFilter.op == "all") {
				//remove filter from filterInof
				var pos = -1;
				for (var p = 0; p < this.gridData[UcId].filterInfo.length; p++) {
					if (DataFieldFilter == this.gridData[UcId].filterInfo[p].DataField) { pos = p; break; }
				}
				if (pos > -1) this.gridData[UcId].filterInfo.splice(pos, 1)
				this.gridData[UcId].blackLists[DataFieldFilter].state = "all"
				this.gridData[UcId].blackLists[DataFieldFilter].visibles = []
				this.gridData[UcId].blackLists[DataFieldFilter].hiddens = []
				this.gridData[UcId].blackLists[DataFieldFilter].defaultAction = "Include"
				return;
			}

			if (this.gridData[UcId].blackLists[DataFieldFilter].state == "none") {
				this.gridData[UcId].blackLists[DataFieldFilter].visibles = []
				for (var u = 0; u < this.gridData[UcId].differentValues[DataFieldFilter].length; u++) {
					if (this.gridData[UcId].blackLists[DataFieldFilter].hiddens.indexOf(this.gridData[UcId].differentValues[DataFieldFilter][u]) == -1) {
						this.gridData[UcId].blackLists[DataFieldFilter].hiddens.push(this.gridData[UcId].differentValues[DataFieldFilter][u])
					}
				}
			} else if (this.gridData[UcId].blackLists[DataFieldFilter].state == "all") {
				this.gridData[UcId].blackLists[DataFieldFilter].hiddens = []
				for (var u = 0; u < this.gridData[UcId].differentValues[DataFieldFilter].length; u++) {
					if (this.gridData[UcId].blackLists[DataFieldFilter].visibles.indexOf(this.gridData[UcId].differentValues[DataFieldFilter][u]) == -1) {
						this.gridData[UcId].blackLists[DataFieldFilter].visibles.push(this.gridData[UcId].differentValues[DataFieldFilter][u])
					}
				}
			}

			var notNullValue = [];
			if (NewFilter.op == "none") {
				notNullValue = [];
				this.gridData[UcId].blackLists[DataFieldFilter].state = "none"
				this.gridData[UcId].blackLists[DataFieldFilter].visibles = []
				this.gridData[UcId].blackLists[DataFieldFilter].hiddens = []
				this.gridData[UcId].blackLists[DataFieldFilter].defaultAction = "Exclude"
			} else {

				if (NewFilter.op == "push") {
					this.gridData[UcId].blackLists[DataFieldFilter].state = ""
					var pos = this.gridData[UcId].blackLists[DataFieldFilter].visibles.indexOf(NewFilter.values)
					if (pos > -1) this.gridData[UcId].blackLists[DataFieldFilter].visibles.splice(pos, 1);
					if (this.gridData[UcId].blackLists[DataFieldFilter].hiddens.indexOf(NewFilter.values) == -1)
						this.gridData[UcId].blackLists[DataFieldFilter].hiddens.push(NewFilter.values)
				} else if (NewFilter.op == "pop") {
					this.gridData[UcId].blackLists[DataFieldFilter].state = ""
					if (this.gridData[UcId].blackLists[DataFieldFilter].visibles.indexOf(NewFilter.values) == -1)
						this.gridData[UcId].blackLists[DataFieldFilter].visibles.push(NewFilter.values)
					var pos = this.gridData[UcId].blackLists[DataFieldFilter].hiddens.indexOf(NewFilter.values)
					if (pos > -1) this.gridData[UcId].blackLists[DataFieldFilter].hiddens.splice(pos, 1);
				} else if (NewFilter.op == "reverse") {
					if (this.gridData[UcId].blackLists[DataFieldFilter].defaultAction == "Include") {
						this.gridData[UcId].blackLists[DataFieldFilter].defaultAction = "Exclude"
					} else {
						this.gridData[UcId].blackLists[DataFieldFilter].defaultAction = "Include"
					}
					if (this.gridData[UcId].blackLists[DataFieldFilter].state == "none") {//si el estado anterior es none pasa a all
						var pos = -1;
						for (var p = 0; p < this.gridData[UcId].filterInfo.length; p++) {
							if (DataFieldFilter == this.gridData[UcId].filterInfo[p].DataField) { pos = p; break; }
						}
						if (pos > -1) this.gridData[UcId].filterInfo.splice(pos, 1)
						this.gridData[UcId].blackLists[DataFieldFilter].state = "all"
						this.gridData[UcId].blackLists[DataFieldFilter].visibles = []
						this.gridData[UcId].blackLists[DataFieldFilter].hiddens = []
						return;
					} else if (this.gridData[UcId].blackLists[DataFieldFilter].state == "all") {//si el estado anterior es all pasa a none
						notNullValue = [];
						this.gridData[UcId].blackLists[DataFieldFilter].state = "none"
						this.gridData[UcId].blackLists[DataFieldFilter].visibles = []
						this.gridData[UcId].blackLists[DataFieldFilter].hiddens = []
					} else {

						var tempArrayVisibles = []; for (var tit = 0; tit < this.gridData[UcId].blackLists[DataFieldFilter].visibles.length; tit++) { tempArrayVisibles.push(this.gridData[UcId].blackLists[DataFieldFilter].visibles[tit]) }
						var tempArrayHiddens = []; for (var tit = 0; tit < this.gridData[UcId].blackLists[DataFieldFilter].hiddens.length; tit++) { tempArrayHiddens.push(this.gridData[UcId].blackLists[DataFieldFilter].hiddens[tit]) }

						this.gridData[UcId].blackLists[DataFieldFilter].visibles = []
						this.gridData[UcId].blackLists[DataFieldFilter].hiddens = []

						for (var u = 0; u < this.gridData[UcId].differentValues[DataFieldFilter].length; u++) {
							var val = this.gridData[UcId].differentValues[DataFieldFilter][u];
							if (tempArrayVisibles.indexOf(val) == -1) {
								this.gridData[UcId].blackLists[DataFieldFilter].visibles.push(val)
							} else {
								this.gridData[UcId].blackLists[DataFieldFilter].hiddens.push(val)
							}
						}
						for (var u = 0; u < tempArrayHiddens.length; u++) {
							if (this.gridData[UcId].blackLists[DataFieldFilter].visibles.indexOf(tempArrayHiddens[u]) == -1) {
								this.gridData[UcId].blackLists[DataFieldFilter].visibles.push(tempArrayHiddens[u])
							}
						}
						for (var u = 0; u < tempArrayVisibles.length; u++) {
							if (this.gridData[UcId].blackLists[DataFieldFilter].hiddens.indexOf(tempArrayVisibles[u]) == -1) {
								this.gridData[UcId].blackLists[DataFieldFilter].hiddens.push(tempArrayVisibles[u])
							}
						}
					}
				}
			}

			var filterExist = false; var nullIncluded = true;
			var included = [];
			for (var t = 0; t < this.gridData[UcId].blackLists[DataFieldFilter].visibles.length; t++) {
				if (this.gridData[UcId].blackLists[DataFieldFilter].visibles[t] != "#NuN#") {
					included.push(this.gridData[UcId].blackLists[DataFieldFilter].visibles[t])
				}
			}
			var excluded = [];
			if (this.gridData[UcId].blackLists[DataFieldFilter].state != "none") {
				for (var t = 0; t < this.gridData[UcId].differentValues[DataFieldFilter].length; t++) {
					var val = this.gridData[UcId].differentValues[DataFieldFilter][t]
					if ((val != "#NuN#") && (included.indexOf(val) == -1)) {
						excluded.push(val)
					}
				}
				for (var t = 0; t < this.gridData[UcId].blackLists[DataFieldFilter].hiddens.length; t++) {
					if ((this.gridData[UcId].blackLists[DataFieldFilter].hiddens[t] != "#NuN#")
						&& (excluded.indexOf(this.gridData[UcId].blackLists[DataFieldFilter].hiddens[t]) == -1)) {
						excluded.push(this.gridData[UcId].blackLists[DataFieldFilter].hiddens[t])
					}
				}
				if ((included.length == 0) && ((this.gridData[UcId].blackLists[DataFieldFilter].defaultAction == "Exclude"))) {
					excluded = [];
				}
			}

			if (NewFilter.op == "none") {
				nullIncluded = false;
				included = []; excluded = [];
			} else {
				if ((this.gridData[UcId].differentValues[DataFieldFilter].indexOf("#NuN#") > -1) ||
					(excluded.indexOf(this.gridData[UcId].blackLists[DataFieldFilter].hiddens[t]) != -1)) {
					if (this.gridData[UcId].blackLists[DataFieldFilter].visibles.indexOf("#NuN#") == -1) {
						nullIncluded = false;
					}
				} else {
					if (this.gridData[UcId].blackLists[DataFieldFilter].defaultAction == "Exclude") {
						nullIncluded = false;
					}
				}
			}


			if ((this.gridData[UcId].blackLists[DataFieldFilter].hasNull) && (!(NewFilter.op == "none"))) {
				//asociated psuedo-Null
				var reallyPseudoNull = this.gridData[UcId].defaultNullText
				var finded = false
				var data_length = 0;
				for (var u = 0; u < this.gridData[UcId].differentValues[DataFieldFilter].length; u++) {
					data_length = this.gridData[UcId].differentValues[DataFieldFilter][u].length;
				}
				for (var u = 0; u < this.gridData[UcId].differentValues[DataFieldFilter].length; u++) {
					if (this.gridData[UcId].differentValues[DataFieldFilter][u].trimpivot() == this.gridData[UcId].defaultNullText) {
						reallyPseudoNull = this.gridData[UcId].differentValues[DataFieldFilter][u];
						finded = true;
						break;
					}
				}
				if (!finded) {
					for (var t = 0; t < data_length - this.gridData[UcId].defaultNullText.length; t++) {
						reallyPseudoNull = reallyPseudoNull + " ";
					}
				}

				if (!nullIncluded) {
					if (excluded.indexOf(reallyPseudoNull) == -1) {
						excluded.push(reallyPseudoNull)
						if (this.gridData[UcId].blackLists[DataFieldFilter].hiddens.indexOf(reallyPseudoNull) == -1) {
							this.gridData[UcId].blackLists[DataFieldFilter].hiddens.push(reallyPseudoNull)
						}
					}
					if (included.indexOf(reallyPseudoNull) != -1) {
						included.splice(included.indexOf(reallyPseudoNull), 1)
					}
					if (this.gridData[UcId].blackLists[DataFieldFilter].visibles.indexOf(reallyPseudoNull) != -1) {
						this.gridData[UcId].blackLists[DataFieldFilter].visibles.splice(this.gridData[UcId].blackLists[DataFieldFilter].visibles.indexOf(reallyPseudoNull), 1)
					}
				} else {
					if (included.indexOf(reallyPseudoNull) == -1) {
						if (excluded.indexOf(reallyPseudoNull) != -1) {
							excluded.splice(excluded.indexOf(reallyPseudoNull), 1)
							included.push(reallyPseudoNull)
						} else {
							if (this.gridData[UcId].blackLists[DataFieldFilter].defaultAction == "Exclude") {
								included.push(reallyPseudoNull)
							}
						}
						if (this.gridData[UcId].blackLists[DataFieldFilter].hiddens.indexOf(reallyPseudoNull) != -1) {
							this.gridData[UcId].blackLists[DataFieldFilter].hiddens.splice(this.gridData[UcId].blackLists[DataFieldFilter].hiddens.indexOf(reallyPseudoNull), 1)
							if (this.gridData[UcId].blackLists[DataFieldFilter].visibles.indexOf(reallyPseudoNull) == -1) {
								this.gridData[UcId].blackLists[DataFieldFilter].visibles.push(reallyPseudoNull)
							}
						}
					}
				}
			}

			var allValuesLoaded = false;
			if (this.gridData[UcId].differentValuesPaginationInfo[DataFieldFilter] != null) {
				allValuesLoaded = (this.gridData[UcId].differentValuesPaginationInfo[DataFieldFilter].previousPage == this.gridData[UcId].differentValuesPaginationInfo[DataFieldFilter].totalPages)
			}
			var noFilterNeeded = (((nullIncluded) || (!this.gridData[UcId].blackLists[DataFieldFilter].hasNull))
				&& (excluded.length == 0) && (NewFilter.op != "none") && (NewFilter.op != "push")
				&& ((this.gridData[UcId].blackLists[DataFieldFilter].defaultAction == "Include") || (allValuesLoaded))
				&& (!(NewFilter.op == "reverse"))
			);

			var pos = 0;
			for (var t = 0; t < this.gridData[UcId].filterInfo.length; t++) {
				if (this.gridData[UcId].filterInfo[t].DataField == DataFieldFilter) {
					filterExist = true;
					this.gridData[UcId].filterInfo[t].NullIncluded = nullIncluded
					this.gridData[UcId].filterInfo[t].NotNullValues.Included = included
					this.gridData[UcId].filterInfo[t].NotNullValues.Excluded = excluded
					this.gridData[UcId].filterInfo[t].NotNullValues.DefaultAction = this.gridData[UcId].blackLists[DataFieldFilter].defaultAction
					pos = t;
				}
			}
			if (noFilterNeeded) {
				this.gridData[UcId].filterInfo.splice(pos, 1)
			}
			if ((!filterExist) && (!noFilterNeeded)) {
				var notNullValues = { Included: included, Excluded: excluded, DefaultAction: this.gridData[UcId].blackLists[DataFieldFilter].defaultAction }
				var filter = { DataField: DataFieldFilter, NullIncluded: nullIncluded, NotNullValues: notNullValues }
				this.gridData[UcId].filterInfo.push(filter);
			}
		},

		readScrollValue: function (UcId, columnNumber) {
			var dataField = this.gridData[UcId].columnDataField[columnNumber];
			var posColumnNumber = this.gridData[UcId].originalColumnDataField.indexOf(this.gridData[UcId].columnDataField[columnNumber])
			if (!this.gridData[UcId].differentValuesPaginationInfo[dataField].blocked) {
				this.gridData[UcId].differentValuesPaginationInfo[dataField].blocked = true;
				if (!this.gridData[UcId].differentValuesPaginationInfo[dataField].filtered) {
					var ValuePageInfo = this.gridData[UcId].differentValuesPaginationInfo[dataField]
					var page = ValuePageInfo.previousPage + 1;
					this.gridData[UcId].lastRequestValue = dataField;
					
					OAT_JS.grid.lastCallToQueryViewer = "readScrollValue"
					OAT_JS.grid.lastCallData = { "self": this, "UcId": UcId, "columnNumber": columnNumber, "filterValue": "", "dataField": dataField }
				
					this.gridData[UcId].Events.requestAttributeForTable(UcId, dataField, page, "", 10, this.gridData[UcId].Container)
					/*qv.collection[this.gridData[UcId].IdForQueryViewerCollection].getAttributeValues((function (resJSON) {
						var res = JSON.parse(resJSON);
						OAT_JS.grid.appendNewValueData(UcId, res)
					}).closure(this), [dataField, page, 10, ""]);*/
				} else {
					var ValuePageInfo = this.gridData[UcId].filteredValuesPaginationInfo[dataField]
					var page = ValuePageInfo.previousPage + 1;
					this.gridData[UcId].lastRequestValue = dataField;
					var filterText = ValuePageInfo.filteredText
					
					OAT_JS.grid.lastCallToQueryViewer = "readScrollValueFilter"
					OAT_JS.grid.lastCallData = { "self": this, "UcId": UcId, "columnNumber": columnNumber, "posColumnNumber": posColumnNumber, "filterValue": filterText, "dataField": dataField, "filterText": filterText }
				
					this.gridData[UcId].Events.requestAttributeForTable(UcId, dataField, page, filterText, 10, this.gridData[UcId].Container)
					/*qv.collection[this.gridData[UcId].IdForQueryViewerCollection].getAttributeValues((function (resJSON) {
						var res = JSON.parse(resJSON);
						OAT_JS.grid.appendNewFilteredValueData(UcId, res, posColumnNumber, filterText)
					}).closure(this), [dataField, page, 10, ValuePageInfo.filteredText]);*/
				}
			}
			var j = 0;
		},
		appendNewValueData: function (UcId, data, whenFilter) {
			var dataField = this.gridData[UcId].lastRequestValue
			var ValuePageInfo = this.gridData[UcId].differentValuesPaginationInfo[dataField]
			if ((data.PageNumber > ValuePageInfo.previousPage) || (whenFilter)) {
				this.gridData[UcId].differentValuesPaginationInfo[dataField].previousPage = data.PageNumber
				this.gridData[UcId].differentValuesPaginationInfo[dataField].totalPages = data.PagesCount
				var newValues = [];

				if (data.Null) {
					if (this.gridData[UcId].differentValues[dataField].indexOf("#NuN#") == -1) {
						this.gridData[UcId].differentValues[dataField].push("#NuN#")
					}
				}

				//add to differentValues
				for (var i = 0; i < data.NotNullValues.length; i++) {
					var val = data.NotNullValues[i];
					if (this.gridData[UcId].differentValues[dataField].indexOf(val) == -1) {
						this.gridData[UcId].differentValues[dataField].push(val)
						newValues.push(val)
					}//lo mismo
					if (this.gridData[UcId].blackLists[dataField].defaultAction == "Include") {
						if ((this.gridData[UcId].blackLists[dataField].visibles.indexOf(val) == -1)
							&& (this.gridData[UcId].blackLists[dataField].hiddens.indexOf(val) == -1)) {
							this.gridData[UcId].blackLists[dataField].visibles.push(val)
						}
					} else {
						if ((this.gridData[UcId].blackLists[dataField].visibles.indexOf(val) == -1)
							&& (this.gridData[UcId].blackLists[dataField].hiddens.indexOf(val) == -1)) {
							this.gridData[UcId].blackLists[dataField].hiddens.push(val)
						}
					}
				}

				var columnNumber = this.gridData[UcId].columnDataField.indexOf(dataField);
				var originalColumn = this.gridData[UcId].originalColumnDataField.indexOf(dataField)

				this.gridData[UcId].grid.loadDifferentValues(columnNumber, this.gridData[UcId].differentValues[dataField])

				for (var nI = 0; nI < newValues.length; nI++) {
					var checked = true;
					if (this.gridData[UcId].blackLists[dataField].state != "all") {
						if (this.gridData[UcId].blackLists[dataField].visibles.indexOf(newValues[nI]) < 0) {
							checked = false;
						}
					}

					if (!((this.gridData[UcId].blackLists[dataField].hasNull) && (newValues[nI].trimpivot() == this.gridData[UcId].defaultNullText))) {
						var pict_value = OAT.ApplyPictureValue(newValues[nI].trimpivot(), this.gridData[UcId].rowsMetadata.columnsDataType[originalColumn],
							this.gridData[UcId].rowsMetadata.defaultPicture, this.gridData[UcId].rowsMetadata.forPivotCustomPicture[originalColumn]).replace(/ /g, "\u00A0");
						OAT.appendNewPairToPopUp(this.gridData[UcId], newValues[nI], columnNumber, checked, pict_value, dataField)
					}
				}
			}
			if (this.gridData[UcId].differentValuesPaginationInfo[dataField].previousPage < data.PagesCount)
				this.gridData[UcId].differentValuesPaginationInfo[dataField].blocked = false;
		},
		resetScrollValue: function (UcId, dataField, columnNumber) { //after filtered when input serach is clean, restor values without filter
			this.gridData[UcId].differentValuesPaginationInfo[dataField].filtered = false;
			this.gridData[UcId].differentValuesPaginationInfo[dataField].blocked = true;

			var columnNumber = this.gridData[UcId].columnDataField.indexOf(dataField);
			var originalColumn = this.gridData[UcId].originalColumnDataField.indexOf(dataField)

			OAT.removeAllPairsFromPopUp(this.gridData[UcId], columnNumber, OAT_JS.grid.cantPages(UcId, dataField) > 1);

			for (var u = 0; u < this.gridData[UcId].differentValues[dataField].length; u++) {
				var checked = true;
				var value = this.gridData[UcId].differentValues[dataField][u];
				if (this.gridData[UcId].blackLists[dataField].state != "all") {
					if (this.gridData[UcId].blackLists[dataField].visibles.indexOf(value) < 0) {
						checked = false;
					}
				}
				var pict_value = OAT.ApplyPictureValue(value.trimpivot(), this.gridData[UcId].rowsMetadata.columnsDataType[originalColumn],
					this.gridData[UcId].rowsMetadata.defaultPicture, this.gridData[UcId].rowsMetadata.forPivotCustomPicture[originalColumn]).replace(/ /g, "\u00A0");

				if (!((this.gridData[UcId].blackLists[dataField].hasNull) && (value.trimpivot() == this.gridData[UcId].defaultNullText))) {
					OAT.appendNewPairToPopUp(this.gridData[UcId], value, columnNumber, checked, pict_value, dataField)
				}
			}

			if (this.gridData[UcId].differentValuesPaginationInfo[dataField].previousPage < OAT_JS.grid.cantPages(UcId, dataField))
				this.gridData[UcId].differentValuesPaginationInfo[dataField].blocked = false;
		},
		resetAllScrollValue: function (UcId) { //when closing the filter popup
			for (var id = 0; id < this.gridData[UcId].grid.columns.length; id++) {
				var field = this.gridData[UcId].grid.columns[id].getAttribute("dataField");
				this.gridData[UcId].differentValuesPaginationInfo[field].filtered = false;
				this.gridData[UcId].differentValuesPaginationInfo[field].blocked = true;
				if (this.gridData[UcId].differentValuesPaginationInfo[field].previousPage < this.gridData[UcId].differentValuesPaginationInfo[field].totalPages)
					this.gridData[UcId].differentValuesPaginationInfo[field].blocked = false;
			}
		},
		appendNewFilteredValueData: function (UcId, data, columnNumber, filterValue) { //add pairs when filtering by filter input
			var dataField = this.gridData[UcId].lastRequestValue
			var columnNumber = this.gridData[UcId].columnDataField.indexOf(dataField);
			var originalColumn = this.gridData[UcId].originalColumnDataField.indexOf(dataField)

			var ValuePageInfo = this.gridData[UcId].filteredValuesPaginationInfo[dataField]
			if (((filterValue) || (filterValue == "")) && (ValuePageInfo.filteredText != filterValue)) {
				return;
			}
			if (data.PageNumber > ValuePageInfo.previousPage) {
				this.gridData[UcId].filteredValuesPaginationInfo[dataField].previousPage = data.PageNumber
				this.gridData[UcId].filteredValuesPaginationInfo[dataField].totalPages = data.PagesCount

				if (data.Null) {
					if (this.gridData[UcId].differentValues[dataField].indexOf("#NuN#") == -1) {
						this.gridData[UcId].differentValues[dataField].push("#NuN#")
					}
				}

				for (var i = 0; i < data.NotNullValues.length; i++) {
					var alreadyInValues = (this.gridData[UcId].differentValues[dataField].indexOf(data.NotNullValues[i]) != -1)
					//append to different values
					if (this.gridData[UcId].differentValues[dataField].indexOf(data.NotNullValues[i]) == -1) {
						this.gridData[UcId].differentValues[dataField].push(data.NotNullValues[i])
					}
					if ((this.gridData[UcId].blackLists[dataField].defaultAction == "Include") && (!alreadyInValues)) {
						if ((this.gridData[UcId].blackLists[dataField].visibles.indexOf(data.NotNullValues[i]) == -1)
							&& (this.gridData[UcId].blackLists[dataField].hiddens.indexOf(data.NotNullValues[i]) == -1)) {
							this.gridData[UcId].blackLists[dataField].visibles.push(data.NotNullValues[i])
						}
					} else {
						if ((this.gridData[UcId].blackLists[dataField].visibles.indexOf(data.NotNullValues[i]) == -1)
							&& (this.gridData[UcId].blackLists[dataField].hiddens.indexOf(data.NotNullValues[i]) == -1)) {
							this.gridData[UcId].blackLists[dataField].hiddens.push(data.NotNullValues[i])
						}
					}

					var checked = true;
					if (this.gridData[UcId].blackLists[dataField].state != "all") {
						if (this.gridData[UcId].blackLists[dataField].visibles.indexOf(data.NotNullValues[i]) < 0) {
							checked = false;
						}
					}
					var pict_value = OAT.ApplyPictureValue(data.NotNullValues[i].trimpivot(), this.gridData[UcId].rowsMetadata.columnsDataType[originalColumn],
						this.gridData[UcId].rowsMetadata.defaultPicture, this.gridData[UcId].rowsMetadata.forPivotCustomPicture[originalColumn]).replace(/ /g, "\u00A0");
					if (!((this.gridData[UcId].blackLists[dataField].hasNull) && (data.NotNullValues[i].trimpivot() == this.gridData[UcId].defaultNullText))) {
						OAT.appendNewPairToPopUp(this.gridData[UcId], data.NotNullValues[i], columnNumber, checked, pict_value, dataField)
					}
				}
				if (this.gridData[UcId].filteredValuesPaginationInfo[dataField].previousPage < data.PagesCount)
					this.gridData[UcId].differentValuesPaginationInfo[dataField].blocked = false;
			}
		},
		initValueRead: function (UcId, columnNumber, requestDataField) {
			if (columnNumber >= this.gridData[UcId].grid.columns.length) {
				this.gridData[UcId].endValueRead = true;
				return;
			} else {
			  if (this.gridData[UcId].grid.columns[columnNumber].getAttribute("visible") != "Never"){
			  	if (requestDataField == undefined){
					this.gridData[UcId].grid.lastRequestValue = this.gridData[UcId].grid.columns[columnNumber].getAttribute("dataField")
				} else {
					this.gridData[UcId].grid.lastRequestValue = requestDataField
				}
				
				if (this.gridData[UcId].differentValuesPaginationInfo[this.gridData[UcId].grid.lastRequestValue].previousPage > 0){
					if (requestDataField == undefined){
						columnNumber++;
						OAT_JS.grid.initValueRead(UcId, columnNumber)
					}
				}
				
				var cantItems = 10;
				if ((this.gridData[UcId].QueryViewerCollectionItem.AutoRefreshGroup != "")) {
					cantItems = 0;
				}
				
				
				OAT_JS.grid.lastCallToQueryViewer = "initValueRead"
				OAT_JS.grid.lastCallData = { "self": this, "UcId": UcId, "columnNumber": columnNumber, "filterValue": "", "dataField": requestDataField }
				
				this.gridData[UcId].Events.requestAttributeForTable(UcId, this.gridData[UcId].grid.lastRequestValue, 1, "", cantItems, this.gridData[UcId].Container)
				
				
				
				/*qv.collection[this.gridData[UcId].IdForQueryViewerCollection].getAttributeValues((function (resJSON) {
					var data = JSON.parse(resJSON);
					//load data
					dataField = this.gridData[UcId].grid.lastRequestValue
					this.gridData[UcId].differentValuesPaginationInfo[dataField].previousPage = data.PageNumber
					this.gridData[UcId].differentValuesPaginationInfo[dataField].totalPages = data.PagesCount

					//end load data
					var columnNumber = 0;
					for (var t = 0; t < this.gridData[UcId].grid.columns.length; t++) {
						if (this.gridData[UcId].grid.lastRequestValue == this.gridData[UcId].grid.columns[t].getAttribute("dataField")) {
							columnNumber = t;
							break;
						}
					}


					//null value?
					if (data.Null) {
						this.gridData[UcId].blackLists[dataField].hasNull = true;
						if (this.gridData[UcId].differentValues[dataField].indexOf("#NuN#") == -1) {
							this.gridData[UcId].differentValues[dataField].push("#NuN#")
						}
						var nullIncluded = true;
						for (var i = 0; i < this.gridData[UcId].filterInfo.length; i++) {
							if (this.gridData[UcId].filterInfo[i].DataField == dataField) {
								if (!this.gridData[UcId].filterInfo[i].NullIncluded) {
									nullIncluded = false;
								}
							}
						}
						if ((nullIncluded) && (this.gridData[UcId].blackLists[dataField].visibles.indexOf("#NuN#") == -1)) {
							this.gridData[UcId].blackLists[dataField].visibles.push("#NuN#");
						}
					} else {
						this.gridData[UcId].blackLists[dataField].hasNull = false;
					}


					for (var i = 0; i < data.NotNullValues.length; i++) {
						if (this.gridData[UcId].differentValues[dataField].indexOf(data.NotNullValues[i]) == -1) {
							this.gridData[UcId].differentValues[dataField].push(data.NotNullValues[i])
						}
						if ((this.gridData[UcId].blackLists[dataField].state == "all")
							&& (this.gridData[UcId].blackLists[dataField].visibles.indexOf(data.NotNullValues[i]) == -1)) {
							this.gridData[UcId].blackLists[dataField].visibles.push(data.NotNullValues[i])
						}
						if ((this.gridData[UcId].blackLists[dataField].state == "none")
							&& (this.gridData[UcId].blackLists[dataField].hiddens.indexOf(data.NotNullValues[i]) == -1)) {
							this.gridData[UcId].blackLists[dataField].hiddens.push(data.NotNullValues[i])
						}
						if ((this.gridData[UcId].blackLists[dataField].defaultAction == "Exclude")
							&& (this.gridData[UcId].blackLists[dataField].state == "") && (data.NotNullValues[i].trimpivot() != "")
							&& (this.gridData[UcId].blackLists[dataField].visibles.length > 0)) { //correct blanck spaces when initial user filter
							for (var j = 0; j < this.gridData[UcId].blackLists[dataField].visibles.length; j++) {
								if (this.gridData[UcId].blackLists[dataField].visibles[j] == data.NotNullValues[i].trimpivot()) {
									this.gridData[UcId].blackLists[dataField].visibles[j] = data.NotNullValues[i]
								}
							}
						}
					}



					this.gridData[UcId].grid.loadDifferentValues(columnNumber, this.gridData[UcId].differentValues[dataField]);
					
					if (requestDataField == undefined){
						columnNumber++;
						OAT_JS.grid.initValueRead(UcId, columnNumber)
					}

				}).closure(this), [this.gridData[UcId].grid.lastRequestValue, 1, cantItems, ""]);*/
			  } else {
			  		columnNumber++;
					OAT_JS.grid.initValueRead(UcId, columnNumber, requestDataField)
			  }
			}
		},
		initValueLoad: function (data, UcId, requestDataField){
			//load data
			var dataField = this.gridData[UcId].grid.lastRequestValue
			this.gridData[UcId].differentValuesPaginationInfo[dataField].previousPage = data.PageNumber
			this.gridData[UcId].differentValuesPaginationInfo[dataField].totalPages = data.PagesCount

			//end load data
			var columnNumber = 0;
			for (var t = 0; t < this.gridData[UcId].grid.columns.length; t++) {
				if (this.gridData[UcId].grid.lastRequestValue == this.gridData[UcId].grid.columns[t].getAttribute("dataField")) {
					columnNumber = t;
					break;
				}
			}


			//null value?
			if (data.Null) {
				this.gridData[UcId].blackLists[dataField].hasNull = true;
				if (this.gridData[UcId].differentValues[dataField].indexOf("#NuN#") == -1) {
					this.gridData[UcId].differentValues[dataField].push("#NuN#")
				}
				var nullIncluded = true;
				for (var i = 0; i < this.gridData[UcId].filterInfo.length; i++) {
					if (this.gridData[UcId].filterInfo[i].DataField == dataField) {
						if (!this.gridData[UcId].filterInfo[i].NullIncluded) {
							nullIncluded = false;
						}
					}
				}
				if ((nullIncluded) && (this.gridData[UcId].blackLists[dataField].visibles.indexOf("#NuN#") == -1)) {
					this.gridData[UcId].blackLists[dataField].visibles.push("#NuN#");
				}
			} else {
				this.gridData[UcId].blackLists[dataField].hasNull = false;
			}


			for (var i = 0; i < data.NotNullValues.length; i++) {
				if (this.gridData[UcId].differentValues[dataField].indexOf(data.NotNullValues[i]) == -1) {
					this.gridData[UcId].differentValues[dataField].push(data.NotNullValues[i])
				}
				if ((this.gridData[UcId].blackLists[dataField].state == "all")
					&& (this.gridData[UcId].blackLists[dataField].visibles.indexOf(data.NotNullValues[i]) == -1)) {
					this.gridData[UcId].blackLists[dataField].visibles.push(data.NotNullValues[i])
				}
				if ((this.gridData[UcId].blackLists[dataField].state == "none")
					&& (this.gridData[UcId].blackLists[dataField].hiddens.indexOf(data.NotNullValues[i]) == -1)) {
						this.gridData[UcId].blackLists[dataField].hiddens.push(data.NotNullValues[i])
				}
				if ((this.gridData[UcId].blackLists[dataField].defaultAction == "Exclude")
					&& (this.gridData[UcId].blackLists[dataField].state == "") && (data.NotNullValues[i].trimpivot() != "")
					&& (this.gridData[UcId].blackLists[dataField].visibles.length > 0)) { //correct blanck spaces when initial user filter
					for (var j = 0; j < this.gridData[UcId].blackLists[dataField].visibles.length; j++) {
						if (this.gridData[UcId].blackLists[dataField].visibles[j] == data.NotNullValues[i].trimpivot()) {
							this.gridData[UcId].blackLists[dataField].visibles[j] = data.NotNullValues[i]
						}
					}
				}
			}



			this.gridData[UcId].grid.loadDifferentValues(columnNumber, this.gridData[UcId].differentValues[dataField]);
					
			if (requestDataField == undefined){
				columnNumber++;
				OAT_JS.grid.initValueRead(UcId, columnNumber)
			}
		},
		changeValues: function (UcId, dataField, columnNumber, data, filterText) { //when filter by search filter, delete pairs and show new ones
			var searchInput = jQuery("#" + UcId + dataField)[0];

			if (((searchInput.value) || (searchInput.value == "")) && (searchInput.value != filterText)) {
				return;
			}

			var columnNumber = this.gridData[UcId].columnDataField.indexOf(dataField);
			var originalColumn = this.gridData[UcId].originalColumnDataField.indexOf(dataField)

			this.gridData[UcId].differentValuesPaginationInfo[dataField].filtered = true;
			this.gridData[UcId].differentValuesPaginationInfo[dataField].blocked = true;
			OAT.removeAllPairsFromPopUp(this.gridData[UcId], columnNumber, data.PagesCount > 1);

			//set filtered pagination info
			this.gridData[UcId].filteredValuesPaginationInfo[dataField].previousPage = 1
			this.gridData[UcId].filteredValuesPaginationInfo[dataField].totalPages = data.PagesCount
			this.gridData[UcId].filteredValuesPaginationInfo[dataField].filteredText = filterText

			for (var i = 0; i < data.NotNullValues.length; i++) {
				var alreadyInValues = (this.gridData[UcId].differentValues[dataField].indexOf(data.NotNullValues[i]) != -1)
				//append to different values
				if (this.gridData[UcId].differentValues[dataField].indexOf(data.NotNullValues[i]) == -1) {
					this.gridData[UcId].differentValues[dataField].push(data.NotNullValues[i])
				}
				if ((this.gridData[UcId].blackLists[dataField].state == "all") ||
					((this.gridData[UcId].blackLists[dataField].defaultAction == "Include") && (!alreadyInValues))) {
					//if Include new values and is a new value
					if ((this.gridData[UcId].blackLists[dataField].visibles.indexOf(data.NotNullValues[i]) == -1)
						&& (this.gridData[UcId].blackLists[dataField].hiddens.indexOf(data.NotNullValues[i]) == -1)) {
						this.gridData[UcId].blackLists[dataField].visibles.push(data.NotNullValues[i])
					}
				}
				//


				var checked = true;
				if (this.gridData[UcId].blackLists[dataField].state != "all") {
					if (this.gridData[UcId].blackLists[dataField].visibles.indexOf(data.NotNullValues[i]) < 0) {
						checked = false;
					}
				}
				this.gridData[UcId].filteredValuesPaginationInfo[dataField].values.push(data.NotNullValues[i]);
				var pict_value = OAT.ApplyPictureValue(data.NotNullValues[i].trimpivot(), this.gridData[UcId].rowsMetadata.columnsDataType[originalColumn],
					this.gridData[UcId].rowsMetadata.defaultPicture, this.gridData[UcId].rowsMetadata.forPivotCustomPicture[originalColumn]).replace(/ /g, "\u00A0");
				if (!((this.gridData[UcId].blackLists[dataField].hasNull) && (data.NotNullValues[i].trimpivot() == this.gridData[UcId].defaultNullText))) {
					OAT.appendNewPairToPopUp(this.gridData[UcId], data.NotNullValues[i], columnNumber, checked, pict_value, dataField);
				}
			}

			if (data.PagesCount > 0)
				this.gridData[UcId].differentValuesPaginationInfo[dataField].blocked = false;
		},
		setColumnVisibleValue: function (UcId, column, visible) {
			var origColumnNumber = this.gridData[UcId].originalColumnDataField.indexOf(this.gridData[UcId].columnDataField[column])
			this.gridData[UcId].columnVisible[origColumnNumber] = visible
			OAT.SaveStateWhenServerPaging(OAT_JS.grid.gridData[UcId], UcId, OAT_JS.grid.gridData[UcId].blackLists, OAT_JS.grid.gridData[UcId].columnVisible,
				OAT_JS.grid.gridData[UcId].columnDataField)

			//call autorefresh
			if (this.gridData[UcId].QueryViewerCollectionItem.AutoRefreshGroup != "") {
				
				OAT_JS.grid.initValueRead(UcId, 0)
				
				var wait = function(){
					if (!OAT_JS.grid.gridData[UcId].endValueRead) {
						setTimeout( wait , 100)
					} else {
						var meta = OAT.createXMLMetadata(OAT_JS.grid.gridData[UcId], null, true);
						var container = OAT_JS.grid.gridData[UcId].Container
						var spl = OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection;
						
						
						setTimeout( function() {
				
							var paramobj = {  "QueryviewerId": spl, "Metadata": meta};
							var evt = new Event("Events");
							evt.initEvent("RequestUpdateLayoutSameGroup", true, true);
							evt.parameter = paramobj;
							container.dispatchEvent(evt);
				
						}, 50)
						
						/*var listennings = qv.collection[spl];
						if ((listennings != "") && (listennings != null) && (listennings != undefined)) {
							qv.util.autorefresh.UpdateLayoutSameGroup(listennings, qv.pivot.GetRuntimeMetadata(meta, listennings.RealType), true);
						}*/
					}
				}
				wait();
			}

		},
		getTableWhenServerPagination: function (UcId, res) {
			//var res = qv.collection[OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection].getPageDataForTableSync([1, 0, true, "", "", OAT_JS.grid.gridData[UcId].filterInfo, false]);
			var t = 0;
			var records = res.split("<Recordset");
			var rec = "<Recordset" + records[1]
			var last = rec.split("</Page>");
			var finalRes = last[0] + '</Page>\n</Recordset>';//"</Table>";
			return finalRes;
		},
		setFilterChangedWhenServerPagination: function (UcId, oatDimension) {
			if ((this.gridData[UcId].QueryViewerCollectionItem.FilterChanged) /*|| (qv.util.isGeneXusPreview())*/) {
				var df = oatDimension.getAttribute("dataField")

				var difValues = OAT_JS.grid.gridData[UcId].differentValues[df];
				var diffValuesPagInfo = OAT_JS.grid.gridData[UcId].differentValuesPaginationInfo[df];

				if (OAT_JS.grid.gridData[UcId].differentValuesPaginationInfo[df].previousPage == OAT_JS.grid.gridData[UcId].differentValuesPaginationInfo[df].totalPages) {

					var blacInfo = OAT_JS.grid.gridData[UcId].blackLists[df]

					var datastr = "<DATA event=\"FilterChanged\" name=\"" + oatDimension.getAttribute("name") + "\" displayName=\"" + oatDimension.getAttribute("displayName") + "\">"

					for (var dvi = 0; dvi < difValues.length; dvi++) {
						var checked = true;
						if (OAT_JS.grid.gridData[UcId].blackLists[df].state != "all") {
							if (OAT_JS.grid.gridData[UcId].blackLists[df].visibles.indexOf(difValues[dvi]) < 0) {
								checked = false;
							}
						}
						if (checked) {
							datastr = datastr + '<VALUE>' + difValues[dvi] + '</VALUE>';
						}
					}

					datastr = datastr + "</DATA>"


					/*if (qv.util.isGeneXusPreview())
						window.external.SendText(qv.collection[OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection].ControlName, datastr);*/

					//var xml_doc = qv.util.dom.xmlDocument(datastr);
					var iparser = new DOMParser();
					var xml_doc = iparser.parseFromString(datastr, "text/xml");
					
					var selectXPathNode = function (xmlDoc, xpath) {
						var nodes;
						var node;
						if (xmlDoc.evaluate) { // Firefox, Chrome, Opera and Safari
							nodes = xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null);
							node = nodes.iterateNext();
						} else {			// Internet Explorer
							nodes = xmlDoc.selectNodes(xpath);
							node = (nodes.length > 0 ? nodes[0] : null);
						}
						return node;
					}
					
					var Node = selectXPathNode(xml_doc, "/DATA");
					/*qv.collection[OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection].FilterChangedData = {};
					qv.collection[OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection].FilterChangedData.Name = Node.getAttribute("name");
					qv.collection[OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection].FilterChangedData.SelectedValues = [];
					var valueIndex = -1;
					for (var i = 0; i < Node.childNodes.length; i++)
						if (Node.childNodes[i].nodeName == "VALUE") {
							valueIndex++;
							qv.collection[OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection].FilterChangedData.SelectedValues[valueIndex] = Node.childNodes[i].firstChild.nodeValue;
						}*/
						
					var FilterChangedData = {};
					FilterChangedData.Name = Node.getAttribute("name");
					FilterChangedData.SelectedValues = [];
					var valueIndex = -1;
					for (var i = 0; i < Node.childNodes.length; i++)
						if (Node.childNodes[i].nodeName == "VALUE") {
							valueIndex++;
							FilterChangedData.SelectedValues[valueIndex] = Node.childNodes[i].firstChild.nodeValue;
						}	
						
					self.fireOnFilterChanged(UcId, FilterChangedData, OAT_JS.grid.gridData[UcId].Container)
					/*if (qv.collection[OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection].FilterChanged) {
						qv.collection[OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection].FilterChanged();
					}*/
				} else {
					OAT_JS.grid.gridData[UcId].differentValuesPaginationInfo[df].blocked = true;
					var ValuePageInfo = OAT_JS.grid.gridData[UcId].differentValuesPaginationInfo[df]
					var page = ValuePageInfo.previousPage + 1;
					OAT_JS.grid.gridData[UcId].lastRequestValue = df;
					
					OAT_JS.grid.lastCallToQueryViewer = "filterChange"
					OAT_JS.grid.lastCallData = { "self": this, "UcId": UcId,  "filterValue": "", "dataField": df, "oatDimension": oatDimension }
				
					OAT_JS.grid.gridData[UcId].Events.requestAttributeForTable(UcId, df, page, "", 0, OAT_JS.grid.gridData[UcId].Container)
				
					/*qv.collection[OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection].getAttributeValues((function (resJSON) {
						var res = JSON.parse(resJSON);
						OAT_JS.grid.appendNewValueData(UcId, res, true)
						OAT_JS.grid.setFilterChangedWhenServerPagination(UcId, oatDimension)
					}).closure(this), [df, page, 0, ""]);*/
				}
			}

		},
		
		getAllDataRowsForExport: function (UcId, _selfgrid, fileName, format) {
			
			OAT_JS.grid.lastCallToQueryViewer = "getAllDataRowsForExport"
			OAT_JS.grid.lastCallData = {  "UcId": UcId, "_selfgrid":_selfgrid, "fileName":fileName, "format": format}
			self.requestPageDataForTable(1, 0, false, OAT_JS.grid.gridData[UcId].dataFieldOrder, OAT_JS.grid.gridData[UcId].orderType, OAT_JS.grid.gridData[UcId].filterInfo, false, OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection, OAT_JS.grid.gridData[UcId].Container)
				
			
			/*
			qv.collection[OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection].getPageDataForTable((function (resXML) {
				var dataString = resXML;
				var stringRecord = dataString.split("<Record>");
				var data = []
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

			}).closure(this), [1, 0, false, OAT_JS.grid.gridData[UcId].dataFieldOrder, OAT_JS.grid.gridData[UcId].orderType, OAT_JS.grid.gridData[UcId].filterInfo], false);
*/
			
		},
		restoreDefaultView: function (UcId) {
			this.gridData[UcId].redrawHeader = true
			this.gridData[UcId].columnDataField = this.gridData[UcId].originalColumnDataField
			//reset order
			OAT_JS.grid.gridData[UcId].dataFieldOrder = ""
			OAT_JS.grid.gridData[UcId].orderType = ""
			//reset filter info
			this.gridData[UcId].filterInfo = [];
			var tempInfo = [];
			for (var id = 0; id < OAT_JS.grid.gridData[UcId].grid.columns.length; id++) {
				tempInfo[OAT_JS.grid.gridData[UcId].grid.columns[id].getAttribute("dataField")] = this.gridData[UcId].blackLists[OAT_JS.grid.gridData[UcId].grid.columns[id].getAttribute("dataField")].hasNull;
			}
			for (var id = 0; id < OAT_JS.grid.gridData[UcId].grid.columns.length; id++) {
				this.gridData[UcId].blackLists[OAT_JS.grid.gridData[UcId].grid.columns[id].getAttribute("dataField")] = {
					state: "all", visibles: [], defaultAction: "Include", hiddens: [],
					hasNull: tempInfo[OAT_JS.grid.gridData[UcId].grid.columns[id].getAttribute("dataField")]
				};
			}
			
			var indexHeader = 0
			for (var c = 0; c < this.gridData[UcId].columnVisible.length; c++) {
				this.gridData[UcId].grid.applySortOrderType(c, 1);
				this.gridData[UcId].columnVisible[c] = OAT_JS.grid.gridData[UcId].grid.columns[c].getAttribute("visible").toLowerCase() == "yes"; //true;
				if (this.gridData[UcId].columnVisible[c]){
					this.gridData[UcId].grid.showColumnHeader(indexHeader);
					indexHeader = indexHeader + 1;
				} else {
					this.gridData[UcId].grid.hideColumnHeader(indexHeader);
					indexHeader = indexHeader + 1;
				}
			}

			this.gridData[UcId].rowsPerPage = this.gridData[UcId].defaultValues.rowsPerPage
			if (jQuery("#" + this.gridData[UcId].grid.controlName + "tablePagination_rowsPerPage").length > 0) {
				jQuery("#" + this.gridData[UcId].grid.controlName + "tablePagination_rowsPerPage")[0].value = this.gridData[UcId].defaultValues.rowsPerPage
			}

		},
		getStateChange: function (UcId) {
			if (this.gridData[UcId].rowsPerPage != this.gridData[UcId].defaultValues.rowsPerPage) {
				return true;
			}
			if ((this.gridData[UcId].defaultValues.dataFieldOrder != OAT_JS.grid.gridData[UcId].dataFieldOrder) || (this.gridData[UcId].defaultValues.orderType != OAT_JS.grid.gridData[UcId].orderType)) {
				return true;
			}
			if ((this.gridData[UcId].filterInfo != undefined) && (this.gridData[UcId].filterInfo.length > 0)) {
				return true
			}
			for (var t = 0; t < this.gridData[UcId].columnVisible.length; t++) {
				var defaultVisible = OAT_JS.grid.gridData[UcId].grid.columns[t].getAttribute("visible").toLowerCase() == "yes";
				if (this.gridData[UcId].columnVisible[t] != defaultVisible) {
					return true
				}
			}
			for (var c = 0; c < this.gridData[UcId].columnDataField.length; c++) {
				if (this.gridData[UcId].columnDataField[c] != this.gridData[UcId].originalColumnDataField[c])
					return true
			}
			
			return false
		},
		refreshPivotWhenServerPagination: function (UcId, dataFieldOrderChanged, OrderChanged, dataFieldPositions) {

			self.getDataForTable(UcId, 1, this.gridData[UcId].rowsPerPage, true, dataFieldOrderChanged, OrderChanged, "", "", "", true);
		},
		moveToFirstPage: function (UcId) {
			if (this.gridData[UcId].actualPageNumber > 1) {
				self.getDataForTable(UcId, 1, this.gridData[UcId].rowsPerPage, false, "", "", "", "", false);
			}
		},
		moveToNextPage: function (UcId) {
			if (this.gridData[UcId].actualPageNumber < this.gridData[UcId].actualCantPages) {
				self.getDataForTable(UcId, this.gridData[UcId].actualPageNumber + 1, this.gridData[UcId].rowsPerPage, false, "", "", "", "", false);
			}
		},
		moveToLastPage: function (UcId) {
			if (this.gridData[UcId].actualPageNumber < this.gridData[UcId].actualCantPages) {
				self.getDataForTable(UcId, this.gridData[UcId].actualCantPages, this.gridData[UcId].rowsPerPage, false, "", "", "", "", false);
			}
		},
		moveToPreviousPage: function (UcId) {
			if (this.gridData[UcId].actualPageNumber > 1) {
				self.getDataForTable(UcId, this.gridData[UcId].actualPageNumber - 1, this.gridData[UcId].rowsPerPage, false, "", "", "", "", false);
			}
		},
		cantPages: function (UcId, dataField) {
			return this.gridData[UcId].differentValuesPaginationInfo[dataField].totalPages
		},
		setDataFieldPosition: function (UcId, dataFieldPositions) {
			this.gridData[UcId].columnDataField = []
			this.gridData[UcId].columnDataField = dataFieldPositions
			
			OAT.SaveStateWhenServerPaging(this.gridData[UcId], UcId, this.gridData[UcId].blackLists, this.gridData[UcId].columnVisible,
				this.gridData[UcId].columnDataField)

			//call autorefresh
			if (this.gridData[UcId].QueryViewerCollectionItem.AutoRefreshGroup != "") {
				OAT_JS.grid.initValueRead(UcId, 0)
				
				var wait = function(){
					if (!OAT_JS.grid.gridData[UcId].endValueRead) {
						setTimeout( wait , 100)
					} else {
						var meta = OAT.createXMLMetadata(OAT_JS.grid.gridData[UcId], null, true);
						var spl = OAT_JS.grid.gridData[UcId].IdForQueryViewerCollection;
						var container = OAT_JS.grid.gridData[UcId].Container
						setTimeout( function() {
				
							var paramobj = {  "QueryviewerId": spl, "Metadata": meta};
							var evt = new Event("Events");
							evt.initEvent("RequestUpdateLayoutSameGroup", true, true);
							evt.parameter = paramobj;
							container.dispatchEvent(evt);
				
						}, 50)
						/*var listennings = qv.collection[spl];
						if ((listennings != "") && (listennings != null) && (listennings != undefined)) {
							qv.util.autorefresh.UpdateLayoutSameGroup(listennings, qv.pivot.GetRuntimeMetadata(meta, listennings.RealType), true);
						}*/
					}
				}
				wait();
			}
		},
		fireOnItemClickEvent: function(query, datastr, flag, container){
			setTimeout( function() {
				var paramobj = {"QueryViewer": query, "Data": datastr, "QueryviewerId": self.IdForQueryViewerCollection};
				var evt = new Event("Events");
				evt.initEvent("TableOnItemClickEvent", true, true);
				evt.parameter = paramobj;
				container.dispatchEvent(evt);
			}, 0)
		},		
		requestDataSynForTable: function(UcId, container){
			setTimeout( function() {
				var paramobj = {"QueryviewerId": UcId};
				var evt = new Event("Events");
				evt.initEvent("RequestDataSynForTable", true, true);
				evt.parameter = paramobj;
				container.dispatchEvent(evt);
			}, 0)
		},
		addValueToDifferentValues: function (UcId, dataField, val) {
			var originalColumn = this.gridData[UcId].originalColumnDataField.indexOf(dataField);
			var dataType = this.gridData[UcId].grid.columnsDataType[originalColumn];
			var sortInt = false;
			if ((dataType == "integer") || (dataType == "real")) {
				sortInt = true;
			}



			var tempData = [];
			var added = false;

			if (val == "#NuN#") {
				tempData.push(val);
				added = true;
			}

			for (var l = 0; l < this.gridData[UcId].differentValues[dataField].length; l++) {
				if (!sortInt) {
					if ((val < this.gridData[UcId].differentValues[dataField][l]) && (!added)) {
						tempData.push(val);
						added = true;
					}
					tempData.push(this.gridData[UcId].differentValues[dataField][l])
				} else {
					if ((parseFloat(val) < parseFloat(this.gridData[UcId].differentValues[dataField][l])) && (!added)) {
						tempData.push(val);
						added = true;
					}
					tempData.push(this.gridData[UcId].differentValues[dataField][l])
				}
			}

			if (!added) {
				tempData.push(val)
			}

			this.gridData[UcId].differentValues[dataField] = tempData;

		}
	}

	OAT_JS.pivot = {
		panel: 1,
		tab: 5,
		div: "",
		needs: ["pivot", "statistics"],
		cb: function (_mthis, pivotdiv, page, content, defaultPicture, QueryViewerCollection, colms, formatValue, conditionalFormatsColumns,
			formatValueMeasures, autoResize, disableColumnSort, UcId, IdForQueryViewerCollection, rememberLayout, ShowMeasuresAsRows,
			formulaInfo, fullRecord, serverPagination, pagingData, HideDataFilds, OrderFildsHidden, initMetadata, relativePath, pivotParams) {
			this.div = pivotdiv;
			var cols = _mthis.columnNumbers.length + _mthis.rowNumbers.length + _mthis.filterNumbers.length;
			if (_mthis.measures.length > 1) {
				var prevCol = cols;
				cols = cols + _mthis.measures.length - 1;
				for (var i = prevCol; i < cols; i++) {
					_mthis.columnNumbers.push(i);
				}
			} else {
				for (var i = 0; i < _mthis.data.length; i++) {
					_mthis.data[i].push("0");
				}
			}
			var pivot;
			// try {
				pivot = new OAT.Pivot(_mthis, content, page, _mthis.header, _mthis.data, _mthis.columnNumbers, _mthis.rowNumbers, _mthis.filterNumbers, cols, _mthis.query, _mthis.conditionalFormats, UcId, _mthis.pageSize, defaultPicture, QueryViewerCollection, colms, pivotdiv,
					formatValue, conditionalFormatsColumns, formatValueMeasures, _mthis.measures, autoResize, disableColumnSort, UcId, IdForQueryViewerCollection, rememberLayout,
					ShowMeasuresAsRows, formulaInfo, fullRecord, serverPagination, pagingData, HideDataFilds, OrderFildsHidden, initMetadata, relativePath,
					{ Allow: pivotParams.AllowSelection, EntireLine: pivotParams.SelectLine}, { TotalForRows: pivotParams.TotalForRows, TotalForColumns: pivotParams.TotalForColumns } , pivotParams.Title, pivotParams.container);
			// } catch (Error) {
				// alert(Error)
			// }
			return pivot;
		}
	}

	function parseToIntRegisterValue(string, registerValue) {
		if (string.indexOf(registerValue) > 0) {
			var tmpstr = string.split(registerValue + '="');
			if (tmpstr.length == 1) {
				tmpstr = string.split(registerValue + "='");
				return (tmpstr[1]) ? parseInt(tmpstr[1].split("'")[0]) : -1;
			}
			return (tmpstr[1]) ? parseInt(tmpstr[1].split('"')[0]) : -1;
		}
		return -1;
	}

	function parseToStringRegisterValue(string, registerValue) {
		if (string.indexOf(registerValue) > 0) {
			var tmpstr = string.split(registerValue + '="');
			if (tmpstr.length == 1) {
				tmpstr = string.split(registerValue + "='");
				return (tmpstr[1]) ? (tmpstr[1].split("'")[0]) : -1;
			}
			return (tmpstr[1]) ? (tmpstr[1].split('"')[0]) : -1;
		}
		return -1;
	}

	function EvaluateExpressionPivotJs(expression, data, formulaInfo) {
		var tokens = []
		for (var i = 0; i < expression.length; i++) {
			tokens[i] = expression[i]
		}
		var evalStack = [];

		while (tokens.length != 0) {
			var currentToken = tokens.shift();
			if (isOperator(currentToken)) {
				var operand1 = evalStack.pop();
				var operand2 = evalStack.pop();

				var result = PerformOperation(parseFloat(operand1), parseFloat(operand2), currentToken);
				evalStack.push(result);
			} else {
				if (isNaN(parseInt(currentToken))) {
					if (data[formulaInfo.itemPosition[currentToken]] == "#NuN#") return "#NuN#";
					evalStack.push(data[formulaInfo.itemPosition[currentToken]]);
				} else {
					evalStack.push(currentToken);
				}
			}
		}
		return evalStack.pop();
	}

	function PerformOperation(operand1, operand2, operator) {
		switch (operator) {
			case '+':
				return operand1 + operand2;
			case '-':
				return operand2 - operand1;
			case '*':
				return operand1 * operand2;
			case '/':
				return operand2 / operand1;
			default:
				return;
		}

	}

	function InfixToPostfix(expression) {
		//var tokens = expression.split(/([0-9]+|[*+-\/()])/);
		var tokens = expression.split(" ");
		var outputQueue = [];
		var operatorStack = [];

		while (tokens.length != 0) {
			var currentToken = tokens.shift();

			if (isOperator(currentToken)) {
				while ((getAssociativity(currentToken) == 'left' &&
					getPrecedence(currentToken) <= getPrecedence(operatorStack[operatorStack.length - 1])) ||
					(getAssociativity(currentToken) == 'right' &&
						getPrecedence(currentToken) < getPrecedence(operatorStack[operatorStack.length - 1]))) {
					outputQueue.push(operatorStack.pop())
				}

				operatorStack.push(currentToken);

			}
			else if (currentToken == '(') {
				operatorStack.push(currentToken);
			}
			else if (currentToken == ')') {
				while (operatorStack[operatorStack.length - 1] != '(') {
					if (operatorStack.length == 0)
						throw ("");

					outputQueue.push(operatorStack.pop());
				}
				operatorStack.pop();
			} else {
				outputQueue.push(currentToken);
			}
		}

		while (operatorStack.length != 0) {
			if (!operatorStack[operatorStack.length - 1].match(/([()])/))
				outputQueue.push(operatorStack.pop());
			else
				throw ("Parenthesis balancing error! Shame on you!");
		}

		return outputQueue.join(" ");
	}


	function isOperator(token) {
		if (!token.match(/([*+-\/])/))
			return false;
		else
			return true;
	}


	function isNumber(token) {
		if (!token.match(/([0-9]+)/))
			return false;
		else
			return true;
	}


	function getPrecedence(token) {
		switch (token) {
			case '^':
				return 9;
			case '*':
			case '/':
			case '%':
				return 8;
			case '+':
			case '-':
				return 6;
			default:
				return -1;
		}
	}

	function getAssociativity(token) {
		switch (token) {
			case '+':
			case '-':
			case '*':
			case '/':
				return 'left';
			case '^':
				return 'right';
		}
	}


	function OATSetCookie(name, value, expires, path, domain, secure) {
		
	}
	function OATGetCookie(name) {
		
	}

	function OATIsNotEmptyValue(value) {
		return (value != "#NaV#") && (value != "#NuN#")
	}

	function OATGetRowsFromXML(data, obj, ShowMeasuresAsRows) {
		var rows = [];

		var rowsString = data.split("<Rows>")
		if (rowsString.length) {
			rowsString = rowsString[1].split("</Rows>")
			rowsString = rowsString[0].split("<Row>")
			var isTitle = 0;
			for (var l = 1; l < rowsString.length; l++) {
				var row = { headers: [], cells: [], subTotal: false, dataField: -1, rowSpan: 0 }

				var subTotal = parseToStringRegisterValue(rowsString[l], "Subtotal")
				if (subTotal == "true") {
					row.subTotal = true
				}
				var headerString
				if (rowsString[l].indexOf("</Header>") > 0) {
					headerString = rowsString[l].split("</Header>")[0].replace("<Header>", "")
				} else {
					headerString = rowsString[l].split("/>")[0].replace("<Header", "")
				}

				row.dataField = parseToStringRegisterValue(headerString, "DataField"); //for columns in rows only

				//get dataFields of headers
				var headerrep = headerString.replace(/<\//g, "-*-5").replace(/\/>/g, "-*-5")
				var headersItems = headerrep.split("-*-5");

				for (var df = 1; df < headersItems.length; df++) {
					var value;
					var datafield = headersItems[df].split(">")[0]
					if (datafield == "") {
						datafield = headersItems[df - 1].split("<")[1].split(" ")[0]
						value = "#NuN#";
					} else {
						try {
							value = headersItems[df - 1].split(datafield + ">")[1].split("<")[0]
						} catch (ERROR) {
							if (headersItems[df - 1].indexOf("IsNull") > -1)
								value = "#NuN#";
							else
								value = ""	
						}
					}

					var h = { dataField: datafield, value: value, rowSpan: 1 }


					var totalizedItems = headersItems.length - 1
					if (ShowMeasuresAsRows) {
						totalizedItems = headersItems.length
						if (row.subTotal) {
							totalizedItems--;
						}
					}
					var sumarized = (df - totalizedItems >= 0)

					if ((rows.length > 0) && (!sumarized)) { //set rowspan
						if ((df - 1 == 0) || (row.headers[df - 2].rowSpan == 0)) { //no es la 1er columna, pero la anterior tiene span
							if (value == rows[l - 2].headers[df - 1].value) {
								h.rowSpan = 0
								var ant = l - 2
								while (ant >= 0) {
									if (rows[ant].headers[df - 1].rowSpan > 0) {
										rows[ant].headers[df - 1].rowSpan++
										break;
									}
									ant--;
								}
							}
						}
					}


					row.headers.push(h);
				}

				if ((ShowMeasuresAsRows) && (row.subTotal)) {
					if ((l == 1) || (!rows[l - 2].subTotal) || (row.headers.length != rows[l - 2].headers.length)) {
						row.rowSpan = 1
					} else {
						var ant = l - 2;
						while (ant >= 0) {
							if (rows[ant].rowSpan > 0) {
								rows[ant].rowSpan++
								break;
							}
							ant--
						}
					}
				}
				//get cells values
				var cellsString = rowsString[l].split("<Cells>")[1].split("</Cell>")
				for (var ci = 0; ci < cellsString.length - 1; ci++) {

					var dField = (row.dataField != -1) ? row.dataField : obj.columnsHeaders[ci].dataField;
					//add empty cells
					for (var ec = 1; ec < cellsString[ci].split("<Cell />").length; ec++) {
						var c = { value: "#NuN#", dataField: dField }
						row.cells.push(c);
					}

					var value = cellsString[ci].split("<Cell>")[1]
					var c = { value: value, dataField: dField }
					row.cells.push(c);
				}
				//add empty cells
				for (var ec = 1; ec < cellsString[ci].split("<Cell />").length; ec++) {
					var c = { value: "#NuN#", dataField: dField }
					row.cells.push(c);
				}

				rows.push(row);
			}

		}
		return rows;
	}

	function OATGetColumnsHeadersFromXML(dataString) {
		var columnsString = dataString.split("<Columns>")
		var columnsHeaders = [];
		if (columnsString.length > 1) {

			columnsString = columnsString[1].split("</Columns>")[0]
			var headerString = columnsString.split("<Header")

			for (var t = 1; t < headerString.length; t++) {
				var o = parseToStringRegisterValue(headerString[t], "DataField")
				var subTotal = parseToStringRegisterValue(headerString[t], "Subtotal")

				var subHeaders = [];
				var subHeadersString = headerString[t].replace("DataField=\"" + o + "\">", "").replace("DataField='" + o + "'>", "").replace("</Header>", "").replace(/IsNull="true" \/>/g, ">#NuN#<F>").replace(/IsNull='true' \/>/g, ">#NuN#<F>").replace(/IsNull="true"\/>/g, ">#NuN#<F>").split("<")
				if (subHeadersString.length > 1) { //hay dimensiones en las columnas
					for (var sh = 1; sh < subHeadersString.length - 1; sh++) {
						if (sh % 2 == 1) {
							var datafield = subHeadersString[sh].split(">")[0]
							var value = subHeadersString[sh].split(datafield + ">")[1]
							var h = { dataField: datafield, value: value, colSpan: 1 }
							subHeaders.push(h)
						}
					}
				}

				columnsHeaders.push({ dataField: o, subTotal: (subTotal == "true"), subHeaders: subHeaders })

			}

			//obj.columnsHeaders = columnsHeaders;
		}
		return columnsHeaders
	}

	function OATGetDataFromXMLForPivot(data, ShowMeasuresAsRows) {
		var stringRecord = dataString.split("<Record>")

		var obj = {};
		obj.ServerRecordCount = parseToIntRegisterValue(data, "RecordCount")
		obj.ServerPageCount = parseToIntRegisterValue(data, "PageCount")
		obj.ServerPageNumber = parseToIntRegisterValue(data, "PageNumber")

		obj.columnsHeaders = OATGetColumnsHeadersFromXML(data);
		obj.rows = OATGetRowsFromXML(data, obj, ShowMeasuresAsRows);


		return obj;
	}

	function OATGetNewDataFromXMLForPivot(data, obj, ShowMeasuresAsRows, exportTo) {
		data = data.replace(/<Cell\/>/g, "<Cell \/>")
		if ((exportTo == undefined) || (exportTo == "")) {
			if (parseToIntRegisterValue(data, "RecordCount") != -1) {
				obj.ServerRecordCount = parseToIntRegisterValue(data, "RecordCount")
			}
			if (parseToIntRegisterValue(data, "PageCount") != -1) {
				obj.ServerPageCount = parseToIntRegisterValue(data, "PageCount")
			}
		}
		obj.ServerPageNumber = parseToIntRegisterValue(data, "PageNumber")

		if (data.split("<Columns>").length > 1) {
			obj.columnsHeaders = OATGetColumnsHeadersFromXML(data);
		}

		obj.rows = OATGetRowsFromXML(data, obj, ShowMeasuresAsRows);

		return obj;
	}

	function OATgetDataFromXMLOldFormat(dataString, orderFilds, orderFildsHidden) {
		var stringRecord = dataString.split("<Record>")

		var data = [];
		var fullData = [];
		for (var i = 1; i < stringRecord.length; i++) {
			var recordData = [];
			var fullRecordData = [];
			for (var j = 0; j < orderFilds.length; j++) {
				recordData[j] = "#NuN#"
				var dt = stringRecord[i].split("<" + orderFilds[j] + ">")
				if (dt.length > 1) {
					var at = dt[1].split("</" + orderFilds[j] + ">")
					/*var rp = at[0].replace(/^\s+|\s+$/g, '')
					recordData[j] = (rp != "") ? rp : undefined*/
					recordData[j] = at[0]
					fullRecordData[j] = recordData[j]
				}
			}
			data.push(recordData);

			if (orderFildsHidden != undefined) {
				var pos_init = orderFilds.length;
				for (var j = 0; j < orderFildsHidden.length; j++) {
					fullRecordData[pos_init + j] = undefined
					var dt = stringRecord[i].split("<" + orderFildsHidden[j] + ">")
					if (dt.length > 1) {
						var at = dt[1].split("</" + orderFildsHidden[j] + ">")
						fullRecordData[pos_init + j] = at[0]
					}
				}
				fullData.push(fullRecordData);
			}
			/*	if (fullRecordData.length > this.maxLengthRecord) this.maxLengthRecord = fullRecordData.length;*/
		}

		if (orderFildsHidden != undefined) {
			return [data, fullData];
		} else {
			return data;
		}
	}

	function OATgetAllDataFromXMLOldFormat(dataString, orderFilds, orderFildsHidden) {
		var stringRecord = dataString.split("<Record>")

		var data = [];
		var fullData = [];
		for (var i = 1; i < stringRecord.length; i++) {
			var recordData = [];
			var fullRecordData = [];
			for (var j = 0; j < orderFilds.length; j++) {
				recordData[j] = "#NuN#"
				var dt = stringRecord[i].split("<" + orderFilds[j] + ">")
				if (dt.length > 1) {
					var at = dt[1].split("</" + orderFilds[j] + ">")
					/*var rp = at[0].replace(/^\s+|\s+$/g, '')
					recordData[j] = (rp != "") ? rp : undefined*/
					recordData[j] = at[0]
					fullRecordData[j] = recordData[j]
				}
			}
			data.push(recordData);

			var pos_init = orderFilds.length;
			for (var j = 0; j < orderFildsHidden.length; j++) {
				fullRecordData[pos_init + j] = undefined
				var dt = stringRecord[i].split("<" + orderFildsHidden[j] + ">")
				if (dt.length > 1) {
					var at = dt[1].split("</" + orderFildsHidden[j] + ">")
					fullRecordData[pos_init + j] = at[0]
				}
			}
			fullData.push(fullRecordData);
			//if (fullRecordData.length > this.maxLengthRecord) this.maxLengthRecord = fullRecordData.length; 
		}

		return [data, fullData];
	}

	var OATParseMetadata = function (metadata, hideDimension, hideMeasures, serverPaging, translations) {
		//Parsear string metadata para remover measures ocultas
		var orderFildsHidden = []; var hideDataFilds = []; var nameFildsHidden = [];

		var removeMeasures = []; //number of remove measures
		var headMetadata;
		if (metadata.indexOf('<OLAPDimension') != -1) {
			headMetadata = metadata.substring(0, metadata.indexOf('<OLAPDimension'));
		} else {
			headMetadata = metadata.substring(0, metadata.indexOf('<OLAPMeasure'));
		}
		var restMetadata = metadata.substring(metadata.indexOf('<OLAPDimension'), metadata.length);

		var dimensionString = restMetadata.split("<OLAPDimension");
		for (var i = 1; i < dimensionString.length; i++) {
			if (dimensionString[i].length > 0) {
				if (dimensionString[i].indexOf('</OLAPDimension>') != -1) {
					dimensionString[i] = dimensionString[i].substring(0, dimensionString[i].indexOf('</OLAPDimension>'));
				} else {
					dimensionString[i] = dimensionString[i].substring(0, dimensionString[i].indexOf('/>')) + ">";
				}

				var hide = false
				if ((hideDimension != undefined) && (hideDimension.length > 0)) {
					var dataField = dimensionString[i].split("dataField=\"")[1].split("\"")[0]
					hide = (hideDimension.indexOf(dataField) != -1)
				}
				//if (serverPaging) hide = false;

				if (( ((dimensionString[i].indexOf("visible=\"No\"") != -1) || (dimensionString[i].indexOf("visible=\"Never\"") != -1)) && (hideDimension == undefined)) ||
					(hide && (hideDimension != undefined))) {//hide dimension
					try {
						if (dimensionString[i].indexOf("displayName=") != -1) {
							var infoDisplayName = dimensionString[i].substring(dimensionString[i].indexOf("displayName=") + 13)
							orderFildsHidden.push(infoDisplayName.split('"')[0])
							hideDataFilds.push(dimensionString[i].substring(dimensionString[i].indexOf("dataField=") + 11).split('"')[0])
							try {
								nameFildsHidden.push(dimensionString[i].substring(dimensionString[i].indexOf("name=") + 6).split('"')[0])
							} catch (ERROR) {
							}
						}
					} catch (ERROR) { }
					dimensionString[i] = "";
				} else {
					dimensionString[i] = "<OLAPDimension " + dimensionString[i] + "</OLAPDimension>"
				}
			} else {
				dimensionString[i] = "";
			}
		}

		var measuresString = restMetadata.split("<OLAPMeasure");
		var allHide = true;
		for (var i = 1; i < measuresString.length; i++) {

			var hide = false
			if ((hideMeasures != undefined) && (hideMeasures.length > 0)) {
				var dataField = measuresString[i].split("dataField=\"")[1].split("\"")[0]
				hide = (hideMeasures.indexOf(dataField) != -1)
			}
			//if (serverPaging) hide = false;

			if (!hide) {
				if (measuresString[i].indexOf("</OLAPMeasure") != -1) {
					measuresString[i] = "<OLAPMeasure " + measuresString[i].substring(0, measuresString[i].indexOf('</OLAPMeasure>')) + "</OLAPMeasure>"
				} else if (measuresString[i].indexOf("/>") != -1) {
					measuresString[i] = "<OLAPMeasure " + measuresString[i].substring(0, measuresString[i].indexOf('/>')) + "/>";
				} else {
					measuresString[i] = "";
				}
				allHide = false;
			} else {
				measuresString[i] = "";
			}
		}
		if ((serverPaging) && (allHide)) {
			if (translations.GXPL_QViewerQuantity == undefined){
				translations.GXPL_QViewerQuantity = "Quantity"
			}
			measuresString.push('<OLAPMeasure name="Quantity" displayName="' + translations.GXPL_QViewerQuantity/*gx.getMessage("GXPL_QViewerQuantity")*/ + '" description="' + translations.GXPL_QViewerQuantity + '" dataField="F0" aggregation="count" summarize="yes" align="right" picture="" targetValue="0" defaultPosition="data" validPositions="data" dataType="integer" format="borderThickness:1"> </OLAPMeasure>');
		}

		var taileMetadata = "</OLAPCube>";

		metadata = "";
		metadata = headMetadata;
		for (var i = 1; i < dimensionString.length; i++) {
			if (dimensionString[i].length > 0) {
				metadata = metadata + dimensionString[i];
			}
		}
		for (var i = 1; i < measuresString.length; i++) {
			if (measuresString[i].length > 0) {
				metadata = metadata + measuresString[i]
			}
		}
		metadata = metadata + taileMetadata;
		//end parsing metadata
		return [metadata, orderFildsHidden, hideDataFilds, nameFildsHidden]
	}


	var OATGetColumnsAndMeasureMeatadata = function (columns, measures, formulaInfo, OrderFildsHidden) {
		var preHeader = []; var columnNames = []; var rowNames = []; var filterNames = [];
		var formatValues = []; var conditionalFormatsColumns = []; var formatValuesMeasures = []; var conditionalFormats = [];
		var orderFilds = []; var j = 0; var k = 0; var columnsDataType = []; var measureNames = [];
		var forPivotCustomPicture = []; var forPivotCustomFormat = [];
		//get columns
		for (var i = 0; i < columns.length; i++) {
			
			
			if ((columns[i].attributes.getNamedItem("axis").nodeValue.toLowerCase() == "rows") ||
				(columns[i].attributes.getNamedItem("axis").nodeValue == "")) {
				columnNames[j] = columns[i].attributes.getNamedItem("displayName").nodeValue;
				preHeader[i] = columnNames[j];
				j++;
			}
			if (columns[i].attributes.getNamedItem("axis").nodeValue.toLowerCase() == "columns") {
				rowNames[k] = columns[i].attributes.getNamedItem("displayName").nodeValue;
				preHeader[i] = rowNames[k];
				k++;
			}
			if (columns[i].attributes.getNamedItem("axis").nodeValue.toLowerCase() == "pages") {
				filterNames[k] = columns[i].attributes.getNamedItem("displayName").nodeValue;
				preHeader[i] = filterNames[k];
				k++;
			}

			columnsDataType[i] = columns[i].attributes.getNamedItem("dataType").nodeValue;
			//handle formats values
			if (columns[i].childNodes.length > 0) {
				if (columns[i].childNodes != null) {
					for (var m = 0; m < columns[i].childNodes.length; m++) {
						if (columns[i].childNodes[m].localName == "formatValues") {
							for (var n = 0; n < columns[i].childNodes[m].childNodes.length; n++) {
								if (columns[i].childNodes[m].childNodes[n].localName == "value") {
									var value = {};
									value.format = columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("format").nodeValue;
									value.recursive = columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("recursive").nodeValue;
									var crude = columns[i].childNodes[m].childNodes[n].textContent;
									value.value = crude.replace(/^\s+|\s+$/g, '');
									value.columnNumber = i;
									formatValues.push(value);
								}
							}
						}
					}
				}
			}//handle conditional formats
			if (columns[i].childNodes.length > 0) {
				if (columns[i].childNodes != null) {
					for (var m = 0; m < columns[i].childNodes.length; m++) {
						if (columns[i].childNodes[m].localName == "conditionalFormats") {
							for (var n = 0; n < columns[i].childNodes[m].childNodes.length; n++) {
								if (columns[i].childNodes[m].childNodes[n].localName == "rule") {
									var format = {};
									format.format = columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("format").nodeValue;
									format.operation1 = columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("op1").nodeValue;
									format.value1 = columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("value1").nodeValue;
									if (columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("op2") != null) {
										format.operation2 = columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("op2").nodeValue;
										format.value2 = columns[i].childNodes[m].childNodes[n].attributes.getNamedItem("value2").nodeValue;
									}
									format.columnNumber = i;
									conditionalFormatsColumns.push(format);
								}
							}
						}

					}
				}
			}

			//manage pictures
			/*if (columns[i].attributes.getNamedItem("picture").nodeValue != "") {
				if (columns[i].attributes.getNamedItem("dataType").nodeValue == "date") {
					datePictures.push(columns[i].attributes.getNamedItem("picture").nodeValue);
					dateFields.push(columns[i].attributes.getNamedItem("dataField").nodeValue);
				}
				//if (columns[i].attributes.getNamedItem("dataType").nodeValue == "integer" || measures[i].attributes.getNamedItem("dataType").nodeValue == "real") {
				if (columns[i].attributes.getNamedItem("dataType").nodeValue == "integer") {
					intPictures.push(columns[i].attributes.getNamedItem("picture").nodeValue);
					intFields.push(columns[i].attributes.getNamedItem("dataField").nodeValue);
				}
				
			}*/
			forPivotCustomPicture.push(columns[i].attributes.getNamedItem("picture").nodeValue);
			forPivotCustomFormat.push(columns[i].attributes.getNamedItem("format").nodeValue);
			orderFilds.push(columns[i].attributes.getNamedItem("dataField").nodeValue);

		}

		//var measures;
		var measureFormula = [];
		for (var i = 0; i < measures.length; i++) {

			measureNames[i] = measures[i].attributes.getNamedItem("displayName").nodeValue;
			//manage format values
			if (measures[i].childNodes.length > 0) {
				if (measures[i].childNodes != null) {
					for (var m = 0; m < measures[i].childNodes.length; m++) {
						if (measures[i].childNodes[m].localName == "formatValues") {
							for (var n = 0; n < measures[i].childNodes[m].childNodes.length; n++) {
								if (measures[i].childNodes[m].childNodes[n].localName == "value") {
									var value = {};
									value.format = measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("format").nodeValue;
									value.recursive = measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("recursive").nodeValue;
									var crude = measures[i].childNodes[m].childNodes[n].textContent;
									value.value = crude.replace(/^\s+|\s+$/g, '');
									value.columnNumber = i;
									formatValuesMeasures.push(value);
								}
							}
						}

					}
				}
			}
			//manage conditional formats
			if (measures[i].childNodes.length > 0) {
				if (measures[i].childNodes != null) {
					for (var m = 0; m < measures[i].childNodes.length; m++) {
						if (measures[i].childNodes[m].localName == "conditionalFormats") {
							for (var n = 0; n < measures[i].childNodes[m].childNodes.length; n++) {
								if (measures[i].childNodes[m].childNodes[n].localName == "rule") {
									var format = {};
									format.format = measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("format").nodeValue;
									format.operation1 = measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("op1").nodeValue;
									format.value1 = measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("value1").nodeValue;
									if (measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("op2") != null) {
										format.operation2 = measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("op2").nodeValue;
										format.value2 = measures[i].childNodes[m].childNodes[n].attributes.getNamedItem("value2").nodeValue;
									}
									format.columnNumber = i; //+ columns.length; Only the measure number
									conditionalFormats.push(format);
								}
							}
						}
					}
				}
			}

			//manage pictures
			/*if (measures[i].attributes.getNamedItem("picture").nodeValue != "") {
				if (measures[i].attributes.getNamedItem("dataType").nodeValue == "date") {
					datePictures.push(measures[i].attributes.getNamedItem("picture").nodeValue);
					dateFields.push(measures[i].attributes.getNamedItem("dataField").nodeValue);
				}
				if (measures[i].attributes.getNamedItem("dataType").nodeValue == "integer" || measures[i].attributes.getNamedItem("dataType").nodeValue == "real") {
					intPictures.push(measures[i].attributes.getNamedItem("picture").nodeValue);
					intFields.push(measures[i].attributes.getNamedItem("dataField").nodeValue);
				}
			}*/

			//manage formula
			if ((measures[i].attributes.getNamedItem("formula") != undefined) && (measures[i].attributes.getNamedItem("formula").nodeValue != "")) {
				measureFormula.push({ hasFormula: true, textFormula: measures[i].attributes.getNamedItem("formula").nodeValue })
			} else {
				measureFormula.push({ hasFormula: false })
			}

			forPivotCustomPicture.push(measures[i].attributes.getNamedItem("picture").nodeValue);
			orderFilds.push(measures[i].attributes.getNamedItem("dataField").nodeValue);
		}


		var furmulaIndex = {}
		for (var j = 0; j < OrderFildsHidden.length; j++) {
			furmulaIndex[OrderFildsHidden[j]] = orderFilds.length + j
		}
		formulaInfo.itemPosition = furmulaIndex
		//formulaInfo.recordDataLength = this.maxLengthRecord;
		formulaInfo.measureFormula = measureFormula
		formulaInfo.cantFormulaMeasures = 0;

		for (var n = 0; n < formulaInfo.measureFormula.length; n++) {
			if (formulaInfo.measureFormula[n].hasFormula) {
				formulaInfo.cantFormulaMeasures++;

				var inlineFormula = formulaInfo.measureFormula[n].textFormula

				var inline = inlineFormula
				var opers = ['*', '-', '+', '/', '(', ')']
				for (var j = 0; j < opers.length; j++) {
					var inline2 = inline.split(opers[j])
					if (inline2.length > 1) {
						inline = ""
						for (var i = 0; i < inline2.length - 1; i++) {
							inline = inline + inline2[i] + " " + opers[j] + " "
						}
						inline = inline + inline2[inline2.length - 1]
					}
				}

				var polishNot = InfixToPostfix(inline)
				formulaInfo.measureFormula[n].polishNotationText = polishNot
				var items = polishNot.split(" ")
				while (items.indexOf("") != -1) {
					items.splice(items.indexOf(""), 1)
				}
				var relatedMeasure = []
				for (var k = 0; k < items.length; k++) {
					if ((opers.indexOf(items[k]) == -1) && (isNaN(parseInt(items[k])))) {
						//add item
						var operPositionInDataRow = formulaInfo.itemPosition[items[k]]
						if (relatedMeasure.indexOf(operPositionInDataRow) == -1)
							relatedMeasure.push(operPositionInDataRow)
					}
				}

				formulaInfo.measureFormula[n].relatedMeasures = relatedMeasure

				var arrayNot = polishNot.split(" ")
				while (arrayNot.indexOf("") != -1) {
					arrayNot.splice(arrayNot.indexOf(""), 1)
				}
				formulaInfo.measureFormula[n].PolishNotation = arrayNot
			}
		}

		return [preHeader.concat(measureNames), orderFilds, measureFormula, conditionalFormats, conditionalFormatsColumns, forPivotCustomPicture, forPivotCustomFormat];
	}


	var OATgetState = function (query, controlName) {
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
		try {
			var i;
			if (localStorage.getItem(OAT.getURL() + query + controlName + "HiddenState") != null) {
				var retrievedObject = localStorage.getItem(OAT.getURL() + query + controlName + "HiddenState");
				i = JSON.retrocycle(JSON.parse(retrievedObject));
			}

			if (i == null) {
				var cookieValue = OATGetCookie('"' + OAT.getURL() + query + controlName + "HiddenState" + 'cookie' + '"')
				if (cookieValue != null) {
					i = JSON.parse(cookieValue)
				}
			}

			return i;
		} catch (error) {
			try {
				var cookieValue = OATGetCookie('"' + OAT.getURL() + query + controlName + "HiddenState" + 'cookie' + '"')
				var i = JSON.parse(cookieValue)
				return i
			} catch (error) {
				return null;
			}
		}
	}


	function init() {

	}
	