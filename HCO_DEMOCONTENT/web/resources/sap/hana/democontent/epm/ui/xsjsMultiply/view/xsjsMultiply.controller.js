sap.ui.controller("shine.democontent.epm.xsjsMultiply.view.xsjsMultiply", {
    onInit: function() {
        this.oInput1 = this.byId("idInput1");
        this.oInput2 = this.byId("idInput2");
    },

    onLiveChange: function(oEvent) {
        var aUrl = "/sap/hana/democontent/epm/services/multiply.xsjs?cmd=multiply" + "&num1=" + escape(oEvent.getParameter("liveValue")) + "&num2=" + escape(
            oEvent.getSource() === this.oInput1 ? this.oInput2.getValue() : this.oInput1.getValue()
        );

        jQuery.ajax({
            url: aUrl,
            method: "GET",
            dataType: "json",
            success: jQuery.proxy(this.onCompleteMultiply, this),
            error: this.onErrorCall
        });
    },

    onCompleteMultiply: function(myTxt) {
        var oResult = this.byId("result");

        if (myTxt === undefined) {
            oResult.setText(0);
        } else {
            jQuery.sap.require("sap.ui.core.format.NumberFormat");

            var oNumberFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
                maxFractionDigits: 12,
                minFractionDigits: 0,
                groupingEnabled: true
            });

            oResult.setText(oNumberFormat.format(myTxt));
        }
    },

    onErrorCall: function(jqXHR, textStatus, errorThrown) {
        sap.ui.commons.MessageBox.show(jqXHR.responseText, "ERROR", "Service Call Error");
        return;
    }
});