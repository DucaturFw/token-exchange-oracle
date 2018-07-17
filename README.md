# Cross-Blockchain Token Exchange Oracle

Watches cross-blockchain token contracts and transfers tokens between blockchains (via mint/burn).

[![Build Status](https://travis-ci.org/DucaturFw/token-exchange-oracle.svg?branch=master)](https://travis-ci.org/DucaturFw/token-exchange-oracle)

Smart contract methods requirements (see [NEP-5](https://github.com/DucaturFw/neo-nep5-token/blob/master/NeoContractIco.cs) and [ERC20](https://github.com/DucaturFw/eth-neo-lab/blob/master/erc20_token.sol) examples):  
1. `exchange(<token amount>, <blockchain name>, <receiver wallet address>)`  
Burns tokens in the current blockchain.  
2. `mint(<token amount>, <receiver wallet address (current blockchain)>, <origin blockchain name>, <origin blockchain tx hash>)`  
Mints tokens in the current blockchain.

Deamon is responsible for minting correct amount of tokens on the target blockchain after some were burned on origin blockchain.

Origin blockchain transaction hashes are stored to maintain exchange history for verification purposes and recoverability.

Currently supported: NEO and ETH.

### Running tests
`yarn test`
