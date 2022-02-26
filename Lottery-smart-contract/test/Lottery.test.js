const Lottery = artifacts.require("Lottery");
const { assert } = require('chai');
const assertRevert = require('./asserRevert');
const expectEvent = require('./expectEvent');

contract('Lottery', function([deployer, user1, user2]) {
    let lottery; // 배포
    let betAmount = 5 * 10 ** 15;
    let betAmountBN = new web3.utils.BN('5000000000000000');
    let bet_block_interval = 3;
    beforeEach(async () => {
        lottery = await Lottery.new(); // 배포

    })

    it('getPot should return current pot', async () => {
        let pot = await lottery.getPot();
        assert.equal(pot,0)
    })

    describe('Bet', function () {
        // 0.005ETH가 제대로 들어오지 않았을 때
        it('should fail when the bet money is not 0.005 ETH', async () => {
            // Fail transaction
            await assertRevert(lottery.bet('0xab', {from : user1, value : 4000000000000000}));
            // transaction object {chainID, value, to, from, gas(Limit), gasPrice}
            //{networkID, ETh, address, 누가 보냈는지, 사용하는 gas값}
        })

        it('should put the bet to the bet queue with 1 Bet', async () => {
            // bet
            let receipt = await lottery.bet('0xab', {from : user1, value : betAmount})
            // console.log(receipt);

            let pot = await lottery.getPot();
            assert.equal(pot,0);

            //check contract balance == 0.05
            let contractBalance = await web3.eth.getBalance(lottery.address);
            assert.equal(contractBalance, betAmount)

            //check bet info
            let currentBlockNumber = await web3.eth.getBlockNumber();
            
            let bet = await lottery.getBetInfo(0);
            assert.equal(bet.answerBlockNumber, currentBlockNumber + bet_block_interval);
            assert.equal(bet.bettor, user1);
            assert.equal(bet.challenges, '0xab');

            //check log
            await expectEvent.inLogs(receipt.logs, 'BET')
        })
    })

    describe('Distibute', function () {
        describe('When the answer is checkable', function () {
            it('should give the user the pot when the answer matches', async () => {
                // 두 글자 다 맞았을 때

                await lottery.setAnswerForTest('0xaba9c982d7d2a4c2afa7f351ea2cb48c0209605578f78110169e3f9eb6c652a7', {from : deployer}) // 32byte 맞춰야 해서 Hash

                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 1 -> 4
                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 2 -> 5
                await lottery.betAndDistribute('0xab', {from : user1, value : betAmount}) // 3 -> 6 정답
                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 4 -> 7
                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 5 -> 8
                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 6 -> 9
                
                let potBefore = await lottery.getPot(); // 0.01ETH
                let user1BalanceBefore = await web3.eth.getBalance(user1);

                let receipt7 = await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 7 -> 10 user1에게 pot이 간다

                let potAfter = await lottery.getPot(); // 0ETH
                let user1BalanceAfter = await web3.eth.getBalance(user1); // before + 0.015ETH

                // pot의 변화량 확인
                assert.equal(potBefore.toString(), new web3.utils.BN('10000000000000000').toString());
                assert.equal(potAfter.toString(), new web3.utils.BN('0').toString());
                // assert.equal(potBefore, 0.01)

                // user(winner)의 밸런스 확인
                user1BalanceBefore = new web3.utils.BN(user1BalanceBefore)
                assert.equal(user1BalanceBefore.add(potBefore).add(betAmountBN).toString(), new web3.utils.BN(user1BalanceAfter).toString())

            })
            it('should give the user the amount he or she bet when a single character matches', async () => {
                // 한 글자 다 맞았을 때

                await lottery.setAnswerForTest('0xaba9c982d7d2a4c2afa7f351ea2cb48c0209605578f78110169e3f9eb6c652a7', {from : deployer}) // 32byte 맞춰야 해서 Hash

                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 1 -> 4
                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 2 -> 5
                await lottery.betAndDistribute('0xaf', {from : user1, value : betAmount}) // 3 -> 6 정답
                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 4 -> 7
                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 5 -> 8
                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 6 -> 9
                
                let potBefore = await lottery.getPot(); // 0.01ETH
                let user1BalanceBefore = await web3.eth.getBalance(user1);

                let receipt7 = await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 7 -> 10 user1에게 pot이 간다

                let potAfter = await lottery.getPot(); // 0.01ETH
                let user1BalanceAfter = await web3.eth.getBalance(user1); // before + 0.005ETH

                // pot의 변화량 확인
                // potBefore = potAfter
                assert.equal(potBefore.toString(), potAfter.toString());
                // assert.equal(potBefore, 0.01)

                // user(winner)의 밸런스 확인
                user1BalanceBefore = new web3.utils.BN(user1BalanceBefore)
                assert.equal(user1BalanceBefore.add(betAmountBN).toString(), new web3.utils.BN(user1BalanceAfter).toString())

            })
            it('should get the eth of user when the answer does not match at all', async () => {
                // 다 틀렸을 때

                await lottery.setAnswerForTest('0xaba9c982d7d2a4c2afa7f351ea2cb48c0209605578f78110169e3f9eb6c652a7', {from : deployer}) // 32byte 맞춰야 해서 Hash

                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 1 -> 4
                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 2 -> 5
                await lottery.betAndDistribute('0xef', {from : user1, value : betAmount}) // 3 -> 6 정답
                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 4 -> 7
                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 5 -> 8
                await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 6 -> 9
                
                let potBefore = await lottery.getPot(); // 0.01ETH
                let user1BalanceBefore = await web3.eth.getBalance(user1);

                let receipt7 = await lottery.betAndDistribute('0xef', {from : user2, value : betAmount}) // 7 -> 10 user1에게 pot이 간다

                let potAfter = await lottery.getPot(); // 0.015ETH
                let user1BalanceAfter = await web3.eth.getBalance(user1); // before + 0.005ETH

                // pot의 변화량 확인
                // potBefore = potAfter
                assert.equal(potBefore.add(betAmountBN).toString(), potAfter.toString());
                // assert.equal(potBefore, 0.01)

                // user(winner)의 밸런스 확인
                user1BalanceBefore = new web3.utils.BN(user1BalanceBefore)
                assert.equal(user1BalanceBefore.toString(), new web3.utils.BN(user1BalanceAfter).toString())
            })

        })

        // 혼자 해보기
        
        // describe('When the answer is not revealed(Not Mined)', funtion () {

        // })
        // describe('When the answer is not revealed(Block Limit is passed)', funtion () {

        // })
    })
    describe('isMatch', function () {
        let blockHash = '0xaba9c982d7d2a4c2afa7f351ea2cb48c0209605578f78110169e3f9eb6c652a7'

        it('should be BettingResult.win when two characters match', async () => {  
          let matchingResult = await lottery.isMatch('0xab', blockHash);
          assert.equal(matchingResult,1);
        })
        it('should be BettingResult.fail when two characters match', async () => {
            let matchingResult = await lottery.isMatch('0xcd', blockHash);
            assert.equal(matchingResult,0);
        })
        it('should be BettingResult.draw when two characters match', async () => {
            let matchingResult = await lottery.isMatch('0xaf', blockHash);
            assert.equal(matchingResult, 2);

            matchingResult = await lottery.isMatch('0xfb', blockHash);
            assert.equal(matchingResult, 2);
        })

        // it('should be BettingResult.Draw when two characters match', async () => {
        //     let matchingResult = await lottery.isMatch('0xaf', blockHash);
        //     assert.equal(matchingResult,2);

        //     matchingResult = await lottery.isMatch('0xfb', blockHash);
        //     assert.equal(matchingResult,2);
        // })
        
    })
});
// 10개의 account가 순서대로 들어옴