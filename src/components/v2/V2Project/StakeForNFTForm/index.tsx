import { Trans } from '@lingui/macro'
import { Button, Divider, Form, Space, Col, Row, Select, Input } from 'antd'
import { tokenSymbolText } from 'utils/tokenSymbolText'
import { V2ProjectContext } from 'contexts/v2/projectContext'
import { ThemeContext } from 'contexts/themeContext'

import { useContext, useState } from 'react'

import useTotalBalanceOf from 'hooks/v2/contractReader/TotalBalanceOf'

import { NetworkContext } from 'contexts/networkContext'

import { fromWad } from 'utils/formatNumber'

import FormattedNumberInput from 'components/shared/inputs/FormattedNumberInput'

import { NFTProjectContext } from 'contexts/v2/nftProjectContext'

import { BigNumber } from '@ethersproject/bignumber'

import StakedTokenStatsSection from './StakedTokenStatsSection'
import StakingTokenRangesModal from './StakingTokenRangesModal'
import ConfirmStakeModal from './ConfirmStakeModal'

const FakeTokenStatsData = {
  initialLocked: 0.0,
  totalStaked: 2668000000,
  userTotalLocked: 10159000,
  totalStakedPeriodInDays: 10,
}

export default function StakeForNFTForm({
  onClose,
}: {
  onClose: VoidFunction
}) {
  const { userAddress } = useContext(NetworkContext)
  const [tokenRangesModalVisible, setTokenRangesModalVisible] = useState(false)
  const { lockDurationOptions } = useContext(NFTProjectContext)
  const lockDurationOptionsInSeconds = lockDurationOptions
    ? lockDurationOptions.map((option: BigNumber) => {
        return option.toNumber()
      })
    : []
  const [confirmStakeModalVisible, setConfirmStakeModalVisible] =
    useState(false)

  const [tokensStaked, setTokensStaked] = useState('200')
  const [lockDuration, setLockDuration] = useState(864000)

  const { tokenSymbol, tokenName, projectMetadata, projectId } =
    useContext(V2ProjectContext)

  const { data: totalBalance } = useTotalBalanceOf(userAddress, projectId)

  const projectName = projectMetadata?.name ?? 'Untitled Project'
  const maxLockDuration = 1000
  const totalBalanceInWad = parseInt(fromWad(totalBalance))
  const unstakedTokens = totalBalance
    ? totalBalanceInWad - parseInt(tokensStaked)
    : 0
  const votingPower = parseInt(tokensStaked) * (lockDuration / maxLockDuration)

  const {
    theme: { colors },
  } = useContext(ThemeContext)

  return (
    <Form layout="vertical" style={{ width: '100%' }}>
      <Space size="middle" direction="vertical">
        <h1>
          <Trans>Lock {tokenName} for Voting Power</Trans>
        </h1>
        <div style={{ color: colors.text.secondary }}>
          <p>
            <Trans>
              Stake {tokenName} (${tokenSymbolText({ tokenSymbol })}) tokens for
              irrevocable durations (in days) in exchange for voting weight. In
              return, you will impact {projectName} governance and receive a
              choice anathropomorphic banana character NFT.
            </Trans>
          </p>
        </div>
        <Button block onClick={() => setTokenRangesModalVisible(true)}>
          <Trans>View Token Ranges</Trans>
        </Button>
        <h4>
          <Trans>
            Voting weight is a function of how many $
            {tokenSymbolText({ tokenSymbol })} you have locked for how long
            intitially divided by how much time left in that lock period.
          </Trans>
        </h4>
      </Space>
      <Form.Item
        extra={
          <div style={{ color: colors.text.primary, marginBottom: 10 }}>
            <p style={{ float: 'left' }}>
              <Trans>{tokenSymbolText({ tokenSymbol })} to lock</Trans>
            </p>
            <p style={{ float: 'right' }}>
              <Trans>Remaining: {unstakedTokens}</Trans>
            </p>
          </div>
        }
      >
        <FormattedNumberInput
          name="tokensStaked"
          value={tokensStaked}
          onChange={val => {
            setTokensStaked(val ?? '0')
          }}
        />
      </Form.Item>
      <Row>
        <Col span={14}>
          <Form.Item
            extra={
              <div style={{ color: colors.text.primary, marginBottom: 10 }}>
                <Trans>Days Locked</Trans>
              </div>
            }
          >
            <Select value={lockDuration} onChange={val => setLockDuration(val)}>
              {lockDurationOptionsInSeconds.map((duration: number) => {
                return (
                  <Select.Option key={duration} value={duration}>
                    {duration / 86400}
                  </Select.Option>
                )
              })}
            </Select>
          </Form.Item>
        </Col>
        <Col span={4}>
          <p style={{ textAlign: 'center' }}>=</p>
        </Col>
        <Col span={6}>
          <Form.Item
            extra={
              <div
                style={{
                  color: colors.text.primary,
                  marginBottom: 10,
                  textAlign: 'right',
                }}
              >
                <Trans>Voting Power</Trans>
              </div>
            }
          >
            <Input disabled={true} value={`${votingPower} VotePWR`} />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ color: colors.text.secondary, textAlign: 'center' }}>
        <p>
          <Trans>
            Voting Power = Tokens * ( Lock Time Remaining / Max Lock Time )
          </Trans>
        </p>
        <p>
          <Trans>
            VP decays over time linearly. When @ 5 days of 19 day lock = 50%
            PWR.
          </Trans>
        </p>
      </div>

      {/* <StakingNFTCarousel activeIdx={1} stakingNFTs={FakeStakingNFTs} /> */}
      <Space size="middle" direction="vertical" style={{ width: '100%' }}>
        <Button
          block
          style={{ whiteSpace: 'pre' }}
          onClick={() => setConfirmStakeModalVisible(true)}
        >
          IRREVOCABLY STAKE{' '}
          <span style={{ color: colors.text.primary }}>[{tokensStaked}]</span> $
          {tokenSymbol} for{' '}
          <span style={{ color: colors.text.primary }}>[{lockDuration}]</span>{' '}
          days
        </Button>
      </Space>
      <Divider />
      {/* <OwnedNFTsSection ownedNFTs={FakeOwnedNFTS} tokenSymbol={tokenSymbol!} /> */}
      <StakedTokenStatsSection
        {...FakeTokenStatsData}
        tokenSymbol={tokenSymbol!}
      />
      <Form.Item>
        <Button block onClick={onClose}>
          <Trans>Close</Trans>
        </Button>
      </Form.Item>
      <StakingTokenRangesModal
        visible={tokenRangesModalVisible}
        onCancel={() => setTokenRangesModalVisible(false)}
        tokenSymbol={tokenSymbol!}
      />
      <ConfirmStakeModal
        visible={confirmStakeModalVisible}
        tokenSymbol={tokenSymbol!}
        tokensStaked={parseInt(tokensStaked)}
        votingPower={votingPower}
        daysStaked={lockDuration}
        maxLockDuration={maxLockDuration}
        onCancel={() => setConfirmStakeModalVisible(false)}
        onOk={() => setConfirmStakeModalVisible(false)}
      />
    </Form>
  )
}
