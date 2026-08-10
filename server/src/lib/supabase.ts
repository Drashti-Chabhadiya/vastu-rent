import { createClient, SupabaseClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''

export const supabaseServer: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
        },
      })
    : null

/**
 * Broadcasts a real-time event to a Supabase Realtime channel.
 */
export async function broadcastToChannel(
  channelName: string,
  event: string,
  payload: any,
) {
  if (!supabaseServer) {
    return
  }

  try {
    const channel = supabaseServer.channel(channelName)
    await channel.send({
      type: 'broadcast',
      event,
      payload,
    })
  } catch (error) {
    console.error(`❌ Failed to broadcast to channel '${channelName}':`, error)
  }
}

/**
 * Helper to broadcast an event directly to a user's personal channel room.
 */
export async function broadcastToUser(
  userId: string,
  event: string,
  payload: any,
) {
  return broadcastToChannel(`user_${userId}`, event, payload)
}

/**
 * Helper to broadcast an event to a conversation channel room.
 */
export async function broadcastToConversation(
  conversationId: string,
  event: string,
  payload: any,
) {
  return broadcastToChannel(`conversation_${conversationId}`, event, payload)
}
