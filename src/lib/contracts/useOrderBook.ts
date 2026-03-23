import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import addresses from '../../../shared/addresses.json'

const ORDER_BOOK_ABI = [
  {
    name: 'submitCommitment',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'cancelCommitment',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'getOpenCommitments',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32[]' }],
  },
] as const

export function useSubmitCommitment() {
  const { writeContractAsync, isPending, data: txHash } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const submit = async (commitmentHash: string, escrowEth: string) => {
    const cleaned = escrowEth.replace(/,/g, '').trim()
    return writeContractAsync({
      address: addresses.orderBook as `0x${string}`,
      abi: ORDER_BOOK_ABI,
      functionName: 'submitCommitment',
      args: [commitmentHash as `0x${string}`],
      value: parseEther(cleaned),
    })
  }

  return {
    submit,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
  }
}
