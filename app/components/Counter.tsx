'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { useState, useEffect } from 'react';
import idl from '../idl/counter.json';

const programID = new web3.PublicKey('7aYnHPXnQvHAQAadaHkJNysUA5zNqvHeJ2EoC9oy8pCs');

export default function Counter() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [count, setCount] = useState<number | null>(null);
  const [counterAccount, setCounterAccount] = useState<web3.Keypair | null>(null);
  const [loading, setLoading] = useState(false);

  const getProvider = () => {
    if (!wallet.publicKey) return null;
    const provider = new AnchorProvider(connection, wallet as any, {
      commitment: 'confirmed',
    });
    return provider;
  };

  const getProgram = () => {
    const provider = getProvider();
    if (!provider) return null;
    return new Program(idl as any, provider);
  };

  const initialize = async () => {
    const program = getProgram();
    if (!program || !wallet.publicKey) return;

    setLoading(true);
    try {
      const newCounter = web3.Keypair.generate();
      
      await program.methods
        .initialize()
        .accounts({
          counter: newCounter.publicKey,
          user: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([newCounter])
        .rpc();

      setCounterAccount(newCounter);
      await fetchCount(newCounter.publicKey);
      alert('Counter initialized!');
    } catch (error) {
      console.error('Error initializing counter:', error);
      alert('Failed to initialize counter');
    }
    setLoading(false);
  };

  const increment = async () => {
    const program = getProgram();
    if (!program || !counterAccount) return;

    setLoading(true);
    try {
      await program.methods
        .increment()
        .accounts({
          counter: counterAccount.publicKey,
        })
        .rpc();

      await fetchCount(counterAccount.publicKey);
    } catch (error) {
      console.error('Error incrementing:', error);
    }
    setLoading(false);
  };

  const decrement = async () => {
    const program = getProgram();
    if (!program || !counterAccount) return;

    setLoading(true);
    try {
      await program.methods
        .decrement()
        .accounts({
          counter: counterAccount.publicKey,
        })
        .rpc();

      await fetchCount(counterAccount.publicKey);
    } catch (error) {
      console.error('Error decrementing:', error);
    }
    setLoading(false);
  };

  const fetchCount = async (pubkey: web3.PublicKey) => {
    const program = getProgram();
    if (!program) return;

    try {
      const account = await program.account.counter.fetch(pubkey);
      setCount((account.count as BN).toNumber());
    } catch (error) {
      console.error('Error fetching count:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800">Counter DApp</h2>
      
      {count !== null && (
        <div className="text-6xl font-bold text-blue-600">{count}</div>
      )}

      {!wallet.connected ? (
        <p className="text-gray-600">Connect your wallet to get started</p>
      ) : !counterAccount ? (
        <button
          onClick={initialize}
          disabled={loading}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Initializing...' : 'Initialize Counter'}
        </button>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={decrement}
            disabled={loading}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            -
          </button>
          <button
            onClick={increment}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}