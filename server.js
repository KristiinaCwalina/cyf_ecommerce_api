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

/*Add a new GET endpoint /customers/:customerId to load a single customer 
by ID. */
app.get("/customers/:customerId", function(req, res) {
    const customerId = req.params.customerId;
    pool.query("SELECT * FROM customers WHERE id=$1", [customerId])
        .then(result => res.json(result.rows))
        .catch(e => console.error(e));
});

/*Add a new GET endpoint /customers/:customerId/orders to load all the 
orders along the items in the orders of a specific customer. 
Especially, the following information should be returned: 
order references, order dates, product names, unit prices, suppliers and 
quantities.*/
app.get('/customers/:customerId/orders',(req,res)=>{
    const customerId=req.params.customerId
    const query='select c.name ,o.order_reference, o.order_date, p.product_name, p.unit_price,s.supplier_name,oi.quantity from customers c join orders o on o.customer_id = c.id join order_items oi on oi.order_id =o.id join products p on p.id =oi.product_id join suppliers s on s.id=p.supplier_id where c.id =$1';
    pool.query(query, [customerId])
    .then(result => res.json(result.rows))
    .catch(e => console.error(e));
})

/*Add a new POST endpoint /customers to create a new customer.*/
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

/*Add a new POST endpoint /customers/:customerId/orders to create a new 
order (including an order date, and an order reference) for a customer. 
Check that the customerId corresponds to an existing customer or return an 
error.*/
app.post("/customers/:customerId/orders", function(req, res) {
    const customerId=req.params.customerId;
    const orderDate = req.body.order_date;
    const orderReference = req.body.order_reference;
    pool.query("SELECT * FROM customers WHERE id=$1", [customerId])
        .then(result => {
            if(result.rows.length <= 0) {
                return res.status(400).send('There is no customer with that ID!');
            } else {
                const query = "INSERT INTO orders (order_date, order_reference,customer_id) VALUES ($1, $2,$3)";
                pool.query(query, [orderDate, orderReference, customerId])
                    .then(() => res.send("Order created!"))
                    .catch(e => console.error(e));
            }
        });
});

/*Add a new PUT endpoint /customers/:customerId to update an existing 
customer (name, address, city and country).*/
app.put('/customers/:customerId',(req,res)=>{
    const customerId = req.params.customerId;
    const newName=req.body.name;
    const newAddress=req.body.address;
    const newCity=req.body.city;
    const newCountry=req.body.country;
    pool.query("UPDATE customers SET name=$1,address=$2,city=$3,country=$4 WHERE id=$5", [newName,newAddress,newCity,newCountry,customerId])
        .then(() => res.send(`Customer ${customerId} updated!`))
        .catch(e => console.error(e));
})

/*Add a new DELETE endpoint /customers/:customerId to delete an existing 
customer only if this customer doesn't have orders. */
app.delete("/customers/:customerId", function(req, res) {
    const customerId = req.params.customerId;
    pool.query("DELETE FROM orders WHERE customer_id=$1", [customerId])
        .then(() => {
            pool.query("DELETE FROM customers WHERE id=$1", [customerId])
                .then(() => res.send(`Customer ${customerId} deleted!`))
                .catch(e => console.error(e));;
        })
        .catch(e => console.error(e));
});

app.get ('/suppliers',(req, res)=>{
    pool.query('SELECT * FROM suppliers', (error, result) => {
        res.json(result.rows);
    })    
});

/*add a new GET endpoint /products to load all the product names along with 
their supplier names. */
app.get ('/products',(req, res)=>{
    pool.query('select suppliers.supplier_name, products.* from products join suppliers on suppliers.id=products.supplier_id' , (error, result) => {
        res.json(result.rows);
    })    
});

/*Update the previous GET endpoint /products to filter the list of products 
by name using a query parameter, for example /products?name=Cup. 
This endpoint should still work even if you don't use the name query parameter! */
app.get("/products", function(req, res) {
    const productName = req.query.name;
    let query = 'select suppliers.supplier_name, products.* from products join suppliers on suppliers.id=products.supplier_id';
    if(productName){
query= query + `where products.product_name ilike '%${ProductName}%'`
    }
    pool.query(query)
        .then(result => res.json(result.rows))
        .catch(e => console.error(e));
});

/*Add a new POST endpoint /products to create a new product (with a product 
name, a price and a supplier id). Check that the price is a positive integer
and that the supplier ID exists in the database, otherwise return an error.*/
app.post("/products", function(req, res) {
    const ProductName = req.body.product_name;
    const ProductPrice = req.body.unit_price;
    const SupplierId = req.body.supplier_id;
    if(!Number.isInteger(ProductPrice) || ProductPrice <= 0) {
        return res.status(400).send("The price should be a positive integer.");
    }
    pool.query("SELECT * FROM suppliers WHERE supplier_id=$1", [SupplierId])
        .then(result => {
            if(result.rows.length<0) {
                return res.status(400).send('There is no supplier with that id!');
            } else {
                const query = "INSERT INTO products (product_name, unit_price,supplier_id) VALUES ($1, $2, $3)";
                pool.query(query, [ProductName, ProductPrice, SupplierId])
                    .then(() => res.send("Product added!"))
                    .catch(e => console.error(e));
            }
        });
});

app.get ('/orders',(req, res)=>{
    pool.query('SELECT * FROM orders', (error, result) => {
        res.json(result.rows);
    })    
});

/*Add a new DELETE endpoint /orders/:orderId to delete an existing order 
along with all the associated order items.*/
app.delete("/orders/:orderId", function(req, res) {
    const orderId = req.params.orderId;
    pool.query("DELETE FROM order_items WHERE order_id=$1", [orderId])
    .then(() => {
        pool.query("DELETE FROM orders WHERE id=$1", [orderId])
            .then(() => res.send(`Order ${orderId} deleted!`))
            .catch(e => console.error(e));;
    })
    .catch(e => console.error(e));
});

app.listen(3000, function() {
    console.log("Server is listening on port 3000. Ready to accept requests!");
});
