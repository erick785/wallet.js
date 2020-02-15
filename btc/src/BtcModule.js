import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import * as bip32 from 'bip32';

export default class BtcModule {
    constructor() {
        this.option = {};
    }

    /**
     * 根据公钥生成P2PKH地址, 支持压缩、非压缩公钥
     * @param {Number} strength 默认 128
     * @param {String} path 分层确定性路径，默认使用BIP44路径 "m/44'/0'/0'/0/0"
     *
     * @returns {Promise<{mnemonic, path, wif, address}>}
     */

    genAccount(strength, path) {
        strength = strength || 128;
        path = path || "m/44'/0'/0'/0/0";

        const mnemonic = bip39.generateMnemonic(strength);
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const root = bip32.fromSeed(seed);
        const child = root.derivePath(path);
        const privateKey = child.privateKey;
        const {address} = bitcoin.payments.p2pkh({pubkey: child.publicKey});
        const wif = bitcoin.ECPair.fromPrivateKey(privateKey).toWIF();

        return {mnemonic, path, wif, address};
    }

    /**
     *
     *
     * */

    genMultiAddress(m, n, wifs, network) {
        const pubkeys = wifs.map(function(wif) {
            const keyPair = bitcoin.ECPair.fromWIF(wif, network);
            return keyPair.publicKey;
        });

        const pubKeyHexs = pubkeys.map((s) => s.toString('hex')); // 注意把string转换为Buffer

        const {address} = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2ms({m: m, pubkeys, network: network})
        });

        const redeemscript = bitcoin.script
            .fromASM(`OP_${m} ${pubKeyHexs} OP_${n} OP_CHECKMULTISIG`.trim().replace(/\s+|,/g, ' '))
            .toString('hex');

        return {address, redeemscript};
    }

    /**
     *
     *
     * */

    genTransaction(ins, outs, network) {
        let txb = new bitcoin.TransactionBuilder(network);
        txb.setVersion(1);

        for (let i = 0; i < ins.length; i++) {
            txb.addInput(ins[i].txHash, ins[i].vout, ins[i].sequence, ins[i].prevOutScript);
        }

        for (let i = 0; i < outs.length; i++) {
            txb.addOutput(outs[i].scriptPubKey, outs[i].value);
        }
        return txb;
    }

    signTransaction(txb, keyPairs, network) {
        for (let i = 0; i < keyPairs.length; i++) {
            let keyPair = bitcoin.ECPair.fromWIF(keyPairs[i].wif, network);
            txb.sign(keyPairs[i].inputIndex, keyPair);
        }
        return txb.build().toHex();
    }

    multiSignTransaction(txb, keyPairs, network) {
        for (let i = 0; i < keyPairs.length; i++) {
            const keyPair = bitcoin.ECPair.fromWIF(keyPairs[i].wif, network);
            const myRedeemScript = Buffer.from(keyPairs[i].redeemScript, 'hex');
            txb.sign(keyPairs[i].inputIndex, keyPair, myRedeemScript);
        }
        return txb.build().toHex();
    }

    toPaddedHexString(number, length) {
        const string = number.toString(16);
        return '0'.repeat(length - string.length) + string;
    }
}

export function Btc() {
    return new BtcModule();
}
