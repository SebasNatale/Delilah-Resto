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
    var [lista] = await sql.query("SELECT * FROM productos")
    res.json(lista)
})

//Crear items
server.post("/productos", async function(req, res) {
    var {nombre, precio, link_foto} = req.body
    var entrada = await sql.query(`
        INSERT INTO productos (nombre, precio, link_foto) 
        VALUES ("${nombre}", "${precio}", "${link_foto}")`)
    var [id] = await sql.query("SELECT * FROM productos ORDER BY product_id DESC LIMIT 1")
    res.json(id)
});