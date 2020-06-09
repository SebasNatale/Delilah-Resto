//--------------------------------------------------------- DEPENDENCIAS 'N STUFF

const express = require("express");
const parser = require("body-parser");
const cors = require("cors");
const sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const key = require("./shh");

const server = express();
server.use(cors());
server.use(parser.json());
server.listen(3000, () => console.log("Servidor iniciado!"));
const sql = new sequelize("mysql://lJREna0GOO:Vf5yMxDH7x@remotemysql.com:3306/lJREna0GOO");
sql.authenticate().then(() => console.log("DB conectada!"));

//--------------------------------------------------------- ENDPOINTS
//----------------------- PRODUCTOS

//Obtener lista
server.get("/productos", async function(req, res) {
    var [list] = await sql.query("SELECT * FROM productos", {raw: true})
    res.json(list)
})

//Crear items
server.post("/products", async function(req, res) {
    
});