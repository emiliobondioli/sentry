const Limits = {
    displayLimit: 0.01
  }
  
const createListObj = (_name, deposit, _yield) => {
  return({
    name: _name,
    deposit: deposit,
    yield: _yield,
    total: Number(deposit) + Number(_yield)
  })
}

export const getTotalDeposit = (data) => {
  const {pancakeData,
    streetData,
    beefyData,
    creamData,
    jetfuelData,
    venusData,
    bDollarData,
    autofarmData
  } = data

  // beefy
  const list = []
  const deposits = []
  const yields = []
  let i = 0
  // Beefy
  if (Object.keys(beefyData).length > 0 ) {
    deposits.push(beefyData.vaults.totalUSDValues.deposit
      + beefyData.LPVaults.totalUSDValues.deposit
      + beefyData.barnOfTrust.totalUSDValues.deposit
      + beefyData.staking.totalUSDValues.deposit)
    yields.push(beefyData.vaults.totalUSDValues.yield
      + beefyData.LPVaults.totalUSDValues.yield
      + beefyData.barnOfTrust.totalUSDValues.yield
      + beefyData.staking.totalUSDValues.yield)
    list.push(createListObj('beefy', deposits[i], yields[i])); i++
  }
  // Thugs
  if (Object.keys(streetData).length > 0 ) {
    deposits.push(streetData.vaults.totalUSDValues.deposit
      + streetData.LPStaking.totalUSDValues.deposit
      + streetData.eastWestStaking.totalUSDValues.deposit
      + streetData.staking.totalUSDValues.deposit)
    yields.push(streetData.vaults.totalUSDValues.yield)
      + streetData.LPStaking.totalUSDValues.yield
      + streetData.eastWestStaking.totalUSDValues.yield
      + streetData.staking.totalUSDValues.yield
    list.push(createListObj('thugs', deposits[i], yields[i])); i++
  }
  // Pancake
  if (Object.keys(pancakeData).length > 0 ) {
    deposits.push(pancakeData.LPStaking.totalUSDValues.deposit
      + pancakeData.staking.totalUSDValues.deposit)
    yields.push(pancakeData.LPStaking.totalUSDValues.yield
      + pancakeData.staking.totalUSDValues.yield)
    list.push(createListObj('pancake', deposits[i], yields[i])); i++
  }
  // Venus
  if (Object.keys(venusData).length > 0 ) {
    // VAI herausrechnen, wenn es bei VAI Staking deposited wurde
    const borrowVAI = venusData.supplyBorrowData.vaults.find(vault => vault.inputToken === 'VAI' && vault.borrowAmount > 0 )
    const stakingVAI = venusData.staking.vaults.find(vault => vault.depositToken === 'VAI' && vault.depositedTokens > 0 )
    let correctionAmount = 0
    if (borrowVAI !== undefined && stakingVAI !== undefined) {
      correctionAmount = -borrowVAI.borrowAmount
    }

    deposits.push(venusData.supplyBorrowData.totalUSDValues.supply + venusData.staking.totalUSDValues.deposit + correctionAmount)
    yields.push(venusData.staking.totalUSDValues.yield)
    list.push(createListObj('venus', deposits[i], yields[i])); i++
  }
  // Jetfuel
  if (Object.keys(jetfuelData).length > 0 ) {
    deposits.push(jetfuelData.LPStaking.totalUSDValues.deposit
      + jetfuelData.LPVaults.totalUSDValues.deposit
      + jetfuelData.vaults.totalUSDValues.deposit
      + jetfuelData.staking.totalUSDValues.deposit)
    yields.push(jetfuelData.LPStaking.totalUSDValues.yield
      + jetfuelData.LPVaults.totalUSDValues.yield
      + jetfuelData.vaults.totalUSDValues.yield
      + jetfuelData.staking.totalUSDValues.yield)
    list.push(createListObj('jetfuel', deposits[i], yields[i])); i++
  }
  // BDollar
  if (Object.keys(bDollarData).length > 0 ) {
    deposits.push(bDollarData.LPStaking.totalUSDValues.deposit
      + bDollarData.vaults.totalUSDValues.deposit
      + bDollarData.staking.totalUSDValues.deposit)
    yields.push(bDollarData.LPStaking.totalUSDValues.yield
      + bDollarData.vaults.totalUSDValues.yield
      + bDollarData.staking.totalUSDValues.yield)
    list.push(createListObj('bdollar', deposits[i], yields[i])); i++
  }
  // Autofarm
  if (Object.keys(autofarmData).length > 0 ) {
    deposits.push(autofarmData.LPVaults.totalUSDValues.deposit
      + autofarmData.vaults.totalUSDValues.deposit)
    yields.push(autofarmData.LPVaults.totalUSDValues.yield
      + autofarmData.vaults.totalUSDValues.yield)
    list.push(createListObj('auto', deposits[i], yields[i])); i++
  }

  // Cream
  if (Object.keys(creamData).length > 0 ) {
    deposits.push(creamData.supplyBorrowData.totalUSDValues.supply)
    list.push(createListObj('cream', deposits[i], 0.0)); i++
  }

  const orderedList = list.sort((a, b) => Number(b.total) - Number(a.total) )
  let totalDeposit = deposits.reduce((s,c) => s + Number(c), 0.0)
  let totalYield = yields.reduce((s,c) => s + Number(c), 0.0)
  return {
    totalDeposit,
    totalYield,
    orderedList
  }

}


// ------------------------------
// Single Token Staking
// ------------------------------
export const getTotalUSDValueTokenStaking = (d) => {
  try {
    const result = d.reduce((s, c) => s + getSingleUSDValueTokenStaking(c), 0)
    return result > Limits.displayLimit ? result : 0
  } catch (error) {
    return 0.22
  }
}

export const getSingleUSDValueTokenStaking = (d) => {
  try {
    const result = Number(d.pendingRewards)*d.priceInUSDRewardToken + Number(d.depositedTokens)*d.priceInUSDDepositToken
    return result > Limits.displayLimit ? result : 0
  } catch (error) {
    return 0.22
  }
}

// ------------------------------
// LP Staking
// ------------------------------
export const getTotalUSDValueLPStaking = (d) => {
  try {
    const result = d.reduce((s, c) => s + getSingleUSDValueLPStaking(c) ,0)
    return result > Limits.displayLimit ? result : 0
  } catch (error) {
    return 0.22
  }
}

export const getSingleUSDValueLPStaking = (d) => {
  try {
    const result = Number(d.pendingRewards)*d.priceInUSDRewardToken
      + d.LPInfo.currentToken0*d.LPInfo.priceInUSDToken0
      + d.LPInfo.currentToken1*d.LPInfo.priceInUSDToken1
    return result > Limits.displayLimit ? result : 0
  } catch (error) {
    return 0.22
  }
}

// ------------------------------
// Vaults
// ------------------------------
export const getTotalUSDValueVault = (d) => {
  try {
    const result = d.reduce((s, c) => s + getSingleUSDValueVault(c), 0)
    return result > Limits.displayLimit ? result : 0
  } catch (error) {
    return 0.22
  }
}

export const getSingleUSDValueVault = (d) => {
  try {
    const result = Number(d.currentTokens)*Number(d.priceInUSD)
    return result > Limits.displayLimit ? result : 0
  } catch (error) {
    return 0.22
  }
}

export const getTotalDepositUSDValueVault = (d) => {
  try {
    const result = d.reduce((s, c) => s + getSingleDepositUSDValueVault(c), 0)
    return result > Limits.displayLimit ? result : 0
  } catch (error) {
    return 0.22
  }
}

export const getSingleDepositUSDValueVault = (d) => {
  try {
    const result = Number(d.depositedTokens)*Number(d.priceInUSD)
    return result > Limits.displayLimit ? result : 0
  } catch (error) {
    return 0.22
  }
}

export const getTotalYieldUSDValueVault = (d) => {
  try {
    const result = d.reduce((s, c) => s + getSingleYieldUSDValueVault(c), 0)
    return result > Limits.displayLimit ? result : 0
  } catch (error) {
    return 0.22
  }
}

export const getSingleYieldUSDValueVault = (d) => {
  try {
    const result = Number(d.currentTokens - d.depositedTokens)*Number(d.priceInUSD)
    return result > Limits.displayLimit ? result : 0
  } catch (error) {
    return 0.22
  }
}



