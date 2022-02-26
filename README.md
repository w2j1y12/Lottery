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

- 32byte 새로 저장 == 20000gas
- 32byte 기존 변수에 있는 값을 바꿀 때 == 5000gas



## Lottery-smart-contract

### contracts
- 모든 smart contract
- 
#### Migration.sol

### migrations
- 배포 관련 script
### test
- test codde
- solidity에서 시용 가능한 코드는 크게 2가지
  - solidity 자체 랭귀지를 사용해서 만드는 test
  - js를 통해서 외부에서 사용하는 integration 형식 test

## lottery-react-app
