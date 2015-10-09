var mysql = require('./mysql');

function Wiki(wiki){
    this.wikiid = wiki.wikiid;
    this.wikiname = wiki.wikiname;
    this.english_name = wiki.english_name;
    this.category = wiki.category;
    this.manufacturer = wiki.manufacturer;
    this.series = wiki.series;
    this.serial_number = wiki.serial_number;
    this.rarity = wiki.rarity;
    this.describes = wiki.describes;
    this.price = wiki.price;
    this.contributor = wiki.contributor;
    this.picture = wiki.picture;
    this.brand = wiki.brand;
}

Wiki.queryByCond = function(userid, cond, brand, category, offset, capacity,callback){
    mysql.getConnection(function(err, conn){
        if (err)  
            callback(err);
        var flag1 = false;
        var flag2 = false;
        var sql = 'SELECT wikiid, wikiname, english_name, category, manufacturer, series, serial_number, rarity, describes, price, contributor, picture, brand, islock, team FROM wiki ';
        if (cond) {
            sql += ' WHERE (wikiname like "%'+ cond +'%" OR serial_number like "%' +cond+ '%" OR brand like "%'+cond
                    +'%" OR english_name like "%'+ cond +'%" OR series like "%'+ cond+ '%" OR rarity like "%'+ cond
                    +'%" OR team like "%'+ cond+'%") ';
            flag1 = true;
        }
        if (brand) {
            if (flag1)
                sql += 'AND brand like "%' + brand + '%" ';
            else
                sql += 'WHERE brand like "%' + brand + '%" ';
            flag2 = true;
        }
        if (category) {
            if (flag1 && !flag2) 
                sql += 'AND category like "%' + category + '%" ';
            else if (flag1 && flag2)
                sql += 'AND category like "%' + category + '%" ';
            else if (!flag1 && flag2)
                sql += 'AND category like "%' + category + '%" ';
            else 
                sql += 'WHERE category like "%' + category + '%" ';
        }
        offset = parseInt(offset) * parseInt(capacity);
        sql += 'LIMIT ' + offset + ', ' + capacity;  //分页查询

        console.log('queryByCond_SQL: '+ sql);
        conn.query(sql, function(err, rows){
            if(err){
                conn.release();
                return callback(err);
            }

            //查询百科收藏表
            var sql = 'SELECT wikiid FROM wiki_collect WHERE userid = ?';
            conn.query(sql, [userid], function(err, wikis){
                if(err){
                    conn.release();
                    return callback(err);
                }
                for(var x in rows){
                    rows[x].is_collect = 0;
                    for(var y in wikis){
                        if(rows[x].wikiid == wikis[y].wikiid){
                            rows[x].is_collect = 1;
                            break;
                        }
                    }
                }
                conn.release();
                callback(err, rows);

            })

        })
    });
};


Wiki.queryDetail = function(wikiid, callback){
    mysql.getConnection(function(err, conn){
        if (err) 
            callback(err);

        var sql = 'SELECT wikiid, wikiname, english_name, category, manufacturer, series, serial_number, rarity, describes, price, contributor, picture, brand FROM wiki ';
        sql += 'WHERE wikiid = "' + wikiid + '"';

        console.log('queryDetail_SQL: '+ sql);
        conn.query(sql, function(err, rows){
            callback(err, rows[0]);
            conn.release();
        });
    });
};

Wiki.modify = function(wikiid, describes, callback){
    mysql.getConnection(function(err, conn){
        if (err) 
            callback(err);

        var sql = 'INSERT INTO wiki_pre (wikiid, describes) VALUES (?,?)'
        /*
        var sql = 'UPDATE wiki set ';
        if (wiki.wikiname)
            sql += 'wikiname = "'+ wiki.wikiname +'", ';
        if (wiki.english_name)
            sql += 'english_name = "'+ wiki.english_name +'", ';
        if (wiki.category)
            sql += 'category = "'+ wiki.category +'", '; 
        if (wiki.manufacturer)
            sql += 'manufacturer = "'+wiki.manufacturer+'", ';
        if (wiki.series)
            sql += 'series = "'+wiki.series+'", ';
        if (wiki.serial_number)
            sql += 'serial_number = '+ wiki.serial_number +', ';
        if (wiki.rarity)
            sql += 'rarity = "'+wiki.rarity +'", ';
        if (wiki.describes)
            sql += 'describes = "'+wiki.describes+'", ';
        if (wiki.price)
            sql += 'price = '+wiki.price+', ';
        if (wiki.brand)
            sql += 'brand = "'+wiki.brand+'", ';
        if (wiki.contributor)
            sql += 'contributor = "'+wiki.contributor+'", ';

        sql = sql.slice(0, sql.length - 2);       //去掉最后的逗号

        sql += ' WHERE wikiid = "'+ wiki.wikiid +'"';
        */
        console.log(sql);
        conn.query(sql, [wikiid, describes],function(err, results){
            callback(err, results);
            conn.release();
        });
    });
};

module.exports = Wiki