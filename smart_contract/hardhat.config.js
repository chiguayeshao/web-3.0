// https://eth-ropsten.alchemyapi.io/v2/jjK4BmPlNKL2DEd-7kXX3ceEv9zjsKdg

require('@nomiclabs/hardhat-waffle')

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/jjK4BmPlNKL2DEd-7kXX3ceEv9zjsKdg',
      accounts: ['6a4843f986e41899fa98984f0a559d8e870f2bb5552bfeb79b427c1199386710']
    }
  }
}