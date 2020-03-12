import * as functions from '../src/BtcModule';

describe('btc', () => {
    let btc;

    const wifs = [
        'KzbSeQ3Sqwa4h27Adj3qszScuKbGd8MToLYbooxuB5Ap3UxJUUoB',
        'L4CNGxLqkbbtkHBLMSYwM1xkKc3ScFHPoq8qtge7v9XY6H6DuJMD',
        'L5a37bqD1q8ABiJ57M9JNPuy5m4ErDf1YLc9ZtAj2KhwXaoTmiiJ'
    ];

    const addrs = [
        '1KpfY9HVx5y9p9QCinevZKWXZycxK9UrKd',
        '1qp9Gy2WGCFLQfhjLLDnVuRSGnuy8tmgn',
        '15GsnbVfahqeH7hTL8YwkFApNujKo8vdjS'
    ];

    const multiAddr = '3EEKpbDe2iUz1H2CmShhJFydBV3e9viF8Q';
    const multiScript =
        '522102c2d1fd9f2beeef8516c89fa62ad973b105773468b5d06e117e63d227aa2a051a2102ffedaa1ab2c5475ce41e0bf84419ec7fcd90a78ea9ec76a41663d38ed20bf45221024d20355b46c3a3fe9c4fb66c07394d0c38ee669e9815b5779b4124ed426a6a7053ae';

    beforeEach(() => {
        btc = new functions.Btc();
    });

    it('generate btc account', () => {
        const {mnemonic, path, wif, address} = btc.genAccount();

        console.log('mnemonic--->', mnemonic);
        console.log('path--->', path);
        console.log('wif--->', wif);
        console.log('address--->', address);

        // 根据助记词返回私钥
        const result = btc.genAccount(mnemonic);
        expect(mnemonic).toStrictEqual(result.mnemonic);
        expect(path).toStrictEqual(result.path);
        expect(wif).toStrictEqual(result.wif);
        expect(address).toStrictEqual(result.address);
    });

    it('generate multi address', () => {
        const {address, redeemscript} = btc.genMultiAddress(2, 3, wifs);

        expect(address).toStrictEqual(multiAddr);
        expect(redeemscript).toStrictEqual(multiScript);
    });

    it('generate btc transaction and sign', () => {
        const ins = [
            {
                // txHash UTXO交易hash
                txHash: 'ba850540254378c3a6bad35d24ede8ce438b0e9dce4834f154962f153c8c8dc4',
                // vout UTXO交易输出索引
                vout: 0
            },
            {txHash: '6a3ef4df181dc869dbcf622e1da32514fbd4fbaa56f85f0420439f2991369c7a', vout: 0},
            {txHash: 'a45125567e8d58972b275b4d6ea90d299262f337221b5b05ebd049e4d441c480', vout: 0},
            {txHash: '5fa4b3a75d0569ee3e3499de5df5b882002335a752c9bde49e341500609e66ff', vout: 0},
            {txHash: '4bb0743fe3f491d1c14267a33623208d954b2829043ca3eb9fbca4732a63bf2a', vout: 0},
            {txHash: '6da43e4707e3b223741bd21a5fe6c7d97088dd9792a9d49f0523264f63328e88', vout: 0},
            {txHash: '2e16dd3b05c7ce3544db3e9bf3d41ec22bf07a5fc3385ab03de798fe88051d44', vout: 0}
        ];
        const outs = [
            {
                // scriptPubKey 收款地址
                scriptPubKey: addrs[0],
                // value 收款金额
                value: 499999 * 1e4
            },
            {scriptPubKey: addrs[1], value: 2 * 50 * 1e8},
            {scriptPubKey: addrs[2], value: 2 * 50 * 1e8},
            {scriptPubKey: multiAddr, value: 2 * 50 * 1e8}
        ];

        // 用一个私钥对所有的input进行签名
        const keyPairs = [
            {
                // wif 私钥
                wif: wifs[0],
                // inputIndex UTXO交易输出索引
                inputIndex: 0
            },
            {wif: wifs[0], inputIndex: 1},
            {wif: wifs[0], inputIndex: 2},
            {wif: wifs[0], inputIndex: 3},
            {wif: wifs[0], inputIndex: 4},
            {wif: wifs[0], inputIndex: 5},
            {wif: wifs[0], inputIndex: 6}
        ];

        const txb = btc.genTransaction(ins, outs);

        const txHex = btc.signTransaction(txb, keyPairs);

        expect(txHex).toStrictEqual(
            '0100000007c48d8c3c152f9654f13448ce9d0e8b43cee8ed245dd3baa6c3784325400585ba000000006b483045022100aecf691b4ca991e27787977163f5903e940cdf6378346a31bd1faf3787ba286402200f3854ec7971b39e9ee99164e476f8d0aa10437830d96028f5d390593420bd54012102c2d1fd9f2beeef8516c89fa62ad973b105773468b5d06e117e63d227aa2a051affffffff7a9c3691299f4320045ff856aafbd4fb1425a31d2e62cfdb69c81d18dff43e6a000000006a47304402202aabef0c371bb61624badeb00da9e47b3fe566a84a9c248ef2748859760d2f2a02200a2ed274ca621a42a2ca483868d4a7c4dae80026f60e381457a175a5906ebbb9012102c2d1fd9f2beeef8516c89fa62ad973b105773468b5d06e117e63d227aa2a051affffffff80c441d4e449d0eb055b1b2237f36292290da96e4d5b272b97588d7e562551a4000000006b483045022100c37ccc895fde3a1bb5ac830656234c59d164a269f6e1d78c94fde679dcb75c87022003ff70693d083e2e8cfd47a0577aea780482ab999d99b46bd3ab5cb511e26732012102c2d1fd9f2beeef8516c89fa62ad973b105773468b5d06e117e63d227aa2a051affffffffff669e600015349ee4bdc952a735230082b8f55dde99343eee69055da7b3a45f000000006a47304402206f391c83d10e3a62bc80aaeb431370690b36fad1be8cbbf37f68af4e1ab8bcf602205558686839b6c5ff58697ea20449c8b1aa9ff49e99ad0dddc7e069e6e4e4bb64012102c2d1fd9f2beeef8516c89fa62ad973b105773468b5d06e117e63d227aa2a051affffffff2abf632a73a4bc9feba33c0429284b958d202336a36742c1d191f4e33f74b04b000000006b4830450221008233229ebd19c89ed75a0f3b2195b8e68326e41487dc203bf13143e5784b544c022010ed903c58ef06c772656a41569742547bccbeb35d0756baeea78783913fa501012102c2d1fd9f2beeef8516c89fa62ad973b105773468b5d06e117e63d227aa2a051affffffff888e32634f2623059fd4a99297dd8870d9c7e65f1ad21b7423b2e307473ea46d000000006a4730440220291aff21ca837d0b09d6aff36e0eec7d592d4951440dce9e62943deeebea640a02204fbe7baa125714bac83db43090e8efa50c34851d0c684ffa9ea8fa17b91ae514012102c2d1fd9f2beeef8516c89fa62ad973b105773468b5d06e117e63d227aa2a051affffffff441d0588fe98e73db05a38c35f7af02bc21ed4f39b3edb4435cec7053bdd162e000000006b483045022100ae4c18eccbf20584c23ea5cfd4cf7b63d051fc197c3d92dbb18e7c42d4c5f04c022043e6629f4984e79f149a48665832c4312bda0625153dcbca8691c220deab83ff012102c2d1fd9f2beeef8516c89fa62ad973b105773468b5d06e117e63d227aa2a051affffffff04f0ca052a010000001976a914ce75fbbbc90e56422e54469a51288cc539a593c188ac00e40b54020000001976a914093b51a2d6fdd7c9009a4e9a261f2f8adaab38f988ac00e40b54020000001976a9142ee122fd3d6b6fa9ed6650a37d3e3b9dc295d3e488ac00e40b540200000017a914898d581c9e0fb73e7dd0ca4e8daec6d6c26486f98700000000'
        );
    });

    it('generate btc multi sign transaction', () => {
        const multiIns = [{txHash: 'b603566a015bdec183c2d45c5c778ecf3b98ed924f16303b7f6b0e5951044641', vout: 3}];

        const multiOuts = [
            {scriptPubKey: addrs[0], value: 10 * 1e8},
            {scriptPubKey: addrs[1], value: 10 * 1e8},
            {scriptPubKey: addrs[2], value: 10 * 1e8},
            {scriptPubKey: multiAddr, value: 699999 * 1e4}
        ];

        // 因为我们可支配者个数m为2，所以keyPairs的个数必须两个不同的私钥
        const keyPairs = [
            {
                // wif 私钥
                wif: wifs[0],
                // inputIndex UTXO交易输出索引
                inputIndex: 0,
                // redeemScript 多重签名地址的赎回脚本
                redeemScript: multiScript
            },
            {wif: wifs[1], inputIndex: 0, redeemScript: multiScript}
        ];

        const txb = btc.genTransaction(multiIns, multiOuts);

        const txHex = btc.multiSignTransaction(txb, keyPairs);

        expect(txHex).toStrictEqual(
            '010000000141460451590e6b7f3b30164f92ed983bcf8e775c5cd4c283c1de5b016a5603b603000000fdfe0000483045022100c6ebb48641a6cf15a2a5a66098d1ad965e129fe2aaa925c8ed168baa7aced404022056da1dd06e129500df46b981112827dcd9252acb09430d24c14a189eaf587c6f01483045022100b568e635747346ceb2e183d98bcaabf8738bc8f5e996bfc117f5735cb7b523b602205f0265a5b3f084342469ea0f077cdf345cfbd2fe2ee6a84f593349ee760fc288014c69522102c2d1fd9f2beeef8516c89fa62ad973b105773468b5d06e117e63d227aa2a051a2102ffedaa1ab2c5475ce41e0bf84419ec7fcd90a78ea9ec76a41663d38ed20bf45221024d20355b46c3a3fe9c4fb66c07394d0c38ee669e9815b5779b4124ed426a6a7053aeffffffff0400ca9a3b000000001976a914ce75fbbbc90e56422e54469a51288cc539a593c188ac00ca9a3b000000001976a914093b51a2d6fdd7c9009a4e9a261f2f8adaab38f988ac00ca9a3b000000001976a9142ee122fd3d6b6fa9ed6650a37d3e3b9dc295d3e488acf05e3ba10100000017a914898d581c9e0fb73e7dd0ca4e8daec6d6c26486f98700000000'
        );
    });
});
