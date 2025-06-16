export const YOUR_CONTRACT_ABI = [
         {
           "anonymous": false,
           "inputs": [
             {
               "indexed": false,
               "internalType": "uint64",
               "name": "amount",
               "type": "uint64"
             }
           ],
           "name": "TotalAmountDecrypted",
           "type": "event"
         },
         {
           "inputs": [
             {
               "components": [
                 {
                   "internalType": "address payable",
                   "name": "wallet",
                   "type": "address"
                 },
                 {
                   "internalType": "uint256",
                   "name": "percentage",
                   "type": "uint256"
                 }
               ],
               "internalType": "struct cipManager.Inheritor[]",
               "name": "_inheritors",
               "type": "tuple[]"
             },
             {
               "internalType": "uint64",
               "name": "_releaseTime",
               "type": "uint64"
             }
           ],
           "name": "createWill",
           "outputs": [],
           "stateMutability": "nonpayable",
           "type": "function"
         },
         {
           "inputs": [
             {
               "internalType": "address",
               "name": "willer",
               "type": "address"
             }
           ],
           "name": "distributeWill",
           "outputs": [],
           "stateMutability": "nonpayable",
           "type": "function"
         },
         {
           "inputs": [],
           "name": "fundWill",
           "outputs": [],
           "stateMutability": "payable",
           "type": "function"
         },
         {
           "inputs": [
             {
               "internalType": "address",
               "name": "willer",
               "type": "address"
             }
           ],
           "name": "getWill",
           "outputs": [
             {
               "internalType": "address[]",
               "name": "inheritorAddresses",
               "type": "address[]"
             },
             {
               "internalType": "uint256[]",
               "name": "inheritorPercentages",
               "type": "uint256[]"
             },
             {
               "internalType": "uint64",
               "name": "releaseTime",
               "type": "uint64"
             },
             {
               "internalType": "bool",
               "name": "exists",
               "type": "bool"
             },
             {
               "internalType": "bool",
               "name": "distributed",
               "type": "bool"
             }
           ],
           "stateMutability": "view",
           "type": "function"
         },
         {
           "inputs": [],
           "name": "manager",
           "outputs": [
             {
               "internalType": "address",
               "name": "",
               "type": "address"
             }
           ],
           "stateMutability": "view",
           "type": "function"
         }
       ];