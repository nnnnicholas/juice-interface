import { BigNumber } from '@ethersproject/bignumber'
import { V2ProjectContext } from 'contexts/v2/projectContext'
import { V2UserContext } from 'contexts/v2/userContext'
import { useContext } from 'react'

import { ETH_TOKEN_ADDRESS } from 'constants/v2/juiceboxTokens'
import invariant from 'tiny-invariant'
import { onCatch, TransactorInstance } from '../../Transactor'

const DEFAULT_METADATA = 0

export function useAddToBalanceTx(): TransactorInstance<{
  value: BigNumber
}> {
  const { transactor, contracts, version } = useContext(V2UserContext)
  const { projectId } = useContext(V2ProjectContext)

  const DEFAULT_MEMO = ''

  return ({ value }, txOpts) => {
    try {
      invariant(transactor && projectId && contracts?.JBETHPaymentTerminal)
      return transactor(
        contracts.JBETHPaymentTerminal,
        'addToBalanceOf',
        [projectId, value, ETH_TOKEN_ADDRESS, DEFAULT_MEMO, DEFAULT_METADATA],
        {
          ...txOpts,
          value,
        },
      )
    } catch {
      const missingParam = !transactor
        ? 'transactor'
        : !projectId
        ? 'projectId'
        : !contracts?.JBETHPaymentTerminal
        ? 'contracts.JBETHPaymentTerminal'
        : undefined

      return onCatch({
        txOpts,
        missingParam,
        version,
        functionName: 'addToBalanceOf',
      })
    }
  }
}
