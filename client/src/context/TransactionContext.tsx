import { ethers } from 'ethers'
import React, { useEffect, useState } from 'react'
import { contractABI, contractAddress } from '../utils/constants'

export const TransactionContext = React.createContext<any>({})
const { ethereum }: any = window

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const transactionContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
    )

    return transactionContract
}

export const TransactionProvider = ({ children }: any) => {
    const [currentAccount, setCurrentAccount] = useState('')
    const [formData, setFormData] = useState({
        addressTo: '',
        amount: '',
        keyword: '',
        message: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [transactionCount, setTransactionCount] = useState(
        localStorage.getItem('transactionCount') || 0,
    )

    const handleChange = (e: any, name: any) => {
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }))
    }

    const checkifWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert('Please connect your wallet')

            const accounts = await ethereum.request({ method: 'eth_accounts' })

            if (accounts.length) {
                setCurrentAccount(accounts[0])

                // getAllTransactions()
            } else {
                console.log('No Accounts Found')
            }

            console.log(accounts)
        } catch (error) {
            console.log(error)
            throw new Error('No ethereum object.')
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert('Please connect your wallet')
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts',
            })
            setCurrentAccount(accounts[0])
        } catch (error) {
            console.log(error)
            throw new Error('No ethereum object.')
        }
    }

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert('Please connect your wallet')

            const { addressTo, amount, keyword, message } = formData
            const transactionContract = getEthereumContract()
            const parsedAmount = ethers.utils.parseEther(amount)

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: currentAccount,
                        to: addressTo,
                        gas: '0x5208', //2100 GWEI
                        value: parsedAmount._hex, //0.0001
                    },
                ],
            })

            const transactionHash = await transactionContract.addToBlockchain(
                addressTo,
                parsedAmount,
                message,
                keyword,
            )
            setIsLoading(true)
            console.log(`Loading ${transactionHash.hash}`)
            await transactionHash.wait()
            setIsLoading(false)
            console.log(`Success ${transactionHash.hash}`)
            const transactionCount =
                await transactionContract.getTransactionCount()
            setTransactionCount(transactionCount.toNumber())
        } catch (error) {
            console.log(error)
            throw new Error('No ethereum object.')
        }
    }

    useEffect(() => {
        checkifWalletIsConnected()
    }, [])

    return (
        <TransactionContext.Provider
            value={{
                connectWallet,
                currentAccount,
                formData,
                setFormData,
                handleChange,
                sendTransaction,
            }}
        >
            {children}
        </TransactionContext.Provider>
    )
}
