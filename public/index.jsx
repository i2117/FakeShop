class Product extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      quantity: 0,
      price: toCurrency(props.priceRUB, "RUB"),
      currency: "RUB"
    }
  }

  changeQuantity = (amount) => {
    const newQuantity = this.state.quantity + amount
    this.setState((state) => {
      return {quantity: newQuantity};
    });
    this.props.onQuantityChange(this.props.id, newQuantity);
  }

  changeCurrency = (currencyObj) => {
    const currency = currencyObj.target.value
    const newPrice = toCurrency(this.props.priceRUB, currency)


    this.setState((state) => {
      return {price: newPrice};
    });
  }

  render() {
    return <div class="card" style={{width: "350px"}}>
      <h1 class="card-header">{this.props.name}</h1>

      <div class="card-body col">
        <div class="row m-1">
          <select class="btn btn-primary dropdown-toggle m-2" onChange={this.changeCurrency}>
            <option value="RUB">RUB</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
          <h2 class="col px-md-2">{this.state.price}</h2>
        </div>

        <div class="row m-1">
          <button class="btn btn-primary col-sm m-2" onClick={() => this.changeQuantity(-1)} disabled={this.state.quantity <= 0}>-</button>
          <div class="badge badge-primary text-wrap col-sm m-2">
            <h2>{this.state.quantity}</h2>
          </div>
          <button class="btn btn-primary col-sm m-2" onClick={() => this.changeQuantity(1)}>+</button>
        </div>
      </div>

    </div>
  }
}

class ProductList extends React.Component {
  constructor(props) {
    super(props)
    let products = this.props.products.map((el) => {
      return {...el, quantity: 0}
    })
    this.state = {
      products: products,
      isCounting: false
    }
  }

  handleQuantityChange = (productID, value) => {
    const newState = this.state
    newState.products[productID].quantity = value
    this.setState(newState)
    console.log(newState)
  }

  countProductsPrice = () => {
    const newState = {
      ...this.state,
      isCounting: true
    }
    this.setState(newState)
    let xhr = new XMLHttpRequest();
    xhr.open('POST', ADDRESS + "countProductsPrice");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(this.state.products));
    xhr.onload = () => {
      const newState = {
        ...this.state,
        isCounting: false
      }
      this.setState(newState)
      if (xhr.status != 200) {
        alert(`Error ${xhr.status}: ${xhr.statusText}`)
      } else {
        const res = JSON.parse(xhr.response)
        alert(`
          Total price: \n 
          RUB: ${res.RUB} \n 
          EUR: ${res.EUR} \n 
          USD: ${res.USD} 
        `)
      }
    }
  }

  render() {
    const productList = this.props.products.map((el, i) => {
      return <
        Product 
          id={i}
          name={el.name} 
          priceRUB={el.price} 
          onQuantityChange = {this.handleQuantityChange}
          class="col">
        </Product>
    })

    const countButton = <button 
            class="btn btn-primary btn-lg m-5" 
            onClick={this.countProductsPrice}
            disabled = {this.state.isCounting}>
            Посчитать
          </button>

    return (
      <div>
        <div class="row">
          {countButton}
        </div>

        <div class="container row">
          {productList}
        </div>

      </div>
    )
  }
}

var toCurrency = (value, currency) => {
  const curr = currencyData[currency]
  let coeff = 1
  if (curr)
    coeff = curr.Nominal / curr.Value

  return (value * coeff).toFixed(2)
}

const ADDRESS = window.location.href //"http://" + location.host
console.log(ADDRESS)

// Getting products data
const http = new XMLHttpRequest()

let products = []

http.open("GET", ADDRESS + "products")
http.send()

http.onload = () => {
  products = JSON.parse(http.response)
  console.log(products)
  ReactDOM.render(
    <div>
      <ProductList products={products}></ProductList>
    </div>,
    document.getElementById("app")
  )
}

// Getting currency data
const currencyRequest = new XMLHttpRequest()

var currencyData = {}

currencyRequest.open("GET", ADDRESS + "currencyData")
currencyRequest.send()

currencyRequest.onload = () => {
  currencyData = JSON.parse(currencyRequest.response)
  console.log(currencyData)
}



