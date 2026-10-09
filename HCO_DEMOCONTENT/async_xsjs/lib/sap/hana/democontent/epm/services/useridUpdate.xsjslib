/**
@param {connection} Connection - The SQL connection used in the OData request
@param {beforeTableName} String - The name of a temporary table with the single entry before the operation (UPDATE and DELETE events only)
@param {afterTableName} String -The name of a temporary table with the single entry after the operation (CREATE and UPDATE events only)
 */

async function my_create_after_exit(param) {
    var after = param.afterTableName;
    //Get Input New Record Values
    var pStmt, persNo, perFName, perLName, perEmail;
    pStmt = persNo = perFName = perLName = perEmail = null;
    try {

        pStmt = param.connection
            .prepareStatement('select"sap.hana.democontent.epm.data::userSeqId".NEXTVAL from dummy');
        var rs = await pStmt.executeQuery();
        var PersNo = '';
        while (await rs.next()) {
            PersNo = rs.getString(1);
        }
        await pStmt.close();
        pStmt = param.connection.prepareStatement("update\"" + after + "\"set PERS_NO = ?");
        pStmt.setString(1, PersNo);
        await pStmt.execute();
        await pStmt.close();

        pStmt = param.connection.prepareStatement('select * from "' + after + '"');
        rs = await pStmt.executeQuery();
        while (await rs.next()) {
            persNo = rs.getString(1);
            perFName = rs.getString(2);
            perLName = rs.getString(3);
            perEmail = rs.getString(4);
        }

        pStmt = param.connection
            .prepareStatement('insert into"sap.hana.democontent.epm.data::User.Details" values(?,?,?,?)');
        pStmt.setString(1, persNo);
        pStmt.setString(2, perFName);
        pStmt.setString(3, perLName);
        pStmt.setString(4, perEmail);
        await pStmt.executeUpdate();
        await pStmt.close();

    } catch (e) {
        await pStmt.close();
    }

}
export default {my_create_after_exit};
