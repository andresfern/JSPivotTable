
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
						if ( (OAT.isWebkit()) &&
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
					if (!(OAT.isSD())) {
						var htmlBuffer = [];
						htmlBuffer.push("<div id='" + settings.controlName + "_tablePagination' class='pivot_pag_div'>");
						htmlBuffer.push("<span id='tablePagination_perPage'>");

						htmlBuffer.push("<select id='" + settings.controlName + "tablePagination_rowsPerPage'></select>");

						htmlBuffer.push(" " + settings.translations.GXPL_QViewerJSPerPage + " ");
						htmlBuffer.push("</span>");
						htmlBuffer.push("<span id='" + settings.controlName + "_tablePagination_paginater'>");
							
						htmlBuffer.push("<div class='pagefirst " + prevButtonsClass + "' id='tablePagination_firstPage' >");
						htmlBuffer.push('<i class="material-icons">first_page</i>')
						htmlBuffer.push("</div>")
							
						htmlBuffer.push("<div class='pageprev " + prevButtonsClass + "' id='tablePagination_prevPage' >");
						htmlBuffer.push('<i class="material-icons">navigate_before</i>')
						htmlBuffer.push("</div>")
							
						htmlBuffer.push("<span style=''>&nbsp;" + settings.translations.GXPL_QViewerJSPage + "&nbsp;</span>");
						htmlBuffer.push("<input id='tablePagination_currPage' type='input' value='" + currPageNumber[settings.controlName] + "' size='" + size + "'>");
						htmlBuffer.push("<span>&nbsp;" + settings.translations.GXPL_QViewerJSOf + "</span><span id='tablePagination_totalPages'>&nbsp;" + totalPages + "</span>");
						
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

						htmlBuffer.push(" " + settings.translations.GXPL_QViewerJSPerPage  + " ");
						htmlBuffer.push("</span>");
						htmlBuffer.push("<span id='" + settings.controlName + "_tablePagination_paginater'>");
						
						htmlBuffer.push("<div class='pagefirst " + prevButtonsClass + "' id='tablePagination_firstPage' >");
						htmlBuffer.push('<i class="material-icons">first_page</i>')
						htmlBuffer.push("</div>")
						
						htmlBuffer.push("<div class='pageprev " + prevButtonsClass + "' id='tablePagination_prevPage' >");
						htmlBuffer.push('<i class="material-icons">navigate_before</i>')
						htmlBuffer.push("</div>")
						
						
						htmlBuffer.push("<span style=''>&nbsp;" + settings.translations.GXPL_QViewerJSPage + "&nbsp;</span>");
						htmlBuffer.push("<input id='tablePagination_currPage' type='input' value='" + currPageNumber[settings.controlName] + "' size='" + size + "'>");
						htmlBuffer.push("<span>&nbsp;" + settings.translations.GXPL_QViewerJSOf + "</span><span id='tablePagination_totalPages'>&nbsp;" + totalPages + "</span>");
						
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




















