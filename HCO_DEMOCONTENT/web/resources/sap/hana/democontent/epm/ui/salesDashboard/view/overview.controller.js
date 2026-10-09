sap.ui.controller("sap.hana.democontent.epm.salesdashboard.view.overview", {
    /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf shine-so.overview
         */
    onInit: function() {
        var oDiscountModel = new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/salesDiscount.xsodata/", true);
        var oDropDown = sap.ui.getCore().byId("overview--discountDropDown");
        var filterParam = "";

        if (oDropDown.getSelectedKey() === "") {
            filterParam = "AMER";
        } else {
            filterParam = oDropDown.getSelectedKey();
        }

        this.onFilterChange(filterParam);
        var oDiscountChart = sap.ui.getCore().byId("overview--salesDiscountPie");
        oDiscountChart.setModel(oDiscountModel);

        // --------------------------------------
        // Sales By Region Pie Chart Data model
        var oSalesRegionModel = new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/salesByRegion.xsodata", true);

        var sort1 = new sap.ui.model.Sorter("TOTAL_SALES", true);

        var regionDataset = new sap.viz.ui5.data.FlattenedDataset({
            dimensions: [{
                axis: 1,
                name: sap.app.i18n.getText("REGION"),
                value: "{REGION}"
            }],

            measures: [{
                name: sap.app.i18n.getText("TOTAL_SALES"),
                value: "{TOTAL_SALES}"
            }]
        }, true);

        regionDataset.bindData("/SalesByRegion", sort1);
        var oSalesRegionPie = sap.ui.getCore().byId("overview--saleRegionPie");
        oSalesRegionPie.setDataset(regionDataset);
        oSalesRegionPie.setModel(oSalesRegionModel);

        // // --------------------------------------
        // // Sales by country bar chart model
        var oSalesCountryModel = new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/salesByCountry.xsodata/", true);

        var countryDataset = new sap.viz.ui5.data.FlattenedDataset({
            dimensions: [{
                axis: 1,
                name: sap.app.i18n.getText("COUNTRY"),
                value: "{COUNTRY}"
            }],

            measures: [{
                name: sap.app.i18n.getText("TOTAL_SALES"),
                value: "{TOTAL_SALES}"
            }]
        }, true);

        countryDataset.bindData("/SalesByCountry", sort1);
        var oSalesCountryBarChart = sap.ui.getCore().byId("overview--salesCountryBar");
        oSalesCountryBarChart.setDataset(countryDataset);
        oSalesCountryBarChart.setModel(oSalesCountryModel);

        // // --------------------------------------
        // // Sales rank bubble chart
        var oSalesRankModel = new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/salesSalesRank.xsodata/", true);

        sort1 = new sap.ui.model.Sorter("SALES");

        var salesRankDataset = new sap.viz.ui5.data.FlattenedDataset({
            dimensions: [{
                axis: 1,
                name: sap.app.i18n.getText("COMPANY_NAME"),
                value: "{COMPANY_NAME}"
            }],

            measures: [{
                group: 1,
                name: sap.app.i18n.getText("TOTAL_SALES"),
                value: "{SALES}"
            }, {
                group: 2,
                name: sap.app.i18n.getText("SALES_RANK"),
                value: "{SALES_RANK}"
            }, {
                group: 3,
                name: sap.app.i18n.getText("NUMBER_OF_ORDERS"),
                value: "{ORDERS}"
            }]
        });

        salesRankDataset.bindData("/salesRank", sort1);
        var oSalesRankBubble = sap.ui.getCore().byId("overview--salesRankBubble");
        oSalesRankBubble.setDataset(salesRankDataset);
        oSalesRankBubble.setModel(oSalesRankModel);
    },

    onFilterChangeWrapper: function(oEvent) {
        this.onFilterChange(oEvent.getSource().getSelectedKey());
    },

    /** 
         * Method is called whenever the user ch.anges the selection in the drop down for Discount by region.
         */
    onFilterChange: function(aFilter) {
        var oDataset = new sap.viz.ui5.data.FlattenedDataset({
            dimensions: [{
                // must be one for the x-axis, 2 for y-axis
                axis: 1,

                name: "Company",
                value: "{COMPANY_NAME}"
            }],

            measures: [// measure 1
            {
                // 'name' is used as label in the Legend 
                name: "Discount %",

                // 'value' defines the binding for the displayed value   
                value: "{DISCOUNT}"
            }]
        }, true);

        oDataset.bindData({
            path: "/InputParams(IP_EMEA='EMEA',IP_AMER='AMER',IP_APJ='APJ',IP_AFR='AFR')/Results",

            filters: [new sap.ui.model.odata.Filter("REGION", [{
                operator: sap.ui.model.FilterOperator.EQ,
                value1: aFilter
            }]), new sap.ui.model.odata.Filter("DISCOUNT", [{
                operator: sap.ui.model.FilterOperator.GT,
                value1: 0
            }])]
        });

        var oDiscountChart = sap.ui.getCore().byId("overview--salesDiscountPie");
        oDiscountChart.setDataset(oDataset);
    },

    //for showing the hierarchy functionality
    openTileDialog: function(oEvent) {
        var iData = parseInt(oEvent.getSource().data("tileDialog"), 10);
        var tileDialog = new sap.account.TileDialog(this, true);
        tileDialog.open(iData);
    },

    //below functions are used

    getPieData: function(region) {
        $.ajax({
            type: "GET",
            async: false,
            url: "/sap/hana/democontent/epm/services/levelHierarchy.xsjs?cmd=getHierarchyData&region=" + region,

            success: function(data) {
                var oModel = new sap.ui.model.json.JSONModel({}, true);
                oModel.setData(data);
                var oSalesCountryBarChart = sap.ui.getCore().byId("overview--salesCountryBar");
                oSalesCountryBarChart.setModel(oModel);
                var panel = sap.ui.getCore().byId("__panel1");

                // panel.destroyTitle();
                panel.getTitle().setText("Sales By Country -" + region);
            },

            error: function(err) {
                alert(err.toString());
            }
        });
    },

    onPieDataSelected: function(oEvent) {
        var region = oEvent.mParameters.data[0].target.__data__.dimValueObjects[0].val;
        this.getPieData(region);
    },

    onChartRefresh: function(oEvent) {
        var oSalesCountryModel = new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/salesByCountry.xsodata/", true);
        var oSalesCountryBarChart = sap.ui.getCore().byId("overview--salesCountryBar");
        var panel = sap.ui.getCore().byId("__panel1");
        oSalesCountryBarChart.setModel(oSalesCountryModel);
        panel.getTitle().setText("Sales By Country-All Regions");

        //refrshing the pie chart
        var oSalesRegionModel = new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/salesByRegion.xsodata", true);

        var oSalesRegionPie = sap.ui.getCore().byId("overview--saleRegionPie");
        oSalesRegionPie.setModel(oSalesRegionModel);
    }
});