export function checkProfileCompleteness(user: any) {
  if (!user) {
    return {
      hasPersonal: false,
      hasAddress: false,
      isProfileComplete: false,
      mainAddr: null,
    }
  }

  const mainAddr = user.address || user.addresses?.[0]
  const isShopValid =
    mainAddr?.addressType !== 'shop' || Boolean(mainAddr?.shopName)
  const hasAddress = Boolean(
    mainAddr?.addressLine1 &&
    mainAddr?.street &&
    mainAddr?.pincode &&
    mainAddr?.city &&
    mainAddr?.country &&
    isShopValid,
  )

  const hasPersonal = Boolean(
    user.name && user.phone && user.gender && user.dob,
  )

  const isProfileComplete = hasAddress && hasPersonal

  return { hasPersonal, hasAddress, isProfileComplete, mainAddr }
}
