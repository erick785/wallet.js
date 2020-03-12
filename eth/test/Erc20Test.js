import * as functions from '../src/EthModule';

describe('usdt', () => {
    let eth;

    beforeEach(() => {
        eth = new functions.Eth();
    });

    it('generate erc20 transaction', () => {
        const txData = {
            nonce: '0x01',
            gasPrice: '0x2540be400',
            gasLimit: '0x15f90',
            value: '0x0',
            to: '0xe86fdcc4a93c476b8bbc03a80868fa42f6c9919e'
        };

        const to = '0x2e8f5CDdCA94A2199300326508318b05c3194967';
        const value = '100000000000000000000';
        const privateKey = '0xe441324e86450e148d4884dff4148bf4b881568e4bb1dd079a8fca4cf75a89cc';

        let ethTx = eth.genErc20Transaction(txData, to, value);

        const {rawTransaction, transactionHash} = eth.signTransaction(ethTx, privateKey);

        expect(rawTransaction).toStrictEqual(
            '0xf8aa018502540be40083015f9094e86fdcc4a93c476b8bbc03a80868fa42f6c9919e80b844a9059cbb0000000000000000000000002e8f5cddca94a2199300326508318b05c31949670000000000000000000000000000000000000000000000056bc75e2d6310000026a0964eb02005b03026b008b9bd95aeff86c9f70ae21589e4866557f050db7640d3a063bfd08224c5a094e2194bd9a8cb321647812f61208ff565e858bdcc513972ad'
        );
        expect(transactionHash).toStrictEqual('0x4808873aef37ec42fb18dc72d638192090f5232c36bd5c59f7822d690f483dd6');
    });

    it('generate multi sign erc20 transaction', () => {
        const privateKeys = [
            '0xe441324e86450e148d4884dff4148bf4b881568e4bb1dd079a8fca4cf75a89cc',
            '0x36de9937f678c2d00c0c24070b301ac4ddd00bd06913da3a02608965097a72ac',
            '0x11857321c5fba7c2101011590618166fcd145f4755c40caca85a884de3d73f52'
        ];

        const addrs = [
            '0xeB4F3CBd1999B8E9369886335bbb6Cf3Caebad95',
            '0x2e8f5CDdCA94A2199300326508318b05c3194967',
            '0x167256c6aF0aB356964E02d1C0aeB954327aE7bD'
        ];

        let txData = {
            nonce: '0x02',
            gasPrice: '0x2540be400',
            gasLimit: '0x895440',
            value: '0x0'
        };

        const m = 2;

        const {multiAddr} = eth.multiAccountTx(privateKeys[0], txData, m, addrs);

        txData = {
            nonce: '0x04',
            gasPrice: '0x2540be400',
            gasLimit: '0xdbba0',
            value: '0x0'
        };
        const multiNonce = 0;
        const to = '0x167256c6aF0aB356964E02d1C0aeB954327aE7bD';
        const value = '1000000000000000000';
        const token = '0xE86fdcC4A93c476B8BbC03a80868fa42F6c9919E';

        // 生成大家都需要签名的message hash
        const signMessage = eth.genMultiSignTxPayloadSignMessage(to, value, multiNonce, multiAddr);

        // 每一个用户对这个hash轮流签名
        let sigs = [];
        for (let i = 0; i < privateKeys.length; i++) {
            const sig = eth.signMultiSignTxPayload(signMessage, privateKeys[i]);
            sigs.push(sig);
        }

        // 组装erc20多签名交易
        let ethTx = eth.genERC20MultiSignTx(to, value, multiAddr, token, txData, sigs);

        // 发送者签名rc20多签名交易
        const {rawTransaction, transactionHash} = eth.signTransaction(ethTx, privateKeys[0]);

        expect(rawTransaction).toStrictEqual(
            '0xf902ab048502540be400830dbba09470412138ffa6f7efcf21e7e968caeb6d4c4c96df80b9024401173672000000000000000000000000167256c6af0ab356964e02d1c0aeb954327ae7bd000000000000000000000000e86fdcc4a93c476b8bbc03a80868fa42f6c9919e0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000359fd521ddd4cd8582dd4562204702f8640a3f589895a478dfa89cf13b730ee13160588d2bfe47b73ef0c250488f657ba38b5f629e8349233c890ea0c214455b1eb9aafdde402b73363ccf418a787ff0131d7ff1d35969c73f27104898d4f355400000000000000000000000000000000000000000000000000000000000000037eabf3b8d46548078e4280bfea2b63f8d8f6ae2bca317938c975d40cdeb0bcda1a9dc8090c0e7acae35e682dc016ec35adcbeea9f0046677699f653f577a6f086332f0f146cb51c2b232e3a3bbae780925ca6a97316439a1f45ccf89a200446425a0eb06d5c2463337aa714279bfa23242af6af3c97a4c419bdda8fced4de3add875a07b68cd755b916ab9e9dca33d95f042a1ceb7f71d77aa7856ded243d7679e18cf'
        );
        expect(transactionHash).toStrictEqual('0x1ce9e3139dbbdda3981f185810585f9f5acc60f87b857548fd310e3a1832d219');
    });
});
