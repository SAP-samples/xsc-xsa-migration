//To use a javascript controller its name must end with .controller.js
sap.ui.controller("sap.hana.democontent.epm.admin.ui.view.App", {
    onInit: function() {
        this.getView().addStyleClass("sapUiSizeCompact");
    },

    logout: function() {
        var aUrl = "/sap/hana/xs/formLogin/token.xsjs";

        jQuery.ajax({
            url: aUrl,
            method: "GET",
            dataType: "text",

            beforeSend: function(jqXHR) {
                jqXHR.setRequestHeader("X-CSRF-Token", "Fetch");
            },

            success: function(arg1, arg2, jqXHR) {
                var aUrl = "/sap/hana/xs/formLogin/logout.xscfunc";

                jQuery.ajax({
                    url: aUrl,
                    type: "POST",
                    dataType: "text",

                    beforeSend: function(jqXHR1, settings) {
                        jqXHR1.setRequestHeader("X-CSRF-Token", jqXHR.getResponseHeader("X-CSRF-Token"));
                    },

                    success: function() {
                        location.reload();
                    },

                    error: function() {}
                });
            },

            error: function() {}
        });
    }
});