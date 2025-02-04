import { SettingOutlined } from '@ant-design/icons'
import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { Button, Skeleton, Space, Tooltip } from 'antd'
import { CardSection } from 'components/CardSection'
import SpendingStats from 'components/Project/SpendingStats'
import TooltipLabel from 'components/TooltipLabel'
import SplitList from 'components/v2/shared/SplitList'
import { ThemeContext } from 'contexts/themeContext'
import { V2ProjectContext } from 'contexts/v2/projectContext'
import { useETHPaymentTerminalFee } from 'hooks/v2/contractReader/ETHPaymentTerminalFee'
import { useV2ConnectedWalletHasPermission } from 'hooks/v2/contractReader/V2ConnectedWalletHasPermission'
import { V2CurrencyOption } from 'models/v2/currencyOption'
import { V2OperatorPermission } from 'models/v2/permissions'
import { Split } from 'models/v2/splits'
import Link from 'next/link'
import { useContext, useState } from 'react'
import { detailedTimeString } from 'utils/formatTime'
import { settingsPagePath } from 'utils/routes'
import { V2CurrencyName } from 'utils/v2/currency'
import { formatFee, MAX_DISTRIBUTION_LIMIT } from 'utils/v2/math'
import { reloadWindow } from 'utils/windowUtils'
import DistributePayoutsModal from './modals/DistributePayoutsModal'

export default function PayoutSplitsCard({
  hideDistributeButton,
  payoutSplits,
  distributionLimitCurrency,
  distributionLimit,
  fundingCycleDuration,
}: {
  hideDistributeButton?: boolean
  payoutSplits: Split[] | undefined
  distributionLimitCurrency: BigNumber | undefined
  distributionLimit: BigNumber | undefined
  fundingCycleDuration: BigNumber | undefined
}) {
  const {
    theme: { colors },
  } = useContext(ThemeContext)
  const {
    usedDistributionLimit,
    projectOwnerAddress,
    balanceInDistributionLimitCurrency,
    isPreviewMode,
    loading,
    projectId,
    handle,
  } = useContext(V2ProjectContext)
  const ETHPaymentTerminalFee = useETHPaymentTerminalFee()

  const [distributePayoutsModalVisible, setDistributePayoutsModalVisible] =
    useState<boolean>()
  const isLoadingStats =
    loading.ETHBalanceLoading ||
    loading.distributionLimitLoading ||
    loading.balanceInDistributionLimitCurrencyLoading ||
    loading.usedDistributionLimitLoading

  const formattedDuration = detailedTimeString({
    timeSeconds: fundingCycleDuration?.toNumber(),
    fullWords: true,
  })
  const hasDuration = fundingCycleDuration?.gt(0)
  const canEditPayouts = useV2ConnectedWalletHasPermission(
    V2OperatorPermission.SET_SPLITS,
  )

  const effectiveDistributionLimit = distributionLimit ?? BigNumber.from(0)
  const distributedAmount = usedDistributionLimit ?? BigNumber.from(0)

  const distributable = effectiveDistributionLimit.sub(distributedAmount)

  const distributableAmount = balanceInDistributionLimitCurrency?.gt(
    distributable,
  )
    ? distributable
    : balanceInDistributionLimitCurrency

  const distributeButtonDisabled = isPreviewMode || distributableAmount?.eq(0)

  function DistributeButton(): JSX.Element {
    return (
      <Tooltip
        title={<Trans>No funds available to distribute.</Trans>}
        visible={distributeButtonDisabled ? undefined : false}
      >
        <Button
          type="ghost"
          size="small"
          onClick={() => setDistributePayoutsModalVisible(true)}
          disabled={distributeButtonDisabled}
        >
          <Trans>Distribute funds</Trans>
        </Button>
      </Tooltip>
    )
  }

  return (
    <CardSection>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {hideDistributeButton ? null : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <Skeleton
              loading={isLoadingStats}
              active
              title={false}
              paragraph={{ rows: 2, width: ['60%', '60%'] }}
            >
              <SpendingStats
                hasFundingTarget={distributionLimit?.gt(0)}
                currency={V2CurrencyName(
                  distributionLimitCurrency?.toNumber() as V2CurrencyOption,
                )}
                distributableAmount={distributableAmount}
                targetAmount={distributionLimit ?? BigNumber.from(0)}
                distributedAmount={distributedAmount}
                feePercentage={
                  ETHPaymentTerminalFee
                    ? formatFee(ETHPaymentTerminalFee)
                    : undefined
                }
                ownerAddress={projectOwnerAddress}
              />
            </Skeleton>

            <div>
              <DistributeButton />
            </div>
          </div>
        )}

        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <TooltipLabel
              label={
                <h4 style={{ display: 'inline-block' }}>
                  <Trans>Funding distribution</Trans>
                </h4>
              }
              tip={
                <Trans>
                  Available funds can be distributed according to the payouts
                  below
                  {hasDuration ? ` every ${formattedDuration}` : null}.
                </Trans>
              }
            />
            {canEditPayouts && effectiveDistributionLimit.gt(0) && (
              <Link href={settingsPagePath('payouts', { projectId, handle })}>
                <Button
                  size="small"
                  icon={<SettingOutlined />}
                  style={{ marginBottom: '1rem' }}
                >
                  <span>
                    <Trans>Edit payouts</Trans>
                  </span>
                </Button>
              </Link>
            )}
          </div>
          {effectiveDistributionLimit.gt(0) ? (
            payoutSplits ? (
              <SplitList
                splits={payoutSplits}
                currency={distributionLimitCurrency}
                totalValue={distributionLimit}
                projectOwnerAddress={projectOwnerAddress}
                showSplitValues={!distributionLimit?.eq(MAX_DISTRIBUTION_LIMIT)}
                valueFormatProps={{ precision: 4 }}
              />
            ) : null
          ) : (
            <span style={{ color: colors.text.tertiary }}>
              <Trans>This project has no distributions.</Trans>
            </span>
          )}
        </div>
      </Space>

      <DistributePayoutsModal
        visible={distributePayoutsModalVisible}
        onCancel={() => setDistributePayoutsModalVisible(false)}
        onConfirmed={reloadWindow}
      />
    </CardSection>
  )
}
