jQuery.sap.declare("util.Formatter");

/**
 * Function that formats date time values as received from an Odata service. 
 */
function fnDateTimeFormatter(oValue) {
    if (oValue === undefined || oValue === "")
        return;

    var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance();
    return oDateFormat.format(new Date(oValue));
}