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
     * @method genAccount 根据公钥生成P2PKH地址, 支持压缩、非压缩公钥
     * @param {String} mnemonic 助记词如果这个参数不为空，就是通过助记词恢复账户
     * @param {Number} strength 默认 128
     * 熵128 ==> 助记词12个单词
     * 熵160 ==> 助记词15个单词
     * 熵192 ==> 助记词18个单词
     * 熵224 ==> 助记词21个单词
     * 熵256 ==> 助记词24个单词
     * @param {String} path 分层确定性路径，默认使用BIP44路径 "m/44'/0'/0'/0/0"
     * @returns {Promise<{mnemonic, path, wif, address}>}
     * mnemonic 助记词
     * path 路径
     * wif 秘钥
     * address 地址
     */
    genAccount(mnemonic, strength, path) {
        strength = strength || 128;
        path = path || "m/44'/0'/2'/0/0";

        if (!mnemonic) {
            mnemonic = bip39.generateMnemonic(strength);
        }

        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const root = bip32.fromSeed(seed);
        const child = root.derivePath(path);
        const privateKey = child.privateKey;
        const {address} = bitcoin.payments.p2pkh({pubkey: child.publicKey, network: litecoinBitcoinJsLibrary});
        const wif = bitcoin.ECPair.fromPrivateKey(privateKey, {network: litecoinBitcoinJsLibrary}).toWIF();

        return {mnemonic, path, wif, address};
    }

    /**
     * @method genMultiAddress 生成多签地址和脚本
     * @param {Number} m 可支配者个数
     * @param {Number} n 所有者个数
     * @param {Array} wifs 所有者私钥列表
     * @returns {Promise<{address, redeemscript}>}
     * address===>多签地址
     * redeemscript====>redeem脚本 多重签名地址的赎回脚本
     * */
    genMultiAddress(m, n, wifs) {
        return super.genMultiAddress(m, n, wifs, litecoinBitcoinJsLibrary);
    }
    /**
     * @method genTransaction 构建btc交易
     * @param {Array} ins inputs
     * @param {Array} outs outputs
     * @returns {Object} tx
     * */
    genTransaction(ins, outs) {
        return super.genTransaction(ins, outs, litecoinBitcoinJsLibrary);
    }

    /**
     * @method signTransaction 对交易进行单签名
     * @param {Object} tx 函数genTransaction返回的tx
     * @param {Array} keyPairs 私钥以及脚本
     * @returns {String} tx hex string
     * */
    signTransaction(txb, keyPairs) {
        return super.signTransaction(txb, keyPairs, litecoinBitcoinJsLibrary);
    }

    /**
     * @method multiSignTransaction 对交易进行多重签名
     * @param {Object} tx 函数genTransaction返回的tx
     * @param {Array} keyPairs 私钥以及脚本
     * @returns {String} tx hex string
     * */
    multiSignTransaction(txb, keyPairs) {
        return super.multiSignTransaction(txb, keyPairs, litecoinBitcoinJsLibrary);
    }
}

export function Ltc() {
    return new LtcModule();
}
