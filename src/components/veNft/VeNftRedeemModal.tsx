import { t, Trans } from '@lingui/macro'
import { Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useContext, useState } from 'react'

import { ThemeContext } from 'contexts/themeContext'
import { V2ProjectContext } from 'contexts/v2/projectContext'
import { useRedeemVeNftTx } from 'hooks/veNft/transactor/VeNftRedeemTx'
import { VeNftToken } from 'models/subgraph-entities/v2/venft-token'

import { emitSuccessNotification } from 'utils/notifications'

import { MemoFormInput } from 'components/inputs/Pay/MemoFormInput'
import TransactionModal from 'components/TransactionModal'
import CustomBeneficiaryInput from 'components/veNft/formControls/CustomBeneficiaryInput'
import { useWallet } from 'hooks/Wallet'

type VeNftRedeemModalProps = {
  token: VeNftToken
  visible: boolean
  onCancel: VoidFunction
  onCompleted: VoidFunction
}

const VeNftRedeemModal = ({
  token,
  visible,
  onCancel,
  onCompleted,
}: VeNftRedeemModalProps) => {
  const {
    userAddress,
    chainUnsupported,
    isConnected,
    changeNetworks,
    connect,
  } = useWallet()
  const { primaryTerminal, tokenAddress } = useContext(V2ProjectContext)
  const { tokenId } = token
  const [form] = useForm<{ beneficiary: string }>()
  const [loading, setLoading] = useState(false)
  const [transactionPending, setTransactionPending] = useState(false)
  const [memo, setMemo] = useState('')
  const {
    theme: { colors },
  } = useContext(ThemeContext)

  const redeemTx = useRedeemVeNftTx()

  const redeem = async () => {
    const { beneficiary } = form.getFieldsValue()
    await form.validateFields()

    if (chainUnsupported) {
      await changeNetworks()
      return
    }
    if (!isConnected) {
      await connect()
      return
    }

    const txBeneficiary = beneficiary ? beneficiary : userAddress!

    setLoading(true)

    const txSuccess = await redeemTx(
      {
        tokenId,
        token: tokenAddress || '',
        beneficiary: txBeneficiary,
        memo,
        terminal: primaryTerminal ? primaryTerminal : '',
      },
      {
        onDone: () => {
          setTransactionPending(true)
        },
        onConfirmed: () => {
          setTransactionPending(false)
          setLoading(false)
          emitSuccessNotification(
            t`Redeem successful. Results will be indexed in a few moments.`,
          )
          onCompleted()
        },
      },
    )

    if (!txSuccess) {
      return
    }
  }

  return (
    <TransactionModal
      visible={visible}
      title={t`Redeem veNFT`}
      onCancel={onCancel}
      onOk={redeem}
      okText={`Redeem`}
      confirmLoading={loading}
      transactionPending={transactionPending}
    >
      <div style={{ color: colors.text.secondary }}>
        <p>
          <Trans>
            Redeeming this NFT will burn the token, as well as the underlying
            project token, and you will receive token from the project overflow
            in return.
          </Trans>
        </p>
      </div>
      <Form form={form} layout="vertical">
        <MemoFormInput value={memo} onChange={setMemo} />
        <CustomBeneficiaryInput
          form={form}
          labelText={t`Send redeemed token to a custom address`}
        />
      </Form>
    </TransactionModal>
  )
}

export default VeNftRedeemModal
