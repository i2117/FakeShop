const request = require("request")
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

const PORT = process.env.PORT || 3000;

const products = JSON.parse(fs.readFileSync('products.json', 'utf8')).products;
const currencyUrl = "https://www.cbr-xml-daily.ru/daily_json.js"

let currencyData;

let getCurrencyData = () => {
  request({
    url: currencyUrl,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      currencyData = body.Valute
      console.log("Updated currencyData")
    }
  })
}

getCurrencyData()

const CronJob = require('cron').CronJob;
const job = new CronJob('0 */30 * * * *', function() {
    getCurrencyData()
  }
)
job.start()

let toCurrency = (value, currency) => {
  const curr = currencyData[currency]
  let coeff = 1
  if (curr)
    coeff = curr.Nominal / curr.Value

  return (value * coeff).toFixed(2)
}

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public/'));

app.get('/products', function (req, res) {
  res.send(products);
}); 

app.get('/currencyData', function (req, res) {
  res.send(currencyData);
}); 

app.post('/countProductsPrice', function (req, res) {
  const products = req.body
  console.log(products)

  const priceRUB = products.reduce((a, b) => a + b.price * b.quantity, 0)
  let result = {
    RUB: toCurrency(priceRUB, "RUB"),
    EUR: toCurrency(priceRUB, "EUR"),
    USD: toCurrency(priceRUB, "USD")
  }
  res.send(result);
}); 

app.listen(PORT, function () {
  console.log('Example app listening on port 3000!');
});

