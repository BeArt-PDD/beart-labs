'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { watchConnections } from '@wagmi/core'
import { BrowserProvider } from 'ethers';
import { SiweMessage } from 'siwe'
import { FaWallet, FaLink, FaSignOutAlt, FaNetworkWired, FaMoon, FaSun } from 'react-icons/fa'
import { MdAccountCircle } from 'react-icons/md'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [siweMessage, setSiweMessage] = useState(null)

  const [buttonText, setButtonText] = useState('Connect Wallet')

  useEffect(() => {
    if (account.status === 'connected') {
      setButtonText('Sign-In with Ethereum')
    } else {
      setButtonText('Connect Wallet')
      setIsSignedIn(false)
    }
  }, [account.status])

  useEffect(() => {
    const matchMediaDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateMode = () => setIsDarkMode(matchMediaDarkMode.matches);
    
    // Initial check
    updateMode();
    
    // Add listener
    matchMediaDarkMode.addEventListener('change', updateMode);
    
    // Cleanup listener on unmount
    return () => matchMediaDarkMode.removeEventListener('change', updateMode);
  }, []);

  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const createSiweMessage = (address, statement) => {
    const domain = window.location.host;
    const origin = window.location.origin;
    const message = new SiweMessage({
      domain,
      address,
      statement,
      uri: origin,
      version: '1',
      chainId: account.chainId
    });
    return message.prepareMessage();
  }
  
  const signInWithEthereum = async () => {
    const provider = new BrowserProvider(window.ethereum);
    if (account.status !== 'connected') {
      provider.send('eth_requestAccounts', [])
      .catch(() => console.log('user rejected request'));
      return
    }

    if (typeof window.ethereum === 'undefined') {
      alert('请安装 MetaMask 或其他钱包扩展程序')
      return
    }

    try {
      const signer = await provider.getSigner();
      const message = createSiweMessage(
          signer.address, 
          'Sign in with Ethereum to the app.'
        );
      setSiweMessage(message)
      const signature = await signer.signMessage(message)
          // 模拟服务器验证
      const isValid = true // 假设服务器验证通过
      if (isValid) {
        setIsSignedIn(true)
        alert('成功通过 Ethereum 登录')
      } else {
        alert('通过 Ethereum 登录失败')
      }
    } catch (error) {
      console.error('signInWithEthereum error:', error)
      alert('登录过程中发生错误')
    }
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-300`}>
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} max-w-2xl w-full shadow-md rounded-lg p-6 space-y-6`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">BeArt Labs</h1>
          <button onClick={toggleDarkMode} className="text-xl p-2 rounded-lg transition-colors duration-300">
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <MdAccountCircle className="mr-2" /> Account
          </h2>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
            <div className="mb-2 flex items-center">
              <FaWallet className="mr-2" />
              <span className="font-semibold">Status:</span> {account.status}
            </div>
            <div className="mb-2 flex items-center">
              <FaLink className="mr-2" />
              <span className="font-semibold">Addresses:</span>
              <div className="overflow-x-auto ml-2">
                <span className="inline-block whitespace-nowrap">{JSON.stringify(account.addresses)}</span>
              </div>
            </div>
            <div className="mb-2 flex items-center">
              <FaNetworkWired className="mr-2" />
              <span className="font-semibold">ChainId:</span> {account.chainId}
            </div>
            {account.status === 'connected' && (
              <button
                type="button"
                onClick={() => disconnect()}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
              >
                <FaSignOutAlt className="mr-2" /> Disconnect
              </button>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FaLink className="mr-2" /> Connect
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                type="button"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {connector.name}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <div>{status}</div>
            {error && <div className="text-red-500">{error.message}</div>}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FaLink className="mr-2" /> Sign-In with Ethereum
          </h2>
          <button
            onClick={signInWithEthereum}
            type="button"
            className={`w-full px-4 py-2 rounded-lg ${isSignedIn ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
            disabled={isSignedIn}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
