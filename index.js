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

//--------------------------------------------------------- MIDDLEWARES

//Para autenticar roles de usuario administrador
function adminAuth(req, res, next) {
    var token = req.headers.authorization
    if (!token) {
        res.send("No se detectó token de autorizacion!")
    } else {
        var verificar = jwt.verify(token, key)
        var rol = verificar.admin
        if (rol === "false") {
            res.send("No tiene privilegios de administrador!")
        } else {
            return next()
        }
    }
};

//--------------------------------------------------------- ENDPOINTS
//----------------------- PRODUCTOS

//Obtener lista de productos
server.get("/productos", async function(req, res) {
    try {
        var token = req.headers.authorization
        jwt.verify(token, key)
        var [lista] = await sql.query("SELECT * FROM productos")
        res.json(lista)
    } catch (error) {
        res.send("Token no encontrado o expirado. Inicie sesion antes de continuar!")
    }
});

//Obtener producto por ID
server.get("/productos/:id", async function(req, res) {
    try {
        var token = req.headers.authorization
        jwt.verify(token, key)
        var [lista] = await sql.query(`SELECT * FROM productos WHERE product_id = "${req.params.id}"`)
        res.json(lista)
    } catch (error) {
        res.send("Token no encontrado o expirado. Inicie sesion antes de continuar!")
    }
});

//Crear items
server.post("/productos", adminAuth, async function(req, res) {
    var {nombre, precio, link_foto} = req.body
    await sql.query(`
        INSERT INTO productos (nombre, precio, link_foto) 
        VALUES ("${nombre}", "${precio}", "${link_foto}")`)
    var [id] = await sql.query("SELECT * FROM productos ORDER BY product_id DESC LIMIT 1")
    res.json(id)
});

//Editar item por ID
server.put("/productos/:id", adminAuth, async function(req, res) {
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
server.delete("/productos/:id", adminAuth, async function(req, res) {
    await sql.query(`DELETE FROM productos WHERE product_id = "${req.params.id}"`)
    res.send("Producto eliminado!")
});

//----------------------- USUARIOS

//Ver lista de usuarios
server.get("/usuarios", adminAuth, async function(req, res) {
    var [lista] = await sql.query("SELECT * FROM usuarios")
    res.json(lista)
});

//Crear un nuevo usuario
server.post("/registro", async function(req, res) {
    var {nombreUser, nombreCompleto, email, telefono, direccion, password} = req.body
    await sql.query(`
        INSERT INTO usuarios (nombreUser, nombreCompleto, email, telefono, direccion, password) 
        VALUES ("${nombreUser}", "${nombreCompleto}", "${email}", "${telefono}", "${direccion}", "${password}")`)
    var [id] = await sql.query("SELECT user_id FROM usuarios ORDER BY user_id DESC LIMIT 1")
    res.json(id)
});

//Iniciar sesion
server.post("/login", async function(req, res) {
    var {nombreUser, password} = req.body
    var [comparacion] = await sql.query(`SELECT * FROM usuarios WHERE nombreUser = "${nombreUser}" AND password = "${password}"`)
    var isAdmin = comparacion[0].Admin
    if (comparacion.length == 0) {
        res.send("Credenciales incorrectas!")
    } else {
        var token = jwt.sign({usuario: nombreUser, admin: isAdmin}, key, {expiresIn: "60m"})
        res.send("Usuario autenticado! Token: " + token)
    }
});

//----------------------- PEDIDOS

//Ver lista de ordenes
server.get("/pedidos", adminAuth, async function(req, res) {
    try {
        var token = req.headers.authorization
        jwt.verify(token, key)
        var [lista] = await sql.query(`SELECT * FROM ordenes`)
        res.json(lista)
    } catch (error) {
        res.send("Token no encontrado o expirado. Inicie sesion antes de continuar!")
    }
});

//Crear una nueva orden
server.post("/pedidos", async function(req, res) {
    try {
        var token = req.headers.authorization
        var verificar = jwt.verify(token, key)
        var user = verificar.usuario
        var {productos, precio, metodoPago} = req.body
        var [userData] = await sql.query(`SELECT * FROM usuarios WHERE nombreUser = "${user}"`)
        if (userData.length == 0) {
            res.send("Error al autenticar usuario!")
        } else {
            var [ordenID] = await sql.query(`
                INSERT INTO ordenes(user_id, hora, descripcion, precio, metodoPago)
                VALUES ("${userData[0].user_id}", "${new Date().toLocaleTimeString()}", "------ARREGLAR DESCRIPCIONES------", "${precio}", "${metodoPago}")`)
            productos.forEach(async function(item) {
                var {product_id, cantidad} = item
                var [insertID] = await sql.query(`
                    INSERT INTO productosPorOrden(order_id, product_id, cantidadProducto, metodoPago)
                    VALUES ("${ordenID}", "${product_id}", "${cantidad}", "${metodoPago}")`)
            })
        }
        var [response] = await sql.query(`
            SELECT ordenes.order_id, ordenes.descripcion, ordenes.precio, ordenes.metodoPago, usuarios.nombreUser, usuarios.direccion
            FROM ordenes
            JOIN usuarios
            ON ordenes.user_id = usuarios.user_id
            WHERE ordenes.order_id = "${ordenID}"`)
        var [products] = await sql.query(`
            SELECT productosPorOrden.product_id, productosPorOrden.cantidadProducto, productos.nombre, productos.precio
            FROM productosPorOrden
            JOIN productos
            ON productosPorOrden.product_id = productos.product_id
            WHERE productosPorOrden.order_id = "${ordenID}"`)
        response[0].productos = products
        res.send(response[0])
    } catch (error) {
        res.send("Token no encontrado o expirado. Inicie sesion antes de continuar!")
    }
});