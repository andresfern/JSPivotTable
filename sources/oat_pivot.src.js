//FILE oat_pivot -----------------------------------------------------------------------------------------------------------------------------------------------



	if (GlobalPivotInterval == undefined) {
		var GlobalPivotInterval = [];
	}

	OAT.Pivot = function (_mthis, div, filterDiv, headerRow, dataRows, headerRowIndexes,
		headerColIndexes, filterIndexes, dataColumnIndex, query,
		condFormats, control, pageSize, defaultPicture, QueryViewerCollection,
		columns, containerName, formatValue, conditionalFormatsColumns, formatValueMeasures,
		measures, autoResize, disableColumnSort, UcId, IdForQueryViewerCollection, rememberLayout,
		ShowMeasuresAsRows, formulaInfo, fullRecord, serverPagination, pageData, hideDataFilds,
		orderFildsHidden, initMetadata, relativePath, selection, GrandTotalVisibility, pivotTitle) {
		var self = this;
		this.autoPaging = false;
		this.nextRowWhenAutopaging = 0;
		this.prevRowWhenAutopaging = 0;
		this.paginationInfo = false;
		this.TempDataStructForAggStepOptimization = [];
		this.actualPaginationPage = 1;
		this.allDataWithoutSort = jQuery.extend(true, [], dataRows);
		this.IdForQueryViewerCollection = IdForQueryViewerCollection;
		this.UcId = UcId;
		this.ShowMeasuresAsRows = ShowMeasuresAsRows;
		this.rememberLayoutStateVersion = (serverPagination) ? "4.3.8SP" : "4.3.8";
		if (measures.length < 2) { //si solo tiene una medida no aplica esta propiedad
			this.ShowMeasuresAsRows = false
		}
		this.allRowsPivot = "vacio";
		this.HideDataFilds = hideDataFilds;
		this.OrderFildsHidden = orderFildsHidden;
		this.initMetadata = initMetadata;
		this.relativePath = relativePath;
		this.selection = selection;
		this.GrandTotalVisibility = GrandTotalVisibility;
		this.translations = _mthis.translations
		this.isSD = OAT.isSD();
		
		fromUndefinedToBlanck(dataRows);

		if (dataRows[0] != undefined) {

			//agregar indice de fila
			if (formulaInfo.cantFormulaMeasures > 0) {
				for (var i = 0; i < dataRows.length; i++) {
					dataRows[i][headerRow.length] = i;
				}
			}
			//end agregar indice a filas
			var sortIntMemory = [];

			//get sort value
			for (var index = headerRow.length - 1; index > -1; index--) { //*dataRows[0].length*/
				var sortInt = true;
				for (var ival = 0; ival < dataRows.length; ival++) {
					if ((sortInt) && (dataRows[ival][index] != parseInt(dataRows[ival][index]))) {
						sortInt = false;
						break;
					}
				}
				sortIntMemory[index] = sortInt;
			}
			var index = 0;
			if (sortIntMemory[index]) {
				dataRows = dataRows.sort((function (index) {
					return function (a, b) {
						return (parseInt(a[index]) === parseInt(b[index]) ? 0 : (parseInt(a[index]) < parseInt(b[index]) ? -1 : 1));
					};
				})(index));
			} else {
				dataRows = dataRows.sort((function (index) {
					return function (a, b) {
						return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
					};
				})(index));
			}

			var actualVal = dataRows[0][index];
			var initPos = 0;
			for (var i = 0; i < dataRows.length; i++) {
				if ((actualVal != dataRows[i][index])) {
					actualVal = dataRows[i][index]
					dataRows = OAT.PartialSort(dataRows, initPos, i - 1, index + 1, headerRow.length, sortIntMemory)
					initPos = i;
				} else if ((i == dataRows.length - 1)) {
					dataRows = OAT.PartialSort(dataRows, initPos, i, index + 1, headerRow.length, sortIntMemory)
				}
			}

		}
		//collapse repeate rows
		var tempDataRows = dataRows;
		dataRows = [];
		if (tempDataRows.length > 0) {
			dataRows[0] = tempDataRows[0]
		}
		var act_pos = 0;
		for (var i = 1; i < tempDataRows.length; i++) {
			var repeated = true;
			for (var j = 0; j < columns.length; j++) {
				if (tempDataRows[i][j] != tempDataRows[i - 1][j]) { repeated = false; break; }
			}
			if (repeated) {
				for (var j = columns.length; j < columns.length + measures.length; j++) {
					var tot = parseFloat(dataRows[act_pos][j]) + parseFloat(tempDataRows[i][j])
					if ((dataRows[act_pos][j] == "#NuN#") && (tempDataRows[i][j] == "#NuN#")) {
						tot = "#NuN#"
					} else if (dataRows[act_pos][j] == "#NuN#") {
						tot = tempDataRows[i][j] + ""
					} else if (tempDataRows[i][j] == "#NuN#") {
						tot = dataRows[act_pos][j] + ""
					}
					dataRows[act_pos][j] = tot + "";
				}
				//colapsar filas de formula
				if (formulaInfo.cantFormulaMeasures > 0) {
					var filaSumar = dataRows[act_pos][headerRow.length];
					var filaRepetida = tempDataRows[i][headerRow.length];
					for (var formulasI = 0; formulasI < formulaInfo.measureFormula.length; formulasI++) { //campos formulas
						if (formulaInfo.measureFormula[formulasI].hasFormula) {
							for (var formulasJ = 0; formulasJ < formulaInfo.measureFormula[formulasI].relatedMeasures.length; formulasJ++) {
								var pos = formulaInfo.measureFormula[formulasI].relatedMeasures[formulasJ];
								var tot = parseFloat(fullRecord[filaSumar][pos]) + parseFloat(fullRecord[filaRepetida][pos])
								fullRecord[filaSumar][pos] = tot + "";
							}
						}
					}
					for (var j = columns.length; j < columns.length + measures.length; j++) { //restantes medidas para mantener coherencia
						var tot = parseFloat(fullRecord[filaSumar][j]) + parseFloat(fullRecord[filaRepetida][j])
						fullRecord[filaSumar][j] = tot + "";
					}
					for (var posB = 0; posB < headerRow.length; posB++) { //anular fila ya sumada
						fullRecord[filaRepetida][posB] = "";
					}
				}
				//end colapsar formula info
			} else {
				act_pos++
				dataRows[act_pos] = tempDataRows[i];
			}
		}

		//eliminar indice de fila
		if (formulaInfo.cantFormulaMeasures > 0) {
			if (dataRows[0] != undefined) {
				for (var it = 0; it < dataRows.length; it++) {
					dataRows[it].splice(headerRow.length, 1)
				}
			}
		}
		//end borrar incide a filas
		this.serverPagination = serverPagination;
		this.pageData = pageData;
		if (this.serverPagination) {
			this.pageData.PreviousPageNumber = -1;
			this.pageData.AxisInfo = [];
			this.pageData.FilterInfo = [];
		}
		
		
		
		this.autoPaging = false;
		

		this.recordForFormula = fullRecord;
		this.formulaInfo = formulaInfo;
		this.filterIndexes = filterIndexes; /* indexes of column conditions */
		this.initFilterIndexes = [];
		for (var i = 0; i < this.filterIndexes.length; i++) {
			this.initFilterIndexes[i] = this.filterIndexes[i];
		}
		this.getFormulaRowByDataRow = function (row, measureNumber, caseId) {
			var value = ""
			var hallado = false
			var numRow = 0
			var searchIn = self.recordForFormula
			//if (self.filterIndexes.length > 0){ searchIn = self.filteredData }
			var addedValues = []; for (var o = 0; o < self.formulaInfo.recordDataLength; o++) { addedValues[o] = 0 }
			for (var i = 0; i < searchIn.length; i++) {
				var coincide = false
				for (var j = 0; j < row.length; j++) {
					if (self.filterIndexes.indexOf(j) != -1) { //case filter to top bar
						var pos = self.filterIndexes.indexOf(j)
						if (self.filterDiv != undefined) {
							var s = self.filterDiv.selects[pos]; /* select node */
							var val = OAT.$v(s)
							if (val == "[all]") { coincide = true } //case [all]
							else {
								coincide = (val == searchIn[i][j])
								if (!coincide) break;
							}
						} else {
							coincide = true;
						}
					} else if ((self.filterIndexes.length > 0) && (j >= row.length - measures.length)) { //case filter to top bar y measure item
						coincide = true;
					} else if ((searchIn[i][j] == row[j]) || ((row[j] == "#FoE#") && (searchIn[i][j] == 0))) {
						coincide = true;
					} else if ((headerRowIndexes != undefined) && (headerRowIndexes.indexOf(j) != -1)
						&& (headerRowIndexes.indexOf(j) > headerRowIndexes.length - measures.length)) { //if a measure, when rowConditions is not defined yet
						coincide = true;
					} else if ((dataColumnIndex > 0) && (dataColumnIndex == j)) {
						coincide = true;
					} else {
						if ((row[j] == undefined) && (self.filterIndexes.length > 0)) {
							coincide = true;
						} else {
							coincide = false;
							break;
						}
					}
				}
				if (coincide) {
					for (var t = 0; t < self.formulaInfo.measureFormula[measureNumber].relatedMeasures.length; t++) {
						var pos = self.formulaInfo.measureFormula[measureNumber].relatedMeasures[t]
						addedValues[pos] = addedValues[pos] + parseFloat(searchIn[i][pos]);
					}
					hallado = true

				}
			}
			if (hallado)
				return addedValues;
			else
				return "#NuN#"//self.EmptyValue; //"#NuN#"
		}


		//calculate single measure formula value
		for (var mforF = 0; mforF < measures.length; mforF++) {
			if (formulaInfo.measureFormula[mforF].hasFormula) {
				for (var rforF = 0; rforF < dataRows.length; rforF++) {
					if (dataRows[rforF][dataRows[rforF].length - measures.length + mforF] == 0) {
						var formula = this.getFormulaRowByDataRow(dataRows[rforF], mforF, "");
						var result = EvaluateExpressionPivotJs(formulaInfo.measureFormula[mforF].PolishNotation, formula, formulaInfo)
						if ((result == Infinity) || isNaN(result)) {
							dataRows[rforF][dataRows[rforF].length - measures.length + mforF] = "#FoE#";
						}
					}
				}
			}
		}

		this.GeneralDataRows = dataRows;
		this.autoPagingRowsPerPage = (pageSize != undefined) ? parseInt(pageSize) : 10;
		this.TotalPagesPaging = parseInt(dataRows.length / this.autoPagingRowsPerPage);
		if ((dataRows.length % this.autoPagingRowsPerPage) != 0) {
			this.TotalPagesPaging++;
		}
		this.GeneralDistinctValues = [];
		this.GrandTotalsPaging = [];
		this.columns = columns;
		if (dataRows.length > 0) {
			fillGeneralDistinctValues(headerRow.length - measures.length, self, dataRows);
		}
		
		this.RowsWhenMoveToFilter = []
		this.FilterByTopFilter = false
		this.options = {
			headingBefore: 1,
			headingAfter: 0,
			agg: 1, /* index of default statistic function, SUM */
			aggTotals: 1, /* dtto for subtotals & totals */
			customType: function (data) {
				return data;
			},
			//currencySymbol: "$",
			showEmpty: 0,
			subtotals: 1,
			totals: 1
		}


		this.firstTime = true;
		this.readState = false;
		this.deleteState = false;
		this.defaultPicture = defaultPicture;
		this.gd = new OAT.GhostDrag();
		this.div = OAT.$(div);
		this.filterDiv = OAT.$(filterDiv);
		this.hasShowValuesAs = _mthis.hasShowValuesAs;
		
		this.TitleDivId = filterDiv.replace("pivot_page", "title_div")
		if (pivotTitle){
			this.PivotTitle = pivotTitle
			this.TitleDiv = OAT.$(this.TitleDivId);
			if (!this.TitleDiv){
				 jQuery("#"+this.TitleDivId).remove()
				 this.TitleDiv = OAT.Dom.create("div", {});
				 this.TitleDiv.id = this.TitleDivId
				 jQuery("#" + containerName).prepend(this.TitleDiv); 
			}
		} else {
			jQuery("#"+this.TitleDivId).remove()
		}
		
		this.defCArray = ["rgb(153,153,255)", "rgb(153,51,205)", "rgb(255,255,204)", "rgb(204,255,255)", "rgb(102,0,102)",
			"rgb(255,128,128)", "rgb(0,102,204)", "rgb(204,204,255)", "rgb(0,0,128)", "rgb(255,0,255)",
			"rgb(0,255,255)", "rgb(255,255,0)"];
		this.QueryViewerCollection = QueryViewerCollection;
		this.containerName = containerName;
		this.formatValues = formatValue;
		this.formatValuesMeasures = formatValueMeasures;
		this.tempBlackLists = []; this.tempCollapsedValues = []; this.oldSortValues = [];
		this.stateChanged = false;
		this.rowsPerPage = pageSize;



		this.headerRow = headerRow; /* store data */
		this.allData = dataRows; /* store data */
		this.filteredData = [];
		this.tabularData = []; /* result */

		this.dataColumnIndex = dataColumnIndex; /* store data */
		this.rowConditions = headerRowIndexes; /* indexes of row conditions */
		this.colConditions = headerColIndexes; /* indexes of column conditions */

		this.initRowConditions = [];
		for (var i = 0; i < this.rowConditions.length; i++) {
			this.initRowConditions[i] = this.rowConditions[i];
		}
		this.initColConditions = []
		for (var i = 0; i < this.colConditions.length; i++) {
			this.initColConditions[i] = this.colConditions[i];
		}

		if ((columns.length == 1) && (measures.length == 0)) {
			this.rowConditions = [0];
		}

		this.conditions = [];
		this.filterDiv.selects = [];
		this.rowStructure = {};
		this.colStructure = {};
		this.colPointers = [];
		this.rowPointers = [];
		this.rowTotals = [[], []];
		this.colTotals = [[], []];
		this.gTotal = [];

		this.query = query;
		this.controlName = control;
		this.conditionalFormats = condFormats;
		this.conditionalFormatsColumns = conditionalFormatsColumns;
		this.GreyList = [];
		this.EmptyValue = "#NaV#"
		this.NullValue = "#NuN#"

		this.initState = {};

		/* supplemental routines */
		if (typeof JSON.decycle !== 'function') {
			JSON.decycle = function decycle(object) {
				'use strict';
				var objects = [], // Keep a reference to each unique object or array
					paths = [];
				return (function derez(value, path) {
					var i, // The loop counter
						name, // Property name
						nu;
					switch (typeof value) {
						case 'object':
							if (!value) {
								return null;
							}
							for (i = 0; i < objects.length; i += 1) {
								if (objects[i] === value) {
									return {
										$ref: paths[i]
									};
								}
							}
							objects.push(value);
							paths.push(path);
							if (Object.prototype.toString.apply(value) === '[object Array]') {
								nu = [];
								for (i = 0; i < value.length; i += 1) {
									nu[i] = derez(value[i], path + '[' + i + ']');
								}
							} else {
								nu = {};
								for (name in value) {
									if (Object.prototype.hasOwnProperty.call(value, name)) {
										nu[name] = derez(value[name], path + '[' + JSON.stringify(name) + ']');
									}
								}
							}
							return nu;
						case 'number':
						case 'string':
						case 'boolean':
							return value;
					}
				}(object, '$'));
			};
		}


		this.saveState = function (state) {
			try {
				if (!!window.localStorage) {
					localStorage.removeItem(OAT.getURL() + self.query + self.controlName);
					localStorage.setItem(OAT.getURL() + self.query + self.controlName, JSON.stringify(JSON.decycle(state)));
				} else {
					OATSetCookie('"' + OAT.getURL() + self.query + self.controlName + 'cookie' + '"', JSON.stringify(state), null, "/");
				}
			} catch (error) {
				try {
					OATSetCookie('"' + OAT.getURL() + self.query + self.controlName + 'cookie' + '"', JSON.stringify(state), null, "/");
				} catch (error) { }
			}
		}

		this.saveHiddenState = function (state) {
			try {
				if (!!window.localStorage) {
					localStorage.removeItem(OAT.getURL() + self.query + self.controlName + "HiddenState");
					localStorage.setItem(OAT.getURL() + self.query + self.controlName + "HiddenState", JSON.stringify(JSON.decycle(state)));
				} else {
					OATSetCookie('"' + OAT.getURL() + self.query + self.controlName + "HiddenState" + 'cookie' + '"', JSON.stringify(state), null, "/");
				}
			} catch (error) {
				try {
					OATSetCookie('"' + OAT.getURL() + self.query + self.controlName + "HiddenState" + 'cookie' + '"', JSON.stringify(state), null, "/");
				} catch (error) { }
			}
		}

		this.getState = function () {
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
				if (localStorage.getItem(OAT.getURL() + self.query + self.controlName) != null) {
					var retrievedObject = localStorage.getItem(OAT.getURL() + self.query + self.controlName);
					i = JSON.retrocycle(JSON.parse(retrievedObject));
				}

				if (i == null) {
					var cookieValue = OATGetCookie('"' + OAT.getURL() + self.query + self.controlName + 'cookie' + '"')
					if (cookieValue != null) {
						i = JSON.parse(cookieValue)
					}
				}

				return i;
			} catch (error) {
				try {
					var cookieValue = OATGetCookie('"' + OAT.getURL() + self.query + self.controlName + 'cookie' + '"')
					var i = JSON.parse(cookieValue)
					return i
				} catch (error) {
					return null;
				}
			}

		}

		this.cleanState = function () {

			for (var il = 0; il < self.filterDiv.selects.length; il++) {
				self.filterDiv.selects[il].value = "[all]"
			}
			for (var ci = 0; ci <= self.conditions.length - 1; ci++) {
				self.conditions[ci].blackList = [];
				self.conditions[ci].whiteList = [];
				self.conditions[ci].greyList = [];
			}
			localStorage.removeItem(OAT.getURL() + self.query + self.controlName);
			self.deleteState = false;

			var viejcolCond = new Array()
			for (var i = 0; i < self.initState.colConditions.length; i++) {
				viejcolCond[i] = self.initState.colConditions[i];
			}
			var viejcolRow = new Array();
			for (var i = 0; i < self.initState.rowConditions.length; i++) {
				viejcolRow[i] = self.initState.rowConditions[i];
			}
			var viejcolFilt = new Array();
			for (var i = 0; i < self.initState.filterIndexes.length; i++) {
				viejcolFilt[i] = self.initState.filterIndexes[i];
			}
			this.conditions = jQuery.extend(true, [], self.initState.conditions);
			this.rowConditions = viejcolRow;
			this.colConditions = viejcolCond;
			this.filterIndexes = viejcolFilt;
			this.stateChanged = self.initState.stateChanged;
			this.rowsPerPage = self.initState.rowsPerPage;

			var state = {
				query: self.query,
				conditions: self.conditions,
				colConditions: self.colConditions,
				rowConditions: self.rowConditions,
				filterIndexes: self.filterIndexes,
				filterDivSelects: [],
				rowsPerPage: self.rowsPerPage,
				version: self.rememberLayoutStateVersion
			};


			self.saveState(state);


		}

		this.cleanStateWhenServerPagination = function () {

			for (var il = 0; il < self.filterDiv.selects.length; il++) {
				self.filterDiv.selects[il].value = "[all]"
			}
			for (var ci = 0; ci <= self.conditions.length - 1; ci++) {
				self.conditions[ci].blackList = [];
			}
			//localStorage.removeItem(OAT.getURL()+self.query+self.controlName);
			//self.deleteState = false;

			var viejcolCond = new Array()
			for (var i = 0; i < self.initState.colConditions.length; i++) {
				viejcolCond[i] = self.initState.colConditions[i];
			}
			var viejcolRow = new Array();
			for (var i = 0; i < self.initState.rowConditions.length; i++) {
				viejcolRow[i] = self.initState.rowConditions[i];
			}
			var viejcolFilt = new Array();
			for (var i = 0; i < self.initState.filterIndexes.length; i++) {
				viejcolFilt[i] = self.initState.filterIndexes[i];
			}

			for (var i = 0; i < self.conditions.length; i++) {
				if ((self.conditions[i]) && (self.conditions[i].distinctValues) && (self.conditions[i].dataField)) {
					var initValuePos = -1;
					for (var t = 0; t < self.initState.conditions.length; t++) {
						if (self.initState.conditions[t]) {
							if (self.initState.conditions[t].dataField == self.conditions[i].dataField) {
								initValuePos = t;
							}
						}
					}

					if (initValuePos > -1) {
						self.initState.conditions[initValuePos].distinctValues = []
						for (var j = 0; j < self.conditions[i].distinctValues.length; j++) {
							if ((self.initState.conditions[initValuePos]) && (self.initState.conditions[initValuePos].distinctValues.indexOf(self.conditions[i].distinctValues[j]) == -1)) {
								self.initState.conditions[initValuePos].distinctValues.push(self.conditions[i].distinctValues[j])
							}
						}
						self.initState.conditions[initValuePos].previousPage = self.conditions[i].previousPage
						self.initState.conditions[initValuePos].totalPages = self.conditions[i].totalPages
					}
				}
			}

			self.conditions = jQuery.extend(true, [], self.initState.conditions);

			self.pageData.AxisInfo = jQuery.extend(true, [], self.initState.AxisInfo);
			self.pageData.DataInfo = jQuery.extend(true, [], self.initState.DataInfo);
			self.pageData.FilterInfo = jQuery.extend(true, [], self.initState.FilterInfo);
			self.pageData.CollapseInfo = jQuery.extend(true, [], self.initState.CollapseInfo);

			self.rowConditions = viejcolRow;
			self.colConditions = viejcolCond;
			self.filterIndexes = viejcolFilt;
			self.stateChanged = self.initState.stateChanged;
			self.rowsPerPage = self.initState.rowsPerPage;
			self.DefaultAction = self.initState.DefaultAction;

			self.initMetadata = jQuery.extend(true, {}, self.initState.InitMetadata);

			//self.initMetadata.Conditions = []
			
			for (var iC = 0; iC < self.initMetadata.Conditions.length; iC++)
			{
				self.initMetadata.Conditions[iC] = ""
			}
			
			//self.initMetadata.Conditions = jQuery.extend(true, [] ,self.initState.conditions);
			for (var ip = 0; ip < self.initState.conditions.length; ip++) {
				var dF = self.initState.conditions[ip].dataField;
				if (dF){
					var ix = self.initMetadata.DataFields.indexOf(dF);
					self.initMetadata.Conditions[ix] = self.conditions[ip];
				}
			}

			if (!OAT.isIE()){
				self.goWhenHide(true);
			}
		}
		
		/*this.requestDataSyncForPivotTable = function(){
			setTimeout( function() {
				var paramobj = { "QueryviewerId": self.IdForQueryViewerCollection} ;
				var evt = document.createEvent("Events")
				evt.initEvent("RequestDataSyncForPivotTable", true, true);
				evt.parameter = paramobj;
				document.dispatchEvent(evt);
			}, 0)
		}*/
		
		this.getDataXML = function(serverData) {
			var dataStr = serverData.split("<Recordset")[1];
			//var temp = self.QueryViewerCollection[self.IdForQueryViewerCollection].getPivottableDataSync();
			dataStr = "<Recordset" + dataStr;
			return dataStr
		}
		
		this.requestPageDataForPivotTable = function(PageNumber, PageSize, ReturnTotPages, AxesInfo, DataInfo, Filters, ExpandCollapse, LayoutChange){
			setTimeout( function() {
				var paramobj = {  "PageNumber": PageNumber, "PageSize": PageSize,"ReturnTotPages":ReturnTotPages, "AxesInfo":AxesInfo, 
					"DataInfo":DataInfo, "Filters":Filters, "ExpandCollapse":ExpandCollapse, "LayoutChange":LayoutChange, "QueryviewerId": self.IdForQueryViewerCollection, 
					"callback": self.setPageDataForPivotTable };
				var evt = document.createEvent("Events")
				evt.initEvent("RequestPageDataForPivotTable", true, true);
				evt.parameter = paramobj;
				document.dispatchEvent(evt);
			}, 0)
		}
		
		this.setPageDataForPivotTable = function(resXML) {
			switch(self.lastCallToQueryViewer) {
				case "initWhenServerPagination":
					//if (!qv.util.anyError(resXML) || self.QueryViewerCollection[self.IdForQueryViewerCollection].debugServices) {

						self.pageData = OATGetNewDataFromXMLForPivot(resXML, self.pageData, self.ShowMeasuresAsRows);
						self.preGoWhenServerPagination(true);

						if (self.filterIndexes.length > 0) {
							self.initValueRead(self, 0, self.stateLoad);
						}
						
						jQuery("#"+self.containerName).removeClass("gx-qv-loading")
						//qv.util.hideActivityIndicator(self.QueryViewerCollection[self.IdForQueryViewerCollection]);
	
					/*} else {
						var errMsg = qv.util.getErrorFromText(resXML);
						qv.util.renderError(self.QueryViewerCollection[self.IdForQueryViewerCollection], errMsg);
					};*/
					break;
				case "callServiceWhenCustomeValues":
					//if (!qv.util.anyError(resXML) || self.QueryViewerCollection[self.IdForQueryViewerCollection].debugServices) {

						self.pageData = OATGetNewDataFromXMLForPivot(resXML, self.pageData, self.ShowMeasuresAsRows);
						self.preGoWhenServerPagination(true);
						jQuery("#"+self.containerName).removeClass("gx-qv-loading")

					/*} else {
						var errMsg = qv.util.getErrorFromText(resXML);
					qv.util.renderError(self.QueryViewerCollection[self.IdForQueryViewerCollection], errMsg);
					}*/
					break;
				case "refreshPivot":
					//if (!qv.util.anyError(resXML) || self.QueryViewerCollection[self.IdForQueryViewerCollection].debugServices) {

						self.pageData = OATGetNewDataFromXMLForPivot(resXML, self.pageData, self.ShowMeasuresAsRows);
						self.goWhenServerPagination(false, true);
						jQuery("#"+self.containerName).removeClass("gx-qv-loading")

					/*} else {
						var errMsg = qv.util.getErrorFromText(resXML);
						qv.util.renderError(self.QueryViewerCollection[self.IdForQueryViewerCollection], errMsg);
					}*/
					break;
				case "hiddenDimension":	
					//if (!qv.util.anyError(resXML) || self.QueryViewerCollection[self.IdForQueryViewerCollection].debugServices) {
						self.pageData = OATGetNewDataFromXMLForPivot(resXML, self.pageData, self.ShowMeasuresAsRows);
						self.goWhenServerPagination(false, false);
						jQuery("#"+self.containerName).removeClass("gx-qv-loading")
					/*} else {
						var errMsg = qv.util.getErrorFromText(resXML);
						qv.util.renderError(self.QueryViewerCollection[self.IdForQueryViewerCollection], errMsg);
					}*/
					break;
				case "DataForPivot":	
					self.pageData = OATGetNewDataFromXMLForPivot(resXML, self.pageData, self.ShowMeasuresAsRows, self.ExportTo);
					self.preGoWhenServerPagination(self.lastNotAutorefreshIndicator);
					if (self.ExportTo != "") {
						var FileName = self.query
						if (FileName == "") {
							FileName = "Query"
							try {
								FileName = self.controlName.split("_")[0]
							} catch (error) { }
						}
						if (self.ExportTo == "HTML") {
							self.ExportToHTMLWhenServerPagination()
						}
						if (self.ExportTo == "PDF") {
							OAT.GeneratePDFOutput(self, FileName)
						}
						if (self.ExportTo == "XLS") {
							self.ExportToExcel(FileName);
						}
						if (self.ExportTo == "XML") {
							self.ExportToXMLWhenServerPagination();
						}
						if (self.ExportTo == "XLSX") {
							self.ExportToXLSXWhenServerPagination();
						}
						self.cleanGridCache();
					}
					jQuery("#"+self.containerName).removeClass("gx-qv-loading")
					//qv.util.hideActivityIndicator(self.QueryViewerCollection[self.IdForQueryViewerCollection]);
					break;
			  }
		}
		
		
		this.requestAttributeValues = function(DataField, Page, PageSize, FilterText)
		{
			setTimeout( function() {
				
				var paramobj = {  "DataField": DataField, "Page": Page,"PageSize":PageSize, "FilterText":FilterText, "QueryviewerId": self.IdForQueryViewerCollection};
				var evt = document.createEvent("Events")
				evt.initEvent("RequestAttributeValuesForPivotTable", true, true);
				evt.parameter = paramobj;
				document.dispatchEvent(evt);
				
			}, 0)
		}
		
		this.setAttributeValuesForPivotTable = function(resJSON)
		{
			
			switch(self.lastRequestAttributeValues) {
				case "initValueRead":
					var data = JSON.parse(resJSON);
					
					var columnNumber = self.lastRequestAttributeColumnNumber
					allData = self.lastRequestAttributeAllData 
					requestDataField = self.lastRequestAttributeRequestDataField
					
					self.conditions[columnNumber].previousPage = data.PageNumber
					self.conditions[columnNumber].totalPages = data.PagesCount
					self.conditions[columnNumber].blocked = false
					
					if (allData) {
						self.conditions[columnNumber].distinctValues = []
					}
					//null value?
					if (data.Null) {
						self.conditions[columnNumber].hasNull = true;
						if (self.conditions[columnNumber].distinctValues.indexOf("#NuN#") == -1) {
							self.conditions[columnNumber].distinctValues.push("#NuN#")
						}
						var nullIncluded = true;

						if (!self.conditions[columnNumber].NullIncluded) {
							nullIncluded = false;
						}
						if ((nullIncluded) && (self.conditions[columnNumber].visibles.indexOf("#NuN#") == -1)) {
							self.conditions[columnNumber].visibles.push("#NuN#");
						}
					} else {
						self.conditions[columnNumber].hasNull = false;
					}

					var includeLists = [];
					for (var i = 0; i < data.NotNullValues.length; i++) {
						var value = data.NotNullValues[i]
						var include = false;
						if ((self.conditions[columnNumber].state == "none") &&
							(self.UserFilterValues.length > 0) && (self.UserFilterValues[columnNumber] != undefined)
							&& (self.UserFilterValues[columnNumber].length > 0) && (self.UserFilterValues[columnNumber].indexOf(value.trimpivot()) != -1)) {
							include = true;
							includeLists.push(value)
						}

						if (self.conditions[columnNumber].distinctValues.indexOf(value) == -1) {
							self.conditions[columnNumber].distinctValues.push(value)
						}
						if ((self.conditions[columnNumber].state == "all")
							&& (self.conditions[columnNumber].visibles.indexOf(value) == -1)) {
							self.conditions[columnNumber].visibles.push(value)
						}
						if ((self.conditions[columnNumber].state == "none")
							&& (self.conditions[columnNumber].blackList.indexOf(value) == -1)
							&& (!include)) {
							self.conditions[columnNumber].blackList.push(value)
						}

						if ((allData) && (self.UserExpandValues.length > 0)) {//collapsed values
							if (self.UserExpandValues[columnNumber] != undefined) {
								if ((self.UserExpandValues[columnNumber][0] == "#ALLCOLLAPSE#") ||
									(self.UserExpandValues[columnNumber].indexOf(value.trimpivot()) == -1)) {
									self.conditions[columnNumber].collapsedValues.push(value);
								}
							}
						}

					}

					for (var i = 0; i < includeLists.length; i++) {
						self.createFilterInfo({ op: "pop", values: includeLists[i], dim: columnNumber }, true);
					}
					if (requestDataField == undefined){
						columnNumber++;
						self.initValueRead(self, columnNumber, allData)
					}
					break;
				case "DrawFilters":
					var data = JSON.parse(resJSON);
					var columnNumber = self.lastRequestAttributeColumnNumber
					
					self.conditions[columnNumber].previousPage = data.PageNumber
					self.conditions[columnNumber].totalPages = data.PagesCount
					self.conditions[columnNumber].blocked = true
					//null value?
					if ((data.Null) && (!self.conditions[columnNumber].hasNull)) {
						self.conditions[columnNumber].hasNull = true;
						if (self.conditions[columnNumber].distinctValues.indexOf("#NuN#") == -1) {
							self.conditions[columnNumber].distinctValues.push("#NuN#")
						}
						if (self.conditions[columnNumber].defaultAction == "Include") {
							if (self.conditions[columnNumber].visibles.indexOf("#NuN#") == -1) {
								self.conditions[columnNumber].visibles.push("#NuN#");
							}
						} else {
							if (self.conditions[columnNumber].blackList.indexOf("#NuN#") == -1) {
								self.conditions[columnNumber].blackList.push("#NuN#");
							}
						}
					}

					for (var i = 0; i < data.NotNullValues.length; i++) {
						var value = data.NotNullValues[i]
						if (self.conditions[columnNumber].distinctValues.indexOf(value) == -1) {
							self.conditions[columnNumber].distinctValues.push(value)

							if ((self.conditions[columnNumber].defaultAction == "Include")
								&& (self.conditions[columnNumber].visibles.indexOf(value) == -1)) {
								self.conditions[columnNumber].visibles.push(value)
							}
							if ((self.conditions[columnNumber].state == "Exclude")
								&& (self.conditions[columnNumber].blackList.indexOf(value) == -1)) {
								self.conditions[columnNumber].blackList.push(value)
							}
						}
					}

					var actualValues = self.conditions[columnNumber].distinctValues;
					for (var j = 0; j < actualValues.length; j++) {
						var v = actualValues[j];
						if (self.conditions[columnNumber].filteredShowValues.indexOf(v) == -1) {
							self.conditions[columnNumber].filteredShowValues.push(v);
							if (v != "#NuN#") {
								try {
									OAT.Dom.option(self.dimensionPictureValue(v, columnNumber), v, s);
								} catch (Error) {
									OAT.Dom.option(v, v, s);
								}
							} else {
								OAT.Dom.option(" ", v, s);
							}
						}
					}
					break;
				case "hiddenDimension":
						var data = JSON.parse(resJSON);
						var columnNumber = self.lastRequestAttributeColumnNumber
						
						self.conditions[columnNumber].previousPage = data.PageNumber
						self.conditions[columnNumber].totalPages = data.PagesCount
						self.conditions[columnNumber].blocked = false
						//null value?
						if (data.Null) {
							self.conditions[columnNumber].hasNull = true;
							if (self.conditions[columnNumber].distinctValues.indexOf("#NuN#") == -1) {
								self.conditions[columnNumber].distinctValues.push("#NuN#")
							}
							var nullIncluded = true;

							if (!self.conditions[columnNumber].NullIncluded) {
								nullIncluded = false;
							}
							if ((nullIncluded) && (self.conditions[columnNumber].visibles.indexOf("#NuN#") == -1)) {
								self.conditions[columnNumber].visibles.push("#NuN#");
							}
						} else {
							self.conditions[columnNumber].hasNull = false;
						}

						var includeLists = [];
						for (var i = 0; i < data.NotNullValues.length; i++) {
							var value = data.NotNullValues[i]
							var include = false;
							if ((self.conditions[columnNumber].state == "none") &&
								(self.UserFilterValues.length > 0) && (self.UserFilterValues[columnNumber] != undefined)
								&& (self.UserFilterValues[columnNumber].length > 0) && (self.UserFilterValues[columnNumber].indexOf(value.trimpivot()) != -1)) {
								include = true;
								includeLists.push(value)
							}

							if (self.conditions[columnNumber].distinctValues.indexOf(value) == -1) {
								self.conditions[columnNumber].distinctValues.push(value)
							}
							if ((self.conditions[columnNumber].state == "all")
								&& (self.conditions[columnNumber].visibles.indexOf(value) == -1)) {
								self.conditions[columnNumber].visibles.push(value)
							}
							if ((self.conditions[columnNumber].state == "none")
								&& (self.conditions[columnNumber].blackList.indexOf(value) == -1)
								&& (!include)) {
								self.conditions[columnNumber].blackList.push(value)
							}

							if ((self.UserExpandValues.length > 0)) {//collapsed values
								if (self.UserExpandValues[columnNumber] != undefined) {
									if ((self.UserExpandValues[columnNumber][0] == "#ALLCOLLAPSE#") ||
										(self.UserExpandValues[columnNumber].indexOf(value.trimpivot()) == -1)) {
											self.conditions[columnNumber].collapsedValues.push(value);
										}
									}
								}

						}

						for (var i = 0; i < includeLists.length; i++) {
							self.createFilterInfo({ op: "pop", values: includeLists[i], dim: columnNumber }, true);
						}
					break;
				case "readScrollValueWithoutFilters":
					var res = JSON.parse(resJSON);
					self.appendNewValueData(self.lastRequestValue, res)
					break;
				case "readScrollValueWithFilters":
					var res = JSON.parse(resJSON);
					var columnNumber = self.lastRequestAttributeColumnNumber
					var filterText = self.lastRequestAttributeFilterText
					self.appendNewFilteredValueData(res, columnNumber, filterText)
					break;
				case "ValuesForColumn":
					var res = JSON.parse(resJSON);
					var columnNumber = self.lastRequestAttributeColumnNumber 
					var filterValuePars = self.lastRequestAttributeFilterText
					var dataField = self.lastRequestAttributeDataField
					var UcId = self.lastRequestAttributeUcId = UcId
					self.changeValues(UcId, dataField, columnNumber, res, filterValuePars);
					break;
				case "ExpandCollapse":
					var data = JSON.parse(resJSON);
					var columnNumber = self.lastColumnNumber
					var elemvalue = self.lastRequestAttributeValuesElemValue
					var action = self.lastRequestAttributeValuesAction 
					
					self.conditions[columnNumber].previousPage = data.PageNumber
					self.conditions[columnNumber].totalPages = data.PagesCount
					self.conditions[columnNumber].blocked = true

					//null value?
					if ((data.Null) && (!self.conditions[columnNumber].hasNull)) {
						self.conditions[columnNumber].hasNull = true;
						if (self.conditions[columnNumber].distinctValues.indexOf("#NuN#") == -1) {
							self.conditions[columnNumber].distinctValues.push("#NuN#")
						}
						if (self.conditions[columnNumber].defaultAction == "Include") {
							if (self.conditions[columnNumber].visibles.indexOf("#NuN#") == -1) {
								self.conditions[columnNumber].visibles.push("#NuN#");
							}
						} else {
							if (self.conditions[columnNumber].blackList.indexOf("#NuN#") == -1) {
								self.conditions[columnNumber].blackList.push("#NuN#");
							}
						}
					}

					for (var i = 0; i < data.NotNullValues.length; i++) {
						var val = data.NotNullValues[i]
						if (self.conditions[columnNumber].distinctValues.indexOf(val) == -1) {
							self.conditions[columnNumber].distinctValues.push(val)

							if ((self.conditions[columnNumber].defaultAction == "Include")
								&& (self.conditions[columnNumber].visibles.indexOf(val) == -1)) {
								self.conditions[columnNumber].visibles.push(val)
							}
							if ((self.conditions[columnNumber].state == "Exclude")
								&& (self.conditions[columnNumber].blackList.indexOf(val) == -1)) {
								self.conditions[columnNumber].blackList.push(val)
							}
						}
					}

					var datastr = self.ExpandCollapseHandleWhenServerPaginationCreateXML(elemvalue, action)
					datastr = datastr.replace(/\&/g, '&amp;');

					self.getDataForPivot(self.UcId, self.pageData.ServerPageNumber, self.rowsPerPage, true, "", "", "", "", true);
					setTimeout(function () {
						self.fireOnItemExpandCollapseEvent(self.QueryViewerCollection[IdForQueryViewerCollection], datastr, (action == "collapse"))
						//qv.pivot.onItemExpandCollapseEvent(self.QueryViewerCollection[IdForQueryViewerCollection], datastr, (action == "collapse"))
					}, 2000);
					break;
				case "FilteredChanged":
					setTimeout(function () {
						var data = JSON.parse(resJSON);
						self.onFilteredChangedEventHandleWhenServerPaginationCreateXML(self.lastColumnNumber, data.NotNullValues, self.conditions[self.lastColumnNumber].blackList);
					}, 200)
					break;
			}
					
		}
		
		this.fireOnItemExpandCollapseEvent = function(query, datastr, collapse){
			setTimeout( function() {
				var paramobj = {"QueryViewer": query, "Data": datastr, "QueryviewerId": self.IdForQueryViewerCollection, "IsCollapse": collapse};
				var evt = document.createEvent("Events")
				evt.initEvent("PivotTableOnItemExpandCollapseEvent", true, true);
				evt.parameter = paramobj;
				document.dispatchEvent(evt);
			}, 0)
		}
		
		this.requestCalculatePivottableData = function()
		{
			setTimeout( function() {
				
				
				var evt = document.createEvent("Events")
				var paramobj = {"QueryviewerId": self.IdForQueryViewerCollection};
				evt.initEvent("RequestCalculatePivottableData", true, true);
				evt.parameter = paramobj;
				document.dispatchEvent(evt);
				
			}, 0)
		}
		
		
		this.setPivottableDataCalculation = function(resText)
		{
			
			switch(self.lastRequestCalculation) {
				case "ExportToXML":
					self.allDataWithoutSort = OATgetDataFromXMLOldFormat(resText, self.pageData.dataFields)
					self.allData = self.allDataWithoutSort

					var prevConditions = jQuery.extend(true, [], self.conditions);
					for (var t = 0; t < self.conditions.length; t++) {
						if (self.conditions[t]) {
							for (var i = 0; i < self.allData.length; i++) {
								var value = self.allData[i][t];
								if (value == undefined) {
									value = " ";
									self.allData[i][index] = " ";
								}
								if (self.conditions[t].distinctValues.indexOf(value) == -1) {
									self.conditions[t].distinctValues.push(value);
								}
							}
							try {
								self.sort(self.conditions[t], t);
							} catch (ERROR) { }
						}
					}

					self.applyFilters();
					self.createAggStructure();
					self.fillAggStructure();
					self.checkAggStructure();
					//self.count();

					str = self.ExportToXML();
					self.allDataWithoutSort = []; self.allData = []; self.filteredData = [];
					self.conditions = prevConditions;

					if ((OAT.isSafari()) || (self.isSD)) { //for safari
						window.open('data:text/xml,' + encodeURIComponent('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + str));
					} else {
						var blob = new Blob([str], { type: "text/xml" });
						if (self.query != "") {
							saveAs(blob, self.query + ".xml");
						} else {
							var name = 'Query'
							try {
								name = self.controlName.substr(4).split("_")[0]
							} catch (error) { }
							saveAs(blob, name + ".xml");
						}
					}
					break;
				case "ExportToXLSX":
					var dataFields = [];
				
					for (var t = 0; t < self.initMetadata.Dimensions.length; t++){
						if (self.initMetadata.Dimensions[t].Visible)
							dataFields.push(self.initMetadata.Dimensions[t].dataField);
					}				
					for (var t = 0; t < self.pageData.AxisInfo.length; t++) {
						if ((self.pageData.AxisInfo[t].Axis != undefined) && (self.pageData.AxisInfo[t].Axis.Type == "Hidden")) {
							var index = dataFields.indexOf(self.pageData.AxisInfo[t].DataField);
							if (index > -1) {
								dataFields.splice(index, 1)
							}
						}
					}
				
					for (var t = 0; t < self.initMetadata.Measures.length; t++){
						if ((self.initMetadata.Measures[t].Visible) &&  (dataFields.indexOf(self.initMetadata.Measures[t].dataField) < 0))
						{
							dataFields.push(self.initMetadata.Measures[t].dataField)
						} 
					}

					for (var t = 0; t < measures.length; t++) {
						if (measures[t].getAttribute("aggregation") == "average") {
							self.formulaInfo.measureFormula[t].hasFormula = true;
							self.formulaInfo.measureFormula[t].textFormula = measures[t].getAttribute("dataField") + "_N/" + measures[t].getAttribute("dataField") + "_D"

							self.formulaInfo.cantFormulaMeasures++;

							var inlineFormula = self.formulaInfo.measureFormula[t].textFormula

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
							formulaInfo.measureFormula[t].polishNotationText = polishNot
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

							self.formulaInfo.measureFormula[t].relatedMeasures = relatedMeasure

							var arrayNot = polishNot.split(" ")
							while (arrayNot.indexOf("") != -1) {
								arrayNot.splice(arrayNot.indexOf(""), 1)
							}
							self.formulaInfo.measureFormula[t].PolishNotation = arrayNot
						}
					}
					resText = resText.replace(/\&amp;/g, '&').replace(/\&lt;/g, '<').replace(/\&gt;/g, '>').replace(/\&apos;/g, '\'').replace(/\&quot/g, '\"')
					var res = OATgetDataFromXMLOldFormat(resText, dataFields, self.OrderFildsHidden)
					self.GeneralDataRows = res[0]
					self.recordForFormula = res[1]
					self.allData = self.GeneralDataRows

					var prevConditions = jQuery.extend(true, [], self.conditions);
					self.GeneralDistinctValues = [];
					for (var t = 0; t < self.conditions.length; t++) {
						if (self.conditions[t]) {
						self.GeneralDistinctValues[t] = []
						for (var i = 0; i < self.allData.length; i++) {
							var value = self.allData[i][t];
							if (value == undefined) {
								value = " ";
								self.allData[i][index] = " ";
							}
							if (self.conditions[t].distinctValues.indexOf(value) == -1) {
								self.conditions[t].distinctValues.push(value);
							}
							if (self.GeneralDistinctValues[t].indexOf(value) == -1) {
								self.GeneralDistinctValues[t].push(value);
							}
						}
						try {
							self.sort(self.conditions[t], t);
						} catch (ERROR) { }
					}
					}

					self.applyFilters();
					self.createAggStructure();
					self.fillAggStructure();
					self.checkAggStructure();
					//self.count();

					var FileName = self.query
					if (FileName == "") {
						FileName = "Query"
						try {
							FileName = self.controlName.split("_")[0]
						} catch (error) { }
					}
					OAT.GenerateExcelOutput(FileName, self, measures);

					str = self.ExportToXML();
					self.GeneralDataRows = []; self.allData = []; self.filteredData = []; self.GeneralDistinctValues = [];
					self.conditions = prevConditions;

					//quitar formulas averages
					for (var t = 0; t < measures.length; t++) {
						if (measures[t].getAttribute("aggregation") == "average") {
							self.formulaInfo.measureFormula[t] = { hasFormula: false };
							self.formulaInfo.cantFormulaMeasures--;
						}
					}
				
					break;
			}
				
				
		}
		
		
		this.getFilteredDataXML = function (serverData) {
			
				//var temp = self.QueryViewerCollection[self.IdForQueryViewerCollection].getPivottableDataSync();
				temp = serverData.replace(/\&amp;/g, '&').replace(/\&lt;/g, '<').replace(/\&gt;/g, '>').replace(/\&apos;/g, '\'').replace(/\&quot/g, '\"');
				var stringRecord = temp.split("<Record>")

				var tempData = [];
				for (var i = 1; i < stringRecord.length; i++) {
					var recordData = [];
					var fullRecordData = [];
					var visibleData = [];
					for (var j = 0; j < self.pageData.dataFields.length; j++) {
						recordData[j] = "#NuN#"
						var dt = stringRecord[i].split("<" + self.pageData.dataFields[j] + ">")
						if (dt.length > 1) {
							var at = dt[1].split("</" + self.pageData.dataFields[j] + ">")
							/*var rp = at[0].replace(/^\s+|\s+$/g, '')
							recordData[j] = (rp != "") ? rp : undefined*/
							recordData[j] = at[0]
							fullRecordData[j] = recordData[j]
							
							
							for (var t=0; t< self.initMetadata.Dimensions.length; t++){
								if (self.initMetadata.Dimensions[t].dataField == self.pageData.dataFields[j]){
									var displayName = self.initMetadata.Dimensions[t].displayName;
									if (self.headerRow.indexOf(displayName) != -1){
										visibleData.push(at[0])
									}
									
								}
							}
							if (j >= self.initMetadata.Dimensions.length){
								visibleData.push(at[0])
							}
							
							
						} else {
							if (stringRecord[i].indexOf("<" + self.pageData.dataFields[j] + "/>") >= 0) {
								recordData[j] = ""
								fullRecordData[j] = ""
							}

						}
					}
					if (self.filterDataXMLOK(visibleData)) {
						tempData.push(recordData);
					}

				}

				//var dataStr = '<Table>\n'
				var dataStr = '<Recordset RecordCount=\"' + tempData.length + '\" PageCount=\"1\">\n';
				dataStr = dataStr + '<Page PageNumber=\"1\">\n';

				for (var i = 0; i < tempData.length; i++) {
					dataStr = dataStr + '  <Record>\n'

					for (var iCV = 0; iCV < self.initMetadata.DataFields.length; iCV++) {
						
						var dataField = self.initMetadata.DataFields[iCV]
						dataStr = dataStr + '    <' + dataField + '>'
						dataStr = dataStr + (tempData[i][iCV] || '').replace(/\&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
						dataStr = dataStr + '</' + dataField + '>\n'
					}

					for (var iCV = 0; iCV < measures.length; iCV++) {
						dataStr = dataStr + '    <' + measures[iCV].getAttribute("dataField") + '>'
						dataStr = dataStr + (tempData[i][iCV + self.initMetadata.DataFields.length] || '').replace(/\&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
						dataStr = dataStr + '</' + measures[iCV].getAttribute("dataField") + '>\n'
					}

					dataStr = dataStr + '  </Record>\n'
				}

				dataStr = dataStr + '</Page>\n</Recordset>';
				return dataStr
			
		}

		this.getMetadataXML = function () {
			xml = '<OLAPCube format="' + this.defaultPicture.getAttribute("format") + '" thousandsSeparator="' + this.defaultPicture.getAttribute("thousandsSeparator") + '" decimalSeparator="' + this.defaultPicture.getAttribute("decimalSeparator") + '" dateFormat="' + this.defaultPicture.getAttribute("dateFormat") + '">'

			var forMetadatacolumns = this.columns;
			if (self.initMetadata.Metadata) {
				var xmlDoc = jQuery.parseXML(self.initMetadata.Metadata);
				forMetadatacolumns = []
				forMetadatacolumns = xmlDoc.getElementsByTagName("OLAPDimension");
			}

			var hiddenPos = 1
			
			var rowPos = 0; var cantRowHidden = 0;
			var colPos = 0; var cantColHidden = 0;
			var pagePos = 0; var cantPageHidden = 0;
			for (var iCV = 0; iCV < forMetadatacolumns.length; iCV++) {
				var conPos = iCV;
				if (self.initMetadata.Metadata) {
					conPos = -1;
					for (var c = 0; c < self.conditions.length; c++) {
						if (self.conditions[c].dataField == self.initMetadata.Dimensions[iCV].dataField) {
							conPos = c;
						}
					}
				}

				xml = xml + '<OLAPDimension>'

				xml = xml + '<name>' + forMetadatacolumns[iCV].getAttribute("name") + '</name> '
				xml = xml + '<displayName>' + forMetadatacolumns[iCV].getAttribute("displayName") + '</displayName> ';
				xml = xml + '<description>' + forMetadatacolumns[iCV].getAttribute("description") + '</description> ';
				xml = xml + '<dataField>' + forMetadatacolumns[iCV].getAttribute("dataField") + '</dataField> ';
				xml = xml + '<dataType>' + forMetadatacolumns[iCV].getAttribute("dataType") + '</dataType> ';
				
				if ((self.initMetadata.Dimensions) && (!self.initMetadata.Dimensions[iCV].Visible)) {
					xml = xml + '<hidden>true</hidden>'
				}

				
				xml = xml + '<axis>'
				var pos = 0;
				var defaultPos = "";
					if (conPos == -1) {
						if (forMetadatacolumns[iCV].getAttribute("visible").toLowerCase() != "never"){
							xml = xml + forMetadatacolumns[iCV].getAttribute("axis").toLowerCase()
							
							var type = self.initMetadata.Dimensions[iCV].defaultPosition 
							if (type == "Rows") 
							{
								cantRowHidden=cantRowHidden + 1
								pos = rowPos + 1
								rowPos = pos
							}
							if (type == "Columns")
							{ 
								cantColHidden=cantColHidden + 1
								pos = colPos + 1
								colPos = pos
							}
							if (type == "Pages") 
							{ 
								cantPageHidden=cantPageHidden + 1
								pos = pagePos + 1
								pagePos = pos
							}
							
						} else {
							xml = xml + ""
						}

					} else if (self.rowConditions.indexOf(conPos) != -1) {
						xml = xml + 'rows';
						pos = self.rowConditions.indexOf(conPos) + 1 + cantRowHidden
						rowPos = pos
						defaultPos = 'rows';
					} else if (self.colConditions.indexOf(conPos) != -1) {
						xml = xml + 'columns';
						pos = self.colConditions.indexOf(conPos) + 1 + cantColHidden
						colPos = pos;
						defaultPos = 'columns'
					} else {
						xml = xml + 'pages';
						pos = self.filterIndexes.indexOf(conPos) + 1 + cantPageHidden
						pagePos = pos;
						defaultPos = 'pages'
					}
			
				
				xml = xml + '</axis> '
				
								
				if (forMetadatacolumns[iCV].getAttribute("visible").toLowerCase() != "never"){
					xml = xml + '<position>' + pos + '</position> ';
				} else {
					xml = xml + '<position/>'
				}


				
				var summarize = forMetadatacolumns[iCV].getAttribute("summarize");
				if (conPos >= 0) {
					summarize = (self.conditions[conPos].subtotals) ? "yes" : "no";
				}

				xml = xml + '<summarize>' + summarize + '</summarize> ';
				xml = xml + '<align>' + forMetadatacolumns[iCV].getAttribute("align") + '</align> ';

				if (forMetadatacolumns[iCV].getAttribute("picture") === "") {
					xml = xml + '<picture/> '
				} else {
					xml = xml + '<picture>' + forMetadatacolumns[iCV].getAttribute("picture") + '</picture> ';
				}

				if (forMetadatacolumns[iCV].getAttribute("picture") === "") {
					xml = xml + '<format/> ';
				} else {
					xml = xml + '<format>' + forMetadatacolumns[iCV].getAttribute("format") + '</format> ';
				}

				var prevConPos = -1;
				if (self.initMetadata.Metadata) {
					prevConPos = -1;
					for (var c = 0; c < self.initMetadata.Conditions.length; c++) {
						if (self.initMetadata.Conditions[c].dataField == self.initMetadata.Dimensions[iCV].dataField) {
							prevConPos = c;
						}
					}
				}

				
				
				if (forMetadatacolumns[iCV].getAttribute("visible").toLowerCase() != "never"){
					var sortValue = (conPos > -1) ? self.conditions[conPos].sort : (prevConPos > - 1) ? self.initMetadata.Conditions[prevConPos].sort : "metadata";
					if (sortValue == "metadata") {
						xml = xml + '<order>' + ((forMetadatacolumns[iCV].getAttribute("order") != "") ? forMetadatacolumns[iCV].getAttribute("order") : 'Ascending') + '</order> '
					} else {
						if (sortValue == 1)
							xml = xml + '<order>Ascending</order> '
						else if (sortValue == -1)
							xml = xml + '<order>Descending</order> '
						else
							xml = xml + '<order>Custom</order> '
					}
				} else {
					xml = xml + '<order>' + forMetadatacolumns[iCV].getAttribute("order") + '</order> '
				}
				xml = xml + '<customOrder/> ';

				xml = xml + '<filterType>'

				var blackList = (conPos > -1) ? self.conditions[conPos].blackList : (prevConPos > - 1) ? self.initMetadata.Conditions[prevConPos].blackList : [];
				
				if (blackList.length == 0) {
					if ((conPos > -1) && (self.conditions[conPos].defaultAction == "Exclude")) {
						if (self.conditions[conPos].visibles.length == 0)   
							xml = xml + 'HideAllValues';
						else
							xml = xml + 'ShowAllValues'
					} else {
						xml = xml + 'ShowAllValues';
					}
				} else {
					xml = xml + 'ShowSomeValues';
				}

				xml = xml + '</filterType>'

				xml = xml + '<include> ';

				var findex = (conPos > -1) ? self.filterIndexes.indexOf(conPos) : -1;
				if ((findex != -1) && (self.filterDiv.selects.length > findex) && (self.filterDiv.selects[findex].value != "[all]")) {
						xml = xml + '<value>' + self.filterDiv.selects[findex].value + '</value> ';
				} else {
					var distinctValues = (conPos > -1) ? self.conditions[conPos].distinctValues : (prevConPos > - 1) ? self.initMetadata.Conditions[prevConPos].distinctValues : [];
					if (!(((conPos > -1) && (self.conditions[conPos].defaultAction == "Exclude")) && (blackList.length == 0))) {
						for (var val = 0; val < distinctValues.length; val++) {
							if (blackList.indexOf(distinctValues[val]) === -1) {
								xml = xml + '<value>' + distinctValues[val] + '</value> ';
							}
						}
					}
				}
				xml = xml + '<value>TOTAL</value> </include>'

				xml = xml + '<collapseType>'

				var collapsedValues = (conPos > -1) ? self.conditions[conPos].collapsedValues : (prevConPos > - 1) ? self.initMetadata.Conditions[prevConPos].collapsedValues : [];
				if ((collapsedValues == undefined) || (collapsedValues.length == 0)) {
					xml = xml + 'ExpandAllValues'
					xml = xml + '</collapseType>'
				} else {
					xml = xml + 'ExpandSomeValues'
					xml = xml + '</collapseType>'
					var distinctValues = [];
					
					distinctValues = (conPos > -1) ? self.conditions[conPos].distinctValues : (prevConPos > - 1) ? self.initMetadata.Conditions[prevConPos].distinctValues : [];
					
					xml = xml + '<includeExpand> ';

					for (var val = 0; val < distinctValues.length; val++) {
						if ((distinctValues[val] != undefined) && (collapsedValues.indexOf(distinctValues[val]) == -1)) {
							xml = xml + '<value>' + distinctValues[val] + '</value>'
						}
					}

					xml = xml + '</includeExpand> ';
				}

				xml = xml + '</OLAPDimension>'
			}

			var forMetadatameasures = measures;
			if (self.initMetadata.Metadata) {
				var xmlDoc = jQuery.parseXML(self.initMetadata.Metadata);
				forMetadatameasures = []
				forMetadatameasures = xmlDoc.getElementsByTagName("OLAPMeasure");
			}
			
			var measurePosition = rowPos;
			for (var iCV = 0; iCV < forMetadatameasures.length; iCV++) {
				xml = xml + '<OLAPMeasure> ';

				xml = xml + '<name>' + forMetadatameasures[iCV].getAttribute("name") + '</name> '
				xml = xml + '<displayName>' + forMetadatameasures[iCV].getAttribute("displayName") + '</displayName> ';
				xml = xml + '<description>' + forMetadatameasures[iCV].getAttribute("description") + '</description> ';
				xml = xml + '<dataField>' + forMetadatameasures[iCV].getAttribute("dataField") + '</dataField> ';
				xml = xml + '<dataType>' + forMetadatameasures[iCV].getAttribute("dataType") + '</dataType> ';
				xml = xml + '<defaultAggregator>' + forMetadatameasures[iCV].getAttribute("defaultAggregator") + '</defaultAggregator> ';
				xml = xml + '<validAggregators>' + forMetadatameasures[iCV].getAttribute("validAggregators") + '</validAggregators> ';
				xml = xml + '<summarize>' + forMetadatameasures[iCV].getAttribute("summarize") + '</summarize> ';

				if (forMetadatameasures[iCV].getAttribute("format") === "") {
					xml = xml + '<format/> ';
				} else {
					xml = xml + '<format>' + forMetadatameasures[iCV].getAttribute("format") + '</format> ';
				}

				xml = xml + '<align>' + forMetadatameasures[iCV].getAttribute("align") + '</align> ';

				if (forMetadatameasures[iCV].getAttribute("picture") === "") {
					xml = xml + '<picture/> '
				} else {
					xml = xml + '<picture>' + forMetadatameasures[iCV].getAttribute("picture") + '</picture> ';
				}

				if ((self.initMetadata.Measures) && (!self.initMetadata.Measures[iCV].Visible)) {
					xml = xml + '<hidden>true</hidden>'
				}
				
				if (forMetadatameasures[iCV].getAttribute("visible").toLowerCase() != "never"){
					measurePosition = measurePosition + 1;
					xml = xml + '<position>' + measurePosition + '</position> ';
				} else {
					xml = xml + '<position/>'
				}
				
				
				
				
				
				xml = xml + '</OLAPMeasure>';
			}

			xml = xml + '</OLAPCube>'
			xml = xml.replace(/\&/g, "&amp;");
			return xml
		}

		this.createXMLMetadata = function () {
			var xml = '<OLAPCube format="' + this.defaultPicture.getAttribute("format") + '" thousandsSeparator="' + this.defaultPicture.getAttribute("thousandsSeparator") + '" decimalSeparator="' + this.defaultPicture.getAttribute("decimalSeparator") + '" dateFormat="' + this.defaultPicture.getAttribute("dateFormat") + '">';

			for (var iCV = 0; iCV < this.columns.length; iCV++) {
				if ((this.conditions[iCV] != false) && (this.conditions[iCV] != undefined)) {
					xml = xml + '<OLAPDimension> ';

					xml = xml + '<name>' + this.columns[iCV].getAttribute("name") + '</name> '
					xml = xml + '<displayName>' + this.columns[iCV].getAttribute("displayName") + '</displayName> ';
					xml = xml + '<description>' + this.columns[iCV].getAttribute("description") + '</description> ';
					xml = xml + '<dataField>' + this.columns[iCV].getAttribute("dataField") + '</dataField> ';
					xml = xml + '<dataType>' + this.columns[iCV].getAttribute("dataType") + '</dataType> ';
					xml = xml + '<summarize>' + this.columns[iCV].getAttribute("summarize") + '</summarize> ';
					xml = xml + '<align>' + this.columns[iCV].getAttribute("align") + '</align> ';

					if (this.columns[iCV].getAttribute("picture") === "") {
						xml = xml + '<picture/> '
					} else {
						xml = xml + '<picture>' + this.columns[iCV].getAttribute("picture") + '</picture> ';
					}

					if (this.columns[iCV].getAttribute("picture") === "") {
						xml = xml + '<format/> ';
					} else {
						xml = xml + '<format>' + this.columns[iCV].getAttribute("format") + '</format> ';
					}

					if (this.conditions[iCV].sort === 1)
						xml = xml + '<order>ascending</order> '
					else
						xml = xml + '<order>descending</order> '
					xml = xml + '<customOrder/> ';
					xml = xml + '<include> ';

					var findex = self.filterIndexes.indexOf(iCV);
					if ((findex != -1) && (self.filterDiv.selects[findex].value != "[all]")) {
						if (this.conditions[iCV].blackList.indexOf(self.filterDiv.selects[findex].value) === -1) {
							xml = xml + '<value>' + self.filterDiv.selects[findex].value.toString().trimpivot() + '</value> ';
						}
					} else {
						
							if (self.conditions[iCV].state != "none") {
								for (var val = 0; val < this.conditions[iCV].distinctValues.length; val++) {
									if (this.conditions[iCV].blackList.indexOf(this.conditions[iCV].distinctValues[val]) === -1) {
										xml = xml + '<value>' + this.conditions[iCV].distinctValues[val].toString().trimpivot() + '</value> ';
									}
								}
							}
						
					}
					xml = xml + '<value>TOTAL</value> </include> <collapse/> ';

					xml = xml + '<hide> '
					
						if (self.conditions[iCV].state == "none") {
							for (var val = 0; val < this.conditions[iCV].distinctValues.length; val++) {
								xml = xml + '<value>' + this.conditions[iCV].distinctValues[val].toString().trimpivot() + '</value> ';
							}
						} else if (self.conditions[iCV].state != "all") {
							for (var yu = 0; yu < this.conditions[iCV].blackList.length; yu++) {
								xml = xml + '<value>' + this.conditions[iCV].blackList[yu].toString().trimpivot() + '</value> ';
							}
						}
					
					xml = xml + '</hide> '

					if (self.rowConditions.indexOf(iCV) != -1) {
						xml = xml + '<condition>row</condition> ';
						xml = xml + '<filterbar>no</filterbar> ';
						xml = xml + '<position>' + self.rowConditions.indexOf(iCV) + '</position>'
					} else if (self.colConditions.indexOf(iCV) != -1) {
						xml = xml + '<condition>col</condition> ';
						xml = xml + '<filterbar>no</filterbar> ';
						xml = xml + '<position>' + self.colConditions.indexOf(iCV) + '</position>'
					} else {
						xml = xml + '<condition>none</condition> ';
						xml = xml + '<filterbar>yes</filterbar> ';
					}

					xml = xml + '<filterdivs> ';
					if (findex != -1) {
						xml = xml + '<value>' + self.filterDiv.selects[findex].value.toString().trimpivot() + '</value> ';
					}
					xml = xml + '</filterdivs> ';

					xml = xml + '<restoreview>no</restoreview> ';
					xml = xml + ' </OLAPDimension>';
				}
			}

			for (var iCV = 0; iCV < measures.length; iCV++) {
				xml = xml + '<OLAPMeasure> ';

				xml = xml + '<name>' + measures[iCV].getAttribute("name") + '</name> '
				xml = xml + '<displayName>' + measures[iCV].getAttribute("displayName") + '</displayName> ';
				xml = xml + '<description>' + measures[iCV].getAttribute("description") + '</description> ';
				xml = xml + '<dataField>' + measures[iCV].getAttribute("dataField") + '</dataField> ';
				xml = xml + '<dataType>' + measures[iCV].getAttribute("dataType") + '</dataType> ';
				xml = xml + '<defaultAggregator>' + measures[iCV].getAttribute("defaultAggregator") + '</defaultAggregator> ';
				xml = xml + '<validAggregators>' + measures[iCV].getAttribute("validAggregators") + '</validAggregators> ';
				xml = xml + '<summarize>' + measures[iCV].getAttribute("summarize") + '</summarize> ';

				if (measures[iCV].getAttribute("format") === "") {
					xml = xml + '<format/> ';
				} else {
					xml = xml + '<format>' + measures[iCV].getAttribute("format") + '</format> ';
				}

				xml = xml + '<align>' + measures[iCV].getAttribute("align") + '</align> ';

				if (measures[iCV].getAttribute("picture") === "") {
					xml = xml + '<picture/> '
				} else {
					xml = xml + '<picture>' + measures[iCV].getAttribute("picture") + '</picture> ';
				}

				xml = xml + ' </OLAPMeasure>';

			}
			xml = xml + "</OLAPCube>";

			return xml;
		}

		this.ExportToXML = function () {
			var xml = '<EXPORT format="XML" type="pivot">';
			xml = xml + '<METADATA>';
			for (var iCV = 0; iCV < this.columns.length; iCV++) {

				var position = 'row';
				if (self.rowConditions.indexOf(iCV) != -1) {
					position = 'row';
				} else if (self.colConditions.indexOf(iCV) != -1) {
					position = 'column';
				} else {
					position = 'filter';
				}

				xml = xml + '<OLAPDimension ';
				xml = xml + 'name="' + this.columns[iCV].getAttribute("dataField") + '" ';
				xml = xml + 'label="' + this.columns[iCV].getAttribute("displayName") + '" ';
				xml = xml + 'picture="' + this.columns[iCV].getAttribute("picture") + '" ';
				xml = xml + 'datatype="' + this.columns[iCV].getAttribute("dataType") + '" ';
				xml = xml + 'showAll="true" ';
				xml = xml + 'position="' + position + '">';

				if ((this.conditions[iCV] != undefined) && (this.conditions[iCV].distinctValues != undefined)) {
					for (var val = 0; val < this.conditions[iCV].distinctValues.length; val++) {
						xml = xml + '<VALUE CHECKED=';
						if (this.conditions[iCV].blackList.indexOf(this.conditions[iCV].distinctValues[val]) === -1) {
							xml = xml + '"true"';
						} else {
							xml = xml + '"false"';
						}
						if (this.conditions[iCV].collapsedValues.indexOf(this.conditions[iCV].distinctValues[val]) == -1) {
							xml = xml + ' COLLAPSED="false">'
						} else {
							xml = xml + ' COLLAPSED="true">'
						}
						xml = xml + this.conditions[iCV].distinctValues[val] + '</VALUE>';
					}
				}

				xml = xml + '</OLAPDimension>';
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
			for (var i = 0; i < this.allDataWithoutSort.length; i++) {
				xml = xml + '<ROW ';
				for (var iCV = 0; iCV < this.columns.length; iCV++) {
					xml = xml + this.columns[iCV].getAttribute("dataField") + '="' + this.allDataWithoutSort[i][iCV] + '" ';
				}
				for (var iCV = 0; iCV < measures.length; iCV++) {
					xml = xml + measures[iCV].getAttribute("dataField") + '="' + this.allDataWithoutSort[i][iCV + this.columns.length] + '" ';
				}
				xml = xml + '/>'
			}
			xml = xml + '</FLATDATA>';

			xml = xml + '<COLITEMS>' //include measures & dimensions move to columns
			var previuosXml = xml;
			try {
				var level = 0;
				var maxlevel = this.colConditions.length;
				if (level === maxlevel) {
					for (var iCV = 0; iCV < measures.length; iCV++) {
						xml = xml + '<COLITEM measure="' + measures[iCV].getAttribute("displayName") + '" type=""'
						xml = xml + '/>';
					}
				} else {
					level++;
					for (var iCV = 0; iCV < this.colStructure.items.length; iCV++) {
						xml = xml + this.createXMLCOLITEMS(this.colStructure.items[iCV], level, maxlevel);
					}
				}
			} catch (ERROR) {
				xml = previuosXml;
			}
			xml = xml + '</COLITEMS>'

			xml = xml + '<ROWITEMS>'
			previuosXml = xml;
			try {
				for (var iCV = 0; iCV < this.rowStructure.items.length; iCV++) {
					var level = 0;
					var maxlevel = this.columns.length - this.colConditions.length - this.filterIndexes.length - 1;
					if (maxlevel >= level) {
						xml = xml + this.createXMLROWITEMS(this.rowStructure.items[iCV], level, maxlevel);
					}
				}
			} catch (ERROR) {
				xml = previuosXml;
			}
			xml = xml + '</ROWITEMS>'


			//add Html info
			xml = xml + '<HTML>';

			xml = xml + '<HEAD>';
			xml = xml + '<META content="text/html; charset=utf-8" http-equiv="Content-Type"/>';

			xml = xml + '<STYLE>';

			xml = xml + '.h2title {background-color: #5C5D5F; border-color: #666666; font-family: Verdana; font-weight: normal; font-size: 10pt; height: 44px; color: #E0E0E0;}\n';
			xml = xml + '.h2titlewhite {background-color: #ffffff; font-family: Verdana; font-size: 10pt; font-weight: normal; height: 25px; color: black;}\n';
			xml = xml + '.even {background-color: #FEFEFE;	font-weight: normal; font-family: Verdana; font-size: 10pt;	padding: 5px; }\n';
			xml = xml + '.h2subtitle {background-color: #5C5D5F; border-color: #666666; font-family: Verdana; font-weight: normal; font-size: 10pt;	height: 22px; color: #E0E0E0;}\n';
			xml = xml + '.gtotal {background-color: #EBEBEB; font-weight: normal; font-family: Verdana; font-size: 10pt;}\n';
			xml = xml + '.pivot_table td.total {background-color: #EBEBEB; font-weight: normal;	font-family: Verdana; font-size: 10pt;}\n';
			xml = xml + '.pivot_table td.subtotal {background-color: #EBEBEB; font-weight: normal;	font-family: Verdana; font-size: 10pt;}\n';

			xml = xml + '</STYLE>';
			xml = xml + '</HEAD>';

			xml = xml + '<BODY>';
			xml = xml + '<TABLE border="2">'

			for (var i = 0; i < jQuery("#" + self.controlName + "_" + self.query + " tr").length; i++) {//for every row
				xml = xml + '<TR>';

				var tRow = jQuery("#" + self.controlName + "_" + self.query + " tr")[i];
				for (var j = 0; j < tRow.children.length; j++) {
					var childText = OAT.removeIconFont(tRow.children[j].textContent).trim();
					var hidden = tRow.children[j].getAttribute('hidden');

					var styleString = "";
					if ((tRow.children[j].getAttribute("style") != undefined) && (tRow.children[j].getAttribute("style") != null)) {
						styleString = " style=\"" + tRow.children[j].getAttribute("style") + "\" ";
					}

					var classString = "";
					if ((tRow.children[j].getAttribute("class") != undefined) && (tRow.children[j].getAttribute("class") != null)) {
						classString = " class=\"" + tRow.children[j].getAttribute("class") + "\" ";
					}

					if (hidden === null) {
						var rowSpan = tRow.children[j].getAttribute('rowspan');
						var colSpan = tRow.children[j].getAttribute('colspan');
						if (((rowSpan === null) && (colSpan === null)) || (j === tRow.children.length - 1)) {
							xml = xml + '<TD ' + classString + ' ' + styleString + '>' + childText + '</TD>';
						} else if (colSpan === null) {
							xml = xml + '<TD ' + classString + " " + 'rowspan="' + rowSpan + '" ' + styleString + ' >' + childText + '</TD>';
						} else if (rowSpan === null) {
							xml = xml + '<TD ' + classString + " " + 'colspan="' + colSpan + '" ' + styleString + ' >' + childText + '</TD>';
						} else {
							xml = xml + '<TD ' + classString + " " + 'colspan="' + colSpan + '" rowspan="' + rowSpan + '" ' + styleString + ' >' + childText + '</TD>';
						}
					}
				}

				xml = xml + '</TR>';
			}


			xml = xml + '</TABLE>';

			xml = xml + '</BODY>';

			xml = xml + '</HTML>';
			//
			xml = xml + "</EXPORT>";

			return xml.replace(/\&/g, "&amp;");

		}

		this.createXMLROWITEMS = function (item, level, maxlevel) {
			var parentCollapse = ((item.parent == undefined) || (item.parent.collapsed == undefined)) ? false : item.parent.collapsed;
			var str = '<ROWITEM dimension="' + columns[level].getAttribute('dataField') + '" collapsed="' + item.collapsed + '" parentCollapsed="' + parentCollapse + '" value="' + item.value + '" level="' + level + '"'
			if (level === maxlevel) {
				return str + "/>";
			} else {
				level++;
				str = str + ">";
				for (var i = 0; i < item.items.length; i++) {
					str = str + this.createXMLROWITEMS(item.items[i], level, maxlevel);
				}
				str = str + '</ROWITEM>'
				return str;
			}
		}

		this.createXMLCOLITEMS = function (item, level, maxlevel) {
			var str = ""
			if (level === maxlevel) {
				for (var iCV = 0; iCV < measures.length; iCV++) {
					str = str + '<COLITEM measure="' + measures[iCV].getAttribute("displayName") + '" type="">'
					var inRow = self.rowConditions.length - measures.length + 1;
					str = str + '<VALITEM dimension="' + columns[level - 1 + inRow].getAttribute('dataField') + '" value="' + item.value + '"/>' //level + cantidad de dimensiones que no estan movidas a las columnas
					var superItem = item;
					while (superItem.parent.depth != -1) {
						superItem = superItem.parent;
						str = str + '<VALITEM dimension="' + columns[level - 1 + inRow].getAttribute('dataField') + '" value="' + superItem.value + '"/>'
					}
					str = str + '</COLITEM>';
				}
				return str;
			} else {
				level++;
				for (var i = 0; i < item.items.length; i++) {
					str = str + this.createXMLCOLITEMS(item.items[i], level, maxlevel);
				}
				return str;
			}
		}

		this.ExportToExcel = function (fileName) {
			var table = '<table border="2">'

			for (var i = 0; i < jQuery("#" + self.controlName + "_" + self.query + " tr").length; i++) {//for every row
				table = table + '<tr>';

				var tRow = jQuery("#" + self.controlName + "_" + self.query + " tr")[i];
				for (var j = 0; j < tRow.children.length; j++) {
					var childText = OAT.removeIconFont(tRow.children[j].textContent.replace(/^\s+|\s+$/g, '')).trim();
					var hidden = tRow.children[j].getAttribute('hidden');

					var styleString = "";
					if ((tRow.children[j].getAttribute("style") != undefined) && (tRow.children[j].getAttribute("style") != null)) {
						styleString = " style=\"" + tRow.children[j].getAttribute("style") + "\" ";
					}

					var parseText = ""
					var previusJap = false;
					
					for (var c = 0; c < childText.length; c++) {
						if (childText.charCodeAt(c) < 1000) {
							if (previusJap) {
								parseText = parseText + " " + childText[c];
							} else {
								parseText = parseText + childText[c];
							}
							previusJap = false;
						} else {
							var Hex = childText.charCodeAt(c).toString(16);
							parseText = parseText + "&#x" + Hex;
							previusJap = true;
						}
					}
					
					/*if (self.defaultPicture.getAttribute("dateFormat") == "YMD") {
						var count = parseText.match(/\//igm)
						if (count != null && count.length == 2 && parseText.indexOf('o') < 0) {
							parseText = '="' + parseText + '"'
							styleString = ' style="width:80px;" ';
							if (parseText.indexOf(':') > -1)
								styleString = ' style="width:140px;" ';
						}
					}*/
					
					if (hidden === null) {
						var rowSpan = tRow.children[j].getAttribute('rowspan');
						var colSpan = tRow.children[j].getAttribute('colspan');
						if (((rowSpan === null) && (colSpan === null)) || (j === tRow.children.length - 1)) {
							table = table + '<td ' + styleString + '>' + parseText + '</td>';
						} else if (colSpan === null) {
							table = table + '<td rowspan="' + rowSpan + '" ' + styleString + ' >' + parseText + '</td>';
						} else if (rowSpan === null) {
							table = table + '<td colspan="' + colSpan + '" ' + styleString + ' >' + parseText + '</td>';
						} else {
							table = table + '<td colspan="' + colSpan + '" rowspan="' + rowSpan + '" ' + styleString + ' >' + parseText + '</td>';
						}
					}
				}

				table = table + '</tr>';
			}

			table = table + '</table>'; //</tbody>
			
			//add header for special characters 
			var header = '<head><meta http-equiv="Content-Type" content="text/html;charset=utf-8"></head><body>'
			table = header + table + '</body>'
			
			var dtltbl = table;

			if ((OAT.isSafari()) || (self.isSD)) { //for safari
				window.open('data:application/vnd.ms-excel,' + encodeURIComponent(dtltbl));
			} else {
				var blob = new Blob([dtltbl], { type: "application/vnd.ms-excel" });
				saveAs(blob, fileName + ".xls");
			} 

		}


		this.lightOn = function () {
			for (var i = 0; i < self.gd.targets.length; i++) {
				var elm = self.gd.targets[i][0];
				if (OAT.isIE()) {
					elm.className += " drag-drop";
				} else {
					elm.classList.add("drag-drop");
				}
			}
		}

		this.lightOff = function () {
			for (var i = 0; i < self.gd.targets.length; i++) {
				var elm = self.gd.targets[i][0];
				try {
					elm.classList.remove("drag-drop");
				} catch (error) {

				}
			}
		}
		self.gd.onFail = self.lightOff;

		this.process = function (elm) {
			self.lightOn();

			var spanImageDragDrop = OAT.Dom.create("div");
			var spanImageArrow = OAT.Dom.create("div");
			spanImageDragDrop.setAttribute("class", "drag_drop_indicator");
			spanImageArrow.setAttribute("class", "drag_drop_arrow");
			OAT.addImageNode(spanImageDragDrop, "drag_indicator", "");
			OAT.addImageNode(spanImageArrow, "arrow_drop_up", "");
			elm.className = "att_drag_drop";
			elm.appendChild(spanImageArrow);
			elm.appendChild(spanImageDragDrop);
		}

		this.filterOK = function (row) { 
			for (var i = 0; i < self.filterIndexes.length; i++) { 
				var fi = self.filterIndexes[i]; 
				var s = self.filterDiv.selects[i]; 
				if (s.selectedIndex && OAT.$v(s) != row[fi]) { return false; }
			}


			for (var i = 0; i < self.rowConditions.length; i++) { 
				var value = row[self.rowConditions[i]];
				var cond = self.conditions[self.rowConditions[i]];
				if ((cond.blackList.length > 0) && (cond.blackList.indexOf(value) != -1)) { return false; }
			}


			for (var i = 0; i < self.colConditions.length; i++) { 
				var value = row[self.colConditions[i]];
				var cond = self.conditions[self.colConditions[i]];
				if ((cond.blackList.length > 0) && (cond.blackList.indexOf(value) != -1)) { return false; }
			}
			return true;
		}
		
		this.filterDataXMLOK = function (row) { 
			for (var i = 0; i < self.filterIndexes.length; i++) { 
				var fi = self.filterIndexes[i]; 
				var s = self.filterDiv.selects[i]; 
				if (s.selectedIndex && OAT.$v(s) != row[fi]) { return false; }
			}

			for (var i = 0; i < self.rowConditions.length; i++) { 
				var value = row[self.rowConditions[i]];
				var cond = self.conditions[self.rowConditions[i]];
				if (cond.state == "none")  { return false; }
				
				if (cond.defaultAction == "Exclude") {
					if (cond.visibles.indexOf(value) == -1) { return false; }
				} else {
					if (cond.blackList.indexOf(value) != -1) { return false; }
				}

			}

			for (var i = 0; i < self.colConditions.length; i++) { 
				var value = row[self.colConditions[i]];
				var cond = self.conditions[self.colConditions[i]];
				if (cond.state == "none")  { return false; }
				if (cond.defaultAction == "Exclude") {
					if (cond.visibles.indexOf(value) == -1) { return false; }
				} else {
					if (cond.blackList.indexOf(value) != -1) { return false; }
				}
			}
			return true;
		}

		this.sort = function (cond, index) { /* sort distinct values of a condition */
			var sortFunc;
			var coef = cond.sort; if (cond.sort == 0) { coef = 1 } if (cond.sort == 2) { coef = -1 }
			var numSort = function (a, b) {
				if (a == b) { return 0; }
				return coef * (parseInt(a) > parseInt(b) ? 1 : -1);
			}
			var dictSort = function (a, b) {
				if (a == b) { return 0; }
				return coef * (a > b ? 1 : -1);
			}

			if (cond.distinctValues == undefined) return;

			//new code
			var sortInt = true;
			for (var ival = 0; ival < cond.distinctValues.length; ival++) {
				if ((sortInt) && (cond.distinctValues[ival] != parseInt(cond.distinctValues[ival]))) {
					sortInt = false;
				}
			}
			if (sortInt) { sortFunc = numSort; } else { sortFunc = dictSort; } //decides the type of sorting
			//end new code
			var testValue = cond.distinctValues[0];

			if ((cond.sort != 0) && (cond.sort != 2)) {
				cond.distinctValues.sort(sortFunc);
			} else {
				if ((index != undefined) && (self.columns[index] != undefined)) {
					cond.distinctValues.sort(sortFunc);

					var prevValues = [];
					for (var h = 0; h < cond.distinctValues.length; h++) {
						prevValues[h] = cond.distinctValues[h];
					}

					cond.distinctValues = [];
					if (cond.sort == 0) {
						for (var h = 0; h < self.columns[index].childNodes.length; h++) {
							if ((self.columns[index].childNodes[h] != undefined) &&
								(self.columns[index].childNodes[h].localName != undefined) &&
								(self.columns[index].childNodes[h].localName === "customOrder")) {
								for (var n = 0; n < self.columns[index].childNodes[h].childNodes.length; n++) {
									if (self.columns[index].childNodes[h].childNodes[n].localName == "Value") {
										//cond.distinctValues.push(self.columns[index].childNodes[h].childNodes[n].textContent);
										var notTrimValue = self.columns[index].childNodes[h].childNodes[n].textContent
										for (var m = 0; m < prevValues.length; m++) {
											if (prevValues[m].trimpivot() == notTrimValue.trimpivot()) {
												cond.distinctValues.push(prevValues[m]);
											}
										}
									}
								}
							}
						}
					} else {
						for (var h = 0; h < self.columns[index].childNodes.length; h++) {
							if ((self.columns[index].childNodes[h] != undefined) &&
								(self.columns[index].childNodes[h].localName != undefined) &&
								(self.columns[index].childNodes[h].localName === "customOrder")) {
								for (var n = self.columns[index].childNodes[h].childNodes.length - 1; n >= 0; n--) {
									if (self.columns[index].childNodes[h].childNodes[n].localName == "Value") {
										//cond.distinctValues.push(self.columns[index].childNodes[h].childNodes[n].textContent);
										var notTrimValue = self.columns[index].childNodes[h].childNodes[n].textContent
										for (var m = 0; m < prevValues.length; m++) {
											if (prevValues[m].trimpivot() == notTrimValue.trimpivot()) {
												cond.distinctValues.push(prevValues[m]);
											}
										}
									}
								}
							}
						}
					}
					if (cond.distinctValues.length < prevValues.length) {
						for (var h = 0; h < prevValues.length; h++) {
							if (cond.distinctValues.indexOf(prevValues[h]) == -1) {
								cond.distinctValues.push(prevValues[h])
							}
						}
					}
				}
			}
			if ((columns.length == 1) || (measures.length = 0)) {
				if (cond.sort == 1) {
					self.allData.sort((function (index) {
						return function (a, b) {
							return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
						};
					})(0));
				} else if (cond.sort == -1) {
					self.allData.sort((function (index) {
						return function (a, b) {
							return (a[index] === b[index] ? 0 : (a[index] > b[index] ? -1 : 1));
						};
					})(0));
				}
			}
		} /* sort */

		/* init routines */
		this.initCondition = function (index) {
			if ((index == self.dataColumnIndex) && (((columns.length > 1) || (measures.length > 0)))) { /* dummy condition */
				self.conditions.push(false);
				return;
			}
			var sortValue = 1;

			var showSubtotals = 1;
			var hideSubtotalsOption = false;
			var validPosition = "filters;rows;columns;hidden";
			var isDimension = false;
			if (self.columns[index] != undefined) {
				isDimension = true;
				
					if ((self.columns[index].getAttribute("order") != undefined) && (self.columns[index].getAttribute("order") === "ascending")) {
						sortValue = 1;
					}
				
				if ((self.columns[index].getAttribute("order") != undefined) && (self.columns[index].getAttribute("order") === "descending")) {
					sortValue = -1;
				}
				if ((self.columns[index].getAttribute("order") != undefined) && (self.columns[index].getAttribute("order") === "custom")) {
					//sortValue = 0;
					//if (self.serverPagination) {
						sortValue = 1;
					//}
				}
				if ((self.columns[index].getAttribute("summarize") != undefined) && (self.columns[index].getAttribute("summarize") === "yes")) {
					showSubtotals = 1;

					for (var h = 0; h < self.columns[index].childNodes.length; h++) {
						if ((self.columns[index].childNodes[h] != undefined) &&
							(self.columns[index].childNodes[h].localName != undefined) &&
							(self.columns[index].childNodes[h].localName === "include")) {
							showSubtotals = false;
							for (var n = 0; n < self.columns[index].childNodes[h].childNodes.length; n++) {
								if ((self.columns[index].childNodes[h].childNodes[n].localName != null) &&
									(self.columns[index].childNodes[h].childNodes[n].localName.toLowerCase() === "value")) {
									if (self.columns[index].childNodes[h].childNodes[n].textContent == "TOTAL") {
										showSubtotals = true;
									}
								}
							}
						} else if ((self.columns[index].childNodes[h] != undefined) &&
							(self.columns[index].childNodes[h].localName != undefined) &&
							(self.columns[index].childNodes[h].localName === "exclude")) {
							showSubtotals = false;
						}
					}

					/*if ((self.columns[index].firstElementChild != undefined) && (self.columns[index].firstElementChild.localName == "exclude")){
						showSubtotals = false;
					} else if ((self.columns[index].firstElementChild != undefined) && (self.columns[index].firstElementChild.localName == "include")) {
						showSubtotals = false;
						for (var n = 0; n < self.columns[index].firstElementChild.childNodes.length; n++) {
								if ((self.columns[index].firstElementChild.childNodes[n].localName != null) && 
								(self.columns[index].firstElementChild.childNodes[n].localName.toLowerCase() === "value")) {
									if (self.columns[index].firstElementChild.childNodes[n].textContent == "TOTAL"){
										showSubtotals = true;
									}
							}
						}
					}*/
				}
				if ((self.columns[index].getAttribute("summarize") != undefined) && (self.columns[index].getAttribute("summarize") === "no")) {
					showSubtotals = false;
					hideSubtotalsOption = true;
				}
				var validPosition = ""
				var metadatavisible = self.columns[index].getAttribute("visible")
				if (metadatavisible != "Never"){
					validPosition = (self.columns[index].getAttribute("canDragToPages") == "true") ? "filters;" : ""; 
					validPosition = validPosition + "rows;columns;hidden";
				}
			}

			var cond = {
				distinctValues: [], blackList: [], whiteList: [], greyList: [], collapsedValues: [],
				sort: sortValue, subtotals: showSubtotals, hideSubtotalOption: hideSubtotalsOption, validPosition: validPosition,
				dataRowPosition: index, isDimension: isDimension, topFilterValue: self.translations.GXPL_QViewerJSAllOption//gx.getMessage("GXPL_QViewerJSAllOption")/*"[all]"*/
			}
		
				cond.topFilterValue = "[all]"
				cond.topFilterString = self.translations.GXPL_QViewerJSAllOption // gx.getMessage("GXPL_QViewerJSAllOption")
			

			self.conditions.push(cond);
			
			if (self.columns[index] != undefined) {
				for (var h = 0; h < self.columns[index].childNodes.length; h++) {
					if ((self.columns[index].childNodes[h] != undefined) &&
						(self.columns[index].childNodes[h].localName != undefined) &&
						(self.columns[index].childNodes[h].localName === "include")) {
						for (var n = 0; n < self.columns[index].childNodes[h].childNodes.length; n++) {
							if ((self.columns[index].childNodes[h].childNodes[n].localName != null) &&
								(self.columns[index].childNodes[h].childNodes[n].localName.toLowerCase() === "value")) {
								if (self.columns[index].childNodes[h].childNodes[n].textContent != "TOTAL") {
									self.conditions[index].topFilterValue = self.columns[index].childNodes[h].childNodes[n].textContent;
								}
							}
						}
					}
				}
			}

		}

		this.restoreSubtotalsAndSortLayout = function (index) {
			//restore save conditions
			try {
				if (rememberLayout) {
					mState = self.getState();
					if ((mState != undefined) && (mState.version != undefined) && (mState.version === self.rememberLayoutStateVersion)) { //check version
						if ((mState.query == self.query) && (self.conditions.length == mState.conditions.length)) {
							self.conditions[index].subtotals = mState.conditions[index].subtotals;
							self.conditions[index].sort = mState.conditions[index].sort;
							self.conditions[index].collapsedValues = mState.conditions[index].collapsedValues;
							

						}
					}
				}
			} catch (Error) { }
		}

		this.applyCustomFilters = function (index) {
			try {
				if (index == self.dataColumnIndex) { /* dummy condition */
					return;
				}
				if (self.columns[index] != undefined) {
					for (var h = 0; h < self.columns[index].childNodes.length; h++) {
						if ((self.columns[index].childNodes[h] != undefined) &&
							(self.columns[index].childNodes[h].localName != undefined) &&
							(self.columns[index].childNodes[h].localName === "include")) {
							
								self.createFilterInfo({ op: "none", values: "", dim: index });
								for (var n = 0; n < self.columns[index].childNodes[h].childNodes.length; n++) {
									if ((self.columns[index].childNodes[h].childNodes[n].localName != null) &&
										(self.columns[index].childNodes[h].childNodes[n].localName.toLowerCase() === "value")) {
										if (self.columns[index].childNodes[h].childNodes[n].textContent != "TOTAL") {
											if (self.UserFilterValues[index] == undefined) self.UserFilterValues[index] = [];
											self.UserFilterValues[index].push(self.columns[index].childNodes[h].childNodes[n].textContent.trimpivot());
										}
									}
								}
							
						}
						//add expand collapse info
						var rowPos = self.rowConditions.indexOf(index);
						var colPos = self.colConditions.indexOf(index);
						if (((colPos < self.colConditions.length - 1) && (colPos != -1)) || ((rowPos < self.rowConditions.length - measures.length) && (rowPos != -1))) {
							if ((self.columns[index].childNodes[h] != undefined) &&
								(self.columns[index].childNodes[h].localName != undefined) &&
								(self.columns[index].childNodes[h].localName === "expand")) {
								


									for (var n = 0; n < self.columns[index].childNodes[h].childNodes.length; n++) {
										if ((self.columns[index].childNodes[h].childNodes[n].localName != null) &&
											(self.columns[index].childNodes[h].childNodes[n].localName.toLowerCase() === "value")) {
											if (self.UserExpandValues[index] == undefined) self.UserExpandValues[index] = [];
											self.UserExpandValues[index].push(self.columns[index].childNodes[h].childNodes[n].textContent.trimpivot());
										}
									}
									if (self.UserExpandValues[index] == undefined) {
										self.UserExpandValues[index] = ["#ALLCOLLAPSE#"];
									}
								
							}
						}
					}
				}
			} catch (error) {

			}
		}


		
		this.initWhenServerPagination = function () {
			self.propPage = OAT.Dom.create("div", {});
			if ((self.QueryViewerCollection[self.IdForQueryViewerCollection].AutoRefreshGroup == "")) {
				jQuery(".oat_winrect_container").remove();
			}
			self.UserFilterValues = []; self.UserExpandValues = [];
			for (var i = 0; i < self.headerRow.length; i++) {
				self.initCondition(i);
				if (self.conditions[i] && self.columns[i]) {
					self.conditions[i].dataField = self.columns[i].getAttribute("dataField")
					self.conditions[i].state = "all"
					self.conditions[i].defaultAction = "Include"
					self.conditions[i].visibles = []
					self.conditions[i].searchInfo = { previousPage: 0, totalPages: 0, filteredText: "", values: [] }
				}
				self.applyCustomFilters(i);
			}

			//save default view values
			var oldConditions = jQuery.extend(true, [], self.conditions);

			var defcolCond = new Array()
			for (var i = 0; i < self.initRowConditions.length; i++) {
				defcolCond[i] = self.initRowConditions[i];
			}
			var defcolRow = new Array();
			for (var i = 0; i < self.initColConditions.length; i++) {
				defcolRow[i] = self.initColConditions[i];
			}
			var defStIndex = new Array();
			for (var i = 0; i < self.initFilterIndexes.length; i++) {
				defStIndex[i] = self.initFilterIndexes[i];
			}

			var oldInitMetadata = jQuery.extend(true, {}, self.initMetadata)

			self.initState = {
				query: self.query,
				conditions: oldConditions,
				colConditions: defcolRow,
				rowConditions: defcolCond,
				filterDivSelects: [],
				filterIndexes: defStIndex,
				stateChanged: false,
				rowsPerPage: pageSize,
				AxisInfo: self.createAxisInfo(""),
				NewAxisInfo: self.createNewAxisInfo(""),
				DataInfo: self.createDataInfo(),
				NewDataInfo: self.createNewDataInfo(),
				CollapseInfo: [],
				FilterInfo: [],
				InitMetadata: oldInitMetadata
			};
			//end save default view values

			for (var i = 0; i < self.headerRow.length; i++) {
				self.restoreSubtotalsAndSortLayout(i)
			}

			//get previuos state
			var mState;
			if (rememberLayout) {
				mState = self.getState();
			} else {
				mState = null;
			}

			var oldFilterDivValues = [];
			var stateLoad = false; self.stateLoad = false;
			if (mState != null) {
				if ((mState.version != undefined) && (mState.version === self.rememberLayoutStateVersion)) {
					if ((mState.query == self.query) && (self.conditions.length == mState.conditions.length)) {
						stateLoad = true;
						self.stateLoad = true;
						self.UserFilterValues = []
						for (var ci = 0; ci <= mState.conditions.length - 1; ci++) {
							if ((mState.conditions[ci] != false) && (self.conditions[ci] != false)) {
								for (var p = 0; p < mState.conditions[ci].distinctValues.length; p++) {
									if ((self.conditions[ci].distinctValues.indexOf(mState.conditions[ci].distinctValues[p]) == -1)) {
										self.conditions[ci].distinctValues.push(mState.conditions[ci].distinctValues[p])
									}
								}
								for (var p = 0; p < mState.conditions[ci].blackList.length; p++) {
									if ((self.conditions[ci].blackList.indexOf(mState.conditions[ci].blackList[p]) == -1)) {
										self.conditions[ci].blackList.push(mState.conditions[ci].blackList[p])
									}
								}
								if (mState.conditions[ci].visibles) {
									for (var p = 0; p < mState.conditions[ci].visibles.length; p++) {
										if ((self.conditions[ci].visibles.indexOf(mState.conditions[ci].visibles[p]) == -1)) {
											self.conditions[ci].visibles.push(mState.conditions[ci].visibles[p])
										}
									}
								}
								for (var p = 0; p < mState.conditions[ci].collapsedValues.length; p++) {
									if ((self.conditions[ci].collapsedValues.indexOf(mState.conditions[ci].collapsedValues[p]) == -1)) {
										self.conditions[ci].collapsedValues.push(mState.conditions[ci].collapsedValues[p])
									}
								}
								try {
									self.conditions[ci].sort = mState.conditions[ci].sort;

									self.oldSortValues[ci] = mState.conditions[ci].sort;
									self.conditions[ci].subtotals = mState.conditions[ci].subtotals;
									self.conditions[ci].defaultAction = mState.conditions[ci].defaultAction;
									self.conditions[ci].state = mState.conditions[ci].state;
									self.conditions[ci].topFilterValue = mState.conditions[ci].topFilterValue

									self.conditions[ci].totalPages = mState.conditions[ci].totalPages
									self.conditions[ci].previousPage = mState.conditions[ci].previousPage
									self.conditions[ci].blocked = mState.conditions[ci].blocked

								} catch (Error) { }
							}
						}

						self.rowConditions = mState.rowConditions;
						self.colConditions = mState.colConditions;
						self.rowsPerPage = mState.rowsPerPage;

						self.filterIndexes = mState.filterIndexes;
						if (mState.filterDivSelects != undefined) {
							for (var fiv = 0; fiv < mState.filterDivSelects.length; fiv++) {
								oldFilterDivValues[fiv] = mState.filterDivSelects[fiv];
							}
						}
						self.stateChanged = true
					}
				}
			}

			try {
				if ((mState != null) && (mState.version === self.rememberLayoutStateVersion) && (mState.filterIndexes.length > 0)) {
					var existElm = false;
					for (var i = 0; i < self.conditions.length; i++) {//save the black list create from older state
						var tmp = []
						if ((self.conditions[i]) && (self.conditions[i].blackList)) {
							for (var j = 0; j < self.conditions[i].blackList.length; j++) {
								tmp.push(self.conditions[i].blackList[j])
								existElm = true;
							}
						}
						self.tempBlackLists.push([tmp])
						var tmp2 = []
						if ((self.conditions[i]) && (self.conditions[i].collapsedValues)) {
							for (var j = 0; j < self.conditions[i].collapsedValues.length; j++) {
								tmp2.push(self.conditions[i].collapsedValues[j])
								existElm = true;
							}
						}
						self.tempCollapsedValues.push([tmp2])
					}
					if (!existElm) {
						self.tempBlackLists = false
					}
				} else {
					self.tempBlackLists = false
				}
			} catch (error) {
				self.tempBlackLists = false
			}


			self.gd.clearSources();
			self.gd.clearTargets();



			if (GlobalPivotInterval[UcId] != undefined) {
				clearInterval(GlobalPivotInterval[UcId]);
			}
			var previousValuePivotWidth = 0
			var antepreviusValuePivotWidth = 0
			GlobalPivotInterval[UcId] = setInterval(function () {
				var actual_rowsPerPage = 0;
				
				//find max width of inner_filter_div
				var pageFilter = jQuery("#" + UcId + "_" + self.query + "_pivot_page").find(".inner_filter_div")
				var MaxWidthFilters = 0;
				for (var pFIndx = 0; pFIndx < pageFilter.length; pFIndx++){
					if (MaxWidthFilters < pageFilter[pFIndx].offsetWidth){
						MaxWidthFilters = pageFilter[pFIndx].offsetWidth
					}
				}
				MaxWidthFilters = (MaxWidthFilters > 0) ? MaxWidthFilters + 8 : MaxWidthFilters; 
				
				if (jQuery("#" + self.controlName + "_" + self.query + "tablePagination_rowsPerPage").length > 0) {
					actual_rowsPerPage = parseInt(jQuery("#" + self.controlName + "_" + self.query + "tablePagination_rowsPerPage")[0].value);
					if (!isNaN(actual_rowsPerPage)) {
						if (jQuery("#" + self.controlName + "_" + self.query)[0].getAttribute("class") === "pivot_table") {
							if ((!autoResize)) {
								var clientWdt = jQuery("#" + self.containerName)[0].clientWidth
								if (clientWdt < MaxWidthFilters) {
									jQuery("#" + self.controlName + "_" + self.query).css({ width: MaxWidthFilters + "px" });
								} else {
									jQuery("#" + self.controlName + "_" + self.query).css({ width: (clientWdt) + "px" });
								}
							}
							var wd = jQuery("#" + self.controlName + "_" + self.query)[0].offsetWidth;
							
							
							if (wd >= MaxWidthFilters){
								
								var actualWidth = jQuery("#" + self.controlName + "_" + self.query + "_tablePagination")[0].clientWidth
								if ((actualWidth > MaxWidthFilters + 1) || (actualWidth < MaxWidthFilters - 1)) {
									jQuery("#" + UcId + "_" + self.query + "_title_div").css({ width: wd + "px" });
									jQuery("#" + UcId + "_" + self.query + "_pivot_page").css({ width: wd + "px" });
	
									jQuery("#" + self.controlName + "_" + self.query + "_tablePagination").css({ width: wd + "px" });

									antepreviusValuePivotWidth = previousValuePivotWidth
									previousValuePivotWidth = wd
								}
								
								
							} else {
								jQuery("#" + UcId + "_" + self.query + "_title_div").css({ width: MaxWidthFilters + "px" });
								jQuery("#" + UcId + "_" + self.query + "_pivot_page").css({ width: MaxWidthFilters + "px" });
	
								jQuery("#" + self.controlName + "_" + self.query + "_tablePagination").css({ width: MaxWidthFilters + "px" });
								
								jQuery("#" + self.controlName + "_" + self.query).css({ width: MaxWidthFilters + "px" });
								
								antepreviusValuePivotWidth = previousValuePivotWidth
								previousValuePivotWidth = MaxWidthFilters

							}
							
						}
						
					}
				} else {
					if (jQuery("#" + self.controlName + "_" + self.query)[0] != undefined) {
						if (jQuery("#" + self.controlName + "_" + self.query)[0].getAttribute("class") === "pivot_table") {
							
							
							
							if (!autoResize) {
								var clientWdt = jQuery("#" + self.containerName)[0].clientWidth
								if (clientWdt < MaxWidthFilters) {
									jQuery("#" + self.controlName + "_" + self.query).css({ width: MaxWidthFilters + "px" });
								} else {
									jQuery("#" + self.controlName + "_" + self.query).css({ width: (clientWdt) + "px" });
								}
							}

							var wd = jQuery("#" + self.controlName + "_" + self.query)[0].offsetWidth
							
							if (wd < MaxWidthFilters){
								
								if ((antepreviusValuePivotWidth == 0) || (antepreviusValuePivotWidth == previousValuePivotWidth) ||
									((previousValuePivotWidth > MaxWidthFilters + 6) || (previousValuePivotWidth < MaxWidthFilters - 6)
										|| (antepreviusValuePivotWidth > previousValuePivotWidth + 6) || (antepreviusValuePivotWidth < previousValuePivotWidth - 6))) {
								
									jQuery("#" + UcId + "_" + self.query + "_title_div").css({ width: MaxWidthFilters + "px" });
									jQuery("#" + UcId + "_" + self.query + "_pivot_page").css({ width: MaxWidthFilters + "px" });
									antepreviusValuePivotWidth = previousValuePivotWidth
									previousValuePivotWidth = MaxWidthFilters
									
									
									jQuery("#" + self.controlName + "_" + self.query).css({ width: MaxWidthFilters + "px" });
								}
								
							} else {
							
								if ((antepreviusValuePivotWidth == 0) || (antepreviusValuePivotWidth == previousValuePivotWidth) ||
									((previousValuePivotWidth > wd + 6) || (previousValuePivotWidth < wd - 6)
										|| (antepreviusValuePivotWidth > previousValuePivotWidth + 6) || (antepreviusValuePivotWidth < previousValuePivotWidth - 6))) {
									
									jQuery("#" + UcId + "_" + self.query + "_title_div").css({ width: wd + "px" });
									jQuery("#" + UcId + "_" + self.query + "_pivot_page").css({ width: wd + "px" });
									antepreviusValuePivotWidth = previousValuePivotWidth
									previousValuePivotWidth = wd
								}
							}
							
						}
					}
				}
			}, 20);



			var ParmAxisInfo;
			if ((mState != null) && (mState.AxisInfo != null)) {
				self.pageData.AxisInfo = mState.AxisInfo;
				ParmAxisInfo =  jQuery.extend(true, {}, mState.NewAxisInfo)
			} else {
				self.pageData.AxisInfo = self.createAxisInfo("");
				ParmAxisInfo = self.createNewAxisInfo(""); 
			}
			var ParmDataInfo;
			if ((mState != null) && (mState.DataInfo != null)) {
				self.pageData.DataInfo = mState.DataInfo;
				ParmDataInfo = jQuery.extend(true, {}, mState.NewDataInfo)
			} else {
				self.pageData.DataInfo = self.createDataInfo();
				ParmDataInfo = self.createNewDataInfo();
			}

			if ((mState != null) && (mState.FilterInfo != null)) {
				self.pageData.FilterInfo = mState.FilterInfo;
			}

			if ((self.UserFilterValues.length == 0) && (self.UserExpandValues.length == 0)) {

				self.pageData.CollapseInfo = self.CreateExpandCollapseInfo("");
				
				self.lastCallToQueryViewer = "initWhenServerPagination"
				
				self.requestPageDataForPivotTable(1, self.rowsPerPage, true, ParmAxisInfo, ParmDataInfo, self.pageData.FilterInfo, self.pageData.CollapseInfo, true);
				
				



			} else {
				//when user customize filters or expand-collapsed
				
				self.initValueRead(self, 0, true);

			}

			//set interval for handler values infinite scroll
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
								if (UcId == self.UcId) {
									self.readScrollValue(columnNumber)
								}
							}
						}
					}
				}
			},
				250)


		} /* initWhenServerPagination */
	

	
		this.initValueRead = function (self, columnNumber, allData, requestDataField) {
			if (columnNumber >= self.columns.length) {

				//add items to page select if exists
				try {
					for (var iP = 0; iP < jQuery("#" + self.UcId + "_" + self.query + "_pivot_page").find("select").length; iP++) {
						var s = jQuery("#" + self.UcId + "_" + self.query + "_pivot_page").find("select")[iP];
						var filterDim = parseInt(s.getAttribute("id").replace("page_select_", ""))
						var index = self.filterIndexes[filterDim]

						if (self.conditions[index].filteredShowValues == undefined) {
							self.conditions[index].filteredShowValues = []
						}
						var actualValues = self.conditions[index].distinctValues;
						for (var j = 0; j < actualValues.length; j++) {
							var v = actualValues[j];
							if (self.conditions[index].filteredShowValues.indexOf(v) == -1) {
								self.conditions[index].filteredShowValues.push(v);
								if (v != "#NuN#") {
									OAT.Dom.option(v, v, s);
								} else {
									OAT.Dom.option(" ", v, s);
								}
							}
						}
						if ((self.conditions[index].topFilterValue != "[all]") /*&& (self.conditions[index].topFilterValue!="")*/) {
							var v = self.conditions[index].topFilterValue
							
							var isInFilteredShowValues = -1;
							for(var fV = 0; fV < self.conditions[index].filteredShowValues.length; fV++){
								if (String(self.conditions[index].filteredShowValues[fV]).trim() == String(v).trim()){
									isInFilteredShowValues = fV;
								}
							}
							
							if (isInFilteredShowValues > -1) {//(self.conditions[index].filteredShowValues.indexOf(v) != -1) { //value already load
								s.selectedIndex = isInFilteredShowValues + 1
							} else {
								self.conditions[index].filteredShowValues.push(v);
								if (v != "#NuN#") {
									OAT.Dom.option(v, v, s);
								} else {
									OAT.Dom.option(" ", v, s);
								}
								s.selectedIndex = 1
							}
						}


					}
				} catch (ERROR) {

				}



				if (allData) {
					self.callServiceWhenCustomeValues();
				}
				return;
			} else {
				var cantItems = 10;
				if ((self.QueryViewerCollection[self.IdForQueryViewerCollection].AutoRefreshGroup != "") || (allData)) {
					cantItems = 0;
				}
				self.lastRequestValue = columnNumber;
				
				self.lastRequestAttributeValues = "initValueRead"
				self.lastRequestAttributeColumnNumber = columnNumber
				self.lastRequestAttributeAllData = allData
				self.lastRequestAttributeRequestDataField = requestDataField
				
				self.requestAttributeValues(self.columns[columnNumber].getAttribute("dataField"), 1, cantItems, "")
				
			}
		}

		

		this.callServiceWhenCustomeValues = function () {
			self.pageData.CollapseInfo = self.CreateExpandCollapseInfo("");
			var ParmAxisInfo = self.createNewAxisInfo()
			var ParmDataInfo = self.createNewDataInfo()
			
			self.lastCallToQueryViewer = "callServiceWhenCustomeValues"
				
			self.requestPageDataForPivotTable(1, self.rowsPerPage, true, ParmAxisInfo, ParmDataInfo, self.pageData.FilterInfo, self.pageData.CollapseInfo, true);
				
	
		}



		/* callback routines */
		this.getOrderReference = function (conditionIndex, anchorRef, functionRef, divRef) { // ** move a row or column to filter bar ---
			return function (target, x, y) {
				/* somehow reorder conditions */

				if ((self.conditions[conditionIndex].validPosition != undefined) && (self.conditions[conditionIndex].validPosition.indexOf("filters") == -1)) {
					return;
				}
				self.lightOff();
				
				var sourceCI = conditionIndex; /* global index */
				var targetCI = target.conditionIndex; /* global index */
				if ((sourceCI != targetCI) && (self.conditions[0].previousPage == undefined)) {
					self.initValueRead(self, 0, self.stateLoad);
				}
				
				/* filters */
				if (target == self.filterDiv) {
					self.stateChanged = true
					
					var insert = false;
					for (var fI = 0; (fI < self.filterIndexes.length) && !insert;  fI++){
						if (self.filterIndexes[fI] > conditionIndex){
							self.filterIndexes.splice(fI, 0, conditionIndex);
							insert = true;
						}
					}
					if (!insert){
						self.filterIndexes.push(conditionIndex);
					}
					
					//self.filterIndexes.push(conditionIndex);
					self.conditions[conditionIndex].blackList = [];
					for (var i = 0; i < self.rowConditions.length; i++) {
						if (self.rowConditions[i] == conditionIndex) { self.rowConditions.splice(i, 1); }
					}
					for (var i = 0; i < self.colConditions.length; i++) {
						if (self.colConditions[i] == conditionIndex) { self.colConditions.splice(i, 1); }
					}

					
					self.onDragundDropEventHandle(conditionIndex, "pages", self.filterIndexes.indexOf(conditionIndex)) //call event

					self.DiseablePivot();
					setTimeout(function () {
						
							self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, self.conditions[conditionIndex].dataField, { op: "all", value: "", dim: conditionIndex }, "", "")
						
						self.EneablePivot();
					}, 200)
					return;
				} 
				
				var startInRows = self.rowConditions.indexOf(conditionIndex) > -1; 

				
				if (sourceCI == targetCI) {
					if (OAT.isWebkit()) {
						if (anchorRef != undefined) {
							anchorRef.displayRef2([x, y])
							functionRef([x, y, divRef])
						}
					}
					return;
				} /* dragged onto the same */
				var sourceType = false; var sourceI = -1; /* local */
				var targetType = false; var targetI = -1; /* local */
				for (var i = 0; i < self.rowConditions.length; i++) {
					if (self.rowConditions[i] == sourceCI) { sourceType = self.rowConditions; sourceI = i; }
					if (self.rowConditions[i] == targetCI) { targetType = self.rowConditions; targetI = i; }
				}
				for (var i = 0; i < self.colConditions.length; i++) {
					if (self.colConditions[i] == sourceCI) { sourceType = self.colConditions; sourceI = i; }
					if (self.colConditions[i] == targetCI) { targetType = self.colConditions; targetI = i; }
				}
				/*if (targetCI == -1) {
					// no cols - lets create one 
					self.colConditions.push(sourceCI);
					self.rowConditions.splice(sourceI, 1);
					
					self.preGoWhenMoveTopFilter(conditionIndex);
					
					self.go(self);
					return;
				}
				if (targetCI == -2) {
					// no rows - lets create one 
					self.rowConditions.push(sourceCI);
					self.colConditions.splice(sourceI, 1);
					
					self.preGoWhenMoveTopFilter(conditionIndex);
					
					self.go(self);
					return;
				}*/
				if (sourceType == targetType) {
					/* same condition type */
					if (sourceI + 1 == targetI) {
						/* dragged on condition immediately after */
						targetType.splice(targetI + 1, 0, sourceCI);
						targetType.splice(sourceI, 1);
					} else {
						targetType.splice(sourceI, 1);
						targetType.splice(targetI, 0, sourceCI);
					}
					self.changesrowposition = true
					self.onDragundDropEventHandle(conditionIndex, (startInRows) ? "rows" : "columns" , (startInRows) ? self.rowConditions.indexOf(conditionIndex) : self.colConditions.indexOf(conditionIndex))
				} else {
					/* different condition type */
					sourceType.splice(sourceI, 1);
					targetType.splice(targetI, 0, sourceCI);
					
					self.onDragundDropEventHandle(conditionIndex, (startInRows) ? "columns" : "rows" , (startInRows) ? self.colConditions.indexOf(conditionIndex) : self.rowConditions.indexOf(conditionIndex))
					
				}
				

					self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, self.conditions[conditionIndex].dataField, "", "", "")
				
			}
		}


		this.getOrderReferenceProg = function (conditionIndex) { // ** move a row or column to filter bar programatically---


			if ((self.conditions[conditionIndex].validPosition != undefined) && (self.conditions[conditionIndex].validPosition.indexOf("filters") == -1)) {
				return;
			}

			self.stateChanged = true
			if (self.filterIndexes.indexOf(conditionIndex) < 0) {
				self.filterIndexes.push(conditionIndex);
			}
			self.conditions[conditionIndex].blackList = [];
			for (var i = 0; i < self.rowConditions.length; i++) {
				if (self.rowConditions[i] == conditionIndex) { self.rowConditions.splice(i, 1); }
			}
			for (var i = 0; i < self.colConditions.length; i++) {
				if (self.colConditions[i] == conditionIndex) { self.colConditions.splice(i, 1); }
			}

			
			self.onDragundDropEventHandle(conditionIndex, "pages", self.filterIndexes.indexOf(conditionIndex)) //call event

			self.DiseablePivot();
			setTimeout(function () {
				
					self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, self.conditions[conditionIndex].dataField, { op: "all", value: "", dim: conditionIndex }, "", "")
				
				self.EneablePivot();
			}, 200)
			return;



		}

		this.getClickReference = function (cond, dimensionNumber, contentDiv) {
			var anchorRef = OAT.Anchor.assign(contentDiv, {
				title: " ",
				content: self.propPage,
				result_control: false,
				activation: "click",
				type: OAT.WinData.TYPE_RECT,
				width: "auto",
				containerQuery: self.IdForQueryViewerCollection + "-pivottable" /*+qv.util.GetContainerControlClass(self.QueryViewerCollection[self.IdForQueryViewerCollection]) */+ " FilterPopup "
			});

			jQuery(contentDiv).data('anchorRef', anchorRef);

			/*var refresh = function () {
				self.propPage._Instant_hide();
				self.go(false);
			}*/
			return [function (event) {
				
					if (self.conditions[dimensionNumber].previousPage == undefined) {
						self.initValueRead(self, dimensionNumber, self.stateLoad, self.conditions[dimensionNumber].dataField);
						jQuery(".oat_winrect_container").css({ left:  "-10000000px", top: "-10000000px" })
						var clickEvent = jQuery.extend(true, {}, event);
						var wait = function(){
							if (self.conditions[dimensionNumber].previousPage == undefined) {
								setTimeout( wait , 100)
							} else {
								self.ShowPopUp(cond, dimensionNumber, clickEvent);
							}
						}
						wait();
					} else {
						self.ShowPopUp(cond, dimensionNumber, event);
					}
				

			}, anchorRef]
		}

		this.ShowPopUp = function (cond, dimensionNumber, event) {

			var refresh = function () {
				jQuery(".oat_winrect_container").css({ display: "none" });
			}
			var eventDiv;
			var coords;
			if (event.currentTarget != undefined) {
				eventDiv = event.currentTarget;
				coords = OAT.Dom.eventPos(event);
			} else {
				eventDiv = event[2]
				coords = [event[0], event[1]]
			}
			var toAppend = [];

			self.propPage.style.left = coords[0] + "px";
			self.propPage.style.top = coords[1] + "px";


			if (self.isSD) { //android
				jQuery(".oat_winrect_container").css({ left: "-1500px", top: jQuery(eventDiv).offset().top + "px" })
				jQuery(".oat_winrect_container").addClass("oat_winrect_container_small")
			} else {
				jQuery(".oat_winrect_container").css({ left: jQuery(eventDiv).offset().left + "px", top: jQuery(eventDiv).offset().top + "px" })
			}

			self.propPage.setAttribute('id', 'pop-up');
			self.propPage.setAttribute('class', 'oat_pop-up');
			OAT.Dom.clear(self.propPage);
			toAppend.push(self.propPage);
			/* contents */


			jQuery(".oat_winrect_title").find(".winrect_title_label").remove()

			var spantitle = OAT.Dom.create("label");
			if (self.isSD) {
				spantitle.setAttribute("class", "winrect_title_label winrect_title_label_small");
			} else {
				spantitle.setAttribute("class", "winrect_title_label");
			}
			OAT.addTextNode(spantitle, self.columns[dimensionNumber].getAttribute("displayName"));
			jQuery(".oat_winrect_title").append(spantitle)


			if (!disableColumnSort) {
				var div_order = document.createElement("div");
				div_order.setAttribute("class", "first_popup_subdiv");

				var asc = OAT.Dom.radio("order");
				var ascForId = "pivot_order_asc" + "_" + self.containerName + "_" + self.columns[dimensionNumber].getAttribute("dataField");
				asc.id = ascForId;
				asc.className = "input_radio_popup"
				OAT.Dom.attach(asc, "change", function () {
					try {
						var datastr = "<DATA event=\"OrderChanged\" name=\"" + self.columns[dimensionNumber].getAttribute("name") + "\" displayName=\"" + self.columns[dimensionNumber].getAttribute("displayName") + "\"  order=\"ascending\">"
						datastr = datastr + "</DATA>"
						//if (qv.util.isGeneXusPreview())
						//	window.external.SendText(self.QueryViewerCollection[self.IdForQueryViewerCollection].ControlName, datastr);
					} catch (error) { }

					
						cond.sort = 1; self.stateChanged = true;
						self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, cond.dataField, "", "", "")
						var idI = "i_" + this.getAttribute("id");
						var inputAsc = document.getElementById(idI);
						inputAsc.textContent = "radio_button_checked";
						var inputDsc = document.getElementById(idI.replace("asc", "desc"));
						inputDsc.textContent = "radio_button_unchecked";
					
						

					
				});
				div_order.appendChild(asc);

				var IStyle = OAT.isIE() ? "top:-10px;" : ""; 

				var alabel = OAT.Dom.create("label");
				alabel.className = "first_div_label";
				alabel.htmlFor = ascForId;
				div_order.appendChild(alabel);
				div_order.appendChild(OAT.Dom.create("br"));
				OAT.addImageNode(alabel, (cond.sort == 1)?"radio_button_checked":"radio_button_unchecked", IStyle, "i_"+ascForId);
				OAT.addTextNode(alabel,self.translations.GXPL_QViewerJSAscending /*gx.getMessage("GXPL_QViewerJSAscending")*/)
				
				var desc = OAT.Dom.radio("order");
				var dscForId = "pivot_order_desc" + "_" + self.containerName + "_" + self.columns[dimensionNumber].getAttribute("dataField");
				desc.id = dscForId;
				desc.className = "input_radio_popup"
				OAT.Dom.attach(desc, "change", function () {
					try {
						var datastr = "<DATA event=\"OrderChanged\" name=\"" + self.columns[dimensionNumber].getAttribute("name") + "\" displayName=\"" + self.columns[dimensionNumber].getAttribute("displayName") + "\"  order=\"descending\">"
						datastr = datastr + "</DATA>"
						//if (qv.util.isGeneXusPreview())
						//	window.external.SendText(self.QueryViewerCollection[self.IdForQueryViewerCollection].ControlName, datastr);
					} catch (error) { }


					
						cond.sort = -1; self.stateChanged = true;
						self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, cond.dataField, "", "", "")
						var idI = "i_" + this.getAttribute("id");
						var inputDsc = document.getElementById(idI);
						inputDsc.textContent = "radio_button_checked";
						var inputAsc = document.getElementById(idI.replace("desc", "asc"));
						inputAsc.textContent = "radio_button_unchecked";
						
					
				});
				div_order.appendChild(desc);

				var dlabel = OAT.Dom.create("label");
				dlabel.className = "first_div_label";
				dlabel.htmlFor = dscForId;
				div_order.appendChild(dlabel);
				OAT.addImageNode(dlabel, (cond.sort == 1)?"radio_button_unchecked":"radio_button_checked", IStyle, "i_"+dscForId);
				OAT.addTextNode(dlabel, self.translations.GXPL_QViewerJSDescending /*gx.getMessage("GXPL_QViewerJSDescending")*/)
				

				toAppend.push(div_order);

				var hr1 = OAT.Dom.create("hr", {});
				toAppend.push(hr1);
			}

			var hr2 = OAT.Dom.create("hr", {});
			var hr4 = OAT.Dom.create("hr", {});

			if (((cond.hideSubtotalOption === undefined) || (!cond.hideSubtotalOption))
				&& ((!self.autoPaging) || (self.colConditions.length == 0))
			) {
				var subtotals = OAT.Dom.create("div");
				if (disableColumnSort) {
					subtotals.setAttribute("class", "first_popup_subdiv");
				}
				var subtotal_sel_div = document.createElement("div");
				var class_check_div = (cond.subtotals) ? "check_item_img" : "uncheck_item_img";
				if (self.isSD) { //android
					var class_check_div = (cond.subtotals) ? "check_item_img_small" : "uncheck_item_img_small";
				}
				subtotal_sel_div.setAttribute("class", class_check_div);
				OAT.Dom.attach(subtotal_sel_div, "click", function () {
					var checkedClass = "check_item_img"
					var unCheckedClass = "uncheck_item_img"
					if (self.isSD) { //android
						checkedClass = "check_item_img_small"
						unCheckedClass = "uncheck_item_img_small"
					}

					cond.subtotals = !(this.getAttribute("class") === checkedClass);
					var newClass = (this.getAttribute("class") === checkedClass) ? unCheckedClass : checkedClass;
					this.setAttribute("class", newClass);
					jQuery(this).find("i")[0].textContent = cond.subtotals ? "check_box" : "check_box_outline_blank";
					self.stateChanged = true;
					
					try {
						var datastr = "<DATA event=\"SubtotalsChanged\" name=\"" + self.columns[dimensionNumber].getAttribute("name") + "\" displayName=\"" + self.columns[dimensionNumber].getAttribute("displayName") + "\"  subtotals=\"" + cond.subtotals + "\">"
						datastr = datastr + "</DATA>"
						//if (qv.util.isGeneXusPreview())
						//	window.external.SendText(self.QueryViewerCollection[self.IdForQueryViewerCollection].ControlName, datastr);
					} catch (error) { }

					
					self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, cond.dataField, "", "", "")
					
				});

				var sl = OAT.Dom.create("label");
				
				OAT.addImageNode(sl, cond.subtotals ? "check_box" : "check_box_outline_blank", "");
				
				OAT.addTextNode(sl, self.translations.GXPL_QViewerJSSubtotals/*gx.getMessage("GXPL_QViewerJSSubtotals")*/)
				sl.htmlFor = "pivot_checkbox_subtotals";
				subtotal_sel_div.appendChild(sl);
				OAT.Dom.append([subtotals, subtotal_sel_div]);
				toAppend.push(subtotals);
				toAppend.push(hr2);
			}

			if ((self.stateChanged) || (self.pivotStateChanged())) {
				var restoreview = OAT.Dom.create("div");
				var restoreview_sel_div = document.createElement("div");

				OAT.Dom.attach(restoreview_sel_div, "click", function () {
						self.cleanStateWhenServerPagination();
						self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, cond.dataField, "", "", "")
						refresh(); self.stateChanged = false;
					
				});


				var rl = OAT.Dom.create("label");
				OAT.addTextNode(rl, self.translations.GXPL_QViewerJSRestoreDefaultView /*gx.getMessage("GXPL_QViewerJSRestoreDefaultView")*/)
				rl.setAttribute("id", "restore_default_view");
				rl.htmlFor = "pivot_checkbox_restoreview";
				rl.setAttribute("class", "pivot_checkbox_restoreview");
				restoreview_sel_div.appendChild(rl);
				OAT.Dom.append([restoreview, restoreview_sel_div]);
				toAppend.push(restoreview);
			}

			var appendActionsSeparator = false;

			/* for pivoting purpuses*/
			if (measures.length > 0) {
				var pivotpurp = OAT.Dom.create("div");
				var pivotpurp_sel_div = document.createElement("div");

				OAT.Dom.attach(pivotpurp_sel_div, "click", function () {
					
						self.stateChanged = true;
						self.changedFromColumnToRow(dimensionNumber);
						self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, cond.dataField, "", "", "")
						refresh();
					
				});

				var pvpl = OAT.Dom.create("label");
				if (self.rowConditions.indexOf(dimensionNumber) != -1)
					OAT.addTextNode(pvpl, self.translations.GXPL_QViewerJSPivotDimensionToColumn /*gx.getMessage("GXPL_QViewerJSPivotDimensionToColumn")*/)
				else
					OAT.addTextNode(pvpl, self.translations.GXPL_QViewerJSPivotDimensionToRow /*gx.getMessage("GXPL_QViewerJSPivotDimensionToRow")*/)

				pvpl.htmlFor = "pivot_checkbox_restoreview";
				pvpl.setAttribute("class", "pivot_checkbox_restoreview");
				pvpl.setAttribute("id", "move_to_column");

				pivotpurp_sel_div.appendChild(pvpl);
				OAT.Dom.append([pivotpurp, pivotpurp_sel_div]);
				toAppend.push(pivotpurp);
				appendActionsSeparator = true;
			}
			/* end pivoting option*/

			/*for Ipad & Iphone move to top filter*/
			if (measures.length > 0) {
				
				if (OAT.isSD()) {
					if (self.filterIndexes.indexOf(dimensionNumber) === -1) {
						var Ipadpurp = OAT.Dom.create("div");
						var Ipadpurp_sel_div = document.createElement("div");


						OAT.Dom.attach(Ipadpurp_sel_div, "click", function () {
							
								self.getOrderReferenceProg(dimensionNumber);
								refresh();
							
						});

						var ippl = OAT.Dom.create("label");
						OAT.addTextNode(ippl, self.translations.GXPL_QViewerJSMoveToFilterBar /*gx.getMessage("GXPL_QViewerJSMoveToFilterBar")*/)
						ippl.htmlFor = "pivot_checkbox_movetocolumn";
						Ipadpurp_sel_div.appendChild(ippl);

						OAT.Dom.append([Ipadpurp, Ipadpurp_sel_div]);
						toAppend.push(Ipadpurp);
						appendActionsSeparator = true;
					}
				}
			}
			/*end move to top filter*/

			if (appendActionsSeparator)
				toAppend.push(hr4);

			var distinct = OAT.Dom.create("div");
			distinct.setAttribute("class", "last_div_popup");
			var br1, br2, br3;
			if (!OAT.isIE()) {
				br1 = OAT.Dom.create("br"); var br2 = OAT.Dom.create("br"); var br3 = OAT.Dom.create("br");
			} else {
				br1 = OAT.Dom.create("span"); var br2 = OAT.Dom.create("span"); var br3 = OAT.Dom.create("span");
			}
			toAppend.push(distinct);

			OAT.Dom.append(toAppend);

			self.distinctDivs(cond, distinct, dimensionNumber);

			if (!disableColumnSort) {
				/* this needs to be here because of IE :/ */
				asc.checked = (cond.sort == 1) || (cond.sort == 0);
				asc.__checked = asc.checked;
				desc.checked = (cond.sort == -1) || (cond.sort == 2);
				desc.__checked = desc.checked;
			}


			//for smart device center pop-up
			if (self.isSD) {//android
				setTimeout(function () {

					var screenWidth = window.innerWidth;
					var initialPopUpWidth = jQuery(".oat_winrect_container")[0].clientWidth


					if (initialPopUpWidth == 0) {
						var last = jQuery(".oat_winrect_container").length;
						initialPopUpWidth = jQuery(".oat_winrect_container")[last - 1].clientWidth
					}


					if (initialPopUpWidth < 245) {
						initialPopUpWidth = 245
					}

					var padding = (screenWidth - initialPopUpWidth) / 2 + jQuery(window).scrollLeft()

					jQuery(".oat_winrect_container").css({ left: padding + "px", width: initialPopUpWidth + "px" })


				}, 50)
			}
		}
		
		this.updateRowConditions = function(dimensionNumber, measures, fromFilters){
			var addCol = false
			var unhiddenDim = self.initRowConditions.length + self.initColConditions.length <= self.rowConditions.length + self.colConditions.length
			if (unhiddenDim) addCol = true;
			
			var tempRowConditions = [];
			for (var nI = 0; nI < self.initRowConditions.length - (measures.length - 1); nI++) {
				if (self.initRowConditions[nI] == dimensionNumber) {
					tempRowConditions.push(dimensionNumber)
				}
				if (self.rowConditions.indexOf(self.initRowConditions[nI]) > -1) {
					tempRowConditions.push(self.initRowConditions[nI])
				}
			}
			for (var nI = 0; nI < self.initColConditions.length; nI++) {
				if (self.initColConditions[nI] == dimensionNumber) {
					tempRowConditions.push(dimensionNumber)
				}
				if (self.rowConditions.indexOf(self.initColConditions[nI]) > -1) {
					tempRowConditions.push(self.initColConditions[nI])
				}
			}
			for (var nI = 0; nI < self.initFilterIndexes.length; nI++) {
				if ((self.initFilterIndexes[nI] == dimensionNumber) && (tempRowConditions.indexOf(dimensionNumber) == -1)){ 
					tempRowConditions.push(dimensionNumber)
				}
				if (self.rowConditions.indexOf(self.initFilterIndexes[nI]) > -1) {
					if (tempRowConditions.indexOf(self.initFilterIndexes[nI]) == -1)
						tempRowConditions.push(self.initFilterIndexes[nI])
				}
			}
			if (tempRowConditions.indexOf(dimensionNumber) < 0) {
					tempRowConditions.push(dimensionNumber)
			}
			if (addCol) {
				for (var nO = 0; nO < self.rowConditions.length; nO++){
					if (tempRowConditions.indexOf(self.rowConditions[nO]) < 0)
					{
						tempRowConditions.push(self.rowConditions[nO])
					}
				}
			}
			tempRowConditions.sort((function () {
				return function (a, b) {
					return (a == b ? 0 : (a < b ? -1 : 1));
				};
			})(0));
			for (var nI = self.initRowConditions.length - (measures.length - 1); nI < Math.min(self.initRowConditions.length , self.dataColumnIndex); nI++) {
				if (tempRowConditions.indexOf(self.initRowConditions[nI]) < 0)
					tempRowConditions.push(self.initRowConditions[nI])
			}

			self.rowConditions = [];
			for (var nI = 0; nI < tempRowConditions.length; nI++) {
				self.rowConditions[nI] = tempRowConditions[nI];
			}
		}
		
		this.changedFromColumnToRow = function (dimensionNumber) {

			var index = self.rowConditions.indexOf(dimensionNumber);
			var axis = "columns";
			var position = 0;
			if (index != -1) { //when move to row
				self.rowConditions.splice(index, 1);
				if (measures.length > 1)
					self.colConditions = [dimensionNumber].concat(self.colConditions);
				else
					self.colConditions.push(dimensionNumber);
				position = self.colConditions.indexOf(dimensionNumber);
			} else {
				
					axis = "rows";
					index = self.colConditions.indexOf(dimensionNumber);
					self.colConditions.splice(index, 1);
					
					self.updateRowConditions(dimensionNumber, measures, false);
					position = self.rowConditions.indexOf(dimensionNumber);
				
			}

			self.onDragundDropEventHandle(dimensionNumber, axis, position);
		}

		

		this.getDelFilterReference = function (index) {
			return function () {
				var idx = self.filterIndexes.indexOf(index);
				if (idx != -1) {
					self.filterIndexes.splice(idx, 1);
				}
				
				self.updateRowConditions(index, measures, true);
				
				for (var ifs = 0; ifs < self.filterDiv.selects.length; ifs++) {
					if (index == self.filterDiv.selects[ifs].filterIndex) {
						self.filterDiv.selects.splice(ifs, 1);
						break;
					}
				}

				self.stateChanged = true
				
				self.onDragundDropEventHandle(index, "rows", self.rowConditions.indexOf(index))

				self.DiseablePivot();
				setTimeout(function () {
					
						self.conditions[index].topFilterValue = "[all]"
						self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, self.conditions[index].dataField, { op: "all", values: "", dim: index }, "", "")
					
					self.EneablePivot();
				}, 200)
			}
		}

		this.valueIsShowed = function (value, dimensionNumber) {
			
				if (self.conditions[dimensionNumber].state == "all") {
					return true;
				} else if (self.conditions[dimensionNumber].state == "none") {
					return false;
				} else if (self.conditions[dimensionNumber].blackList.indexOf(value) != -1) {
					return false;
				} else if (self.conditions[dimensionNumber].distinctValues.indexOf(value) != -1) {
					return true;
				} else if (self.conditions[dimensionNumber].defaultAction == "Exclude") {
					return false;
				} else {
					return true;
				}
			
		}

		this.distinctDivs = function (cond, div, dimensionNumber, allFilters) { /* set of distinct values checkboxes */
			var getPair = function (text, id) {
				var div = OAT.Dom.create("div");

				var checkedClass = "check_item_img"
				var unCheckedClass = "uncheck_item_img"
				if (self.isSD) {//android
					checkedClass = "check_item_img_small"
					unCheckedClass = "uncheck_item_img_small"
				}
				
				OAT.addImageNode(div, self.valueIsShowed(value, dimensionNumber) ? "check_box" : "check_box_outline_blank", "");

				var class_check_div = (cond.blackList.indexOf(value) == -1) && self.valueIsShowed(value, dimensionNumber) ? checkedClass : unCheckedClass;
				
					var class_check_div = self.valueIsShowed(value, dimensionNumber) ? checkedClass : unCheckedClass;
				
				div.setAttribute("class", class_check_div);
				var ch = OAT.Dom.create("input");
				ch.type = "checkbox";
				ch.id = id;
				var t = OAT.Dom.create("label");
				OAT.addTextNode(t, text)
				t.htmlFor = id;
				div.appendChild(t);
				return [div, ch];
			}


			var getRefBool = function (checked, value) {


				setTimeout(function () {

						var oper = "pop";
						if (!checked) {
							oper = "push";
						}

						self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, self.conditions[dimensionNumber].dataField, { op: oper, values: value, dim: dimensionNumber }, "", "")

						self.stateChanged = true;
						self.onFilteredChangedEventHandleWhenServerPagination(dimensionNumber);
						self.EneablePivot();
						
					
				}, 200);

			}

			var allRef = function () {
				self.DiseablePivot();

				setTimeout(function () {


					
						var oper = "all";
						

						self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, self.conditions[dimensionNumber].dataField, { op: oper, values: "", dim: dimensionNumber }, "", "")

						self.stateChanged = true;
						self.onFilteredChangedEventHandleWhenServerPagination(dimensionNumber);
						self.distinctDivs(cond, div, dimensionNumber);
						self.EneablePivot();
						return;
					

					
				}, 200)
			}

			var noneRef = function () {
				self.DiseablePivot()

				setTimeout(function () {
					
						var oper = "none";
						

						self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, self.conditions[dimensionNumber].dataField, { op: oper, values: "", dim: dimensionNumber }, "", "")

						self.stateChanged = true;
						self.onFilteredChangedEventHandleWhenServerPagination(dimensionNumber);
						self.distinctDivs(cond, div, dimensionNumber);
						self.EneablePivot();
						return;
					
					
				}, 200)
			}

			var reverseRef = function () {
				self.DiseablePivot();

				setTimeout(function () {
					
						var oper = "reverse";
						self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, self.conditions[dimensionNumber].dataField, { op: oper, values: "", dim: dimensionNumber }, "", "")

						self.stateChanged = true;
						self.onFilteredChangedEventHandleWhenServerPagination(dimensionNumber);
						self.distinctDivs(cond, div, dimensionNumber);
						self.EneablePivot();
						return;
					

					
				}, 200)
			}

			var searchFilterClick = function () {
				self.getValuesForColumn(self.UcId, dimensionNumber, this.value)
			}

			OAT.Dom.clear(div);
			var d = OAT.Dom.create("div");
			d.setAttribute("class", "div_buttons_popup");
			var all = document.createElement("button");
			all.textContent = self.translations.GXPL_QViewerJSAll; /*gx.getMessage("GXPL_QViewerJSAll");*/
			all.setAttribute("class", "btn");
			jQuery(all).click(allRef);

			var none = document.createElement("button");
			none.textContent = self.translations.GXPL_QViewerJSNone //gx.getMessage("GXPL_QViewerJSNone");
			none.setAttribute("class", "btn");
			jQuery(none).click(noneRef);

			var reverse = document.createElement("button");
			reverse.textContent = self.translations.GXPL_QViewerJSReverse //gx.getMessage("GXPL_QViewerJSReverse");
			reverse.setAttribute("class", "btn");
			jQuery(reverse).click(reverseRef);


			OAT.Dom.append([d, all, none, reverse], [div, d]);

			
				var div_search = OAT.Dom.create("div");
				div_search.setAttribute("class", "div_filter_input");

				
					var searchInput = document.createElement("input");
					OAT.addImageNode(div_search, "search", "");
					searchInput.textContent = "none";
					searchInput.setAttribute("class", "search_input");
					searchInput.setAttribute("type", "text");
					searchInput.setAttribute("label", self.translations.GXPL_QViewerSearch/*gx.getMessage("GXPL_QViewerSearch")*/);
					searchInput.setAttribute("title", self.translations.GXPL_QViewerSearch/*gx.getMessage("GXPL_QViewerSearch")*/);
					searchInput.setAttribute("placeholder", self.translations.GXPL_QViewerSearch /*gx.getMessage("GXPL_QViewerSearch")*/);
					searchInput.setAttribute("id", self.UcId + dimensionNumber);
					jQuery(searchInput).keyup(searchFilterClick);

					OAT.Dom.append([div_search, searchInput], [div, div_search]);
				
			

			

				var fixHeigthDiv = OAT.Dom.create("div");
				
					cond = self.conditions[dimensionNumber]
				
				if (cond.distinctValues.length <= 9) {
					fixHeigthDiv.setAttribute("class", "pivot_popup_auto");
				} else {
					fixHeigthDiv.setAttribute("class", "pivot_popup_fix");
				}


				for (var i = 0; i < cond.distinctValues.length; i++) {

					var value = cond.distinctValues[i];
					if (!
						 (
						 	 (self.conditions[dimensionNumber].hasNull) && 
						 	 (value.trimpivot() == self.defaultPicture.getAttribute("textForNullValues"))
						 )
						) {

						var pict_value = self.dimensionPictureValue(value, dimensionNumber);
						pict_value = pict_value.replace(/\&amp;/g, "&").replace(/\u00A0/g, " ")
						if (pict_value.length > 33) {
							var resto = (pict_value.substring(32, pict_value.length).trimpivot().length > 0) ? '...' : '';
							pict_value = pict_value.substring(0, 32) + resto
						}
						pict_value = pict_value.replace(/ /g, "\u00A0") + '\u00A0\u00A0\u00A0\u00A0\u00A0'
						var pair = getPair(pict_value, "pivot_distinct_" + i);
						pair[0].setAttribute('value', value);
						fixHeigthDiv.appendChild(pair[0]);



						OAT.Dom.attach(pair[0], "click", function () {
							self.DiseablePivot();

							var checkedClass = "check_item_img"
							var unCheckedClass = "uncheck_item_img"
							if (self.isSD) {//android
								checkedClass = "check_item_img_small"
								unCheckedClass = "uncheck_item_img_small"
							}

							var checked = !(this.getAttribute("class") === checkedClass);
							var newClass = (this.getAttribute("class") === checkedClass) ? unCheckedClass : checkedClass;
							this.setAttribute("class", newClass);
							
							jQuery(this).find("i")[0].textContent = checked ? "check_box" : "check_box_outline_blank";
							
							getRefBool(checked, this.getAttribute("value"));//this.textContent);            														
						});

					}
				}
				fixHeigthDiv.setAttribute("ucid", self.UcId);
				fixHeigthDiv.setAttribute("columnnumber", dimensionNumber);
				fixHeigthDiv.setAttribute("id", "values_" + self.UcId + "_" + dimensionNumber)
				div.appendChild(fixHeigthDiv);
			
		}


		this.DiseablePivot = function () {
			try {
				var divDis = jQuery('<div class="disable_popup" ></div>');

				if (jQuery("#" + self.containerName).length > 0) {
					var ht = Math.min(jQuery("#" + UcId + "_" + self.query + "_pivot_page")[0].clientHeight
						+ jQuery("#" + UcId + "_" + self.query + "_pivot_content")[0].clientHeight,
						jQuery("#" + self.containerName)[0].clientHeight
					)
					var wd = Math.min(jQuery("#" + UcId + "_" + self.query)[0].clientWidth,
						jQuery("#" + self.containerName)[0].clientWidth
					)
					if (jQuery("#" + self.containerName).closest(".gxwebcomponent").length > 0) { //for gxQuery
						if (jQuery("#" + UcId + "_" + self.query + "_tablePagination").length > 0) {
							ht = ht + jQuery("#" + UcId + "_" + self.query + "_tablePagination")[0].clientHeight
						}
						jQuery(divDis).css({
							'width': wd,
							'height': ht,
							'position': 'absolute',
							'top': jQuery("#" + self.containerName)[0].offsetTop,//jQuery("#" + self.containerName)[0].offsetTop,
							'left': jQuery("#" + self.containerName)[0].offsetLeft,
							'background-color': 'rgba(0,0,0,0.1)',
							'cursor': 'wait',
							'z-index': 99
						});
					} else {
						jQuery(divDis).css({
							'width': wd,
							'height': ht,
							'position': 'absolute',
							'top': jQuery("#" + self.containerName)[0].offsetTop,//jQuery("#" + self.containerName).offset().top,//0 	
							'left': jQuery("#" + UcId + "_" + self.query).offset().left,
							'background-color': 'rgba(0,0,0,0.1)',
							'cursor': 'wait',
							'z-index': 999
						});
					}

					jQuery("#" + self.containerName).append(divDis)

				} else {
					var ht = Math.min(jQuery("#" + UcId + "_" + self.query).closest(".gx_usercontrol").find(".pivot_filter_div")[0].clientHeight
						+ jQuery("#" + UcId + "_" + self.query).closest(".conteiner_table_div")[0].clientHeight,
						jQuery("#" + UcId + "_" + self.query).closest(".gx_usercontrol")[0].clientHeight
					)

					var wd = Math.min(jQuery("#" + UcId + "_" + self.query)[0].clientWidth,
						jQuery("#" + UcId + "_" + self.query).closest(".gx_usercontrol")[0].clientWidth
					)

					if (jQuery("#" + UcId + "_" + self.query).closest(".gx_usercontrol").find(".pivot_pag_div").length > 0) {
						ht = ht + jQuery("#" + UcId + "_" + self.query).closest(".gx_usercontrol").find(".pivot_pag_div")[0].clientHeight
					}

					jQuery(divDis).css({
						'width': wd,
						'height': ht,
						'position': 'absolute',
						'top': jQuery("#" + UcId + "_" + self.query).closest(".gx_usercontrol")[0].offsetTop,
						'left': jQuery("#" + UcId + "_" + self.query).closest(".gx_usercontrol")[0].offsetLeft,
						'background-color': 'rgba(0,0,0,0.1)',
						'cursor': 'wait',
						'z-index': 99
					});

					jQuery("#" + UcId + "_" + self.query).closest(".gx_usercontrol").append(divDis)
				}
				jQuery(".oat_winrect_container").block({ message: null })
			} catch (ERROR) { }
		}

		this.EneablePivot = function () {
			jQuery(".disable_popup").remove()
			while (jQuery(".disable_popup").length > 0) {
				jQuery(".disable_popup").remove()
			}
			jQuery(".oat_winrect_container").unblock()
		}

		this.addExpandCollapseFunctionality = function (th, item, rowConditionNumber, expanded, rowDimension) {
			if (true) {
				var divImg = OAT.Dom.create("div", {});

				if (expanded) {
					divImg.className += " expanded";
					OAT.addImageNode(divImg, "remove", "");
				} else {
					divImg.className += " collapsed";
					OAT.addImageNode(divImg, "add", "");
				}
				th.insertBefore(divImg, th.firstChild);
				th.style.paddingLeft = "0px";

				var spanTxt = jQuery(th).find("#span_txt_pivot")[0]


				if (rowDimension) {
					self.setExpandCollapseEventHandlers(divImg, item.value, "DIMENSION", self.rowConditions[rowConditionNumber], item);
					if ((self.QueryViewerCollection[self.IdForQueryViewerCollection].ItemDoubleClick == undefined) &&
						(self.QueryViewerCollection[self.IdForQueryViewerCollection].ItemClick == undefined) &&
						(!self.selection.Allow)) {
						self.setExpandCollapseEventHandlers(spanTxt, item.value, "DIMENSION", self.rowConditions[rowConditionNumber], item);
						jQuery(spanTxt).css({ cursor: "pointer" });
					}
				} else {
					self.setExpandCollapseEventHandlers(divImg, item.value, "DIMENSION", self.colConditions[rowConditionNumber], item);
					if ((self.QueryViewerCollection[self.IdForQueryViewerCollection].ItemDoubleClick == undefined) &&
						(self.QueryViewerCollection[self.IdForQueryViewerCollection].ItemClick == undefined) &&
						(!self.selection.Allow)) {
						self.setExpandCollapseEventHandlers(spanTxt, item.value, "DIMENSION", self.colConditions[rowConditionNumber], item);
						jQuery(spanTxt).css({ cursor: "pointer" });
					}
				}

			}
			return th;
		}

		this.setClickEventHandlers = function (td, itemValue, MeasureOrDimension, dimensionNumber, itemData) {
			if ((!self.ShowMeasuresAsRows) || (self.h < 500)) {
				var span = jQuery(td).find("#span_txt_pivot")[0];
				if (span) {
					jQuery(span).data('itemValue', itemValue);
					jQuery(span).data('typeMorD', MeasureOrDimension);
					jQuery(span).data('numberMorD', dimensionNumber);
					jQuery(span).data('itemInfo', itemData);
					
					
					jQuery(td).data('itemValue', itemValue);
					jQuery(td).data('typeMorD', MeasureOrDimension);
					jQuery(td).data('numberMorD', dimensionNumber);
					jQuery(td).data('itemInfo', itemData);
					
				
					var qViewer = self.QueryViewerCollection[IdForQueryViewerCollection];
					var raiseItemClick = MeasureOrDimension == "DIMENSION" ? qViewer.Metadata.Axes[dimensionNumber].RaiseItemClick : qViewer.Metadata.Data[dimensionNumber].RaiseItemClick;
					
					if (qViewer.ItemClick && raiseItemClick) {
						span.onclick = function () { 
							self.onClickEventHandle(this); 
							if (self.selection.Allow){ 
								self.onClickSelectNode(this);
							}
						}
						span.classList.add("gx-qv-clickable-element")
					} else if (self.selection.Allow){ 
						span.onclick = function () { 
							self.onClickSelectNode(this); 
						} 
					}	
				}
			}
		}

		this.setExpandCollapseEventHandlers = function (td, itemValue, MeasureOrDimension, dimensionNumber, itemData) {
			if ((!self.ShowMeasuresAsRows) || (self.h < 500)) {
				jQuery(td).data('itemValue', itemValue);
				//jQuery(td).data('typeMorD', MeasureOrDimension);
				jQuery(td).data('numberMorD', dimensionNumber);
				jQuery(td).data('itemInfoEC', itemData);
				td.onclick = function () { 
					self.onClickExpandCollapse(this); 
				}
			}
		}

		this.getPerFilterValue = function (prevFilterSelectedValue, actualfilterIndex) {
			var hayfiltro = false;
			for (var i = 0; i < prevFilterSelectedValue.length; i++) {
				if (prevFilterSelectedValue[i] != null) {
					hayfiltro = true;
				}
			}
			if (!hayfiltro) return false;

			var distinctPerFilterValue = [];
			for (var i = 0; i < self.GeneralDataRows.length; i++) { //for each row
				var coincide = true;
				for (var j = 0; j < prevFilterSelectedValue.length; j++) {
					if (prevFilterSelectedValue[j] != null) {
						if (self.GeneralDataRows[i][self.filterIndexes[j]] != prevFilterSelectedValue[j]) {
							coincide = false;
						}
					}
				}
				if (coincide) {
					distinctPerFilterValue.push(self.GeneralDataRows[i][self.filterIndexes[actualfilterIndex]])
				}
			}

			return distinctPerFilterValue;

		}
		
		this.drawTitleDiv = function(){
			if (self.PivotTitle) { 
				OAT.Dom.clear(self.TitleDiv);
						
				var ua = navigator.userAgent.toLowerCase();
				var isAndroid = ua.indexOf("android") > -1;
				if ((OAT.isIE()) || OAT.isAndroid()) {
					self.TitleDiv.className += " pivot_title_div";
				} else {
					self.TitleDiv.classList.add("pivot_title_div");
				}
			
				OAT.addTextNode(self.TitleDiv, self.PivotTitle)
			}
		}
		
		this.drawFilters = function () {
			var savedValues = [];
			var div = self.filterDiv;
			var filterInfoIcon = OAT.Dom.create("div");
			var spanHover = OAT.Dom.create("span");

			var ua = navigator.userAgent.toLowerCase();
			var isAndroid = ua.indexOf("android") > -1;
			if (OAT.isIE() || OAT.isAndroid()) {
				self.filterDiv.className += " pivot_filter_div";
			} else {
				self.filterDiv.classList.add("pivot_filter_div");
			}
			if (!self.isSD && self.filterIndexes.length == 0) {
				filterInfoIcon.href = "#";
				filterInfoIcon.setAttribute("class", "filterInfoUser");
				spanHover.setAttribute("class", "spanHoverLabel");
				spanHover.setAttribute("id", "filterSpanInfo");
				OAT.addImageNode(filterInfoIcon, "info", "");
				OAT.addTextNode(spanHover, self.translations.GXPL_QViewerInfoUser /*gx.getMessage("GXPL_QViewerInfoUser")*/);
			}

			for (var i = 0; i < div.selects.length; i++) {
				savedValues.push([div.selects[i].filterIndex, div.selects[i].selectedIndex, div.selects[i].value]);
			}
			OAT.Dom.clear(div);
			self.gd.addTarget(div);
			div.selects = [];
			if (!self.filterIndexes.length) {
				var strng = self.translations.GXPL_QViewerJSDropFiltersHere;// gx.getMessage("GXPL_QViewerJSDropFiltersHere");

				if (self.isSD) {
					strng = "";
				}



				if ((strng[strng.length - 1] === "\"") || (strng[strng.length - 1] === "'") || (strng[strng.length - 1] === "]") || (strng[strng.length - 1] === "}") || (strng[strng.length - 1] === "`")) {
					strng = strng.substring(0, strng.length - 1);
				}

				if (strng != "") {
					var spanText = document.createElement('span')
					spanText.textContent = strng;
					div.appendChild(spanText);
				}
			}

			var loadItems = function () {
				var s = this;
				var actualValues = self.conditions[this.filterIndex].distinctValues;
				for (var j = 0; j < actualValues.length; j++) {
					var v = actualValues[j];
					if (self.conditions[this.filterIndex].filteredShowValues.indexOf(v) == -1) {
						self.conditions[this.filterIndex].filteredShowValues.push(v);
						if (v != "#NuN#") {
							try {
								OAT.Dom.option(self.dimensionPictureValue(v, this.filterIndex), v, s);
							} catch (Error) {
								OAT.Dom.option(v, v, s);
							}
						} else {
							OAT.Dom.option(" ", v, s);
						}
					}
				}
				//load all other items
				self.lastRequestValue = this.filterIndex; var columnNumber = this.filterIndex;
				if (self.conditions[columnNumber].previousPage < self.conditions[columnNumber].totalPages) {
					
					self.lastRequestAttributeValues = "DrawFilters"
					self.lastRequestAttributeColumnNumber = columnNumber
					
				
					self.requestAttributeValues(self.columns[this.filterIndex].getAttribute("dataField"), 1, 0, "")
					
					
				}
			}
			var callgo = function () {
				self.stateChanged = true
				
					self.DiseablePivot();
					self.conditions[this.filterIndex].topFilterValue = this.value
					self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, self.conditions[this.filterIndex].dataField, { op: "pagefilter", values: this.value, dim: this.filterIndex }, "", "")
					self.EneablePivot();
					return;
				

			}
			var prevFilterSelectedValue = [];
			var loaded = [];
			for (var i = 0; i < self.filterIndexes.length; i++) {
				if (loaded.indexOf(self.filterIndexes[i]) < 0) {
					loaded.push(self.filterIndexes[i])
					var index = self.filterIndexes[i];
					var s = OAT.Dom.create("select");
					s.setAttribute("id", "page_select_" + i)
					OAT.Dom.option(self.translations.GXPL_QViewerJSAllOption /*gx.getMessage("GXPL_QViewerJSAllOption")*/, "[all]", s);

					var actualValues;
					
					actualValues = []
					

					if (self.GeneralDistinctValues.length > 0) {
						for (var j = 0; j < self.GeneralDistinctValues[index].length; j++) {
							var v = self.GeneralDistinctValues[index][j];
							if (!actualValues) {
								if (v != "#NuN#") {
									try {
										OAT.Dom.option(self.dimensionPictureValue(v, index), v, s);
									} catch (Error) {
										OAT.Dom.option(v, v, s);
									}
								} else {
									OAT.Dom.option(" ", v, s);
								}
							} else {
								if (actualValues.indexOf(v) != -1) {
									if (v != "#NuN#") {
										try {
											OAT.Dom.option(self.dimensionPictureValue(v, index), v, s);
										} catch (Error) {
											OAT.Dom.option(v, v, s);
										}
									} else {
										OAT.Dom.option(" ", v, s);
									}
								}
							}
						}

						try {
							var pos = 0;
							for (var j = 0; j < self.GeneralDistinctValues[index].length; j++) {
								var v = self.GeneralDistinctValues[index][j];
								if (self.conditions[index].topFilterValue === v) {
									s.selectedIndex = pos + 1;
								}
								if (!actualValues) {
									pos++;
								} else {
									if (actualValues.indexOf(v) != -1) {
										pos++;
									}
								}
							}
						} catch (error) {

						}
					}

					
						self.conditions[index].filteredShowValues = []
						var actualValues = self.conditions[index].distinctValues;
						for (var j = 0; j < actualValues.length; j++) {
							var v = actualValues[j];
							if (self.conditions[index].filteredShowValues.indexOf(v) == -1) {
								self.conditions[index].filteredShowValues.push(v);
								if (v != "#NuN#") {
									try {
										OAT.Dom.option(self.dimensionPictureValue(v, index), v, s);
									} catch (Error) {
										OAT.Dom.option(v, v, s);
									}
								} else {
									OAT.Dom.option(" ", v, s);
								}
							}
						}
						if ((self.conditions[index].topFilterValue != "[all]") /*&& (self.conditions[index].topFilterValue!="")*/) {
							
							var v = self.conditions[index].topFilterValue
							
							var isInFilteredShowValues = -1;
							for(var fV = 0; fV < self.conditions[index].filteredShowValues.length; fV++){
								if (String(self.conditions[index].filteredShowValues[fV]).trim() == String(v).trim()){
									isInFilteredShowValues = fV;
								}
							}
							
							if (isInFilteredShowValues > -1) {//(self.conditions[index].filteredShowValues.indexOf(v) != -1) { //value already load
								s.selectedIndex = isInFilteredShowValues + 1
							//if (self.conditions[index].filteredShowValues.indexOf(v) != -1) { //value already load
							//	s.selectedIndex = self.conditions[index].filteredShowValues.indexOf(v) + 1
							} else {
								self.conditions[index].filteredShowValues.push(v);
								if (v != "#NuN#") {
									try {
										OAT.Dom.option(self.dimensionPictureValue(v, index), v, s);
									} catch (Error) {
										OAT.Dom.option(v, v, s);
									}
								} else {
									OAT.Dom.option(" ", v, s);
								}
								s.selectedIndex = 1
							}
						}
					

					s.filterIndex = index;
					for (var j = 0; j < savedValues.length; j++) {
						if (savedValues[j][0] == index) {
							for (var it = 0; it < s.length; it++) {
								if (s[it].value == savedValues[j][2]) {
									s.selectedIndex = it
								}
							}
						}
					}

					if (s.selectedIndex > 0) {
						prevFilterSelectedValue[i] = s.value;
					} else {
						prevFilterSelectedValue[i] = null
					}

					
						OAT.Dom.attach(s, "click", loadItems);
					
					OAT.Dom.attach(s, "change", callgo);
					div.selects.push(s);
					var d = OAT.Dom.create("div");
					d.setAttribute("class", "inner_filter_div");

					OAT.addTextNode(d, self.headerRow[index])


					var close = document.createElement("div");
					close.setAttribute("class", "close_span_filter");
					OAT.addImageNode(close, "close", "");
					
					close.style.cursor = "pointer";
					var ref = self.getDelFilterReference(index);
					OAT.Dom.attach(close, "click", ref);

					
						OAT.Dom.append([self.filterDiv, d], [d, s, close]);
					
				}
			}


			//draw export image and pop up of export options
			var exportImg = OAT.Dom.create("div");
			exportImg.href = "#";
			if (self.isSD) {//android
				exportImg.setAttribute("class", "exportOptionsAnchor exportOptionsAnchor_small");
			} else {
				exportImg.setAttribute("class", "exportOptionsAnchor");
			}
			
			OAT.addImageNode(exportImg, "menu", "")

			self.filterIcon = OAT.Dom.create("div", {});

			self.exportPage = OAT.Dom.create("div", {});


			var checkToClose = function (b) {
				source = OAT.Event.source(b);
				var clean = false;
				var closing = false;
				for (var i = 0; i < jQuery(".oat_winrect_container").length; i++) {
					var obj = jQuery(".oat_winrect_container")[i];
					if (!(source == obj) && !OAT.Dom.isChild(source, obj)) {
						clean = true;
					} else {
						clean = false; break;
					}
				}
				for (var i = 0; i < jQuery(".oat_winrect_container").length; i++) {
					if (jQuery(".oat_winrect_container")[i].style.display != "none") {
						closing = true;
					}
				}
				if (
					((source.getAttribute("class") == "oat_winrect_close_b") || (!OAT.Dom.isChild(source, obj))) &&
					(closing)) {
					self.resetAllScrollValue(self.UcId);
				}
				if (clean) {
					jQuery(".oat_winrect_container").css({ display: "none" });
				}
			};

			var checkInfoFilters = function (b) {
				source = OAT.Event.source(b);
				var clean = false;
				var closing = false;
				for (var i = 0; i < jQuery(".oat_winrect_container").length; i++) {
					var obj = jQuery(".oat_winrect_container")[i];
					if (!(source == obj) && !OAT.Dom.isChild(source, obj)) {
						clean = true;
					} else {
						clean = false; break;
					}
				}
				for (var i = 0; i < jQuery(".oat_winrect_container").length; i++) {
					if (jQuery(".oat_winrect_container")[i].style.display != "none") {
						closing = true;
					}
				}
				if (
					((source.getAttribute("class") == "oat_winrect_close_b") || (!OAT.Dom.isChild(source, obj))) &&
					(closing)) {
					self.resetAllScrollValue(self.UcId);
				}
				if (clean) {
					jQuery(".oat_winrect_container").css({ display: "none" });
				}
			};

			OAT.Dom.attach(document, "mousedown", checkToClose)
			OAT.Dom.attach(document, "onmouseout", checkInfoFilters)
			
			OAT.Anchor.assign(exportImg, {
				title: " ",
				content: self.exportPage,
				result_control: false,
				activation: "click",
				type: OAT.WinData.TYPE_RECT,
				width: "auto",
				containerQuery: self.IdForQueryViewerCollection + "-pivottable" +/*qv.util.GetContainerControlClass(self.QueryViewerCollection[self.IdForQueryViewerCollection]) +*/ " ExportPopup "
			});

			var clickRef = function (event) {
				var coords = OAT.Event.position(event);
				self.exportPage.style.left = coords[0] + "px";
				self.exportPage.style.top = coords[1] + "px";
				self.exportPage.id = "exportOptionsContainer";


				var screenWidth = window.innerWidth;
				var initialPopUpWidth = Math.max(jQuery(".ExportPopup")[0].clientWidth, 300)
				var offsetLeft = jQuery(event.currentTarget).offset().left

				var iconExport = event.currentTarget

				/* title */
				jQuery(".oat_winrect_title").find(".winrect_title_label").remove()

				var spantitle = OAT.Dom.create("label");
				if (self.isSD) {
					jQuery(".oat_winrect_container").addClass("oat_winrect_container_small")
					spantitle.setAttribute("class", "winrect_title_label winrect_title_label_small");
				} else {
					spantitle.setAttribute("class", "winrect_title_label");
				}
				OAT.addTextNode(spantitle, self.translations.GXPL_QViewerPopupTitle/*gx.getMessage("GXPL_QViewerPopupTitle")*/);
				jQuery(".oat_winrect_title").append(spantitle)


				jQuery(".ExportPopup").css({ left: -2500 + "px", top: 0 + "px" })


				OAT.Dom.clear(self.exportPage);
				//begin export options
				var div_upper = document.createElement("div");
				div_upper.setAttribute("class", "upper_container");

				//botton to allow show all filters in pop up
				jQuery('#divtoxml').remove();
				jQuery('#divtoxls').remove();
				jQuery('#divtoxlsx').remove();
				jQuery('#divtoexport').remove();
				jQuery('#divtohtml').remove();
				var someExport = false;
				self.appendExportToXmlOption(div_upper, someExport);
				self.appendExportToHtmlOption(div_upper, someExport);
				self.appendExportToPdfOption(div_upper, someExport);
				self.appendExportToExcelOption(div_upper, someExport);
				self.appendExportToExcel2010Option(div_upper, someExport);

				self.exportPage.appendChild(div_upper);

				if ((self.QueryViewerCollection[IdForQueryViewerCollection].ExportToXML) || (self.QueryViewerCollection[IdForQueryViewerCollection].ExportToHTML)
				|| (self.QueryViewerCollection[IdForQueryViewerCollection].ExportToPDF) || (self.QueryViewerCollection[IdForQueryViewerCollection].ExportToXLS)
				|| (self.QueryViewerCollection[IdForQueryViewerCollection].ExportToXLSX)) {
					var hr = OAT.Dom.create("hr", {});
					self.exportPage.appendChild(hr);
				}

				var div_down = document.createElement("div");
				div_down.setAttribute("class", "down_container");
				self.exportPage.appendChild(div_down);

				var label = document.createElement("span");
				label.textContent = self.translations.GXPL_QViewerJSVisibleColumns//gx.getMessage("GXPL_QViewerJSVisibleColumns")
				var div_label = document.createElement("div");
				div_label.setAttribute("class", "div_label_win");
				div_label.appendChild(label);
				div_down.appendChild(div_label);


				var generatePair = function (index, isDimension) {
					if ((isDimension) && (self.initMetadata.Dimensions[index].validPosition == ""))
					{
						return false;
					}
					if ((!isDimension) && (self.initMetadata.Measures[index].validPosition == "hidden"))
					{
						return false
					}
					
					var dataField; var displayName;
					if (isDimension) {
						dataField = self.initMetadata.Dimensions[index].dataField;
						displayName = self.initMetadata.Dimensions[index].displayName;
					} else {
						dataField = self.initMetadata.Measures[index].dataField;
						displayName = self.initMetadata.Measures[index].displayName;
					}

					var state = self.headerRow.indexOf(displayName) != -1;
					var pair = OAT.Dom.create("div");
					var check_class = (state) ? "check_item_img" : "uncheck_item_img";
					if (self.isSD) {//android
						check_class = (state) ? "check_item_img_small" : "uncheck_item_img_small";
					}
					OAT.addImageNode(pair, state ? "check_box" : "check_box_outline_blank", "");

					pair.setAttribute("class", check_class);
					pair.setAttribute("dataField", displayName);
					pair.setAttribute("isDimension", isDimension);
					pair.setAttribute("index", index);
					var span = OAT.Dom.create("span");
					if (isDimension) {
						OAT.addTextNode(span, " " + self.initMetadata.Dimensions[index].displayName)
					} else {
						OAT.addTextNode(span, " " + self.initMetadata.Measures[index].displayName)
					}
					var show = ((self.formulaInfo.itemPosition[dataField] == undefined) || (self.formulaInfo.cantFormulaMeasures == 0))
					if (isDimension) {
						show = show && (self.initMetadata.Dimensions[index].validPosition != "hidden")
					} else {
						show = show && (self.initMetadata.Measures[index].validPosition != "hidden")
					}
					if (show) {
						pair.appendChild(span);
						OAT.Event.attach(pair, "click", function () { // this hide or show the columns
							var isDimension = (pair.getAttribute("isDimension") == "true");
							var dataField = pair.getAttribute("dataField");
							var index = parseInt(pair.getAttribute("index"));

							var checkedClass = "check_item_img"
							var unCheckedClass = "uncheck_item_img"
							if (self.isSD) {//android
								checkedClass = "check_item_img_small"
								unCheckedClass = "uncheck_item_img_small"
							}

							var newClass = (this.getAttribute("class") === checkedClass) ? unCheckedClass : checkedClass;
							this.setAttribute("class", newClass);
							
							jQuery(this).find("i")[0].textContent = (this.getAttribute("class") === checkedClass) ? "check_box" : "check_box_outline_blank";

							if (isDimension) {
								self.initMetadata.Dimensions[index].Visible = !self.initMetadata.Dimensions[index].Visible
								self.preGoWhenShowHideDimension(index);
							} else {
								self.initMetadata.Measures[index].Visible = !self.initMetadata.Measures[index].Visible
								self.preGoWhenShowHideMeasures(index);
							}

						});
					}


					return pair;
				}

				var start = (self.autoNumber ? 1 : 0);
				for (var i = start; i < self.initMetadata.Dimensions.length; i++) {
					var pair = generatePair(i, true);
					if (pair)
						div_down.appendChild(pair);
				}
				for (var i = start; i < self.initMetadata.Measures.length; i++) {
					var pair = generatePair(i, false);
					if (pair)
						div_down.appendChild(pair);
				}




				setTimeout(function () {

					var screenWidth = window.innerWidth;
					var initialPopUpWidth = jQuery(".ExportPopup")[0].clientWidth


					if (initialPopUpWidth == 0) {
						var last = jQuery(".ExportPopup").length;
						initialPopUpWidth = jQuery(".ExportPopup")[last - 1].clientWidth
					}

					if (self.isSD) {//android		
						if (initialPopUpWidth < 240) {
							initialPopUpWidth = 240
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



			} /* clickref */
			OAT.Event.attach(exportImg, "click", clickRef);

			
			self.filterDiv.appendChild(exportImg);

			filterInfoIcon.appendChild(spanHover);

			self.filterDiv.appendChild(filterInfoIcon);


		}

		this.appendExportToXmlOption = function (content, someExport) {
			var exportXMLButton;
			if (self.QueryViewerCollection[IdForQueryViewerCollection].ExportToXML) {

					exportXMLButton = OAT.Dom.create("div");
					

					exportXMLButtonSub = self.createExportButton(exportXMLButton)

					var pvpl = OAT.Dom.create("label");
					OAT.addTextNode(pvpl, self.translations.GXPL_QViewerContextMenuExportXml/*gx.getMessage("GXPL_QViewerContextMenuExportXml")*/)
					pvpl.htmlFor = "pivot_checkbox_restoreview";
					pvpl.setAttribute("class", "pivot_checkbox_restoreview");
					exportXMLButton.appendChild(pvpl);
					var span = document.createElement("span");
					exportXMLButton.appendChild(span);

					OAT.Dom.attach(exportXMLButtonSub, "click", function () {
						
							self.getDataForPivot(self.UcId, 1, -1, true, "", "", "XML", "", "", true)
						
					});
				
				if (someExport) {
					if (!OAT.isIE()) {
						content.appendChild(OAT.Dom.create("br"));
					}
				}
				content.appendChild(exportXMLButton);
				someExport = true;
			}
		}
	
		
		
		this.ExportToXMLWhenServerPagination = function () {
			
			self.lastRequestPivotDataCalculation = ""
			self.lastRequestCalculation = "ExportToXML"
			self.requestCalculatePivottableData() 
			

		}

		this.ExportToHTMLWhenServerPagination = function () {
			var dir = OAT.resourceURL(self.relativePath + 'QueryViewer/oatPivot/css/pivot.css')

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
			
			str = str + "</HEAD><DIV style=\"margin-bottom: 5px;\">"
			
			str = str + '<div class="gx_usercontrol qv-pivottable QueryViewer-pivottable">'
			
			str = str + '<table class="pivot_table" style="width: 100%;">'
			
			str = str + OAT.removeIconFont(jQuery("#" + self.controlName + "_" + self.query)[0].innerHTML.replace(/display: none;/g, "").replace(/sort-asc/g, "").replace(/sort-desc/g, ""));
			
			str = str + '</table>'
			
			str = str + '</div>'
			str = str + "</DIV></BODY></HTML>";

			if ((OAT.isSafari()) || (self.isSD)) { //for safari
				window.open('data:text/html,' + str);
			} else {
				var blob = new Blob([str], { type: "text/html" });
				if (self.query != "") {
					saveAs(blob, self.query + ".html");
				} else {
					var name = 'Query'
					try {
						name = self.controlName.substr(4).split("_")[0]
					} catch (error) { }
					saveAs(blob, name + ".html");
				}
			}
		}

		this.appendExportToHtmlOption = function (content, someExport) {
			var exportHTMLButton;
			if (self.QueryViewerCollection[IdForQueryViewerCollection].ExportToHTML) {
				

					var exportHTMLButton = OAT.Dom.create("div");
					// exportHTMLButton.style.marginBottom = "10px"

					exportButtonSub = self.createExportButton(exportHTMLButton)

					var pvpl = OAT.Dom.create("label");
					OAT.addTextNode(pvpl, self.translations.GXPL_QViewerContextMenuExportHtml/*gx.getMessage("GXPL_QViewerContextMenuExportHtml")*/)
					pvpl.htmlFor = "pivot_checkbox_restoreview";
					pvpl.setAttribute("class", "pivot_checkbox_restoreview");
					exportHTMLButton.appendChild(pvpl);



					OAT.Dom.attach(exportButtonSub, "click", function () {
						
							self.getDataForPivot(self.UcId, 1, -1, true, "", "", "HTML", "", "", true)
						
					});
				
				if (someExport) {
					if (!OAT.isIE()) {
						content.appendChild(OAT.Dom.create("br"));
					}
				}
				content.appendChild(exportHTMLButton);
				someExport = true;
			}
		}


		this.appendExportToPdfOption = function (content, someExport) {
			var exportPdfButton;
			if (self.QueryViewerCollection[IdForQueryViewerCollection].ExportToPDF) {
				someExport = true;
				
					var exportPdfButton = OAT.Dom.create("div");

					exportButtonSub = self.createExportButton(exportPdfButton)

					var pvpl = OAT.Dom.create("label");
					OAT.addTextNode(pvpl, self.translations.GXPL_QViewerContextMenuExportPdf /*gx.getMessage("GXPL_QViewerContextMenuExportPdf")*/)
					pvpl.htmlFor = "pivot_checkbox_restoreview";
					pvpl.setAttribute("class", "pivot_checkbox_restoreview");
					exportPdfButton.appendChild(pvpl);

					var FileName = self.query
					if (FileName == "") {
						FileName = "Query"
						try {
							FileName = self.controlName.split("_")[0]
						} catch (error) { }
					}
					OAT.Dom.attach(exportButtonSub, "click", function () {
						
							self.getDataForPivot(self.UcId, 1, -1, true, "", "", "PDF", "", "", true)
						
					});
				

				content.appendChild(exportPdfButton);
			}
		}



		this.appendExportToExcelOption = function (content, someExport) {
			var exportXLSButton;
			if (self.QueryViewerCollection[IdForQueryViewerCollection].ExportToXLS) {

				
					var exportXLSButton = OAT.Dom.create("div");

					exportButtonSub = self.createExportButton(exportXLSButton)

					var pvpl = OAT.Dom.create("label");
					OAT.addTextNode(pvpl,self.translations.GXPL_QViewerContextMenuExportXls2003 /*gx.getMessage("GXPL_QViewerContextMenuExportXls2003")*/)
					//gx.getMessage("GXPL_QViewerContextMenuExportPdf")
					pvpl.htmlFor = "pivot_checkbox_restoreview";
					pvpl.setAttribute("class", "pivot_checkbox_restoreview");
					exportXLSButton.appendChild(pvpl);

					var FileName = self.query
					if (FileName == "") {
						FileName = "Query"
						try {
							FileName = self.controlName.split("_")[0]
						} catch (error) { }
					}
					OAT.Dom.attach(exportButtonSub, "click", function () {
						
							self.getDataForPivot(self.UcId, 1, -1, true, "", "", "XLS", "", "", true)
						

					});
				
				if (someExport) {
					if (!OAT.isIE()) {
						content.appendChild(OAT.Dom.create("br"));
					}
				}
				content.appendChild(exportXLSButton);
				someExport = true;
			}
		}

		this.ExportToXLSXWhenServerPagination = function () {
			
			self.lastRequestCalculation = "ExportToXLSX"
			self.requestCalculatePivottableData()

		}

		this.appendExportToExcel2010Option = function (content, someExport) {
			var exportXLSButton;
			if ((self.QueryViewerCollection[IdForQueryViewerCollection].ExportToXLSX) && ((self.allData.length > 0) || (self.serverPagination))) {

				
					var exportXLSButton = OAT.Dom.create("div");

					exportButtonSub = self.createExportButton(exportXLSButton)

					var pvpl = OAT.Dom.create("label");
					OAT.addTextNode(pvpl, self.translations.GXPL_QViewerContextMenuExportXlsx /*gx.getMessage("GXPL_QViewerContextMenuExportXlsx")*/)
					pvpl.htmlFor = "pivot_checkbox_restoreview";
					pvpl.setAttribute("class", "pivot_checkbox_restoreview");
					exportXLSButton.appendChild(pvpl);

					var FileName = self.query
					if (FileName == "") {
						FileName = "Query"
						try {
							//FileName = self.controlName.substr(4).split("_")[0]
							FileName = self.controlName.split("_")[0]
						} catch (error) { }
					}
					OAT.Dom.attach(exportXLSButton, "click", function () {
						
							self.getDataForPivot(self.UcId, 1, -1, true, "", "", "XLSX", "", "", true);
						
					});

				if (someExport) {
					if (!OAT.isIE()) {
						content.appendChild(OAT.Dom.create("br"));
					}
				}
				content.appendChild(exportXLSButton);
				someExport = true;
			}
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
			if (self.isSD) {//android		
				divContainer.setAttribute("class", "export_item_div export_item_div_small");
			}
			return divContainer;
		}



		this._drawCorner = function (th, target) {
			if (measures.length > 0) {
				OAT.addTextNode(th, self.headerRow[self.dataColumnIndex])
				th.className = "h2titlewhite";
				this.setTitleTexrtAlign(th, th.textContent);
			}
		}



		this._drawRowConditionsHeadingsCustom = function (tr) {
			/* rowConditions headings */
			for (var j = 0; j < self.rowConditions.length; j++) {
				var cond = self.conditions[self.rowConditions[j]];
				if (self.isMeasureByName(self.headerRow[self.rowConditions[j]], cond.dataField, cond.isDimension)) {
					if (!self.ShowMeasuresAsRows) {
						var th = OAT.Dom.create("th", {}, "h2titlewhite");
						var div = OAT.Dom.create("div");
						OAT.addTextNode(div, self.headerRow[self.rowConditions[j]])
						this.setTitleTexrtAlign(div, self.headerRow[self.rowConditions[j]]);
						th.rowSpan = self.colConditions.length + 2;
					}
				} else {
					var th = OAT.Dom.create("th", {}, "h2title");
					var divCont = OAT.Dom.create("div", { position: "relative" });

					var div = OAT.Dom.create("div", { overflow: "hidden"});
					
						OAT.addTextNode(div, self.headerRow[self.rowConditions[j]].replace(/ /g, "\u00A0") + "\u00A0\u00A0\u00A0\u00A0")
					
					if ((self.GeneralDataRows.length > 0) || (self.serverPagination)) {
						var resp = self.getClickReference(cond, self.rowConditions[j], div);
						var ref = resp[0]
						var anchorRef = resp[1]
						OAT.Dom.attach(th, "click", ref);
						var callback = self.getOrderReference(self.rowConditions[j], anchorRef, ref, div);
						self.gd.addSource(div, self.process, callback);
						self.gd.addTarget(th);
					}
					th.conditionIndex = self.rowConditions[j];
					if (!self.ShowMeasuresAsRows) {
						th.rowSpan = self.colConditions.length + 2;
					} else {
						th.rowSpan = self.colConditions.length + 1;
					}

					var divImg = OAT.Dom.create("div", { position: "absolute", right: "-6px", bottom: "0px"});
					OAT.addImageNode(divImg, "arrow_drop_down", "");
					var divIcon = OAT.Dom.create("div");
					divIcon.className = "div_settings";
					OAT.addImageNode(divIcon, "settings", "");
					try {
						this.updateSortImage(divImg, cond.sort);
					} catch (Error) { }
					OAT.Dom.append([th, divCont], [divCont, div], [divCont, divImg], [div, divIcon], [tr, th]);
				}
			}
			if (self.ShowMeasuresAsRows) //add title of Measure
			{
				var largo = 80;
				var th = OAT.Dom.create("th", {}, "h2title");
				var divCont = OAT.Dom.create("div", { position: "relative", minWidth: largo + "px" });
				var div = OAT.Dom.create("div", { overflow: "hidden" });
				OAT.addTextNode(div, self.translations.GXPL_QViewerJSMeasures /*gx.getMessage("GXPL_QViewerJSMeasures")*/ + "\u00A0\u00A0\u00A0")
				OAT.Dom.append([th, divCont], [divCont, div], [tr, th]);
				th.rowSpan = self.colConditions.length + 1;
				OAT.Dom.append([th, div], [tr, th]);
			}
		}

		this.isMeasureByName = function (headerName, dataField, isDimension) {
			var ismeasure = false;
			for (var i = 0; i < measures.length - 1; i++) {
				if (measures[i].attributes.getNamedItem("displayName").nodeValue == headerName) {
					ismeasure = true;
				}
			}
			
			
				if (dataField){
				var ismeasure = false;
				for (var pd = 0; pd<self.pageData.DataInfo.length; pd++){
					if (dataField == self.pageData.DataInfo[pd].DataField)
						ismeasure = true;
				}
				}
			

			return ismeasure;
		}

		this.setTitleTexrtAlign = function (div, header) {
			for (var i = 0; i < measures.length; i++) {
				if (measures[i].getAttribute("displayName") === header) {
					if ((measures[i].getAttribute("dataType") === "integer") || (measures[i].getAttribute("dataType") === "real")) {
						div.style.textAlign = "left"
					}
					if (measures[i].getAttribute("date") === "integer") {
						div.style.textAlign = "right"
					}
				}
			}
		}

		this.updateSortImage = function (div, order) {
			var path = "none";
			switch (order) {
				case 0: path = "asc"; break;
				case 1: path = "asc"; break;   
				case -1: path = "desc"; break; 
				case 2: path = "desc"; break;
			}

	
			if (OAT.isIE() || (OAT.isAndroid())) {
				div.className.replace("sort-none");
				div.className.replace("sort-asc");
				div.className.replace("sort-desc");
			} else {
				div.classList.remove("sort-none");
				div.classList.remove("sort-asc");
				div.classList.remove("sort-desc");
			}
			if (OAT.isIE() || (OAT.isAndroid())) {
				div.className += " sort-" + path;
			} else {
				div.classList.add("sort-" + path);
			}
			jQuery(div).find("i")[0].textContent = (path == "asc") ? "arrow_drop_up" : "arrow_drop_down";
		}

		this._drawRowConditionsHeadings = function (tbody) {
			/* rowConditions headings */
			var tr = OAT.Dom.create("tr");
			for (var j = 0; j < self.rowConditions.length; j++) {
				var cond = self.conditions[self.rowConditions[j]];
				if (self.isMeasureByName(self.headerRow[self.rowConditions[j]], cond.dataField, cond.isDimension)) {
					if (!self.ShowMeasuresAsRows) {
						var th = OAT.Dom.create("th", {}, "h2titlewhite");
						var div = OAT.Dom.create("div");
						OAT.addTextNode(div, self.headerRow[self.rowConditions[j]])
						self.setTitleTexrtAlign(div, self.headerRow[self.rowConditions[j]]);
						OAT.Dom.append([th, div], [tr, th]);
					}
				} else {
					var largo = (self.headerRow[self.rowConditions[j]].length > 8) ? self.headerRow[self.rowConditions[j]].length * 10 : 80;
					var th = OAT.Dom.create("th", {}, "h2title");
					var divCont = OAT.Dom.create("div", { position: "relative", minWidth: largo + "px" });
					var div = OAT.Dom.create("div", { overflow: "hidden" });
					OAT.addTextNode(div, self.headerRow[self.rowConditions[j]] + "\u00A0\u00A0\u00A0")
					var resp = self.getClickReference(cond, self.rowConditions[j], div);
					var ref = resp[0];
					var anchorRef = resp[1];
					OAT.Dom.attach(th, "click", ref);
					var callback = self.getOrderReference(self.rowConditions[j], anchorRef, ref, div);
					self.gd.addSource(div, self.process, callback);
					self.gd.addTarget(th);
					th.conditionIndex = self.rowConditions[j];

					var divImg = OAT.Dom.create("div", { position: "absolute", right: "-6px", bottom: "0px"});
					OAT.addImageNode(divImg, "arrow_drop_down", "");
					var divIcon = OAT.Dom.create("div");
					divIcon.className = "div_settings";
					OAT.addImageNode(divIcon, "settings", "");
					if (cond != undefined) {
						this.updateSortImage(divImg, cond.sort);
					} else {
						this.updateSortImage(divImg, 0);
					}

					OAT.Dom.append([th, divCont], [divCont, div], [divCont, divImg], [div, divIcon], [tr, th]);
				}
			}


			if (self.ShowMeasuresAsRows) {
				//"Measure" Title
				var largo = 80;
				var th = OAT.Dom.create("th", {}, "h2title");
				var divCont = OAT.Dom.create("div", { position: "relative", minWidth: largo + "px" });
				var div = OAT.Dom.create("div", { overflow: "hidden" });

				OAT.addTextNode(div, self.translations.GXPL_QViewerJSMeasures /*gx.getMessage("GXPL_QViewerJSMeasures")*/ + "\u00A0\u00A0\u00A0")
				OAT.Dom.append([th, divCont], [divCont, div], [tr, th]);
				//"Value" Title
				var th = OAT.Dom.create("th", {}, "h2titlewhite");
				var div = OAT.Dom.create("div");

				OAT.addTextNode(div, self.translations.GXPL_QViewerJSValue /*gx.getMessage("GXPL_QViewerJSValue")*/)
				th.style.textAlign = "end"
				OAT.Dom.append([th, div], [tr, th]);
			}


			var th = OAT.Dom.create("th"); /* blank space above */
			if (!self.colConditions.length) {
				self._drawCorner(th, true);
				th.conditionIndex = -1;
			} else { th.style.border = "none"; }
			if (self.colStructure.span != null) {
				th.colSpan = self.colStructure.span + (self.options.headingBefore ? 1 : 0) + (self.options.totals ? 1 : 0);
			} else {
				th.colSpan = (self.options.headingBefore ? 1 : 0) + (self.options.totals ? 1 : 0);
			}
			if ((measures.length > 0) && (!self.ShowMeasuresAsRows)) {
				tr.appendChild(th);
			}
			if (self.colConditions.length) { /* blank space after */
				var th = OAT.Dom.create("th", { border: "none", width: "0px;" });
				tr.appendChild(th);
			}
			//if ((measures.length > 0) && (tr.cells[1] != undefined) && (tr.cells[1].textContent == "")) { tr.hidden = true; } //hideemptycolrow
			//else {
			self.appendRowToTable(tbody, tr, true);
			//}
			// MOVE FILTERS TO TOOLBAR
			if ((measures.length > 0) && (tr.cells[1] != undefined) && (tr.cells[1].textContent == "")) {
				var toolbarTable = document.getElementById(self.controlName + "_" + self.query + "_toolbar");
				if (toolbarTable.rows[0])
					toolbarTable.rows[0].appendChild(tr.cells[0]);
			}
			
		}

		this._drawColConditionsHeadingsCustom = function (tr, i, last) {
			var cond = self.conditions[self.colConditions[i]];
			var th = OAT.Dom.create("th", { cursor: "pointer" }, "h2title");
			var largo = (self.headerRow[self.colConditions[i]].length > 8) ? ((self.headerRow[self.colConditions[i]].length + 3) * 10) : 80;
			var divCont = OAT.Dom.create("div", { position: "relative", minWidth: largo + "px" });
			if (last) {
				th.style.borderRightColor = "transparent";
			}
			var div = OAT.Dom.create("div", { overflow: "hidden" });
			
				OAT.addTextNode(div, self.headerRow[self.colConditions[i]].replace(/ /g, "\u00A0") + "\u00A0\u00A0\u00A0")
			
			if ((self.GeneralDataRows.length > 0) || (self.serverPagination)) {
				var resp = self.getClickReference(cond, self.colConditions[i], div);
				var ref = resp[0]
				var anchorRef = resp[1]

				OAT.Dom.attach(th, "click", ref);
				var callback = self.getOrderReference(self.colConditions[i], anchorRef, ref, div);
				self.gd.addSource(div, self.process, callback);
				self.gd.addTarget(th);
			}
			var divImg = OAT.Dom.create("div", { position: "absolute", right: "0px", bottom: "2px", width: "12px", height: "12px" });
			OAT.addImageNode(divImg, "arrow_drop_down", "");
			var divIcon = OAT.Dom.create("div");
			divIcon.className = "div_settings";
			OAT.addImageNode(divIcon, "settings", "");
			try {
				this.updateSortImage(divImg, cond.sort);
			} catch (error) { }
			divCont.appendChild(div);
			div.appendChild(divIcon);
			divCont.appendChild(divImg);
			

			th.conditionIndex = self.colConditions[i];
			th.appendChild(divCont);
			//th.hidden = true;
			tr.appendChild(th);

			return tr;
		}

		this._drawColConditionsHeadings = function (tr, i) {
			var cond = self.conditions[self.colConditions[i]];
			var th = OAT.Dom.create("th", { cursor: "pointer" }, "even gx-pv-even-row");
			var div = OAT.Dom.create("div");
			OAT.addTextNode(div, self.headerRow[self.colConditions[i]])
			var resp = self.getClickReference(cond, self.colConditions[i], div);
			var ref = resp[0]
			var anchorRef = resp[1]
			OAT.Dom.attach(th, "click", ref);
			var callback = self.getOrderReference(self.colConditions[i], anchorRef, ref, div);
			self.gd.addSource(div, self.process, callback);
			self.gd.addTarget(th);
			th.conditionIndex = self.colConditions[i];
			th.appendChild(div);
			th.hidden = true;


			/////////////////////////////////////////////////// MOVE FILTERS TO TOOLBAR
			if (th.textContent == self.headerRow[self.colConditions[i]]) {
				var toolbarTable = document.getElementById(self.controlName + "_" + self.query + "_toolbar");
				th.hidden = false;
				if (toolbarTable.rows[0])
					toolbarTable.rows[0].appendChild(th);
			}
			/////////////////////////////////////////////////// MOVE FILTERS TO TOOLBAR
		}

		this.getClassName = function (i, j) { /* decide odd/even class */
			return "even gx-pv-even-row";
		}

		this.setStyleValues = function (elem, styleValues) {
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
				var property = particularStyleSplit[0].replace(/^[\s]+/, '').replace(/[\s]+$/, '').replace(/[\s]{2,}/, ' '); //qv.util.trim(particularStyleSplit[0]);
				var value = particularStyleSplit[1].replace(/^[\s]+/, '').replace(/[\s]+$/, '').replace(/[\s]{2,}/, ' ');    //qv.util.trim(particularStyleSplit[1]);

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

		this.underRecursionStyle = [];
		this.applyFormatValues = function (th, value, columnNumber) { /* Format for dimensions ("header columns") */
			var columndatatype = self.columns[columnNumber].getAttribute("dataType");
			if (columndatatype == "date") {
				value = self.dimensionPictureValue(value, columnNumber)
			}
			//apply default format
			var defaultFormats = self.columns[columnNumber].getAttribute("format");
			if ((defaultFormats != null) && (defaultFormats != "")) {
				th = self.setStyleValues(th, defaultFormats);
			}
			//apply format value
			self.underRecursionStyle = [];
			for (var i = 0; i < self.formatValues.length; i++) {
				if (self.formatValues[i].columnNumber == columnNumber) { //a format for this column
					if (self.formatValues[i].value === value.trimpivot()) {
						th = self.setStyleValues(th, self.formatValues[i].format);
						if ((self.formatValues[i].recursive != undefined) && (self.formatValues[i].recursive == "yes")) {
							self.underRecursionStyle.push(self.formatValues[i]);
						}
					}
				}
			}
			var measureDataType = self.columns[columnNumber].getAttribute("dataType");
			//apply conditional values
			var equal = [];
			var notequal = [];
			var greaterThan = [];
			var greaterOrEqual = [];
			var lessThan = [];
			var lessOrEqual = [];
			var greaterOrEqual = [];
			var between = [];
			for (var i = 0; i < self.conditionalFormatsColumns.length; i++) {
				if (self.conditionalFormatsColumns[i].columnNumber == columnNumber) {
					if (self.conditionalFormatsColumns[i].operation1 == "equal") {
						if ((measureDataType === "real") || (measureDataType === "integer")) {
							equal[0] = parseFloat(self.conditionalFormatsColumns[i].value1);
						} else {
							equal[0] = self.conditionalFormatsColumns[i].value1
						}
						equal[1] = self.conditionalFormatsColumns[i].format;
					}
					if (self.conditionalFormatsColumns[i].operation1 == "notequal") {
						if ((measureDataType === "real") || (measureDataType === "integer")) {
							notequal[0] = parseFloat(self.conditionalFormatsColumns[i].value1);
						} else {
							notequal[0] = self.conditionalFormatsColumns[i].value1
						}
						notequal[1] = self.conditionalFormatsColumns[i].format;
					}
					if (self.conditionalFormatsColumns[i].operation1 == "less") {
						if ((measureDataType === "real") || (measureDataType === "integer")) {
							lessThan[0] = parseFloat(self.conditionalFormatsColumns[i].value1);
						} else {
							lessThan[0] = self.conditionalFormatsColumns[i].value1;
						}
						lessThan[1] = self.conditionalFormatsColumns[i].format;
					}
					if (self.conditionalFormatsColumns[i].operation1 == "greater") {
						if ((measureDataType === "real") || (measureDataType === "integer")) {
							greaterThan[0] = parseFloat(self.conditionalFormatsColumns[i].value1);
						} else {
							greaterThan[0] = self.conditionalFormatsColumns[i].value1;
						}
						greaterThan[1] = self.conditionalFormatsColumns[i].format;
					}
					if ((self.conditionalFormatsColumns[i].operation1 == "greaterequal") && (self.conditionalFormatsColumns[i].operation2 == undefined)) {
						if ((measureDataType === "real") || (measureDataType === "integer")) {
							greaterOrEqual[0] = parseFloat(self.conditionalFormatsColumns[i].value1);
						} else {
							greaterOrEqual[0] = self.conditionalFormatsColumns[i].value1;
						}
						greaterThan[1] = self.conditionalFormatsColumns[i].format;
					}
					if (self.conditionalFormatsColumns[i].operation1 == "lessequal") {
						if ((measureDataType === "real") || (measureDataType === "integer")) {
							lessOrEqual[0] = parseFloat(self.conditionalFormatsColumns[i].value1);
						} else {
							lessOrEqual[0] = self.conditionalFormatsColumns[i].value1
						}
						lessThan[1] = self.conditionalFormatsColumns[i].format;
					}
					if (self.conditionalFormatsColumns[i].operation2 && self.conditionalFormatsColumns[i].operation1 == "greaterequal") {  //when interval
						//greaterOrEqual = []
						if ((measureDataType === "real") || (measureDataType === "integer")) {
							between[0] = parseFloat(self.conditionalFormatsColumns[i].value1);
						} else {
							between[0] = self.conditionalFormatsColumns[i].value1;
						}
						if (self.conditionalFormatsColumns[i].operation2 && self.conditionalFormatsColumns[i].operation2 == "lessequal") {
							if ((measureDataType === "real") || (measureDataType === "integer")) {
								between[1] = parseFloat(self.conditionalFormatsColumns[i].value2);
							} else {
								between[1] = self.conditionalFormatsColumns[i].value2;
							}
							between[2] = self.conditionalFormatsColumns[i].format;
						}
					}
				}
			}

			var comparisons = new Array(3);

			th.style.textAlign = "start";
			if (measureDataType === "real") {
				th.style.textAlign = "start";
				value = parseFloat(value);
			}

			if (measureDataType === "integer") {

				th.style.textAlign = "right";
				value = parseInt(value);

			}

			if (measureDataType === "real") {
				th.style.textAlign = "end";
			}

			if (measureDataType != "date") {
				if ((equal[0] != undefined) && (value == equal[0])) {
					th = self.setStyleValues(th, equal[1]);
				}
				if ((notequal[0] != undefined) && (value != notequal[0])) {
					th = self.setStyleValues(th, notequal[1]);
				}
				if (((greaterThan[0] != undefined) && (value > greaterThan[0])) ||
					((greaterOrEqual[0] != undefined) && (value >= greaterOrEqual[0]))) {
					th = self.setStyleValues(th, greaterThan[1]);
				}
				if (((lessThan[0] != undefined) && (value < lessThan[0])) ||
					((lessOrEqual[0] != undefined) && (value <= lessOrEqual[0]))) {
					th = self.setStyleValues(th, lessThan[1]);
				}
				if ((between[0] != undefined && between[1] != undefined) && (value >= between[0] && value <= between[1])) {
					th = self.setStyleValues(th, between[2]);
				}
				return th;
			}


			if (measureDataType === "date") {
				th.style.textAlign = "right";
				var dates = value.split("-");
				if ((self.defaultPicture.getAttribute("dateFormat") != undefined) && (self.defaultPicture.getAttribute("dateFormat") != null)) {
					picture = self.defaultPicture.getAttribute("dateFormat").split("");
				}
				var dateElements = new Array(3);
				dateElements[0] = parseInt(dates[0]);
				dateElements[1] = parseInt(dates[1]);
				dateElements[2] = parseInt(dates[2]);


				if ((greaterThan[0] != undefined)) {
					var cmpar = greaterThan[0].split("-");
					var cmparElements = new Array(3);
					cmparElements[1] = parseInt(cmpar[1]);
					cmparElements[2] = parseInt(cmpar[2]);
					cmparElements[0] = parseInt(cmpar[0]);

					if ((cmparElements[0] < dateElements[0]) || ((cmparElements[0] <= dateElements[0]) && (cmparElements[1] < dateElements[1]))
						|| ((cmparElements[0] <= dateElements[0]) && (cmparElements[1] <= dateElements[1]) && (cmparElements[2] < dateElements[2]))) {
						th = self.setStyleValues(th, greaterThan[1]);
					}

				}


				if ((lessThan[0] != undefined)) {
					var cmpar = lessThan[0].split("-");
					cmparElements = new Array(3);
					cmparElements[1] = parseInt(cmpar[1]);
					cmparElements[2] = parseInt(cmpar[2]);
					cmparElements[0] = parseInt(cmpar[0]);

					if ((cmparElements[0] > dateElements[0]) || ((cmparElements[0] >= dateElements[0]) && (cmparElements[1] > dateElements[1]))
						|| ((cmparElements[0] >= dateElements[0]) && (cmparElements[1] >= dateElements[1]) && (cmparElements[2] > dateElements[2]))) {
						th = self.setStyleValues(th, lessThan[1]);
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
						th = self.setStyleValues(th, between[2]);
					}

				}

			}


			if (value > greaterThan[0]) {
				th = self.setStyleValues(th, greaterThan[1]);
			} else {
				if (value < lessThan[0]) {
					th = self.setStyleValues(th, lessThan[1]);
				} else {
					if (value >= between[0] && value <= between[1]) {
						th = self.setStyleValues(th, between[2]);
					}
				}
			}

			return th;
		}

		this.applyConditionalFormats = function (td, value, lastMEasure, measureNumber) { /* format for measures (row data) */
			if (measures.length > 0) {
				var defaultFormats;
				var measureDataType;
				if (lastMEasure) {
					measureNumber = measures.length - 1;
					measureDataType = measures[measures.length - 1].getAttribute("dataType");
					defaultFormats = measures[measures.length - 1].getAttribute("format");
				} else {
					measureDataType = measures[measureNumber].getAttribute("dataType");
					defaultFormats = measures[measureNumber].getAttribute("format");
				}

				//apply default format
				if ((defaultFormats != null) && (defaultFormats != "")) {
					td = self.setStyleValues(td, defaultFormats);
				}

				//apply format value
				for (var i = 0; i < self.formatValuesMeasures.length; i++) {
					if (self.formatValuesMeasures[i].columnNumber == measureNumber) { //a format for this column
						if (self.formatValuesMeasures[i].value === value) {
							td = self.setStyleValues(td, self.formatValuesMeasures[i].format);
						}
					}
				}

				if (self.underRecursionStyle) {
					for (var i = 0; i < self.underRecursionStyle.length; i++) {
						td = self.setStyleValues(td, self.underRecursionStyle[i].format);
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
				for (var i = 0; i < self.conditionalFormats.length; i++) {
					if (self.conditionalFormats[i].columnNumber == measureNumber) {
						if (self.conditionalFormats[i].operation1 == "equal") {
							if ((measureDataType === "real") || (measureDataType === "integer")) {
								equal[0] = parseFloat(self.conditionalFormats[i].value1);
							} else {
								equal[0] = self.conditionalFormats[i].value1
							}
							equal[1] = self.conditionalFormats[i].format;
						}
						if (self.conditionalFormats[i].operation1 == "notequal") {
							if ((measureDataType === "real") || (measureDataType === "integer")) {
								notequal[0] = parseFloat(self.conditionalFormats[i].value1);
							} else {
								notequal[0] = self.conditionalFormats[i].value1
							}
							notequal[1] = self.conditionalFormats[i].format;
						}
						if (self.conditionalFormats[i].operation1 == "less") {
							if ((measureDataType === "real") || (measureDataType === "integer")) {
								lessThan[0] = parseFloat(self.conditionalFormats[i].value1);
							} else {
								lessThan[0] = self.conditionalFormats[i].value1
							}
							lessThan[1] = self.conditionalFormats[i].format;
						}
						if ((self.conditionalFormats[i].operation1 == "lessequal") && (!self.conditionalFormats[i].operation2)) {
							if ((measureDataType === "real") || (measureDataType === "integer")) {
								lessOrEqual[0] = parseFloat(self.conditionalFormats[i].value1);
							} else {
								lessOrEqual[0] = self.conditionalFormats[i].value1
							}
							lessThan[1] = self.conditionalFormats[i].format;
						}
						if (self.conditionalFormats[i].operation1 == "greater") {
							if ((measureDataType === "real") || (measureDataType === "integer")) {
								greaterThan[0] = parseFloat(self.conditionalFormats[i].value1);
							} else {
								greaterThan[0] = self.conditionalFormats[i].value1;
							}
							greaterThan[1] = self.conditionalFormats[i].format;
						}
						if ((self.conditionalFormats[i].operation1 == "greaterequal") && (!self.conditionalFormats[i].operation2)) {
							if ((measureDataType === "real") || (measureDataType === "integer")) {
								greaterOrEqual[0] = parseFloat(self.conditionalFormats[i].value1);
							} else {
								greaterOrEqual[0] = self.conditionalFormats[i].value1;
							}
							greaterThan[1] = self.conditionalFormats[i].format;
						}
						if (self.conditionalFormats[i].operation2 && self.conditionalFormats[i].operation1 == "greaterequal") {  //when interval
							//greaterOrEqual = []
							if ((measureDataType === "real") || (measureDataType === "integer")) {
								between[0] = parseFloat(self.conditionalFormats[i].value1);
							} else {
								between[0] = self.conditionalFormats[i].value1;
							}
							if (self.conditionalFormats[i].operation2 && self.conditionalFormats[i].operation2 == "lessequal") {
								if ((measureDataType === "real") || (measureDataType === "integer")) {
									between[1] = parseFloat(self.conditionalFormats[i].value2);
								} else {
									between[1] = self.conditionalFormats[i].value2;
								}
								between[2] = self.conditionalFormats[i].format;
							}
						}
					}
				}

				if (measureDataType != "date") {
					if ((equal[0] != undefined) && (value == equal[0])) {
						td = self.setStyleValues(td, equal[1]);
					}
					if ((notequal[0] != undefined) && (value != notequal[0])) {
						td = self.setStyleValues(td, notequal[1]);
					}
					if (((greaterThan[0] != undefined) && (value > greaterThan[0])) ||
						((greaterOrEqual[0] != undefined) && (value >= greaterOrEqual[0]))) {
						td = self.setStyleValues(td, greaterThan[1]);
					}
					if (((lessThan[0] != undefined) && (value < lessThan[0])) ||
						((lessOrEqual[0] != undefined) && (value <= lessOrEqual[0]))) {
						td = self.setStyleValues(td, lessThan[1]);
					}
					if ((between[0] != undefined && between[1] != undefined) && (value >= between[0] && value <= between[1])) {
						td = self.setStyleValues(td, between[2]);
					}
				}

				if (measureDataType === "date") {
					var dates = value.split("-");
					if ((self.defaultPicture.getAttribute("dateFormat") != undefined) && (self.defaultPicture.getAttribute("dateFormat") != null)) {
						picture = self.defaultPicture.getAttribute("dateFormat").split("");
					}
					var dateElements = new Array(3);
					dateElements[0] = parseInt(dates[0]);
					dateElements[1] = parseInt(dates[1]);
					dateElements[2] = parseInt(dates[2]);
					//for (var i=0; i<=2; i++ ){
					//if (picture[i] != undefined){
					//	if (picture[i] === "M") dateElements[1] = parseInt(dates[1]);
					//	if (picture[i] === "D") dateElements[2] = parseInt(dates[2]);
					//	if (picture[i] === "Y") dateElements[0] = parseInt(dates[0]);
					//} //falta el caso en que no hay picture por defecto
					//}
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
									td = self.setStyleValues(td, equal[1]);
								else if (greaterThan[1] != undefined)
									td = self.setStyleValues(td, greaterThan[1]);
								else if (lessThan[1] != undefined)
									td = self.setStyleValues(td, lessThan[1]);
							}

						}

						if ((notequal[0] != undefined)) {
							var cmpar = notequal[0].split("-");
							var cmparElements = new Array(3);
							cmparElements[1] = parseInt(cmpar[1]);
							cmparElements[2] = parseInt(cmpar[2]);
							cmparElements[0] = parseInt(cmpar[0]);

							if ((cmparElements[0] != dateElements[0]) || ((cmparElements[0] != dateElements[0]) && (cmparElements[1] != dateElements[1]))) {
								td = self.setStyleValues(td, notequal[1]);
							}

						}

						if ((greaterThan[0] != undefined) || (greaterOrEqual[0] != undefined)) {
							var cmpar;
							if (greaterThan[0].split("-") != undefined) {
								cmpar = greaterThan[0].split("-");
							} else {
								cmpar = greaterOrEqual[0].split("-");
							}
							var cmparElements = new Array(3);
							cmparElements[1] = parseInt(cmpar[1]);
							cmparElements[2] = parseInt(cmpar[2]);
							cmparElements[0] = parseInt(cmpar[0]);

							if ((cmparElements[0] < dateElements[0]) || ((cmparElements[0] <= dateElements[0]) && (cmparElements[1] < dateElements[1]))
								|| ((cmparElements[0] <= dateElements[0]) && (cmparElements[1] <= dateElements[1]) && (cmparElements[2] < dateElements[2]))) {
								td = self.setStyleValues(td, greaterThan[1]);
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
								td = self.setStyleValues(td, lessThan[1]);
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
								td = self.setStyleValues(td, between[2]);
							}

						}

					} catch (ERROR) {

					}
				}



			}
			return td;

		}

		this.dimensionPictureValue = function (value, dimensionNumber) {  //Picture for dimensions values
			if (value == "#NuN#") {
				var defaultNull = self.defaultPicture.getAttribute("textForNullValues");
				if (defaultNull != undefined) {
					return defaultNull;
				}
				return "";
			}
			var result = "";
			var dat
			var customPicture;

			dat = self.columns[dimensionNumber].getAttribute("dataType");
			customPicture = self.columns[dimensionNumber].getAttribute("picture");
			var newValue = OAT.ApplyPictureValue(value, dat, self.defaultPicture, customPicture);

			return newValue;
		}

		this.getMeasureNumber = function (dataField, measures) {
			for (var mI = 0; mI < measures.length; mI++) {
				if (measures[mI].getAttribute("dataField") == dataField) {
					return mI;
				}
			}
		}

		this.getMeasureName = function (dataField, measures) {
			for (var mI = 0; mI < measures.length; mI++) {
				if (measures[mI].getAttribute("dataField") == dataField) {
					return measures[mI].getAttribute("displayName");
				}
			}
		}

		this.defaultPictureValue = function (value, lastMEasure, measureNumber) { //Picture for measures values
			if (value == "#NuN#") {
				var defaultNull = self.defaultPicture.getAttribute("textForNullValues");
				if (defaultNull != undefined) {
					return defaultNull;
				}
				return "";
			}
			if ((value == "#NaV#") || (isNaN(value))) {
				return "-"
			}
			var result = "";
			var dat
			var customPicture;

			if (measures.length > 0) {
				if (lastMEasure) {
					dat = measures[measures.length - 1].getAttribute("dataType");
					customPicture = measures[measures.length - 1].getAttribute("picture");
				} else {
					dat = measures[measureNumber].getAttribute("dataType");
					customPicture = measures[measureNumber].getAttribute("picture");
				}
				var newValue = OAT.ApplyPictureValue(value, dat, self.defaultPicture, customPicture);
				return newValue;
			} else {
				return value;
			}
		}


		this.countedRows = 0;

		this.appendRowToTable = function (tbody, row, isTitleRow) {
			if ( (pageSize) && (!self.serverPagination)) {
				if (!isTitleRow) {
					self.countedRows++;
				}
				if (self.countedRows > pageSize) {
					row.style.display = "none";
				}
			}
			if ((self.serverPagination) && (self.ExportTo)) {
				if (!isTitleRow) {
					self.countedRows++;
				}
				if (self.countedRows > self.rowsPerPage) {
					row.style.display = "none";
				}
			}
			if (isTitleRow) {
				row.setAttribute("title_row", true);
			}

			
			tbody.appendChild(row);
		}

		this.drawTableWhenServerPagination = function () {
			OAT.Dom.clear(self.div);
			// START create toolbar table

			self.div.setAttribute("class", "conteiner_table_div");
			var myTable = OAT.Dom.create("table", {}, "");
			myTable.id = self.controlName + "_" + self.query + "_toolbar";
			var myTbody = OAT.Dom.create("tbody");
			var myRow = OAT.Dom.create("tr");
			self.div.appendChild(myTable);
			// END

			var table = OAT.Dom.create("table", {}, "pivot_table");
			table.id = this.controlName + "_" + this.query;
			//add control name and query name as the id of main table
			var tbody = OAT.Dom.create("tbody");
			
			self.drawTitleDiv();
			self.drawFilters();
			self.countedRows = 0;
			if (OAT.isIE()) {
				var divIeContainer = document.createElement("div");
				divIeContainer.setAttribute("class", "divIeContainer");
				self.div.appendChild(divIeContainer);
				OAT.Dom.append([table, tbody], [divIeContainer, table]);
				table.style.marginBottom = "0px";
			} else {
				OAT.Dom.append([table, tbody], [self.div, table]);
			}

			self.countedRows = 0;
			var firstRow;
			var firstRowTotalSpan = self.colConditions.length;
			if (self.colConditions.length > 0) {
				var i = 0;
				var tr = OAT.Dom.create("tr");
				self._drawRowConditionsHeadingsCustom(tr);
				// create a list of the dimension name, that are not pivot, with heigth span equal to   colConditions.length
				for (var ni = 0; ni < self.colConditions.length; ni++) {// creat a list of the dimension name, that are pivot as columns
					tr = self._drawColConditionsHeadingsCustom(tr, ni, (ni === self.colConditions.length - 1));
				}
				//tr.setAttribute("title_row", true);
				self.appendRowToTable(tbody, tr, true);//tbody.appendChild(tr);
				firstRow = tr;
			}
			try {

				for (var i = 0; i < self.colConditions.length; i++) { //show columns particular values
					var tr = OAT.Dom.create("tr");


					var j = 0
					while (j < self.pageData.columnsHeaders.length) {


						var h;
						if ((!self.pageData.columnsHeaders[j].subTotal)) {
							h = j;
							var colSpan = 1;
							var columnValue = (self.pageData.columnsHeaders[j].subHeaders.length > i) ? self.pageData.columnsHeaders[j].subHeaders[i].value : "";
							while ((j + 1 < self.pageData.columnsHeaders.length)
								&& ((!self.pageData.columnsHeaders[j + 1].subTotal) || (i < self.pageData.columnsHeaders[j + 1].subHeaders.length - 1))
								&& ((self.pageData.columnsHeaders[j + 1].subHeaders.length > i) && (self.pageData.columnsHeaders[j + 1].subHeaders[i].value == columnValue))) {
								colSpan++;
								j++;
							}
							j++;


							var th = OAT.Dom.create("th", {}, "even gx-pv-even-row");
							th.colSpan = colSpan;
							OAT.addTextNode(th, self.dimensionPictureValue(columnValue.trimpivot(), self.colConditions[i]))
							
							self.setClickEventHandlers(th, columnValue, "DIMENSION", self.colConditions[i], { axis: "columns", columnnumber: h, columndimension: self.pageData.columnsHeaders[h], rownumber: i });
							
							th = self.applyFormatValues(th, columnValue.trimpivot(), self.colConditions[i]);
							tr.appendChild(th);
						} else {
							var hiddenGrandTotal = (self.GrandTotalVisibility.TotalForColumns == "No" ) ? measures.length : 0;
							var isGrandTotal = (j >= (self.pageData.columnsHeaders.length - measures.length + hiddenGrandTotal))
							if (self.ShowMeasuresAsRows) {
								isGrandTotal = ((j >= (self.pageData.columnsHeaders.length - 1)) && (self.GrandTotalVisibility.TotalForColumns == "Yes" ))
							}
							if (isGrandTotal) {
								//Grand Total
								if (self.GrandTotalVisibility.TotalForColumns == "Yes"){
									if (i == 0) {
										var th = OAT.Dom.create("th", {}, "h2subtitle");
										OAT.addTextNode(th, self.translations.GXPL_QViewerJSTotal/*gx.getMessage("GXPL_QViewerJSTotal")*/)
										th.rowSpan = self.colConditions.length;
										if (!self.ShowMeasuresAsRows) {
											th.colSpan = measures.length;
										}
										tr.appendChild(th);
									}
								}
								if (!self.ShowMeasuresAsRows) {
									j = j + measures.length
								} else {
									j++;
								}
								
							} else {
								//subtotal columns
								if (i < self.pageData.columnsHeaders[j].subHeaders.length) {
									var th = OAT.Dom.create("th", {}, "h2subtitle ");

									var columnValue = (self.pageData.columnsHeaders[j].subHeaders.length > i) ? self.pageData.columnsHeaders[j].subHeaders[i].value : "";
									OAT.addTextNode(th, self.translations.GXPL_QViewerJSTotalFor/*gx.getMessage("GXPL_QViewerJSTotalFor")*/ + " " + self.dimensionPictureValue(columnValue.trimpivot(), self.colConditions[i] ))
									self.setClickEventHandlers(th, self.translations.GXPL_QViewerJSTotalFor/*gx.getMessage("GXPL_QViewerJSTotalFor")*/ + " " + self.dimensionPictureValue(columnValue.trimpivot(), self.colConditions[i] ),
															 "DIMENSION", self.colConditions[i], ['PtrTotals', columnValue, "", h, "columns", i]);
									th.rowSpan = self.colConditions.length - i;
									if (!self.ShowMeasuresAsRows) {
										th.colSpan = measures.length;
									}
									tr.appendChild(th);
								}

								if (!self.ShowMeasuresAsRows) {
									j = j + measures.length
								} else {
									j++;
								}
							}
						}
					}
					self.appendRowToTable(tbody, tr, true);
				}

				if (self.colConditions.length > 0) {
					if (self.pageData.columnsHeaders.length - self.colConditions.length > 0) { //fill first row
						var th = OAT.Dom.create("th", {}, "h2subtitle ");
						OAT.addTextNode(th, "")
						th.colSpan = self.pageData.columnsHeaders.length - self.colConditions.length
						th.style.borderLeftColor = "transparent";
						firstRow.appendChild(th);
					}

					//add a column only with the name of  measures
					if (!self.ShowMeasuresAsRows) {
						var tr = OAT.Dom.create("tr");
						var repeticiones = (self.pageData.columnsHeaders.length / measures.length)
						for (var j = 0; j < repeticiones; j++) {
							for (var m = 0; m < measures.length; m++) {
								var th = OAT.Dom.create("th", {}, "h2titlewhite");
								th.colSpan = 1;
								OAT.addTextNode(th, measures[m].attributes.getNamedItem("displayName").nodeValue)
								self.setTitleTexrtAlign(th, th.textContent);
								tr.appendChild(th);
							}
						}
						self.appendRowToTable(tbody, tr, true);
					}
					//end of column only with the name of  measures
				}



				// first connector
				if ((self.rowConditions.length && self.options.headingBefore) && (self.colConditions.length === 0)) {
					self._drawRowConditionsHeadings(tbody);
				} else if ((self.rowConditions.length == 0) && (self.options.headingBefore) && (self.colConditions.length === 0)) {
					try {
						self._drawRowConditionsHeadings(tbody);
					} catch (Error) { }
				}

				var several_totals = measures.length > 1;
				var colSpan;
				if (several_totals) {
					colSpan = self.rowConditions.length - (measures.length - 1);
				} else {
					colSpan = self.rowConditions.length;
				}
				if (self.colConditions.length > 0) self.underRecursionStyle = [];

				var lineaEnBlanco = false;
				var skipRow = false;
				//for all rows
				for (var i = 0; i < self.pageData.rows.length; i++) {

					var tr = OAT.Dom.create("tr");
					var row = self.pageData.rows[i];
					// row header values
					for (var j = 0; j < row.headers.length; j++) {
						//add collapse image option
						var item = row.headers[j]

						if (item.rowSpan > 0) {
							var th = OAT.Dom.create("th", {}, "even gx-pv-even-row");

							th.rowSpan = item.rowSpan

							OAT.addTextNode(th, self.dimensionPictureValue(item.value.trimpivot(), self.rowConditions[j]))
							//picture for columns
							th = self.applyFormatValues(th, item.value, self.rowConditions[j]);
							//format for columns 
							//event handlers
							self.setClickEventHandlers(th, item.value, "DIMENSION", self.rowConditions[j], { cell: j, row: row });
							if ((j < self.rowConditions.length - (measures.length - 1) - 1) && (!self.ShowMeasuresAsRows)) {
								var itemCollapsed = (self.conditions[self.rowConditions[j]].collapsedValues.indexOf(item.value) != -1)
								th = self.addExpandCollapseFunctionality(th, item, j, !itemCollapsed, true);
							}
							lineaEnBlanco = false;
							tr.appendChild(th);
						}

					}

					//add blank spaces when row is collapsed
					if (row.headers.length < self.rowConditions.length - (measures.length - 1)) {
						var collapsedCells = self.rowConditions.length - (measures.length - 1) - row.headers.length;
						for (var cc = 0; cc < collapsedCells; cc++) {
							var th = OAT.Dom.create("th", {}, "even gx-pv-even-row");
							OAT.addTextNode(th, "")
							tr.appendChild(th);
						}
					}

					// blank space before
					if ((self.rowConditions.length - (measures.length - 1) == 0) && (i > 0) && (measures.length > 0)) {
						lineaEnBlanco = true;
					}

					if (self.ShowMeasuresAsRows) {
						// add cell with measure name 
						var td = OAT.Dom.create("td", {}, "even gx-pv-even-row");

						var measureTitle = self.getMeasureName(row.dataField, measures);
						OAT.addTextNode(td, measureTitle)
						td.style.textAlign = "start"
						self.setClickEventHandlers(td, measureTitle, "MEASURE", getMeasureNumberByName(measureTitle, measures), "GrandTotal");

						tr.appendChild(td);
						// end cell with measure name 
					}

					// initial "crude data" part of a row, only the data of the measures shows in one column
					var mesauresList = new Array();

					var measureslength = measures.length;
					if (measureslength === 0) {
						measureslength = 1;
					}

					if (!row.subTotal) { //value cells
						for (var ji = 0; ji < row.cells.length; ji++) {
							var value = row.cells[ji].value;

							if ((self.colConditions.length > 0) && (self.pageData.columnsHeaders[ji].subTotal)) { //subtotal or total column
								var td = OAT.Dom.create("td", {}, "subtotal");

								if (value != self.EmptyValue) {
									var mN = self.getMeasureNumber(row.cells[ji].dataField, measures);

									OAT.addTextNode(td, self.defaultPictureValue(value, false, mN))
									td = self.applyConditionalFormats(td, value, false, mN);
									self.setClickEventHandlers(td, value, "MEASURE", mN, ['PtrTotals', value, row, ji]);
								} else {
									OAT.addTextNode(td, "")
								}
								tr.appendChild(td);
							} else { //normal crude data
								var td = OAT.Dom.create("td", {}, "even gx-pv-even-row");

								if (value != self.EmptyValue) {
									var mN = self.getMeasureNumber(row.cells[ji].dataField, measures);

									OAT.addTextNode(td, self.defaultPictureValue(value, false, mN))
									td = self.applyConditionalFormats(td, value, false, mN);
									self.setClickEventHandlers(td, value, "MEASURE", mN, { cell: ji, row: row });
								} else {
									OAT.addTextNode(td, "")
								}
								tr.appendChild(td);
							}
						}
					} else {
						//subtotal or total row
						var tr = OAT.Dom.create("tr");

						if (row.headers.length == 0) {
							//grand Total
							if (self.GrandTotalVisibility.TotalForRows != "Yes") { 
								skipRow = true
							} else {	
								var th = OAT.Dom.create("th", {}, "h2subtitle grandtotaltitle");
								OAT.addTextNode(th, self.translations.GXPL_QViewerJSTotal /*gx.getMessage("GXPL_QViewerJSTotal")*/)
								th.colSpan = colSpan;
								if (self.ShowMeasuresAsRows) {
									if (row.rowSpan > 0) {
										th.rowSpan = row.rowSpan
										tr.appendChild(th);
									}
								} else {
									tr.appendChild(th);
								}
							}
							
						} else {
							//sub total
							if (i == 0) {//append header, not totalized, only for firsr row
								for (var h = 0; h < row.headers.length - 1; h++) {
									var item = row.headers[h]
									var th = OAT.Dom.create("th", {}, "even gx-pv-even-row");
									th.rowSpan = item.rowSpan
									OAT.addTextNode(th, self.dimensionPictureValue(item.value.trimpivot(), self.rowConditions[h]))
									th = self.applyFormatValues(th, item.value, self.rowConditions[h]);
									self.setClickEventHandlers(th, item.value, "DIMENSION", self.rowConditions[h], { cell: h, row: row, isTotal: false });
									tr.appendChild(th);
								}
							}

							var subtitleClass = (row.headers.length == 1) ? "subtitleFirstLevel" : "";


							var th = OAT.Dom.create("th", {}, "h2subtitle " + subtitleClass);
							th.colSpan = colSpan - (row.headers.length - 1);
							var value = row.headers[row.headers.length - 1].value.trimpivot()
							if (value == "#NuN#") {
								OAT.addTextNode(th, self.translations.GXPL_QViewerJSTotalFor/*gx.getMessage("GXPL_QViewerJSTotalFor")*/ + " " + self.defaultPicture.getAttribute("textForNullValues"))
							} else {
								OAT.addTextNode(th, self.translations.GXPL_QViewerJSTotalFor/*gx.getMessage("GXPL_QViewerJSTotalFor")*/ + " " +  self.dimensionPictureValue( OAT.Dom.fromSafeXML(value), self.rowConditions[row.headers.length - 1] ) )
							}
							self.setClickEventHandlers(th, self.translations.GXPL_QViewerJSTotalFor + " " + item.value, "DIMENSION", getMeasureNumberByDataField(item.dataField, columns), ['PtrTotals', value, row, -1]);
							if (self.ShowMeasuresAsRows) {
								if (row.rowSpan > 0) {
									th.rowSpan = row.rowSpan
									tr.appendChild(th);
								}
							} else {
								tr.appendChild(th);
							}
						}

						if (self.ShowMeasuresAsRows) {
							// add cell with measure name
							var valueClass = (row.headers.length == 0) ? "grandtotalvalue" : (row.headers.length == 1) ? "firstlevelvalue" : "";

							var td = OAT.Dom.create("td", {}, "gtotal " + valueClass);

							var measureTitle = self.getMeasureName(row.dataField, measures);
							OAT.addTextNode(td, measureTitle)
							td.style.textAlign = "start"

							tr.appendChild(td);
							// end cell with measure names
						}

						for (var ind = 0; ind < row.cells.length; ind++) {
							var value = row.cells[ind].value;

							var mN = self.getMeasureNumber(row.cells[ind].dataField, measures);

							var valueClass = (row.headers.length == 0) ? "grandtotalvalue" : (row.headers.length == 1) ? "firstlevelvalue" : "";

							var td = OAT.Dom.create("td", {}, "gtotal " + valueClass);
							OAT.addTextNode(td, self.defaultPictureValue(value, false, mN))
							if ((row.headers.length == 0) && (self.colConditions.length == 0)) {
								self.underRecursionStyle = [];
								td = self.applyConditionalFormats(td, value, false, mN);
								self.setClickEventHandlers(td, value, "MEASURE", mN, 'GrandTotal');
							} else {
								td = self.applyConditionalFormats(td, value, false, mN);
								self.setClickEventHandlers(td, value, "MEASURE", mN, ['PtrTotals', value, row, ind]);
							}
							tr.appendChild(td);
						}
					}

					if (!skipRow)
						self.appendRowToTable(tbody, tr, false);
					if (self.colConditions.length > 0) self.underRecursionStyle = [];					
					
				} // for each row

			} catch (ERROR) {
				//alert(ERROR);
			}



		} /* drawTableWhenServerPagination */



		this.drawTableWhenShowMeasuresAsRows = function () {
			OAT.Dom.clear(self.div);
			// START create toolbar table

			self.div.setAttribute("class", "conteiner_table_div");
			var myTable = OAT.Dom.create("table", {}, "");
			myTable.id = self.controlName + "_" + self.query + "_toolbar";
			var myTbody = OAT.Dom.create("tbody");
			var myRow = OAT.Dom.create("tr");
			self.div.appendChild(myTable);
			// END

			var table = OAT.Dom.create("table", {}, "pivot_table");
			table.id = this.controlName + "_" + this.query;
			//add control name and query name as the id of main table
			var tbody = OAT.Dom.create("tbody");
			
			self.drawTitleDiv();
			self.drawFilters();
			self.countedRows = 0;
			if (OAT.isIE()) {
				var divIeContainer = document.createElement("div");
				divIeContainer.setAttribute("class", "divIeContainer");
				self.div.appendChild(divIeContainer);
				OAT.Dom.append([table, tbody], [divIeContainer, table]);
				table.style.marginBottom = "0px";
			} else {
				OAT.Dom.append([table, tbody], [self.div, table]);
			}

			if ((self.autoPaging) && (self.allData.length < self.filteredData.length) && (self.colPointers.length > 1)) {
				self.allData = self.filteredData;
			} else if ((self.autoPaging) && (self.filteredData.length > self.allData.length) && (self.colPointers.length === 0)) {
				self.filteredData = self.allData;
			}

			var firstRow;
			var firstRowTotalSpan = self.colConditions.length;
			if (self.colConditions.length > 0) {
				var i = 0;
				var tr = OAT.Dom.create("tr");
				self._drawRowConditionsHeadingsCustom(tr);
				// create a list of the dimension name, that are not pivot, with heigth span equal to   colConditions.length
				for (var ni = 0; ni < self.colConditions.length; ni++) {// creat a list of the dimension name, that are pivot as columns
					tr = self._drawColConditionsHeadingsCustom(tr, ni, (ni === self.colConditions.length - 1));
				}
				tr.setAttribute("title_row", true);
				//tbody.appendChild(tr);
				self.appendRowToTable(tbody, tr, true);
				firstRow = tr;
			}
			try {
				var _mtotalSpan = 0 - firstRowTotalSpan;
				var collapsedColInfo = [false, 0, 0] //firts son of a collapsed parent, the collapsed parent, total hidden 
				var columnsDataHide = []
				var columnsDataHideFillWithBlanck = []
				var td_temp_forCollapseInfo = false;
				var td_collection_forCollapseInfo = [];
				for (var i = 0; i < measures.length; i++) {
					td_collection_forCollapseInfo[i] = false;
				}

				for (var i = 0; i < self.colConditions.length; i++) {
					var tr = OAT.Dom.create("tr");

					var stack = self.colPointers[i];
					var drawColumn = 0; //number of actual column being draw 
					for (var j = 0; j < stack.length; j++) {//column values here the diferents values of the pivoted dimensions
						var item = stack[j];
						var th = OAT.Dom.create("th", {}, "even gx-pv-even-row");
						if (item.span === 0)
							item.span = 1;
						th.colSpan = item.span/* * (measures.length-1); */
						if (i == 0) {
							if (item.span === 0) {//calc for the span of the top right blanck cell
								_mtotalSpan++;
							} else {
								_mtotalSpan = _mtotalSpan + (item.span * measures.length);
							}
						}
						OAT.addTextNode(th, self.dimensionPictureValue(item.value, self.colConditions[i]))

						th = self.applyFormatValues(th, item.value, self.colConditions[i]);


						//find if some parent of the item is collapsed
						var tempItem = item;
						var hide = false;
						var blankcell = false;
						while (tempItem.parent) {
							if (tempItem.parent.collapsed == undefined) {
								collapsedColInfo[0] = false;
								break;
							}
							if (tempItem.parent.collapsed) {
								if ((!collapsedColInfo[0]) || (tempItem.parent != collapsedColInfo[1])) {
									blankcell = true;
									if (i == self.colConditions.length - 1) {
										columnsDataHideFillWithBlanck.push(j);
									}
								} else {
									collapsedColInfo[2]++;
								}
								if ((i == self.colConditions.length - 1) && (!blankcell)) //the last col conditions
								{
									columnsDataHide.push(j);
								}
								collapsedColInfo[0] = true;
								collapsedColInfo[1] = tempItem.parent;
								OAT.addTextNode(th, "")
								hide = true;
								th.colSpan = 1;
								break;
							} else {
								tempItem = tempItem.parent;
							}
						}

						if ((!hide) || (blankcell)) { //when no hide or when collapse add one column blank cells
							tr.appendChild(th);
						}


						//advance the column counter
						drawColumn = drawColumn + item.span * measures.length
					}
					if ((self.options.totals && i == 0) && (self.GrandTotalVisibility.TotalForColumns == "Yes"))  {
						var th = OAT.Dom.create("th", {}, "h2subtitle");
						OAT.addTextNode(th, self.translations.GXPL_QViewerJSTotal /*gx.getMessage("GXPL_QViewerJSTotal")*/)
						//"TOTAL" gran total
						th.rowSpan = self.colConditions.length;
						if (self.colConditions.length > 0) {
							th.colSpan = measures.length;
							_mtotalSpan = _mtotalSpan + self.colConditions.length + (measures.length - 1)
						} else {
							_mtotalSpan = _mtotalSpan + self.colConditions.length
						}
						totalSpan = self.colConditions.length
						tr.appendChild(th);
					}
					if (self.options.headingAfter) {// column headings after
						self._drawColConditionsHeadings(tr, i);
					}
					tr.setAttribute("title_row", true);
					//tbody.appendChild(tr);
					self.appendRowToTable(tbody, tr, true);
				}


				if (_mtotalSpan > 2) {
					var th = OAT.Dom.create("th", {}, "h2subtitle ");
					OAT.addTextNode(th, "")
					if (_mtotalSpan < 1000) {
						th.colSpan = _mtotalSpan;
					}
					th.style.borderLeftColor = "transparent";
					firstRow.appendChild(th);
				}

				/* first connector */
				if ((self.rowConditions.length && self.options.headingBefore) && (self.colConditions.length === 0)) {
					self._drawRowConditionsHeadings(tbody);
				}

				var several_totals = measures.length > 1;
				var colSpan;
				if (several_totals) {
					colSpan = self.rowConditions.length - (measures.length - 1);
				} else {
					colSpan = self.rowConditions.length;
				}

				var collapsedInfo = [false, 9999, true, 0]
				//[working under collapse item, row condition of the collapse item, first row of collapses rows, actual row condition]
				var subtotalsmeasuresList = []; for (var l = 0; l < measures.length; l++) { subtotalsmeasuresList[l] = []; subtotalsmeasuresList[l][0] = []; }
				/* store values to show in the grandTotal row */
				var grandtotalsmeasuresList = []; for (var l = 0; l < measures.length; l++) { grandtotalsmeasuresList[l] = []; grandtotalsmeasuresList[l][0] = []; }

				var searchIn = []; for (var l = 0; l < self.recordForFormula.length; l++) { searchIn[l] = self.recordForFormula[l]; }
				var searchVal = [];
				if (self.colConditions.length > 0) {
					searchVal = []; for (var l = 0; l < self.allData.length; l++) { searchVal[l] = self.allData[l]; }
				}
				var rowsPositions = [];
				for (var i = 0; i < self.h; i++) {
					//actualColumnIndex = 0;
					var tr = OAT.Dom.create("tr");
					if (self.rowConditions.length) {
						var dim = self.rowConditions.length - (measures.length - 1)
						var item = self.rowPointers[dim][i];
						/* stack has number of values equal to height of table */
						var ptrArray = [];
						var ptr = item;
						while (ptr.parent) {
							ptrArray.unshift(ptr);
							ptr = ptr.parent;
						}
					} else {
						var ptrArray = [self.rowPointers[0][0]];
					}

					var firstCellPositionOfthisRow = -1//the column number where is draw the cell of this row

					for (var j = 0; j < self.rowConditions.length - (measures.length - 1); j++) {/* row header values */
						var item = ptrArray[j];
						if ((item != undefined) && (item.offset == i)) {
							if (firstCellPositionOfthisRow == -1) {
								firstCellPositionOfthisRow = j
							}
							//add collapse image option
							var itemCollapsed = (self.conditions[self.rowConditions[j]].collapsedValues.indexOf(item.value) != -1);
							if (j >= (self.rowConditions.length - (measures.length - 1) - 1)) {
								itemCollapsed = false;
							}

							var th = OAT.Dom.create("th", {}, "even gx-pv-even-row");
							if ((!collapsedInfo[0]) || (collapsedInfo[1] >= j)) {//if the line is not collapsed
								th.rowSpan = ptrArray[j].span;
								OAT.addTextNode(th, self.dimensionPictureValue(item.value, self.rowConditions[j]))
								/* picture for columns */
								th = self.applyFormatValues(th, item.value, self.rowConditions[j]);
								/* format  for columns */
								self.setClickEventHandlers(th, item.value, "DIMENSION", self.rowConditions[j], item);

							} else {
								th.rowSpan = 1;
								OAT.addTextNode(th, "")
								/* picture for columns */
							}

							if (collapsedInfo[1] >= j) {
								collapsedInfo[0] = itemCollapsed;
								collapsedInfo[3] = item;
								if (itemCollapsed) {
									collapsedInfo[1] = j;
								} else {
									collapsedInfo[1] = 9999;
								}
								collapsedInfo[2] = true;
							}


							tr.appendChild(th);
						}
					}
					/* blank space before */
					var measureslength = measures.length;
					if (measureslength === 0) {
						measureslength = 1;
					}

					/* add cell with measure name */
					var td = OAT.Dom.create("td", {}, "even gx-pv-even-row");
					var item = ptrArray[self.rowConditions.length - (measureslength - 1)];
					if (item.value != self.EmptyValue) {
						if (!collapsedInfo[0]) {
							OAT.addTextNode(td, item.value)
							td.style.textAlign = "start"
							self.setClickEventHandlers(td, item.value, "MEASURE", getMeasureNumberByName(measureTitle, measures), "GrandTotal");
						}
					} else {
						OAT.addTextNode(td, "")
					}
					tr.appendChild(td);
					/* end cell with measure name */

					/* initial "crude data" part of a row, only the data of the measures shows in one column*/
					var mesauresList = new Array();
					/* store values to lateral total */
					var lateralMeasureList = [];
					/* add cell with measure value */
					var measureTitle = item.value;
					var measureNumber = getMeasureNumberByName(measureTitle, measures);
					if (self.colConditions.length == 0) {
						var itemMV = item.items[0];
						var td = OAT.Dom.create("td", {}, "even gx-pv-even-row");
						if (itemMV != self.EmptyValue) {
							if (!collapsedInfo[0]) {
								OAT.addTextNode(td, self.defaultPictureValue(itemMV.value, false, measureNumber))
								td = self.applyConditionalFormats(td, itemMV.value, false, measureNumber);

								//for total calculation
								self.setClickEventHandlers(td, itemMV.value, "MEASURE", measureNumber, [Math.floor(item.row / measures.length)]);
								if (self.formulaInfo.measureFormula[measureNumber].hasFormula) {
									var formulaRow = self.getFormulaRowByCoord(item, [], measureNumber, "MeasureInRows", searchIn);
									if (formulaRow != self.EmptyValue) {
										grandtotalsmeasuresList[measureNumber][0].push(formulaRow)
										subtotalsmeasuresList[measureNumber][0].push([formulaRow, -1])

									}
								} else {
									var saveValue = (itemMV.value != "#NuN#") ? parseFloat(itemMV.value) : "#NuN#";
									grandtotalsmeasuresList[measureNumber][0].push(saveValue)
									subtotalsmeasuresList[measureNumber][0].push([saveValue, -1])

								}
							}
						} else {
							OAT.addTextNode(td, "")
						}
						if (collapsedInfo[0] && (!td_collection_forCollapseInfo[ji])) {
							td_collection_forCollapseInfo[ji] = td;
						}

						mesauresList.push([[itemMV.value, [itemMV.row]]]);
						if (self.colConditions.length === 0) {
							tr.appendChild(td);
						}
						/* end add cell with measure value */
					} else {
						/* add cells with measures value */
						var colPointerNumber = self.colPointers.length - 1
						if (self.colPointers[self.colPointers.length - 1].length == 0) colPointerNumber--;
						if (self.colPointers[colPointerNumber] != undefined) {
							if (measureNumber == 0) {
								if ((rowsPositions.length > 0) && (!isNaN(rowsPositions[0]))) {
									searchVal.splice(rowsPositions[0], 1)
								}
								rowsPositions = [];
							}
							for (var j = 0; j < self.colPointers[colPointerNumber].length; j++) {
								var columnCoord = self.colPointers[colPointerNumber][j]
								var rowCoord = item


								var value
								if (measureNumber > 0) {
									try {
										if (rowsPositions[j] != self.EmptyValue) {
											value = [searchVal[rowsPositions[j]][self.headerRow.indexOf(measureTitle)], rowsPositions[j]]
										} else {
											value = self.EmptyValue;
										}
									} catch (Error) {
										var t;
									}
								} else {
									value = self.getMeasureValueCoord(rowCoord, columnCoord, self.headerRow.indexOf(measureTitle), searchVal);
									if ((value != self.EmptyValue) && (measureNumber == 0)) {
										rowsPositions.push(value[1]);
									} else if (measureNumber == 0) { rowsPositions.push(self.EmptyValue); }
								}
								var td = OAT.Dom.create("td", {}, "even gx-pv-even-row");
								if (value != self.EmptyValue) {
									OAT.addTextNode(td, self.defaultPictureValue(value[0], false, measureNumber))
									td = self.applyConditionalFormats(td, value[0], false, measureNumber);

									self.setClickEventHandlers(td, value[0], "MEASURE", measureNumber, [value[1]]);

									//for total calculation
									var subValue = parseFloat(value[0])
									if (value[0] == "#NuN#") { subValue = "#NuN#" }
									if (self.formulaInfo.measureFormula[measureNumber].hasFormula) {
										subValue = self.getFormulaRowByCoord(rowCoord, columnCoord, measureNumber, "MeasureInRows", searchIn);
										if (subValue == self.EmptyValue) { subValue = NaN }
									}

									if (grandtotalsmeasuresList[measureNumber][j] == undefined) {
										grandtotalsmeasuresList[measureNumber][j] = [subValue];
									} else {
										grandtotalsmeasuresList[measureNumber][j].push(subValue);
									}
									if (subtotalsmeasuresList[measureNumber][j] == undefined) {
										subtotalsmeasuresList[measureNumber][j] = [[subValue, -1]];
									} else {
										subtotalsmeasuresList[measureNumber][j].push([subValue, -1])
									}
									lateralMeasureList.push(subValue);

								} else {
									OAT.addTextNode(td, "")
									if (grandtotalsmeasuresList[measureNumber][j] == undefined) {
										grandtotalsmeasuresList[measureNumber][j] = [0];
									} else {
										grandtotalsmeasuresList[measureNumber][j].push(0);
									}
									if (subtotalsmeasuresList[measureNumber][j] == undefined) {
										subtotalsmeasuresList[measureNumber][j] = [[NaN, -1]];
									} else {
										subtotalsmeasuresList[measureNumber][j].push([NaN, -1])
									}
								}
								tr.appendChild(td);
							}
						}
						/* end cells with mwasures values*/
					}


					if (self.colConditions.length && i == 0 && self.options.headingAfter) {/* blank space after */
						var th = OAT.Dom.create("th");
						if (!self.rowConditions.length) {
							self._drawCorner(th, true);
							th.conditionIndex = -2;
						} else {
							th.style.border = "none";
						}
						th.rowSpan = self.rowStructure.span + (self.options.totals && self.rowConditions.length ? 1 : 0);
						tr.appendChild(th);
					}
					if (collapsedInfo[0] && !collapsedInfo[2]) {

					} else {
						self.appendRowToTable(tbody, tr, false);
						//tbody.appendChild(tr);
						collapsedInfo[2] = false;
					}

					var subTotalRowNumber = self.rowConditions.length - 2;
					if ((several_totals) && (self.rowConditions.length - 2 >= 0) && (ptrArray[self.rowConditions.length - 2] != undefined) && (ptrArray[self.rowConditions.length - 2].items != undefined) && (ptrArray[self.rowConditions.length - 2].items.length <= 1) && (self.colConditions.length <= 0)) {
						subTotalRowNumber = self.rowConditions.length - 2 - (measureslength - 1);
					}

					//add lateral total
					if ((self.options.totals && self.colConditions.length) && (self.GrandTotalVisibility.TotalForColumns == "Yes")) {
						var td = OAT.Dom.create("td", {}, "total");
						total_ = 0
						if (lateralMeasureList.length > 0) {
							if (self.formulaInfo.measureFormula[getMeasureNumberByName(measureTitle, measures)].hasFormula) {
								total_ = self.calculateFormulaTotal(lateralMeasureList, getMeasureNumberByName(measureTitle, measures), "MeasureInRows")
							} else {
								total_ = lateralMeasureList.reduce(function (a, b) { if (!isNaN(a) && !isNaN(b)) { return a + b } if (isNaN(a) && isNaN(b)) { return 0 } else if (isNaN(a)) { return b } else { return a; }; })
								if (isNaN(total_) && (total_ != "#NuN#") && (total_ != "#FoE#")) total_ = 0;
							}
						}
						if (total_ != 0) {
							OAT.addTextNode(td, self.defaultPictureValue(total_.toString(), false, getMeasureNumberByName(measureTitle, measures)))
							td = self.applyConditionalFormats(td, total_.toString(), false, getMeasureNumberByName(measureTitle, measures));
						} else {
							OAT.addTextNode(td, "")
						}
						tr.appendChild(td);
					}
					lateralMeasureList = [];
					//add subtotals row
					if (self.options.totals) {
						if (((self.rowConditions.length - (measures.length - 1)) > 1)) {
							var MaxDept = self.rowConditions.length - (measures.length - 1) - 2
							for (var relativeDim = MaxDept; relativeDim >= 0; relativeDim--) {
								var addSubTotal = false;
								//var relativeDim = 0 
								if (i + 1 < self.rowPointers[dim].length) {
									var itemTemp = self.rowPointers[dim][i + 1];
									var ptrArrayTemp = [];
									var ptrTemp = itemTemp;
									while (ptrTemp.parent) {
										ptrArrayTemp.unshift(ptrTemp);
										ptrTemp = ptrTemp.parent;
									}
									//var nexRowValue = ptrArrayTemp[relativeDim].value 
									//var actualValue = ptrArray[relativeDim].value
									//addSubTotal = (nexRowValue != actualValue) //if next value is different add subtotal
									for (var pDim = relativeDim; pDim >= 0; pDim--) {
										if (ptrArrayTemp[pDim].value != ptrArray[pDim].value) {
											addSubTotal = true;
										}
									}
								} else {
									addSubTotal = true
								}

								addSubTotal = addSubTotal && (self.conditions[self.rowConditions[relativeDim]].subtotals == 1)

								if (addSubTotal) {
									for (var sumM = 0; sumM < measures.length; sumM++) { //one row for each measures
										var tr = OAT.Dom.create("tr");

										if (sumM == 0) {
											var th = OAT.Dom.create("th", {}, "h2subtitle");
											th.colSpan = (self.rowConditions.length - (measures.length - 1)) - relativeDim;
											th.rowSpan = measures.length
											OAT.addTextNode(th, self.translations.GXPL_QViewerJSTotalFor + " " + ptrArray[relativeDim].value)
											tr.appendChild(th);
										}

										//add measure name
										var td = OAT.Dom.create("td", {}, "total");
										var value = measures[sumM].getAttribute("displayName");
										OAT.addTextNode(td, value)
										td.style.textAlign = "start"
										self.setClickEventHandlers(td, value, "MEASURE", sumM, "GrandTotal");
										tr.appendChild(td);

										//add sub total value
										if (self.colConditions.length == 0) {
											//add sub-total value
											var td = OAT.Dom.create("td", {}, "total");
											var valuesToOperate = []
											for (var vt = 0; vt < subtotalsmeasuresList[sumM][0].length; vt++) {
												if ((subtotalsmeasuresList[sumM][0][vt][1] == -1) || (subtotalsmeasuresList[sumM][0][vt][1] > relativeDim)) {
													if ((!isNaN(subtotalsmeasuresList[sumM][0][vt][0]) || (subtotalsmeasuresList[sumM][0][vt][0] == "#NuN#")) || self.formulaInfo.measureFormula[sumM].hasFormula) {
														valuesToOperate.push(subtotalsmeasuresList[sumM][0][vt][0])
														subtotalsmeasuresList[sumM][0][vt][1] = relativeDim
													}
												}
											}
											var total_ = 0
											if (valuesToOperate.length != 0) {
												if (self.formulaInfo.measureFormula[sumM].hasFormula) {
													total_ = self.calculateFormulaTotal(valuesToOperate, sumM, "MeasureInRows")
												} else {
													if (self.IsReduceNuN(valuesToOperate)) total_ = "#NuN#"; else
														total_ = valuesToOperate.reduce(function (a, b) { if (!isNaN(a) && !isNaN(b)) { return a + b } if (isNaN(a) && isNaN(b)) { return 0 } else if (isNaN(a)) { return b } else { return a; }; })
													if (isNaN(total_) && (total_ != "#NuN#") && (total_ != "#FoE#")) total_ = 0;
												}
											}
											lateralMeasureList.push(parseFloat(total_))
											if (total_ != 0) {
												OAT.addTextNode(td, self.defaultPictureValue(total_.toString(), false, sumM))
												td = self.applyConditionalFormats(td, total_.toString(), false, sumM);
											} else {
												OAT.addTextNode(td, "")
											}

											tr.appendChild(td);


										} else {
											//add sub-total values
											var colPointerNumber = self.colPointers.length - 1
											if (self.colPointers[self.colPointers.length - 1].length == 0) colPointerNumber--;
											if (self.colPointers[colPointerNumber] != undefined) {
												for (var cP = 0; cP < self.colPointers[colPointerNumber].length; cP++) {
													var td = OAT.Dom.create("td", {}, "total");
													var valuesToOperate = []
													for (var vt = 0; vt < subtotalsmeasuresList[sumM][cP].length; vt++) {
														if ((subtotalsmeasuresList[sumM][cP][vt][1] == -1) || (subtotalsmeasuresList[sumM][cP][vt][1] > relativeDim)) {
															if ((!isNaN(subtotalsmeasuresList[sumM][cP][vt][0])) || (subtotalsmeasuresList[sumM][cP][vt][0] == "#NuN#") || self.formulaInfo.measureFormula[sumM].hasFormula) {
																valuesToOperate.push(subtotalsmeasuresList[sumM][cP][vt][0])
																subtotalsmeasuresList[sumM][cP][vt][1] = relativeDim
															}
														}
													}
													var total_ = 0
													if (valuesToOperate.length != 0) {
														if (self.formulaInfo.measureFormula[sumM].hasFormula) {
															total_ = self.calculateFormulaTotal(valuesToOperate, sumM, "MeasureInRows")
														} else {
															if (self.IsReduceNuN(valuesToOperate)) total_ = "#NuN#"; else
																total_ = valuesToOperate.reduce(function (a, b) { if (!isNaN(a) && !isNaN(b)) { return a + b } if (isNaN(a) && isNaN(b)) { return 0 } else if (isNaN(a)) { return b } else { return a; }; })
															if (isNaN(total_) && (total_ != "#NuN#") && (total_ != "#FoE#")) total_ = 0;
														}
													}
													if ((total_ != 0) && ((!isNaN(total_)) || (total_ == "#NuN#") || (total_ == "#FoE#"))) {
														if (self.formulaInfo.measureFormula[sumM].hasFormula) {
															lateralMeasureList.push(valuesToOperate)
														} else {
															lateralMeasureList.push(parseFloat(total_))
														}
														OAT.addTextNode(td, self.defaultPictureValue(total_.toString(), false, sumM))
														td = self.applyConditionalFormats(td, total_.toString(), false, sumM);
													} else {
														OAT.addTextNode(td, "")
													}
													tr.appendChild(td);
												}
											}
											if ((self.colConditions.length) && (self.GrandTotalVisibility.TotalForColumns == "Yes")) { //add lateral total to this sub-total row
												var td = OAT.Dom.create("td", {}, "gtotal");
												var total_ = 0
												if (lateralMeasureList.length != 0) {
													if (self.formulaInfo.measureFormula[sumM].hasFormula) {
														total_ = self.calculateFormulaTotal(lateralMeasureList, sumM, "MeasureInRows")
													} else {
														if (self.IsReduceNuN(lateralMeasureList)) total_ = "#NuN#"; else
															total_ = lateralMeasureList.reduce(function (a, b) { if (!isNaN(a) && !isNaN(b)) { return a + b } if (isNaN(a) && isNaN(b)) { return 0 } else if (isNaN(a)) { return b } else { return a; }; })
													}
												}
												OAT.addTextNode(td, self.defaultPictureValue(total_.toString(), false, sumM))
												td = self.applyConditionalFormats(td, total_.toString(), false, sumM);
												tr.appendChild(td);
												lateralMeasureList = [];
											}
										}

										self.appendRowToTable(tbody, tr, false);
									}
								}
							}
						}
					}


				} /* for each row */



				/* code for the last row, GRAND TOTAL ROW */
				/* GRAND TOTAL ROW	*/
				if ((measures.length > 0) && ((self.rowConditions.length - measures.length + 1) > 0) && (self.GrandTotalVisibility.TotalForRows == "Yes") ) {

					if ((self.options.totals && self.rowConditions.length) && ((!self.autoPaging) || (self.TotalPagesPaging == self.actualPaginationPage) || (self.FilterByTopFilter))) {

						for (var m = 0; m < measures.length; m++) { //for every measure

							var tr = OAT.Dom.create("tr");

							if ((colSpan != 0) && (m == 0)) { //add grandTotal title cell
								var th = OAT.Dom.create("th", {}, "h2subtitle");
								OAT.addTextNode(th, self.translations.GXPL_QViewerJSTotal /*gx.getMessage("GXPL_QViewerJSTotal")*/)
								th.colSpan = colSpan;
								th.rowSpan = measures.length;
								tr.appendChild(th);
							}

							//add measure title cell
							var td = OAT.Dom.create("td", {}, "gtotal");
							var value = measures[m].getAttribute("displayName");
							if (value != self.EmptyValue) {
								OAT.addTextNode(td, value)
								td.style.textAlign = "start"
								self.setClickEventHandlers(td, value, "MEASURE", m, "GrandTotal");
							} else {
								OAT.addTextNode(td, "")
							}
							tr.appendChild(td);

							var lateralMeasureList = [];
							if (self.colConditions.length == 0) {
								//add grand total value
								var td = OAT.Dom.create("td", {}, "gtotal");
								var total_ = 0
								if (grandtotalsmeasuresList[m][0].length > 0) {
									if (self.formulaInfo.measureFormula[m].hasFormula) {
										total_ = self.calculateFormulaTotal(grandtotalsmeasuresList[m][0], m, "MeasureInRows")
									} else {
										if (self.IsReduceNuN(grandtotalsmeasuresList[m][0])) total_ = "#NuN#"; else
											total_ = grandtotalsmeasuresList[m][0].reduce(function (a, b) { if (!isNaN(a) && !isNaN(b)) { return a + b } if (isNaN(a) && isNaN(b)) { return 0 } else if (isNaN(a)) { return b } else { return a; }; })
									}
								}
								if (!isNaN(total_) || (total_ == "#NuN#") || (total_ == "#FoE#")) {
									OAT.addTextNode(td, self.defaultPictureValue(total_.toString(), false, m))
									td = self.applyConditionalFormats(td, total_.toString(), false, m);
								} else {
									OAT.addTextNode(td, "")
								}

								tr.appendChild(td);

								//lateralMeasureList.push(parseFloat(total_))
							} else {
								//add grand total values
								var colPointerNumber = self.colPointers.length - 1
								if (self.colPointers[self.colPointers.length - 1].length == 0) colPointerNumber--;
								if (self.colPointers[colPointerNumber] != undefined) {
									for (var j = 0; j < self.colPointers[colPointerNumber].length; j++) {
										var td = OAT.Dom.create("td", {}, "gtotal");
										var total_ = 0
										if ((grandtotalsmeasuresList[m][j] != undefined) && (grandtotalsmeasuresList[m][j].length > 0)) {
											if (self.formulaInfo.measureFormula[m].hasFormula) {
												total_ = self.calculateFormulaTotal(grandtotalsmeasuresList[m][j], m, "MeasureInRows")
											} else {
												if (self.IsReduceNuN(grandtotalsmeasuresList[m][j])) total_ = "#NuN#"; else
													total_ = grandtotalsmeasuresList[m][j].reduce(function (a, b) { if (!isNaN(a) && !isNaN(b)) { return a + b } if (isNaN(a) && isNaN(b)) { return 0 } else if (isNaN(a)) { return b } else { return a; }; })
											}
										}
										if (!isNaN(total_) || (total_ == "#NuN#") || (total_ == "#FoE#")) {
											OAT.addTextNode(td, self.defaultPictureValue(total_.toString(), false, m))
											td = self.applyConditionalFormats(td, total_.toString(), false, m);
										} else {
											OAT.addTextNode(td, "")
										}

										tr.appendChild(td);

										if (self.formulaInfo.measureFormula[m].hasFormula) {
											lateralMeasureList.push(grandtotalsmeasuresList[m][j])
										} else {
											if (!isNaN(total_)) {
												lateralMeasureList.push(parseFloat(total_))
											}
										}
									}
								}
							}

							//add lateral total to grand total
							if ((self.options.totals && self.colConditions.length) && (self.GrandTotalVisibility.TotalForColumns == "Yes") ) {
								var td = OAT.Dom.create("td", {}, "gtotal");
								var total_ = 0
								if (lateralMeasureList.length != 0) {
									if (self.formulaInfo.measureFormula[m].hasFormula) {
										total_ = self.calculateFormulaTotal(lateralMeasureList, m, "MeasureInRows")
									} else {
										if (self.IsReduceNuN(lateralMeasureList)) total_ = "#NuN#"; else
											total_ = lateralMeasureList.reduce(function (a, b) { if (!isNaN(a) && !isNaN(b)) { return a + b } if (isNaN(a) && isNaN(b)) { return 0 } else if (isNaN(a)) { return b } else { return a; }; })
									}
								}
								OAT.addTextNode(td, self.defaultPictureValue(total_.toString(), false, m))
								td = self.applyConditionalFormats(td, total_.toString(), false, m);
								tr.appendChild(td);
							}


							self.appendRowToTable(tbody, tr, false);
						}
					}


				}




			} catch (ERROR) {

			}

		} /* drawTableWhenShowMeasuresAsRows */


		this.IsReduceNuN = function (values) {
			isNuN = false;
			for (var vft = 0; vft < values.length; vft++) {
				if ((values[vft] != "#NuN#") && (values[vft] != 0)) {
					return false;
				}
				if (values[vft] == "#NuN#") isNuN = true;
			}
			return isNuN;
		}

		this.applyFilters = function () { /* create filteredData from allData */
			self.filteredData = [];
			for (var i = 0; i < self.allData.length; i++) {
				if (self.filterOK(self.allData[i])) { self.filteredData.push(self.allData[i]); }
			}
		}


		this.createTempDataStructForAggStepOptimization = function () {
			try {
				for (var row = 0; row < self.GeneralDataRows.length; row++) {
					for (var i = 0; i < self.GeneralDataRows[0].length; i++) {
						for (var j = 0; j < self.GeneralDataRows[0].length; j++) {
							if (self.TempDataStructForAggStepOptimization[self.GeneralDataRows[row][i]] == undefined) {
								self.TempDataStructForAggStepOptimization[self.GeneralDataRows[row][i]] = [];
							}
							self.TempDataStructForAggStepOptimization[self.GeneralDataRows[row][i]][self.GeneralDataRows[row][j]] = true;
						}
					}
				}
			} catch (error) {
				//alert(error)
			}
		}

		this.getMeasureValue = function (item, measureNumber, colDim) {
			var rowFromItem = [];
			var temp = item;
			var dimValues = [];

			var dimPosition = [];
			for (var i = 0; i < colDim.length - measures.length + 1; i++) {
				dimPosition[i] = colDim[colDim.length - measures.length + 1 - (i + 1)];
			}


			for (var i = 0; i < dimPosition.length; i++) {
				dimValues[dimPosition[i]] = temp.value;
				temp = temp.parent//temp.items
			}

			var value = ""
			var hallado = false
			var searchIn = self.allData
			if (self.filterIndexes.length > 0) { searchIn = self.filteredData }
			for (var i = 0; i < searchIn.length; i++) { //allData
				var coincide = false
				for (var j = 0; j < dimPosition.length; j++) {
					if (searchIn[i][dimPosition[j]] == dimValues[dimPosition[j]]) {
						coincide = true;
					} else {
						coincide = false;
						break;
					}
				}
				if (coincide) {
					value = searchIn[i][colDim.length + self.filterIndexes.length - measures.length + 1 + measureNumber];
					hallado = true
					break;
				}
			}
			if (hallado)
				return value;
			else
				return self.EmptyValue;

		}

		this.getMeasureValueCoord = function (rowsCoord, colCoord, measurePosition, searchVal) {
			var rowFromItem = [];
			var dimValues = [];

			var dimPosition = [];
			for (var i = 0; i < self.rowConditions.length - measures.length + 1; i++) {
				dimPosition[i] = self.rowConditions[self.rowConditions.length - measures.length + 1 - (i + 1)];
			}


			for (var i = self.colConditions.length - 1; i >= 0; i--) {
				dimValues[self.colConditions[i]] = colCoord.value;
				colCoord = colCoord.parent
			}
			var temp = rowsCoord.parent;
			for (var i = 0; i < dimPosition.length; i++) {
				dimValues[dimPosition[i]] = temp.value;
				temp = temp.parent//temp.items
			}

			var value = ""
			var hallado = false
			var numRow = 0
			var searchIn = searchVal

			for (var i = 0; i < searchIn.length; i++) {
				var coincide = false
				for (var j = 0; j < dimValues.length; j++) {
					if (searchIn[i][j] == dimValues[j]) {
						coincide = true;
					} else {
						if ((dimValues[j] == undefined) && (self.filterIndexes.length > 0)) {
							coincide = true;
						} else {
							coincide = false;
							break;
						}
					}
				}
				if (coincide) {
					value = searchIn[i][measurePosition];
					numRow = i;
					hallado = true;
					break;
				}
			}
			if (hallado) {
				return [value, numRow];
			} else
				return self.EmptyValue;
		}

		this.getFormulaRowByCoord = function (rowsCoord, colCoord, measureNumber, caseId, tosearch) {

			var rowFromItem = [];
			var dimValues = [];

			var dimPosition = [];
			for (var i = 0; i < self.rowConditions.length - measures.length + 1; i++) {
				dimPosition[i] = self.rowConditions[self.rowConditions.length - measures.length + 1 - (i + 1)];
			}

			if (colCoord) {
				for (var i = self.colConditions.length - 1; i >= 0; i--) {
					dimValues[self.colConditions[i]] = colCoord.value;
					colCoord = colCoord.parent
				}
			}
			var temp = rowsCoord.parent;
			for (var i = 0; i < dimPosition.length; i++) {
				dimValues[dimPosition[i]] = temp.value;
				temp = temp.parent//temp.items
			}

			for (var i = 0; i < self.filterIndexes.length; i++) {
				var s = self.filterDiv.selects[i];
				var val = OAT.$v(s)
				if (val == "[all]"/*""*/) {
					dimValues[self.filterIndexes[i]] = undefined
				} else {
					dimValues[self.filterIndexes[i]] = val
				}
			}

			var value = ""
			var hallado = false
			var numRow = 0
			if (tosearch != undefined) { searchIn = tosearch }
			else {
				var searchIn = self.recordForFormula
			}
			var coinciden = [];
			//if (self.filterIndexes.length > 0){ searchIn = self.filteredData }
			var addedValues = []; for (var o = 0; o < self.formulaInfo.recordDataLength; o++) { addedValues[o] = 0 }
			for (var i = 0; i < searchIn.length; i++) {
				var coincide = false
				for (var j = 0; j < dimValues.length; j++) {
					if (searchIn[i][j] == dimValues[j]) {
						coincide = true;
					} else {
						if ((dimValues[j] == undefined) && (self.filterIndexes.indexOf(j) != -1)) {
							coincide = true;
						} else {
							coincide = false;
							break;
						}
					}
				}
				if (coincide) {
					for (var t = 0; t < self.formulaInfo.measureFormula[measureNumber].relatedMeasures.length; t++) {
						var pos = self.formulaInfo.measureFormula[measureNumber].relatedMeasures[t]
						if (searchIn[i][pos] == undefined) {
							if (addedValues[pos] == 0) addedValues[pos] = "#NuN#";
						} else {
							if (addedValues[pos] == "#NuN#") addedValues[pos] = 0;
							addedValues[pos] = addedValues[pos] + parseFloat(searchIn[i][pos]);
						}
					}
					hallado = true
					coinciden.push(i);
				}
			}
			if (hallado) {
				if (self.formulaInfo.cantFormulaMeasures == 1) {
					for (var pC = 0; pC < coinciden.length; pC++) {
						tosearch.splice(coinciden[pC], 1)
					}
				}
				return addedValues;
			} else
				return self.EmptyValue;


		}



		this.calculateFormulaTotal = function (inputData, measureNumber, caseId) {
			try {
				var addedValues = [];

				if (inputData.length == 0) return "#NuN#"

				//if ( caseId == "MeasureInRows"){
				for (var j = 0; j < inputData.length; j++) {
					//if (inputData[j] == "#NuN#"){
					//	return "#NuN#";
					//}
					if ((inputData[j] != self.EmptyValue) && (inputData[j] != 0) && ((inputData[j] != "#NuN#") || (self.ShowMeasuresAsRows))) {
						for (var i = 0; i < inputData[j].length; i++) {
							if (addedValues[i] == undefined) { addedValues[i] = 0 }
							if (!isNaN(inputData[j][i]) && (inputData[j][i] != "#NuN#")) {
								if (addedValues[i] == "#NuN#") addedValues[i] = 0;
								addedValues[i] = addedValues[i] + inputData[j][i];
							}
							if (inputData[j][i] == "#NuN#" && addedValues[i] == 0) {
								addedValues[i] = "#NuN#"
							}
						}
					}
				}
				//}
				if (!self.ShowMeasuresAsRows) {
					if (addedValues.length == 0) return "#NuN#"
				} else {
					if (addedValues.length == 0) return NaN
				}
				var result = EvaluateExpressionPivotJs(self.formulaInfo.measureFormula[measureNumber].PolishNotation,
					addedValues, self.formulaInfo)
				if ((result == Infinity) || isNaN(result)) {
					return "#FoE#";
				}

				return result;
			} catch (Error) {
				return self.EmptyValue;
			}

		}
		this.addToStack = function (iterator, item, value, conditionList) {
			if (self.GeneralDataRows.length > 3000)
				return true
			if (iterator < 1)
				return true;
			if (item.value == undefined)
				return true;

			var value_cond_row_pos = self.conditions[conditionList[iterator]].dataRowPosition;
			var value_prev_cond_row_pos = self.conditions[conditionList[iterator - 1]].dataRowPosition;
			//search if the row exists
			if ((self.allData.length > 800) && (self.filterIndexes.length > 0)) {
				return true
			}

			for (var i = 0; i < self.allData.length; i++) {
				if (self.allData[i][value_cond_row_pos] == value) {
					if (item.value == self.allData[i][value_prev_cond_row_pos]) {
						return true;
					}
				}
			}

			if (self.rowConditions.length < 8) {
				for (var i = 0; i < self.GeneralDataRows.length; i++) {
					if (self.GeneralDataRows[i][value_cond_row_pos] == value) {
						if (item.value == self.GeneralDataRows[i][value_prev_cond_row_pos]) {
							return true;
						}
					}
				}
			}
			return false;
		}

		this.createAggStructure = function () { /* create a multidimensional aggregation structure */
			function createPart(struct, arr, rows, tempSearchData) {
				struct.items = false;
				struct.depth = -1;
				var stack = [struct];
				var dimensionLenght = arr.length;
				if ((self.ShowMeasuresAsRows) && rows) {
					dimensionLenght -= measures.length - 1;
				}
				for (var i = 0; i < dimensionLenght; i++) { /* for all conditions */
					/*ordenar tempSearchData*/
					var cond = self.conditions[arr[i]];


					var filaAOrdenar = self.conditions[arr[i]].dataRowPosition
					var index = filaAOrdenar;

					var coef = cond.sort;


					if ((i >= 1) && (self.rowConditions.length > 16) && (self.GeneralDataRows.length > 1200)) {
						cond = self.conditions[arr[i - 1]];
						filaAOrdenar = self.conditions[arr[i - 1]].dataRowPosition
						index = filaAOrdenar;

						coef = cond.sort;
					}

					if ((coef != 0) && (coef != 2)) {
						var sortNumeric = true;
						for (var ival = 0; ival < cond.distinctValues.length; ival++) {
							if ((sortNumeric) && (cond.distinctValues[ival] != parseInt(cond.distinctValues[ival]))) {
								sortNumeric = false; break;
							}
						}
						if (sortNumeric) {
							tempSearchData.sort((function (index) {
								return function (a, b) {
									return coef * (parseInt(a[index]) === parseInt(b[index]) ? 0 : (parseInt(a[index]) < parseInt(b[index]) ? -1 : 1));
								};
							})(index));
						} else {
							tempSearchData.sort((function (index) {
								return function (a, b) {
									return coef * (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
								};
							})(index));
						}
					}




					var newstack = [];

					var itemsInclude = cond.distinctValues.length;
					//if ((coef != 0) && (coef == 1)) cond.distinctValues.sort();

					if ((i >= 1) && (self.rowConditions.length > 16) && (self.GeneralDataRows.length > 1200)) {
						var value_cond_row_pos = self.conditions[arr[i]].dataRowPosition;
						var newStackValues = [];
						for (var j = 0; j < stack.length; j++) {
							var items = [];

							for (var l = 0; l < tempSearchData.length; l++) {
								var crudeRow = tempSearchData[l];

								value = tempSearchData[l][value_cond_row_pos];

								var res = self.addToStack3(i, stack[j], tempSearchData[l], arr, coef, sortNumeric)
								if (res == 'break') break;

								if (newStackValues.indexOf(value) == -1) {
									//stack[j] y crudeRow "coinciden"



									if (res) {
										newStackValues.push(value);

										var collapsed = false;
										if (cond.collapsedValues.indexOf(value) != -1)
											collapsed = true;
										var o = { value: value, parent: stack[j], used: false, items: false, depth: i, collapsed: collapsed, conditionNumber: arr[i] };
										items.push(o);
										newstack.push(o);

									}
								}

							}
							newStackValues = [];


							stack[j].items = items;
						}


					} else {
						for (var j = 0; j < stack.length; j++) { // for all items to be filled 
							var items = [];

							var valuePositionInSearchData = [0];
							for (var k = 0; k < itemsInclude; k++) { // for all currently distinct values

								var value = cond.distinctValues[k];
								if (cond.blackList.indexOf(value) == -1) { //if not in black list

									if (self.addToStack2(i, stack[j], value, arr, tempSearchData, valuePositionInSearchData, coef, sortNumeric)) {//search if this rows exists

										var collapsed = false;
										if (cond.collapsedValues.indexOf(value) != -1)
											collapsed = true;
										var o = { value: value, parent: stack[j], used: false, items: false, depth: i, collapsed: collapsed, conditionNumber: arr[i] };
										items.push(o);
										newstack.push(o);

									}


								}
							} // distinct values 
							stack[j].items = items;
						} // items in stack
					}


					stack = newstack;
				} /* conditions */


				//add measure & value row
				if ((self.ShowMeasuresAsRows) && (rows)) {
					//if (arr.length > 0){
					var newstack = [];
					for (var j = 0; j < stack.length; j++) { /* for all items to be filled */
						var items = [];
						var itemsInclude = measures.length;

						for (var k = 0; k < itemsInclude; k++) { //for all measures
							var measureName = measures[k].getAttribute("displayName")
							var collapsed = false;
							var o = { value: measureName, parent: stack[j], used: false, items: false, depth: dimensionLenght, collapsed: collapsed };
							//items.push(o);
							var podar = false
							if (self.colConditions.length == 0) {
								var measureValue = self.getMeasureValue(stack[j], k, arr);
								if (measureValue == self.EmptyValue) {
									podar = true;
								} else {
									var v = { value: measureValue, parent: o, used: false, items: false, depth: dimensionLenght + 1, collapsed: collapsed };
									o.items = []
									o.items.push(v)
								}
							}
							//var collapseFalse
							if (!podar) {
								items.push(o)
								if (self.colConditions.length == 0) {
									newstack.push(v);
								} else {
									newstack.push(o);
								}
							}
						}
						stack[j].items = items;
					}
					stack = newstack;
					//}
				}
			}

			//create copy of self.allData
			var tempSearchData = [];
			for (var i = 0; i < self.allData.length; i++) {
				tempSearchData.push(self.allData[i])
			}

			//self.createTempDataStructForAggStepOptimization();
			createPart(self.rowStructure, self.rowConditions, true, tempSearchData);
			createPart(self.colStructure, self.colConditions, false, tempSearchData);
			//self.TempDataStructForAggStepOptimization = [];
		}

		this.addToStack3 = function (iterator, item, row, conditionList, orden, sortNumeric) {
			if (item.value == undefined)
				return true;

			//var value_cond_row_pos = self.conditions[conditionList[iterator]].dataRowPosition;
			var value_prev_cond_row_pos = self.conditions[conditionList[iterator - 1]].dataRowPosition;

			if (item.value == row[value_prev_cond_row_pos]) {

				var tempItem = item;
				var flag = true;
				for (var resto = 1; resto < iterator; resto++) {
					var value_prev = self.conditions[conditionList[iterator - 1 - resto]].dataRowPosition;
					tempItem = tempItem.parent;
					if (tempItem.value != row[value_prev]) {
						flag = false;
						break;
					}
				}
				if (flag) return true;

			} else {
				if ((orden == 0) || (orden == 2) ||
					((orden == 1) && (!sortNumeric) && (row[value_prev_cond_row_pos] <= item.value)) ||
					((orden == -1) && (!sortNumeric) && (row[value_prev_cond_row_pos] >= item.value)) ||
					((orden == 1) && (sortNumeric) && (parseInt(row[value_prev_cond_row_pos]) <= parseInt(item.value))) ||
					((orden == -1) && (sortNumeric) && (parseInt(row[value_prev_cond_row_pos]) >= parseInt(item.value)))
				) {
					return false
				} else {
					return 'break'
				}
			}

		}

		this.addToStack2 = function (iterator, item, value, conditionList, tempSearchData, valuePosition, orden, sortNumeric) {
			if ((self.GeneralDataRows.length > 3000))
				return true
			if (iterator < 1)
				return true;
			if (item.value == undefined)
				return true;

			var value_cond_row_pos = self.conditions[conditionList[iterator]].dataRowPosition;
			var value_prev_cond_row_pos = self.conditions[conditionList[iterator - 1]].dataRowPosition;
			//search if the row exists
			if ((self.allData.length > 1000) && (self.filterIndexes.length > 0) && (self.rowConditions.length < 8)) {
				return true
			}

			var first = true;
			for (var i = valuePosition[0]; i < tempSearchData.length/*self.allData.length*/; i++) {
				if ((orden == 0) || (orden == 2) ||
					((orden == 1) && (!sortNumeric) && (tempSearchData[i][value_cond_row_pos] <= value)) ||
					((orden == -1) && (!sortNumeric) && (tempSearchData[i][value_cond_row_pos] >= value)) ||
					((orden == 1) && (sortNumeric) && (parseInt(tempSearchData[i][value_cond_row_pos]) <= parseInt(value))) ||
					((orden == -1) && (sortNumeric) && (parseInt(tempSearchData[i][value_cond_row_pos]) >= parseInt(value)))
				) {
					if (tempSearchData[i][value_cond_row_pos] == value) {
						if ((first) && (orden != 0) && (orden != 2)) {
							valuePosition[0] = i; first = false;
						}
						if (item.value == tempSearchData[i][value_prev_cond_row_pos]) {
							var tempItem = item;
							var flag = true;
							for (var resto = 1; resto < iterator; resto++) {
								var value_prev = self.conditions[conditionList[iterator - 1 - resto]].dataRowPosition;
								tempItem = tempItem.parent;
								if (tempItem.value != tempSearchData[i][value_prev]) {
									flag = false;
									break;
								}
							}
							if (flag) return true;
						}
					}
				} else {//se supero el valor
					break;
				}
			}

			if ((/*(!self.autoPaging) ||*/ (self.GeneralDataRows.length < 500)) //limitado evitar loop grande
				&& (self.GeneralDataRows.length > self.allData.length)) {
				for (var i = 0; i < self.GeneralDataRows.length; i++) {
					if (self.GeneralDataRows[i][value_cond_row_pos] == value) {
						if (item.value == self.GeneralDataRows[i][value_prev_cond_row_pos]) {
							if (iterator > 1) {

								var value_prev = self.conditions[conditionList[iterator - 2]].dataRowPosition;
								if (item.parent.value == self.GeneralDataRows[i][value_prev]) {
									return true
								}

							} else {
								return true;
							}
						}
					}
				}
			}
			return false;
		}

		this.fillAggStructure = function () { /* mark used branches of aggregation structure */
			function fillPart(struct, arr, row, rowNumber) {
				if (!self.ShowMeasuresAsRows) {
					var ptr = struct;
					for (var i = 0; i < arr.length; i++) {
						var rindex = arr[i];
						var value = row[rindex];
						var o = false;
						for (var j = 0; j < ptr.items.length; j++) {
							if (ptr.items[j].value == value) {
								o = ptr.items[j];
								ptr.items[j].row = rowNumber;
								break;
							}
						}
						
							if (o) ptr = o;
						
					} /* for all conditions */
					ptr.used = true;
				} else {
					var posTitleMeasure = row.length - measures.length;
					row.splice(posTitleMeasure, 0, "");
					for (var m = 0; m < measures.length; m++) {
						//agrego a la fila el valor de la medida
						var measureName = measures[m].getAttribute("displayName")
						row[posTitleMeasure] = measureName;

						var ptr = struct;
						for (var i = 0; i < arr.length; i++) {
							var rindex = arr[i];//i; //arr[i]; 
							var value = row[rindex];
							var o = false;
							for (var j = 0; j < ptr.items.length; j++) {
								if (ptr.items[j].value == value) {
									o = ptr.items[j];
									//ptr.items[j].row = rowNumber*measures.length + m;
									break;
								}
							}
							if (!self.autoPaging) {
								//if (!o) { 
								//	/*alert("Value not found in distinct?!?!? PANIC!!!"); */}
								if (o) ptr = o;
							} else {
								if (o) ptr = o;
							}
						} /* for all conditions */
						ptr.used = true;
					}
					row.splice(posTitleMeasure, 1)
				}
			}

			function fillAllPart(struct) {
				var ptr = struct;
				if (!ptr.items) {
					ptr.used = true;
					return;
				}
				for (var i = 0; i < ptr.items.length; i++) { fillAllPart(ptr.items[i]); }
			}

			if (self.options.showEmpty) {
				fillAllPart(self.rowStructure);
				fillAllPart(self.colStructure);
			} else {
				for (var i = 0; i < self.filteredData.length; i++) {
					var row = self.filteredData[i];
					fillPart(self.rowStructure, self.rowConditions, row, i);
					fillPart(self.colStructure, self.colConditions, row, i);
				}
			}
		}

		this.checkAggStructure = function () { /* check structure for empty parts and delete them */
			function check(ptrT) { /* recursive function */
				if (!self.ShowMeasuresAsRows) {
					if (!ptrT.items) { return ptrT.used; } /* for leaves, return their usage state */
					for (var i = ptrT.items.length - 1; i >= 0; i--) { /* if node, decide based on children count */
						if (!check(ptrT.items[i])) {
							ptrT.items.splice(i, 1);
						}
					}
					return (ptrT.items.length > 0); /* return children state */
				} else {
					if (self.colConditions > 0) {
						var tempPt = ptrT
						if (!tempPt.items) { return tempPt.used; }
						var itemLg = tempPt.items.length
						var to = 5;
						var iterI;
						for (iterI = itemLg - 1; iterI > -1; iterI--) {
							if (iterI > -1) {
								var ol = 0;
								var resultado = check(tempPt.items[iterI]);
								if ((resultado != undefined) && (!resultado)) {
									tempPt.items.splice(iterI, 1);
								}
							}
						}
						return (tempPt.items.length > 0);
					}
				}
			}

			check(self.rowStructure);
			if (!self.ShowMeasuresAsRows) {
				check(self.colStructure);
			}
		}

		this.applyDefaultFormats = function (td, value) {
			var type = typeof value;
			switch (type) {
				case "number":
					value = OAT.charReplace(value.toString(), ".", gx.decimalPoint);
					OAT.addTextNode(td, value)
					break;
				case "date":
					break;
			}
			return td;
		}

		this.refreshPivot = function (metadata, data, sameQuery) {
			if ((metadata != "") && (data != "")) {
				var parser = new DOMParser();
				var xmlData = parser.parseFromString(metadata, 'text/xml');
				var dimensions = xmlData.getElementsByTagName("OLAPDimension");
				var index;

				//add hide elements to blacklist
				for (var bli = 0; bli < self.conditions.length; bli++) {
					if ((self.conditions[bli])) {
						var tempBlack = jQuery.extend(true, [], self.conditions[bli].blackList);
						for (var ib = 0; ib < tempBlack.length; ib++) {
							self.createFilterInfo({ op: "pop", values: tempBlack[ib], dim: bli });
						}
					}
					self.conditions[bli].blackList = []
				}

				var rowPosition = []; var colPosition = [];
				for (var dim = 0; dim < dimensions.length; dim++) { //for every dimensions of the other querie

					var dimID = dimensions[dim].getElementsByTagName("name")[0].childNodes[0].nodeValue; //get the name - "Identifier" of this dimension

					//now search for this name at this querie
					var dimPos = -1;
					for (var itC = 0; itC < self.columns.length; itC++) {
						if (self.columns[itC].attributes.getNamedItem("name").nodeValue === dimID)
							dimPos = itC;		//this is the number identifier of this dimension at this pivot	
					}


					if (dimPos != -1) {//the dimension exist in this pivot
						//columns and rows dimensions and filters
						var position = dimensions[dim].getElementsByTagName("condition")[0].childNodes[0].nodeValue; //where's the dimension? row, columns, filter
						if (position === "row") {
							index = self.colConditions.indexOf(dimPos);
							if (index != -1) { //if it is as columns, change to rows
								self.colConditions.splice(index, 1);
								if (measures.length > 1)
									self.rowConditions = [dimPos].concat(self.rowConditions);
								else
									self.rowConditions.push(dimPos);
							} else {
								index = self.filterIndexes.indexOf(dimPos);
								if (index != -1) {
									self.filterIndexes.splice(index, 1);
									if (measures.length > 1)
										self.rowConditions = [dimPos].concat(self.rowConditions);
									else
										self.rowConditions.push(dimPos);
								}
							}
							rowPosition[parseInt(dimensions[dim].getElementsByTagName("position")[0].childNodes[0].nodeValue)] = dimPos
						} else if (position === "col") {
							index = self.rowConditions.indexOf(dimPos);
							if (index != -1) {
								self.rowConditions.splice(index, 1);
								if (measures.length > 1)
									self.colConditions = [dimPos].concat(self.colConditions);
								else
									self.colConditions.push(dimPos);
							} else {
								index = self.filterIndexes.indexOf(dimPos);
								if (index != -1) {
									self.filterIndexes.splice(index, 1);
									if (measures.length > 1)
										self.colConditions = [dimPos].concat(self.colConditions);
									else
										self.colConditions.push(dimPos);
								}
							}
							colPosition[parseInt(dimensions[dim].getElementsByTagName("position")[0].childNodes[0].nodeValue)] = dimPos
						} else if (position === "none") {//to filter
							index = self.colConditions.indexOf(dimPos);
							if (index != -1) {
								self.colConditions.splice(index, 1);
								if (measures.length > 1)
									self.filterIndexes = [dimPos].concat(self.filterIndexes);
								else
									self.filterIndexes.push(dimPos);
							} else {
								index = self.rowConditions.indexOf(dimPos);
								if (index != -1) {
									self.rowConditions.splice(index, 1);
									if (measures.length > 1)
										self.filterIndexes = [dimPos].concat(self.filterIndexes);
									else
										self.filterIndexes.push(dimPos);
								}
							}

						}

						//set order value
						var order = dimensions[dim].getElementsByTagName("order")[0].childNodes[0].nodeValue;
						
							if (order == "descending") {
								self.conditions[dimPos].sort = -1
							} else {
								self.conditions[dimPos].sort = 1
							}
						

						//reset blacklists
						var hides = dimensions[dim].getElementsByTagName("hide")[0].childNodes;
						for (var sofs = 0; sofs < hides.length; sofs++) {
							if (hides[sofs].tagName === "value") {
								var index = self.conditions[dimPos].blackList.indexOf(hides[sofs].textContent);
								//if not already in the list
								if (index === -1) {
									for (var t = 0; t < self.conditions[dimPos].distinctValues.length; t++) {
										var trimValue = self.conditions[dimPos].distinctValues[t].toString().trimpivot();
										if (trimValue == hides[sofs].textContent) {
											
												self.createFilterInfo({ op: "push", values: self.conditions[dimPos].distinctValues[t], dim: dimPos });
											
										}
									}
								}
							}
						}
						//set values of filter bars
						if (dimensions[dim].getElementsByTagName("filterdivs").length > 0) {
							var fils = dimensions[dim].getElementsByTagName("filterdivs")[0].childNodes;
							for (var sofs = 0; sofs < fils.length; sofs++) {
								if (fils[sofs].tagName === "value") {
									var findex = self.filterIndexes.indexOf(dimPos);
									if (findex != -1) {
										if (self.filterDiv.selects[findex] != undefined) {
											self.filterDiv.selects[findex].value = fils[sofs].textContent;
										}
									}
								}
							}
						}

					} //else the dimension not exists in this pivot




				}

				//set dimension position
				if ((self.rowConditions.length - (measures.length - 1)) == rowPosition.length) {
					for (var i = 0; i < rowPosition.length; i++) {
						self.rowConditions[i] = rowPosition[i];
					}
				}
				if (self.colConditions.length == colPosition.length) {
					for (var i = 0; i < colPosition.length; i++) {
						self.colConditions[i] = colPosition[i];
					}
				}


				
					for (var c = 0; c < self.columns.length; c++) {
						self.pageData.AxisInfo = self.createAxisInfo(self.columns[c].getAttribute("dataField"));
					}
					self.pageData.CollapseInfo = self.CreateExpandCollapseInfo("");
					self.pageData.DataInfo = self.createDataInfo()
					
					var ParmDataInfo = self.createNewDataInfo()
					var ParmAxisInfo =  self.createNewAxisInfo();
					
					
					self.lastCallToQueryViewer = "refreshPivot"
				
					self.requestPageDataForPivotTable(1, self.rowsPerPage, true, ParmAxisInfo, ParmDataInfo, self.pageData.FilterInfo, self.pageData.CollapseInfo, true);

					
					
				
			}
		}




		this.getRowFromDimensionRow = function (row, rowCollection) {
			for (var rCL = 0; rCL < rowCollection.length; rCL++) {
				var same = true;
				for (var rwoI = 0; rwoI < row.length; rwoI++) {
					if (row[rwoI] != undefined) {
						if (row[rwoI] != rowCollection[rCL][rwoI]) {
							same = false;
							break;
						}
					}
				}
				if (same) {
					return rowCollection[rCL]
				}
			}
			return null
		}

		
		


		this.notInBlackList = function (row, conditions) {
			var esta = false;
			for (var i = 0; i < row.length; i++) {
				if ((conditions[i] != undefined) && (conditions[i].blackList != undefined) && (conditions[i].blackList.indexOf(row[i]) != -1)) {
					esta = true;
				}
			}
			return esta;
		}


		this.preGoWhenShowHideMeasures = function (index) {
			var displayName = self.initMetadata.Measures[index].displayName;

			//column hide
			var columnIndex = self.headerRow.indexOf(displayName);
			if (!self.initMetadata.Measures[index].Visible) {
				if (measures.length > 1) {
					self.rowConditions.splice(self.rowConditions.length - 1, 1)
					self.dataColumnIndex = self.dataColumnIndex - 1
				}
				
			} else {
				var presentMeasures = measures.length - 1;
				for (var o = 0; o < presentMeasures; o++) {
					self.rowConditions.splice(self.rowConditions.length - 1, 1)
				}
				if ((presentMeasures >= 0) && (measures[0].getAttribute("dataField") != "F0")) {
					var cols = self.rowConditions.length + self.colConditions.length + self.filterIndexes.length;
					if (measures.length > 0) {
						var prevCol = cols;
						cols = cols + measures.length;
						for (var i = prevCol; i < cols; i++) {
							self.rowConditions.push(i);
						}
					}
				}
			}

			for (var i = 0; i < self.columns.length; i++) {
				var dF = self.columns[i].getAttribute("dataField")
				var index = self.initMetadata.DataFields.indexOf(dF);
				self.initMetadata.Conditions[index] = self.conditions[i];
			}

			this.goWhenHide();
		}


		this.preGoWhenShowHideDimension = function (index) {
			for (var ip = 0; ip < self.columns.length; ip++) {
				var dF = self.columns[ip].getAttribute("dataField")
				var ix = self.initMetadata.DataFields.indexOf(dF);
				self.initMetadata.Conditions[ix] = self.conditions[ip];
			}

			var conditionIndex;
			var DataFile = self.initMetadata.DataFields[index]
			for (var ip = 0; ip < self.columns.length; ip++) {
				var dF = self.columns[ip].getAttribute("dataField")
				if (DataFile == dF) {
					conditionIndex = ip
				}
			}


			if (!self.initMetadata.Dimensions[index].Visible) {
				self.initMetadata.DimensionPosition[index] = "row"
				//self.conditions[conditionIndex].position = "row"
				if (self.colConditions.indexOf(conditionIndex) > -1) {
					self.initMetadata.DimensionPosition[index] = "col"
					//self.conditions[conditionIndex].position = "col"
				}
				if (self.filterIndexes.indexOf(conditionIndex) > -1) {
					self.initMetadata.DimensionPosition[index] = "fil"
					//self.conditions[conditionIndex].position = "fil"
				}
			}

			var displayName = self.initMetadata.Dimensions[index].displayName;

			//column hide
			var columnIndex = self.headerRow.indexOf(displayName);
			if (!self.initMetadata.Dimensions[index].Visible) {
				if (self.rowConditions.indexOf(columnIndex) > -1) {
					self.rowConditions.splice(self.rowConditions.indexOf(columnIndex), 1)
				} else if (self.colConditions.indexOf(columnIndex) > -1) {
					self.colConditions.splice(self.colConditions.indexOf(columnIndex), 1)
				} else if (self.filterIndexes.indexOf(columnIndex) > -1) {
					self.filterIndexes.splice(self.filterIndexes.indexOf(columnIndex), 1)
				}

				//correct measure and dimension number
				self.dataColumnIndex = self.dataColumnIndex - 1
				for (var i = 0; i < self.rowConditions.length; i++) {
					if (self.rowConditions[i] > columnIndex) {
						self.rowConditions[i] = self.rowConditions[i] - 1
					}
				}
				for (var i = 0; i < self.colConditions.length; i++) {
					if (self.colConditions[i] > columnIndex) {
						self.colConditions[i] = self.colConditions[i] - 1
					}
				}
				for (var i = 0; i < self.filterIndexes.length; i++) {
					if (self.filterIndexes[i] > columnIndex) {
						self.filterIndexes[i] = self.filterIndexes[i] - 1
					}
				}

			} else {
				var previousPosition = self.initMetadata.DimensionPosition[index]//self.initMetadata.Conditions[index].position;

				if (previousPosition == undefined) {
					var defpos = self.initMetadata.Dimensions[index].defaultPosition.toLowerCase()

					if (defpos.indexOf("rows") > -1) previousPosition = "row";
					else
						if (defpos.indexOf("columns") > -1) previousPosition = "col";
						else
							if ((defpos.indexOf("filters") > -1) || (defpos.indexOf("pages") > -1)) previousPosition = "fil";
							else previousPosition = "row";

				}


				var posIndex = 0
				for (var i = 0; i < index; i++) {
					if (self.initMetadata.Dimensions[i].Visible) posIndex = posIndex + 1
				}

				index = posIndex;
				if (previousPosition == "row") {
					var tempRowConsition = [];
					var existe = (self.rowConditions.indexOf(index) > -1)
					for (var t = 0; t < self.rowConditions.length; t++) {
						if (self.rowConditions[t] < index) {
							tempRowConsition.push(self.rowConditions[t])
						} else if (self.rowConditions[t] == index) {
							tempRowConsition.push(index)
							tempRowConsition.push(index + 1)
							existe = true
						} else {
							if (!existe) {
								tempRowConsition.push(index)
								existe = true
							}
							tempRowConsition.push(self.rowConditions[t] + 1)
						}
					}
					if (!existe) {
						tempRowConsition.push(index)
					}
					self.rowConditions = []
					self.rowConditions = tempRowConsition

					self.dataColumnIndex = self.dataColumnIndex + 1


					var tempColConsition = [];
					for (var t = 0; t < self.colConditions.length; t++) {
						if (self.colConditions[t] >= index) {
							tempColConsition.push(self.colConditions[t] + 1)
						} else {
							tempColConsition.push(self.colConditions[t])
						}
					}
					self.colConditions = []
					self.colConditions = tempColConsition

					var tempFilConsition = [];
					for (var t = 0; t < self.filterIndexes.length; t++) {
						if (self.filterIndexes[t] >= index) {
							tempFilConsition.push(self.filterIndexes[t] + 1)
						} else {
							tempFilConsition.push(self.filterIndexes[t])
						}
					}
					self.filterIndexes = []
					self.filterIndexes = tempFilConsition


				} else if (previousPosition == "col") {

					var tempRowConsition = [];
					for (var t = 0; t < self.rowConditions.length; t++) {
						if (self.rowConditions[t] >= index) {
							tempRowConsition.push(self.rowConditions[t] + 1)
						} else {
							tempRowConsition.push(self.rowConditions[t])
						}
					}
					self.rowConditions = []
					self.rowConditions = tempRowConsition

					self.dataColumnIndex = self.dataColumnIndex + 1



					var tempColConsition = [];
					var existe = (self.colConditions.indexOf(index) > -1)
					for (var t = 0; t < self.colConditions.length; t++) {
						if (self.colConditions[t] < index) {
							tempColConsition.push(self.colConditions[t])
						} else if (self.colConditions[t] == index) {
							tempColConsition.push(index)
							tempColConsition.push(index + 1)
							existe = true
						} else {
							if (!existe) {
								tempColConsition.push(index)
								existe = true
							}
							tempColConsition.push(self.colConditions[t] + 1)
						}
					}
					if (!existe) {
						tempColConsition.push(index)
					}
					self.colConditions = []
					self.colConditions = tempColConsition




					var tempFilConsition = [];
					for (var t = 0; t < self.filterIndexes.length; t++) {
						if (self.filterIndexes[t] >= index) {
							tempFilConsition.push(self.filterIndexes[t] + 1)
						} else {
							tempFilConsition.push(self.filterIndexes[t])
						}
					}
					self.filterIndexes = []
					self.filterIndexes = tempFilConsition
				} else if (previousPosition == "fil") {

					var tempRowConsition = [];
					for (var t = 0; t < self.rowConditions.length; t++) {
						if (self.rowConditions[t] >= index) {
							tempRowConsition.push(self.rowConditions[t] + 1)
						} else {
							tempRowConsition.push(self.rowConditions[t])
						}
					}
					self.rowConditions = []
					self.rowConditions = tempRowConsition

					self.dataColumnIndex = self.dataColumnIndex + 1


					var tempColConsition = [];
					for (var t = 0; t < self.colConditions.length; t++) {
						if (self.colConditions[t] >= index) {
							tempColConsition.push(self.colConditions[t] + 1)
						} else {
							tempColConsition.push(self.colConditions[t])
						}
					}
					self.colConditions = []
					self.colConditions = tempColConsition


					var tempFilConsition = [];
					var existe = (self.filterIndexes.indexOf(index) > -1)
					for (var t = 0; t < self.filterIndexes.length; t++) {
						if (self.filterIndexes[t] < index) {
							tempFilConsition.push(self.filterIndexes[t])
						} else if (self.filterIndexes[t] == index) {
							tempFilConsition.push(index)
							tempFilConsition.push(index + 1)
							existe = true
						} else {
							if (!existe) {
								tempFilConsition.push(index)
								existe = true
							}
							tempFilConsition.push(self.filterIndexes[t] + 1)
						}
					}
					if (!existe) {
						tempFilConsition.push(index)
					}
					self.filterIndexes = []
					self.filterIndexes = tempFilConsition
				}
				
			}
			
			self.initRowConditions = []
			for(var i = 0; i<self.rowConditions.length; i++){
				self.initRowConditions.push(self.rowConditions[i])
			}
			
			this.goWhenHide();
		}

		this.goWhenHide = function (clean) {
			var hideDimension = [];
			for (var i = 0; i < self.initMetadata.Dimensions.length; i++) {
				if (!self.initMetadata.Dimensions[i].Visible) {
					hideDimension.push(self.initMetadata.Dimensions[i].dataField)
				}
			}
			var hideMeasures = [];
			for (var i = 0; i < self.initMetadata.Measures.length; i++) {
				if (!self.initMetadata.Measures[i].Visible) {
					hideMeasures.push(self.initMetadata.Measures[i].dataField)
				}
			}

			var stateHidden = {
				DataFields: self.initMetadata.DataFields,
				Dimensions: self.initMetadata.Dimensions,
				Measures: self.initMetadata.Measures,
				DimensionPosition: self.initMetadata.DimensionPosition,
				Conditions: self.initMetadata.Conditions,
				version: self.rememberLayoutStateVersion
			}
			self.saveHiddenState(stateHidden)


			var result = OATParseMetadata(self.initMetadata.Metadata, hideDimension, hideMeasures, self.serverPagination)
			var newMetadata = result[0]; self.HideDataFilds = result[2]; self.OrderFildsHidden = result[1];

			var xmlDoc = jQuery.parseXML(newMetadata);
			measures = xmlDoc.getElementsByTagName("OLAPMeasure");
			self.columns = xmlDoc.getElementsByTagName("OLAPDimension");

			var result = OATGetColumnsAndMeasureMeatadata(self.columns, measures, self.formulaInfo, self.OrderFildsHidden)
			self.headerRow = result[0];
			self.formulaInfo.measureFormula = result[2];
			self.conditionalFormats = result[3];
			self.conditionalFormatsColumns = result[4];

			var orderFilds = result[1];

		

			if (measures.length > 0) {
				self.dataColumnIndex = self.headerRow.length - 1;
			}



				self.conditions = [];
				for (var i = 0; i < self.headerRow.length; i++) {
					self.initCondition(i);
					//add info for server paging porpouse
					if (self.conditions[i] && self.columns[i]) {
						self.conditions[i].dataField = self.columns[i].getAttribute("dataField")
						self.conditions[i].state = "all"
						self.conditions[i].defaultAction = "Include"
						self.conditions[i].visibles = []
						self.conditions[i].searchInfo = { previousPage: 0, totalPages: 0, filteredText: "", values: [] }
					}
					self.applyCustomFilters(i);
				}

				for (var i = 0; i < self.columns.length; i++) {
					var dF = self.columns[i].getAttribute("dataField")
					var index = self.initMetadata.DataFields.indexOf(dF);
					if (self.initMetadata.Conditions[index] != "") {
						self.initMetadata.Conditions[index].dataRowPosition = self.conditions[i].dataRowPosition
						self.conditions[i] = self.initMetadata.Conditions[index];
					}
				}

				self.cleanGridCache();

				self.pageData.AxisInfo = self.createAxisInfo();

				var ParmAxisInfo = self.createNewAxisInfo();
				
				self.pageData.DataInfo = self.createDataInfo()
				
				var ParmDataInfo = self.createNewDataInfo();
				
				self.lastCallToQueryViewer = "hiddenDimension"
				
				self.requestPageDataForPivotTable(1, self.rowsPerPage, true, ParmAxisInfo, ParmDataInfo, self.pageData.FilterInfo, self.pageData.CollapseInfo, true);

				
				

				if (clean) {
					self.initValueRead(self, 0);
				} else {

					for (var i = 0; i < self.columns.length; i++) {
						if (self.conditions[i].totalPages == undefined) {
							//load values
							var cantItems = 10;
							if ((self.QueryViewerCollection[self.IdForQueryViewerCollection].AutoRefreshGroup != "")) {
								cantItems = 0;
							}
							var columnNumber = i;
							
							self.lastRequestAttributeValues = "hiddenDimension"
							self.lastRequestAttributeColumnNumber = columnNumber
				
							self.requestAttributeValues(self.columns[columnNumber].getAttribute("dataField"), 1, cantItems, "")
							
							/*self.QueryViewerCollection[self.IdForQueryViewerCollection].getAttributeValues((function (resJSON) {
								var data = JSON.parse(resJSON);

								self.conditions[columnNumber].previousPage = data.PageNumber
								self.conditions[columnNumber].totalPages = data.PagesCount
								self.conditions[columnNumber].blocked = false
								//null value?
								if (data.Null) {
									self.conditions[columnNumber].hasNull = true;
									if (self.conditions[columnNumber].distinctValues.indexOf("#NuN#") == -1) {
										self.conditions[columnNumber].distinctValues.push("#NuN#")
									}
									var nullIncluded = true;

									if (!self.conditions[columnNumber].NullIncluded) {
										nullIncluded = false;
									}
									if ((nullIncluded) && (self.conditions[columnNumber].visibles.indexOf("#NuN#") == -1)) {
										self.conditions[columnNumber].visibles.push("#NuN#");
									}
								} else {
									self.conditions[columnNumber].hasNull = false;
								}

								var includeLists = [];
								for (var i = 0; i < data.NotNullValues.length; i++) {
									var value = data.NotNullValues[i]
									var include = false;
									if ((self.conditions[columnNumber].state == "none") &&
										(self.UserFilterValues.length > 0) && (self.UserFilterValues[columnNumber] != undefined)
										&& (self.UserFilterValues[columnNumber].length > 0) && (self.UserFilterValues[columnNumber].indexOf(value.trimpivot()) != -1)) {
										include = true;
										includeLists.push(value)
									}

									if (self.conditions[columnNumber].distinctValues.indexOf(value) == -1) {
										self.conditions[columnNumber].distinctValues.push(value)
									}
									if ((self.conditions[columnNumber].state == "all")
										&& (self.conditions[columnNumber].visibles.indexOf(value) == -1)) {
										self.conditions[columnNumber].visibles.push(value)
									}
									if ((self.conditions[columnNumber].state == "none")
										&& (self.conditions[columnNumber].blackList.indexOf(value) == -1)
										&& (!include)) {
										self.conditions[columnNumber].blackList.push(value)
									}

									if ((self.UserExpandValues.length > 0)) {//collapsed values
										if (self.UserExpandValues[columnNumber] != undefined) {
											if ((self.UserExpandValues[columnNumber][0] == "#ALLCOLLAPSE#") ||
												(self.UserExpandValues[columnNumber].indexOf(value.trimpivot()) == -1)) {
												self.conditions[columnNumber].collapsedValues.push(value);
											}
										}
									}

								}

								for (var i = 0; i < includeLists.length; i++) {
									self.createFilterInfo({ op: "pop", values: includeLists[i], dim: columnNumber }, true);
								}



							}).closure(this), [self.columns[columnNumber].getAttribute("dataField"), 1, cantItems, ""]);*/
						}
					}

				}

	
		}

		

		this.canBeConsiderNoNew = function (row, dataRows, helperList) {
			if (self.colConditions.length > 0) {
				var notNew = false;
				for (var i = 0; i < dataRows.length; i++) {
					var same = true;
					for (var j = 0; j < self.rowConditions.length; j++) {
						if (dataRows[i][self.rowConditions[j]] != row[self.rowConditions[j]]) {
							same = false;
						}
					}
					if (same == true) {
						notNew = true;
						break;
					}
				}
			}
			if (self.filterIndexes.length > 0)//si hay dimensiones en los filtros superiores, hay filas que pueden colapsarse
			{
				var notNew = false;

				for (var i = 0; i < helperList.length; i++) {
					var same = true;
					for (var j = 0; j < self.rowConditions.length - measures.length + 1; j++) {

						if (helperList[i][self.rowConditions[j]] != row[self.rowConditions[j]]) {
							same = false;
						}

					}
					if (same == true) {
						notNew = true;
						break;
					}
				}
				if (!notNew) {
					helperList.push(row);
				}


			}
			return notNew;
		}

		this.preGoWhenMoveTopFilter = function (filterIndex, initLoad) {
			if (initLoad == undefined) {
				for (var i = 0; i < self.filterDiv.selects.length; i++) {
					self.filterDiv.selects[i].value = "[all]"
				}
			} else {
				var out = false;
				for (var i = 0; i < self.filterDiv.selects.length; i++) {
					if (self.filterDiv.selects[i].value != "[all]") {
						out = true;
					}
				}
				if (out) return;
			}
			self.FilterByTopFilter = false
			//get the index of the columns values in the data records of GeneralData, less filter index
			var dataColumns = [];
			for (var i = 0; i < columns.length; i++) {
				var pos = i;//parseInt(columns[i].attributes.dataField.nodeValue.substr(1)) -1;
				if (((pos) != filterIndex) && (self.filterIndexes.indexOf(pos) == -1)) {
					dataColumns.push(pos)
				}
			}

			var dataRows = self.GeneralDataRows;

			
				//remove extra data rows, that have the same columns values, except for the value of the columns index
				var tempDataRows = [];
				for (var i = 0; i < dataRows.length; i++) {

					var existe = false;
					var previousRecord = 0;
					for (var j = 0; j < tempDataRows.length; j++) {
						var same = true;
						for (var h = 0; h < dataColumns.length; h++) {
							if (dataRows[i][dataColumns[h]] != tempDataRows[j][dataColumns[h]]) {

								same = false;
								break;
							}
						}
						if (same) {
							previousRecord = j;
							existe = true;
							break;
						}
					}
					if (!existe) {
						var newRecord = [];
						for (var p = 0; p < dataRows[i].length; p++) {
							newRecord.push([dataRows[i][p]]);
						}
						tempDataRows.push([newRecord]);

						for (var t = 0; t < measures.length; t++) {
							var pos;
							if (t < measures.length - 1) {
								pos = self.rowConditions[self.rowConditions.length - measures.length + 1 + t]
							} else {
								pos = self.dataColumnIndex
							}
							if ((self.formulaInfo.measureFormula[t].hasFormula) && (self.filterIndexes.length > 0)) {
								var valuesToOperate = self.getFormulaRowByDataRow(dataRows[i], t, "")
								if ((valuesToOperate != self.EmptyValue) && (valuesToOperate != "#NuN#")) {
									var result = self.calculateFormulaTotal([valuesToOperate], t, "MeasureInRows")
									if (!isNaN(result)) {
										newRecord[pos] = result.toString()
									}
								}
							}
						}

					} else { //increase prevoius record value

						//increase the entry of the column index (the last one)
						if (measures.length > 0) {
							if (!self.formulaInfo.measureFormula[measures.length - 1].hasFormula) {
								if ((tempDataRows[previousRecord][self.dataColumnIndex] != "#NuN#") && (dataRows[i][self.dataColumnIndex] != "#NuN#")) {
									tempDataRows[previousRecord][self.dataColumnIndex] = (parseFloat(tempDataRows[previousRecord][self.dataColumnIndex]) + parseFloat(dataRows[i][self.dataColumnIndex])).toString()
								} else if (tempDataRows[previousRecord][self.dataColumnIndex] == "#NuN#") {
									tempDataRows[previousRecord][self.dataColumnIndex] = dataRows[i][self.dataColumnIndex]
								}
							}
						}
						//increase the entries of other columns
						for (var t = 0; t < measures.length - 1; t++) {
							var pos = self.rowConditions[self.rowConditions.length - measures.length + 1 + t]
							if ((self.formulaInfo.measureFormula[t].hasFormula) && (self.filterIndexes.length > 0)) {
								//var addedValues = self.getFormulaRowByDataRow(dataRows[i], t, "")
							} else {
								tempDataRows[previousRecord][pos] = (parseFloat(tempDataRows[previousRecord][pos]) + parseFloat(dataRows[i][pos])).toString()
							}
						}
					}
				}
				//end remove extra data rows, that have the same columns values, except for the value of the columns index

				self.allData = tempDataRows;
				self.conditions = [];
				for (var i = 0; i < self.headerRow.length; i++) {
					self.initCondition(i);
				}
				for (var i = 0; i < self.headerRow.length; i++) {
					self.restoreSubtotalsAndSortLayout(i)
				}
			

		}

		this.isNotFilterByTopFilter = function (row) {
			for (var i = 0; i < self.filterIndexes.length; i++) { /* for all filters */
				var fi = self.filterIndexes[i]; /* this column is important */
				var s = self.filterDiv.selects[i]; /* select node */
				if ((s != undefined) && (s.selectedIndex && (OAT.$v(s) != "[all]") && (OAT.$v(s) != row[fi]))) { return false; }
			}
			return true;
		}

		this.preGoWhenFilterByTopFilter = function (init) {
			
				self.FilterByTopFilter = true;
				self.allData = self.GeneralDataRows;
				self.conditions = [];

				for (var i = 0; i < self.headerRow.length; i++) {
					self.initCondition(i);
				}
				for (var i = 0; i < self.headerRow.length; i++) {
					self.restoreSubtotalsAndSortLayout(i)
				}
			 
		}

		
	
		this.gridCache = []

		this.cleanGridCache = function () {
			self.gridCache = [];
		}

		this.addPageToCache = function (pageNum, data) {
			self.gridCache.push({ page: pageNum, data: data });
		}

		this.getPageDataFromCache = function (pageNum) {
			for (var it = 0; it < self.gridCache.length; it++) {
				if (self.gridCache[it].page == pageNum) {
					return self.gridCache[it].data;
				}
			}
			return false;
		}
		
		this.fireOnPageChange = function(move){
			setTimeout( function() {
				var paramobj = {"QueryviewerId": self.IdForQueryViewerCollection, "Navigation": move};
				var evt = document.createEvent("Events")
				evt.initEvent("PivotTableOnPageChangeEvent", true, true);
				evt.parameter = paramobj;
				document.dispatchEvent(evt);
			}, 0)
		}
		
		this.goWhenServerPagination = function (load, autorefreshflag) {

			if (!self.getPageDataFromCache(self.pageData.ServerPageNumber)) { //add page data to cache
				self.addPageToCache(self.pageData.ServerPageNumber, self.pageData.rows)
			}
			//call navigational events
			if (self.pageData.ServerPageNumber != self.pageData.PreviousPageNumber) {
				self.QueryViewerCollection[self.IdForQueryViewerCollection].CurrentPage = self.pageData.ServerPageNumber;
				if (self.pageData.ServerPageNumber == 1) {
					if (typeof (self.QueryViewerCollection[self.IdForQueryViewerCollection].OnFirstPage) == 'function') 
						//self.QueryViewerCollection[self.IdForQueryViewerCollection].OnFirstPage()
						self.fireOnPageChange("OnFirstPage")
				} else if (self.pageData.ServerPageNumber == self.pageData.ServerPageCount) {
					if (typeof (self.QueryViewerCollection[self.IdForQueryViewerCollection].OnLastPage) == 'function') 
						self.fireOnPageChange("OnLastPage")
						//self.QueryViewerCollection[self.IdForQueryViewerCollection].OnLastPage()
				} else if (self.pageData.ServerPageNumber < self.pageData.PreviousPageNumber) {
					if (typeof (self.QueryViewerCollection[self.IdForQueryViewerCollection].OnPreviousPage) == 'function') 
						//self.QueryViewerCollection[self.IdForQueryViewerCollection].OnPreviousPage()
						self.fireOnPageChange("OnPreviousPage")
				} else {
					if (typeof (self.QueryViewerCollection[self.IdForQueryViewerCollection].OnNextPage) == 'function') 
						//self.QueryViewerCollection[self.IdForQueryViewerCollection].OnNextPage()
						self.fireOnPageChange("OnNextPage")
				}
				self.pageData.PreviousPageNumber = self.pageData.ServerPageNumber
			}


			if (!load) {
				self.gd.clearSources();
				self.gd.clearTargets();
				self.drawFilters();
				if (self.QueryViewerCollection[self.IdForQueryViewerCollection].AutoRefreshGroup != "") {
					if (((autorefreshflag === undefined) || (autorefreshflag === null) || (!autorefreshflag))) {
						if ((!self.firstTime) || ((self.getState()) && (self.getState().version == self.rememberLayoutStateVersion))) {
							//something change, call QQ
							var meta;
							
								meta = self.getMetadataXML();
								meta = meta.replace(/\&amp;/g, "&");
							
								
								setTimeout( function() {
				
									var paramobj = {  "QueryviewerId": self.IdForQueryViewerCollection, "Metadata": meta};
									var evt = document.createEvent("Events")
									evt.initEvent("RequestUpdateLayoutSameGroup", true, true);
									evt.parameter = paramobj;
									document.dispatchEvent(evt);
				
								}, 50)
								
							
						}
					}
				}
			}

			/* get filtered selected values*/
			var filterDivSelects = new Array();
			for (var fiv = 0; fiv < self.filterDiv.selects.length; fiv++) {
				filterDivSelects[fiv] = self.filterDiv.selects[fiv].value;
			}

			if (!self.firstTime) {

				var state = {
					query: self.query,
					conditions: self.conditions,
					colConditions: self.colConditions,
					rowConditions: self.rowConditions,
					filterIndexes: self.filterIndexes,
					filterDivSelects: filterDivSelects,
					rowsPerPage: self.rowsPerPage,
					AxisInfo: self.pageData.AxisInfo,
					FilterInfo: self.pageData.FilterInfo,
					version: self.rememberLayoutStateVersion,
					DataInfo: self.pageData.DataInfo,
					NewAxisInfo: self.createNewAxisInfo(),
					NewDataInfo: self.createNewDataInfo()
				};


				if ((!self.deleteState)) {
					self.saveState(state);
				} else {
					self.cleanState();
				}

				self.readState = true;
			} else {
				self.firstTime = false;
			}

			self.drawTableWhenServerPagination();

			//add paging functionality
			var actual_rowsPerPage = 0;

			if ((self.pageData.ServerPageCount > 0) && ((self.pageData.ServerPageCount > 1) || (self.pageData.rows.length > 10))
				&& (self.rowsPerPage > 0)) {
				//if pivot has less than 10 rows => no need to paging
				var options = {
					currPage: self.pageData.ServerPageNumber,
					ignoreRows: jQuery('tbody tr[title_row=true]', jQuery("#" + this.controlName + "_" + self.query)),
					optionsForRows: OAT.AddItemToList( [10, 15, 20], initMetadata.RowsPerPage ),
					rowsPerPage: self.rowsPerPage,
					topNav: false,
					controlName: this.controlName + "_" + self.query,
					cantPages: self.pageData.ServerPageCount,
					controlUcId: UcId,
					translations: self.translations,
					control: self
				}

				OAT.partialTablePagination(jQuery("#" + self.controlName + "_" + self.query), options);

				jQuery("#" + this.controlName + "_" + self.query).css("margin-bottom", "0px");

			}

			if ((jQuery("#" + this.controlName + "_" + self.query).length > 0) && (!autoResize)) {
				var clientWdt = jQuery("#" + this.containerName)[0].clientWidth
				jQuery("#" + this.controlName + "_" + self.query).css({ width: (clientWdt - 4) + "px" })
			}

			try {
				var wd = jQuery("#" + this.controlName + "_" + self.query)[0].offsetWidth - 4;
				if (jQuery("#MAINFORM")[0].className.indexOf("form-horizontal") > -1) {
					wd = wd + 4;
				}
			} catch (Error) {
			}



			try {
				var wd2 = jQuery("#" + this.controlName + "_" + self.query)[0].offsetWidth - 1;
				jQuery("#" + UcId + "_" + self.query + "_title_div").css({ width: wd + "px" }); 
				jQuery("#" + UcId + "_" + self.query + "_pivot_page").css({ width: wd + "px" }); 
				jQuery("#" + this.controlName + "_" + self.query + "_tablePagination").css({ width: wd2 + "px" });

				if ((jQuery("#" + this.controlName + "_" + self.query + "_tablePagination_paginater").length > 0) && (jQuery("#" + this.controlName + "_" + self.query + "_tablePagination")[0].getBoundingClientRect().bottom < jQuery("#" + this.controlName + "_" + self.query + "_tablePagination_paginater")[0].getBoundingClientRect().bottom)) {

					jQuery("#" + this.controlName + "_" + self.query + "_tablePagination")

				}
			} catch (Error) {
			}
			
			//draw selected node
			self.RedrawSelectedNode();
			
			setInterval(function () {
				//verificar que sea pivot
				if ((jQuery("#" + self.controlName + "_" + self.query).length > 0) && (jQuery("#" + self.controlName + "_" + self.query)[0].getAttribute("class") === "pivot_table")) {
					if ((jQuery("#" + self.controlName + "_" + self.query + "_tablePagination_paginater").length > 0) && (jQuery("#" + self.controlName + "_" + self.query + "_tablePagination")[0].getBoundingClientRect().bottom < jQuery("#" + self.controlName + "_" + self.query + "_tablePagination_paginater")[0].getBoundingClientRect().bottom)) {
						jQuery("#" + this.controlName + "_" + self.query + "_tablePagination")
					}
				}
			},	150)

			


		}

		this.getDataForPivot = function (UcId, pageNumber, rowsPerPage, recalculateCantPages, AxisChangeDataField, DataFieldFilter,
			ExportTo, restoreDefaultView, layoutForCollapseExpand, notAutorefresh) {
			if ((recalculateCantPages)) {
				self.cleanGridCache();
			}

			if ((recalculateCantPages) && (rowsPerPage > -1)) {
				self.rowsPerPage = rowsPerPage;
			}
			self.pageData.PreviousPageNumber = self.pageData.ServerPageNumber
			if ((!recalculateCantPages) && (self.getPageDataFromCache(pageNumber))) {
				self.pageData.ServerPageNumber = pageNumber
				self.pageData.rows = self.getPageDataFromCache(self.pageData.ServerPageNumber)
				self.preGoWhenServerPagination(true);
			} else {
				//re-create axis info
				if (AxisChangeDataField != "") {
					self.pageData.AxisInfo = self.createAxisInfo(AxisChangeDataField);
				}
				
				
				
				if (DataFieldFilter != "") {
					self.createFilterInfo(DataFieldFilter);
				}
				self.pageData.CollapseInfo = self.CreateExpandCollapseInfo("");

				self.ExportTo = ""
				if (rowsPerPage < 0) { //for export show all pivot
					rowsPerPage = 0;
					self.ExportTo = ExportTo
				}

				var layoutChange = true;
				if ((pageNumber > 1) || (!recalculateCantPages)) {
					layoutChange = false;
				}
				if ((layoutForCollapseExpand != undefined) && (layoutForCollapseExpand != "")) {
					layoutChange = true;
				}

				self.pageData.AxisInfo = self.createAxisInfo(AxisChangeDataField);
				var ParmAxisInfo =  self.createNewAxisInfo(AxisChangeDataField);
				
				self.pageData.DataInfo = self.createDataInfo();
				var ParmDataInfo = self.createNewDataInfo();
				
				self.lastCallToQueryViewer = "DataForPivot"
				self.lastNotAutorefreshIndicator = notAutorefresh
				
				self.requestPageDataForPivotTable(pageNumber, rowsPerPage, recalculateCantPages, ParmAxisInfo, ParmDataInfo, self.pageData.FilterInfo, self.pageData.CollapseInfo, layoutChange);

				
			
			}

		}

		this.CreateExpandCollapseInfo = function (dataField) {
			var CollapseInfo = [];
			var obj = {};
			for (var i = 0; i < self.columns.length; i++) {
				var pos = -1;
				for (var j = 0; j < self.conditions.length; j++) {
					if (self.conditions[j].dataField == self.columns[i].getAttribute("dataField")) {
						pos = j;
					}
				}
				if (self.conditions[pos].collapsedValues.length) {
					var notNullVal = {
						Expanded: [],
						Collapsed: self.conditions[pos].collapsedValues,
						DefaultAction: "Expand"
					}
					var obj = {
						DataField: self.conditions[pos].dataField,
						NullExpanded: true,
						NotNullValues: notNullVal
					}
					CollapseInfo.push(obj);
				}
			}
			return CollapseInfo
		}

		this.createAxisInfo = function (dataField) {
			var AxisInfo = []; var hiddenPos = 1;
			for (var i = 0; i < self.initMetadata.Dimensions.length; i++) {
				var pos = -1;
				
				var hidden = !self.initMetadata.Dimensions[i].Visible;
				var type = "Rows"; var position = 1;
				var Order = "Ascending";
				var Subtotal = true;
				if (!hidden) {


					for (var j = 0; j < self.conditions.length; j++) {
						if (self.conditions[j].dataField == self.initMetadata.Dimensions[i].dataField) {
							pos = j;
						}
					}
					Order = (self.conditions[pos].sort == 1) ? "Ascending" : "Descending"
					Subtotal = ((self.conditions[pos].subtotals == 1) || (self.conditions[pos].subtotals)) ? true : false

					if (self.rowConditions.indexOf(pos) > -1) {
						position = self.rowConditions.indexOf(pos) + 1
					}
					if (self.colConditions.indexOf(pos) > -1) {
						type = "Columns";
						position = self.colConditions.indexOf(pos) + 1
					}
					if (self.filterIndexes.indexOf(pos) > -1) {
						type = "Pages";
						position = self.filterIndexes.indexOf(pos) + 1
					}
				} else {
					type = "Hidden"
					position = hiddenPos
					hiddenPos = hiddenPos + 1
				}
				var obj = {
					DataField: self.initMetadata.Dimensions[i].dataField,
					Order: Order,
					Axis: {
						Type: type,
						Position: position
					},
					Subtotals: Subtotal
				}
				AxisInfo.push(obj)
			}
			return AxisInfo;
		}
		
		
		this.createNewAxisInfo = function (dataField) {
			var AxisInfo = []; var hiddenPos = 1;
			var rowPos = 0; var cantRowHidden = 0;
			var colPos = 0; var cantColHidden = 0;
			var pagePos = 0; var cantPageHidden = 0;
			for (var i = 0; i < self.initMetadata.Dimensions.length; i++) {
				var pos = -1;
				//if hidden?
				var hidden = !self.initMetadata.Dimensions[i].Visible;
				/*for (var h=0; h < self.initMetadata.Dimensions.length; h++){
					if (self.columns[i].getAttribute("dataField") == self.initMetadata.Dimensions[h].dataField){
						hidden = !self.initMetadata.Dimensions[h].Visible
					}
				}*/

				var type = "Rows"; var position = 1;
				var Order = "Ascending";
				var Subtotal = true;
				if (!hidden) {


					for (var j = 0; j < self.conditions.length; j++) {
						if (self.conditions[j].dataField == self.initMetadata.Dimensions[i].dataField) {
							pos = j;
						}
					}
					Order = (self.conditions[pos].sort == 1) ? "Ascending" : "Descending"
					Subtotal = ((self.conditions[pos].subtotals == 1) || (self.conditions[pos].subtotals)) ? true : false

					if (self.rowConditions.indexOf(pos) > -1) {
						if (self.changesrowposition) {
							
							position = self.rowConditions.indexOf(pos) + 1 + cantRowHidden
							rowPos = position
							
							var posincol = self.rowConditions.indexOf(pos)
							var cont = 0; var noterminar = true;
							for (var iterRC = posincol+1; iterRC < self.rowConditions.length && noterminar; iterRC++) //buscar dimensiones desplazadas
							{	
								cont++
								if (self.rowConditions[iterRC] < pos) {
									
									dataFieldRC = self.conditions[self.rowConditions[iterRC]].dataField
									for (var itAI = 0; itAI < AxisInfo.length; itAI++)
									{
										if (dataFieldRC == AxisInfo[itAI].DataField) 
											positionDF = AxisInfo[itAI].Axis.Position
									}
									
									position = positionDF - cont/*AxisInfo[self.rowConditions[iterRC]].Axis.Position - cont*/
									rowPos = position
									noterminar = false
								}
							}
							
							/*if ((self.rowConditions.length > posincol+1) && (self.rowConditions[posincol+1] < pos)){
								position = AxisInfo[self.rowConditions[posincol+1]].Axis.Position - 1
								rowPos = position	
							} else {
								position = self.rowConditions.indexOf(pos) + 1 + cantRowHidden
								rowPos = position
							}*/
						} else {
							position = self.rowConditions.indexOf(pos) + 1 + cantRowHidden
							rowPos = position
						} 
					}
					if (self.colConditions.indexOf(pos) > -1) {
						type = "Columns";
						position = self.colConditions.indexOf(pos) + 1 + cantColHidden
						colPos = position 
					}
					if (self.filterIndexes.indexOf(pos) > -1) {
						type = "Pages";
						position = self.filterIndexes.indexOf(pos) + 1 + cantPageHidden
						pagePos = position
					}
				} else {
					
					if (self.initMetadata.Dimensions[i].defaultPosition != "hidden"){
						type = self.initMetadata.Dimensions[i].defaultPosition 
						if (type == "Rows") 
						{
							cantRowHidden=cantRowHidden + 1
							position = rowPos + 1
							rowPos = position
						}
						if (type == "Columns")
						{ 
							cantColHidden=cantColHidden + 1
							position = colPos + 1
							colPos = position
						}
						if (type == "Pages") 
						{ 
							cantPageHidden=cantPageHidden + 1
							position = pagePos + 1
							pagePos = position
						}
						
					} else {
						type = ""
						position = ""
					}
					
					//hiddenPos = hiddenPos + 1
					
				}
				var obj = {
					DataField: self.initMetadata.Dimensions[i].dataField,
					Order: Order,
					Axis: {
						Type: type,
						Position: position
					},
					Subtotals: Subtotal,
					Hidden:hidden
				}
				AxisInfo.push(obj)
			}
			return AxisInfo;
		}

		this.createDataInfo = function () {
			var DataInfo = []; var hiddenPos = 1;
			var visiblePos = 1
			for (var h = 0; h < self.initMetadata.Measures.length; h++) {

				//if hidden?
				var hidden = !self.initMetadata.Measures[h].Visible;

				var type = self.initMetadata.Measures[h].Visible ? "Data" : "Hidden";
				var position = self.initMetadata.Measures[h].Visible ? visiblePos : hiddenPos;


				var obj = {
					DataField: self.initMetadata.Measures[h].dataField,
					Axis: {
						Type: type,
						Position: position
					}
				}
				DataInfo.push(obj)
				if (self.initMetadata.Measures[h].Visible) {
					visiblePos = visiblePos + 1
				} else {
					hiddenPos = hiddenPos + 1
				}

			}
			return DataInfo;
		}
		
		
		this.createNewDataInfo = function () {
			var DataInfo = [];
			
			for (var h = 0; h < self.initMetadata.Measures.length; h++) {
				var hidden = !self.initMetadata.Measures[h].Visible;
				var obj = {
					DataField: self.initMetadata.Measures[h].dataField,
					Hidden: hidden,
					Position: h+1
				}
				DataInfo.push(obj)
			}
			return DataInfo;
		}

		this.createFilterInfo = function (NewFilter, isFromMetadata) {
			DataFieldFilter = self.conditions[NewFilter.dim].dataField
			if ((NewFilter.op == "all") || ((NewFilter.op == "pagefilter") && (NewFilter.values == "[all]"))) {
				//remove filter from filterInof
				var pos = -1;
				for (var p = 0; p < self.pageData.FilterInfo.length; p++) {
					if (DataFieldFilter == self.pageData.FilterInfo[p].DataField) { pos = p; break; }
				}
				if (pos > -1) self.pageData.FilterInfo.splice(pos, 1)
				self.conditions[NewFilter.dim].state = "all"
				self.conditions[NewFilter.dim].visibles = []
				self.conditions[NewFilter.dim].blackList = []
				self.conditions[NewFilter.dim].defaultAction = "Include"
				return;
			}

			if (self.conditions[NewFilter.dim].state == "none") {
				self.conditions[NewFilter.dim].visibles = []
				for (var u = 0; u < self.conditions[NewFilter.dim].distinctValues.length; u++) {
					if (self.conditions[NewFilter.dim].blackList.indexOf(self.conditions[NewFilter.dim].distinctValues[u]) == -1) {
						self.conditions[NewFilter.dim].blackList.push(self.conditions[NewFilter.dim].distinctValues[u])
					}
				}
			} else if (self.conditions[NewFilter.dim].state == "all") {
				self.conditions[NewFilter.dim].blackList = []
				for (var u = 0; u < self.conditions[NewFilter.dim].distinctValues.length; u++) {
					if (self.conditions[NewFilter.dim].visibles.indexOf(self.conditions[NewFilter.dim].distinctValues[u]) == -1) {
						self.conditions[NewFilter.dim].visibles.push(self.conditions[NewFilter.dim].distinctValues[u])
					}
				}
			}

			var notNullValue = [];
			if (NewFilter.op == "none") {
				notNullValue = [];
				self.conditions[NewFilter.dim].state = "none"
				self.conditions[NewFilter.dim].visibles = []
				self.conditions[NewFilter.dim].blackList = []
				self.conditions[NewFilter.dim].defaultAction = "Exclude"
			} else {
				if (NewFilter.op == "push") {
					self.conditions[NewFilter.dim].state = ""
					var pos = self.conditions[NewFilter.dim].visibles.indexOf(NewFilter.values)
					if (pos > -1) self.conditions[NewFilter.dim].visibles.splice(pos, 1);
					if (self.conditions[NewFilter.dim].blackList.indexOf(NewFilter.values) == -1)
						self.conditions[NewFilter.dim].blackList.push(NewFilter.values)
				} else if (NewFilter.op == "pop") {
					self.conditions[NewFilter.dim].state = ""
					if (self.conditions[NewFilter.dim].visibles.indexOf(NewFilter.values) == -1)
						self.conditions[NewFilter.dim].visibles.push(NewFilter.values)
					var pos = self.conditions[NewFilter.dim].blackList.indexOf(NewFilter.values)
					if (pos > -1) self.conditions[NewFilter.dim].blackList.splice(pos, 1);
				} else if (NewFilter.op == "pagefilter") {
					self.conditions[NewFilter.dim].state = ""
					self.conditions[NewFilter.dim].defaultAction = "Exclude"
					self.conditions[NewFilter.dim].visibles = [];
					self.conditions[NewFilter.dim].visibles.push(NewFilter.values);
					for (var p = 0; p < self.conditions[NewFilter.dim].distinctValues.length; p++) {
						var val = self.conditions[NewFilter.dim].distinctValues[p]
						if ((self.conditions[NewFilter.dim].blackList.indexOf(val) == -1) && (val != NewFilter.values)) {
							self.conditions[NewFilter.dim].blackList.push(val)
						}
					}
				} else if (NewFilter.op == "reverse") {
					if (self.conditions[NewFilter.dim].defaultAction == "Include") {
						self.conditions[NewFilter.dim].defaultAction = "Exclude"
					} else {
						self.conditions[NewFilter.dim].defaultAction = "Include"
					}
					if (self.conditions[NewFilter.dim].state == "none") {//si el estado anterior es none pasa a all
						var pos = -1;
						for (var p = 0; p < self.pageData.FilterInfo.length; p++) {
							if (DataFieldFilter == self.pageData.FilterInfo[p].DataField) { pos = p; break; }
						}
						if (pos > -1) self.pageData.FilterInfo.splice(pos, 1)
						self.conditions[NewFilter.dim].state = "all"
						self.conditions[NewFilter.dim].visibles = []
						self.conditions[NewFilter.dim].blackList = []
						return;
					} else if (self.conditions[NewFilter.dim].state == "all") {//si el estado anterior es all pasa a none
						notNullValue = [];
						self.conditions[NewFilter.dim].state = "none"
						self.conditions[NewFilter.dim].visibles = []
						self.conditions[NewFilter.dim].blackList = []
					} else {

						var tempArrayVisibles = []; for (var tit = 0; tit < self.conditions[NewFilter.dim].visibles.length; tit++) { tempArrayVisibles.push(self.conditions[NewFilter.dim].visibles[tit]) }
						var tempArrayHiddens = []; for (var tit = 0; tit < self.conditions[NewFilter.dim].blackList.length; tit++) { tempArrayHiddens.push(self.conditions[NewFilter.dim].blackList[tit]) }

						self.conditions[NewFilter.dim].visibles = []
						self.conditions[NewFilter.dim].blackList = []

						for (var u = 0; u < self.conditions[NewFilter.dim].distinctValues.length; u++) {
							var val = self.conditions[NewFilter.dim].distinctValues[u];
							if (tempArrayVisibles.indexOf(val) == -1) {
								self.conditions[NewFilter.dim].visibles.push(val)
							} else {
								self.conditions[NewFilter.dim].blackList.push(val)
							}
						}
						for (var u = 0; u < tempArrayHiddens.length; u++) {
							if (self.conditions[NewFilter.dim].visibles.indexOf(tempArrayHiddens[u]) == -1) {
								self.conditions[NewFilter.dim].visibles.push(tempArrayHiddens[u])
							}
						}
						for (var u = 0; u < tempArrayVisibles.length; u++) {
							if (self.conditions[NewFilter.dim].blackList.indexOf(tempArrayVisibles[u]) == -1) {
								self.conditions[NewFilter.dim].blackList.push(tempArrayVisibles[u])
							}
						}
					}
				}
			}

			var filterExist = false; var nullIncluded = true;
			var included = [];
			for (var t = 0; t < self.conditions[NewFilter.dim].visibles.length; t++) {
				if (self.conditions[NewFilter.dim].visibles[t] != "#NuN#") {
					included.push(self.conditions[NewFilter.dim].visibles[t])
				}
			}
			var excluded = [];
			if (self.conditions[NewFilter.dim].state != "none") {
				for (var t = 0; t < self.conditions[NewFilter.dim].distinctValues.length; t++) {
					var val = self.conditions[NewFilter.dim].distinctValues[t]
					if ((val != "#NuN#") && (included.indexOf(val) == -1)) {
						excluded.push(val)
					}
				}
				for (var t = 0; t < self.conditions[NewFilter.dim].blackList.length; t++) {
					if ((self.conditions[NewFilter.dim].blackList[t] != "#NuN#")
						&& (excluded.indexOf(self.conditions[NewFilter.dim].blackList[t]) == -1)) {
						excluded.push(self.conditions[NewFilter.dim].blackList[t])
					}
				}
				if ((included.length == 0) && ((self.conditions[NewFilter.dim].defaultAction == "Exclude"))) {
					excluded = [];
				}
			}

			if (NewFilter.op == "none") {
				nullIncluded = false;
				included = []; excluded = [];
			} else {
				if ((self.conditions[NewFilter.dim].distinctValues.indexOf("#NuN#") > -1) ||
					(excluded.indexOf(self.conditions[NewFilter.dim].blackList[t]) != -1)) {
					if (self.conditions[NewFilter.dim].visibles.indexOf("#NuN#") == -1) {
						nullIncluded = false;
					}
				} else {
					if (self.conditions[NewFilter.dim].defaultAction == "Exclude") {
						nullIncluded = false;
					}
				}
			}

			if ((self.conditions[NewFilter.dim].hasNull) && (!(NewFilter.op == "none"))) {
				//asociated psuedo-Null
				var reallyPseudoNull = self.defaultPicture.getAttribute("textForNullValues")
				var finded = false
				var data_length = 0;
				for (var u = 0; u < self.conditions[NewFilter.dim].distinctValues.length; u++) {
					data_length = self.conditions[NewFilter.dim].distinctValues[u].length;
				}
				for (var u = 0; u < self.conditions[NewFilter.dim].distinctValues.length; u++) {
					if (self.conditions[NewFilter.dim].distinctValues[u].trimpivot() == self.defaultPicture.getAttribute("textForNullValues")) {
						reallyPseudoNull = self.conditions[NewFilter.dim].distinctValues[u];
						finded = true;
						break;
					}
				}
				if (!finded) {
					for (var t = 0; t < data_length - self.defaultPicture.getAttribute("textForNullValues").length; t++) {
						reallyPseudoNull = reallyPseudoNull + " ";
					}
				}

				if (!nullIncluded) {
					if (excluded.indexOf(reallyPseudoNull) == -1) {
						excluded.push(reallyPseudoNull)
						if (self.conditions[NewFilter.dim].blackList.indexOf(reallyPseudoNull) == -1) {
							self.conditions[NewFilter.dim].blackList.push(reallyPseudoNull)
						}
					}
					if (included.indexOf(reallyPseudoNull) != -1) {
						included.splice(included.indexOf(reallyPseudoNull), 1)
					}
					if (self.conditions[NewFilter.dim].visibles.indexOf(reallyPseudoNull) != -1) {
						self.conditions[NewFilter.dim].visibles.splice(self.conditions[NewFilter.dim].visibles.indexOf(reallyPseudoNull), 1)
					}
				} else {
					if (included.indexOf(reallyPseudoNull) == -1) {
						if (excluded.indexOf(reallyPseudoNull) != -1) {
							excluded.splice(excluded.indexOf(reallyPseudoNull), 1)
							included.push(reallyPseudoNull)
						} else {
							if (self.conditions[NewFilter.dim].defaultAction == "Exclude") {
								included.push(reallyPseudoNull)
							}
						}
						if (self.conditions[NewFilter.dim].blackList.indexOf(reallyPseudoNull) != -1) {
							self.conditions[NewFilter.dim].blackList.splice(self.conditions[NewFilter.dim].blackList.indexOf(reallyPseudoNull), 1)
							if (self.conditions[NewFilter.dim].visibles.indexOf(reallyPseudoNull) == -1) {
								self.conditions[NewFilter.dim].visibles.push(reallyPseudoNull)
							}
						}
					}
				}
			}

			var allValuesLoaded = (self.conditions[NewFilter.dim].previousPage == self.conditions[NewFilter.dim].totalPages)
			var noFilterNeeded = (((nullIncluded) || (!self.conditions[NewFilter.dim].hasNull))
				&& (excluded.length == 0) && (NewFilter.op != "none") && (NewFilter.op != "push")
				&& ((self.conditions[NewFilter.dim].defaultAction == "Include") || (allValuesLoaded))
				&& (!isFromMetadata)
				&& (!(NewFilter.op == "reverse"))
			);

			var pos = 0; var toDelete = false;
			for (var t = 0; t < self.pageData.FilterInfo.length; t++) {
				if (self.pageData.FilterInfo[t].DataField == DataFieldFilter) {
					filterExist = true; toDelete = true;
					self.pageData.FilterInfo[t].NullIncluded = nullIncluded
					self.pageData.FilterInfo[t].NotNullValues.Included = included
					self.pageData.FilterInfo[t].NotNullValues.Excluded = excluded
					self.pageData.FilterInfo[t].NotNullValues.DefaultAction = self.conditions[NewFilter.dim].defaultAction
					pos = t;
				}
			}
			if ((noFilterNeeded) && (toDelete)) {
				self.pageData.FilterInfo.splice(pos, 1)
			}
			if ((!filterExist) && (!noFilterNeeded)) {
				var notNullValues = { Included: included, Excluded: excluded, DefaultAction: self.conditions[NewFilter.dim].defaultAction }
				filter = { DataField: DataFieldFilter, NullIncluded: nullIncluded, NotNullValues: notNullValues }
				self.pageData.FilterInfo.push(filter);
			}

		}

		this.moveToNextPage = function () {
			if (this.pageData.ServerPageNumber < this.pageData.ServerPageCount) {
				this.getDataForPivot(this.UcId, this.pageData.ServerPageNumber + 1, this.rowsPerPage, false, "", "", "", "")
			}
		}

		this.moveToFirstPage = function () {
			if (this.pageData.ServerPageNumber > 1) {
				this.getDataForPivot(this.UcId, 1, this.rowsPerPage, false, "", "", "", "");
			}
		}

		this.moveToLastPage = function () {
			if (this.pageData.ServerPageNumber < this.pageData.ServerPageCount) {
				this.getDataForPivot(this.UcId, this.pageData.ServerPageCount, this.rowsPerPage, false, "", "", "", "");
			}
		}

		this.moveToPreviousPage = function () {
			if (this.pageData.ServerPageNumber > 1) {
				self.getDataForPivot(UcId, this.pageData.ServerPageNumber - 1, this.rowsPerPage, false, "", "", "", "");
			}
		}

		this.preGoWhenServerPagination = function (load) {
			self.goWhenServerPagination(load, false);
		}


		this.readScrollValue = function (columnNumber) {
			var dataField = self.conditions[columnNumber].dataField;

			if (!self.conditions[columnNumber].blocked) {
				self.conditions[columnNumber].blocked = true;
				if (!self.conditions[columnNumber].filtered) {
					var page = self.conditions[columnNumber].previousPage + 1;
					self.lastRequestValue = columnNumber;
					self.lastRequestAttributeValues = "readScrollValueWithoutFilters"
					self.requestAttributeValues(dataField, page, 10, "")
					
					/*self.QueryViewerCollection[self.IdForQueryViewerCollection].getAttributeValues((function (resJSON) {
						var res = JSON.parse(resJSON);
						self.appendNewValueData(self.lastRequestValue, res)
					}).closure(this), [dataField, page, 10, ""]);*/
				} else {
					var ValuePageInfo = self.conditions[columnNumber].searchInfo
					var page = ValuePageInfo.previousPage + 1;
					self.lastRequestValue = dataField;
					var filterText = ValuePageInfo.filteredText
					
					self.lastRequestAttributeValues = "readScrollValueWithFilters"
					self.lastRequestAttributeColumnNumber = columnNumber
					self.lastRequestAttributeFilterText = filterText
					self.requestAttributeValues(dataField, page, 10, ValuePageInfo.filteredText)
					/*self.QueryViewerCollection[self.IdForQueryViewerCollection].getAttributeValues((function (resJSON) {
						var res = JSON.parse(resJSON);
						self.appendNewFilteredValueData(res, columnNumber, filterText)
					}).closure(this), [dataField, page, 10, ValuePageInfo.filteredText]);*/
				}
			}
		}

		this.getValuesForColumn = function (UcId, columnNumber, filterValue) {
			var dataField = self.conditions[columnNumber].dataField;
			if (filterValue != "") {
				var page = 1
				var filterValuePars = filterValue.replace(/\\/g, "\\\\")
				
				self.lastRequestAttributeValues = "ValuesForColumn"
				self.lastRequestAttributeColumnNumber = columnNumber
				self.lastRequestAttributeFilterText = filterValuePars
				self.lastRequestAttributeDataField = dataField
				self.lastRequestAttributeUcId = UcId
				self.requestAttributeValues(dataField, page, 10, filterValuePars)
				
				
				/*self.QueryViewerCollection[self.IdForQueryViewerCollection].getAttributeValues((function (resJSON) {
					var res = JSON.parse(resJSON);
					self.changeValues(UcId, dataField, columnNumber, res, filterValuePars);
				}).closure(this), [dataField, page, 10, filterValuePars]);*/
			} else {
				self.resetScrollValue(UcId, dataField, columnNumber)
			}
		}

		this.appendNewValueData = function (columnNumber, data) {
			if (data.PageNumber > self.conditions[columnNumber].previousPage) {
				self.conditions[columnNumber].previousPage = data.PageNumber
				self.conditions[columnNumber].totalPages = data.PagesCount
				var newValues = [];

				if (data.Null) {
					if (self.conditions[columnNumber].indexOf("#NuN#") == -1) {
						self.conditions[columnNumber].distinctValues.push("#NuN#")
					}
				}

				//add to differentValues
				for (var i = 0; i < data.NotNullValues.length; i++) {
					var val = data.NotNullValues[i]
					if (self.conditions[columnNumber].distinctValues.indexOf(val) == -1) {
						self.conditions[columnNumber].distinctValues.push(val)
						newValues.push(val)
					}//lo mismo
					if (self.conditions[columnNumber].defaultAction == "Include") {
						if ((self.conditions[columnNumber].visibles.indexOf(val) == -1)
							&& (self.conditions[columnNumber].blackList.indexOf(val) == -1)) {
							self.conditions[columnNumber].visibles.push(val)
						}
					} else {
						if ((self.conditions[columnNumber].visibles.indexOf(val) == -1)
							&& (self.conditions[columnNumber].blackList.indexOf(val) == -1)) {
							self.conditions[columnNumber].blackList.push(val)
						}
					}
				}

				for (var nI = 0; nI < newValues.length; nI++) {
					var checked = true;
					if (self.conditions[columnNumber].state != "all") {
						if (self.conditions[columnNumber].blackList.indexOf(newValues[nI]) != -1) {
							checked = false;
						}
					}

					if (!((self.conditions[columnNumber].hasNull) && (newValues[nI].trimpivot() == self.defaultPicture.getAttribute("textForNullValues")))) {
						self.appendNewPairToPopUp(newValues[nI], columnNumber, checked)
					}
				}
			}
			if (self.conditions[columnNumber].previousPage < data.PagesCount)
				self.conditions[columnNumber].blocked = false;
		}

		this.changeValues = function (UcId, dataField, columnNumber, data, filterText) { //when filter by search filter, delete pairs and show new ones
			var searchInput = jQuery("#" + UcId + columnNumber)[0];

			var sInput = searchInput.value;
			if (searchInput.value) {
				sInput = sInput.replace(/\\/g, "\\\\")
			}
			if (((searchInput.value) || (searchInput.value == "")) && (sInput != filterText)) {
				return;
			}

			self.conditions[columnNumber].filtered = true;
			self.conditions[columnNumber].blocked = true;
			self.removeAllPairsFromPopUp(columnNumber, data.PagesCount > 1);

			//set filtered pagination info
			self.conditions[columnNumber].searchInfo.previousPage = 1
			self.conditions[columnNumber].searchInfo.totalPages = data.PagesCount
			self.conditions[columnNumber].searchInfo.filteredText = filterText;

			for (var i = 0; i < data.NotNullValues.length; i++) {
				var value = data.NotNullValues[i]
				var alreadyInValues = (self.conditions[columnNumber].distinctValues.indexOf(value) != -1)
				//append to different values
				if (self.conditions[columnNumber].distinctValues.indexOf(value) == -1) {
					self.conditions[columnNumber].distinctValues.push(value)
				}
				if ((self.conditions[columnNumber].state == "all") ||
					((self.conditions[columnNumber].defaultAction == "Include") && (!alreadyInValues))) {
					//if Include new values and is a new value
					if ((self.conditions[columnNumber].visibles.indexOf(value) == -1)
						&& (self.conditions[columnNumber].blackList.indexOf(value) == -1)) {
						self.conditions[columnNumber].visibles.push(value)
					}
				}
				//


				var checked = true;
				if (self.conditions[columnNumber].state != "all") {
					if (self.conditions[columnNumber].visibles.indexOf(value) < 0) {
						checked = false;
					}
				}
				self.conditions[columnNumber].searchInfo.values.push(value);
				if (!((self.conditions[columnNumber].hasNull) && (value.trimpivot() == self.defaultPicture.getAttribute("textForNullValues")))) {
					self.appendNewPairToPopUp(value, columnNumber, checked);
				}
			}

			if (data.PagesCount > 0)
				self.conditions[columnNumber].blocked = false;
		}

		this.resetScrollValue = function (UcId, dataField, columnNumber) { //after filtered when input serach is clean, restor values without filter
			self.conditions[columnNumber].filtered = false;
			self.conditions[columnNumber].blocked = true;

			self.removeAllPairsFromPopUp(columnNumber, data.PagesCount > 1);

			for (var u = 0; u < self.conditions[columnNumber].distinctValues.length; u++) {
				var checked = true;
				var value = self.conditions[columnNumber].distinctValues[u];
				if (self.conditions[columnNumber].state != "all") {
					if (self.conditions[columnNumber].visibles.indexOf(value) < 0) {
						checked = false;
					}
				}

				if (!((self.conditions[columnNumber].hasNull) && (value.trimpivot() == self.defaultPicture.getAttribute("textForNullValues")))) {
					self.appendNewPairToPopUp(value, columnNumber, checked)
				}
			}

			if (self.conditions[columnNumber].previousPage < self.conditions[columnNumber].totalPages)
				self.conditions[columnNumber].blocked = false;
		}

		this.resetAllScrollValue = function (UcId) { //when closing the filter popup
			for (var id = 0; id < self.conditions.length; id++) {
				self.conditions[id].filtered = false;
				self.conditions[id].blocked = true;
				if (self.conditions[id].previousPage < self.conditions[id].totalPages)
					self.conditions[id].blocked = false;
			}
		}

		this.appendNewFilteredValueData = function (data, columnNumber, filterValue) { //add pairs when filtering by filter input
			var dataField = self.lastRequestValue

			var ValuePageInfo = self.conditions[columnNumber].searchInfo
			if (((filterValue) || (filterValue == "")) && (ValuePageInfo.filteredText != filterValue)) {
				return;
			}
			if (data.PageNumber > ValuePageInfo.previousPage) {
				self.conditions[columnNumber].searchInfo.previousPage = data.PageNumber
				self.conditions[columnNumber].searchInfo.totalPages = data.PagesCount

				if (data.Null) {
					if (self.conditions[columnNumber].distinctValues.indexOf("#NuN#") == -1) {
						self.conditions[columnNumber].distinctValues.push("#NuN#")
					}
				}

				for (var i = 0; i < data.NotNullValues.length; i++) {
					var value = data.NotNullValues[i]
					var alreadyInValues = (self.conditions[columnNumber].distinctValues.indexOf(value) != -1)
					//append to different values
					if (self.conditions[columnNumber].distinctValues.indexOf(value) == -1) {
						self.conditions[columnNumber].distinctValues.push(value)
					}
					if ((self.conditions[columnNumber].defaultAction == "Include") && (!alreadyInValues)) {
						if ((self.conditions[columnNumber].visibles.indexOf(value) == -1)
							&& (self.conditions[columnNumber].blackList.indexOf(value) == -1)) {
							self.conditions[columnNumber].visibles.push(value)
						}
					} else {
						if ((self.conditions[columnNumber].visibles.indexOf(value) == -1)
							&& (self.conditions[columnNumber].blackList.indexOf(value) == -1)) {
							self.conditions[columnNumber].blackList.push(value)
						}
					}

					var checked = true;
					if (self.conditions[columnNumber].state != "all") {
						if (self.conditions[columnNumber].visibles.indexOf(value) < 0) {
							checked = false;
						}
					}
					if (!((self.conditions[columnNumber].hasNull) && (value.trimpivot() == self.defaultPicture.getAttribute("textForNullValues")))) {
						self.appendNewPairToPopUp(value, columnNumber, checked)
					}
				}
				if (self.conditions[columnNumber].searchInfo.previousPage < self.conditions[columnNumber].searchInfo.totalPages)
					self.conditions[columnNumber].blocked = false;
			}
		},

			this.appendNewPairToPopUp = function (value, colNumber, checked) {
				var getPair = function (text, id, check) {
					var div = OAT.Dom.create("div");
					var class_check_div = check ? "check_item_img" : "uncheck_item_img";
					if (self.isSD) {
						class_check_div = check ? "check_item_img_small" : "uncheck_item_img_small";
					}
					
					OAT.addImageNode(div, check  ? "check_box" : "check_box_outline_blank", "");

					div.setAttribute("class", class_check_div);
					var ch = OAT.Dom.create("input");
					ch.type = "checkbox";
					ch.id = id;
					var t = OAT.Dom.create("label");
					OAT.addTextNode(t, text)
					t.htmlFor = id;
					div.appendChild(t);
					return [div, ch];
				}

				var getRefBool = function (checked, value) {
					
						var oper = "pop";
						if (!checked) {
							oper = "push";
						}

						self.getDataForPivot(self.UcId, 1, self.rowsPerPage, true, self.conditions[colNumber].dataField, { op: oper, values: value, dim: colNumber }, "", "")

						self.stateChanged = true;
						self.onFilteredChangedEventHandleWhenServerPagination(colNumber);
						self.EneablePivot();
						return;
					
				}


				var pict_value = self.dimensionPictureValue(value, colNumber);
				if (value == "#NuN#") {
					pict_value = "\u00A0"
				}
				pict_value = pict_value.replace(/\&amp;/g, "&").replace(/\&nbsp;/g, " ")
				if (pict_value.length > 33) {
					var resto = (pict_value.substring(32, pict_value.length).trimpivot().length > 0) ? '...' : '';
					pict_value = pict_value.substring(0, 32) + resto
				}

				pict_value = pict_value.replace(/ /g, "\u00A0") + '\u00A0\u00A0\u00A0\u00A0\u00A0'
				var pair = getPair(pict_value, "pivot_distinct_" + i, checked);
				pair[0].setAttribute('value', value);
				var fixHeigthDiv = jQuery("#values_" + self.UcId + "_" + colNumber)[0]
				fixHeigthDiv.appendChild(pair[0]);

				if (fixHeigthDiv.children.length > 9) {
					fixHeigthDiv.setAttribute("class", "pivot_popup_fix");
				}

				OAT.Dom.attach(pair[0], "click", function () {
					self.DiseablePivot();

					var checkedClass = "check_item_img"
					var unCheckedClass = "uncheck_item_img"
					if (self.isSD) {//android
						checkedClass = "check_item_img_small"
						unCheckedClass = "uncheck_item_img_small"
					}

					var checked = !(this.getAttribute("class") === checkedClass);
					var newClass = (this.getAttribute("class") === checkedClass) ? unCheckedClass : checkedClass;
					
					jQuery(this).find("i")[0].textContent = checked ? "check_box" : "check_box_outline_blank";
					
					this.setAttribute("class", newClass);
					getRefBool(checked, this.getAttribute("value"));//this.textContent);            														
				});
			}

		this.removeAllPairsFromPopUp = function (colNumber, withScroll) {
			var checkedClass = "check_item_img"
			var unCheckedClass = "uncheck_item_img"
			if (self.isSD) {//android
				checkedClass = "check_item_img_small"
				unCheckedClass = "uncheck_item_img_small"
			}

			jQuery("#values_" + self.UcId + "_" + colNumber).find("." + checkedClass).remove()
			jQuery("#values_" + self.UcId + "_" + colNumber).find("." + unCheckedClass).remove()

			jQuery(".last_div_popup ." + checkedClass).remove()
			jQuery(".last_div_popup ." + unCheckedClass).remove()

			//set class of pairs container
			if (withScroll) {
				jQuery("#values_" + self.UcId + "_" + colNumber).removeClass("pivot_popup_auto");
				jQuery("#values_" + self.UcId + "_" + colNumber).addClass("pivot_popup_fix");
			} else {
				jQuery("#values_" + self.UcId + "_" + colNumber).removeClass("pivot_popup_fix");
				jQuery("#values_" + self.UcId + "_" + colNumber).addClass("pivot_popup_auto");
			}
		}

		var alreadyclicked = false;
		var alreadyclickedTimeout;
		this.onClickEventHandle = function (elemvalue, type, number, item) {
			self.ClickHandle(elemvalue);

		}

		this.onClickExpandCollapse = function (elemvalue) {

			var value = jQuery(elemvalue).data('itemValue');
			//var type = jQuery(elemvalue).data('typeMorD');
			var number = jQuery(elemvalue).data('numberMorD');
			var item = jQuery(elemvalue).data('itemInfoEC');
			if (self.conditions[number].collapsedValues.indexOf(value) == -1) {
				//collapse value
				self.conditions[number].collapsedValues.push(value);
				self.ExpandCollapseHandleWhenServerPagination(elemvalue, "collapse")
				
			} else {
				//expand value
				self.conditions[number].collapsedValues.splice(self.conditions[number].collapsedValues.indexOf(value), 1);
				self.ExpandCollapseHandleWhenServerPagination(elemvalue, "expande")
				
			}
			
			
			//self.go(false);
			
		}



		this.cleanValueForNull = function (value) {
			if (value == "#NuN#") {
				var defaultNull = self.defaultPicture.getAttribute("textForNullValues");
				if (defaultNull != undefined) {
					return defaultNull;
				}
				return "";
			}
			return value;
		}

		this.isClickedRow = function (row, value, columnOfValue, otherrow, dimension, isColumnDimensionValue) {
			if (!isColumnDimensionValue){
				if (self.rowConditions.indexOf(dimension) == -1) {
					return true;
				}
				for (var col = 0; col < columnOfValue; col++) {
					var dimensionNumber = self.rowConditions[col];
					if (row[dimensionNumber] != otherrow[dimensionNumber]) {
						return false;
					}
				}
			}	
			else 
			{
				if (self.colConditions.indexOf(dimension) == -1) {
					return true;
				}
				for (var col = 0; col < columnOfValue; col++) {
					var dimensionNumber = self.colConditions[col];
					if (row[dimensionNumber] != otherrow[dimensionNumber]) {
						return false;
					}
				}
			}
			return true;
		}

		this.isClickedRowMeasure = function (row, value, otherrow) {
			for (var col = 0; col < row.length; col++) {
				if ((row[col] != undefined) && (row[col] != otherrow[col])) {
					return false;
				}
			}
			return true;
		}

		this.onClickSelectNode = function (elemvalue) { 
			var value = jQuery(elemvalue).data('itemValue');
			var type = jQuery(elemvalue).data('typeMorD');
			var number = jQuery(elemvalue).data('numberMorD');
			var item = jQuery(elemvalue).data('itemInfo');
			
			
			self.selection.SelectedNode = [];
			
			self.SelectNodes(value, type, number, item);
			
		}
		
		this.requestDataSynForPivotTable = function(){
			setTimeout( function() {
				var paramobj = {"QueryviewerId": self.IdForQueryViewerCollection};
				var evt = document.createEvent("Events")
				evt.initEvent("RequestDataSynForPivotTable", true, true);
				evt.parameter = paramobj;
				document.dispatchEvent(evt);
			}, 0)
		}
		
		this.ClickHandle = function (elemvalue) { 
			
			self.LastElemValue = elemvalue
			
			self.requestDataSynForPivotTable()
		}
		
		this.setDataSynForPivotTable = function(serverData){
			var elemvalue = self.LastElemValue
			var temp = serverData
			
			var value = jQuery(elemvalue).data('itemValue');
			var type = jQuery(elemvalue).data('typeMorD');
			var number = jQuery(elemvalue).data('numberMorD');
			var item = jQuery(elemvalue).data('itemInfo');
			var selected = OAT.IsNodeSelected(elemvalue.parentElement);
			var datastr = "<DATA><ITEM type=\"" + type + "\" ";
			
			
			if (type === "MEASURE") {
				datastr = datastr + "name=\"" + measures[number].getAttribute("name") + "\" ";
				datastr = datastr + "displayName=\"" + measures[number].getAttribute("displayName") + "\" ";
				datastr = datastr + "selected=\"" + selected.toString() + "\" ";
				datastr = datastr + "location=\"data\">"
				datastr = datastr + self.cleanValueForNull(value)
			} else {//DIMENSION
				datastr = datastr + "name=\"" + self.columns[number].getAttribute("name") + "\" ";
				datastr = datastr + "displayName=\"" + self.columns[number].getAttribute("displayName") + "\" ";
				datastr = datastr + "selected=\"" + selected.toString() + "\" ";
				
				if ((item != "") && (((item.axis != undefined) &&  (item.axis == "columns")) || (item[4] == "columns") ))
					datastr = datastr + "location=\"columns\">"
				else
					datastr = datastr + "location=\"rows\">"
				datastr = datastr + self.cleanValueForNull(value)
			}

			datastr = datastr + "</ITEM>";
			//datastr = datastr + "</DATA>";

			datastr = datastr + "<CONTEXT>";
			datastr = datastr + "<RELATED>";
			var previuosDat = datastr;
			try {
				
					var dataFieldsList = []
					for (var i = 0; i < self.conditions.length; i++){
						if (self.conditions[i].dataField != undefined) {
							dataFieldsList.push(self.conditions[i].dataField)
						} 
					}
					for (var i = 0; i < measures.length; i++){
						if (measures[i].getAttribute("dataField") != undefined) {
							dataFieldsList.push(measures[i].getAttribute("dataField"))
						}
					}

					//if (self.allRowsPivot == "vacio") {
						self.allRowsPivot = []
						self.allFullRowsPivot = []
						
						
						
						//var temp = self.QueryViewerCollection[self.IdForQueryViewerCollection].getPivottableDataSync();
						var stringRecord = temp.split("<Record>")
						for (var i = 1; i < stringRecord.length; i++) {
							var recordData = [];
							var fullRecordData = [];
							for (var j = 0; j < dataFieldsList.length; j++) {
								recordData[j] = "#NuN#"
								var dt = stringRecord[i].split("<" + dataFieldsList[j] + ">")
								if (dt.length > 1) {
									var at = dt[1].split("</" + dataFieldsList[j] + ">")
									recordData[j] = at[0]
									fullRecordData[j] = recordData[j]
								} else {
									if (stringRecord[i].indexOf("<" + dataFieldsList[j] + "/>") >= 0) {
										recordData[j] = ""
										fullRecordData[j] = ""
									} else {
										recordData[j] = "#NuN#"
										fullRecordData[j] = "#NuN#"
									}
								}
							}
							if ((type == "MEASURE") && (self.formulaInfo.cantFormulaMeasures) && (self.formulaInfo.measureFormula[number].hasFormula)){
								recordData[number + this.columns.length] = parseFloat(recordData[number + this.columns.length]).toFixed(15).toString()
								fullRecordData[number + this.columns.length] = parseFloat(fullRecordData[number + this.columns.length]).toFixed(15).toString()
							} 
								
							self.allRowsPivot.push(recordData);

							//add hide columns values
							for (var j = 0; j < self.HideDataFilds.length; j++) {
								var dt = stringRecord[i].split("<" + self.HideDataFilds[j] + ">")
								if (dt.length > 1) {
									var at = dt[1].split("</" + self.HideDataFilds[j] + ">")
									fullRecordData[fullRecordData.length] = at[0]
								} else {
									if (stringRecord[i].indexOf("<" + self.HideDataFilds[j] + "/>") >= 0) {
										fullRecordData[fullRecordData.length] = ""
									} else {
										fullRecordData[fullRecordData.length] = "#NuN#"
									}
								}
							}
							self.allFullRowsPivot.push(fullRecordData);

						}

					//}

					var isNotSubtotal = false;
					if (item.row) {
						isNotSubtotal = !item.row.subTotal
						if ((!isNotSubtotal) && (item.isTotal != undefined) && (!item.isTotal)) {
							isNotSubtotal = true;
						}
					}
					
					
					var isColumnDimensionValue = (item.axis != undefined) && (item.axis == "columns")
					if (isColumnDimensionValue){
						isNotSubtotal = true;
					}
					
					
					if (((item.row != undefined) || isColumnDimensionValue) && (isNotSubtotal)) {
						var row = item.row
						var cellNumber = item.cell
						var numRow = self.pageData.rows.indexOf(row)
						var colPos = item.cell
						var numCol = self.pageData.columnsHeaders[colPos]
						
						if (isColumnDimensionValue){
							cellNumber = item.rownumber
							colPos = item.columnnumber
							numCol = self.pageData.columnsHeaders[colPos]
						}
						
						var pseudoRow = [];
						for (var i = 0; i < self.pageData.dataFields.length; i++) {
							pseudoRow[i] = undefined;
						}
						
						
						if (item.row != undefined) {
							for (var i = 0; i < row.headers.length; i++) {
								var pos = dataFieldsList.indexOf(row.headers[i].dataField) //self.pageData.dataFields.indexOf(row.headers[i].dataField)
								if ((row.headers[i] != undefined) && (row.headers[i].value != undefined)) {
									pseudoRow[pos] = row.headers[i].value
								}
							}
						}
						if (numCol != undefined){
							for (var i = 0; i < numCol.subHeaders.length; i++) {
								if ((isColumnDimensionValue) && (item.rownumber < i)) break;
								if (numCol.subHeaders[i] != undefined) {
									var pos = self.pageData.dataFields.indexOf(numCol.subHeaders[i].dataField)
									if (numCol.subHeaders[i].value != undefined) {
										pseudoRow[pos] = numCol.subHeaders[i].value
									}
								}
							}
						}

						for (var i = 0; i < this.columns.length; i++) {
							datastr = datastr + "<ITEM name=\"" + this.columns[i].getAttribute("name") + "\">"
							datastr = datastr + "<VALUES";
							var existNullValue = false;
							var stringValues = "";
							
							if ((type === "MEASURE")) {
								if (pseudoRow[i] != undefined) {
									if (pseudoRow[i] != "#NuN#"){	
										stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(pseudoRow[i]) + "</VALUE>";
									} else {
										existNullValue = true
									}
								} else {
									if (self.filterIndexes.indexOf(i) != -1) {
										var prevValues = [];
										for (var iCV = 0; iCV < self.allRowsPivot.length; iCV++) {
											if ((prevValues.indexOf(self.allRowsPivot[iCV][i]) === -1) && (self.filterOK(self.allRowsPivot[iCV])) &&
												self.isClickedRowMeasure(pseudoRow, value, self.allRowsPivot[iCV])) {
												prevValues = prevValues.concat(self.allRowsPivot[iCV][i])
												if (self.allRowsPivot[iCV][i] != "#NuN#"){	
													stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(self.allRowsPivot[iCV][i]) + "</VALUE>";
												} else {
													existNullValue = true
												}
											}
										}
									}
								}
							} else {
								var prevValues = [];
								for (var iCV = 0; iCV < self.allRowsPivot.length; iCV++) {
									if ((self.allRowsPivot[iCV][number] === value) && (self.isClickedRow(pseudoRow, value, cellNumber, self.allRowsPivot[iCV], number, isColumnDimensionValue))
										&& (prevValues.indexOf(self.allRowsPivot[iCV][i]) === -1) && self.filterOK(self.allRowsPivot[iCV])) {
										prevValues = prevValues.concat(self.allRowsPivot[iCV][i])
										if (self.allRowsPivot[iCV][i] != "#NuN#"){
											stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(self.allRowsPivot[iCV][i]) + "</VALUE>";
										} else {
											existNullValue = true
										}
									}
								}
							}
							
							if (existNullValue){
								datastr = datastr + " Null=\"true\""
							}
							datastr = datastr + ">" + stringValues 
							datastr = datastr + "</VALUES>";
							datastr = datastr + "</ITEM>";
						}

						for (var i = 0; i < measures.length; i++) {
							datastr = datastr + "<ITEM name=\"" + measures[i].getAttribute("name") + "\">"
							datastr = datastr + "<VALUES";
							var existNullValue = false;
							var stringValues = "";
							
							if (type === "MEASURE") {
								if (pseudoRow[i + this.columns.length] != undefined) {
									if (pseudoRow[i + this.columns.length] != "#NuN#"){
										stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(pseudoRow[i + this.columns.length]) + "</VALUE>";
									} else {
										existNullValue = true
									}
								} else {
									if (number == i) {
										if (value != "#NuN#"){
											stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(value) + "</VALUE>";
										} else {
											existNullValue = true
										}
									} else {
										var prevValues = [];
										for (var iCV = 0; iCV < self.allRowsPivot.length; iCV++) {
											if ((parseFloat(self.allRowsPivot[iCV][number + this.columns.length]) === parseFloat(value)) && (self.isClickedRowMeasure(pseudoRow, value, self.allRowsPivot[iCV]))
												&& self.filterOK(self.allRowsPivot[iCV]) && (prevValues.indexOf(self.allRowsPivot[iCV][i + this.columns.length]) === -1)) {
												if (self.allRowsPivot[iCV][i + this.columns.length] != "#NuN#"){
													stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(self.allRowsPivot[iCV][i + this.columns.length]) + "</VALUE>";
												} else {
													existNullValue = true
												}
											}
										}
									}
								}
							} else {
								var prevValues = [];
								for (var iCV = 0; iCV < self.allRowsPivot.length; iCV++) {
									if ((self.allRowsPivot[iCV][number] === value) && (self.isClickedRow(pseudoRow, value, cellNumber , self.allRowsPivot[iCV], number, isColumnDimensionValue))
										&& self.filterOK(self.allRowsPivot[iCV]) && (prevValues.indexOf(self.allRowsPivot[iCV][i + this.columns.length]) === -1)) {
										prevValues = prevValues.concat(self.allRowsPivot[iCV][i + this.columns.length])
										if (self.allRowsPivot[iCV][i + this.columns.length] != "#NuN#"){
											stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(self.allRowsPivot[iCV][i + this.columns.length]) + "</VALUE>";
										} else {
											existNullValue = true
										}
									}
								}
							}
							
							if (existNullValue){
								datastr = datastr + " Null=\"true\""
							}
							datastr = datastr + ">" + stringValues 
							datastr = datastr + "</VALUES>";
							datastr = datastr + "</ITEM>";
						}

						//add hidden values
						for (var i = 0; i < self.HideDataFilds.length; i++) {
							datastr = datastr + "<ITEM name=\"" + self.OrderFildsHidden[i] + "\">"
							datastr = datastr + "<VALUES";
							var existNullValue = false;
							var stringValues = "";
							
							var coinc = function (row1, row2) {
								for (var o = 0; o < row1.length; o++) {
									if ((row1[o] != undefined) && (row1[o] != row2[o])) {
										return false;
									}
								}
								return true;
							}
							
							var stringValues = "";
							if (type === "MEASURE") {
								var prevValues = [];
								for (var iCV = 0; iCV < self.allFullRowsPivot.length; iCV++) {
									if (coinc(pseudoRow, self.allFullRowsPivot[iCV]) && self.isClickedRowMeasure(pseudoRow, value, self.allFullRowsPivot[iCV])
										&& self.filterOK(self.allFullRowsPivot[iCV]) && (prevValues.indexOf(self.allFullRowsPivot[iCV][i + this.columns.length + measures.length]) === -1)) {
										prevValues = prevValues.concat(self.allFullRowsPivot[iCV][i + this.columns.length + measures.length])
										if (self.allFullRowsPivot[iCV][i + this.columns.length + measures.length] != "#NuN#"){
											stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(self.allFullRowsPivot[iCV][i + this.columns.length + measures.length]) + "</VALUE>";
										} else {
											existNullValue = true
										}
									}
								}
							} else {
								var prevValues = [];
								for (var iCV = 0; iCV < self.allFullRowsPivot.length; iCV++) {
									if ((self.allFullRowsPivot[iCV][number] === value) && (self.isClickedRow(pseudoRow, value, cellNumber, self.allFullRowsPivot[iCV], number, isColumnDimensionValue))
										&& self.filterOK(self.allFullRowsPivot[iCV]) && (prevValues.indexOf(self.allFullRowsPivot[iCV][i + this.columns.length + measures.length]) === -1)) {
										prevValues = prevValues.concat(self.allFullRowsPivot[iCV][i + this.columns.length + measures.length])
										if (self.allFullRowsPivot[iCV][i + this.columns.length + measures.length] != "#NuN#"){
											stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(self.allFullRowsPivot[iCV][i + this.columns.length + measures.length]) + "</VALUE>";
										} else {
											existNullValue = true
										}
									}
								}
							}
							
							
							if (existNullValue){
								datastr = datastr + " Null=\"true\""
							}
							datastr = datastr + ">" + stringValues 
							datastr = datastr + "</VALUES>";
							datastr = datastr + "</ITEM>";
						}
					} else {
						if (item === "GrandTotal") {	//Grand Total, include all data

							for (var i = 0; i < this.columns.length; i++) {
								datastr = datastr + "<ITEM name=\"" + this.columns[i].getAttribute("name") + "\">"
								datastr = datastr + "<VALUES";
								var existNullValue = false;
								var stringValues = "";
							
								var prevValues = [];
								for (var iCV = 0; iCV < self.allRowsPivot.length; iCV++) {
									if ((prevValues.indexOf(self.allRowsPivot[iCV][i]) === -1) && self.filterOK(self.allRowsPivot[iCV])) {
										prevValues = prevValues.concat(self.allRowsPivot[iCV][i])
										if (self.allRowsPivot[iCV][i] != "#NuN#"){
											stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(self.allRowsPivot[iCV][i]) + "</VALUE>";
										} else {
											existNullValue = true
										}
									}
								}
								
								if (existNullValue){
									datastr = datastr + " Null=\"true\""
								}
								datastr = datastr + ">" + stringValues 
								datastr = datastr + "</VALUES>";
								datastr = datastr + "</ITEM>";
							}

							//add hide values
							for (var i = 0; i < self.HideDataFilds.length; i++) {
								datastr = datastr + "<ITEM name=\"" + self.OrderFildsHidden[i] + "\">"
								datastr = datastr + "<VALUES";
								var existNullValue = false;
								var stringValues = "";
								
								var prevValues = [];
								for (var iCV = 0; iCV < self.allFullRowsPivot.length; iCV++) {
									if ((prevValues.indexOf(self.allFullRowsPivot[iCV][i + this.columns.length + measures.length]) === -1) && self.filterOK(self.allFullRowsPivot[iCV])) {
										prevValues = prevValues.concat(self.allFullRowsPivot[iCV][i + this.columns.length + measures.length])
										if (self.allFullRowsPivot[iCV][i + this.columns.length + measures.length] != "#NuN#"){
											stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(self.allFullRowsPivot[iCV][i + this.columns.length + measures.length]) + "</VALUE>";
										} else {
											existNullValue = true
										}
									}
								}
								if (existNullValue){
									datastr = datastr + " Null=\"true\""
								}
								datastr = datastr + ">" + stringValues 
								datastr = datastr + "</VALUES>";
								datastr = datastr + "</ITEM>";
							}


							for (var i = 0; i < measures.length; i++) {
								datastr = datastr + "<ITEM name=\"" + measures[i].getAttribute("name") + "\">"
								datastr = datastr + "<VALUES";
								var existNullValue = false;								
								var stringValues = "";
								
								var prevValues = [];
								for (var iCV = 0; iCV < self.allRowsPivot.length; iCV++) {
									if ((prevValues.indexOf(self.allRowsPivot[iCV][i + this.columns.length]) === -1) && self.filterOK(self.allRowsPivot[iCV])) {
										prevValues = prevValues.concat(self.allRowsPivot[iCV][i + this.columns.length])
										if (self.allRowsPivot[iCV][i + this.columns.length] != "#NuN#"){
											stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(self.allRowsPivot[iCV][i + this.columns.length]) + "</VALUE>";
										} else {
											existNullValue = true
										}
									}
								}
								
								if (existNullValue){
									datastr = datastr + " Null=\"true\""
								}
								datastr = datastr + ">" + stringValues 
								datastr = datastr + "</VALUES>";
								datastr = datastr + "</ITEM>";
							}


						} else if (item[0] === 'PtrTotals') {
							var row = item[2]
							var colPos = item[3]
							if (colPos > -1) {
								var numCol = self.pageData.columnsHeaders[colPos]
							}
							
							isColumnDimensionValue = (item[4] == "columns")
							var rownumber = item[5]
							var pseudoRow = [];
							
							for (var i = 0; i < self.pageData.dataFields.length; i++) {
								pseudoRow[i] = undefined;
							}
							
							if (!isColumnDimensionValue) {
								for (var i = 0; i < row.headers.length; i++) {
									var pos = self.pageData.dataFields.indexOf(row.headers[i].dataField)
									if ((row.headers[i] != undefined) && (row.headers[i].value != undefined)) {
										pseudoRow[pos] = row.headers[i].value
									}
								} 
							}
							if (colPos > -1) {
								for (var i = 0; i < numCol.subHeaders.length; i++) {
									if (numCol.subHeaders[i] != undefined) {
										if ((isColumnDimensionValue) && (rownumber < i)) break;
										var pos = self.pageData.dataFields.indexOf(numCol.subHeaders[i].dataField)
										if (numCol.subHeaders[i].value != undefined) {
											pseudoRow[pos] = numCol.subHeaders[i].value
										}
									}
								}
							}
							var filtRows = []; var filtFullRows = [];
							for (var i = 0; i < self.allRowsPivot.length; i++) {			//get the list of filtered rows involve in this sum
								if (self.filterOK(self.allRowsPivot[i])) {
									if (self.isClickedRowMeasure(pseudoRow, value, self.allRowsPivot[i])) {
										filtRows.push(self.allRowsPivot[i]);
										if (self.HideDataFilds.length > 0) {
											filtFullRows.push(self.allFullRowsPivot[i])
										}
									}
								}
							}

							for (var i = 0; i < this.columns.length; i++) {
								datastr = datastr + "<ITEM name=\"" + this.columns[i].getAttribute("name") + "\">"
								datastr = datastr + "<VALUES";
								var existNullValue = false;								
								var stringValues = "";
								
								var prevValues = [];
								for (var j = 0; j < filtRows.length; j++) {
									if (prevValues.indexOf(filtRows[j][i]) === -1) {
										prevValues = prevValues.concat(filtRows[j][i])
										if (filtRows[j][i] != "#NuN#"){
											stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(filtRows[j][i]) + "</VALUE>";
										} else {
											existNullValue = true
										}
									}
								}
								
								if (existNullValue){
									datastr = datastr + " Null=\"true\""
								}
								datastr = datastr + ">" + stringValues 
								datastr = datastr + "</VALUES>";
								datastr = datastr + "</ITEM>";
							}

							//add hide values
							for (var i = 0; i < self.HideDataFilds.length; i++) {
								datastr = datastr + "<ITEM name=\"" + self.OrderFildsHidden[i] + "\">"
								datastr = datastr + "<VALUES";
								var existNullValue = false;								
								var stringValues = "";
								
								var prevValues = [];
								for (var j = 0; j < filtRows.length; j++) {
									if (prevValues.indexOf(filtRows[j][i]) === -1) {
										prevValues = prevValues.concat(filtRows[j][i])
										if (filtFullRows[j][i + this.columns.length + measures.length] != "#NuN#"){
											stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(filtFullRows[j][i + this.columns.length + measures.length]) + "</VALUE>";
										} else {
											existNullValue = true
										}
									}
								}
								
								if (existNullValue){
									datastr = datastr + " Null=\"true\""
								}
								datastr = datastr + ">" + stringValues 
								datastr = datastr + "</VALUES>";
								datastr = datastr + "</ITEM>";
							}

							for (var i = 0; i < measures.length; i++) {
								datastr = datastr + "<ITEM name=\"" + measures[i].getAttribute("name") + "\">"
								datastr = datastr + "<VALUES";
								var existNullValue = false;								
								var stringValues = "";
								
								var prevValues = [];
								for (var iCV = 0; iCV < filtRows.length; iCV++) {
									if (prevValues.indexOf(filtRows[iCV][i + this.columns.length]) === -1) {
										prevValues = prevValues.concat(filtRows[iCV][i + this.columns.length])
										if (filtRows[iCV][i + this.columns.length] != "#NuN#"){
											stringValues = stringValues + "<VALUE>" + self.cleanValueForNull(filtRows[iCV][i + this.columns.length]) + "</VALUE>";
										} else {
											existNullValue = true
										}
									}
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

				
			} catch (Error) {
				datastr = previuosDat;
			}
			datastr = datastr + "</RELATED>";
			datastr = datastr + "<FILTERS>";
			previuosDat = datastr;
			try {
				for (var i = 0; i < self.filterIndexes.length; i++) {
					datastr = datastr + "<ITEM name=\"" + this.columns[self.filterIndexes[i]].getAttribute("name") + "\" displayName=\"" + this.columns[self.filterIndexes[i]].getAttribute("displayName") + "\">";
					datastr = datastr + "<VALUES>"
					datastr = datastr + "<VALUE>"
					if (self.filterDiv.selects[i].value === "[all]") {
						datastr = datastr + self.translations.GXPL_QViewerJSAllOption;//gx.getMessage("GXPL_QViewerJSAllOption");//"\"ALL\"";
					}
					else {
						datastr = datastr + self.cleanValueForNull(self.filterDiv.selects[i].value);
					}
					datastr = datastr + "</VALUE>"
					datastr = datastr + "</VALUES>"
					datastr = datastr + '</ITEM>';
				}
			} catch (Error) {
				datastr = previuosDat;
			}
			datastr = datastr + "</FILTERS>";
			datastr = datastr + "</CONTEXT>";
			datastr = datastr + "</DATA>"

			
			self.fireOnItemClickEvent(self.QueryViewerCollection[IdForQueryViewerCollection], datastr)

		}

		this.fireOnItemClickEvent = function(query, datastr){
			setTimeout( function() {
				var paramobj = {"QueryViewer": query, "Data": datastr, "QueryviewerId": self.IdForQueryViewerCollection};
				var evt = document.createEvent("Events")
				evt.initEvent("PivotTableOnItemClickEvent", true, true);
				evt.parameter = paramobj;
				document.dispatchEvent(evt);
			}, 0)
		}

		this.SelectNodes = function(SelectedValue, SelectedType, SelectedMorDNumber, SelectedItem, refresh, selectedItemNumber, conditions) {

			var found = false;

			var dataField = (SelectedType == "DIMENSION") ? self.columns[SelectedMorDNumber].getAttribute("dataField") : measures[SelectedMorDNumber].getAttribute("dataField");

			for (var i = 0; i < jQuery("#" + self.controlName + "_" + self.query + " tr").length && (!found); i++) {//search selected cell in every row
				var tRow = jQuery("#" + self.controlName + "_" + self.query + " tr")[i];
				for (var j = 0; j < tRow.children.length && (!found); j++) {
					var value = jQuery(tRow.children[j]).data('itemValue');
					var type = jQuery(tRow.children[j]).data('typeMorD');
					var number = jQuery(tRow.children[j]).data('numberMorD');
					var item = jQuery(tRow.children[j]).data('itemInfo');

					if (item && (SelectedMorDNumber == number) && (SelectedType == type)) {

						if ((SelectedItem == "GrandTotal") && (item == "GrandTotal")) {

							if (OAT.IsNodeSelected(tRow.children[j])) {
								if (!refresh) {
									OAT.ClearSelectedNodes(jQuery("#" + self.controlName + "_" + self.query));
									self.selection.SelectedNode = [];
								}
							} else {

								if (!refresh) {
									OAT.SetSelectedNodeBackgroundColor(tRow.children[j], self.selection.Color, jQuery("#" + self.controlName + "_" + self.query))
								} else {
									OAT.SetNodeBackgroundColor(tRow.children[j], self.selection.Color)
								}

								if (!refresh)
									self.selection.SelectedNode.push( {
										value : SelectedValue,
										dataField : dataField,
										type : SelectedType,
										rowData : ["GrandTotal"],
										clicked : true
									} );

								if (self.selection.EntireLine) {
									//select only data column

									selectedCellOffset = tRow.children[j].offsetLeft
									
									var firstRow = (self.colConditions.length > 0) ? self.colConditions.length + 1 : 0;
									
									for (var prevRow = firstRow+1; prevRow < jQuery("#" + self.controlName + "_" + self.query + " tr").length; prevRow++) {
										var row = jQuery("#" + self.controlName + "_" + self.query + " tr")[prevRow];
										OAT.SelectAllRow(row, self.selection.Color)
									}

								}

							}

						} else if ((SelectedItem[0] == "PtrTotals") && (item != "GrandTotal") && (item.length > 0) && (SelectedType == "MEASURE")) {
							var sameRow = ((SelectedItem[2].headers.length == item[2].headers.length) && (SelectedItem[3] == item[3]));
							if (sameRow) {
								for (var h = 0; h < SelectedItem[2].headers.length; h++) {
									if (SelectedItem[2].headers[h].value != item[2].headers[h].value) {
										sameRow = false;
									}
								}
							}

							if (sameRow) {
								found = true;
								if (OAT.IsNodeSelected(tRow.children[j])) {
									if (!refresh) {
										OAT.ClearSelectedNodes(jQuery("#" + self.controlName + "_" + self.query));
										self.selection.SelectedNode = [];
									}
								} else {

									if (!refresh) {
										OAT.SetSelectedNodeBackgroundColor(tRow.children[j], self.selection.Color, jQuery("#" + self.controlName + "_" + self.query))
									} else {
										OAT.SetNodeBackgroundColor(tRow.children[j], self.selection.Color)
									}

									if (!refresh)
										self.selection.SelectedNode.push( {
											value : SelectedValue,
											dataField : dataField,
											type : SelectedType,
											rowData : [SelectedItem],
											clicked : true
										} );
										
										
										
									if (self.selection.EntireLine) {
										//search first dimension subtotal/total
										var foundTotal = false;
										for (var posTotal = 0; posTotal < tRow.children.length && (!foundTotal); posTotal++) {
											var typeTotal = jQuery(tRow.children[posTotal]).data('typeMorD');
											var itemTotal = jQuery(tRow.children[posTotal]).data('itemInfo');
											
											if ((typeTotal == "DIMENSION") && (itemTotal[0]!=undefined) && (itemTotal[0] == "PtrTotals"))
											{
												
												OAT.SetNodeBackgroundColor(tRow.children[posTotal], self.selection.Color)
												
												
												//select items from the same row
												OAT.SelectAllRow(tRow, self.selection.Color, posTotal)
												
												selectedCellOffset = tRow.children[posTotal].offsetLeft
												selectedRowOffset = tRow.children[0].offsetLeft
												
												
												var exit = false;
												var lastRow = -1;
												var firstRow = (self.colConditions.length > 0) ? self.colConditions.length + 1 : 0;
												for (var prevRow = i - 1; (prevRow > firstRow) && !exit; prevRow--) {
													var row = jQuery("#" + self.controlName + "_" + self.query + " tr")[prevRow];
													var iterRowOffset = row.children[0].offsetLeft

													if (jQuery(row.children[0]).hasClass("h2subtitle")) {
														if (iterRowOffset <= selectedRowOffset) {
															exit = true;
															lastRow = prevRow;
														}
													}

													if (!exit) {
														OAT.SelectAllRow(row, self.selection.Color)
													}
												}
												
												
												for (var prevRow = lastRow; prevRow >= 0; prevRow--) {
													var topRow = jQuery("#" + self.controlName + "_" + self.query + " tr")[prevRow];

													if (!jQuery(topRow.children[0]).hasClass("h2subtitle")) {
														for (var iterTopRow = 0; iterTopRow < topRow.children.length; iterTopRow++) {
															var rowSpan = parseInt(jQuery(topRow.children[iterTopRow]).attr("rowspan"));
															if (prevRow + rowSpan > i) {
																OAT.SetNodeBackgroundColor(topRow.children[iterTopRow], self.selection.Color)
															}
														}
													}
												}
												
											}
										}
								
									}	

								}

							}
						} else if (self.sameValue(SelectedValue, value, SelectedType, SelectedMorDNumber, SelectedItem)) {

							if ((SelectedItem.cell != undefined) && (SelectedItem.cell == item.cell)) {
								if (SelectedItem.row != undefined && item.row != undefined) {
									var sameRow = (SelectedItem.row.headers.length == item.row.headers.length);
									for (var h = 0; h < SelectedItem.row.headers.length; h++) {
										if (SelectedItem.row.headers[h].value != item.row.headers[h].value) {
											sameRow = false;
										}
									}
									if (sameRow) {
										found = true;
										if (OAT.IsNodeSelected(tRow.children[j])) {
											if (!refresh) {
												OAT.ClearSelectedNodes(jQuery("#" + self.controlName + "_" + self.query));
												self.selection.SelectedNode = [];
											}
										} else {

											if (!refresh) {
												OAT.SetSelectedNodeBackgroundColor(tRow.children[j], self.selection.Color, jQuery("#" + self.controlName + "_" + self.query))
											} else {
												OAT.SetNodeBackgroundColor(tRow.children[j], self.selection.Color)
											}

											if (!refresh)
												self.selection.SelectedNode.push ({
													value : SelectedValue,
													dataField : dataField,
													type : SelectedType,
													rowData : [self.createDataRowFromItem(item, SelectedType)],
													clicked : true
												});

											if (self.selection.EntireLine) {
												//select items from the same row
												OAT.SelectAllRow(tRow, self.selection.Color, j);

												//search previous rows
												for (var prevRow = i - 1; prevRow >= 0; prevRow--) {
													var topRow = jQuery("#" + self.controlName + "_" + self.query + " tr")[prevRow];
													for (var iterTopRow = 0; iterTopRow < topRow.children.length; iterTopRow++) {
														var rowSpan = parseInt(jQuery(topRow.children[iterTopRow]).attr("rowspan"));
														if (prevRow + rowSpan > i) {
															OAT.SetNodeBackgroundColor(topRow.children[iterTopRow], self.selection.Color)
														}
													}
												}

												//search bellow rows
												var selectedItemRowSpam = parseInt(jQuery(tRow.children[j]).attr("rowspan"));
												if (selectedItemRowSpam >= 1) {
													for (var postRow = i + 1; postRow < i + selectedItemRowSpam; postRow++) {
														var bellowRow = jQuery("#" + self.controlName + "_" + self.query + " tr")[postRow];
														OAT.SelectAllRow(bellowRow, self.selection.Color)
													}

													//search for subtotals of selected item
													var postRow = i + selectedItemRowSpam;
													var bellowRow = jQuery("#" + self.controlName + "_" + self.query + " tr")[postRow];
													if ((bellowRow != undefined) && jQuery(bellowRow.children[0]).hasClass("h2subtitle") && !jQuery(bellowRow.children[0]).hasClass("grandtotaltitle")) {
														selectedCellOffset = tRow.children[j].offsetLeft

														rowOffset = bellowRow.children[0].offsetLeft

														if (rowOffset == selectedCellOffset) {
															OAT.SelectAllRow(bellowRow, self.selection.Color)
														}

													}
												}

												if ((self.colConditions.length > 0) && (SelectedType == "MEASURE")) {

													selectedCellOffset = tRow.children[j].offsetLeft

													for (var prevRow = 1; prevRow < jQuery("#" + self.controlName + "_" + self.query + " tr").length; prevRow++) {
														if (prevRow != i) {
															var exit = false
															var row = jQuery("#" + self.controlName + "_" + self.query + " tr")[prevRow];
															for (var iterRow = 0; iterRow < row.children.length && !exit; iterRow++) {
																var offsetIter = row.children[iterRow].offsetLeft + row.children[iterRow].offsetWidth
																if (offsetIter > selectedCellOffset + 1){
																	exit = true;
																	OAT.SetNodeBackgroundColor(row.children[iterRow], self.selection.Color)
																}
															}
														}
													}
												}

											}
										}
									}
								}
							} else if ((SelectedItem[0] == "PtrTotals") && (SelectedItem[1] == item[1]) && (SelectedType == "DIMENSION")) {
								var sameRow = ((SelectedItem[2].headers.length == item[2].headers.length) && (SelectedItem[3] == item[3]));
								if (sameRow) {
									for (var h = 0; h < SelectedItem[2].headers.length; h++) {
										if (SelectedItem[2].headers[h].value != item[2].headers[h].value) {
											sameRow = false;
										}
									}
								}

								if (sameRow) {
									found = true;
									if (OAT.IsNodeSelected(tRow.children[j])) {
										if (!refresh) {
											OAT.ClearSelectedNodes(jQuery("#" + self.controlName + "_" + self.query));
											self.selection.SelectedNode = [];
										}
									} else {

										OAT.ClearSelectedNodes(jQuery("#" + self.controlName + "_" + self.query));

										if (!refresh) {
											OAT.SetSelectedNodeBackgroundColor(tRow.children[j], self.selection.Color, jQuery("#" + self.controlName + "_" + self.query))
										} else {
											OAT.SetNodeBackgroundColor(tRow.children[j], self.selection.Color)
										}

										if (!refresh)
											self.selection.SelectedNode.push({
												value : SelectedValue,
												dataField : dataField,
												type : SelectedType,
												rowData : [SelectedItem],
												clicked : true
											});

										if (self.selection.EntireLine) {
											//select items from the same row
											OAT.SelectAllRow(tRow, self.selection.Color, j)

											selectedCellOffset = tRow.children[j].offsetLeft
											selectedRowOffset = tRow.children[0].offsetLeft

											var exit = false;
											var lastRow = -1;
											var firstRow = (self.colConditions.length > 0) ? self.colConditions.length + 1 : 0;
											for (var prevRow = i - 1; (prevRow > firstRow) && !exit; prevRow--) {
												var row = jQuery("#" + self.controlName + "_" + self.query + " tr")[prevRow];
												var iterRowOffset = row.children[0].offsetLeft

												if (jQuery(row.children[0]).hasClass("h2subtitle")) {
													if (iterRowOffset <= selectedRowOffset) {
														exit = true;
														lastRow = prevRow;
													}
												}

												if (!exit) {
													OAT.SelectAllRow(row, self.selection.Color)
												}
											}

											for (var prevRow = lastRow; prevRow >= 0; prevRow--) {
												var topRow = jQuery("#" + self.controlName + "_" + self.query + " tr")[prevRow];

												if (!jQuery(topRow.children[0]).hasClass("h2subtitle")) {
													for (var iterTopRow = 0; iterTopRow < topRow.children.length; iterTopRow++) {
														var rowSpan = parseInt(jQuery(topRow.children[iterTopRow]).attr("rowspan"));
														if (prevRow + rowSpan > i) {
															OAT.SetNodeBackgroundColor(topRow.children[iterTopRow], self.selection.Color)
														}
													}
												}
											}

										}

									}
								}
							} else if ((SelectedItem == "EventSelection")) {

								if (self.sameValue(SelectedValue, value, SelectedType, SelectedMorDNumber, SelectedItem)) {

									if (!jQuery(tRow.children[0]).hasClass("h2subtitle") && !jQuery(tRow.children[j]).hasClass("gtotal") && !jQuery(tRow.children[j]).hasClass("subtotal")) {
										
										if (self.checkConditions(conditions, item)) {

											OAT.SetNodeBackgroundColor(tRow.children[j], self.selection.Color, jQuery("#" + self.controlName + "_" + self.query))

											if (self.selection.SelectedNode.length <= selectedItemNumber) {
												self.selection.SelectedNode.push({
													value : SelectedValue,
													dataField : dataField,
													type : SelectedType,
													rowData : [self.createDataRowFromItem(item, SelectedType)],
													clicked : false
												});
											} else {
												self.selection.SelectedNode[selectedItemNumber].rowData.push(self.createDataRowFromItem(item, SelectedType));
											}

											if (self.selection.EntireLine) {

												OAT.SelectAllRow(tRow, self.selection.Color, j)

												for (var pos = i - 1; pos > 0; pos--) {
													var iterRow = jQuery("#" + self.controlName + "_" + self.query + " tr")[pos];
													for (var cell = 0; cell < iterRow.children.length; cell++) {
														var rowSpan = parseInt(jQuery(iterRow.children[cell]).attr("rowspan"));
														if (pos + rowSpan > i) {
															OAT.SetNodeBackgroundColor(iterRow.children[cell], self.selection.Color)
														}
													}
												}
												var itemRowSpan = parseInt(jQuery(tRow.children[j]).attr("rowspan"));
												if (itemRowSpan >= 1) {
													for (var pos = i + 1; pos < i + itemRowSpan; pos++) {
														OAT.SelectAllRow(jQuery("#" + self.controlName + "_" + self.query + " tr")[pos], self.selection.Color)
													}

													var pos = i + itemRowSpan;
													var iterRow = jQuery("#" + self.controlName + "_" + self.query + " tr")[pos];
													if ((iterRow != undefined) && jQuery(iterRow.children[0]).hasClass("h2subtitle") && !jQuery(iterRow.children[0]).hasClass("grandtotaltitle")) {
														selectedCellOffset = tRow.children[j].offsetLeft
														rowOffset = iterRow.children[0].offsetLeft
														if (rowOffset == selectedCellOffset) {
															OAT.SelectAllRow(iterRow, self.selection.Color)
														}
													}
												}

												if ((self.colConditions.length > 0) && (SelectedType == "MEASURE")) {

													selectedCellOffset = tRow.children[j].offsetLeft
													for (var prevRow = 1; prevRow < jQuery("#" + self.controlName + "_" + self.query + " tr").length; prevRow++) {
														if (prevRow != i) {
															var exit = false
															var row = jQuery("#" + self.controlName + "_" + self.query + " tr")[prevRow];
															for (var iterRow = 0; iterRow < row.children.length && !exit; iterRow++) {
																var offsetIter = row.children[iterRow].offsetLeft + row.children[iterRow].offsetWidth
																if (offsetIter > selectedCellOffset) {
																	exit = true;
																	OAT.SetNodeBackgroundColor(row.children[iterRow], self.selection.Color)
																}
															}
														}
													}
												}
											}
										}

									}
								}
							}
						}
					}
				}
			}
		}

		
		
		this.getRowInitialShift = function(table, rowNumber){
			var initialShift = 0;
			
			for(var prevRow = rowNumber-1; prevRow >=0; prevRow--)
			{
					var topRow = table[prevRow];
					for (var iterTopRow = 0; iterTopRow < topRow.children.length; iterTopRow++){
						var rowSpan = parseInt(jQuery(topRow.children[iterTopRow]).attr("rowspan"));
						if (prevRow + rowSpan > rowNumber) {
							initialShift=initialShift+1
						}
					}
			}
										
			return  initialShift;
		}
		
		this.getCellPositionSpanWithSpans = function(table, rowNumber, posWithoutSpan)
		{
			
			var row = table[rowNumber];
			var position = 0;
			var posWithSpan = posWithoutSpan;
			
			var cellPos = 0;
			for (var iterTopRow = 0; iterTopRow < row.children.length && position < posWithoutSpan; iterTopRow++)
			{
				var colspan	= parseInt(jQuery(row.children[iterTopRow]).attr("colspan"));
				if (colspan > 1) {
					(posWithSpan < colspan) ? (posWithSpan = posWithSpan - (colspan)) : (posWithSpan = posWithSpan - (colspan),cellPos = cellPos + 1);
					position = position + colspan; 
				} else {
					position = position + 1
					cellPos = cellPos + 1; 
				}
					  
			}
			return cellPos;
		}
		
		this.RedrawSelectedNode = function() {
			if (self.selection.SelectedNode) {

				for (var s = 0; s < self.selection.SelectedNode.length; s++) {
					var SelectedMorDNumber;
					if (self.selection.SelectedNode[s].type == "DIMENSION") {
						for (var i = 0; i < self.columns.length; i++) {
							if (self.selection.SelectedNode[s].dataField == self.columns[i].getAttribute("dataField")) {
								SelectedMorDNumber = i;
							}
						}
					} else {
						for (var i = 0; i < measures.length; i++) {
							if (self.selection.SelectedNode[s].dataField == measures[i].getAttribute("dataField")) {
								SelectedMorDNumber = i;
							}
						}
					}

					if (self.selection.SelectedNode[s].rowData[0] == "GrandTotal") {
						self.SelectNodes(self.selection.SelectedNode[s].value, self.selection.SelectedNode[s].type, SelectedMorDNumber, "GrandTotal", true);
					} else if ((self.selection.SelectedNode[s].rowData[0].length > 0) && (self.selection.SelectedNode[s].rowData[0][0] == "PtrTotals")) {//sub total
						self.SelectNodes(self.selection.SelectedNode[s].value, self.selection.SelectedNode[s].type, SelectedMorDNumber, self.selection.SelectedNode[s].rowData[0], true);
					} else {

						for (var i = 0; i < jQuery("#" + self.controlName + "_" + self.query + " tr").length; i++) {//search selected cell in every row
							var tRow = jQuery("#" + self.controlName + "_" + self.query + " tr")[i];
							for (var j = 0; j < tRow.children.length; j++) {
								var value = jQuery(tRow.children[j]).data('itemValue');
								var type = jQuery(tRow.children[j]).data('typeMorD');
								var number = jQuery(tRow.children[j]).data('numberMorD');
								var item = jQuery(tRow.children[j]).data('itemInfo');

								if ((self.sameValue(self.selection.SelectedNode[s].value, value, self.selection.SelectedNode[s].type, SelectedMorDNumber, item)) && (SelectedMorDNumber == number) && (self.selection.SelectedNode[s].type == type)) {
									if (item.row != undefined) {
										var itemDataRow = self.createDataRowFromItem(item, type);

										for (var v = 0; v < self.selection.SelectedNode[s].rowData.length; v++) {

											var sameRow = true;

											for (var t = 0; t < self.selection.SelectedNode[s].rowData[v].length; t++) {
												if ((self.selection.SelectedNode[s].rowData[v][t] != undefined) && (itemDataRow[t] != undefined) && (!(self.filterIndexes.indexOf(t) > -1)) && (!(self.colConditions.indexOf(t) > -1))) {
													if ((self.selection.SelectedNode[s].rowData[v][t] != "[all]") && (itemDataRow[t] != "[all]") && (self.selection.SelectedNode[s].rowData[v][t].trim() != itemDataRow[t].trim())) {
														sameRow = false;
													}
												}
											}

											if (sameRow)
												self.SelectNodes(self.selection.SelectedNode[s].value, self.selection.SelectedNode[s].type, SelectedMorDNumber, item, true, s);

										}

									}
								}
							}
						}
					}
				}
			}

		}

		
		this.sameValue = function(val1, val2, type, NumberMorD, item){
			try {
				var sameValue = false;
				if (val2 != undefined){ 	 
					var dataType = (type == "DIMENSION") ? self.columns[NumberMorD].getAttribute("dataType") : measures[NumberMorD].getAttribute("dataType");
						 
					if ((dataType == "real") || (dataType == "integer")){
						sameValue = (parseFloat(val1) == parseFloat(val2));	
						if ((!sameValue) && (type == "DIMENSION") && (item[0] != undefined) && (item[0] == "PtrTotals") && (val1.trim() == val2.trim())) 
							return true;
					} else {
					 	sameValue = (val1.trim() == val2.trim());	
					} 
				}
				return sameValue;
			} catch (error) {
				return false;
			}
		}
		
		
		this.checkConditions = function(conditions, item){
			var sameRow = true;
			for(var s = 0; s < conditions.length; s++){
				if (!item.row || !item.row.headers) return false;
				for(var h = 0; h < item.row.headers.length; h++){
					if (item.row.headers[h].dataField == conditions[s].DataField){
						
						var numberMorD;
						for (var i = 0; i < self.columns.length; i++) {
							if (item.row.headers[h].dataField  == self.columns[i].getAttribute("dataField")) {
								numberMorD = i;
							}
						}
						
						if (!self.sameValue(conditions[s].Value, item.row.headers[h].value, "DIMENSION", numberMorD, item))
						{
							return false
						}
						
					}
				}
				
				
				for(var c = 0; c < item.row.cells.length; c++){
					//get dataField of cell
					var numberMorD;
					var nameMeasure;
					for (var i = 0; i < measures.length; i++) {
						if (item.row.cells[c].dataField == measures[i].getAttribute("dataField")) {
							numberMorD = i;
							nameMeasure = measures[i].getAttribute("name");
						}
					}
					
					if (nameMeasure == conditions[s].Name){
						
						if (!self.sameValue(conditions[s].Value, item.row.cells[c].value, "MEASURE", numberMorD, item))
						{
							return false
						}
						
					}
					
				}
				
			}
			return sameRow;
		}		
		
		this.selectValue = function (selection) {

			OAT.ClearSelectedNodes(jQuery("#" + self.controlName + "_" + self.query));
			self.selection.SelectedNode = [];
			
			var s = -2;			
			var maxNumberMorD = -2
			var MorD;
			var numberMorD;
			
			for (var t = 0; t < selection.length; t++)
			{
				var tempMorD;
				var tempnumberMorD;
				for (var i = 0; i < measures.length; i++) {
					if (selection[t].Name == measures[i].getAttribute("name")) {
						tempMorD = "MEASURE"
						tempnumberMorD = i;
					}
				}

				for (var i = 0; i < self.columns.length; i++) {
					if (selection[t].Name == self.columns[i].getAttribute("name")) {
						tempMorD = "DIMENSION"
						tempnumberMorD = i;
					}
				}	
				
				
				if (self.rowConditions.indexOf(tempnumberMorD) >=  maxNumberMorD)
				{
					s = t;
					maxNumberMorD = self.rowConditions.indexOf(tempnumberMorD);
					MorD = tempMorD;
					numberMorD = tempnumberMorD;
				}
					
				
			}
			
			self.SelectNodes(selection[s].Value, MorD, numberMorD, "EventSelection", false, 0, selection);

		}
		
		
		this.deselectValue = function(){
			OAT.ClearSelectedNodes(jQuery("#" + self.controlName + "_" + self.query));
			self.selection.SelectedNode = [];
		}
		
		this.createDataRowFromItem = function(item, type){
			var row = item.row
			var cellNumber = item.cell
			var numRow = self.pageData.rows.indexOf(row)
			var colPos = item.cell
			var numCol = self.pageData.columnsHeaders[colPos]

			var pseudoRow = [];
			for (var i = 0; i < self.pageData.dataFields.length; i++) {
				pseudoRow[i] = undefined;
			}
			if ((row != undefined) && (row.headers != undefined)){
				for (var i = 0; i < row.headers.length; i++) {
					var pos = self.pageData.dataFields.indexOf(row.headers[i].dataField)
					if ((row.headers[i] != undefined) && (row.headers[i].value != undefined)) {
						pseudoRow[pos] = row.headers[i].value
					}
				}
			}
			
			if (type != "DIMENSION") {
				
				if (numCol != undefined){
					for (var i = 0; i < numCol.subHeaders.length; i++) {
						if (numCol.subHeaders[i] != undefined) {
							var pos = self.pageData.dataFields.indexOf(numCol.subHeaders[i].dataField)
							if (numCol.subHeaders[i].value != undefined) {
								pseudoRow[pos] = numCol.subHeaders[i].value
							}
						}
					}
				}
			
			}
			
			for (var i = 0; i < self.filterIndexes.length; i++){
				pseudoRow[self.filterIndexes[i]] = self.filterDiv.selects[i].value;
			}
			
			return pseudoRow;
		}
		
		this.ExpandCollapseHandle = function (elemvalue, eventName) {
			var value = jQuery(elemvalue).data('itemValue');
			var type = jQuery(elemvalue).data('typeMorD');
			var number = jQuery(elemvalue).data('numberMorD');
			var item = jQuery(elemvalue).data('itemInfo');
			var datastr = "<DATA event=\"" + eventName + "\"><ITEM ";

			datastr = datastr + "name=\"" + columns[number].getAttribute("name") + "\" ";
			datastr = datastr + "displayName=\"" + columns[number].getAttribute("displayName") + "\" ";
			datastr = datastr + ">";
			datastr = datastr + self.cleanValueForNull(value)
			datastr = datastr + "</ITEM>";


			datastr = datastr + "<CONTEXT>";
			datastr = datastr + "<EXPANDEDVALUES>";
			var previuosDat = datastr;
			try {
				if (item != "") {
					var numRow
					if (item.row != undefined)
						numRow = item.row;
					else
						numRow = item[0];

					var prevValues = [];
					for (var iCV = 0; iCV < this.GeneralDataRows.length; iCV++) {
						if (prevValues.indexOf(this.GeneralDataRows[iCV][number]) == -1) {
							prevValues = prevValues.concat(this.GeneralDataRows[iCV][number])
							if (self.conditions[number].collapsedValues.indexOf(this.GeneralDataRows[iCV][number]) === -1) {
								datastr = datastr + "<VALUE>" + self.cleanValueForNull(this.GeneralDataRows[iCV][number]) + "</VALUE>";
							}
						}
					}
				}
			} catch (Error) {
				datastr = previuosDat;
			}

			datastr = datastr + "</EXPANDEDVALUES>";
			datastr = datastr + "</CONTEXT>";
			datastr = datastr + "</DATA>"

			return datastr;
		}

		this.ExpandCollapseHandleWhenServerPagination = function (elemvalue, action) {
			if ((typeof (self.QueryViewerCollection[IdForQueryViewerCollection].ItemExpand) == 'function') /*|| (qv.util.isGeneXusPreview())*/) {
				var number = jQuery(elemvalue).data('numberMorD');
				if (self.conditions[number].previousPage >= self.conditions[number].totalPages) {
					var datastr = self.ExpandCollapseHandleWhenServerPaginationCreateXML(elemvalue, action)
					datastr = datastr.replace(/\&/g, '&amp;');
					
					self.fireOnItemExpandCollapseEvent(self.QueryViewerCollection[IdForQueryViewerCollection], datastr, (action == "collapse"))
					self.getDataForPivot(self.UcId, self.pageData.ServerPageNumber, self.rowsPerPage, true, "", "", "", "", true)
				} else {
					self.lastColumnNumber = number;
					self.lastRequestAttributeValues = "ExpandCollapse"
					self.lastRequestAttributeValuesElemValue = elemvalue
					self.lastRequestAttributeValuesAction = action
					self.requestAttributeValues(self.columns[number].getAttribute("dataField"), 1, 0, "")
					
					
				}
			} else {
				self.getDataForPivot(self.UcId, self.pageData.ServerPageNumber, self.rowsPerPage, true, "", "", "", "", true);
			}
		}

		this.ExpandCollapseHandleWhenServerPaginationCreateXML = function (elemvalue, action) {
			var value = jQuery(elemvalue).data('itemValue');
			var type = jQuery(elemvalue).data('typeMorD');
			var number = jQuery(elemvalue).data('numberMorD');
			var item = jQuery(elemvalue).data('itemInfo');

			actionName = 'event="ItemExpand"'
			if (action == "collapse") {
				actionName = 'event="ItemCollapse"'
			}

			var datastr = "<DATA " + actionName + "><ITEM ";

			datastr = datastr + "name=\"" + columns[number].getAttribute("name") + "\" ";
			datastr = datastr + "displayName=\"" + columns[number].getAttribute("displayName") + "\" ";
			datastr = datastr + ">";
			datastr = datastr + value
			datastr = datastr + "</ITEM>";


			datastr = datastr + "<CONTEXT>";
			datastr = datastr + "<EXPANDEDVALUES>";

			for (var ex = 0; ex < self.conditions[number].distinctValues.length; ex++) {
				if (self.conditions[number].collapsedValues.indexOf(self.conditions[number].distinctValues[ex]) == -1) {
					datastr = datastr + "<VALUE>" + self.conditions[number].distinctValues[ex] + "</VALUE>"
				}
			}

			datastr = datastr + "</EXPANDEDVALUES>";
			datastr = datastr + "</CONTEXT>";
			datastr = datastr + "</DATA>"

			return datastr;
		}
	
		
		
		
		
		this.onFilteredChangedEventHandleWhenServerPagination = function (dimensionNumber) {
			if ((self.QueryViewerCollection[IdForQueryViewerCollection].FilterChanged) /*|| (qv.util.isGeneXusPreview())*/) {
				if (self.conditions[dimensionNumber].previousPage >= self.conditions[dimensionNumber].totalPages) {
					self.onFilteredChangedEventHandleWhenServerPaginationCreateXML(dimensionNumber, self.conditions[dimensionNumber].distinctValues, self.conditions[dimensionNumber].blackList);
				} else {
					self.lastColumnNumber = dimensionNumber;
					self.lastRequestAttributeValues = "FilteredChanged"
					self.requestAttributeValues(self.columns[dimensionNumber].getAttribute("dataField"), 1, 0, "")
					
				
				}
			}
		}
		
		this.fireOnFilterChangedEvent = function(QueryviewerId, FilterChangedData){
			setTimeout( function() {
				var paramobj = {"QueryviewerId": QueryviewerId, "FilterChangedData": FilterChangedData};
				var evt = document.createEvent("Events")
				evt.initEvent("PivotTableOnFilterChangedEvent", true, true);
				evt.parameter = paramobj;
				document.dispatchEvent(evt);
			}, 0)
		}
		
		this.onFilteredChangedEventHandleWhenServerPaginationCreateXML = function (dimensionNumber, distinctValues, blackList) {
			var datastr = "<DATA event=\"FilterChanged\" name=\"" + self.columns[dimensionNumber].getAttribute("name") + "\" displayName=\"" + self.columns[dimensionNumber].getAttribute("displayName") + "\">"
			for (var i = 0; i < distinctValues.length; i++) {
				var value = distinctValues[i]
				var checked = true;
				if (self.conditions[dimensionNumber].state == "all") {
					checked = true;
				} else if (self.conditions[dimensionNumber].state == "none") {
					checked = false;
				} else if (self.conditions[dimensionNumber].blackList.indexOf(value) != -1) {
					checked = false;
				} else if (distinctValues.indexOf(value) != -1) {
					checked = true;
				} else if (self.conditions[dimensionNumber].defaultAction == "Exclude") {
					checked = false;
				}
				if (checked) {
					datastr = datastr + '<VALUE>' + value + '</VALUE>';
				}
			}
			datastr = datastr + "</DATA>"

			//if (qv.util.isGeneXusPreview())
			//	window.external.SendText(self.QueryViewerCollection[self.IdForQueryViewerCollection].ControlName, datastr);
			if ((self.QueryViewerCollection[IdForQueryViewerCollection].FilterChanged)) {
				datastr = datastr.replace(/\&/g, '&amp;');
				
				var iparser = new DOMParser();
				var xml_doc = iparser.parseFromString(datastr, "text/xml");
				
				//var xml_doc = qv.util.dom.xmlDocument(datastr); ///***TODO
				
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
				
				var Node = selectXPathNode(xml_doc, "/DATA"); // qv.util.dom.selectXPathNode(xml_doc, "/DATA");
				
				var FilterChangedData = {}
				FilterChangedData.Name = Node.getAttribute("name");
				FilterChangedData.SelectedValues = [];
				var valueIndex = -1;
				for (var i = 0; i < Node.childNodes.length; i++) {
					if (Node.childNodes[i].nodeName == "VALUE") {
						valueIndex++;
						FilterChangedData.SelectedValues[valueIndex] = Node.childNodes[i].firstChild.nodeValue;
					}
				}
				self.fireOnFilterChangedEvent(IdForQueryViewerCollection, FilterChangedData)
			}
		}


		this.onDragundDropEventHandle = function (conditionIndex, axis, position) {
			var datastr = "<DATA event=\"DragAndDrop\" name=\"" + this.columns[conditionIndex].getAttribute("name") + "\" displayName=\"" + this.columns[conditionIndex].getAttribute("displayName") 
					+ "\" axis=\"" + axis + "\"  position=\"" + (position+1) + "\" />"
				datastr = datastr.replace(/\&/g, '&amp;');
				self.fireOnDragundDropEvent(this.QueryViewerCollection[IdForQueryViewerCollection], datastr);

		}
		
		this.fireOnDragundDropEvent = function(query, datastr){
			setTimeout( function() {
				var paramobj = {"QueryViewer": query, "Data": datastr, "QueryviewerId": self.IdForQueryViewerCollection};
				var evt = document.createEvent("Events")
				evt.initEvent("PivotTableOnDragundDropEvent", true, true);
				evt.parameter = paramobj;
				document.dispatchEvent(evt);
			}, 0)
		}
		
		this.pivotStateChanged = function()
		{
			
			
			for (var iAI = 0; iAI < self.pageData.AxisInfo.length; iAI++)
			{
				if (self.pageData.AxisInfo[iAI].Axis.Type != self.initState.AxisInfo[iAI].Axis.Type) return true
			}
			for (var iDI = 0; iDI < self.pageData.DataInfo.length; iDI++)
			{
				if (self.pageData.DataInfo[iDI].Axis.Type != self.initState.DataInfo[iDI].Axis.Type) return true
			}
			
			if (self.initState.CollapseInfo.length != self.pageData.CollapseInfo.length) return true
			
			var initCollapseInfo = JSON.stringify(self.initState.CollapseInfo);
			var actualCollapseInfo = JSON.stringify(self.pageData.CollapseInfo);
			if (initCollapseInfo!=actualCollapseInfo) return true;
			
			
			
			return false
		}
		

	

		
		self.initWhenServerPagination();
		
		
	}
	try {
		OAT.Loader.featureLoaded("pivot");
	} catch (ERROR) {

	}


	function sortUnidimensionalArray(arr, index, self) { /* sort distinct values of a condition */
		//var months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
		var sortFunc;
		var coef = 1;
		var numSort = function (a, b) {
			if (a == b) { return 0; }
			return coef * (parseInt(a) > parseInt(b) ? 1 : -1);
		}
		var dictSort = function (a, b) {
			if (a == b) { return 0; }
			return coef * (a > b ? 1 : -1);
		}


		//new code
		var sortInt = true;
		for (var ival = 0; ival < arr.length; ival++) {
			if ((sortInt) && (arr[ival] != parseInt(arr[ival]))) {
				sortInt = false;
			}
		}
		if (sortInt) { sortFunc = numSort; } else { sortFunc = dictSort; } //decides the type of sorting
		//end new code
		var testValue = arr[0];

		//if (months.find(testValue.toString().toLowerCase()) != -1) { sortFunc = dateSort; }

		arr.sort(sortFunc);

		//when custom order 
		for (var h = 0; h < self.columns[index].childNodes.length; h++) {
			if ((self.columns[index].childNodes[h] != undefined) &&
				(self.columns[index].childNodes[h].localName != undefined) &&
				(self.columns[index].childNodes[h].localName === "customOrder")) {
				arr = []
				for (var n = 0; n < self.columns[index].childNodes[h].childNodes.length; n++) {
					if (self.columns[index].childNodes[h].childNodes[n].localName == "Value") {
						arr.push(self.columns[index].childNodes[h].childNodes[n].textContent);
					}
				}
			}
		}



		return arr;
	} /* sort */

	function fillGeneralDistinctValues(numConds, self, rows) {
		self.GeneralDistinctValues = [];
		for (var i = 0; i < numConds; i++) {
			var elems = [];
			for (var j = 0; j < rows.length; j++) {
				if (rows[j][i] == undefined) {
					if (elems.indexOf(" ") == -1) {
						elems.push(" ");
					}
				} else {
					if (elems.indexOf(rows[j][i]) == -1) {
						elems.push(rows[j][i]);
					}
				}
			}

			self.GeneralDistinctValues[i] = sortUnidimensionalArray(elems, i, self);
		}
	}

	function fromUndefinedToBlanck(dataRows) {
		for (var i = 0; i < dataRows.length; i++) {
			for (var j = 0; j < dataRows[i].length; j++) {
				if (dataRows[i][j] == undefined) {
					dataRows[i][j] = " ";
				}
			}
		}
	}

	
	function notInBlackListB(row, conditions) {
		var esta = false;
		for (var i = 0; i < row.length; i++) {
			if ((conditions[i] != undefined) && (conditions[i].blackList != undefined) && (conditions[i].blackList.indexOf(row[i]) != -1)) {
				esta = true;
			}
		}
		return esta;
	}


	function belongToCollection(row, rowCollection) {
		for (var j = 0; j < rowCollection.length; j++) {
			var coincide = true;
			for (var i = 0; i < row.length - measures.length; i++) {
				if (rowCollection[j][i] != row[i]) {
					coincide = false;
				}
				if (!coincide) {
					break;
				}
			}
			if (coincide) return true;
		}
		return false;
	}

	

	function getMeasureNumberByName(name, measures) {
		var number = 0;
		for (var i = 0; i < measures.length; i++) {
			if (measures[i].getAttribute("displayName") == name) {
				return i
			}
		}
		return 0
	}

	function getMeasureNumberByDataField(dataField, measures) {
		var number = 0;
		for (var i = 0; i < measures.length; i++) {
			if (measures[i].getAttribute("dataField") == dataField) {
				return i
			}
		}
		return 0
	}



	function getValueMeasureFromMeasureList(measureList, rowNumber, fg, filterData, cantMeasures) {
		for (var itMl = 0; itMl < measureList.length; itMl++) {
			if ((measureList[itMl][fg] != undefined) && (measureList[itMl][fg][1] != undefined) && (measureList[itMl][fg][1][0] == rowNumber)) {
				return measureList[itMl][fg][0]
			}
		}
		//when is not in the measure list search in filterData
		return filterData[rowNumber][filterData[0].length - cantMeasures + fg]
	}

