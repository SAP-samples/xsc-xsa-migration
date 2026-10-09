jQuery.sap.declare("util.Utility");
sap.ui.localResources("i18n");

/**
 * To support different languages, the file i18n.properties needs to be translated to the desired language 
 * and saved in same project folder after changing the file name to the corresponding language name (e.g. i18n_en_US.properties )
 * @param propertiesFile - path to properties files. 
 * @returns locale resource object according to client browser locale. 
 */
var oBundle = initLocalization("i18n/messagebundle.hdbtextbundle");

function initLocalization(propertiesFile) {
    var sLocale = sap.ui.getCore().getConfiguration().getLanguage();

    return jQuery.sap.resources({
        url: propertiesFile,
        locale: sLocale
    });
}

/**
 * Writes error details to console log and displays an error message.
 * 
 * @param oError - an error object containing the error details.
 */
function displayError(error) {
    var messageOut = error.message ? oBundle.getText("MESSAGE") + " " + error.message : "";
    var responseTextOut = error.responseText ? "\n" + oBundle.getText("RESPONSE_TEXT") + " " + error.responseText : "";
    var statusCodeOut = error.statusCode ? "\n" + oBundle.getText("STATUS_CODE") + " " + error.statusCode : "";
    var statusTextOut = error.statusText ? "\n" + oBundle.getText("STATUS_TEXT") + " " + error.statusText : "";
    var requestUriOut = error.requestUri ? "\n" + oBundle.getText("REQUEST_URI") + " " + error.requestUri : "";
    var errorMessage = messageOut + responseTextOut + statusCodeOut + statusTextOut + requestUriOut;
    jQuery.sap.log.error(errorMessage);

    if (jQuery.device.is.desktop) {
        jQuery.sap.require("sap.ui.commons.MessageBox");

        sap.ui.commons.MessageBox.show(
            error.message,
            sap.ui.commons.MessageBox.Icon.ERROR,
            oBundle.getText("ERROR_MESSAGE_TITLE"),
            [sap.ui.commons.MessageBox.Action.OK]
        );
    } else {
        jQuery.sap.require("sap.m.MessageBox");

        sap.m.MessageBox.show(
            error.message,
            sap.m.MessageBox.Icon.ERROR,
            oBundle.getText("ERROR_MESSAGE_TITLE"),
            [sap.m.MessageBox.Action.CLOSE]
        );
    }
}

/**
 * Returns a standard error object from a response error object 
 * @param oError - error object return in odataModel failed callback method
 * @param errorMessage? - optional message when error object is null
 */
function formatErrorResponse(oError, sErrorMessage) {
    var oErrorFormatted = {
        message: oBundle.getText("GENERAL_ERROR_MESSAGE")
    };

    if (sErrorMessage) {
        oErrorFormatted = {
            message: sErrorMessage
        };
    }

    if (!oError) {
        return oErrorFormatted;
    }

    if (oError.message && !sErrorMessage) {
        oErrorFormatted.message = oError.message;
    }

    if (oError.response) {
        oErrorFormatted.responseText = oError.response.body;
        oErrorFormatted.statusCode = oError.response.statusCode;
        oErrorFormatted.statusText = oError.response.statusText;
        oErrorFormatted.requestUri = oError.response.requestUri;
    }

    return oErrorFormatted;
}

jQuery.sap.require("jquery.sap.storage");
var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
var sKeyTheme = "sap.gw.ui5.theme";

/**
 * Loads the preferred theme from the local storage and apply it
 * @param sTheme the preferred theme to load in case there is no theme stored 
 */
function loadTheme(sTheme) {
    var theme = oStorage.get(sKeyTheme);

    if (!theme)
        theme = sTheme;

    sap.ui.getCore().applyTheme(theme);
}

function parseHTML(oData, sTagName) {
    var oParser = new DOMParser();
    var xmlObject = oParser.parseFromString(oData, "text/xml");
    return $(xmlObject).find(sTagName);
}