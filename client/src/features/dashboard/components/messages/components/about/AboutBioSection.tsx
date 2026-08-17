import { useState, useEffect } from 'react'
import { Info, Pencil } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { toast } from 'sonner'

interface AboutBioSectionProps {
  otherParticipant: any
}

export function AboutBioSection({ otherParticipant }: AboutBioSectionProps) {
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const [aboutText, setAboutText] = useState('')

  useEffect(() => {
    if (otherParticipant) {
      setAboutText(
        otherParticipant.about ||
          'Helping you find the perfect home aligned with Vastu.',
      )
    }
    setIsEditingAbout(false)
  }, [otherParticipant?.id])

  const handleSaveAbout = () => {
    if (otherParticipant) {
      otherParticipant.about = aboutText
    }
    setIsEditingAbout(false)
    toast.success('About section updated')
  }

  return (
    <div className="bg-card border border-border/30 rounded-[2rem] p-5 shadow-2xs flex gap-3.5 items-start shrink-0">
      <div className="w-8 h-8 rounded-xl bg-muted-light text-muted-foreground flex items-center justify-center shrink-0">
        <Info size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-bold text-foreground">About</h4>
        {isEditingAbout ? (
          <div className="mt-2 flex flex-col gap-2">
            <textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              className="w-full text-[12px] p-2 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none h-16 text-foreground bg-muted-light font-bold"
              autoFocus
            />
            <div className="flex justify-end gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAboutText(
                    otherParticipant.about ||
                      'Helping you find the perfect home aligned with Vastu.',
                  )
                  setIsEditingAbout(false)
                }}
                className="h-6 px-2 text-[9px] font-black text-muted-foreground rounded-md hover:bg-muted-light cursor-pointer shadow-none"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveAbout}
                className="h-6 px-2.5 text-[9px] font-black text-white bg-primary hover:bg-primary/95 rounded-md shadow-sm cursor-pointer"
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
            {aboutText}
          </p>
        )}
      </div>
      {!isEditingAbout && (
        <button
          onClick={() => setIsEditingAbout(true)}
          className="text-muted-dark hover:text-foreground transition-colors p-1 rounded hover:bg-muted-light cursor-pointer border-none bg-transparent"
          title="Edit about"
        >
          <Pencil size={14} />
        </button>
      )}
    </div>
  )
}
