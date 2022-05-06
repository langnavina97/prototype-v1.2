import React, { Component } from "react";

// Mainnet
import IndexSwap from "./abis/IndexSwap.json";
import IndexToken from "./abis/indexToken.json";
import NFTSwap from "./abis/NFTPortfolio.json";

// Testnet
import IndexSwap2 from "./abis2/IndexSwap.json";
import IndexToken2 from "./abis2/indexToken.json";
import NFTSwap2 from "./abis2/NFTPortfolio.json";

import IERC from "./abis/IERC20.json";
import pancakeSwapRouter from "./abis/IPancakeRouter02.json";
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import { Grid, Button, Card, Form, Input, Image, Message, Table } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import velvet from "./velvet.png";
import metamask from "./metamask-fox.svg";
import swal from 'sweetalert';
import ReactGA from 'react-ga';

import "./App.css";

const axios = require('axios');

const networks = {
  bscTestnet: {
    chainId: `0x${Number(97).toString(16)}`,
    chainName: "BSC Testnet",
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18
    },
    rpcUrls: [
      "https://data-seed-prebsc-1-s1.binance.org:8545/",
      "https://data-seed-prebsc-2-s1.binance.org:8545/",
      "https://data-seed-prebsc-1-s2.binance.org:8545/",
      "https://data-seed-prebsc-2-s2.binance.org:8545/",
      "https://data-seed-prebsc-1-s3.binance.org:8545/",
      "https://data-seed-prebsc-2-s3.binance.org:8545/"
    ],
    blockExplorerUrls: ["https://polygonscan.com/"]
  },
  bsc: {
    chainId: `0x${Number(56).toString(16)}`,
    chainName: "Binance Smart Chain Mainnet",
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18
    },
    rpcUrls: [
      "https://bsc-dataseed1.binance.org",
      "https://bsc-dataseed2.binance.org",
      "https://bsc-dataseed3.binance.org",
      "https://bsc-dataseed4.binance.org",
      "https://bsc-dataseed1.defibit.io",
      "https://bsc-dataseed2.defibit.io",
      "https://bsc-dataseed3.defibit.io",
      "https://bsc-dataseed4.defibit.io",
      "https://bsc-dataseed1.ninicoin.io",
      "https://bsc-dataseed2.ninicoin.io",
      "https://bsc-dataseed3.ninicoin.io",
      "https://bsc-dataseed4.ninicoin.io",
      "wss://bsc-ws-node.nariox.org"
    ],
    blockExplorerUrls: ["https://testnet.bscscan.com/"]
  }
};

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      
      account: '',
      SwapContract: null,
      NFTTokenContract: null,
      DeFiTokenContract: null,
      NFTPortfolioContract: null,

      SwapContract2: null,
      NFTTokenContract2: null,
      DeFiTokenContract2: null,
      NFTPortfolioContract2: null,

      address: "",
      connected: false,
      
      chainId: "",

      defiToMintMainnet: 0,
      nftToMintMainnet: 0,

      withdrawValueDefi: 0,
      withdrawValueNFT: 0,

      nftTokenBalance: 0,
      defiTokenBalance: 0,

      rate: 0
    }
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    //await this.getRate();
    //swal("The project is in the alpha stage, proceed at your own risk");

    const web3 = window.web3;
    const chainIdDec = await web3.eth.getChainId();

    this.setState({chainId: chainIdDec});
  }

  // first up is to detect ethereum provider
  async loadWeb3() {
    const provider = await detectEthereumProvider();

    // modern browsers
    if (provider) {
      console.log('MetaMask is connected');

      window.web3 = new Web3(provider);
    } else {
      console.log('No ethereum wallet detected');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const chainIdDec = await web3.eth.getChainId();
    const accounts = await window.web3.eth.getAccounts();
    this.setState({account: accounts[0]});
    if(accounts[0]) {
      this.setState({ connected: true })
    }
    if(chainIdDec == "56") {
      this.setState({ account: accounts[0]}) 
      const SwapContract = new web3.eth.Contract(IndexSwap.abi, "0x28aFA8e930946c5Ea8971595DeBC26a009e7C144");
      const NFTPortfolioContract = new web3.eth.Contract(NFTSwap.abi, "0x40A367c5320440a1aa78aCBC5af0A017Ed1F3772"); 
      const NFTTokenContract = new web3.eth.Contract(IndexToken.abi, "0x16dBB234A9a595967DdC2ea1bb53379752f09Ad4"); 
      const DeFiTokenContract = new web3.eth.Contract(IndexToken.abi, "0x6E49456f284e3da7f1515eEE120E2706cab69fD5");
      this.setState({ SwapContract, DeFiTokenContract, NFTPortfolioContract, NFTTokenContract});
    } else if (chainIdDec == "97") {
      const SwapContract2 = new web3.eth.Contract(IndexSwap2.abi, "0xfb83FDEF18ab899E9c4C3a59B99cb7600d63D987");
      const NFTPortfolioContract2 = new web3.eth.Contract(NFTSwap2.abi, "0x0f444D6F25d2F8Fd0639eEc68ce4AA1F03FF6F4F");
      const NFTTokenContract2 = new web3.eth.Contract(IndexToken2.abi, "0x817ea2A5Fd281d15CA70B05abB5E094356C42996");
      const DeFiTokenContract2 = new web3.eth.Contract(IndexToken2.abi, "0xF70538622598232a95B1EC1914Fc878d28EBAE68");
      this.setState({ SwapContract2, DeFiTokenContract2, NFTPortfolioContract2, NFTTokenContract2});
    }
  }

    async changeNetwork (networkName) {
      try {
        if (!window.ethereum) throw new Error("No crypto wallet found");
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              ...networks[networkName]
            }
          ]
        });
      } catch (err) {
        console.log(err);
      }
      window.location.reload();
      const web3 = window.web3;
      const chainIdDec = await web3.eth.getChainId();
      this.setState({chainId: chainIdDec});
      await this.loadBlockchainData();
      
    };

    handleNetworkSwitch = async (networkName) => {
      await this.changeNetwork(networkName);
    };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  }

  connectWallet = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      console.log("Connected");
      this.setState({
        connected: true
      })

    } else {
      alert("Metamask not found");
    }

    this.loadBlockchainData();
    window.location.reload();
  }

  

  investNFTMainnet = async () => {
    const web3 = new Web3(window.ethereum);
    const v = this.state.nftToMintMainnet;
    const valueInWei = web3.utils.toWei(v, 'ether');
    console.log(this.state.NFTPortfolioContract.methods);
    
    const resp = await this.state.NFTPortfolioContract.methods.investInFundNFT().send({ from: this.state.account, value: valueInWei
    }).once("receipt", (receipt) => {
      console.log(receipt);
    })
      .catch((err) => {
        console.log(err);
      });
    if (resp.status) {
      swal("Investment successfull!", `You invested ${v} BNB into the portfolio.`, "success");
    } else {
      swal("Investment failed!");
    }
  }

  investDeFiMainnet = async () => {
    const web3 = new Web3(window.ethereum);    
    const v = this.state.defiToMintMainnet;
    const valueInWei = web3.utils.toWei(v, 'ether');
    
    const resp = await this.state.SwapContract.methods.investInFund(valueInWei).send({ from: this.state.account, value: valueInWei })
    .once("receipt", (receipt) => {
      console.log(receipt);

    })
      .catch((err) => {
        console.log(err);
      });

      if (resp.status) {
        swal("Investment successfull!", `You invested ${v} BNB into the portfolio.`, "success");
        //window.location.reload();
      } else {
        swal("Investment failed!");
      }
  }

  calcTokenBalanceMainnet = async(token, user) => {
    const web3 = new Web3(window.ethereum);
    const vault = "0xD2aDa2CC6f97cfc1045B1cF70b3149139aC5f2a2";

    const indexShare = this.state.IndexSwap.methods.balanceOf(user).call();
    const totalSupplyIndex = this.state.IndexSwap.totalSupply().call();

    const TokenContract = new web3.eth.Contract(IERC.abi, token);
    const tokenSupply = TokenContract.methods.balanceOf(vault);

    let tokenShare = indexShare / totalSupplyIndex;
    return tokenShare * tokenSupply;
  }

  withdrawDeFiMainnet = async () => {
    const vault = "0x75c9D3e17284D3AdA7F8B17E06DBE75a98353fF7";

    const web3 = new Web3(window.ethereum);

    var withdrawAmt = this.state.withdrawValueDefi;
    var withdrawAmountInWei = web3.utils.toWei(withdrawAmt, 'ether');

    await this.state.SwapContract.methods.approve("0x28aFA8e930946c5Ea8971595DeBC26a009e7C144", "115792089237316195423570985008687907853269984665640564039457584007913129639935")
    .send({from: this.state.account});


    var amount = withdrawAmountInWei;
    var sAmount = amount.toString();

    await this.state.SwapContract.methods.withdrawFromFundNew(sAmount
    ).send({
      from: this.state.account, value: 0
    }).once("receipt", (receipt) => {
      swal("Withdrawal successfull!", "The withdrawal was successful!", "success");
      console.log(receipt);
    })
      .catch((err) => {
        console.log(err);
      });

  }

  withdrawNFTMainnet = async () => {
      const vault = "0x75c9D3e17284D3AdA7F8B17E06DBE75a98353fF7";
  
      const web3 = new Web3(window.ethereum);
  
      console.log(this.state.DeFiTokenContract);
  
      var withdrawAmt = this.state.withdrawValueNFT;
      var withdrawAmountInWei = web3.utils.toWei(withdrawAmt, 'ether');
  
  
      await this.state.NFTTokenContract.methods.approve("0x40A367c5320440a1aa78aCBC5af0A017Ed1F3772", "7787357773333787487837458347754874574837458374")
      .send({from: this.state.account});
  
      var amount = withdrawAmountInWei;
      var sAmount = amount.toString();
  
      await this.state.NFTPortfolioContract.methods.withdrawFromFundNFT(sAmount
      ).send({
        from: this.state.account, value: 0
      }).once("receipt", (receipt) => {
        swal("Withdrawal successfull!", "The withdrawal was successful!", "success");
        console.log(receipt);
      })
        .catch((err) => {
          console.log(err);
        });
  }

  getExchangeRateMainnet = async (amountIn, address) => {
    const web3 = window.web3;
    const pancakeRouter = new web3.eth.Contract(pancakeSwapRouter.abi, "0x10ED43C718714eb63d5aA57B78B54704E256024E");

    var path = [];
    path[0] = address;
    path[1] = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";

    const er = await pancakeRouter.methods.getAmountsOut(amountIn, path).call();
    return er[1];
  }

  /*getRate = async () => {
    const rateObj = await this.state.SwapContract.methods.currentRate().call();
    const rate = rateObj.numerator / rateObj.denominator;
    this.setState({ rate });
  }*/


  // TESTNET

  investNFT = async () => {
    const web3 = new Web3(window.ethereum);
    const v = this.state.nftToMint;
    const valueInWei = web3.utils.toWei(v, 'ether');
    
    const resp = await this.state.NFTPortfolioContract2.methods.investInFundDefi().send({ from: this.state.account, value: valueInWei
    }).once("receipt", (receipt) => {
      console.log(receipt);
    })
      .catch((err) => {
        console.log(err);
      });
    if (resp.status) {
      swal("Investment successfull!", `You invested ${v} BNB into the portfolio.`, "success");
    } else {
      swal("Investment failed!");
    }

  }

  investDeFi = async () => {
    const web3 = new Web3(window.ethereum);    
    const v = this.state.defiToMint;
    const valueInWei = web3.utils.toWei(v, 'ether');
    
    const resp = await this.state.SwapContract2.methods.investInFund(valueInWei).send({ from: this.state.account, value: valueInWei })
    .once("receipt", (receipt) => {
      console.log(receipt);

    })
      .catch((err) => {
        console.log(err);
      });

      if (resp.status) {
        swal("Investment successfull!", `You invested ${v} BNB into the portfolio.`, "success");
        //window.location.reload();
      } else {
        swal("Investment failed!");
      }

  }

  withdrawDeFi = async () => {
    var vault = "0x75c9D3e17284D3AdA7F8B17E06DBE75a98353fF7";

    const web3 = new Web3(window.ethereum);

    var withdrawAmt = this.state.withdrawValueDefi;
    var withdrawAmountInWei = web3.utils.toWei(withdrawAmt, 'ether');
    var sAmount = withdrawAmountInWei.toString();

    await this.state.SwapContract2.methods.approve("0xfb83FDEF18ab899E9c4C3a59B99cb7600d63D987", "115792089237316195423570985008687907853269984665640564039457584007913129639935")
    .send({from: this.state.account});

    await this.state.SwapContract2.methods.withdrawFromFundNew(sAmount
    ).send({
      from: this.state.account, value: 0
    }).once("receipt", (receipt) => {
      swal("Withdrawal successfull!", "The withdrawal was successful!", "success");
      console.log(receipt);
    })
      .catch((err) => {
        console.log(err);
      });

  }

  withdrawNFT = async () => {
    var vault = "0x75c9D3e17284D3AdA7F8B17E06DBE75a98353fF7";

    const web3 = new Web3(window.ethereum);

    var withdrawAmt = this.state.withdrawValueNFT;
    var withdrawAmountInWei = web3.utils.toWei(withdrawAmt, 'ether');

    const nftBalance = await this.state.NFTTokenContract2.methods.balanceOf(this.state.account).call();
    if(nftBalance == 0) {
      swal("Withdrawal amount exceeds balance!");
      return;
    }

    var percentage = (withdrawAmountInWei * 100) / nftBalance ;
    var percentageFinal = Math.round(percentage);
    console.log(Math.round(percentage));
  
    await this.state.NFTTokenContract2.methods.approve("0x0f444D6F25d2F8Fd0639eEc68ce4AA1F03FF6F4F", "7787357773333787487837458347754874574837458374")
    .send({from: this.state.account});

    var amount = withdrawAmountInWei;
    var sAmount = amount.toString();

    await this.state.NFTPortfolioContract2.methods.withdrawFromFundNFT(sAmount, percentageFinal
    ).send({
      from: this.state.account, value: 0
    }).once("receipt", (receipt) => {
      swal("Withdrawal successfull!", "The withdrawal was successful!", "success");
      console.log(receipt);
    })
      .catch((err) => {
        console.log(err);
      });

  }

  getExchangeRate = async (amountIn, address) => {
    const web3 = window.web3;
    const pancakeRouter = new web3.eth.Contract(pancakeSwapRouter.abi, "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3");

    var path = [];
    path[0] = address;
    path[1] = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";

    const er = await pancakeRouter.methods.getAmountsOut(amountIn, path).call();
    return er[1];
  }

  render() {

    window.addEventListener("load", function() {
      if (window.ethereum) {
        // use MetaMask's provider
        App.web3 = new Web3(window.ethereum);
        window.ethereum.enable(); // get permission to access accounts
    
        // detect Metamask account change
        window.ethereum.on('accountsChanged', function (accounts) {
          console.log('accountsChanges',accounts);
    
        });
    
         // detect Network account change
        window.ethereum.on('networkChanged', function(networkId){
          console.log('networkChanged',networkId);
        });

      } else {
        console.warn(
          "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
        );
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        App.web3 = new Web3(
          new Web3.providers.HttpProvider("http://127.0.0.1:7545"),
        );
      }
    });

    const web3 = window.web3;

    let button;
    if (!this.state.connected) {
      button = <Button style={{ position: "absolute", top: "60px", right: "20px" }} onClick={this.connectWallet} color="orange">
          <Image style={{ "padding-top": "7px" }} floated="left" size="mini" src={metamask} />
          <p>Connect to MetaMask</p>
        </Button>
    } else {
      button = <p style={{ position: "absolute", top: "110px", right: "20px", color: "#C0C0C0" }}><b>Account:</b> {this.state.account}</p>
    }

    let testnet;
    if(this.state.chainId == "97") {
      testnet = <Grid divided='vertically'>
        <Grid.Row columns={2} style={{ margin: "20px" }}>
          <Grid.Column>

            <Card.Group>
              <Card style={{ width: "900px" }}>
                <Card.Content style={{ background: "#406ccd" }}>
                <Card.Header style={{ color: "white" }}>
                  <p style={{ color: "#C0C0C0", "font-weight": "bold", "text-align": "right" }}>APY: XX%</p>
                    Top 10 Tokens
                    </Card.Header>
                  <Card.Description>

                    <p style={{ color: "#C0C0C0" }}>Rate: In return of investing 1 BNB you will receive 1 Top10 Token.</p>

                    <Form onSubmit={this.investDeFi}>
                      <Input style={{ width: "300px", padding: 3 }} required type="text" placeholder="BNB amount to create" name="defiToMint" onChange={this.handleInputChange}></Input>
                      <Button color="green" type="submit" style={{ margin: "20px", width: "150px" }}>Create</Button>
                    </Form>

                    <Form onSubmit={this.withdrawDeFi}>
                      <Input style={{ width: "300px", padding: 3 }} required type="text" placeholder="Top10 amount to redeem" name="withdrawValueDefi" onChange={this.handleInputChange}></Input>
                      <Button color="green" style={{ margin: "20px", width: "150px" }}>Redeem</Button>
                    </Form>

                  </Card.Description>
                </Card.Content>
              </Card>
            </Card.Group>
          </Grid.Column>

        </Grid.Row>
      </Grid>
    }

      let buttonSwitch;
      if(this.state.chainId == "56" && this.state.connected) {
        buttonSwitch = <Button style={{ position: "absolute", top: "60px", right: "20px" }} onClick={() => this.handleNetworkSwitch("bscTestnet")} color="orange" type="submit" >Change to Testnet</Button>
      } else if (this.state.connected) {
        buttonSwitch = <Button style={{ position: "absolute", top: "60px", right: "20px" }} onClick={() => this.handleNetworkSwitch("bsc")} color="orange" type="submit" >Change to Mainnet</Button>
      }
      
      let mainnet;
      if(this.state.chainId != "97") {
        mainnet = 
        <div>
        <Grid divided='vertically'>
          <Grid.Row columns={2} style={{ margin: "20px" }}>
            <Grid.Column>

              <Card.Group>
                <Card style={{ width: "900px" }}>
                  <Card.Content style={{ background: "#406ccd" }}>
                    <Card.Header style={{ color: "white" }}>
                    <p style={{ color: "#C0C0C0", "font-weight": "bold", "text-align": "right" }}>APY: XX%</p>
                      Top 10 Tokens
                      </Card.Header>
                    <Card.Description>
                      <p style={{ color: "#C0C0C0" }}>Rate: In return of investing 1 BNB you will receive 1 Top10 Token.</p>

                      <Form onSubmit={this.investDeFiMainnet}>
                        <Input style={{ width: "300px", padding: 3 }} required type="text" placeholder="BNB amount to create" name="defiToMintMainnet" onChange={this.handleInputChange}></Input>
                        <Button color="green" type="submit" style={{ margin: "20px", width: "150px" }}>Create</Button>
                      </Form>

                      <Form onSubmit={this.withdrawDeFiMainnet}>
                        <Input style={{ width: "300px", padding: 3 }} required type="text" placeholder="TOP15 amount to redeem" name="withdrawValueDefi" onChange={this.handleInputChange}></Input>
                        <Button color="green" style={{ margin: "20px", width: "150px" }}>Redeem</Button>
                      </Form>

                    </Card.Description>
                  </Card.Content>
                </Card>
              </Card.Group>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        </div>
      }

    return (
      <div className="App">
        <div>
        <Message negative>
          <Message.Header>The project is in the alpha stage, proceed at your own risk.</Message.Header>
        </Message>
      </div>
        <br></br>

        <Image src={velvet} size="medium" verticalAlign='middle'></Image>

        {button}
        {buttonSwitch}
        
        {mainnet}
        
        {testnet}

      </div >
    );
  }
}

export default App;
