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
     * 根据公钥生成P2PKH地址, 支持压缩、非压缩公钥
     * @param {Number} strength 默认 128
     * @param {String} path 分层确定性路径，默认使用BIP44路径 "m/44'/0'/2'/0/0"
     *
     * @returns {Promise<{mnemonic, path, wif, address}>}
     */
    genAccount(strength, path) {
        strength = strength || 128;
        path = path || "m/44'/0'/145'/0/0";

        const mnemonic = bip39.generateMnemonic(strength);
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const root = bip32.fromSeed(seed);
        const child = root.derivePath(path);
        const privateKey = child.privateKey;
        const {address} = bitcoin.payments.p2pkh({pubkey: child.publicKey, network: bchcoinBitcoinJsLibrary});
        const wif = bitcoin.ECPair.fromPrivateKey(privateKey, {network: bchcoinBitcoinJsLibrary}).toWIF();

        return {mnemonic, path, wif, address};
    }

    genMultiAddress(m, n, wifs) {
        let pubKeys = [];

        for (let i = 0; i < wifs.length; i++) {
            pubKeys.push(bitcoincash.PrivateKey.fromWIF(wifs[i]).toPublicKey());
        }

        const {address, redeemscript} = super.genMultiAddress(m, n, wifs, bchcoinBitcoinJsLibrary);

        return {address, redeemscript, pubKeys};
    }

    genTransactionAndSign(ins, outs, wif) {
        let utxos = [];
        let tos = [];
        const keyPair = bitcoin.ECPair.fromWIF(wif, bchcoinBitcoinJsLibrary);
        const payments = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey, network: bchcoinBitcoinJsLibrary});

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

        const transaction = new bitcoincash.Transaction()
            .from(utxos)
            .to(tos)
            .sign(wif);
        return transaction.uncheckedSerialize();
    }

    genTransactionAndMultiSign(ins, outs, multiAddr, m, pubKeys, wifs) {
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

        const transaction = new bitcoincash.Transaction()
            .from(utxos, pubKeys, m)
            .to(tos)
            .sign(wifs);

        return transaction.uncheckedSerialize();
    }
}

export function Bch() {
    return new BchModule();
}
