jQuery.sap.require("sap.ui.commons.Button");

sap.ui.jsview("test.ui5", {
    // define the (default) controller type for this View
    getControllerName: function() {
        return "test.ui5";
    },

    // defines the UI of this View
    createContent: function(oController) {
        // button text is bound to Model, "press" action is bound to Controller's event handler
        return new sap.ui.commons.Button({
            text: "Hello JS View",
            press: "doSomething"
        });
    }
});