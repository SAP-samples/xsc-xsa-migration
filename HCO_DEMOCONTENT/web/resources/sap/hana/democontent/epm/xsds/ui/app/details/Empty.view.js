/**
 * The first details view in Tablet's app.
 * This view is place holder until the first actual details view is selected.
 */
sap.ui.jsview("app.details.Empty", {
    createContent: function(oController) {
        return new sap.m.Page({
            content: []
        });
    }
});