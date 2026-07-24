import { prisma } from '../../config/prisma.js'

export interface AddressDTO {
  title?: string
  addressType?: string
  shopName?: string
  addressLine1?: string
  addressLine2?: string
  street?: string
  city?: string
  state?: string
  pincode?: string
  googleMapLink?: string
  country?: string
  isDefault?: boolean
}

export class AddressService {
  async getUserAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
  }

  async getAddressById(id: string, userId: string) {
    const address = await prisma.address.findFirst({
      where: { id, userId },
    })
    if (!address) {
      throw new Error('Address not found')
    }
    return address
  }

  async createAddress(userId: string, data: AddressDTO) {
    const existing = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    if (existing) {
      return this.updateAddress(existing.id, userId, data)
    }

    const isDefault = data.isDefault !== undefined ? data.isDefault : true

    return prisma.address.create({
      data: {
        userId,
        title: data.title || null,
        addressType: data.addressType || 'home',
        shopName: data.shopName || null,
        addressLine1: data.addressLine1 || null,
        addressLine2: data.addressLine2 || null,
        street: data.street || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        googleMapLink: data.googleMapLink || null,
        country: data.country || 'India',
        isDefault,
      },
    })
  }

  async updateAddress(id: string, userId: string, data: AddressDTO) {
    const existing = await this.getAddressById(id, userId)

    if (data.isDefault && !existing.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    return prisma.address.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        addressType:
          data.addressType !== undefined ? data.addressType : undefined,
        shopName: data.shopName !== undefined ? data.shopName : undefined,
        addressLine1:
          data.addressLine1 !== undefined ? data.addressLine1 : undefined,
        addressLine2:
          data.addressLine2 !== undefined ? data.addressLine2 : undefined,
        street: data.street !== undefined ? data.street : undefined,
        city: data.city !== undefined ? data.city : undefined,
        state: data.state !== undefined ? data.state : undefined,
        pincode: data.pincode !== undefined ? data.pincode : undefined,
        googleMapLink:
          data.googleMapLink !== undefined ? data.googleMapLink : undefined,
        country: data.country !== undefined ? data.country : undefined,
        isDefault: data.isDefault !== undefined ? data.isDefault : undefined,
      },
    })
  }

  async deleteAddress(id: string, userId: string) {
    const existing = await this.getAddressById(id, userId)

    await prisma.address.delete({ where: { id } })

    // If the deleted address was default, set another address as default if exists
    if (existing.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        })
      }
    }

    return { success: true }
  }

  async setDefaultAddress(id: string, userId: string) {
    await this.getAddressById(id, userId)

    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    })

    return prisma.address.update({
      where: { id },
      data: { isDefault: true },
    })
  }
}

export const addressService = new AddressService()
