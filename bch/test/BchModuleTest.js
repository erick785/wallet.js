import * as functions from '../src/BchModule';

describe('bch', () => {
    let bch;

    const wifs = [
        'L1cWxFStkGaj4Mtup5pwbYgXphSTPyw63fWvu7wwxg7kMvDydqgZ',
        'KzZQBJV7713MHdg9dJgo71vMM4VojcvPVsxxgABuFtHTuaBMQihS',
        'KxHCdNpgrUn47UuerzStLsypUkhdMWHFrT6R59hM1dv79uwe9cYH'
    ];

    const addrs = [
        '1NBALpmYotCQA6UMFuqr3QgvQQRUekqMw4',
        '1BY4cmXfik2kmTbYqCu6Unv6CPNqhZtfUd',
        '1ZsFrU49mGv3nRq2MwgGRbuRVk4FKkEVq'
    ];
    const m = 2;
    const n = 3;
    const multiAddr = '33xeagvCMLoVNm9baqKXpKbzV68NKRL2pC';
    const multiScript =
        '5221021ca76773fa079656753ea1c7995479eb9392278eb6de305a592730012eecea17210232aba245b7468d8525385ab8f5267cadf10db0f0b34503f1e642849d6f7a58852102bd5c322419646ae10a01090fbf0ad52e698b0ee9c02df93566f651cdc244912553ae';

    let pubs = [];

    beforeEach(() => {
        bch = new functions.Bch();
    });

    it('generate bch account', () => {
        const {mnemonic, path, wif, address} = bch.genAccount();

        console.log('mnemonic--->', mnemonic);
        console.log('path--->', path);
        console.log('wif--->', wif);
        console.log('address--->', address);
    });

    it('generate bch multi address', () => {
        const {address, redeemscript, pubKeys} = bch.genMultiAddress(m, n, wifs);
        // console.log('pubKeys--->', pubKeys);
        pubs = pubKeys;
        expect(address).toStrictEqual(multiAddr);
        expect(redeemscript).toStrictEqual(multiScript);
    });

    it('generate bch transaction and sign', () => {
        const ins = [
            {txHash: '217e8a153306ace6bf511113f95c3397ee0c00d11adc470da8d583622543785e', vout: 1, value: 199 * 1e4}
        ];
        const outs = [
            {scriptPubKey: addrs[0], value: 196 * 1e4},
            {scriptPubKey: multiAddr, value: 2 * 1e4}
        ];

        const txHex = bch.genTransactionAndSign(ins, outs, wifs[0]);

        expect(txHex).toStrictEqual(
            '01000000015e7843256283d5a80d47dc1ad1000cee97335cf9131151bfe6ac0633158a7e21010000006a47304402202cee8ad5a268a1e3402b911c73794c97f734e52385c9dad1d103f33abb0450380220162f50fae70f09eba5a29e0c11d3a554be0009a09e717ecfab967cfe20298ddd4121021ca76773fa079656753ea1c7995479eb9392278eb6de305a592730012eecea17ffffffff0240e81d00000000001976a914e8469965a8f1834062125cd2ebc7a3c32f059fe788ac204e00000000000017a91418e5175e49d9bc55aa2176fc5ea0fd8f93e803e48700000000'
        );
    });

    it('generate bch multi sign transaction', () => {
        const multiIns = [
            {txHash: '7d27ca5f04eabdb72512d57134324aad1c14dff6c5cebbef709e98ce32362b34', vout: 1, value: 2 * 1e4}
        ];

        const multiOuts = [{scriptPubKey: addrs[0], value: 1 * 1e4}];

        const txHex = bch.genTransactionAndMultiSign(multiIns, multiOuts, multiAddr, m, pubs, [wifs[0], wifs[1]]);

        expect(txHex).toStrictEqual(
            '0100000001342b3632ce989e70efbbcec5f6df141cad4a323471d51225b7bdea045fca277d01000000fdfd0000483045022100beb52a058ce142ec1366954e386b9164282ce5dd00797df2e5cddcef2a887d510220143a2348524645865bdc818a97a4bedb6ab6363bf129686851b0e00c80947412414730440220703d6fc6f0dff5931ec13f8260a42c8080ed9dc587917100b89f5bad9090661f0220587b8d3c620710e90d7c2596ba83d8a863141bfa89edde4709b9a028a75edb18414c695221021ca76773fa079656753ea1c7995479eb9392278eb6de305a592730012eecea17210232aba245b7468d8525385ab8f5267cadf10db0f0b34503f1e642849d6f7a58852102bd5c322419646ae10a01090fbf0ad52e698b0ee9c02df93566f651cdc244912553aeffffffff0110270000000000001976a914e8469965a8f1834062125cd2ebc7a3c32f059fe788ac00000000'
        );
    });
});
