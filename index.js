//--------------------------------------------------------- DEPENDENCIAS 'N STUFF

const express = require("express");
const parser = require("body-parser");
const cors = require("cors");
const sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const key = require("./shh");

const sql = new sequelize("mysql://lJREna0GOO:Vf5yMxDH7x@remotemysql.com:3306/lJREna0GOO");
sql.authenticate().then(() => console.log("DB conectada!"));
const server = express();
server.use(cors());
server.use(parser.json());
server.listen(3000, () => console.log("Servidor iniciado!"));

//--------------------------------------------------------- SOME OTHER SHIT

