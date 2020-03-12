import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import * as bip32 from 'bip32';

export default class BtcModule {
    constructor() {
        this.option = {};
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
        if (!mnemonic) {
            mnemonic = bip39.generateMnemonic(strength);
        }

        strength = strength || 128;
        path = path || "m/44'/0'/0'/0/0";

        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const root = bip32.fromSeed(seed);
        const child = root.derivePath(path);
        const privateKey = child.privateKey;
        const {address} = bitcoin.payments.p2pkh({pubkey: child.publicKey});
        const wif = bitcoin.ECPair.fromPrivateKey(privateKey).toWIF();

        return {mnemonic, path, wif, address};
    }

    /**
     * @method genMultiAddress 生成多签地址和脚本
     * @param {Number} m 可支配者个数
     * @param {Number} n 所有者个数
     * @param {Buffer Array} pubkeys 所有者公钥列表
     * @returns {Promise<{address, redeemscript}>}
     * address===>多签地址
     * redeemscript====>redeem脚本
     * */

    genMultiAddress(m, n, pubkeys, network) {
        const pubKeyHexs = pubkeys.map((s) => s.toString('hex'));

        const {address} = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2ms({m: m, pubkeys, network: network})
        });

        const redeemscript = bitcoin.script
            .fromASM(`OP_${m} ${pubKeyHexs} OP_${n} OP_CHECKMULTISIG`.trim().replace(/\s+|,/g, ' '))
            .toString('hex');

        return {address, redeemscript};
    }

    /**
     * @method genTransaction 构建btc交易
     * @param {Array} ins inputs
     * @param {Array} outs outputs
     * @returns {String} tx hex
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
        return txb.buildIncomplete().toHex();
    }

    /**
     * @method signTransaction 对交易进行签名
     * @param {String} txHex 函数genTransaction返回的tx
     * @param {Array} keyPairs 私钥以及脚本
     * @returns {String} tx hex string
     * */
    signTransaction(txHex, keyPairs, network) {
        const tx = bitcoin.Transaction.fromHex(txHex);
        const txb = bitcoin.TransactionBuilder.fromTransaction(tx, network);

        for (let i = 0; i < keyPairs.length; i++) {
            let keyPair = bitcoin.ECPair.fromWIF(keyPairs[i].wif, network);
            txb.sign(keyPairs[i].inputIndex, keyPair);
        }
        return txb.build().toHex();
    }

    /**
     * @method multiSignTransaction 对交易进行签名
     * @param {String} txHex 函数genTransaction返回的tx
     * @param {Array} keyPairs 私钥以及脚本
     * @param {Boolean} finish 是否所有人都签名完毕
     * @returns {String} tx hex string
     * */
    multiSignTransaction(txHex, keyPairs, finish, network) {
        const tx = bitcoin.Transaction.fromHex(txHex);
        const txb = bitcoin.TransactionBuilder.fromTransaction(tx, network);

        for (let i = 0; i < keyPairs.length; i++) {
            const keyPair = bitcoin.ECPair.fromWIF(keyPairs[i].wif, network);
            const myRedeemScript = Buffer.from(keyPairs[i].redeemScript, 'hex');
            txb.sign(keyPairs[i].inputIndex, keyPair, myRedeemScript);
        }
        if (finish) {
            return txb.build().toHex();
        } else {
            return txb.buildIncomplete().toHex();
        }
    }

    toPaddedHexString(number, length) {
        const string = number.toString(16);
        return '0'.repeat(length - string.length) + string;
    }
}

export function Btc() {
    return new BtcModule();
}
