var shine = {};
shine.usercrud = {};
shine.usercrud.User = function(){
    this.id = "";
    this.firstName = "";
    this.lastName = "";
    this.email = "";
};
shine.usercrud.User.prototype.getId = function(){
    return this.id;
};
shine.usercrud.User.prototype.getFirstName = function(){
    return this.firstName;
};
shine.usercrud.User.prototype.getLastName = function(){
    return this.LastName;
};
shine.usercrud.User.prototype.getEmail = function(){
    return this.email;
};
shine.usercrud.User.prototype.setId = function(id){
    this.id = id;
};
shine.usercrud.User.prototype.setFirstName = function(firstName){
    this.firstName = firstName;
};
shine.usercrud.User.prototype.setLastName = function(lastName){
    this.lastName = lastName;
};
shine.usercrud.User.prototype.setEmail = function(email){
    this.email = email;
};
shine.usercrud.User.prototype.persistIntoTable = async function() {
    try{
        var connection = await $.hdb.getConnection();
        var query = 'select"sap.hana.democontent.epm.data::userSeqId".NEXTVAL as "PERSNO" from dummy';
        var rs = await connection.executeQuery(query);
        var persNo = '';
        if(rs.length > 0) {
            persNo = rs[0].PERSNO;
        }
        query = 'insert into"sap.hana.democontent.epm.data::User.Details" values(?,?,?,?)';
        await connection.executeUpdate(query,persNo,this.firstName,this.lastName,this.email);
        await connection.commit();
        await connection.close();
        return true;
    }catch(e){
        return false;
    }
};
export default {shine};
