jQuery.sap.require("jquery.sap.storage");

sap.ui.controller("shine.democontent.epm.poworklist.view.CurrencyConverter", {
    /**
    * Called when a controller is instantiated and its View controls (if available) are already created.
    * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
    */
    //   onInit: function() {
    //
    //   },

    /**
    * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
    * (NOT before the first rendering! onInit() is used for that one!).
    */
    //   onBeforeRendering: function() {
    //
    //   },

    /**
    * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
    * This hook is the same one that SAPUI5 controls get after being rendered.
    */
    onAfterRendering: function() {
        this.byId("panelCurrency").setText(oBundle.getText("currencyconverter"));
        this.byId("currencyFactor").setText(oBundle.getText("selectcurrency"));
    },

    /**
    * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
    */
    //   onExit: function() {
    //
    //   }

    /*** Numeric Formatter for Currencies ***/
    numericFormatterCurrency: function() {
        var oController = this;
        console.log("called the currency converter api");
        var convpayload = {};
        convpayload.Cur = this.byId("comboBoxCurrency").getSelectedKey();

        //convpayload.Cur = sap.ui.getCore().byId('po_currencyconverter_view--comboBoxCurrency-input').getSelectedKey();
        var currcode = localStorage.getItem("CurCurrency");

        if (currcode == convpayload.Cur) {
            this.byId("TextFieldCur").setValue("1");
        } else {
            this.byId("TextFieldCur").setValue("getting currency value...");

            // handle xsrf token
            // first obtain token using Fetch
            var xsrf_token;

            $.ajax({
                type: "GET",
                async: false,
                url: "/sap/hana/democontent/epm/services/soCreate.xsodata",
                contentType: "application/json",

                headers: {
                    "x-csrf-token": "Fetch"
                },

                success: function(data, textStatus, request) {
                    xsrf_token = request.getResponseHeader("x-csrf-token");
                }
            });

            $.ajax({
                type: "POST",
                url: "/sap/hana/democontent/epm/services/currConv.xsjs",
                contentType: "application/json",
                data: JSON.stringify(convpayload),
                dataType: "json",

                headers: {
                    "x-csrf-token": xsrf_token
                },

                success: function(data) {},

                dataFilter: function(data) {
                    var resdata = JSON.parse(data);

                    if (convpayload.Cur == "EUR") {
                        resdata = 1 / resdata;
                    }

                    if (data == 0) {
                        oController.byId("TextFieldCur").setValue("Load Currency Table");
                    } else {
                        oController.byId("TextFieldCur").setValue(JSON.stringify(resdata));
                    }
                }
            });
        }
    }
});