// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Lottery {
    struct BetInfo {
        uint256 answerBlockNumber;
        address payable bettor; // 돈 거래가 있기 때문에 payable
        bytes1 challenges; //0xab
    }

    uint256 private _tail;
    uint256 private _head;
    // 유저가 보낸 베팅 값을 저장하려면 QUEUE가 필요
    mapping(uint256 => BetInfo) private _bets; // 타일이 증가하면서 값을 넣어줌
    // 검증할 때는 0번부터
    address payable public owner;

    uint256 internal constant BLOCK_LIMIT = 256;
    uint256 internal constant BET_BLOCK_INTERVAL = 3; // +3
    uint256 internal constant BET_AMOUNT = 5 * 10**15; // 베팅 금액 고정

    uint256 private _pot; // 팟 머니 저장소
    bool private mode = false; // false : use answer for test, true : real block hash
    bytes32 public answerForTest;

    enum BlockStatus {
        Checkable,
        NotRevealed,
        BlockLimitPassed
    }
    enum BettingResult {
        fail,
        win,
        draw
    }
    event BET(
        uint256 index,
        address bettor,
        uint256 amount,
        bytes1 challenges,
        uint256 answerBlockNumber
    );
    event WIN(
        uint256 index,
        address bettor,
        uint256 amount,
        bytes1 challenges,
        bytes1 anwser,
        uint256 answerBlockNumber
    );
    event FAIL(
        uint256 index,
        address bettor,
        uint256 amount,
        bytes1 challenges,
        bytes1 anwser,
        uint256 answerBlockNumber
    );
    event DRAW(
        uint256 index,
        address bettor,
        uint256 amount,
        bytes1 challenges,
        bytes1 anwser,
        uint256 answerBlockNumber
    );
    event REFUND(
        uint256 index,
        address bettor,
        uint256 amount,
        bytes1 challenges,
        uint256 answerBlockNumber
    );

    // 몇 번째 베팅인지/ 누가 베팅했는지/ 얼마 베팅했는지/ 어떤 글자로 베팅했는지/ 어떤 블록에 베팅을 했는지

    constructor() public {
        owner = payable(msg.sender);
    }

    // 팟에 대한 겟터
    function getPot() public view returns (uint256 pot) {
        return _pot;
    }

    /*
     * @dev 베팅과 정답 체크를 한다 유저는 0.005ETH를 보내야 하고, 베팅은 1byte 글자를 보낸다
     * 큐에 저장된 베팅 정보는 이후 distribute 함수에서 해결된다
     * @param challenges 유저가 베팅하는 글자
     * @return 함수가 잘 수행되었는지 확인하는 bool 값
     */

    // 베팅하고 정답 체크를 한 번에 하는 함수
    function betAndDistribute(bytes1 challenges)
        public
        payable
        returns (bool result)
    {
        bet(challenges);
        distribute();
        return true;
    }

    /*
     * @dev 베팅을 한다 -> 유저는 0.005ETH를 보내야 하고. 베팅을 1byte 글자를 보낸다
     * 큐에 저장된 베팅 정보는 이후 distribute 함수에서 해결된다
     * @param challenges 유저가 베팅하는 글자
     * @return 함수가 잘 수행되었는지 확인하는 bool 값
     */
    function bet(bytes1 challenges) public payable returns (bool result) {
        // check the proper ether is sent
        require(msg.value == BET_AMOUNT, "Not enough ETH");
        // push bet to the queue
        require(pushBet(challenges), "Fail to add a new Bet Info");
        // emit event
        emit BET(
            _tail - 1,
            msg.sender,
            msg.value,
            challenges,
            block.number + BET_BLOCK_INTERVAL
        );
        // _tail 증가하기 전 값이 index -> -1하는 이유

        return true;
    }

    // save the bet to the queue

    /*
     * @dev 베팅 결과값을 확인하고 팟머니를 분배한다
     * 정답 실패 : 팟머니 축적, 정답 맞춤 : 팟머니 획득, 한 글자 맞춤 or 정답 확인 불가 : 베팅 금액만 획득
     */
    // Distribute
    function distribute() public {
        // head 3 4 5 6 7 8 9 10 ... tail

        uint256 cur;
        uint256 transferAmount;
        BetInfo memory b;
        BlockStatus currentBlockStatus;
        BettingResult currentBettingResult;

        // head부터 tail까지 도는 loop
        for (cur = _head; cur < _tail; cur++) {
            b = _bets[cur];
            currentBlockStatus = getBlockStatus(b.answerBlockNumber);
            // checkable : block.number > AnswerBlockNumber && block.number < BLOCK_LIMIT + AnswerBlockNumber
            if (currentBlockStatus == BlockStatus.Checkable) {
                bytes32 answerBlockHash = getAnswerBlockHash(
                    b.answerBlockNumber
                );
                currentBettingResult = isMatch(b.challenges, answerBlockHash);
                // if win, bettor gets pot
                if (currentBettingResult == BettingResult.win) {
                    // transfer pot
                    transferAmount = transferAfterPayingFee(
                        b.bettor,
                        _pot + BET_AMOUNT
                    );
                    // pot = 0
                    _pot = 0;
                    // emit WIN
                    emit WIN(
                        cur,
                        b.bettor,
                        transferAmount,
                        b.challenges,
                        answerBlockHash[0],
                        b.answerBlockNumber
                    );
                }
                // if fail, bettor's money gose pot
                if (currentBettingResult == BettingResult.fail) {
                    // pot = pot + BET_AMOUNT
                    _pot += BET_AMOUNT;
                    // emit FAIL
                    emit FAIL(
                        cur,
                        b.bettor,
                        0,
                        b.challenges,
                        answerBlockHash[0],
                        b.answerBlockNumber
                    );
                }
                // if draw, refund bettor's money
                if (currentBettingResult == BettingResult.draw) {
                    // transfer only BET_AMOUNT
                    transferAmount = transferAfterPayingFee(
                        b.bettor,
                        BET_AMOUNT
                    );
                    // emit DRAW
                    emit DRAW(
                        cur,
                        b.bettor,
                        transferAmount,
                        b.challenges,
                        answerBlockHash[0],
                        b.answerBlockNumber
                    );
                }
            }

            // Not Revealed : block.number <= AnswerBlockNumber
            // 블록 해쉬를 확인할 수 없을 때
            if (currentBlockStatus == BlockStatus.NotRevealed) {
                break;
            }

            // Block Limit Passed : block.number >= AnswerBlockNumber + BLOCK_LIMIT
            // 블록 제한이 지났을 때
            if (currentBlockStatus == BlockStatus.BlockLimitPassed) {
                // refund
                transferAmount = transferAfterPayingFee(b.bettor, BET_AMOUNT);
                // emit refund
                emit REFUND(
                    cur,
                    b.bettor,
                    transferAmount,
                    b.challenges,
                    b.answerBlockNumber
                );
            }
            popBet(cur);

            // check the answer
        }
        // queue에서 head가 점차 줄어야 하니까
        _head = cur;
    }

    function transferAfterPayingFee(address payable addr, uint256 amount)
        internal
        returns (uint256)
    {
        // uint256 fee = amount / 100;
        uint256 fee = 0;
        uint256 amountWithoutFee = amount - fee;

        // transfer to addr
        addr.transfer(amountWithoutFee);
        // transfer to owner
        owner.transfer(fee);

        // smart-contract에서 Eth를 조종(?)하는 것 3가지 : call, send. trasnfer

        return amountWithoutFee;
    }

    function setAnswerForTest(bytes32 answer) public returns (bool result) {
        require(
            msg.sender == owner,
            "Only owner can set the answer  for test mode"
        ); // 권한 설정
        answerForTest = answer;
        return true;
    }

    function getAnswerBlockHash(uint256 answerBlockNumber)
        internal
        view
        returns (bytes32 answer)
    {
        // return mode ? blockhash(answerBlockNumber) : answerForTest;
        return blockhash(answerBlockNumber);
    }

    /*
     * @dev 베팅글자와 정답을 확인한다
     * @param challenges 베팅 글자
     * @param answer 블록해쉬
     * @return 정답결과
     */
    function isMatch(bytes1 challenges, bytes32 answer)
        public
        pure
        returns (BettingResult)
    {
        // challenges 0xab
        // answer 0xab....ff 32byte
        // 이 두 가지에서 하나씩 뽑아서 비교

        bytes1 c1 = challenges;
        bytes1 c2 = challenges;

        bytes1 a1 = answer[0];
        bytes1 a2 = answer[0];

        // Get first number
        c1 = c1 >> 4; // 0xab -> 0x0a
        c1 = c1 << 4; // 0xab -> 0xa0

        a1 = a1 >> 4;
        a1 = a1 << 4;

        // Get Second number
        c2 = c2 << 4; // 0xab -> 0xb0
        c2 = c2 >> 4; // 0xab -> 0x0b

        a2 = a2 << 4;
        a2 = a2 >> 4;

        if (a1 == c1 && a2 == c2) {
            return BettingResult.win;
        }
        if (a1 == c1 || a2 == c2) {
            return BettingResult.draw;
        }
        return BettingResult.fail;
    }

    function getBlockStatus(uint256 answerBlockNumber)
        internal
        view
        returns (BlockStatus)
    {
        if (
            block.number > answerBlockNumber &&
            block.number < BLOCK_LIMIT + answerBlockNumber
        ) {
            return BlockStatus.Checkable;
        }
        if (block.number <= answerBlockNumber) {
            return BlockStatus.NotRevealed;
        }
        if (block.number >= answerBlockNumber + BLOCK_LIMIT) {
            return BlockStatus.BlockLimitPassed;
        }
        return BlockStatus.BlockLimitPassed;
    }

    function getBetInfo(uint256 index)
        public
        view
        returns (
            uint256 answerBlockNumber,
            address bettor,
            bytes1 challenges
        )
    {
        BetInfo memory b = _bets[index];
        answerBlockNumber = b.answerBlockNumber;
        bettor = b.bettor;
        challenges = b.challenges;
    }

    // queue -> push / pop

    function pushBet(bytes1 challenges) internal returns (bool) {
        BetInfo memory b;
        b.bettor = payable(msg.sender); // 20byte
        b.answerBlockNumber = block.number + BET_BLOCK_INTERVAL; // 32byte -> 20000gas
        b.challenges = challenges; // byte -> 위의 20byte랑 합쳐서 그냥 20000gas

        _bets[_tail] = b;
        _tail++; // 32byte -> 20000gas -> 5000gas

        // 60000gas

        return true;
    }

    // pop은 값을 초기화
    function popBet(uint256 index) internal returns (bool) {
        delete _bets[index];
        return true;
    }
}
