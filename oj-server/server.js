var express = require("express");
var app = express();
var restRouter = require("./routes/rest");
var mongoose = require("mongoose");

mongoose.connect("mongodb://dbx:dbx123@ds053184.mlab.com:53184/mycoj")

app.use("/api/v1", restRouter);

app.get('/', function (req, res){
    res.send('Hello Express World Again');
})

app.listen(3000, function () {
    console.log('App listening on port 3000');
})
