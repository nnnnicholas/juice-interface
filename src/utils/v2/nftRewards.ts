import { ContractNftRewardTier } from 'hooks/v2/transactor/LaunchProjectWithNftsTx'
import { NftRewardTier } from 'models/v2/nftRewardTier'

// Returns the highest NFT reward tier that a payer is eligible given their pay amount
export function getNftRewardTier({
  payAmountETH,
  nftRewardTiers,
}: {
  payAmountETH: number
  nftRewardTiers: NftRewardTier[]
}) {
  let nftReward: NftRewardTier | null = null
  // all nft's who's thresholds are below the pay amount
  const eligibleNftRewards = nftRewardTiers.filter(rewardTier => {
    return rewardTier.contributionFloor <= payAmountETH
  })
  if (eligibleNftRewards.length) {
    // take the maximum which is the only one received by payer
    nftReward = eligibleNftRewards.reduce((prev, curr) => {
      return prev.contributionFloor > curr.contributionFloor ? prev : curr
    })
  }
  return nftReward
}

// Sorts array of nft reward tiers by contributionFloor
export function sortNftRewardTiers(
  rewardTiers: NftRewardTier[],
): NftRewardTier[] {
  return rewardTiers.sort((a, b) =>
    a.contributionFloor > b.contributionFloor
      ? 1
      : b.contributionFloor > a.contributionFloor
      ? -1
      : 0,
  )
}

// returns an array of CIDs from a given array of RewardTier obj's
export function CIDsOfNftRewardTiersResponse(
  nftRewardTiersResponse: ContractNftRewardTier[],
): string[] {
  const cids: string[] = []
  nftRewardTiersResponse.map((contractRewardTier: ContractNftRewardTier) => {
    const cid = contractRewardTier.tokenUri.split('/')[1]
    if (cid) {
      cids.push(cid)
    }
  })
  return cids
}

export const MOCK_NFTs: NftRewardTier[] = [
  {
    name: 'Popcorn Banny',
    description: 'This Banny loves to watch shit go down in the Discord. ',
    imageUrl:
      'https://jbx.mypinata.cloud/ipfs/QmW7TPgipVPag1W1iZPcJDE4YRv9Mb5wY9AvxgFcPaFEXH',
    contributionFloor: 0.1,
    maxSupply: 10,
    externalLink: 'https://juicebox.money',
  },
  {
    name: 'Penguin dude',
    description:
      "This NFT gives you an unbelievable amount of shit IRL. And it's a penguin wearing a hat.",
    imageUrl:
      'http://www.artrights.me/wp-content/uploads/2021/09/unnamed-1.png',
    contributionFloor: 1,
    maxSupply: 10,
    externalLink: 'https://juicebox.money',
  },
  {
    name: 'Elon Musk',
    description:
      'Elon Musk is playing his part in curbing declining birth rates.',
    imageUrl:
      'https://cms.qz.com/wp-content/uploads/2022/04/2022-04-05T124700Z_1953872473_RC20HT92RUJ9_RTRMADP_3_MUSK-TWITTER-BOARD-2-e1650904633294.jpg?quality=75&strip=all&w=1200&h=900&crop=1',
    contributionFloor: 10,
    maxSupply: 10,
    externalLink: 'https://juicebox.money',
  },
]

// Points to `MOCK_NFTs` (above) on IPFS
export const MOCK_NFT_CIDs = [
  'QmWyQLyb4nnuFSLxDJNDBUEFXLHhJHbv9weMzJyuzc6x31',
  'QmRgN4e9em7Ehe48TBeHcr69kRJC8sN3dm3pZRPc5JXHrR',
  'QmQya4Gnj3WehNXwbhqT4jPkvvjDuHy3zhEFBTF9xP7kRX',
]
