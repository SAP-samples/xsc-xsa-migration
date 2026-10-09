try {
    var conn = await $.db.getConnection();
    var pstmt;
    var rs;

    // get the user ID from session
    pstmt = conn.prepareStatement('SELECT SESSION_USER "session user" FROM DUMMY');
    rs = await pstmt.executeQuery();

    var user = '';

    if (await rs.next()) {
        user = rs.getString(1);
    }
    await rs.close();
    await pstmt.close();

    var body = {};

    // check if he has User.hdbrole
    pstmt = conn.prepareStatement('SELECT A.GRANTEE, A.ROLE_NAME, B.ROLE_NAME, C.ROLE_NAME, D.ROLE_NAME FROM "SYS"."GRANTED_ROLES" A, ' + '"SYS"."GRANTED_ROLES" B, "SYS"."GRANTED_ROLES" C, "SYS"."GRANTED_ROLES" D WHERE A.ROLE_NAME = B.GRANTEE AND A.GRANTEE' + " = '" + user + "' AND B.ROLE_NAME = C.GRANTEE AND C.ROLE_NAME = D.GRANTEE AND (A.ROLE_NAME = 'sap.hana.democontent.epm.roles::User'" + " OR B.ROLE_NAME = 'sap.hana.democontent.epm.roles::User' OR C.ROLE_NAME = 'sap.hana.democontent.epm.roles::User'" + " OR D.ROLE_NAME = 'sap.hana.democontent.epm.roles::User')");
    rs = await pstmt.executeQuery();

    if (await rs.next()) {
        body.hasUserRole = true;
    } else {
        body.hasUserRole = false;
    }
    await rs.close();
    await pstmt.close();

    // check if he has Admin.hdbrole
    pstmt = conn.prepareStatement('SELECT A.GRANTEE, A.ROLE_NAME, B.ROLE_NAME, C.ROLE_NAME, D.ROLE_NAME FROM "SYS"."GRANTED_ROLES" A, ' + '"SYS"."GRANTED_ROLES" B, "SYS"."GRANTED_ROLES" C, "SYS"."GRANTED_ROLES" D WHERE A.ROLE_NAME = B.GRANTEE AND A.GRANTEE' + " = '" + user + "' AND B.ROLE_NAME = C.GRANTEE AND C.ROLE_NAME = D.GRANTEE AND (A.ROLE_NAME = 'sap.hana.democontent.epm.roles::Admin'" + " OR B.ROLE_NAME = 'sap.hana.democontent.epm.roles::Admin' OR C.ROLE_NAME = 'sap.hana.democontent.epm.roles::Admin'" + " OR D.ROLE_NAME = 'sap.hana.democontent.epm.roles::Admin')");
    rs = await pstmt.executeQuery();

    if (await rs.next()) {
        body.hasAdminRole = true;
    } else {
        body.hasAdminRole = false;
    }
    await rs.close();
    await pstmt.close();

    // check if analytic privileges are granted
    pstmt = conn.prepareStatement('select * from "SYS"."GRANTED_PRIVILEGES" where GRANTEE = \'sap.hana.democontent.epm.roles::User\' AND OBJECT_TYPE = \'ANALYTICALPRIVILEGE\' AND (OBJECT_NAME = \'sap.hana.democontent.epm.models/AP_SALES_ORDER\' OR OBJECT_NAME = \'sap.hana.democontent.epm.models/AP_PURCHASE_ORDER\')');
    rs = await pstmt.executeQuery();

    if (await rs.next()) {
        body.hasAnalyticPrivilege = true;
    } else {
        body.hasAnalyticPrivilege = false;
    }
    await rs.close();
    await pstmt.close();

    try {
        // check if time data is present
        pstmt = conn.prepareStatement('select count(*) from "_SYS_BI"."M_TIME_DIMENSION" WHERE YEAR = 2012');
        rs = await pstmt.executeQuery();
        if (await rs.next()) {
            if (parseInt(rs.getString(1), 10) > 0) {
                body.hasTimeData = true;
            } else {
                body.hasTimeData = false;
            }

        } else {
            body.hasTimeData = false;
        }
        await rs.close();
        await pstmt.close();
    } catch (e) {
        body.hasTimeData = false;
    }

    // check if synonyms are present
    try {
        pstmt = conn.prepareStatement('select * from"T006"');
        rs = await pstmt.executeQuery();

        if (await rs.next()) {
            body.synonymsPresent = true;
        } else {
            body.synonymsPresent = false;
        }

        await rs.close();
        await pstmt.close();
    } catch (e) {
        body.synonymsPresent = false;
    }

    // check if INA - toolkit DU is imported
    try {
        pstmt = conn.prepareStatement('select GRANTEE from "SYS"."GRANTED_ROLES" where ROLE_NAME = \'sap.bc.ina.service.v2.userRole::INA_USER\'');
        rs = await pstmt.executeQuery();
        var row = await rs.next();
        var found, role;
        found = false;
        while (row) {

            role = rs.getNString(1);
            if (role === '_SYS_REPO') {
                found = true;
            }
            row = await rs.next();
        }
        if (found) {
            body.inaToolitpresent = true;
        } else {

            body.inaToolitpresent = false;
        }

        await rs.close();
        await pstmt.close();
    } catch (e) {
        body.inaToolitpresent = false;
    }



    $.response.contentType = 'application/json';
    await $.response.setBody(JSON.stringify(body));
    $.response.status = $.net.http.OK;

    await conn.close();

} catch (e) {
    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    await $.response.setBody(e.message);
}
export default {};
