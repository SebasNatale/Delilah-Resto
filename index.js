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

//Obtener lista de productos
server.get("/productos", async function(req, res) {
    var [lista] = await sql.query("SELECT * FROM productos")
    res.json(lista)
});

//Obtener producto por ID
server.get("/productos/:id", async function(req, res) {
    var [lista] = await sql.query(`SELECT * FROM productos WHERE product_id = "${req.params.id}"`)
    res.json(lista)
});

//Crear items
server.post("/productos", async function(req, res) {
    var {nombre, precio, link_foto} = req.body
    var entrada = await sql.query(`
        INSERT INTO productos (nombre, precio, link_foto) 
        VALUES ("${nombre}", "${precio}", "${link_foto}")`)
    var [id] = await sql.query("SELECT * FROM productos ORDER BY product_id DESC LIMIT 1")
    res.json(id)
});

//Editar item por ID
server.put("/productos/:id", async function(req, res) {
    var {nombre, precio, link_foto} = req.body
    async function edicion(llave, valor) {
        await sql.query(`UPDATE productos SET ${llave} = "${valor}" WHERE product_id = ${req.params.id}`)
    }
    try {
        if (nombre) {
            edicion(Object.getOwnPropertyNames(req.body), nombre)
            var [actualizado] = await sql.query(`SELECT * FROM productos WHERE product_id = ${req.params.id}`)
            res.json(actualizado)
        } else if (precio) {
            edicion(Object.getOwnPropertyNames(req.body), precio)
            var [actualizado] = await sql.query(`SELECT * FROM productos WHERE product_id = ${req.params.id}`)
            res.json(actualizado)
        } else if (link_foto) {
            edicion(Object.getOwnPropertyNames(req.body), link_foto)
            var [actualizado] = await sql.query(`SELECT * FROM productos WHERE product_id = ${req.params.id}`)
            res.json(actualizado)
        } else {
            res.send("No se encontraron datos para actualizar!")
        }
    } catch (error) {
        res.send("Solo se puede actualizar un dato a la vez!")
    }
});

//Borrar item por ID
server.delete("/productos/:id", async function(req, res) {
    await sql.query(`DELETE FROM productos WHERE product_id = "${req.params.id}"`)
    res.send("Producto eliminado!")
});