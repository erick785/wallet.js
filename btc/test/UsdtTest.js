import * as functions from '../src/BtcModule';
import * as bitcoin from 'bitcoinjs-lib';

describe('usdt', () => {
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

    it('generate usdt transaction and sign', () => {
        const ins = [{txHash: '549a51c59c9718ab40a789499b4dafbb3dc9c1898dd03cef9d872ad1d9b80d77', vout: 1}];

        const amount = btc.toPaddedHexString(Math.floor(1 * 1e7), 16);
        const simpleSend = [
            '6f6d6e69', // omni
            '0000', // version
            '00000000001f', // 31 for Tether
            amount // amount = 1 * 10 000 000 in HEX
        ].join('');

        const data = [Buffer.from(simpleSend, 'hex')]; // NEW** data must be an Array(Buffer)

        const omniOutput = bitcoin.payments.embed({data}).output; // NEW** Payments API

        const outs = [
            {scriptPubKey: multiAddr, value: 546},
            {scriptPubKey: omniOutput, value: 0},
            {scriptPubKey: addrs[0], value: 8 * 1e3}
        ];

        const keyPairs = [{wif: wifs[0], inputIndex: 0}];

        const txb = btc.genTransaction(ins, outs);

        const txHex = btc.signTransaction(txb, keyPairs);

        expect(txHex).toStrictEqual(
            '0100000001770db8d9d12a879def3cd08d89c1c93dbbaf4d9b4989a740ab18979cc5519a54010000006b483045022100bd67a46443a4260683af05bf5df8a0a92680836484236f54bcaeb78d1fa8f0fa02201cc89ba0919b4a314cf0c7e8a24309e5928eab716b7e8d9e74904b49d34b26c3012102c2d1fd9f2beeef8516c89fa62ad973b105773468b5d06e117e63d227aa2a051affffffff03220200000000000017a914898d581c9e0fb73e7dd0ca4e8daec6d6c26486f9870000000000000000166a146f6d6e69000000000000001f0000000000989680401f0000000000001976a914ce75fbbbc90e56422e54469a51288cc539a593c188ac00000000'
        );
    });

    it('generate usdt multi sign transaction', () => {
        const multiIns = [
            {txHash: '072f9c512cab0929ef3a17a346a23a6a6f9df7635a80c76b3248cbc5c58c1f32', vout: 0},
            {txHash: '549a51c59c9718ab40a789499b4dafbb3dc9c1898dd03cef9d872ad1d9b80d77', vout: 0}
        ];
        const amount = btc.toPaddedHexString(Math.floor(1 * 1e7), 16);
        const simpleSend = [
            '6f6d6e69', // omni
            '0000', // version
            '00000000001f', // 31 for Tether
            amount // amount = 1 * 10 000 000 in HEX
        ].join('');

        const data = [Buffer.from(simpleSend, 'hex')]; // NEW** data must be an Array(Buffer)
        const omniOutput = bitcoin.payments.embed({data}).output; // NEW** Payments API

        const multiOuts = [
            {scriptPubKey: addrs[0], value: 546},
            {scriptPubKey: omniOutput, value: 0}
        ];

        const keyPairs = [
            {wif: wifs[0], inputIndex: 0, redeemScript: multiScript},
            {wif: wifs[0], inputIndex: 1, redeemScript: multiScript},
            {wif: wifs[1], inputIndex: 0, redeemScript: multiScript},
            {wif: wifs[1], inputIndex: 1, redeemScript: multiScript}
        ];

        // 构建交易
        let txb = btc.genTransaction(multiIns, multiOuts);

        // 轮流签名第一个人
        txb = btc.multiSignTransaction(txb, [keyPairs[0], keyPairs[1]], false);
        // 轮流签名第二个人
        txb = btc.multiSignTransaction(txb, [keyPairs[2], keyPairs[3]], true);

        expect(txb).toStrictEqual(
            '0100000002321f8cc5c5cb48326bc7805a63f79d6f6a3aa246a3173aef2909ab2c519c2f0700000000fdfe0000483045022100c25d510aecc79c9febd5cf140065322b993e47b07f27e717d40707608398e40b02204d6962eacb40dc914bcbd3cbce544a0d9d4a9edf5fbb7bd09c68298915e4abfc01483045022100a9ff7ea741e1de3e468f179bda38db077f85546ce9cd4e46c98fc76ca7fbad4e0220022dbb0202c68ada2f02a88fb63f57e9f790bd0a903523b4b4ba64af4f55c9c1014c69522102c2d1fd9f2beeef8516c89fa62ad973b105773468b5d06e117e63d227aa2a051a2102ffedaa1ab2c5475ce41e0bf84419ec7fcd90a78ea9ec76a41663d38ed20bf45221024d20355b46c3a3fe9c4fb66c07394d0c38ee669e9815b5779b4124ed426a6a7053aeffffffff770db8d9d12a879def3cd08d89c1c93dbbaf4d9b4989a740ab18979cc5519a5400000000fc00473044022060985b3d66275efd0fe4d90b245c57e8b5ce1ddcc1712bb02508e5fd6864f3d0022010ce0c044805d87f57a7802c060819947c6e4d0eba7bec550e31cc3d55557abd014730440220164425751e3283983cacd76eb21ad3e730452471ebd43f33440b14747d653d2b02202ffcfdb882ecae61416c8136614049e93b953e7aeef0064b660b128d908f9e05014c69522102c2d1fd9f2beeef8516c89fa62ad973b105773468b5d06e117e63d227aa2a051a2102ffedaa1ab2c5475ce41e0bf84419ec7fcd90a78ea9ec76a41663d38ed20bf45221024d20355b46c3a3fe9c4fb66c07394d0c38ee669e9815b5779b4124ed426a6a7053aeffffffff0222020000000000001976a914ce75fbbbc90e56422e54469a51288cc539a593c188ac0000000000000000166a146f6d6e69000000000000001f000000000098968000000000'
        );
    });
});
