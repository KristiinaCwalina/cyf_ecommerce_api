const express = require("express");
const app = express();
const secrets = require('./secrets');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cyf_ecommerce',
    password: secrets.dbPassword,
    port: 5432
});

app.use(bodyParser.json());

app.get('/customers', (req, res)=> {
    pool.query('SELECT * FROM customers', (error, result) => {
        res.json(result.rows);
    })    
});
app.get("/customers/:id", function(req, res) {
    const id = req.params.id;
    pool.query("SELECT * FROM customers WHERE id=$1", [id])
        .then(result => res.json(result.rows))
        .catch(e => console.error(e));
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

app.get("/products/:productName", function(req, res) {
    const productName = req.params.product_name;

    pool.query("SELECT * FROM products WHERE id=$1", [productName])
        .then(result => res.json(result.rows))
        .catch(e => console.error(e));
});

app.post("/products", function(req, res) {
    const ProductName = req.body.product_name;
    const ProductPrice = req.body.unit_price;
    const SupplierId = req.body.supplier_id;

    if(!Number.isInteger(ProductPrice) || ProductPrice <= 0) {
        return res.status(400).send("The price should be a positive integer.");
    }

    pool.query("SELECT * FROM products WHERE supplier_id=$1", [SupplierId])
        .then(result => {
            if(!SupplierId) {
                return res.status(400).send('There is no supplier with that id!');
            } else {
                const query = "INSERT INTO products (product_name, unit_price,supplier_id) VALUES ($1, $2, $3)";
                pool.query(query, [ProductName, ProductPrice, SupplierId])
                    .then(() => res.send("Product added!"))
                    .catch(e => console.error(e));
            }
        });
});

app.listen(3000, function() {
    console.log("Server is listening on port 3000. Ready to accept requests!");
});
