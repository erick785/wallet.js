import bitcoin from 'bitcoinjs-lib';
import bip39 from 'bip39';
import bip32 from 'bip32';

export default class BtcModule {
    constructor() {}

    /**
     * 根据公钥生成P2PKH地址, 支持压缩、非压缩公钥
     * @param {Number} strength 默认 128
     * @param {String} path 分层确定性路径，默认使用BIP44路径 "m/44'/0'/0'/0/0"
     *
     * @returns {Promise<{mnemonic, path, wif, address}>}
     */

    account(strength, path) {
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

    genMultiAddress(m, n, pubKeyHexs) {
        const pubkeys = pubKeyHexs.map((s) => Buffer.from(s, 'hex')); // 注意把string转换为Buffer
        const {address} = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2ms({m: m, pubkeys})
        });

        const redeemscript = bitcoin.script
            .fromASM(
                `
          OP_M
          ${m - 1}
          ${pubKeyHexs}
          OP_1
          ${n - 1}
          OP_CHECKSIG
        `
                    .trim()
                    .replace(/\s+/g, ' ')
            )
            .toString('hex');

        return {address, redeemscript};
    }

    /**
     *
     *
     * */

    genTransaction(ins, outs, wifs) {
        let txb = new bitcoin.TransactionBuilder();

        for (let i = 0; i < ins.length; i++) {
            txb.addInput(ins[i].txHash, ins[i].vout, ins[i].sequence, ins[i].prevOutScript);
        }

        for (let i = 0; i < outs.length; i++) {
            txb.addOutput(outs[i].scriptPubKey, outs[i].value);
        }
        return txb;
    }

    signTransaction(txb, wifs) {
        for (let i = 0; i < wifs.length; i++) {
            let keyPair = bitcoin.ECPair.fromWIF(wifs[i]);
            txb.sign(i, keyPair);
        }

        return txb.build().toHex();
    }

    // multiSignTransaction() {}

    // genSingleTransactionAndSign() {}

    // genSingleTransactionAndMultiSign() {}
}

export function Btc() {
    return new BtcModule();
}
