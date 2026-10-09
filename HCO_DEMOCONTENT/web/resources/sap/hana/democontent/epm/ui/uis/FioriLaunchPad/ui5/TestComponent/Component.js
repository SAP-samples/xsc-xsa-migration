// other require statements can go here
jQuery.sap.require("sap.ui.core.UIComponent");

jQuery.sap.declare("test.TestComponent.Component"); // change this to your package/component name

// new Component
sap.ui.core.UIComponent.extend("test.TestComponent.Component", {
    //this should be changed to match the declare statement
    metadata: {
        //        "abstract": true,
        //        version : "1.0",
        //        includes : [ "css/complayout.css" ],  //array of css and/or javascript files that should be used in the component
        //        dependencies : { // external dependencies
        //            libs : []// array of required libraries, e.g. UX3 if your component depends on them 
        //            ui5version : "1.13.0"
        //        },
        //        publicMethods: [ "render" ],
        //        aggregations: {
        //            "rootControl": { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" } // needs to be set to enable databinding functionality
        //        },
        //        autoDestroy: false, // destroy component when view should be destroyed
        //        initOnBeforeRender: true
        properties: {}
    }
});

test.TestComponent.Component.prototype.createContent = function() {
    this.oButton = new sap.ui.commons.Button(this.createId("btn"), {
        text: "This is a button of a UIComponent"
    });

    return this.oButton;
};