import React, { Component } from 'react';
import Keyboard from 'react-simple-keyboard';
import "react-simple-keyboard/build/css/index.css";
import './App.css';
import Web3 from 'web3';
import './index.css';

let lotteryAddress = '0x146bf8BD423B2f88217A86C4eb7FDb3abFb454aD'; 
let lotteryABI = [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "BET", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "bytes1", "name": "anwser", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "DRAW", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "bytes1", "name": "anwser", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "FAIL", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "REFUND", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "bytes1", "name": "anwser", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "WIN", "type": "event" }, { "inputs": [], "name": "answerForTest", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address payable", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "getPot", "outputs": [ { "internalType": "uint256", "name": "pot", "type": "uint256" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "bytes1", "name": "challenges", "type": "bytes1" } ], "name": "betAndDistribute", "outputs": [ { "internalType": "bool", "name": "result", "type": "bool" } ], "stateMutability": "payable", "type": "function", "payable": true }, { "inputs": [ { "internalType": "bytes1", "name": "challenges", "type": "bytes1" } ], "name": "bet", "outputs": [ { "internalType": "bool", "name": "result", "type": "bool" } ], "stateMutability": "payable", "type": "function", "payable": true }, { "inputs": [], "name": "distribute", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "answer", "type": "bytes32" } ], "name": "setAnswerForTest", "outputs": [ { "internalType": "bool", "name": "result", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "internalType": "bytes32", "name": "answer", "type": "bytes32" } ], "name": "isMatch", "outputs": [ { "internalType": "enum Lottery.BettingResult", "name": "", "type": "uint8" } ], "stateMutability": "pure", "type": "function", "constant": true }, { "inputs": [ { "internalType": "uint256", "name": "index", "type": "uint256" } ], "name": "getBetInfo", "outputs": [ { "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" }, { "internalType": "address", "name": "bettor", "type": "address" }, { "internalType": "bytes1", "name": "challenges", "type": "bytes1" } ], "stateMutability": "view", "type": "function", "constant": true } ];

class App extends Component {

  constructor(props) {
    super(props);
 
    this.state = {
      betRecords: [],
      winRecords: [],
      failRecords: [],

      pot: '0',
      challenges: [],
      finalRecords: [{
        bettor: '0xabcd...',
        index:'0',
        challenges:'ab',
        answer:'ab',
        targetBlockNumber:'10',
        pot:'0'
      }],

      input: ''
    }
  }
  async componentDidMount() {
    await this.initWeb3();
    // await this.pollData();
    setInterval(this.pollData, 1000);
  }

  pollData = async () => {
    await this.getPot();
    await this.getBetEvents();
    await this.getWinEvents();
    await this.getFailEvents();
    this.makeFinalRecords();
  }
  
  initWeb3 = async () => {
    if (window.ethereum) {
      console.log('Recent mode');
      this.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({method: 'eth_requestAccounts'});
      }
      catch (error) {
        console.log(`User denied account access error: ${error}`);

      }
    }
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    let accounts = await this.web3.eth.getAccounts();
    this.account = accounts[0];

    this.lotteryContract = new this.web3.eth.Contract(lotteryABI, lotteryAddress); // 새로운 객체
    
    // let owner = await this.lotteryContract.methods.owner().call()
    // console.log(owner);
    // 0xEe228d334216e2e47eee14f92247586465d230A9 (계속 바뀜)

  }

  getPot = async () => {
    let pot = await this.lotteryContract.methods.getPot().call(); // 호출
    let potString = this.web3.utils.fromWei(pot.toString(), 'ether'); //fromWei로 ether단위를 만들어줌
    this.setState({pot:potString})
  }

  makeFinalRecords = () => {
    let f = 0, w= 0;
    const records = [...this.state.betRecords];
    for (let i=0; i<this.state.betRecords.length; i+=1) {
      if (this.state.winRecords.length > 0 && this.state.betRecords[i].index === this.state.winRecords[w].index) {
        records[i].win = 'WIN'
        records[i].answer = records[i].challenges;
        records[i].pot = this.web3.utils.fromWei(this.state.winRecords[w].amount, 'ether');
        if(this.state.winRecords.length -1 >w) w++;
      }
      else if(this.state.failRecords.length>0 && this.state.betRecords[i].index === this.state.failRecords[f].index) {
        records[i].win = 'FAIL'
        records[i].answer = this.state.failRecords[f].answer;
        records[i].pot = 0;
        if(this.state.failRecords.length -1 >f) f++;
      } else {
        records[i].answer = 'Not Revealed';
      }
    }
    this.setState({finalRecords:records})
  }

  getBetEvents = async () => {
    const records = []; //이벤트 관련 record 넣기
    let events = await this.lotteryContract.getPastEvents('BET', {fromBlock:0, toBlock:'latest'});

    for(let i=0; i<events.length; i+=1){
      const record = {}
      record.index = parseInt(events[i].returnValues.index, 10).toString(); //Hash값으로 들어와서 parseInt로 바꿔줌
      record.bettor = events[i].returnValues.bettor.slice(0,4) + '...' + events[i].returnValues.bettor.slice(40,42);
      record.betBlockNumber = events[i].blockNumber;
      record.targetBlockNumber = events[i].returnValues.answerBlockNumber.toString();
      record.challenges = events[i].returnValues.challenges;
      record.win = 'Not Revealed';
      record.answer = '0x00';
      records.unshift(record);
    }

    this.setState({betRecords:records})
  }

  getWinEvents = async () => {
    const records = []; //이벤트 관련 record 넣기
    let events = await this.lotteryContract.getPastEvents('WIN', {fromBlock:0, toBlock:'latest'});

    for(let i=0; i<events.length; i+=1){
      const record = {}
      record.index = parseInt(events[i].returnValues.index, 10).toString();//Hash값으로 들어와서 parseInt로 바꿔줌
      record.amount = parseInt(events[i].returnValues.amount, 10).toString();
      records.unshift(record);
    }
    console.log(records);
    this.setState({winRecords:records})
  }

  getFailEvents = async () => {
    const records = []; //이벤트 관련 record 넣기
    let events = await this.lotteryContract.getPastEvents('FAIL', {fromBlock:0, toBlock:'latest'});

    for(let i=0; i<events.length; i+=1){
      const record = {}
      record.index = parseInt(events[i].returnValues.index, 10).toString(); //Hash값으로 들어와서 parseInt로 바꿔줌
      record.answer = events[i].returnValues.answer;
      records.unshift(record);
    }
    console.log(records);
    this.setState({failRecords:records})
  }
  

  bet = async () => {
    // nonce
    let challenges = '0x' + this.state.challenges[0].toLowerCase() + this.state.challenges[1].toLowerCase();
    let nonce = await this.web3.eth.getTransactionCount(this.account);
    this.lotteryContract.methods.betAndDistribute(challenges).send({from:this.account, value:5000000000000000, gas:300000, nonce:nonce})
    .on('transactionHash', (hash) => {
      console.log(hash) 
    })
  }

  // Pot money가 얼마인지 알려주는 UI

  // Betting하는 글자선택 UI (버튼 형식)
  // Bet button

  // History table 
  // index(최신순 내림파순) address(어떤 주소가 배팅) challenge(배팅 글자) answer(정답o:보여줌) pot(팟머니 가져오면:보여줌) status(fail,win) answerBlcokNumber(어떤 블록에 배팅했는지) 

  // onClickCard = (_Character) => {
  //   this.setState({
  //     challenges: [this.state.challenges[1], _Character]
  //   })
  // }
  // getCard = (_Character, _cardStyle) => {
  //   let _card ='';
  //   if (_Character === 'A') {
  //     _card = '🂡';
  //   }
  //   if (_Character === 'B') {
  //     _card = '🂱'; 
  //   }
  //   if (_Character === 'C') {
  //     _card = '🃁';
  //   }
  //   if (_Character === '0') {
  //     _card = '🃑';
  //   }

  //   return (
  //     <button className={_cardStyle} onClick = {()=> {this.onClickCard(_Character)}}>
  //       <div className = "card-body text-center">
  //         <p className="card-text"></p>
  //         <p className="card-text text-center" style={{fontSize:300}}>{_card}</p>
  //         <p className="card-text"></p>
  //       </div>
  //     </button>    
  //   )
  // };

  onChange = input => {
    this.setState({ input });
    console.log("Input changed", input);
  };

  onKeyPress = button => {
    console.log("Button pressed", button);

    let buttonElement = this.keyboard.getButtonElement(button);
    console.log(buttonElement);

    /**
     * If you want to handle the shift and caps lock buttons
     */
    
    // if (button === "{shift}" || button === "{lock}") this.handleShift();

    
    if (button === "{enter}") {
      this.bet();
      this.keyboard.clearInput();
    }
    else {
      this.setState({
        challenges: [this.state.challenges[1], button]
      })
    }
  };

  handleShift = () => {
    const layoutName = this.state.layoutName;

    this.setState({
      layoutName: layoutName === "default" ? "shift" : "default"
    });
  };

  onChangeInput = event => {
    const input = event.target.value;
    this.setState({ input });
    this.keyboard.setInput(input);
    console.log(input);
  };

  render() {
    return (
      <div className="App">
        {/* Header - Pot, Betting characters */}
        <div className="container">
          <div className="jumbotron">
            <h1>Current Pot : {this.state.pot}</h1>
            <p>Lottery</p>
            <p>Lottery tutorial</p>
            <p>Your Bet</p>
            <p>{this.state.challenges[0]} {this.state.challenges[1]}</p>
          </div>
        </div>
        

        {/* Card selection */}
        <div className = "container">
          <div>
            {/* <input
              value={this.state.input}
              maxLength='2'
              placeholder={"Tap to place your bet"}
              onChange={e => this.onChangeInput(e)}
            /> */}
            <Keyboard
              keyboardRef={r => (this.keyboard = r)}
              layoutName={this.state.layoutName}
              onChange={this.onChange}
              onKeyPress={this.onKeyPress}
              layout={{
                'default': [
                  '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
                  '{tab} Q W E R T Y U I O P { } |',
                  '{lock} A S D F G H J K L : " {enter}',
                  '{shift} Z X C V B N M &lt; &gt; ? {shift}',
                  '{ctrl} {win} {alt} {space} {alt} Fn {ctrl}'
                ]
              }}
              display={{
                '{bksp}': '← Backspace',
                '{tab}': 'Tab ⇆',
                '{lock}': 'CapsLock',
                '{enter}':'Enter ↵',
                '{shift}': '⇧ Shift',
                '{space}': 'ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ',
                '{ctrl}': 'Ctrl',
                '{win}': '<font face=Wingdings>&#xff;</font>',
                '{alt}': 'Alt',

              }}

            />
          </div>
           {/* <div className = "card-group">
             {this.getCard("A", 'card bg-primary')}
             {this.getCard("B", 'card bg-warning')}
             {this.getCard("C", 'card bg-danger')}
             {this.getCard("0", 'card bg-success')}
           </div> */}
        </div>
        <br></br>


        {/* Betting button*/}
        {/* <div className="container">
          <button className="btn btn-danger btn-lg" onClick={this.bet}>BET!</button>
        </div> */}
        <br></br>



        <div className="container">
          <table className = "table table-dark table-striped">
            <thead>
            <tr>
              <th>Index</th>
              <th>Address</th>
              <th>Challenge</th>
              <th>Answer</th>
              <th>Pot</th>
              <th>Status</th>
              <th>AnswerBlock</th>
            </tr>
            </thead>
            <tbody>
              {
                this.state.finalRecords.map((record, index) => {
                  return(
                    <tr key={index}>
                      <td>{record.index}</td>
                      <td>{record.bettor}</td>
                      <td>{record.challenges}</td>
                      <td>{record.answer}</td>
                      <td>{record.pot}</td>
                      <td>{record.win}</td>
                      <td>{record.targetBlockNumber}</td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>      
    );
  };
};

export default App;
