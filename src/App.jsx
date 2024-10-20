import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

import './App.css'

import { TokenLaunchpad } from './components/TokenLaunchpad'

function App() {
  const RPC = "https://api.devnet.solana.com";
  return (
    <div className='bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% '>
      <div >
        <ConnectionProvider endpoint={RPC} >
          <WalletProvider wallets={[]} autoConnect >
            <WalletModalProvider>
              <div className='flex justify-between pt-4 px-5'>
                <WalletMultiButton />
                <WalletDisconnectButton />
              </div>
              <div className='h-screen items-center'>
                <TokenLaunchpad></TokenLaunchpad>
              </div>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </div>
    </div>
  )
}

export default App
