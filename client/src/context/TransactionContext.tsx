import { ethers } from 'ethers'
import React, { useEffect, useState } from 'react'
import { contractABI, contractAddress } from '../utils/constants'

export const TransactionContext = React.createContext<any>({})
const { ethereum }: any = window

const createEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const transactionsContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
    )

    return transactionsContract
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
    const [transactions, setTransactions] = useState([])

    const handleChange = (e: any, name: any) => {
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }))
    }

    const getAllTransactions = async () => {
        try {
            if (!ethereum) return alert('Please connect your wallet')

            const transactionContract = createEthereumContract()
            const availableTransactions =
                await transactionContract.getAllTransactions()

            const structuredTransactions = availableTransactions.map(
                (transaction: any) => {
                    return {
                        addressTo: transaction.receiver,
                        addressFrom: transaction.sender,
                        timestamp: new Date(
                            transaction.timestamp.toNumber() * 1000,
                        ).toLocaleString(),
                        message: transaction.message,
                        keyword: transaction.keyword,
                        amount: parseInt(transaction.amount._hex) / 10 ** 18,
                    }
                },
            )

            console.log(structuredTransactions)
            setTransactions(structuredTransactions)

            console.log(availableTransactions)
        } catch (error) {
            console.log(error)
        }
    }

    const checkifWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert('Please connect your wallet')

            const accounts = await ethereum.request({ method: 'eth_accounts' })

            if (accounts.length) {
                setCurrentAccount(accounts[0])

                getAllTransactions()
            } else {
                console.log('No Accounts Found')
            }

            console.log(accounts)
        } catch (error) {
            console.log(error)
            throw new Error('No ethereum object.')
        }
    }

    const checkIfTransactionsExists = async () => {
        try {
            if (ethereum) {
                const transactionsContract = createEthereumContract()
                const currentTransactionCount =
                    await transactionsContract.getTransactionCount()

                window.localStorage.setItem(
                    'transactionCount',
                    currentTransactionCount,
                )
            }
        } catch (error) {
            console.log(error)

            throw new Error('No ethereum object')
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert('Please connect your wallet')
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts',
            })
            setCurrentAccount(accounts[0])
            window.location.reload()
        } catch (error) {
            console.log(error)
            throw new Error('No ethereum object.')
        }
    }

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert('Please connect your wallet')

            const { addressTo, amount, keyword, message } = formData
            const transactionContract = createEthereumContract()
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
            window.location.reload()
        } catch (error) {
            console.log(error)
            throw new Error('No ethereum object.')
        }
    }

    useEffect(() => {
        checkifWalletIsConnected()
        checkIfTransactionsExists()
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
                transactions,
                isLoading,
            }}
        >
            {children}
        </TransactionContext.Provider>
    )
}
