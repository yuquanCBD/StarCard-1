var mysql = require('./mysql');

function Service(service){
    this.serivce = serivce;
}

//获取客服列表
Service.getlist = function(callback){
    mysql.getConnection(function(err, conn){
        if(err)
            return callback(err);
        var sql = 'select * from service order by create_time DESC';
        //var sql = 'select * from service';
        conn.query(sql, function(err, results){
            if(err)
                return callback(err);
            conn.release();
            return callback(err,results);
        });

    });
};
//得到未回复的客服信息
Service.getlistUnDeal = function(callback){
    mysql.getConnection(function(err, conn){
        if(err)
            return callback(err);
        var sql = 'select * from service where deal = 0 order by create_time DESC';
        //var sql = 'select * from service where deal = 0';
        conn.query(sql, function(err, results){
            if(err)
                return callback(err);
            conn.release();
            return callback(err, results);
        })
    })
};
//插入客服信息
Service.insert = function(obj, callback){
    var title = obj.title;
    var content = obj.content;
    var userid = obj.userid;
    var username = obj.username;
    var telephone = obj.telephone;
    var email = obj.email;
    mysql.getConnection(function(err, conn){
        if(err)
            return callback(err);
        var sql = "insert into service (title,content,userid,username,telephone,email) values (?, ?, ?, ?, ?, ?)";
        console.log(sql);
        conn.query(sql, [title, content, userid, username, telephone, email], function(err, results){
            if(err)
                return callback(err);
            conn.release();
            return callback(err, results);
        });
    });
};
//根据id查找客服信息
Service.queryById = function(id, callback){
    mysql.getConnection(function(err, conn){
        if(err)
            return callback(err);
        var sql = 'select * from service where id = ?';
        //var sql = 'select * from service where deal = 0';
        conn.query(sql, [id], function(err, results){
            if(err)
                return callback(err);
            conn.release();
            return callback(err, results);
        })
    })
};
//设置deal状态为1，并插入管理员信息
Service.update = function(obj, callback){
    var manager_id = obj.userid;
    var manager_name = obj.username;
    var id = obj.id;
    var deal = 1;
    mysql.getConnection(function(err, conn){
        if(err)
            return callback(err);
        //var sql = 'select * from service where id = ?';
        var sql = 'update service set deal = ?, manager_id = ?, manager_name= ? where id = ?';
        conn.query(sql, [deal, manager_id, manager_name, id], function(err, results){
            if(err)
                return callback(err);
            conn.release();
            return callback(err, results);
        })
    });
};

Service.delete = function(id, callback){
    mysql.getConnection(function(err, conn){
        if(err)
            return callback(err);
        var sql = 'delete from service where id = ? ';
        conn.query(sql, [id],function(err, results){
            if(err)
                return callback(err);
            conn.release();
            return callback(err,results);
        });

    });
}

module.exports = Service;





