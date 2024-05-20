import React, { Component } from "react";
import { Container, Header, Image, Label, Button, Grid, Icon, Message } from "semantic-ui-react";
import http from "../../../services/httpService.js";
import { apiUrl } from "../../../utils/api-config";
import { withRouter } from "react-router";


const dateOptions = {
  year: "numeric",
  month: "long",
  day: "numeric"
};
class VendorsInfo extends Component {
  state = {
    transactions: [],
    products: [],
    initialBalance: 0,
    totalAmount: 0,
    productTotal: 0,
    paidAmount: 0,
  }

  redirect = () => this.props.history.push("/accounts/transaction/new");

  calculateTransactionAmount = () => {
    const { transactions } = this.state
    Array.prototype.forEach.call(transactions, element => {
      if (element.amount > 0) {
        this.setState(prevstate => ({
          totalAmount: prevstate.totalAmount + element.amount
        }));
      }
      else {
        this.setState(prevstate => ({
          paidAmount: prevstate.paidAmount + element.amount
        }));
      }
    });
  }

  calculateProductAmount = () => {
    const { products } = this.state
    Array.prototype.forEach.call(products, element => {
      this.setState(prevstate => ({
        totalAmount: prevstate.totalAmount + (element.price * element.quantity),
        productTotal: prevstate.productTotal + (element.price * element.quantity)
      }));
    });
  }

  getVendorID = () => {
    const { pathname } = window && window.location;
    var arr = pathname.split("/");
    const vendorID = parseInt(arr[arr.length - 1]);

    return vendorID;
  }

  getVendorTransactions = () => {
    const vendorID = this.getVendorID();
    http
      .get(`${apiUrl}/api/v1/transactions`, { params: { vendorID } })
      .then(res => {
        this.setState({
          transactions: res.data.results[1]
        }, () => {
          this.calculateTransactionAmount();
        });
      })
      .catch(error => console.log(error))
  }

  getPurchasedProducts = () => {
    const vendorID = this.getVendorID();
    http
      .get(`${apiUrl}/api/v1/products`, { params: { vendorID } })
      .then(res => {
        this.setState({
          products: res.data.results[1]
        }, () => {
          this.calculateProductAmount();
        });
      })
      .catch(error => console.log(error))
  }

  addVendorProduct = () => {
    const vendorID = this.getVendorID();
    this.props.history.push({ pathname: "/accounts/vendor/product/new", state: { vendor_id: vendorID } });
  }

  componentDidMount() {
    this.setState(prevState => ({
      totalAmount: prevState.totalAmount + prevState.initialBalance
    }));
    this.getVendorTransactions();
    this.getPurchasedProducts()
  }

  render() {
    const { transactions, initialBalance, totalAmount, products, paidAmount, productTotal } = this.state;
    return (
      <React.Fragment>
        <Container className="page-header">
          <Header as="h2" className="second-header" floated="right">
            Devsinc
					</Header>
          <Header as="h2" floated="left">
            <Image className="logo" src={require("../../../images/logo.png")} />
            <span className="header-text">Vendor</span>
          </Header>
        </Container>
        <div className="ui divider" />
        <div style={{ textAlign: "center" }}>
          <Label as='a' color='blue' size="large">
            Initial Balance:
            <Label.Detail>{initialBalance}</Label.Detail>
          </Label>
          <Label as='a' color='teal' size="large">
            Total Amount:
            <Label.Detail>{totalAmount}</Label.Detail>
          </Label>
          <Label as='a' color='green' size="large">
            Paid Amount:
            <Label.Detail>{paidAmount}</Label.Detail>
          </Label>
          <Label as='a' color='yellow' size="large">
            Payable Amount:
            <Label.Detail>{totalAmount + paidAmount}</Label.Detail>
          </Label>
        </div>
        <Grid style={{ marginTop: "15px" }}>
          <Grid.Column width={12}>
            <h3>Transactions</h3>
          </Grid.Column>
          <Grid.Column width={4}>
            <Button style={{ background: "#58ae61", color: "white" }} floated="right" onClick={this.redirect} ><Icon name="plus"></Icon>New</Button>          </Grid.Column>
        </Grid>
        <table className="table table-bordered table-striped mb-1 account-table">
          <thead style={{ color: "white", background: "#1969a4" }}>
            <tr>
              <th scope="col">Txn ID</th>
              <th scope="col">Amount</th>
              <th scope="col">Date</th>
              <th scope="col">Details</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(item => {
              return (
                <tr key={item.id}>
                  <th scope="row">{item.transaction_code}</th>
                  <td>{item.amount}</td>
                  <td>{new Intl.DateTimeFormat("en-PK", dateOptions).format(
                    new Date(item.transaction_date)
                  )}
                  </td>
                  <td>{item.details}</td>

                </tr>)
            })}
          </tbody>
        </table>
        <Grid style={{ marginTop: "50px" }}>
          <Grid.Column width={12}>
            <h3>Purchased Products</h3>
          </Grid.Column>
          <Grid.Column width={4}>
            <Button style={{ background: "#58ae61", color: "white" }} floated="right" onClick={this.addVendorProduct} ><Icon name="plus"></Icon>New</Button>
          </Grid.Column>
        </Grid>
        <table className="table table-bordered table-striped mb-1 account-table">
          <thead style={{ color: "white", background: "#1969a4" }}>
            <tr>
              <th scope="col">Product code</th>
              <th scope="col">Product Name</th>
              <th scope="col">Quantity</th>
              <th scope="col">Unit Price</th>
              <th scope="col">Total Amount</th>
              <th scope="col">Details</th>
            </tr>
          </thead>
          <tbody>
            {products.map(item => {
              return (
                <tr key={item.id}>
                  <th scope="row">{item.code}</th>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price}</td>
                  <td>{item.quantity * item.price}</td>
                  <td>{item.details}</td>

                </tr>)
            })}
          </tbody>
        </table>
        <Message color='green' style={{ padding: "10px" }}><strong> Products Total : </strong> <span style={{ marginLeft: "1%" }}><strong>{productTotal}</strong></span></Message>
      </React.Fragment>
    )
  }
}

export default withRouter(VendorsInfo);