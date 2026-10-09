jQuery.sap.declare("Application");
jQuery.sap.require("sap.ui.app.Application");
sap.ui.localResources("util");

sap.ui.app.Application.extend("Application", {
    init: function() {
        jQuery.sap.require("util.Utility");
        jQuery.sap.require("util.Formatter");
        jQuery.sap.require("util.Connectivity");
        jQuery.sap.require("util.BusyDialogHandler");

        //Call the method that created the model - login dialog will popup as no credantial where given 
        createModel();
    },

    main: function() {
        sap.ui.localResources("app");
        var root = this.getRoot();
        sap.ui.jsview("app.App", "app.App").placeAt(root);
    }
});