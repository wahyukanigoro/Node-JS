var http    = require("http");
var port    = 2424;
var routes  = require("routes")();
var url     = require("url");
var qString = require("querystring");
var view    = require("swig");
var mysql   = require("mysql");
var con = mysql.createConnection({
    host : "localhost",
    port : 3306,
    database : "nodejs",
    user : "root",
    password : ""
});

routes.addRoute("/", function(req, res) {
    
    con.query("SELECT * FROM mahasiswa ", function(err, rows, field){
        if(err) { throw err; }

        var html = view.compileFile('./template/index.html') ({
            title : "Data Mahasiswa",
            data_s : rows
        });

        res.writeHead(200, {"Content-Type" : "text/html"});
        res.end(html);
    });
});

routes.addRoute("/insert", function(req, res){    

    if(req.method.toUpperCase() == "POST") {
        var data_post = "";

        req.on('data', function(chunkcs){
            data_post += chunkcs;
        });

        req.on('end', function(){
            data_post = qString.parse(data_post);

            con.query("INSERT INTO mahasiswa SET ? ", data_post, 
                function(err, field) { if(err) throw err; 

                res.writeHead(302, {"Location" : "/"});
                res.end();
            });
        });
    } else {
        var html = view.compileFile('./template/form.html')();
        res.writeHead(200, {"Content-Type" : "text/html"});
        res.end(html);
    }
});

routes.addRoute("/update", function(req, res){
    con.query("UPDATE mahasiswa SET ? WHERE ? ", [ 
        { nama      : "Wahyu Kanigoro Aminudin" },
        { id_mhs    : 2014140212 }
    ], function(err, field) {
        if(err) { throw err; }
        res.writeHead(200, {"Content-Type" : "text/plain"});
        res.end(field.changedRows+ " Data Berhasil di ubah ..")
    });
});

routes.addRoute("/delete", function(req, res){
    con.query("DELETE FROM mahasiswa WHERE ? ", { 
        id_mhs  : 2014140211
    }, function(err, field) {
        if(err) { throw err; }
        res.writeHead(200, {"Content-Type" : "text/plain"});
        res.end(field.affectedRows+ " Data Berhasil di hapus ..")
    });
});

http.createServer(function(req, res) {
    var path = url.parse(req.url).pathname;
    var match = routes.match(path);

    if(match) {
        match.fn(req, res);
    } else {
        var html = view.compileFile("./template/404.html");
        res.writeHead(404, {"Content-Type" : "text/html"});
        res.end(html);
    }
}).listen(port);

console.log("Server is running with port " +port);