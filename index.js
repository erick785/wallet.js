import {Eth} from './eth/src/EthModule';
import {Btc} from './btc/src/BtcModule';
import {Bch} from './bch/src/BchModule';
import {Ltc} from './ltc/src/LtcModule';

export default class TxBuilder {
    constructor() {
        this.eth = Eth();
        this.btc = Btc();
        this.bch = Bch();
        this.ltc = Ltc();
    }
}

export function Builder() {
    return new TxBuilder();
}
