import type { FastifyRequest, FastifyReply } from 'fastify'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const settingsPath = path.join(__dirname, 'settings.json')

const readSettingsFromFile = (): any => {
  try {
    const data = fs.readFileSync(settingsPath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

const writeSettingsToFile = (settings: any): void => {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
}

export const settingsController = {
  async getSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const settings = readSettingsFromFile()
      return reply.send({ success: true, settings })
    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        message: error.message || 'Failed to read settings.',
      })
    }
  },

  async updateSettings(
    request: FastifyRequest<{ Body: { settings: any } }>,
    reply: FastifyReply,
  ) {
    try {
      const { settings } = request.body

      if (!settings) {
        return reply.code(400).send({
          success: false,
          message: 'Settings payload is required.',
        })
      }

      const currentSettings = readSettingsFromFile()
      const updatedSettings = {
        ...currentSettings,
        contact: settings.contact
          ? { ...currentSettings.contact, ...settings.contact }
          : currentSettings.contact,
        pricing: settings.pricing
          ? { ...currentSettings.pricing, ...settings.pricing }
          : currentSettings.pricing,
        trust: settings.trust
          ? { ...currentSettings.trust, ...settings.trust }
          : currentSettings.trust,
        terms: settings.terms
          ? { ...currentSettings.terms, ...settings.terms }
          : currentSettings.terms,
      }

      writeSettingsToFile(updatedSettings)

      return reply.send({
        success: true,
        message: 'Settings saved successfully.',
        settings: updatedSettings,
      })
    } catch (error: any) {
      request.log.error(error)
      return reply.code(500).send({
        success: false,
        message: error.message || 'Failed to update settings.',
      })
    }
  },
}
