

	OAT.tablePagination = function (container, settings) {
		var defaults = {
				rowsPerPage: 5,
				currPage: 1,
				jstype: "pivot",
				optionsForRows: [5, 10, 25, 50, 100],
				ignoreRows: [],
				topNav: false
		};
		settings = jQuery.extend(defaults, settings);
		return container.each(function () {
				var table = jQuery(this)[0];
				var totalPagesId, currPageId, rowsPerPageId, firstPageId, prevPageId, nextPageId, lastPageId;
				totalPagesId = '#tablePagination_totalPages';
				currPageId = '#tablePagination_currPage';
				rowsPerPageId = '#' + settings.controlName + 'tablePagination_rowsPerPage';
				firstPageId = '#tablePagination_firstPage';
				prevPageId = '#tablePagination_prevPage';
				nextPageId = '#tablePagination_nextPage';
				lastPageId = '#tablePagination_lastPage';
				var tblLocation = (defaults.topNav) ? "prev" : "next";

				try {
					defaults.rowsPerPage = parseInt(defaults.rowsPerPage);
				} catch (ERROR) {
					defaults.rowsPerPage = 10;
				}

				var possibleTableRows = jQuery.makeArray(jQuery('tbody tr', table));
				var tableRows = jQuery.grep(possibleTableRows, function (value, index) {
					return (jQuery.inArray(value, defaults.ignoreRows) == -1);
				}, false)

				var numRows = tableRows.length
				var totalPages = resetTotalPages();
				var currPageNumber = (defaults.currPage > totalPages) ? 1 : defaults.currPage;
				if (jQuery.inArray(defaults.rowsPerPage, defaults.optionsForRows) == -1)
					defaults.optionsForRows.push(defaults.rowsPerPage);

				function hideOtherPages(pageNum) {
					if (pageNum == 0 || pageNum > totalPages)
						return;
					var startIndex = (pageNum - 1) * defaults.rowsPerPage;
					var endIndex = (startIndex + defaults.rowsPerPage - 1);
					jQuery(tableRows).show(); //show all rows
					var filteredRow = 0;
					for (var i = 0; i < tableRows.length; i++) {
						if (i < startIndex || i > endIndex) {
							jQuery(tableRows[i]).hide() //hide row because of pagination
						}
						if (settings.jstype === "pivot") {
							while (tableRows[i].childNodes[0].getAttribute('pivotCorrect') != null) {
								tableRows[i].deleteCell(0);
							}
						}
						if (tableRows[i].getAttribute("visibQ") == "tf") {
							jQuery(tableRows[i]).hide() //hide row is filtered
						}
					}

					if ((settings.jstype === "pivot") && (startIndex > 1)) /* if previuos rows have a inital span td */ {
						if ((tableRows[startIndex].childNodes[0].getAttribute('spanCorrect') === null)
							|| (tableRows[startIndex].childNodes[0].getAttribute('spanCorrect') === "0")) {
							var previuos = tableRows[startIndex - 1];

							for (var prw = 1; prw < startIndex + 1; prw++) {
								if (startIndex - prw < 0) break;
								var previuos = tableRows[startIndex - prw];

								for (var itemtd = 0; itemtd < previuos.childNodes.length; itemtd++) { /*begin "for" for previous row*/

									if ((previuos.childNodes[itemtd] != undefined) && (previuos.childNodes[itemtd].getAttribute('rowspan') != undefined) && (previuos.childNodes[itemtd].getAttribute('rowspan') > 1)) {
										if ((previuos.childNodes[itemtd].getAttribute('rowspan') <= prw) || (previuos.childNodes[itemtd].getAttribute('hidden') != null)) {
											break;
										}

										for (var posR = startIndex; posR < startIndex + (previuos.childNodes[itemtd].getAttribute('rowspan') - prw); posR++) {
											var oldspan = 0;
											var newcolspan = 0;
											var plusspan = 0;
											if ((tableRows[posR].childNodes[0].getAttribute('colspan') != undefined) && (tableRows[posR].childNodes[0].getAttribute('colspan') != null)) {
												oldspan = parseInt(tableRows[posR].childNodes[0].getAttribute('colspan'));
											} else {
												oldspan = 1;
											}
											var plusspan;
											if ((previuos.childNodes[itemtd].getAttribute('colspan') != undefined) && (previuos.childNodes[itemtd].getAttribute('colspan') != null)) {
												plusspan = parseInt(previuos.childNodes[itemtd].getAttribute('colspan'));
											} else {
												plusspan = 1;
											}

											var newcolspan = plusspan + oldspan;
											var newCell = tableRows[posR].insertCell(itemtd);
											newCell.setAttribute('pivotCorrect', true);
											newCell.setAttribute('colspan', plusspan);
											newCell.setAttribute('class', 'pivotAdd');
											newCell.setAttribute('style', previuos.childNodes[itemtd].style.cssText + 'border-bottom: none; border-top: none;');
											if (posR === startIndex) {
												newCell.innerHTML = previuos.childNodes[itemtd].innerHTML;
												newCell.className = previuos.childNodes[itemtd].className + " pivotAdd";
												var imgCollapse = newCell.childNodes[0];
												newCell.removeChild(imgCollapse)
											}
											/*if the modified item has rowSpan > 1 then jump "rowSpan-1" rows*/
											if ((tableRows[posR].childNodes[0].getAttribute('rowspan') != undefined) && (tableRows[posR].childNodes[0].getAttribute('rowspan') != null)) {
												posR = posR + parseInt(tableRows[posR].childNodes[0].getAttribute('rowspan')) - 1;
											}

										}

									}

								}/*end for*/
							}

						}

					}

				}

				function resetTotalPages() {
					var preTotalPages = Math.round(numRows / defaults.rowsPerPage);
					var totalPages = (preTotalPages * defaults.rowsPerPage < numRows) ? preTotalPages + 1 : preTotalPages;
					if (jQuery(table)[tblLocation]().find(totalPagesId).length > 0)
						jQuery(table)[tblLocation]().find(totalPagesId).html(totalPages);
					return totalPages;
				}

				function resetCurrentPage(currPageNum) { //here sets the value of the current page
					if (currPageNum < 1 || currPageNum > totalPages)
						return;
					currPageNumber = currPageNum;
					hideOtherPages(currPageNumber);

					(currPageNumber > 1) ? jQuery("#tablePagination_firstPage,#tablePagination_prevPage").removeClass("disabled_pivot_button") :
						jQuery("#tablePagination_firstPage,#tablePagination_prevPage").addClass("disabled_pivot_button");

					(currPageNumber != totalPages) ? jQuery("#tablePagination_nextPage,#tablePagination_lastPage").removeClass("disabled_pivot_button") :
						jQuery("#tablePagination_nextPage,#tablePagination_lastPage").addClass("disabled_pivot_button");

					jQuery(table)[tblLocation]().find(currPageId).val(currPageNumber)
				}

				function resetPerPageValues() {
					var isRowsPerPageMatched = false;
					var optsPerPage = defaults.optionsForRows;
					optsPerPage.sort(function (a, b) { return a - b; });
					var perPageDropdown = jQuery(table)[tblLocation]().find(rowsPerPageId)[0];
					perPageDropdown.length = 0;
					for (var i = 0; i < optsPerPage.length; i++) {
						if (optsPerPage[i] == defaults.rowsPerPage) {
							perPageDropdown.options[i] = new Option(optsPerPage[i], optsPerPage[i], true, true);
							isRowsPerPageMatched = true;
						}
						else {
							perPageDropdown.options[i] = new Option(optsPerPage[i], optsPerPage[i]);
						}
					}

					if (tableRows.length <= defaults.rowsPerPage) {
						jQuery('#' + settings.controlName + '_tablePagination').css('display', 'none');
					} else {
						jQuery('#' + settings.controlName + '_tablePagination').css('display', '');
					}

					if ((totalPages == 1) || (totalPages == 0)) {
						jQuery('#' + settings.controlName + '_tablePagination_paginater').css('display', 'none');
					} else {
						jQuery('#' + settings.controlName + '_tablePagination_paginater').css('display', '');
					}
				}

				function createPaginationElements() {
					var size = 1;
					try {
						var mul = 100;
						if (((gx.util.browser.webkit) /*|| gx.util.browser.isIE()*/) &&
							(!(jQuery("#" + settings.controlName).closest(".gxwebcomponent").length > 0))) {
							mul = mul * 100;
						}

						if (currPageNumber > mul * 10) {
							if (jQuery("#" + settings.controlName).closest(".gxwebcomponent").length > 0) {
								size = size + 2;
							}

							var d = currPageNumber / mul
							while (d > 10) {
								d = d / 10;
								size++;
							}
						}
					} catch (ERROR) { }


					var prevButtonsClass = (currPageNumber == 1) ? " disabled_pivot_button" : ""
					var postButtonsClass = (currPageNumber == totalPages) ? " disabled_pivot_button" : ""

					var ua = navigator.userAgent.toLowerCase();
					var isAndroid = ua.indexOf("android") > -1;
					if (!((gx.util.browser.isIPad() || gx.util.browser.isIPhone() || isAndroid) || (false))) {
						var htmlBuffer = [];
						htmlBuffer.push("<div id='" + settings.controlName + "_tablePagination' class='pivot_pag_div'>");
						htmlBuffer.push("<span id='tablePagination_perPage'>");

						htmlBuffer.push("<select id='" + settings.controlName + "tablePagination_rowsPerPage'><option value='5'>5</option></select>");

						htmlBuffer.push(" " + gx.getMessage("GXPL_QViewerJSPerPage") + " ");
						htmlBuffer.push("</span>");
						htmlBuffer.push("<span id='" + settings.controlName + "_tablePagination_paginater'>");
							
						htmlBuffer.push("<div class='pagefirst " + prevButtonsClass + "' id='tablePagination_firstPage' >");
						htmlBuffer.push('<i class="material-icons">first_page</i>')
						htmlBuffer.push("</div>")
							
						htmlBuffer.push("<div class='pageprev " + prevButtonsClass + "' id='tablePagination_prevPage' >");
						htmlBuffer.push('<i class="material-icons">navigate_before</i>')
						htmlBuffer.push("</div>")
							
						htmlBuffer.push("<span style=''>&nbsp;" + gx.getMessage("GXPL_QViewerJSPage") + "&nbsp;</span>");
						htmlBuffer.push("<input id='tablePagination_currPage' type='input' value='" + currPageNumber + "' size='" + size + "'>");
						htmlBuffer.push("<span>&nbsp;" + gx.getMessage("GXPL_QViewerJSOf") + "</span><span id='tablePagination_totalPages'>&nbsp;" + totalPages + "</span>");
						
						htmlBuffer.push("<div class='pagenext " + postButtonsClass + "' id='tablePagination_nextPage' >");
						htmlBuffer.push('<i class="material-icons">navigate_next</i>')
						htmlBuffer.push("</div>")
						
						htmlBuffer.push("<div class='pagelast " + postButtonsClass + "' id='tablePagination_lastPage'>");
						htmlBuffer.push('<i class="material-icons">last_page</i>')
						htmlBuffer.push("</div>")
						
						htmlBuffer.push("</span>");
						htmlBuffer.push("</div>");
						return htmlBuffer.join("").toString();
					} else {
						var htmlBuffer = [];
						htmlBuffer.push("<div id='" + settings.controlName + "_tablePagination' class='pivot_pag_div pivot_pag_div_sd'>");
						htmlBuffer.push("<span id='tablePagination_perPage'>");

						htmlBuffer.push("<select id='" + settings.controlName + "tablePagination_rowsPerPage'><option value='5'>5</option></select>");

						htmlBuffer.push(" " + gx.getMessage("GXPL_QViewerJSPerPage") + " ");
						htmlBuffer.push("</span>");
						htmlBuffer.push("<span id='" + settings.controlName + "_tablePagination_paginater'>");
						
						htmlBuffer.push("<div class='pagefirst " + prevButtonsClass + "' id='tablePagination_firstPage' >");
						htmlBuffer.push('<i class="material-icons">first_page</i>')
						htmlBuffer.push("</div>")
						
						htmlBuffer.push("<div class='pageprev " + prevButtonsClass + "' id='tablePagination_prevPage' >");
						htmlBuffer.push('<i class="material-icons">navigate_before</i>')
						htmlBuffer.push("</div>")
						
						
						htmlBuffer.push("<span style=''>&nbsp;" + gx.getMessage("GXPL_QViewerJSPage") + "&nbsp;</span>");
						htmlBuffer.push("<input id='tablePagination_currPage' type='input' value='" + currPageNumber + "' size='" + size + "'>");
						htmlBuffer.push("<span>&nbsp;" + gx.getMessage("GXPL_QViewerJSOf") + "</span><span id='tablePagination_totalPages'>&nbsp;" + totalPages + "</span>");
						
						htmlBuffer.push("<div class='pagenext " + postButtonsClass + "' id='tablePagination_nextPage' >");
						htmlBuffer.push('<i class="material-icons">navigate_next</i>')
						htmlBuffer.push("</div>")
						
						htmlBuffer.push("<div class='pagelast " + postButtonsClass + "' id='tablePagination_lastPage'>");
						htmlBuffer.push('<i class="material-icons">last_page</i>')
						htmlBuffer.push("</div>")
						
						
						htmlBuffer.push("</span>");
						htmlBuffer.push("</div>");
						return htmlBuffer.join("").toString();

					}

				}

				if (jQuery(table)[tblLocation]().find(totalPagesId).length == 0) {
					if (defaults.topNav) {
						jQuery(this).before(createPaginationElements());
					} else {
						jQuery(this).after(createPaginationElements());
						if (totalPages == 1) {
							jQuery('#' + settings.controlName + '_tablePagination_paginater').css('display', 'none');
						} else {
							jQuery('#' + settings.controlName + '_tablePagination_paginater').css('display', '');
						}
					}
				}
				else {
					jQuery(table)[tblLocation]().find(currPageId).val(currPageNumber);
				}
				resetPerPageValues();
				hideOtherPages(currPageNumber);

				jQuery(table)[tblLocation]().find(firstPageId).bind('click', function (e) {
					resetCurrentPage(1)
				});

				jQuery(table)[tblLocation]().find(prevPageId).bind('click', function (e) {
					resetCurrentPage(currPageNumber - 1)
				});

				jQuery(table)[tblLocation]().find(nextPageId).bind('click', function (e) {
					resetCurrentPage(parseInt(currPageNumber) + 1)
				});

				jQuery(table)[tblLocation]().find(lastPageId).bind('click', function (e) {
					resetCurrentPage(totalPages)
				});

				jQuery(table)[tblLocation]().find(currPageId).bind('change', function (e) {
					resetCurrentPage(this.value)
				});

				jQuery(table)[tblLocation]().find(rowsPerPageId).bind('change', function (e) {
					defaults.rowsPerPage = parseInt(this.value, 10);
					totalPages = resetTotalPages();
					resetCurrentPage(1)
					if (totalPages == 1) {
						jQuery('#' + settings.controlName + '_tablePagination_paginater').css('display', 'none');
					} else {
						jQuery('#' + settings.controlName + '_tablePagination_paginater').css('display', '');
					}
				});

			})
	}
	

	var currPageNumber = [];

	OAT.partialTablePagination = function (container, settings) {
		var defaults = {
				rowsPerPage: 5,
				currPage: 1,
				jstype: "pivot",
				optionsForRows: [5, 10, 25, 50, 100],
				ignoreRows: [],
				topNav: false,
				cantPages: 10
		};
		settings = jQuery.extend(defaults, settings);
		
		return container.each(function () {
				var table = jQuery(this)[0];
				var totalPagesId, currPageId, rowsPerPageId, firstPageId, prevPageId, nextPageId, lastPageId;
				totalPagesId = '#tablePagination_totalPages';
				currPageId = '#tablePagination_currPage';
				rowsPerPageId = '#' + settings.controlName + 'tablePagination_rowsPerPage';
				firstPageId = '#tablePagination_firstPage';
				prevPageId = '#tablePagination_prevPage';
				nextPageId = '#tablePagination_nextPage';
				lastPageId = '#tablePagination_lastPage';
				var tblLocation = (defaults.topNav) ? "prev" : "next";

				try {
					defaults.rowsPerPage = parseInt(defaults.rowsPerPage);
				} catch (ERROR) {
					defaults.rowsPerPage = 10;
				}

				var possibleTableRows = jQuery.makeArray(jQuery('tbody tr', table));
				var tableRows = jQuery.grep(possibleTableRows, function (value, index) {
					return (jQuery.inArray(value, defaults.ignoreRows) == -1);
				}, false)

				var numRows = tableRows.length
				var totalPages = resetTotalPages();
				currPageNumber[settings.controlName] = (defaults.currPage > totalPages) ? 1 : defaults.currPage;
				if (jQuery.inArray(defaults.rowsPerPage, defaults.optionsForRows) == -1)
					defaults.optionsForRows.push(defaults.rowsPerPage);

				function resetTotalPages() {
					return defaults.cantPages;
				}

				function resetCurrentPage(currPageNum, recalculateCantPages) {	//sets current page value
					if (currPageNum < 1 || (currPageNum > jQuery("#" + settings.controlName + "_tablePagination_paginater #tablePagination_totalPages")[0].innerHTML.replace("&nbsp;", "")))
						return;
					currPageNumber[settings.controlName] = currPageNum;
					jQuery(table)[tblLocation]().find(currPageId).val(currPageNumber[settings.controlName]);

					(currPageNumber[settings.controlName] > 1) ? jQuery("#tablePagination_firstPage,#tablePagination_prevPage").removeClass("disabled_pivot_button") :
						jQuery("#tablePagination_firstPage,#tablePagination_prevPage").addClass("disabled_pivot_button");

					(currPageNumber[settings.controlName] != totalPages) ? jQuery("#tablePagination_nextPage,#tablePagination_lastPage").removeClass("disabled_pivot_button") :
						jQuery("#tablePagination_nextPage,#tablePagination_lastPage").addClass("disabled_pivot_button");


					if ((settings.control) && (settings.jstype == "table")) {
						var cantRows = (recalculateCantPages) ? defaults.rowsPerPage : OAT_JS.grid.gridData[settings.controlUcId].rowsPerPage
						settings.control.getDataForTable(settings.controlUcId, currPageNum, cantRows, recalculateCantPages, "", "", "", "", "", true)
						
						setTimeout ( function(){
							totalPages = settings.control.getActualCantPages(settings.controlUcId);
							
							(currPageNumber[settings.controlName] != totalPages) ? jQuery("#tablePagination_nextPage,#tablePagination_lastPage").removeClass("disabled_pivot_button") :
								jQuery("#tablePagination_nextPage,#tablePagination_lastPage").addClass("disabled_pivot_button");
						} , 500)
						
						
					} else if (settings.control) {
						var cantRows = (recalculateCantPages) ? defaults.rowsPerPage : settings.control.rowsPerPage
						settings.control.getDataForPivot(settings.controlUcId, currPageNum, cantRows, recalculateCantPages, "", "", "", "", "", true)
					}
				}

				function resetPerPageValues() {
					var isRowsPerPageMatched = false;
					var optsPerPage = defaults.optionsForRows;
					optsPerPage.sort(function (a, b) { return a - b; });
					var perPageDropdown = jQuery(table)[tblLocation]().find(rowsPerPageId)[0];
					perPageDropdown.length = 0;
					for (var i = 0; i < optsPerPage.length; i++) {
						if (optsPerPage[i] == defaults.rowsPerPage) {
							perPageDropdown.options[i] = new Option(optsPerPage[i], optsPerPage[i], true, true);
							isRowsPerPageMatched = true;
						}
						else {
							perPageDropdown.options[i] = new Option(optsPerPage[i], optsPerPage[i]);
						}
					}



					if ((totalPages == 1) || (totalPages == 0)) {
						jQuery('#' + settings.controlName + '_tablePagination_paginater').css('display', 'none');
					} else {
						jQuery('#' + settings.controlName + '_tablePagination_paginater').css('display', '');
					}
				}

				function createPaginationElements() {
					var size = 1;
					try {
						var mul = 100;
						if (((gx.util.browser.webkit) /*|| gx.util.browser.isIE()*/) &&
							(!(jQuery("#" + settings.controlName).closest(".gxwebcomponent").length > 0))) {
							mul = mul * 100;
						}

						if (currPageNumber[settings.controlName] > mul * 10) {
							if (jQuery("#" + settings.controlName).closest(".gxwebcomponent").length > 0) {
								size = size + 2;
							}

							var d = currPageNumber[settings.controlName] / mul
							while (d > 10) {
								d = d / 10;
								size++;
							}
						}
					} catch (ERROR) { }


					var prevButtonsClass = (currPageNumber[settings.controlName] == 1) ? " disabled_pivot_button" : ""
					var postButtonsClass = (currPageNumber[settings.controlName] == totalPages) ? " disabled_pivot_button" : ""


					var ua = navigator.userAgent.toLowerCase();
					var isAndroid = ua.indexOf("android") > -1;
					if (!((gx.util.browser.isIPad() || gx.util.browser.isIPhone() || isAndroid) || (false))) {
						var htmlBuffer = [];
						htmlBuffer.push("<div id='" + settings.controlName + "_tablePagination' class='pivot_pag_div'>");
						htmlBuffer.push("<span id='tablePagination_perPage'>");

						htmlBuffer.push("<select id='" + settings.controlName + "tablePagination_rowsPerPage'></select>");

						htmlBuffer.push(" " + gx.getMessage("GXPL_QViewerJSPerPage") + " ");
						htmlBuffer.push("</span>");
						htmlBuffer.push("<span id='" + settings.controlName + "_tablePagination_paginater'>");
							
						htmlBuffer.push("<div class='pagefirst " + prevButtonsClass + "' id='tablePagination_firstPage' >");
						htmlBuffer.push('<i class="material-icons">first_page</i>')
						htmlBuffer.push("</div>")
							
						htmlBuffer.push("<div class='pageprev " + prevButtonsClass + "' id='tablePagination_prevPage' >");
						htmlBuffer.push('<i class="material-icons">navigate_before</i>')
						htmlBuffer.push("</div>")
							
						htmlBuffer.push("<span style=''>&nbsp;" + gx.getMessage("GXPL_QViewerJSPage") + "&nbsp;</span>");
						htmlBuffer.push("<input id='tablePagination_currPage' type='input' value='" + currPageNumber[settings.controlName] + "' size='" + size + "'>");
						htmlBuffer.push("<span>&nbsp;" + gx.getMessage("GXPL_QViewerJSOf") + "</span><span id='tablePagination_totalPages'>&nbsp;" + totalPages + "</span>");
						
						htmlBuffer.push("<div class='pagenext " + postButtonsClass + "' id='tablePagination_nextPage' >");
						htmlBuffer.push('<i class="material-icons">navigate_next</i>')
						htmlBuffer.push("</div>")
						
						htmlBuffer.push("<div class='pagelast " + postButtonsClass + "' id='tablePagination_lastPage'>");
						htmlBuffer.push('<i class="material-icons">last_page</i>')
						htmlBuffer.push("</div>")
						
						htmlBuffer.push("</span>");
						htmlBuffer.push("</div>");
						return htmlBuffer.join("").toString();
					} else {
						var htmlBuffer = [];
						htmlBuffer.push("<div id='" + settings.controlName + "_tablePagination' class='pivot_pag_div pivot_pag_div_sd'>");
						htmlBuffer.push("<span id='tablePagination_perPage'>");

						htmlBuffer.push("<select id='" + settings.controlName + "tablePagination_rowsPerPage'><option value='5'>5</option></select>");

						htmlBuffer.push(" " + gx.getMessage("GXPL_QViewerJSPerPage") + " ");
						htmlBuffer.push("</span>");
						htmlBuffer.push("<span id='" + settings.controlName + "_tablePagination_paginater'>");
						
						htmlBuffer.push("<div class='pagefirst " + prevButtonsClass + "' id='tablePagination_firstPage' >");
						htmlBuffer.push('<i class="material-icons">first_page</i>')
						htmlBuffer.push("</div>")
						
						htmlBuffer.push("<div class='pageprev " + prevButtonsClass + "' id='tablePagination_prevPage' >");
						htmlBuffer.push('<i class="material-icons">navigate_before</i>')
						htmlBuffer.push("</div>")
						
						
						htmlBuffer.push("<span style=''>&nbsp;" + gx.getMessage("GXPL_QViewerJSPage") + "&nbsp;</span>");
						htmlBuffer.push("<input id='tablePagination_currPage' type='input' value='" + currPageNumber[settings.controlName] + "' size='" + size + "'>");
						htmlBuffer.push("<span>&nbsp;" + gx.getMessage("GXPL_QViewerJSOf") + "</span><span id='tablePagination_totalPages'>&nbsp;" + totalPages + "</span>");
						
						htmlBuffer.push("<div class='pagenext " + postButtonsClass + "' id='tablePagination_nextPage' >");
						htmlBuffer.push('<i class="material-icons">navigate_next</i>')
						htmlBuffer.push("</div>")
						
						htmlBuffer.push("<div class='pagelast " + postButtonsClass + "' id='tablePagination_lastPage'>");
						htmlBuffer.push('<i class="material-icons">last_page</i>')
						htmlBuffer.push("</div>")
						
						
						htmlBuffer.push("</span>");
						htmlBuffer.push("</div>");
						return htmlBuffer.join("").toString();
					}
				}

				if (jQuery(table)[tblLocation]().find(totalPagesId).length == 0) {
					if (defaults.topNav) {
						jQuery(this).before(createPaginationElements());
					} else {
						jQuery(this).after(createPaginationElements());
					}
				}
				else {
					jQuery(table)[tblLocation]().find(currPageId).val(currPageNumber[settings.controlName]);
				}
				resetPerPageValues();

				jQuery(table)[tblLocation]().find(firstPageId).bind('click', function (e) {
					resetCurrentPage(1, false)
				});

				jQuery(table)[tblLocation]().find(prevPageId).bind('click', function (e) {
					resetCurrentPage(currPageNumber[settings.controlName] - 1, false)
				});

				jQuery(table)[tblLocation]().find(nextPageId).bind('click', function (e) {
					resetCurrentPage(parseInt(currPageNumber[settings.controlName]) + 1, false)  //bind event 
				});

				jQuery(table)[tblLocation]().find(lastPageId).bind('click', function (e) {
					resetCurrentPage(parseInt(jQuery("#" + settings.controlName + "_tablePagination_paginater #tablePagination_totalPages")[0].textContent.replace("&nbsp;", "")), false);
				});

				jQuery(table)[tblLocation]().find(currPageId).bind('change', function (e) {
					resetCurrentPage(parseInt(this.value, 10), false)
				});

				jQuery(table)[tblLocation]().find(rowsPerPageId).bind('change', function (e) {
					defaults.rowsPerPage = parseInt(this.value, 10);
					totalPages = resetTotalPages();
					resetCurrentPage(1, true);
				});

			})
		
		
	}








