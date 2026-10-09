sap.ui.controller("shine.democontent.epm.helloWorld.view.HelloWorld", {
    onPress: function(oEvent) {
        var oButton = oEvent.getSource();
        oButton.$().fadeOut();
    }
});