import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { Trans } from '@lingui/macro'
import { useCurrencyConverter } from 'hooks/CurrencyConverter'
import { useContext, useMemo } from 'react'
import { WeightFunction } from 'utils/math'
import { tokenSymbolText } from 'utils/tokenSymbolText'

import { CurrencyContext } from 'contexts/currencyContext'

import { Tooltip } from 'antd'
import AMMPrices from 'components/AMMPrices'
import { ThemeContext } from 'contexts/themeContext'

import { V2ProjectContext } from 'contexts/v2/projectContext'
import useWeiConverter from 'hooks/WeiConverter'
import { CurrencyOption } from 'models/currencyOption'
import { formattedNum } from 'utils/formatNumber'
import { formatIssuanceRate } from 'utils/v2/math'
import { getNftRewardTier } from 'utils/v2/nftRewards'

/**
 * Help text shown below the Pay input field.
 *
 * If the user has entered an amount, display
 * the amount of project tokens they will receive.
 *
 * Else, display the exchange rate of the user selected currency to project token.
 */
export default function PayInputSubText({
  payInCurrency,
  amount,
  reservedRate,
  weight,
  tokenSymbol,
  tokenAddress,
  weightingFn,
}: {
  payInCurrency: CurrencyOption
  amount: string | undefined
  reservedRate: number | undefined
  weight: BigNumber | undefined
  tokenSymbol: string | undefined
  tokenAddress: string | undefined
  weightingFn: WeightFunction
}) {
  const converter = useCurrencyConverter()
  const {
    theme: { colors },
  } = useContext(ThemeContext)

  const {
    nftRewards: { rewardTiers: nftRewardTiers },
  } = useContext(V2ProjectContext)

  const {
    currencyMetadata,
    currencies: { ETH },
  } = useContext(CurrencyContext)

  const weiPayAmt = useWeiConverter<CurrencyOption>({
    currency: payInCurrency,
    amount: amount,
  })

  const isEligibleForNft =
    nftRewardTiers && amount
      ? getNftRewardTier({
          nftRewardTiers: nftRewardTiers,
          payAmountETH: parseFloat(amount),
        })
      : false

  const tokenText = tokenSymbolText({
    tokenSymbol,
    capitalize: false,
    plural: true,
  })

  const receiveText = useMemo(() => {
    const formatReceivedTickets = (wei: BigNumber) => {
      const exchangeRate = weightingFn(weight, reservedRate, wei, 'payer')
      return formattedNum(formatIssuanceRate(exchangeRate))
    }

    if (weiPayAmt?.gt(0)) {
      const receivedTickets = formatReceivedTickets(weiPayAmt)
      const tokenReceiveText = tokenSymbolText({
        tokenSymbol,
        capitalize: false,
        plural: receivedTickets !== '1',
      })

      return `${receivedTickets} ${tokenReceiveText} ${
        isEligibleForNft ? '+ NFT' : ''
      }`
    }

    const receivedTickets = formatReceivedTickets(
      (payInCurrency === ETH ? parseEther('1') : converter.usdToWei('1')) ??
        BigNumber.from(0),
    )

    const tokenReceiveText = tokenSymbolText({
      tokenSymbol,
      capitalize: false,
      plural: receivedTickets !== '1',
    })

    return `${receivedTickets} ${tokenReceiveText}/1 ${currencyMetadata[payInCurrency]?.name}`
  }, [
    converter,
    payInCurrency,
    weiPayAmt,
    weight,
    currencyMetadata,
    ETH,
    reservedRate,
    tokenSymbol,
    isEligibleForNft,
    weightingFn,
  ])

  return (
    <div
      style={{
        marginTop: '0.3rem',
        fontSize: '.65rem',
        width: '100%',
        color: colors.text.secondary,
      }}
    >
      <span>
        <Trans>Receive {receiveText}</Trans>
      </span>
      {tokenSymbol && tokenAddress && (
        <div>
          <Trans>
            or{' '}
            <Tooltip
              title={
                <AMMPrices
                  tokenSymbol={tokenSymbol}
                  tokenAddress={tokenAddress}
                />
              }
              placement="bottomLeft"
              overlayStyle={{ minWidth: '300px' }}
              overlayInnerStyle={{ padding: '1rem' }}
            >
              <span
                style={{
                  cursor: 'default',
                  paddingTop: '0.5rem',
                  paddingBottom: '1px',
                  borderBottom: '1px dashed' + colors.stroke.secondary,
                }}
              >
                buy {tokenText} on exchange.
              </span>
            </Tooltip>
          </Trans>
        </div>
      )}
    </div>
  )
}
