# Lottery Dapp 개발
## Block Hash를 맞추는 Lottery Game

#### dapp campus
#### URL : https://www.youtube.com/watch?v=Ud3_OrxNPDg


### Lottery Rules

- 3번째 블록해쉬의 첫 두 글자 맞추기 
  - 유저가 던진 트랜젝션이 들어가는 블록 +3의 블록해쉬와 값을 비교

- 팟 머니
  - 결과가 나왔을 때만 유저가 보낸 돈을 팟 머니에 쌓기
  - 여러 명이 맞추었을 때는 가장 먼저 맞춘 사람이 팟 머니를 가져감
  - 두 글자 중 하나만 맞추었을 때는 보낸 돈을 돌려줌 -> 0.005ETH = 10**15wei
  - 결과값을 검증할 수 없을 때에는 보낸 돈을 돌려줌

### Ethereum 수수료

- gas(Limit)
- gasPrice
- ETH

- 수수료 = gas(21000) * gasPrice(1gawei == 10**9wei) = 21000000000000wei = 0.000021ETH
#### 참고) 1ETH = 10 ** 18wei

### Gas 계산
- 수수료가 높을 수록 transaction 잘 됨

- 32byte 새로 저장 == 20000gas
- 32byte 기존 변수에 있는 값을 바꿀 때 == 5000gas
- 기존 변수를 초기화해서 더 쓰지 않을 때 -> 10000gas return

### Dapp 서비스 설계
- 지갑 관리
  - 가장 중요
- 아키텍쳐
  - 기존 서비스는 동일 (서버 클라이언트 구조로 진행)
  - smart contract -> 스마트 컨트랙트만 사용 시, 모든 데이터를 관리해야하기 때문에 유연하지 않음
  - server -> 중요한 데이터는 스마트 컨트랙트에서 덜 중요한 데이터는 서버에서 관리 -> 서비스를 다채롭게 구성
- code
  - 코드를 실행하는데 돈이 든다 (DDoS 공격을 막기 위해) -> 어떻게 해야 최소의 비용이 들지 생각해봐야 함
  - 권한 관리 (logic이 복잡해질 때)
  - 비지니스 로직 업데이트 (초기 설계 이후 정해진 상태로 유지하기 어려움)
  - 데이터 마이그레이션
- 운영
  - public 
  - private
  
## Lottery-smart-contract

### contracts
- 모든 smart contract
- Migration.sol
  - smart contract의 버전 관리
  - 몇 번 째 deployment script응 사용했는지 알 수 있음 
- Lottery.sol
  - 

### migrations
- 배포 관련 script
### test
- test codde
- solidity에서 시용 가능한 코드는 크게 2가지
  - solidity 자체 랭귀지를 사용해서 만드는 test
  - js를 통해서 외부에서 사용하는 integration 형식 test

## lottery-react-app
### App.js

- web3와 Metamask 연동
- 매년 업데이트되므로, 확인해야 함
'''
initWeb3 = async () => {
    if (window.ethereum) {
      // const web3 = require("Web3");
      console.log('Recent mode');
      this.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({method: 'eth_requestAccounts'});
        // window.web3 = new Web3(window.ethereum);
        // return true;
      }
      catch (error) {
        console.log(`User denied account access error: ${error}`);
        // return false;
      }
      
    }
    else {
      console.log('Non-Ethereum broswer detected. You should consider trying MetaMask');
    }

    let accounts = await this.web3.eth.getAccounts();
    this.account = accounts[0];

    this.lotteryContract = new this.web3.eth.Contract(lotteryABI, lotteryAddress); // 새로운 객체
    
  }
'''
#### 참고)https://medium.com/valist/how-to-connect-web3-js-to-metamask-in-2020-fee2b2edf58a


