# Lottery Dapp 개발
## Block Hash를 맞추는 Lottery Game

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
참고) 1ETH = 10 ** 18wei

#### dapp campus
#### URL : https://www.youtube.com/watch?v=Ud3_OrxNPDg




## Lottery-smart-contract

### contracts
### migrations

## lottery-react-app
