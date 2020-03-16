const express = require("express");
const app = express();
const secrets = require('./secrets');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/customers', (req, res)=> {
    pool.query('SELECT * FROM customers', (error, result) => {
        res.json(result.rows);
    })    
});

app.get ('/suppliers',(req, res)=>{
    pool.query('SELECT * FROM suppliers', (error, result) => {
        res.json(result.rows);
    })    
});

app.get ('/products',(req, res)=>{
    pool.query('select suppliers.supplier_name, products.* from products join suppliers on suppliers.id=products.supplier_id' , (error, result) => {
        res.json(result.rows);
    })    
});

app.get ('/products',(req, res)=>{
    pool.query('select suppliers.supplier_name, products.* from products join suppliers on suppliers.id=products.supplier_id' , (error, result) => {
        res.json(result.rows);
    })    
});

app.post('/customers',(req,res)=>{
    const newCustomerName = req.body.name;
    const newCustomerAddress = req.body.address;
    const newCustomerCity=req.body.city;
    const newCustomerCountry=req.body.country;

    const query='INSERT INTO customers (name,address,city,country) VALUES ($1,$2,$3,$4)'
    
    const params=[newCustomerName,newCustomerAddress,newCustomerCity,newCustomerCountry];

    pool.query(query,params)
    .then(() => res.send('Customer Created!'))
    .catch(e=>res.status(500).send(e))
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
