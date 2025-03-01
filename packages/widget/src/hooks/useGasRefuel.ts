import { useAccount } from '@lifi/wallet-management'
import { useMemo } from 'react'
import { useFieldValues } from '../stores/form/useFieldValues.js'
import { useAvailableChains } from './useAvailableChains.js'
import { useGasRecommendation } from './useGasRecommendation.js'
import { useIsContractAddress } from './useIsContractAddress.js'
import { useTokenBalance } from './useTokenBalance.js'

export const useGasRefuel = () => {
  const { getChainById } = useAvailableChains()

  const [fromChainId, fromTokenAddress, toChainId, toAddress] = useFieldValues(
    'fromChain',
    'fromToken',
    'toChain',
    'toAddress'
  )

  const toChain = getChainById(toChainId)
  const fromChain = getChainById(fromChainId)

  const { accounts } = useAccount()

  const fromAccount = accounts.find(
    (account) => account.chainType === fromChain?.chainType
  )

  const toAccount = accounts.find(
    (account) => account.chainType === toChain?.chainType
  )

  const isFromContractAddress = useIsContractAddress(
    fromAccount?.address,
    fromChainId,
    fromAccount?.chainType
  )
  const isToContractAddress = useIsContractAddress(
    toAddress,
    toChainId,
    toChain?.chainType
  )

  const { token: destinationNativeToken } = useTokenBalance(
    toAddress || toAccount?.address,
    toChainId ? toChain?.nativeToken : undefined
  )

  const { data: gasRecommendation, isLoading } = useGasRecommendation(
    toChainId,
    fromChainId,
    fromTokenAddress
  )

  // When we bridge between ecosystems we need to be sure toAddress is set
  const isChainTypeSatisfied =
    fromChain?.chainType !== toChain?.chainType ? Boolean(toAddress) : true

  const isToAddressSatisfied = isFromContractAddress
    ? toAddress && toAddress !== fromAccount?.address && !isToContractAddress
    : true

  const enabled = useMemo(() => {
    if (
      // We don't allow same chain refuel.
      // If a user runs out of gas, he can't send a source chain transaction.
      fromChainId === toChainId ||
      !gasRecommendation?.available ||
      !gasRecommendation?.recommended ||
      !destinationNativeToken ||
      !isChainTypeSatisfied ||
      !isToAddressSatisfied
    ) {
      return false
    }
    const tokenBalance = destinationNativeToken.amount ?? 0n

    // Check if the user balance < 50% of the recommended amount
    const recommendedAmount = BigInt(gasRecommendation.recommended.amount) / 2n

    const insufficientGas = tokenBalance < recommendedAmount
    return insufficientGas
  }, [
    fromChainId,
    gasRecommendation,
    isChainTypeSatisfied,
    isToAddressSatisfied,
    destinationNativeToken,
    toChainId,
  ])

  return {
    enabled: enabled,
    availble: gasRecommendation?.available,
    isLoading: isLoading,
    chain: toChain,
    fromAmount: gasRecommendation?.available
      ? gasRecommendation.fromAmount
      : undefined,
  }
}
