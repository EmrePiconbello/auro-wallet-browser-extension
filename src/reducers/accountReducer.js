import { MAIN_COIN_CONFIG } from "../constant";
import { amountDecimals, txSort } from "../utils/utils";

const CHANGE_ACCOUNT_TX_HISTORY = "CHANGE_ACCOUNT_TX_HISTORY"

const UPDATE_CURRENT_ACCOUNT = "UPDATE_CURRENT_ACCOUNT"

const INIT_CURRENT_ACCOUNT = "INIT_CURRENT_ACCOUNT"

const UPDATE_NET_ACCOUNT = "UPDATE_NET_ACCOUNT"


const UPDATE_NET_HOME_REFRESH = "UPDATE_NET_HOME_REFRESH"


const UPDATE_STAKING_DATA = "UPDATE_STAKING_DATA"

const UPDATE_ACCOUNT_LIST_BALANCE = "UPDATE_ACCOUNT_LIST_BALANCE"

const UPDATE_SCAM_LIST = "UPDATE_SCAM_LIST"

export function updateAccountTx(txList, txPendingList,zkAppList,zkPendingList) {
    return {
        type: CHANGE_ACCOUNT_TX_HISTORY,
        txList,
        txPendingList,
        zkAppList,
        zkPendingList
    };
}

export function updateCurrentAccount(account) {
    return {
        type: UPDATE_CURRENT_ACCOUNT,
        account
    };
}

export function initCurrentAccount(account) {
    return {
        type: INIT_CURRENT_ACCOUNT,
        account
    };
}
export function updateNetAccount(account, isCache) {
    return {
        type: UPDATE_NET_ACCOUNT,
        account,
        isCache
    };
}

export function updateShouldRequest(shouldRefresh, isSilent) {
    return {
        type: UPDATE_NET_HOME_REFRESH,
        shouldRefresh,
        isSilent
    };
}


export function updateStakingRefresh(shouldRefresh) {
    return {
        type: UPDATE_STAKING_DATA,
        shouldRefresh,
    };
}

export function updateAccountList(list) {
    return {
        type: UPDATE_ACCOUNT_LIST_BALANCE,
        list
    };
}


export function updateScamList(scamList) {
    return {
        type: UPDATE_SCAM_LIST,
        scamList:scamList
    }
}
export const ACCOUNT_BALANCE_CACHE_STATE = {
    INIT_STATE: "INIT_STATE",
    USING_CACHE: "USING_CACHE",
    NEW_STATE: "NEW_STATE"
}

const initState = {
    txList: [],
    currentAccount: {},
    netAccount: {},
    balance: "0.0000",
    nonce: "",
    shouldRefresh: true,
    isSilentRefresh:false,
    homeBottomType: "",
    isAccountCache: ACCOUNT_BALANCE_CACHE_STATE.INIT_STATE,
    stakingLoadingRefresh: false,
    accountBalanceMap:{},
    scamList:[],
    tokenList:tokenSort()
};

function tokenSort(){
    const data = {
        data: {
          accounts: [
          ],
        },
      };
    return data.data.accounts;
}

function pendingTx(txList) {
    let newList = []
    for (let index = 0; index < txList.length; index++) {
        const detail = txList[index];
        newList.push({
            "id": detail.id,
            "hash": detail.hash,
            "kind": detail.kind,
            "dateTime": detail.time,
            "from": detail.from,
            "to": detail.to,
            "amount": detail.amount,
            "fee": detail.fee,
            "nonce": detail.nonce,
            "memo": detail.memo,
            "status": "PENDING",
            timestamp : new Date(detail.time).getTime()
        })
    }
    return newList
}

function getZkOtherAccount (zkApp){
    let accountUpdates = zkApp.zkappCommand.accountUpdates
    if(Array.isArray(accountUpdates) && accountUpdates.length > 0){
        return accountUpdates[0]?.body?.publicKey
    }
    return ""
}
function zkAppFormat(zkAppList,isPending=false){
    let newList = []
    for (let index = 0;  index < zkAppList.length; index++) {
        const zkApp = zkAppList[index];
        let isFailed = Array.isArray(zkApp.failureReason) && zkApp.failureReason.length>0
        let status = isPending ?  "PENDING":isFailed ? "failed":"applied"
        newList.push({
            "id": "",
            "hash": zkApp.hash,
            "kind": "zkApp",
            "dateTime": zkApp.dateTime||"",
            "from": zkApp.zkappCommand.feePayer.body.publicKey,
            "to": getZkOtherAccount(zkApp),
            "amount": "0",
            "fee": zkApp.zkappCommand.feePayer.body.fee,
            "nonce": zkApp.zkappCommand.feePayer.body.nonce,
            "memo": zkApp.zkappCommand.memo,
            "status":  status,
            type:"zkApp",
            body:zkApp,
            timestamp : isPending ? "": new Date(zkApp.dateTime).getTime(),
            failureReason:isFailed ? zkApp.failureReason :""
        })
    }
    return newList
}
function commonHistoryFormat(list){
    return  list.map((item)=>{
        item.timestamp = new Date(item.dateTime).getTime()
        return item
    })
}

function matchScamAndTxList(scamList,txList){
    let nextTxList = txList.map((txData)=>{
        const nextTxData = {...txData}
        if(nextTxData.from){
            const address = nextTxData.from.toLowerCase()
            const scamInfo = scamList.filter((scam)=>{
                return scam.address === address
            })
            nextTxData.isFromAddressScam = scamInfo.length>0
        }
        return nextTxData
    })
    return nextTxList
}

const accountInfo = (state = initState, action) => {
    switch (action.type) {
        case CHANGE_ACCOUNT_TX_HISTORY:
            let txList = action.txList
            let txPendingList = action.txPendingList || []
            let zkAppList = action.zkAppList || []
            let zkPendingList = action.zkPendingList || []

            txPendingList = txPendingList.reverse()
            txPendingList = pendingTx(txPendingList)
            zkAppList = zkAppFormat(zkAppList)
            zkPendingList = zkAppFormat(zkPendingList,true)
            
            txList = commonHistoryFormat(txList)

            const commonList = [...txList,...zkAppList]
            commonList.sort(txSort)

            const commonPendingList = [...txPendingList,...zkPendingList]
            commonPendingList.sort((a,b)=>b.nonce-a.nonce)
            if(commonPendingList.length>0){
                commonPendingList[commonPendingList.length-1].showSpeedUp = true
            }
            let newList = [...commonPendingList,...commonList]
            if (newList.length > 0) {
                newList.push({
                    showExplorer: true
                })
            }
            if(state.scamList.length>0){
                newList = matchScamAndTxList (state.scamList,newList)
            }
            return {
                ...state,
                txList: newList,
                isSilentRefresh:false,
            };
        case UPDATE_CURRENT_ACCOUNT:
            let account = action.account
            return {
                ...state,
                currentAccount: account,
                balance: "0.0000",
                txList: [],
                netAccount: {},
                nonce: "",
                shouldRefresh: true,
            }
        case INIT_CURRENT_ACCOUNT:
            return {
                ...state,
                currentAccount: action.account,
            }
        case UPDATE_NET_ACCOUNT:
            let netAccount = action.account
            let balance = amountDecimals(netAccount.balance?.total||0, MAIN_COIN_CONFIG.decimals)
            let nonce = netAccount.nonce
            let inferredNonce = netAccount.inferredNonce

            let isAccountCache
            let cacheState = state.isAccountCache
            if (action.isCache && cacheState !== ACCOUNT_BALANCE_CACHE_STATE.NEW_STATE) {
                isAccountCache = ACCOUNT_BALANCE_CACHE_STATE.USING_CACHE
            } else {
                isAccountCache = ACCOUNT_BALANCE_CACHE_STATE.NEW_STATE
            }
            return {
                ...state,
                netAccount: netAccount,
                balance,
                nonce,
                inferredNonce,
                isAccountCache,
            }
        case UPDATE_NET_HOME_REFRESH:
            let isSilent = action.isSilent
            let shouldRefresh = action.shouldRefresh
            if (isSilent) {
                return {
                    ...state,
                    shouldRefresh: shouldRefresh,
                    isSilentRefresh:true
                }
            }
            let newState = {}
            if (shouldRefresh) {
                newState = {
                    netAccount: {},
                    balance: "0.0000",
                    nonce: "",
                    txList: [],
                }
            }
            return {
                ...state,
                shouldRefresh: shouldRefresh,
                isSilentRefresh:false,
                ...newState
            }
        case UPDATE_STAKING_DATA:
            return {
                ...state,
                stakingLoadingRefresh: action.shouldRefresh
            }
        case UPDATE_ACCOUNT_LIST_BALANCE:
            return {
                ...state,
                accountBalanceMap: action.list
            }
        case UPDATE_SCAM_LIST:
            const nextScamList = action.scamList.map((scamData)=>{
                return {
                    ...scamData,
                    address:scamData.address.toLowerCase()
                }
            })
            
            if(state.txList.length>0){
                const newList = matchScamAndTxList(nextScamList,state.txList)
                return{
                    ...state,
                    scamList:nextScamList,
                    txList:newList
                }
            }
            return{
                ...state,
                scamList:nextScamList,
            }
        default:
            return state;
    }
};

export default accountInfo;
