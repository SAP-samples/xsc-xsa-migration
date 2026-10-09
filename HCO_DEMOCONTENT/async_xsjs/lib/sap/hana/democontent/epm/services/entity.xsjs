await $.import("sap.hana.xs.libs.dbutils", "xsds_gen");
var XSDS1 = $.sap.hana.xs.libs.dbutils.xsds_gen;
var js = XSDS1.generateEntity("sap.hana.democontent.epm.data", "Util.Messages",{
    },
    { $schemaName: "SAP_HANA_DEMO" }
);
$.response.status = $.net.http.OK;
await $.response.setBody(js);
export default {XSDS1,js};
