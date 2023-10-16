declare module "jspivottable" {
  export function renderJSPivot(pivotParams,QueryViewerCollection,translations,qViewer);
  export function setPageDataForPivotTable(oat_element,resXML);

  export function setAttributeValuesForPivotTable(oat_element,resJSON);
  export function setPivottableDataCalculation(oat_element,resText);
  export function setDataSynForPivotTable(oat_element,result);

  export function setPageDataForTable(oat_element,resXML);
  export function setAttributeForTable(oat_element,resJSON);
  export function setDataSynForTable(oat_element,result);
	
  export function getDataXML(oat_element,serverData): string;
  export function getFilteredDataXML(oat_element,serverData): string;
}