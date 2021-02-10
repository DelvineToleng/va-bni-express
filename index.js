const express = require("express")
const app = express();
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const {
    response
} = require("express");
const { head } = require("request");
dotenv.config();

// BNI FUNCTION ENCRYPT AND DECRYPT
const BniEnc = require('./BniEncryption');

app.use(express.json());
app.use(
   bodyParser.urlencoded({
      extended: true
   })
);
app.use(bodyParser.json());

app.get('/va-bni', function (req, res) {
    // INPUT PARAMS
    let amount          = req.body.amount;
    let customer_name   = req.body.customer_name;
    let customer_email  = req.body.customer_email;
    let customer_phone  = req.body.customer_phone;
    let description     = req.body.description;
    let transaction_id  = req.body.transaction_id; // this should be unique
    let billing_type    = req.body.billing_type;
    let va_number       = req.body.va_number; // this should be unique

    let expired = new Date();
    expired.setDate(expired.getDate() + 1);
    let data = {
        "client_id" : process.env.APP_CLIENT_ID,
        "trx_amount" : amount,
        "customer_name" : customer_name,
        "customer_email" : customer_email,
        "customer_phone" : customer_phone,
        "virtual_account" : process.env.APP_PREFIX + process.env.APP_CLIENT_ID + va_number,
        "trx_id" : transaction_id,
        "datetime_expired" : expired.toISOString(),
        "description" : description,
        "type" : "createbilling"
    };

    let encrypted_string = BniEnc.encrypt(data, process.env.APP_CLIENT_ID, process.env.APP_SECRET_KEY);

    var promise = new Promise(function(resolve, reject){
        // BODY FOR FETCH
        let body = {
            "client_id" : process.env.APP_CLIENT_ID,
            "prefix" : process.env.APP_PREFIX,
            "data" : encrypted_string
        };
        
        body = JSON.stringify(body);

        // CALL API INVOICE
        fetch(process.env.APP_URL_DEV, {
            "headers": {
                "Content-Type": "application/json",
            },
            "body": body,
            "method": "POST",
        }).then(response => response.json()
        ).then(data => {
            resolve(data);
        }).catch(error => {
            res.send({
                status  : "error",
                data : error
            });
            return
        });
    });

    promise.then(function(value){
        if(value.status == "000"){
            let result = BniEnc.decrypt(value.data, process.env.APP_CLIENT_ID, process.env.APP_SECRET_KEY);

            res.send({
                status  : "success",
                data    : result
            });
            return
        }else{
            res.send({
                status  : "error",
                data : value
            });
            return
        }
    })
});

app.get('/inquiry-bni/:transaction_id', function (req, res) {
    console.log("GET BILLING " + req.params.transaction_id)

    // static
    let type        = 'inquirybilling';

    // input params
    let trx_id      = req.params.transaction_id;

    let data = {
        "type" : type,
        "client_id" : process.env.APP_CLIENT_ID,
        "trx_id" : trx_id
    };

    let data_encrypt = BniEnc.encrypt(data, process.env.APP_CLIENT_ID, process.env.APP_SECRET_KEY);

    var promise = new Promise(function(resolve, reject){
        // BODY FOR FETCH
        let body = {
            "client_id" : process.env.APP_CLIENT_ID,
            "prefix" : process.env.APP_PREFIX,
            "data" : data_encrypt
        };
        
        body = JSON.stringify(body);

        // console.log("=======BODY========")
        // console.log(body)

        // CALL API INVOICE
        fetch(process.env.APP_URL_DEV, {
            "headers": {
                "Content-Type": "application/json",
            },
            "body": body,
            "method": "POST",
        }).then(response => response.json()
        ).then(data => {
            // console.log("=====RESPONSE======")
            // console.log(data)
            resolve(data);
        }).catch(error => {
            res.send({
                status  : "error",
                data : error
            });
            return
        });
    });

    promise.then(function(value){
        if(value.status == "000"){
            let result = BniEnc.decrypt(value.data, process.env.APP_CLIENT_ID, process.env.APP_SECRET_KEY);

            res.send({
                status  : "success",
                data    : result
            });
            return
        }else{
            res.send({
                status  : "error",
                data : value
            });
            return
        }
    })
});

app.put('/update-bni', function (req, res) {
    console.log("UPDATE BILLING " + req.body.transaction_id)
    // static
    let type        = 'updatebilling';

    // input body
    let trx_id          = req.body.transaction_id;
    let trx_amount      = req.body.amount;
    let customer_name   = req.body.customer_name;
    let customer_email  = req.body.customer_email;
    let customer_phone  = req.body.customer_phone;
    let description     = req.body.description;

    let data = {
        "type" : type,
        "client_id" : process.env.APP_CLIENT_ID,
        "trx_id" : trx_id,
        "trx_amount" : trx_amount,
        "customer_name" : customer_name,
        "customer_email" : customer_email,
        "customer_phone" : customer_phone,
        "description" : description
    };

    let data_encrypt = BniEnc.encrypt(data, process.env.APP_CLIENT_ID, process.env.APP_SECRET_KEY);

    var promise = new Promise(function(resolve, reject){
        // BODY FOR FETCH
        let body = {
            "client_id" : process.env.APP_CLIENT_ID,
            "prefix" : process.env.APP_PREFIX,
            "data" : data_encrypt
        };
        
        body = JSON.stringify(body);

        // console.log("=======BODY========")
        // console.log(body)

        // CALL API INVOICE
        fetch(process.env.APP_URL_DEV, {
            "headers": {
                "Content-Type": "application/json",
            },
            "body": body,
            "method": "POST",
        }).then(response => response.json()
        ).then(data => {
            // console.log("=====RESPONSE======")
            // console.log(data)
            resolve(data);
        }).catch(error => {
            res.send({
                status  : "error",
                data : error
            });
            return
        });
    });

    promise.then(function(value){
        if(value.status == "000"){
            let result = BniEnc.decrypt(value.data, process.env.APP_CLIENT_ID, process.env.APP_SECRET_KEY);

            res.send({
                status  : "success",
                data    : result
            });
            return
        }else{
            res.send({
                status  : "error",
                data : value
            });
            return
        }
    })
});

// ====== Setting port ======
const port = process.env.APP_PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
