# wallet.js

支持 btc,usdt,eth,erc20,ltc,bch 的私钥地址的生成及单签和多签交易的构建。

## Installation

```bash
npm install txbuilderjs
```

## Test

```bash
npm run test
```

## Usage

```js
import * as tb from 'txbuilderjs';

const builder = tb.Builder();

const {mnemonic, path, wif, address} = builder.btc.genAccount();
```

-   [BTC Interface](#BTC)

    -   [genAccount](#btc_genAccount)
    -   [genMultiAddress](#btc_genMultiAddress)
    -   [genTransaction](#btc_genTransaction)
    -   [signTransaction](#btc_signTransaction)
    -   [multiSignTransaction](#btc_multiSignTransaction)

-   [USDT Interface](#USDT)

    -   [genTransaction](#usdt_genTransaction)

-   [ETH Interface](#ETH)

    -   [genAccount](#eth_genAccount)
    -   [multiAccountTx](#eth_multiAccountTx)
    -   [genTransaction](#eth_genTransaction)
    -   [signTransaction](#eth_signTransaction)
    -   [genMultiSignTx](#eth_genMultiSignTx)

-   [ERC20 Interface](#ERC20)

    -   [genErc20Transaction](#erc20_genErc20Transaction)
    -   [genERC20MultiSignTx](#erc20_genERC20MultiSignTx)

-   [LTC Interface](#LTC)

    -   [genAccount](#ltc_genAccount)
    -   [genMultiAddress](#ltc_genMultiAddress)
    -   [genTransaction](#ltc_genTransaction)
    -   [signTransaction](#ltc_signTransaction)
    -   [multiSignTransaction](#ltc_multiSignTransaction)

-   [BCH Interface](#BCH)

    -   [genAccount](#bch_genAccount)
    -   [genMultiAddress](#bch_genMultiAddress)
    -   [genTransactionAndSign](#bch_genTransactionAndSign)
    -   [genTransactionAndMultiSign](#bch_genTransactionAndMultiSign)

### BTC

#### btc_genAccount

```js
/**
 * @method genAccount 根据公钥生成P2PKH地址, 支持压缩、非压缩公钥
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
```

#### Example

看第一个测试 [generate btc account](https://github.com/erick785/wallet.js/blob/master/btc/test/BtcModuleTest.js)

---

#### btc_genMultiAddress

```js
/**
 * @method genMultiAddress 生成多签地址和脚本
 * @param {Number} m 可支配者个数
 * @param {Number} n 所有者个数
 * @param {Array} wifs 所有者私钥列表
 * @returns {Promise<{address, redeemscript}>}
 * address===>多签地址
 * redeemscript====>redeem脚本 多重签名地址的赎回脚本
 * */
```

#### Example

看第二个测试 [generate multi address](https://github.com/erick785/wallet.js/blob/master/btc/test/BtcModuleTest.js)

---

#### btc_genTransaction

```js
/**
 * @method genTransaction 构建btc交易
 * @param {Array} ins inputs
 * @param {Array} outs outputs
 * @returns {Object} tx
 * */

const ins = [
    {
        // txHash UTXO交易hash
        txHash: 'ba850540254378c3a6bad35d24ede8ce438b0e9dce4834f154962f153c8c8dc4',
        // vout UTXO交易输出索引
        vout: 0
    }
];

const outs = [
    {
        // scriptPubKey 收款地址
        scriptPubKey: '1qp9Gy2WGCFLQfhjLLDnVuRSGnuy8tmgn',
        // value 收款金额
        value: 499999 * 1e4
    }
];
```

#### Example

看第三个测试 [generate btc transaction and sign](https://github.com/erick785/wallet.js/blob/master/btc/test/BtcModuleTest.js)

---

#### btc_signTransaction

```js
/**
 * @method signTransaction 对交易进行单签名
 * @param {Object} tx 函数genTransaction返回的tx
 * @param {Array} keyPairs 私钥以及脚本
 * @returns {String} tx hex string
 * */

const keyPairs = [
    {
        // wif 私钥
        wif: 'KzbSeQ3Sqwa4h27Adj3qszScuKbGd8MToLYbooxuB5Ap3UxJUUoB',
        // inputIndex UTXO交易输出索引
        inputIndex: 0
    }
];
```

#### Example

看第三个测试 [generate btc transaction and sign](https://github.com/erick785/wallet.js/blob/master/btc/test/BtcModuleTest.js)

---

#### btc_multiSignTransaction

```js
/**
 * @method multiSignTransaction 对交易进行多重签名
 * @param {Object} tx 函数genTransaction返回的tx
 * @param {Array} keyPairs 私钥以及脚本
 * @returns {String} tx hex string
 * */

const keyPairs = [
    {
        // wif 私钥
        wif: 'KzbSeQ3Sqwa4h27Adj3qszScuKbGd8MToLYbooxuB5Ap3UxJUUoB',
        // inputIndex UTXO交易输出索引
        inputIndex: 0,
        // redeemScript 多重签名地址的赎回脚本,就是genMultiAddress函数返回的那个脚本
        redeemScript:
            '522102c2d1fd9f2beeef8516c89fa62ad973b105773468b5d06e117e63d227aa2a051a2102ffedaa1ab2c5475ce41e0bf84419ec7fcd90a78ea9ec76a41663d38ed20bf45221024d20355b46c3a3fe9c4fb66c07394d0c38ee669e9815b5779b4124ed426a6a7053ae'
    }
];
```

#### Example

看第四个测试 [generate btc multi sign transaction](https://github.com/erick785/wallet.js/blob/master/btc/test/BtcModuleTest.js)

### USDT

`usdt`其实是 btc 网络中的一个脚本，所以和`btc`的接口都是一样的，唯一有区别的是构建交易的`outs`不同

#### usdt_genTransaction

```js
const amount = btc.toPaddedHexString(Math.floor(1 * 1e7), 16);
const simpleSend = [
    '6f6d6e69', // omni 不用改
    '0000', // version 不用改
    '00000000001f', // 31 for Tether 不用改
    amount // amount = 1 * 10 000 000 in HEX, usdt转账的金额，只需改这个
].join('');

const data = [Buffer.from(simpleSend, 'hex')]; // NEW** data must be an Array(Buffer)
const omniOutput = bitcoin.payments.embed({data}).output; // NEW** Payments API

// 这里构建outs和普通btc不一样,第一个out必须是收款方,第二个是usdt的output，顺序不能反。
const outs = [
    {
        // scriptPubKey usdt收款地址
        scriptPubKey: '1qp9Gy2WGCFLQfhjLLDnVuRSGnuy8tmgn',
        // value 不用改
        value: 546
    },
    {
        scriptPubKey: omniOutput, // usdt payment
        value: 0
    }
];
```

#### Example

看第一个测试 [generate usdt transaction and sign](https://github.com/erick785/wallet.js/blob/master/btc/test/UsdtTest.js)

看第二个测试 [generate usdt multi sign transaction](https://github.com/erick785/wallet.js/blob/master/btc/test/UsdtTest.js)

---

### ETH

#### eth_genAccount

```js
/**
 * @method genAccount 生成账户
 * @param {Object} options 不写就默认
 * options.extraEntropy 额外的熵加入随机源
 * options.path 分层确定性路径，默认使用BIP44路径 "m/44'/60'/0'/0/0"
 * options.locale 助记词的语言，默认英语
 *@returns {Promise<{mnemonic, path, privateKey, address}>}
 * mnemonic 助记词
 * path 路径
 * privateKey 秘钥
 * address 地址
 */
```

#### example

看第一个测试 [generate eth account](https://github.com/erick785/wallet.js/blob/master/eth/test/EthModuleTest.js)

---

#### eth_multiAccountTx

```js
/**
 * @method genAccount 生成账户
 * @param {String} privateKey hex 字符串
 * @param {Object} txData 一个交易的基础内容
 * @param {Number} m 可支配者个数
 * @param {Array} addrs 所有者地址列表 hex
 * @returns {Promise<{rawTransaction,transactionHash,multiAddr}>}
 * rawTransaction 建立多重签名地址交易hex数据，
 * transactionHash hash
 * multiAddr 多重签名地址
 *
 */
const txData = {
    nonce: '0x00', // 账户nonce
    gasPrice: '0x09184e72a000', // gasprice
    gasLimit: '0x2710', // 交易消耗最大gas
    value: '0x00' // 转账金额，无特殊需求不写也行，因为这个只是创建账户交易，不需要转账。
};
```

#### example

看第二个测试 [generate multi account transaction](https://github.com/erick785/wallet.js/blob/master/eth/test/EthModuleTest.js)

---

#### eth_genTransaction

```js
/**
 * @method genTransaction 创建以太坊交易
 * @param {Object} txData 一个交易的基础内容
 * @returns {Object} tx 返回交易
 * */

const txData = {
    nonce: '0x00', // 账户nonce
    gasPrice: '0x09184e72a000', // price
    gasLimit: '0x2710', // 最大消耗gas
    to: '0x0000000000000000000000000000000000000000', //收款方
    value: '0x00', // 转账金额
    data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057' // 交易额外字段，交易的附带信息
};
```

#### example

看第三个测试 [generate eth transaction and sign](https://github.com/erick785/wallet.js/blob/master/eth/test/EthModuleTest.js)

---

#### eth_signTransaction

```js
/**
 * @method signTransaction 签名以太坊交易
 * @param {Object} tx 交易结构
 * @param {String}  privateKey 私钥
 * @returns {Promise<{rawTransaction,transactionHash}>}
 * rawTransaction ===>交易序列化后的结果
 * transactionHash ===> 交易hash
 * */
```

#### example

看第三个测试 [generate eth transaction and sign](https://github.com/erick785/wallet.js/blob/master/eth/test/EthModuleTest.js)

---

#### eth_genMultiSignTx

```js
/**
 * @method genMultiSignTx 对支付进行多重签名
 * @param {String} to 收款地址
 * @param {Number} value 多种签名转账金额
 * @param {Number} multiNonce 多重签名地址支付Nonce
 * @param {String} multiAddr 收款地址
 * @param {Object} txData 一个交易的基础内容
 * @param {Array} privateKeys
 * @returns {Object} tx transaction 多重签名后的交易
 */

const txData = {
    nonce: '0x03',
    gasPrice: '0x2540be400',
    gasLimit: '0xdbba0',
    value: '0x0'
};
```

#### example

看第三个测试 [generate multi sign transaction](https://github.com/erick785/wallet.js/blob/master/eth/test/EthModuleTest.js)

---

### ERC20

#### erc20_genErc20Transaction

```js
/**
 * @method getErc20Transaction 创建以太坊erc20交易
 * @param {Object} txData 一个交易的基础内容
 * @param {String} to 代币收款人地址
 * @param {String} value 代币转账金额
 *
 * @returns {Object} tx 返回交易
 */

const txData = {
    nonce: '0x00',
    gasPrice: '0x09184e72a000',
    gasLimit: '0x2710',
    value: '0x00' //这个value指的是交易eth转账的value，不是代币的
};
```

#### example

看第一个测试 [generate erc20 transaction](https://github.com/erick785/wallet.js/blob/master/eth/test/Erc20Test.js)

---

#### erc20_genERC20MultiSignTx

```js
/**
 * @method genERC20MultiSignTx 对erc20支付进行多重签名
 * @param {String} to 收款地址
 * @param {Number} multiNonce 多重签名地址支付Nonce
 * @param {String} multiAddress 收款地址
 * @param {String} tokenAddress erc20合约地址
 * @param {Object} txData 一个交易的基础内容
 * @param {Array} privateKeys
 * @returns {Object} transaction 多重签名后的交易
 */

let txData = {
    nonce: '0x02',
    gasPrice: '0x2540be400',
    gasLimit: '0x895440',
    value: '0x0'
};
```

#### example

看第二个测试 [generate multi sign erc20 transaction](https://github.com/erick785/wallet.js/blob/master/eth/test/Erc20Test.js)

---

### LTC

#### ltc_genAccount

```js
/**
 * @method genAccount 根据公钥生成P2PKH地址, 支持压缩、非压缩公钥
 * @param {Number} strength 默认 128
 * 熵128 ==> 助记词12个单词
 * 熵160 ==> 助记词15个单词
 * 熵192 ==> 助记词18个单词
 * 熵224 ==> 助记词21个单词
 * 熵256 ==> 助记词24个单词
 * @param {String} path 分层确定性路径，默认使用BIP44路径 "m/44'/0'/2'/0/0"
 * @returns {Promise<{mnemonic, path, wif, address}>}
 * mnemonic 助记词
 * path 路径
 * wif 秘钥
 * address 地址
 */
```

#### Example

看第一个测试 [generate ltc account](https://github.com/erick785/wallet.js/blob/master/ltc/test/LtcModuleTest.js)

---

#### ltc_genMultiAddress

```js
/**
 * @method genMultiAddress 生成多签地址和脚本
 * @param {Number} m 可支配者个数
 * @param {Number} n 所有者个数
 * @param {Array} wifs 所有者私钥列表
 * @returns {Promise<{address, redeemscript}>}
 * address===>多签地址
 * redeemscript====>redeem脚本 多重签名地址的赎回脚本
 * */
```

#### Example

看第二个测试 [generate ltc multi address](https://github.com/erick785/wallet.js/blob/master/ltc/test/LtcModuleTest.js)

---

#### ltc_genTransaction

```js
/**
 * @method genTransaction 构建btc交易
 * @param {Array} ins inputs
 * @param {Array} outs outputs
 * @returns {Object} tx
 * */

const ins = [
    {
        // txHash UTXO交易hash
        txHash: 'ba850540254378c3a6bad35d24ede8ce438b0e9dce4834f154962f153c8c8dc4',
        // vout UTXO交易输出索引
        vout: 0
    }
];

const outs = [
    {
        // scriptPubKey 收款地址
        scriptPubKey: '1qp9Gy2WGCFLQfhjLLDnVuRSGnuy8tmgn',
        // value 收款金额
        value: 499999 * 1e4
    }
];
```

#### Example

看第三个测试 [generate ltc transaction and sign](https://github.com/erick785/wallet.js/blob/master/ltc/test/LtcModuleTest.js)

---

#### ltc_signTransaction

```js
/**
 * @method signTransaction 对交易进行单签名
 * @param {Object} tx 函数genTransaction返回的tx
 * @param {Array} keyPairs 私钥以及脚本
 * @returns {String} tx hex string
 * */

const keyPairs = [
    {
        // wif 私钥
        wif: 'KzbSeQ3Sqwa4h27Adj3qszScuKbGd8MToLYbooxuB5Ap3UxJUUoB',
        // inputIndex UTXO交易输出索引
        inputIndex: 0
    }
];
```

#### Example

看第三个测试 [generate ltc transaction and sign 1](https://github.com/erick785/wallet.js/blob/master/ltc/test/LtcModuleTest.js)

---

#### ltc_multiSignTransaction

```js
/**
 * @method multiSignTransaction 对交易进行多重签名
 * @param {Object} tx 函数genTransaction返回的tx
 * @param {Array} keyPairs 私钥以及脚本
 * @returns {String} tx hex string
 * */

const keyPairs = [
    {
        // wif 私钥
        wif: 'KzbSeQ3Sqwa4h27Adj3qszScuKbGd8MToLYbooxuB5Ap3UxJUUoB',
        // inputIndex UTXO交易输出索引
        inputIndex: 0,
        // redeemScript 多重签名地址的赎回脚本,就是genMultiAddress函数返回的那个脚本
        redeemScript:
            '522102c2d1fd9f2beeef8516c89fa62ad973b105773468b5d06e117e63d227aa2a051a2102ffedaa1ab2c5475ce41e0bf84419ec7fcd90a78ea9ec76a41663d38ed20bf45221024d20355b46c3a3fe9c4fb66c07394d0c38ee669e9815b5779b4124ed426a6a7053ae'
    }
];
```

#### Example

看第五个测试 [generate ltc multi sign transaction](https://github.com/erick785/wallet.js/blob/master/ltc/test/LtcModuleTest.js)

### BCH

#### bch_genAccount

```js
/**
 * @method genAccount 根据公钥生成P2PKH地址, 支持压缩、非压缩公钥
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
```

#### Example

看第一个测试 [generate bch account](https://github.com/erick785/wallet.js/blob/master/bch/test/BchModuleTest.js)

---

#### bch_genMultiAddress

```js
/**
 * @method genMultiAddress 生成多签地址和脚本
 * @param {Number} m 可支配者个数
 * @param {Number} n 所有者个数
 * @param {Array} wifs 所有者私钥列表
 * @returns {Promise<{address, redeemscript}>}
 * address===>多签地址
 * redeemscript====>redeem脚本 多重签名地址的赎回脚本
 * */
```

#### Example

看第二个测试 [generate bch multi address](https://github.com/erick785/wallet.js/blob/master/bch/test/BchModuleTest.js)

---

#### bch_genTransactionAndSign

```js
/**
 * @method genTransactionAndSign 构建bch交易并签名
 * @param {Array} ins inputs
 * @param {Array} outs outputs
 * @param {String} wif 私钥
 * @returns {Object} tx
 * */


const ins = [
    {
        // txHash UTXO交易hash
        txHash: 'ba850540254378c3a6bad35d24ede8ce438b0e9dce4834f154962f153c8c8dc4',
        // vout UTXO交易输出索引
        vout: 0
        // value
        value:499999 *  1e4
    }
];

const outs = [
    {
        // scriptPubKey 收款地址
        scriptPubKey: '1qp9Gy2WGCFLQfhjLLDnVuRSGnuy8tmgn',
        // value 收款金额
        value: 499999 * 1e4
    }
];
```

#### Example

看第三个测试 [generate bch transaction and sign](https://github.com/erick785/wallet.js/blob/master/bch/test/BchModuleTest.js)

---

#### bch_genTransactionAndMultiSign

```js
/**
 * @method genTransactionAndSign 构建bch交易并签名
 * @param {Array} ins inputs
 * @param {Array} outs outputs
 * @param {String} multiAddr 多签地址
 * @param {Number} m 可支配者个数
 * @param {Array} wifs 签名
 * @returns {String} tx hex
 * */
```

#### Example

看第四个测试 [generate bch multi sign transaction](https://github.com/erick785/wallet.js/blob/master/bch/test/BchModuleTest.js)

---
