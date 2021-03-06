const keyPublishable = process.env.PUBLISHABLE_KEY;
const keySecret = process.env.SECRET_KEY;

const express = require("express");
const cors = require('cors')
const bodyParser = require("body-parser");
const stripe = require("stripe")(keySecret);
const app = express();
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors(corsOptions))
app.use('/api', getAllPlans)

const req = {};
const res = {
    json : function(payload){
        console.log("All Stripe Plans:")
        for(let plan of payload.data){
            console.log(`Plan ${plan.id}, Name: ${plan.product.id}, Amount: ${plan.amount/100}/${plan.interval}`)
        }
        console.log("payload:", payload)
    }
};
const next = function(){};

async function getAllPlans(req, res, next){
    const plans = await stripe.plans.list({expand: ["data.product"]});
    res.json(plans)
}
getAllPlans(req, res, next);

app.options('*', cors(corsOptions))
app.get('/home', (req, res) => {
    res.send('Home Page');
});

app.get('/about', (req, res) => {
    res.send('About');
});

app.get('/movies/:MovieId', (req, res) => {
    res.send(req.params);
});

app.post('/create', (req, res) => {
    stripe.charges.create({
        amount: req.body.amount,
        currency: 'usd',
        source: req.body.payload.token.id,
    })
})

app.post("/charge", (req, res) => {
    let amount = 10000;

    stripe.customers.create({
        email: req.body.email,
        card: req.body.id
    })
    .then(customer =>
        stripe.charges.create({
            amount,
            description: "Sample Charge",
            currency: "usd",
            customer: customer.id
        }))
    .then(charge => res.send(charge))
    .catch(err => {
        console.log("Error", err);
        res.status(500).send({error: "Purchase Failed"});
    });
});

app.listen(8000);