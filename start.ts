
import {MsgSend, BaseAccount, PrivateKey, TxGrpcClient,  ChainRestAuthApi, createTransaction, } from '@injectivelabs/sdk-ts'
import { BigNumberInBase} from '@injectivelabs/utils'
import { ChainId } from '@injectivelabs/ts-types'

//////// SETTING HERE ////////////////
const MY_KEYS = 'nasty jelly during tent mixture usual winner grace almost talent glow educate'
const TOTAL_TX = 10000; // change to the number of transactions you want

const FEE = 0.000111 // $inj
const GAS = '400000'

const GRPC = "https://sentry.chain.grpc-web.injective.network:443"
const restEndpoint ='https://lcd.injective.network'
////////////////////////////////////////////////////////

const MEMO = "ZGF0YToseyJwIjoiaW5qcmMtMjAiLCJvcCI6Im1pbnQiLCJ0aWNrIjoiSU5KUyIsImFtdCI6IjEwMDAifQ=="

const ChainID = ChainId.Mainnet

const prepareAccount =  (mnemonic: string) => {
    return PrivateKey.fromMnemonic(mnemonic)
  }

const wallet = prepareAccount(MY_KEYS)
const myAddress = wallet.toAddress().toBech32();
console.log(`Address:${myAddress}\n `)




  async function start() {
    for(let count=0; count <= TOTAL_TX; count++){
        try {

            const chainRestAuthApi = new ChainRestAuthApi(restEndpoint);
            const accountDetailsResponse = await chainRestAuthApi.fetchAccount(myAddress);
            const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse);
            const accountDetails = baseAccount.toAccountDetails();
    
            const amount = {
                amount: new BigNumberInBase(0.000001).toWei().toFixed(),
                denom: 'inj',
            };
    
            const msg = MsgSend.fromJSON({
                amount,
                srcInjectiveAddress: myAddress,
                dstInjectiveAddress: myAddress,
            });
    
            const { signBytes, txRaw } = createTransaction({
                message: msg,
                memo: MEMO,
                fee: { amount: [{ amount: String(FEE * 10**18), denom: 'inj' }], gas: GAS },
                pubKey: accountDetails.pubKey.key,
                sequence: accountDetails.sequence,
                accountNumber: accountDetails.accountNumber,
                chainId: ChainID,
            });
    
            const signature = await wallet.sign(Buffer.from(signBytes));
            txRaw.signatures = [signature];
    
            const txService = new TxGrpcClient(GRPC);
            const txResponse = await txService.broadcast(txRaw);
        
            if (txResponse.code !== 0) {
                console.log(`Transaction failed: ${txResponse.rawLog}`);
            } else {
                console.log(` - ${count}. Tx hash: https://explorer.injective.network/transaction/${txResponse.txHash}`);
            }
        } catch (error) {
            console.log(`Maybe gRPC Broked: ${GRPC}\n${error}`)
        }
    }

}



start();
