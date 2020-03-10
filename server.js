const express = require("express");
const app = express();
const secrets = require('./secrets');

app.get ('/products',(req, res)=>{
    pool.query('SELECT * FROM products', (error, result) => {
        res.json(result.rows);
    })    
});

app.get('/customers', (req, res)=> {
    pool.query('SELECT * FROM customers', (error, result) => {
        res.json(result.rows);
    })    
});



const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cyf_ecommerce',
    password: secrets.dbPassword,
    port: 5432
});



app.listen(3000, function() {
    console.log("Server is listening on port 3000. Ready to accept requests!");
});
