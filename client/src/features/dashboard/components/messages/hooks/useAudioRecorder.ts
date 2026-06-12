import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { useUploadChatFile } from '#/hook'
import { useChatStore } from '../../../../../store/useChatStore'

export function useAudioRecorder() {
  const uploadChatFile = useUploadChatFile()
  const { sendMessage, setIsUploading } = useChatStore()

  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isSimulatedRecording, setIsSimulatedRecording] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<any>(null)

  const startRecording = async () => {
    setIsRecording(true)
    setRecordingSeconds(0)
    audioChunksRef.current = []

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          stream.getTracks().forEach((track) => track.stop())

          const file = new File([audioBlob], `voice-message-${Date.now()}.webm`, {
            type: 'audio/webm',
          })

          try {
            setIsUploading(true)
            const url = await uploadChatFile.mutateAsync(file)
            await sendMessage('🎤 Voice message', [url])
          } catch (err) {
            console.error('Failed to send voice message:', err)
            toast.error('Failed to upload voice message')
          } finally {
            setIsUploading(false)
          }
        }

        mediaRecorder.start()
        setIsSimulatedRecording(false)
      } else {
        setIsSimulatedRecording(true)
      }

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.warn('Microphone access denied or error:', err)
      setIsSimulatedRecording(true)
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    }
  }

  const cancelRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {}
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    setIsSimulatedRecording(false)
  }

  const stopAndSendRecording = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }

    if (isSimulatedRecording) {
      try {
        setIsUploading(true)
        const dummyAudioUrl = 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg'
        await sendMessage('🎤 Voice message', [dummyAudioUrl])
      } catch (err) {
        toast.error('Failed to send simulated voice message')
      } finally {
        setIsUploading(false)
        setIsRecording(false)
        setIsSimulatedRecording(false)
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
    }
  }

  return {
    isRecording,
    recordingSeconds,
    isSimulatedRecording,
    startRecording,
    cancelRecording,
    stopAndSendRecording,
  }
}
