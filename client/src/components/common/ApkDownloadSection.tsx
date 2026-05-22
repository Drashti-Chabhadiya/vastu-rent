import { APK_CONFIG, getApkDownloadUrl } from '#/lib/apk'
import {
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Download,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Globe,
  Copy,
  Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect } from 'react'
import { Button } from '#/components/ui/button'

const ApkDownloadSection = () => {
  const [downloadUrl, setDownloadUrl] = useState('')
  const [qrLoaded, setQrLoaded] = useState(false)
  const [isLocalhost, setIsLocalhost] = useState(false)
  const [customIp, setCustomIp] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const hostname =
      typeof window !== 'undefined' ? window.location.hostname : ''
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'
    setIsLocalhost(isLocal)

    // Use the smart utility to get the URL
    const url = getApkDownloadUrl(customIp)
    setDownloadUrl(url)
    setQrLoaded(false)
  }, [customIp])

  const handleCopy = () => {
    navigator.clipboard.writeText(downloadUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const installSteps = [
    {
      title: 'Download APK',
      description:
        'Scan the QR code or click the button to start downloading the file.',
      icon: <Download className="w-5 h-5" />,
    },
    {
      title: 'Allow Unknown Sources',
      description:
        'Go to Settings > Security and enable "Install from Unknown Sources".',
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      title: 'Install & Launch',
      description:
        'Open the file and follow prompts to start using Vastu Rent.',
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
  ]

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(downloadUrl)}&bgcolor=ffffff&color=000000&margin=10`

  return (
    <section className="relative overflow-hidden bg-background py-24 px-6 bg-grain min-h-[800px] flex items-center">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          {/* LEFT: Content & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 space-y-10"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full border border-primary/20 text-xs font-bold uppercase tracking-widest font-sans"
              >
                <Smartphone className="w-4 h-4" />
                Now Available for Android
              </motion.div>
              <h1 className="text-5xl lg:text-7xl font-display text-foreground leading-[1.05] tracking-tight">
                Download <span className="text-primary italic">Vastu Rent</span>{' '}
                Mobile App
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed font-sans">
                Get the full Vastu Rent experience on your Android device. Fast
                listings, real-time booking updates, and exclusive mobile
                features.
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
              <motion.a
                href={downloadUrl}
                download={APK_CONFIG.FILENAME}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 sm:flex-none group relative inline-flex items-center justify-center gap-4 px-10 py-6 bg-primary text-white rounded-[2rem] font-bold text-xl shadow-2xl shadow-primary/30 transition-all hover:shadow-primary/50 font-sans"
              >
                <div className="p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform">
                  <Download className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] opacity-70 font-bold uppercase tracking-[0.2em] mb-0.5">
                    {APK_CONFIG.VERSION} Stable
                  </span>
                  <span>Download APK</span>
                </div>
              </motion.a>

              <div className="flex flex-col gap-2 font-sans">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span>100% Safe & Virus Free</span>
                </div>
                <div className="text-muted-foreground text-sm flex items-center gap-3">
                  <span className="font-medium text-foreground">
                    {APK_CONFIG.SIZE}
                  </span>
                  <span className="w-1 h-1 bg-border rounded-full" />
                  <span>Android {APK_CONFIG.MIN_ANDROID}</span>
                </div>
              </div>
            </div>

            {/* Install Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-border/50">
              {installSteps.map((step, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-4 p-4 rounded-3xl hover:bg-white/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1 font-sans">
                      {step.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: QR Code & Device Detection */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 relative"
          >
            {/* The QR Card */}
            <div className="relative z-10 bg-white border border-border p-10 rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)]">
              {/* Dev/Localhost Warning */}
              <AnimatePresence>
                {isLocalhost && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-3xl overflow-hidden"
                  >
                    <div className="flex gap-4">
                      <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                      <div className="space-y-3 w-full">
                        <p className="text-xs font-bold text-amber-800 font-sans leading-relaxed">
                          Localhost detected! To scan with your phone, enter
                          your PC's local IP address below.
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. 192.168.1.23"
                            value={customIp}
                            onChange={(e) => setCustomIp(e.target.value)}
                            className="flex-1 px-4 py-2 bg-white border border-amber-300 rounded-xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* QR Code Container */}
              <div className="text-center space-y-8">
                <div className="relative w-full aspect-square max-w-[300px] mx-auto group">
                  {/* Decorative Frame */}
                  <div className="absolute inset-0 bg-primary/5 rounded-[3rem] rotate-3 transition-transform group-hover:rotate-0" />
                  <div className="relative z-10 w-full h-full bg-white rounded-[3rem] p-8 shadow-soft border border-border/50 flex items-center justify-center overflow-hidden">
                    {!qrLoaded && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white z-20">
                        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                        <span className="text-xs font-sans text-muted-foreground">
                          Generating QR...
                        </span>
                      </div>
                    )}
                    <img
                      src={qrImageUrl}
                      alt="Scan to Download"
                      className={`w-full h-full object-contain transition-opacity duration-500 ${qrLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => setQrLoaded(true)}
                    />
                  </div>
                </div>

                <div className="space-y-3 px-4">
                  <h3 className="text-2xl font-display text-foreground leading-tight">
                    Scan to Install
                  </h3>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                    Point your camera at this code to download the APK directly
                    to your phone.
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-100 uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> Secure Link
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100 uppercase tracking-wider">
                    <Globe className="w-3 h-3" /> Global Access
                  </div>
                </div>

                {/* Smart Copy Component */}
                <div className="pt-4 flex flex-col gap-3">
                  <div className="relative group/copy">
                    <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-lg opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                    <Button
                      variant="outline"
                      onClick={handleCopy}
                      className="relative w-full flex items-center justify-between gap-3 bg-surface border border-border p-3.5 h-auto rounded-2xl transition-all hover:border-primary/30 hover:bg-transparent group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[180px]">
                          {downloadUrl}
                        </span>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded-xl text-[10px] font-bold uppercase transition-colors group-hover:bg-primary group-hover:text-white">
                        {copied ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copied ? 'Copied' : 'Copy'}
                      </div>
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-sans text-center opacity-40">
                    Share this link with your Android device
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Decorations */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] -z-10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-[80px] -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ApkDownloadSection
