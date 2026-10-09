await $.import("sap.hana.democontent.epm.services", "messages");
var MESSAGES = $.sap.hana.democontent.epm.services.messages;
await $.import("sap.hana.democontent.epm.services", "session");
var SESSIONINFO = $.sap.hana.democontent.epm.services.session;

async function getFilter() {
    function createFilterEntry(rs, attribute, obj) {
        return {
            "terms": rs.TERMS,
            "attribute": attribute,
            "category": obj
        };
    }

    var body = '';
    var terms = $.request.parameters.get('query');
    terms = terms.replace("'", "");
    var termList = terms.split(" ");
    var termStr = "";
    var i;
    for (i = 0; i < termList.length; i++) {
        termStr += termList[i].replace(/\s+/g, '') + "* ";
    }
    terms = termStr;

    var conn = await $.hdb.getConnection();
    var rs;
    var query;
    var list = [];

    try {
        // Business Partner Company Name
        query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(COMPANYNAME) AS TERMS FROM"sap.hana.democontent.epm.data::MD.BusinessPartner" ' + ' WHERE CONTAINS(COMPANYNAME,?)';
        rs = await conn.executeQuery(query, terms);

        for (i = 0; i < rs.length; i++) {
            list.push(createFilterEntry(rs[i], MESSAGES.getMessage('SEPM_POWRK',
                '001'), "businessPartner"));
        }

        // Business Partner City
        query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR("CITY") AS TERMS FROM "sap.hana.democontent.epm.models::BUYER" ' + ' WHERE CONTAINS("CITY",?)';
        rs = await conn.executeQuery(query, terms);

        for (i = 0; i < rs.length; i++) {
            list.push(createFilterEntry(rs[i], MESSAGES.getMessage('SEPM_POWRK',
                '007'), "businessPartner"));
        }

        // Product - Product Category
        query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(CATEGORY) AS TERMS FROM"sap.hana.democontent.epm.data::MD.Products" ' + 'WHERE CONTAINS(CATEGORY,?)';
        rs = await conn.executeQuery(query, terms);

        for (i = 0; i < rs.length; i++) {
            list.push(createFilterEntry(rs[i], MESSAGES.getMessage('SEPM_POWRK',
                '008'), "products"));
        }

        // Product - Product ID
        query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(PRODUCTID) AS TERMS FROM"sap.hana.democontent.epm.data::MD.Products" ' + 'WHERE CONTAINS(PRODUCTID,?)';
        rs = await conn.executeQuery(query, terms);

        for (i = 0; i < rs.length; i++) {
            list.push(createFilterEntry(rs[i], MESSAGES.getMessage('SEPM_POWRK',
                '009'), "products"));
        }

        // Product - Product Name
        query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR("PRODUCT_NAME") AS TERMS FROM "sap.hana.democontent.epm.models::PROD" ' + 'WHERE CONTAINS("PRODUCT_NAME",?)';
        rs = await conn.executeQuery(query, terms);

        for (i = 0; i < rs.length; i++) {
            list.push(createFilterEntry(rs[i], MESSAGES.getMessage('SEPM_POWRK',
                '010'), "products"));
        }

        // Product - Product Desc
        query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR("PRODUCT_DESCRIPTION") AS TERMS FROM "sap.hana.democontent.epm.models::PROD" ' + 'WHERE CONTAINS("PRODUCT_DESCRIPTION",?)';
        rs = await conn.executeQuery(query, terms);

        for (i = 0; i < rs.length; i++) {
            list.push(createFilterEntry(rs[i], MESSAGES.getMessage('SEPM_POWRK',
                '011'), "products"));
        }

        // PO - PO ID
        query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(PURCHASEORDERID) AS TERMS FROM"sap.hana.democontent.epm.data::PO.Header" ' + 'WHERE CONTAINS(PURCHASEORDERID,?)';
        rs = await conn.executeQuery(query, terms);

        for (i = 0; i < rs.length; i++) {
            list.push(createFilterEntry(rs[i], MESSAGES.getMessage('SEPM_POWRK',
                '002'), "purchaseOrder"));
        }

        await conn.close();
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(e.message);
        return;
    }
    body = JSON.stringify(list);
    $.trace.debug(body);
    $.response.contentType = 'application/json';
    await $.response.setBody(body);
    $.response.status = $.net.http.OK;
}

async function getTotalOrders() {
    function createTotalEntry(rs) {
        return {
            "name": rs.GROUP1,
            "value": rs.AMOUNT1
        };
    }

    var body = '';
    var ivGroupBy = $.request.parameters.get('groupby');
    ivGroupBy = ivGroupBy.replace("'", "");
    var ivCurrency = $.request.parameters.get('currency');
    ivCurrency = ivCurrency.replace("'", ""); 
    var list = [];

    switch (ivGroupBy) {
        case "COMPANYNAME":
            break;
        case "CATEGORY":
            break;
        case "CITY":
            break;
        case "POSTALCODE":
            break;
        case "PRODUCTID":
            break;

        default:
            $.response.status = $.net.http.BAD_REQUEST;
            await $.response.setBody(MESSAGES.getMessage('SEPM_ADMIN', '000', ivGroupBy));
            return;

    }
    if (ivCurrency === null) {
        ivCurrency = "USD";
    }
    ivCurrency = ivCurrency.substring(0, 3);


    var CheckUpperCase = new RegExp('[A-Z]{3}');

    if (CheckUpperCase.test(ivCurrency) === true) {
        try {
            // not able to add Currency as prepared statement using setString so adding it in query directly
            var query = 'SELECT top 5 ' + ivGroupBy + ' AS GROUP1, SUM("CONVGROSSAMOUNT") AS AMOUNT1 FROM "sap.hana.democontent.epm.models::PURCHASE_COMMON_CURRENCY"' + ' (\'PLACEHOLDER\' = (\'$$IP_O_TARGET_CURRENCY$$\', \'' + ivCurrency + '\')) group by ' + ivGroupBy + ' order by sum("CONVGROSSAMOUNT") desc';
            $.trace.debug(query);
            var conn = await $.hdb.getConnection();
            var rs = await conn.executeQuery(query);
            var i;

            for (i = 0; i < rs.length; i++) {
                list.push(createTotalEntry(rs[i]));
            }

            await conn.close();

        } catch (e) {
            $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
            await $.response.setBody(e.message);
            return;
        }

        body = JSON.stringify({
            "entries": list
        });

        $.response.contentType = 'application/json; charset=UTF-8';
        await $.response.setBody(body);
        $.response.status = $.net.http.OK;

    } else {
        $.response.status = $.net.http.BAD_REQUEST;
        await $.response.setBody(MESSAGES.getMessage('SEPM_BOR_MESSAGES', '053', encodeURI(ivCurrency)));
        return;
    }
}

async function downloadExcel() {
    var body = '';

    try {
        var query = 'SELECT TOP 25000 "PurchaseOrderId", "PartnerId", "CompanyName", "CreatedByLoginName", "CreatedAt", "GrossAmount" ' + 'FROM "sap.hana.democontent.epm.data::PO.HeaderView" order by "PurchaseOrderId"';

        $.trace.debug(query);
        var conn = await $.hdb.getConnection();
        var rs = await conn.executeQuery(query);

        body = MESSAGES.getMessage('SEPM_POWRK', '002') + "\t" + // Purchase
            // Order ID
            MESSAGES.getMessage('SEPM_POWRK', '003') + "\t" + // Partner ID
            MESSAGES.getMessage('SEPM_POWRK', '001') + "\t" + // Company Name
            MESSAGES.getMessage('SEPM_POWRK', '004') + "\t" + // Employee
            // Responsible
            MESSAGES.getMessage('SEPM_POWRK', '005') + "\t" + // Created At
            MESSAGES.getMessage('SEPM_POWRK', '006') + "\n"; // Gross Amount

        var i;
        for (i = 0; i < rs.length; i++) {
            body += rs[i].PurchaseOrderId + "\t" + rs[i].PartnerId + "\t" + rs[i].CompanyName + "\t" + rs[i].CreatedByLoginName + "\t" + rs[i].CreatedAt + "\t" + rs[i].GrossAmount + "\n";
        }
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(e.message);
        return;
    }

    await $.response.setBody(body);
    $.response.contentType = 'application/vnd.ms-excel; charset=utf-16le';
    $.response.headers.set('Content-Disposition',
        'attachment; filename=Excel.xls');
    $.response.status = $.net.http.OK;

}


//Zip Functionality
async function downloadZip() {
    var body = '';

    try {

        var query = 'SELECT TOP 25000 "PurchaseOrderId", "PartnerId", "CompanyName", "CreatedByLoginName", "CreatedAt", "GrossAmount" ' + 'FROM "sap.hana.democontent.epm.data::PO.HeaderView" order by "PurchaseOrderId"';

        $.trace.debug(query);
        var conn = await $.hdb.getConnection();
        var rs = await conn.executeQuery(query);

        body = MESSAGES.getMessage('SEPM_POWRK', '002') + "\t" + // Purchase
            // Order ID
            MESSAGES.getMessage('SEPM_POWRK', '003') + "\t" + // Partner ID
            MESSAGES.getMessage('SEPM_POWRK', '001') + "\t" + // Company Name
            MESSAGES.getMessage('SEPM_POWRK', '004') + "\t" + // Employee
            // Responsible
            MESSAGES.getMessage('SEPM_POWRK', '005') + "\t" + // Created At
            MESSAGES.getMessage('SEPM_POWRK', '006') + "\n"; // Gross Amount

        var i;
        for (i = 0; i < rs.length; i++) {
            body += rs[i].PurchaseOrderId + "\t" + rs[i].PartnerId + "\t" + rs[i].CompanyName + "\t" + rs[i].CreatedByLoginName + "\t" + rs[i].CreatedAt + "\t" + rs[i].GrossAmount + "\n";
        }

        var zip = await new $.util.Zip();
        zip["Excel.xls"] = body;

        $.response.status = $.net.http.OK;
        $.response.contentType = "application/zip";
        $.response.headers.set('Content-Disposition', "attachment; filename = Purchase.zip");
        await $.response.setBody(zip.asArrayBuffer());

    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(e.message);
        return;
    }


}


//end of zip

var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {
    case "filter":
        await getFilter();
        break;
    case "getTotalOrders":
        await getTotalOrders();
        break;
    case "Excel":
        await downloadExcel();
        break;
    case "Zip":
        await downloadZip();
        break;
    case "getSessionInfo":
        SESSIONINFO.fillSessionInfo();
        break;
    default:
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(MESSAGES.getMessage('SEPM_ADMIN', '002', aCmd));
}
export default {MESSAGES,SESSIONINFO,getFilter,getTotalOrders,downloadExcel,downloadZip,aCmd};
