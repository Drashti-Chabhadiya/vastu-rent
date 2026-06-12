import { FileText, Download } from 'lucide-react'

interface FileAttachmentProps {
  src: string
}

export function FileAttachment({ src }: FileAttachmentProps) {
  const filename = decodeURIComponent(src.substring(src.lastIndexOf('/') + 1)).split('?')[0]
  return (
    <div className="flex items-center justify-between p-2.5 bg-muted-light/30 rounded-xl w-[220px] shrink-0 border border-border/10">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary-soft/30 text-primary flex items-center justify-center shrink-0">
          <FileText size={15} />
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <span className="text-[9.5px] font-black text-foreground truncate max-w-[125px] leading-tight">{filename}</span>
          <span className="text-[7.5px] font-bold text-muted-dark/80 uppercase tracking-wide leading-none mt-0.5">Document</span>
        </div>
      </div>
      <a
        href={src}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="w-7 h-7 rounded-lg bg-card hover:bg-muted-light border border-border/20 flex items-center justify-center text-muted-dark hover:text-muted-foreground transition-colors cursor-pointer shrink-0 ml-2 shadow-none"
        title="Download File"
      >
        <Download size={11} />
      </a>
    </div>
  )
}
