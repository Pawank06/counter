'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Counter from './components/Counter';
import { WalletContextProvider } from './components/WalletContextProvider';

export default function Home() {
  return (
    <WalletContextProvider>
      <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Solana Counter</h1>
            <WalletMultiButton />
          </div>
          <Counter />
        </div>
      </main>
    </WalletContextProvider>
  );
}