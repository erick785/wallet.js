import * as functions from '../src/LtcModule';

describe('ltc', () => {
    let ltc;

    const wifs = [
        'TBVQCdCLmZwKFdCEh9CGyo6HEGf9vhzA7r38ZLRoyZeH9ob5t25K',
        'T8edrD6mG1MT8bJFJoxk4H9Feftfb5SY8Ngn9PrfenEopW54KHre',
        'T63JDWEzpnR9pryzjYeFGPDuDCn7N2QZLDh6aZbrWP16uRd5h3iv'
    ];

    const addrs = [
        'LghMW11mGFRLXwTX6gmZ7t3PPrQsoP5MGd',
        'LKzwLbUaa7zGyVs15tUguux67w3cF2GCuc',
        'LhFg5rCvTsyQk262P241V7NrYoSc9f4iFi'
    ];

    const multiAddr = 'MBvcZozszZpQLhhWzvpzRC9D6GvNk8Yypq';
    const multiScript =
        '522102f2f1da2e037f3f0da44450c47279dacdd416323136f02421628be369e5510f602102572571ca836857fdecd6e9bf58b203abb62c25b8544ba4a09a5e815783c3274d21029aa5d8dab17d7b787835e037ad1ab3b1d5d6ab1e085db120ba62f1c475a6c76c53ae';

    beforeEach(() => {
        ltc = new functions.Ltc();
    });

    it('generate ltc account', () => {
        const {mnemonic, path, wif, address} = ltc.genAccount();

        console.log('mnemonic--->', mnemonic);
        console.log('path--->', path);
        console.log('wif--->', wif);
        console.log('address--->', address);

        // 根据助记词返回私钥
        const result = ltc.genAccount(mnemonic);
        expect(mnemonic).toStrictEqual(result.mnemonic);
        expect(path).toStrictEqual(result.path);
        expect(wif).toStrictEqual(result.wif);
        expect(address).toStrictEqual(result.address);
    });

    it('generate ltc multi address', () => {
        const {address, redeemscript} = ltc.genMultiAddress(2, 3, wifs);
        expect(address).toStrictEqual(multiAddr);
        expect(redeemscript).toStrictEqual(multiScript);
    });

    it('generate ltc transaction and sign 1', () => {
        const ins = [{txHash: '607203d5de68a62df3aa69184dde861470ca96a2536b5079659a963352278a4f', vout: 0}];
        const outs = [{scriptPubKey: addrs[1], value: 1 * 1e7}];

        const keyPairs = [{wif: wifs[0], inputIndex: 0}];

        const txb = ltc.genTransaction(ins, outs);

        const txHex = ltc.signTransaction(txb, keyPairs);

        expect(txHex).toStrictEqual(
            '01000000014f8a275233969a6579506b53a296ca701486de4d1869aaf32da668ded5037260000000006a473044022045ca4f6340c7c499d7c289bd8e08f7f566007596597c01680d18ee5bbf5d9efe02203c05b0b7fc6314a85a40a6728cb28889aa3bf0d5b7258b169848fafec0ff905c012102f2f1da2e037f3f0da44450c47279dacdd416323136f02421628be369e5510f60ffffffff0180969800000000001976a9140881f253ea93060c9bceefce9496174d782473c788ac00000000'
        );
    });

    it('generate ltc transaction and sign 2', () => {
        const ins = [{txHash: '71adf023d5b3f9a017f1e2234371b779b4ce1e1f8b1d1c41f411bf0279aac504', vout: 0}];
        const outs = [
            {scriptPubKey: addrs[1], value: 97 * 1e5},
            {scriptPubKey: multiAddr, value: 2 * 1e5}
        ];

        const keyPairs = [{wif: wifs[1], inputIndex: 0}];

        const txb = ltc.genTransaction(ins, outs);

        const txHex = ltc.signTransaction(txb, keyPairs);

        expect(txHex).toStrictEqual(
            '010000000104c5aa7902bf11f4411c1d8b1f1eceb479b7714323e2f117a0f9b3d523f0ad71000000006a47304402200a4fed8c5d74e1b9f255399c8eb7a7b2e61f5636a22cb71bdde5a7bbcb55a3e80220456edbc7043a2f2d8b88896522f04a77a0584d9a667d56f2bfb668c5f91c0953012102572571ca836857fdecd6e9bf58b203abb62c25b8544ba4a09a5e815783c3274dffffffff02a0029400000000001976a9140881f253ea93060c9bceefce9496174d782473c788ac400d03000000000017a9142c26e6d88b4b137f8110cfefb5288edaf0ad66458700000000'
        );
    });

    it('generate ltc multi sign transaction ', () => {
        const ins = [{txHash: '294ba1b73beddaae5d13a45fb3b842e22067d86f56def23f43365aaa5a47d6ac', vout: 1}];
        const outs = [{scriptPubKey: addrs[1], value: 1 * 1e5}];

        const keyPairs = [
            {wif: wifs[0], inputIndex: 0, redeemScript: multiScript},
            {wif: wifs[1], inputIndex: 0, redeemScript: multiScript}
        ];

        const txb = ltc.genTransaction(ins, outs);

        const txHex = ltc.multiSignTransaction(txb, keyPairs);

        expect(txHex).toStrictEqual(
            '0100000001acd6475aaa5a36433ff2de566fd86720e242b8b35fa4135daedaed3bb7a14b2901000000fdfe0000483045022100a37846068c02246b302e374066d1c9b9bb56317bcbd23a4ee517ebf1bf787e2b022067e715003822ad7cb0a7912c18de02a0710c96e80122138aca04a894f4f8164a01483045022100b42f4e152c8d40c057d678e3847824d4335dd0e8c011f77efce39162a20e9b31022003aee5c45b332609d4b807ac1269be86cca66b0cacac21263129ee4df3cc428c014c69522102f2f1da2e037f3f0da44450c47279dacdd416323136f02421628be369e5510f602102572571ca836857fdecd6e9bf58b203abb62c25b8544ba4a09a5e815783c3274d21029aa5d8dab17d7b787835e037ad1ab3b1d5d6ab1e085db120ba62f1c475a6c76c53aeffffffff01a0860100000000001976a9140881f253ea93060c9bceefce9496174d782473c788ac00000000'
        );
    });

    it('generate ltc  sign transaction 3', () => {
        const multiIns = [
            {txHash: '294ba1b73beddaae5d13a45fb3b842e22067d86f56def23f43365aaa5a47d6ac', vout: 0},
            {txHash: 'e78b0687865e72471d0e062fd33460de231e5a75a6e6b7953da87d100fbd2892', vout: 0}
        ];

        const multiOuts = [{scriptPubKey: 'LcYkwqtjEvbSkJw5hKxfR8THB3Zu31Ahi3', value: 97 * 1e5}];

        const keyPairs = [
            {wif: wifs[1], inputIndex: 0},
            {wif: wifs[1], inputIndex: 1}
        ];

        const txb = ltc.genTransaction(multiIns, multiOuts);

        const txHex = ltc.signTransaction(txb, keyPairs);

        expect(txHex).toStrictEqual(
            '0100000002acd6475aaa5a36433ff2de566fd86720e242b8b35fa4135daedaed3bb7a14b29000000006a473044022051fbc3731a619c35c50b22cb31b76ec6be22502d3580443e013981a8035f9127022008b1a6713454152d7b07756e1f0e84bfc6d4ba5c194cb496770a436f153fc50a012102572571ca836857fdecd6e9bf58b203abb62c25b8544ba4a09a5e815783c3274dffffffff9228bd0f107da83d95b7e6a6755a1e23de6034d32f060e1d47725e8687068be7000000006a47304402206f23f624f55be9af2b824c876d8aa82bbd06c230e34bc24ffc4f94bbe37ed6ef02205fea71fffee86dc5dcda93c4630bc7eb807fa56bbcae2ce3c894536afab61ebf012102572571ca836857fdecd6e9bf58b203abb62c25b8544ba4a09a5e815783c3274dffffffff01a0029400000000001976a914be08984a4be5c4e501f72754e43687b53990a50788ac00000000'
        );
    });
});
