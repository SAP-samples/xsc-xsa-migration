async function createConnection() {
    return await $.db.getConnection();
}
async function setResponse(status, msg) {
    $.response.status = status;
    await $.response.setBody(msg);
}
 async function checkDUImported(oConnection) {
    var rs = await oConnection.prepareStatement('select * from "_SYS_REPO"."DELIVERY_UNITS" WHERE DELIVERY_UNIT =\'HANA_TEST_TOOLS\'').executeQuery();
    if (await rs.next()) {
        await setResponse($.net.http.OK,"Hana Test Tools imported");
    }else{
         await setResponse($.net.http.OK,"Hana Test Tools not imported");
    }
    await rs.close();
}
async function checkRoleExists(oConnection) {
    var ps = oConnection.prepareStatement('SELECT COUNT(*) FROM "PUBLIC"."GRANTED_ROLES" where GRANTEE = ? AND ROLE_NAME in (\'sap.hana.testtools.common::TestExecute\',\'sap.hana.democontent.epm.roles::Admin\')');
    ps.setString(1, $.session.getUsername());
    var rs = await ps.executeQuery();
    if (await rs.next()) {
        if(rs.getInteger(1) === 2){
            await setResponse($.net.http.OK,"Test Execute Role available");
        }else{
            await setResponse($.net.http.OK,"Test Execute Role not available");
        }
    }else{
         await setResponse($.net.http.OK,"Test Execute Role not available");
    }
    await rs.close();
    await ps.close();
} 
try {
    var connection = await createConnection();
    var cmd = $.request.parameters.get('cmd');
    switch (cmd) {
        case "DU":
            await checkDUImported(connection);
            break;
        case "Role":
            await checkRoleExists(connection);
            break;
        default:
            await setResponse($.net.http.OK,"Invalid Command");
    await connection.close();
    }
} catch (e) {
    await setResponse($.net.http.INTERNAL_SERVER_ERROR,e);
}
export default {createConnection,setResponse,checkDUImported,checkRoleExists};
