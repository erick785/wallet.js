import BtcModule from '../../btc/src/BtcModule';
import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import * as coininfo from 'coininfo';
import * as bitcoin from 'bitcoinjs-lib';

const litecoin = coininfo.litecoin.main;
const litecoinBitcoinJsLibrary = litecoin.toBitcoinJS();

export default class LtcModule extends BtcModule {
    constructor() {
        super();
    }

    /**
     * 根据公钥生成P2PKH地址, 支持压缩、非压缩公钥
     * @param {Number} strength 默认 128
     * @param {String} path 分层确定性路径，默认使用BIP44路径 "m/44'/0'/2'/0/0"
     *
     * @returns {Promise<{mnemonic, path, wif, address}>}
     */
    genAccount(strength, path) {
        strength = strength || 128;
        path = path || "m/44'/0'/2'/0/0";

        const mnemonic = bip39.generateMnemonic(strength);
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const root = bip32.fromSeed(seed);
        const child = root.derivePath(path);
        const privateKey = child.privateKey;
        const {address} = bitcoin.payments.p2pkh({pubkey: child.publicKey, network: litecoinBitcoinJsLibrary});
        const wif = bitcoin.ECPair.fromPrivateKey(privateKey, {network: litecoinBitcoinJsLibrary}).toWIF();

        return {mnemonic, path, wif, address};
    }

    genMultiAddress(m, n, wifs) {
        return super.genMultiAddress(m, n, wifs, litecoinBitcoinJsLibrary);
    }

    genTransaction(ins, outs) {
        return super.genTransaction(ins, outs, litecoinBitcoinJsLibrary);
    }

    signTransaction(txb, keyPairs) {
        return super.signTransaction(txb, keyPairs, litecoinBitcoinJsLibrary);
    }

    multiSignTransaction(txb, keyPairs) {
        return super.multiSignTransaction(txb, keyPairs, litecoinBitcoinJsLibrary);
    }
}

export function Ltc() {
    return new LtcModule();
}
