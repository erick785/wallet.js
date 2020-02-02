import * as ethers from 'ethers';
import EthereumTx from 'ethereumjs-tx';
import * as utils from 'web3-utils';
import * as abi from 'ethereumjs-abi';
import {generateAddress, ecsign} from 'ethereumjs-util';

const mutilBin =
    '608060405260006003553480156200001657600080fd5b5060405162000fa538038062000fa58339810180604052810190808051820192919060200180519060200190929190505050600082518260098211806200005c57508181115b80620000685750600081145b80620000745750600082145b156200007f57600080fd5b600092505b8451831015620001b4576000808685815181101515620000a057fe5b9060200190602002015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16806200012c5750600085848151811015156200010a57fe5b9060200190602002015173ffffffffffffffffffffffffffffffffffffffff16145b156200013757600080fd5b600160008087868151811015156200014b57fe5b9060200190602002015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550828060010193505062000084565b8460019080519060200190620001cc929190620001df565b50836002819055505050505050620002b4565b8280548282559060005260206000209081019282156200025b579160200282015b828111156200025a5782518260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055509160200191906001019062000200565b5b5090506200026a91906200026e565b5090565b620002b191905b80821115620002ad57600081816101000a81549073ffffffffffffffffffffffffffffffffffffffff02191690555060010162000275565b5090565b90565b610ce180620002c46000396000f300608060405260043610610083576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806301173672146100d35780631398a5f61461020957806385b2566a14610234578063a0e67e2b1461034a578063c6a2a9f1146103b6578063d0590bad146103e1578063d74f8edd1461044a575b7fc4c14883ae9fd8e26d5d59e3485ed29fd126d781d7e498a4ca5c54c8268e49363073ffffffffffffffffffffffffffffffffffffffff16316040518082815260200191505060405180910390a1005b3480156100df57600080fd5b50610207600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001908201803590602001908080602002602001604051908101604052809392919081815260200183836020028082843782019150505050505091929192908035906020019082018035906020019080806020026020016040519081016040528093929190818152602001838360200280828437820191505050505050919291929080359060200190820180359060200190808060200260200160405190810160405280939291908181526020018383602002808284378201915050505050509192919290505050610475565b005b34801561021557600080fd5b5061021e6105fb565b6040518082815260200191505060405180910390f35b34801561024057600080fd5b50610348600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001908201803590602001908080602002602001604051908101604052809392919081815260200183836020028082843782019150505050505091929192908035906020019082018035906020019080806020026020016040519081016040528093929190818152602001838360200280828437820191505050505050919291929080359060200190820180359060200190808060200260200160405190810160405280939291908181526020018383602002808284378201915050505050509192919290505050610605565b005b34801561035657600080fd5b5061035f610708565b6040518080602001828103825283818151815260200191508051906020019060200280838360005b838110156103a2578082015181840152602081019050610387565b505050509050019250505060405180910390f35b3480156103c257600080fd5b506103cb610796565b6040518082815260200191505060405180910390f35b3480156103ed57600080fd5b5061042c600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506107a0565b60405180826000191660001916815260200191505060405180910390f35b34801561045657600080fd5b5061045f6108de565b6040518082815260200191505060405180910390f35b61048286858585856108e3565b151561048d57600080fd5b6001600354016003819055508473ffffffffffffffffffffffffffffffffffffffff1663a9059cbb87866040518363ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050600060405180830381600087803b15801561053c57600080fd5b505af1158015610550573d6000803e3d6000fd5b505050507f3d1915a2cdcecdfffc5eb2a7994c069bad5d4aa96aca85667dedbe60bb80491c858786604051808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001828152602001935050505060405180910390a1505050505050565b6000600254905090565b833073ffffffffffffffffffffffffffffffffffffffff16311015151561062b57600080fd5b61063885858585856108e3565b151561064357600080fd5b6001600354016003819055508473ffffffffffffffffffffffffffffffffffffffff166108fc859081150290604051600060405180830381858888f19350505050158015610695573d6000803e3d6000fd5b507fd3eec71143c45f28685b24760ea218d476917aa0ac0392a55e5304cef40bd2b68585604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a15050505050565b6060600180548060200260200160405190810160405280929190818152602001828054801561078c57602002820191906000526020600020905b8160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019060010190808311610742575b5050505050905090565b6000600354905090565b6000803073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16141515156107de57600080fd5b600354308486604051602001808581526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019450505050506040516020818303038152906040526040518082805190602001908083835b6020831015156108a55780518252602082019150602081019050602083039250610880565b6001836020036101000a038019825116818451168082178552505050505050905001915050604051809103902090508091505092915050565b600981565b60008060606000855187511415156108fa57600080fd5b8451865114151561090a57600080fd5b60018054905087511115151561091f57600080fd5b60025487511015151561093157600080fd5b61093b8989610ac2565b9250865160405190808252806020026020018201604052801561096d5781602001602082028038833980820191505090505b509150600090505b8651811015610a9e57600183601b898481518110151561099157fe5b906020019060200201510188848151811015156109aa57fe5b9060200190602002015188858151811015156109c257fe5b90602001906020020151604051600081526020016040526040518085600019166000191681526020018460ff1660ff1681526020018360001916600019168152602001826000191660001916815260200194505050505060206040516020810390808403906000865af1158015610a3d573d6000803e3d6000fd5b505050602060405103518282815181101515610a5557fe5b9060200190602002019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff16815250508080600101915050610975565b610aa782610b88565b1515610ab257600080fd5b6001935050505095945050505050565b6000806060610ad185856107a0565b91506040805190810160405280601c81526020017f19457468657265756d205369676e6564204d6573736167653a0a333200000000815250905080826040518083805190602001908083835b602083101515610b425780518252602082019150602081019050602083039250610b1d565b6001836020036101000a03801982511681845116808217855250505050505090500182600019166000191681526020019250505060405180910390209250505092915050565b600080600060018054905084511115610ba057600080fd5b600091505b8351821015610caa576000808584815181101515610bbf57fe5b9060200190602002015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff161515610c1c57600080fd5b600090505b81811015610c9d578381815181101515610c3757fe5b9060200190602002015173ffffffffffffffffffffffffffffffffffffffff168483815181101515610c6557fe5b9060200190602002015173ffffffffffffffffffffffffffffffffffffffff161415610c9057600080fd5b8080600101915050610c21565b8180600101925050610ba5565b6001925050509190505600a165627a7a72305820018d0c297422e921590f6bd49d404a81daf011c37e772be81112b4ac466778f40029';

export default class EthMethod {
    constructor() {}

    /**
     * @param {Object} options
     * options.extraEntropy 额外的熵加入随机源
     * options.path 分层确定性路径，默认使用BIP44路径 "m/44'/60'/0'/0/0"
     * options.locale 助记词的语言，默认英语
     *
     *@returns {Promise<{mnemonic, path, privateKey, address}>}
     */

    account(options = {}) {
        // 拿到生成的钱包信息
        let wallet = ethers.Wallet.createRandom(options);
        // 获取助记词
        const mnemonic = wallet.mnemonic;

        // 获取path
        const path = wallet.path;

        // 获取钱包的私钥
        const privateKey = wallet.privateKey;

        // 获取钱包地址
        const address = wallet.address;

        return {mnemonic, path, privateKey, address};
    }

    /**
     * @param {String} privateKey hex 字符串
     *
     * @param {Object} txData 一个交易的基础内容
     *
     * @example
     * ```js
     * const txData = {
     *   nonce: '0x00',
     *   gasPrice: '0x09184e72a000',
     *   gasLimit: '0x2710',
     *   value: '0x00',
     * };
     *
     * @param {Number} m 可支配者个数
     *
     * @param {Array} addrs 所有者地址列表 hex
     *
     * @returns {Promise<{rawTransaction,transactionHash,multiAddr}>}
     * rawTransaction 建立多重签名地址交易hex数据，
     * transactionHash hash
     * multiAddr 多重签名地址
     *
     */

    multiAccount(privateKey, txData, m, addrs) {
        const data = abi.rawEncode(['address[]', 'uint256'], [addrs, m]).toString('hex');

        txData.data = mutilBin + data;
        txData.to = '';

        const ethtx = this.tx(txData);
        const result = this.signTx(ethtx, privateKey);

        const raw = result.rawTransaction;
        const multiAddr = generateAddress(ethtx.getSenderAddress(), Buffer.from(txData.nonce, 'hex'));

        const transactionHash = utils.keccak256(result.rawTransaction);
        return {
            raw,
            transactionHash,
            multiAddr
        };
    }

    /**
     * Creates a new transaction from an object with its fields' values.
     *
     * @param  txdata - A transaction can be initialized with its rlp representation, an array containing
     * the value of its fields in order, or an object containing them by name.
     *
     *
     * @example
     * ```js
     * const txData = {
     *   nonce: '0x00',
     *   gasPrice: '0x09184e72a000',
     *   gasLimit: '0x2710',
     *   to: '0x0000000000000000000000000000000000000000',
     *   value: '0x00',
     *   data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
     *   v: '0x1c',
     *   r: '0x5e1d3a76fbf824220eafc8c79ad578ad2b67d01b0c2425eb1f1347e8f50882ab',
     *   s: '0x5bd428537f05f9830e93792f90ea6a3e2d1ee84952dd96edbae9f658f831ab13'
     * };
     * ```
     */
    tx(txdata) {
        const ethTx = new EthereumTx(txdata);
        return ethTx;
    }

    /**
     * Creates a new transaction from an object with its fields' values.
     *
     * @param  txdata - A transaction can be initialized with its rlp representation, an array containing
     * the value of its fields in order, or an object containing them by name.
     *
     *
     * @example
     * ```js
     * const txData = {
     *   nonce: '0x00',
     *   gasPrice: '0x09184e72a000',
     *   gasLimit: '0x2710',
     *   to: '0x0000000000000000000000000000000000000000',
     *   value: '0x00',
     *   data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
     *   v: '0x1c',
     *   r: '0x5e1d3a76fbf824220eafc8c79ad578ad2b67d01b0c2425eb1f1347e8f50882ab',
     *   s: '0x5bd428537f05f9830e93792f90ea6a3e2d1ee84952dd96edbae9f658f831ab13'
     * };
     * ```
     */
    erc20Tx(txdata, to, value) {
        txdata.data = this.getContractPayload('transfer', ['address', 'uint256'], [to, value]);
        const ethTx = new EthereumTx(txdata);
        return ethTx;
    }

    /**
     * Signs the transaction
     *
     * @param {Object} transaction
     * @param {String} privateKey
     *
     * @returns {Promise<{rawTransaction,transactionHash}>}
     */
    signTx(ethTx, privateKey) {
        ethTx.sign(Buffer.from(privateKey, 'hex'));
        const validationResult = ethTx.validate(true);
        if (validationResult !== '') {
            throw new Error(`TransactionSigner Error: ${validationResult}`);
        }

        const rlpEncoded = ethTx.serialize().toString('hex');
        const rawTransaction = '0x' + rlpEncoded;
        const transactionHash = utils.keccak256(rawTransaction);

        return {
            rawTransaction,
            transactionHash
        };
    }

    /**
     * 对支付进行多重签名
     * @param {string} to 收款地址
     * @param {Number} multiNonce 多重签名地址支付Nonce
     * @param {Object} txData 一个交易的基础内容
     * @param {string} multiAddr 收款地址
     * @param {String} privateKey
     *
     * @returns {Object} transaction 多重签名后的交易
     */

    genMultiSignTx(to, multiNonce, multiAddr, txData, privateKey) {
        txData.to = multiAddr;
        const ethTx = new EthereumTx(txData);

        const message = abi.rawEncode(
            ['uint256', 'address', 'uint256', 'address'],
            [multiNonce, ethTx.to.toString('hex'), ethTx.value, to]
        );

        const messageHash = utils.keccak256(message.toString('hex'));

        const sig = ecsign(messageHash, Buffer.from(privateKey, 'hex'));

        ethTx.data = this.getContractPayload(
            'spend',
            ['address', 'uint256', 'uint8[]', 'bytes32[]', 'bytes32[]'],
            [to, ethTx.value, sig.v.toString('hex'), sig.r.toString('hex'), sig.s.toString('hex')]
        );

        return ethTx;
    }

    /**
     * 对erc20支付进行多重签名
     * @param {string} to 收款地址
     * @param {Number} multiNonce 多重签名地址支付Nonce
     * @param {string} multiAddress 收款地址
     * @param {Object} txData 一个交易的基础内容
     * @param {String} privateKey
     *
     * @returns {Object} transaction 多重签名后的交易
     */

    genERC20MultiSignTx(to, multiNonce, multiAddress, tokenAddress, txData, privateKey) {
        txData.to = multiAddress;
        const ethTx = new EthereumTx(txData);

        const message = abi.rawEncode(
            ['uint256', 'address', 'uint256', 'address'],
            [multiNonce, ethTx.to.toString('hex'), ethTx.value, to]
        );

        const messageHash = utils.keccak256(message.toString('hex'));

        const sig = ecsign(messageHash, Buffer.from(privateKey, 'hex'));

        ethTx.data = this.getContractPayload(
            'spendERC20',
            ['address', 'address', 'uint256', 'uint8[]', 'bytes32[]', 'bytes32[]'],
            [to, tokenAddress, ethTx.value, sig.v.toString('hex'), sig.r.toString('hex'), sig.s.toString('hex')]
        );

        return ethTx;
    }

    /**
     * parameterTypes: all parameter types, eg:  ['uint32', 'bool']
     * parameterValues: all parameter values, eg: [99, 1]
     */
    getContractPayload(funcName, parameterTypes, parameterValues) {
        return (
            abi.methodID(funcName, parameterTypes).toString('hex') +
            abi.rawEncode(parameterTypes, parameterValues).toString('hex')
        );
    }
}

export function Eth() {
    return new EthMethod();
}
