import BtcModule from '../../btc/src/BtcModule';
import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import * as coininfo from 'coininfo';
import * as bitcoin from 'bitcoinjs-lib';
import * as bitcoincash from 'bitcore-lib-cash';
import * as bchaddr from 'bchaddrjs';

const bchcoin = coininfo.bitcoincash.main;
const bchcoinBitcoinJsLibrary = bchcoin.toBitcoinJS();

export default class BchModule extends BtcModule {
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
     * @param {String} path 分层确定性路径，默认使用BIP44路径 "m/44'/0'/145'/0/0'/0/0"
     * @returns {Promise<{mnemonic, path, wif, address}>}
     * mnemonic 助记词
     * path 路径
     * wif 秘钥
     * address 地址
     */
    genAccount(mnemonic, strength, path) {
        if (!mnemonic) {
            mnemonic = bip39.generateMnemonic(strength);
        }

        strength = strength || 128;
        path = path || "m/44'/0'/145'/0/0";

        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const root = bip32.fromSeed(seed);
        const child = root.derivePath(path);
        const privateKey = child.privateKey;
        const {address} = bitcoin.payments.p2pkh({pubkey: child.publicKey, network: bchcoinBitcoinJsLibrary});
        const wif = bitcoin.ECPair.fromPrivateKey(privateKey, {network: bchcoinBitcoinJsLibrary}).toWIF();

        return {mnemonic, path, wif, address};
    }

    /**
     * @method genMultiAddress 生成多签地址和脚本
     * @param {Number} m 可支配者个数
     * @param {Number} n 所有者个数
     * @param {Buffer Array} pubKeys 所有者公钥列表
     * @returns {Promise<{address, redeemscript}>}
     * address===>多签地址
     * redeemscript====>redeem脚本 多重签名地址的赎回脚本
     * */
    genMultiAddress(m, n, pubKeys) {
        const {address, redeemscript} = super.genMultiAddress(m, n, pubKeys, bchcoinBitcoinJsLibrary);

        return {address, redeemscript};
    }

    /**
     * @method signTransaction 签名交易
     * @param {String} serialized 可支配者个数
     * @param {String} wif 私钥
     * @returns {String} tx hex
     * */

    signTransaction(serialized, wif) {
        const transaction = new bitcoincash.Transaction(serialized).sign(wif);

        if (transaction.isFullySigned()) {
            return transaction.uncheckedSerialize();
        } else {
            return transaction.toObject();
        }
    }

    /**
     * @method genTransaction 构建bch交易
     * @param {Array} ins inputs
     * @param {Array} outs outputs
     * @param {String} publicKey 公钥
     * @returns {String} tx object
     * */
    genTransaction(ins, outs, publicKey) {
        let utxos = [];
        let tos = [];
        const payments = bitcoin.payments.p2pkh({pubkey: publicKey, network: bchcoinBitcoinJsLibrary});

        const s = bitcoin.address.toOutputScript(payments.address, bchcoinBitcoinJsLibrary).toString('hex');

        for (let i = 0; i < ins.length; i++) {
            utxos.push({
                txId: ins[i].txHash,
                outputIndex: ins[i].vout,
                script: s,
                satoshis: ins[i].value
            });
        }

        for (let i = 0; i < outs.length; i++) {
            const addr = bitcoincash.Address(bchaddr.toCashAddress(outs[i].scriptPubKey));
            tos.push({address: addr, satoshis: outs[i].value});
        }

        const transaction = new bitcoincash.Transaction().from(utxos).to(tos);

        return transaction.toObject();
    }

    /**
     * @method genMultiSignTx 构建bch交易
     * @param {Array} ins inputs
     * @param {Array} outs outputs
     * @param {String} multiAddr 多签地址
     * @param {Number} m 可支配者个数
     * @param {Array Buffer} pubKeys 所有人公钥
     * @returns {String} tx hex
     * */
    genMultiSignTx(ins, outs, multiAddr, m, pubKeys) {
        const pubKeyHexs = pubKeys.map((s) => s.toString('hex'));

        let utxos = [];
        let tos = [];

        for (let i = 0; i < ins.length; i++) {
            const addr = bitcoincash.Address(bchaddr.toCashAddress(multiAddr));

            utxos.push({
                txId: ins[i].txHash,
                outputIndex: ins[i].vout,
                script: bitcoincash.Script(addr).toString(),
                satoshis: ins[i].value
            });
        }

        for (let i = 0; i < outs.length; i++) {
            const addr = bitcoincash.Address(bchaddr.toCashAddress(outs[i].scriptPubKey));
            tos.push({address: addr, satoshis: outs[i].value});
        }

        const transaction = new bitcoincash.Transaction().from(utxos, pubKeyHexs, m).to(tos);

        return transaction.toObject();
    }
}

export function Bch() {
    return new BchModule();
}
