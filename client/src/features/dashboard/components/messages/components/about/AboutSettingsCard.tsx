import { useState } from 'react'
import { Clock, Ban, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useChatStore } from '../../../../../../store/useChatStore'
import { ReusableAlertDialog } from '#/components/common/ReusableAlertDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

interface AboutSettingsCardProps {
  activeConversation: any
}

export function AboutSettingsCard({
  activeConversation,
}: AboutSettingsCardProps) {
  const {
    currentUserId,
    blockConversation,
    unblockConversation,
    reportConversation,
    setDisappearingTargetConvId,
  } = useChatStore()

  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [showReportConfirm, setShowReportConfirm] = useState(false)
  const [reportReason, setReportReason] = useState('Spam')

  const isBlockedByMe = activeConversation.blockedBy?.includes(
    currentUserId || '',
  )

  const handleBlockUser = async () => {
    try {
      if (isBlockedByMe) {
        await unblockConversation(activeConversation.id)
        toast.success(`Unblocked ${activeConversation.otherParticipant.name}`)
      } else {
        await blockConversation(activeConversation.id)
        toast.error(`Blocked ${activeConversation.otherParticipant.name}`)
      }
    } catch (err) {
      toast.error('Failed to update block status')
    } finally {
      setShowBlockConfirm(false)
    }
  }

  const handleReportUser = async () => {
    try {
      await reportConversation({
        conversationId: activeConversation.id,
        reason: reportReason,
      })
      toast.warning(
        `Reported ${activeConversation.otherParticipant.name} for: ${reportReason}`,
      )
    } catch (err) {
      toast.error('Failed to submit report')
    } finally {
      setShowReportConfirm(false)
    }
  }

  const getDisappearingLabel = (sec: number) => {
    if (!sec || sec === 0) return 'Off'
    if (sec === 86400) return '24 Hours'
    if (sec === 604800) return '7 Days'
    if (sec === 7776000) return '90 Days'
    return `${sec / 86400} Days`
  }

  return (
    <>
      <div className="mt-1 shrink-0">
        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-1.5">
          Chat settings
        </span>
        <div className="bg-white border border-slate-100 rounded-[2rem] p-1.5 shadow-2xs flex flex-col gap-0.5">
          {/* Disappearing messages */}
          <div
            onClick={() => setDisappearingTargetConvId(activeConversation.id)}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                <Clock size={16} />
              </div>
              <span className="text-[12.5px] font-bold text-slate-800 ml-3 truncate">
                Disappearing messages
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 transition-colors ml-2 shrink-0">
              <span className="text-[11.5px] font-bold text-slate-500/80">
                {getDisappearingLabel(
                  activeConversation.disappearingDuration || 0,
                )}
              </span>
              <ChevronRightIcon />
            </div>
          </div>

          {/* Block user */}
          <div
            onClick={() => setShowBlockConfirm(true)}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group border-t border-slate-50"
          >
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                <Ban size={16} />
              </div>
              <span className="text-[12.5px] font-bold text-slate-800 ml-3 truncate">
                {isBlockedByMe ? 'Unblock' : 'Block'}{' '}
                {activeConversation.otherParticipant.name}
              </span>
            </div>
          </div>

          {/* Report and block */}
          <div
            onClick={() => setShowReportConfirm(true)}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-red-50/20 hover:text-red-700 transition-colors cursor-pointer group border-t border-slate-50"
          >
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} />
              </div>
              <span className="text-[12.5px] font-bold text-red-600 ml-3 truncate">
                Report and block
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog components */}

      <ReusableAlertDialog
        isOpen={showBlockConfirm}
        onOpenChange={setShowBlockConfirm}
        onConfirm={handleBlockUser}
        title={
          isBlockedByMe
            ? `Unblock ${activeConversation.otherParticipant.name}?`
            : `Block ${activeConversation.otherParticipant.name}?`
        }
        description={
          isBlockedByMe
            ? `Are you sure you want to unblock ${activeConversation.otherParticipant.name}? You will be able to start sending and receiving messages.`
            : `Are you sure you want to block ${activeConversation.otherParticipant.name}? You will no longer receive their messages.`
        }
        confirmText={isBlockedByMe ? 'Unblock' : 'Block'}
        variant="danger"
      />

      <ReusableAlertDialog
        isOpen={showReportConfirm}
        onOpenChange={setShowReportConfirm}
        onConfirm={handleReportUser}
        title={`Report ${activeConversation.otherParticipant.name}?`}
        description={
          <div className="flex flex-col gap-3 w-full mt-2">
            <span className="text-slate-500 font-semibold text-[12px] leading-relaxed">
              Report {activeConversation.otherParticipant.name} for spam, abuse,
              or inappropriate content? This report will be reviewed by
              administrators.
            </span>
            <Select
              value={reportReason}
              onValueChange={(val) => setReportReason(val)}
            >
              <SelectTrigger className="w-full text-[12px] font-bold border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/20 text-slate-800 shadow-none h-11 px-3.5">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-slate-200 bg-card font-bold text-[12px] text-slate-700">
                <SelectItem
                  value="Spam"
                  className="cursor-pointer rounded-lg hover:bg-slate-50"
                >
                  Spam
                </SelectItem>
                <SelectItem
                  value="Harassment"
                  className="cursor-pointer rounded-lg hover:bg-slate-50"
                >
                  Harassment / Abuse
                </SelectItem>
                <SelectItem
                  value="Inappropriate Content"
                  className="cursor-pointer rounded-lg hover:bg-slate-50"
                >
                  Inappropriate Content
                </SelectItem>
                <SelectItem
                  value="Policy Violation"
                  className="cursor-pointer rounded-lg hover:bg-slate-50"
                >
                  Policy Violation
                </SelectItem>
                <SelectItem
                  value="Other"
                  className="cursor-pointer rounded-lg hover:bg-slate-50"
                >
                  Other Reason
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        confirmText="Report"
        variant="danger"
      />
    </>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-400 group-hover:text-slate-600 transition-colors ml-2 shrink-0"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
