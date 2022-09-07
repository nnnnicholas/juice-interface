import { t } from '@lingui/macro'
import { V2ProjectContext } from 'contexts/v2/projectContext'
import { V2UserContext } from 'contexts/v2/userContext'
import { useWallet } from 'hooks/Wallet'
import { useContext } from 'react'

import { TransactorInstance } from '../../Transactor'
import { useV2ProjectTitle } from '../ProjectTitle'

export function useSetV1ProjectIdTx(): TransactorInstance<{
  v1ProjectId: number
}> {
  const { transactor, contracts } = useContext(V2UserContext)
  const { projectId } = useContext(V2ProjectContext)
  const projectTitle = useV2ProjectTitle()
  const { signer } = useWallet()

  return ({ v1ProjectId }, txOpts) => {
    if (
      !transactor ||
      !projectId ||
      !signer ||
      !contracts?.JBV1TokenPaymentTerminal
    ) {
      txOpts?.onDone?.()
      return Promise.resolve(false)
    }

    return transactor(
      contracts.JBV1TokenPaymentTerminal,
      'setV1ProjectIdOf',
      [projectId, v1ProjectId],
      {
        ...txOpts,
        title: t`Set V1 project of ${projectTitle}`,
      },
    )
  }
}
