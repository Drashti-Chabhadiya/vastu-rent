import { Link, useNavigate } from '@tanstack/react-router'
import { useProduct, useProducts, useWishlist, useCreateRental, useProductRentals } from '#/hook'
import { useProductReviews, useCreateReview } from '#/hook/reviews'
import { ProductCard } from '#/components/common/ProductCard'
import { ProductDetailSkeleton } from '#/components/skeletons'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Textarea } from '#/components/ui/textarea'
import { 
  Star, 
  ShieldCheck, 
  ChevronRight, 
  Heart, 
  Share2, 
  Calendar,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  Check,
  Send,
  Loader2,
  IndianRupee
} from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { cn } from '#/lib/utils'
import { apiClient } from '#/lib/api'

export function ProductDetail({ id }: { id: string }) {
  const navigate = useNavigate()
  const { data: product, isLoading, error } = useProduct(id)
  const { data: similarProducts } = useProducts({ categoryId: product?.categoryId })
  const { toggleLike, isLiked } = useWishlist()
  const { data: reviews = [] } = useProductReviews(id)
  const { data: productRentals = [] } = useProductRentals(id)
  const createRental = useCreateRental()
  const createReview = useCreateReview(id)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  
  // Calendar state
  const today = new Date()
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  
  // Share state
  const [copied, setCopied] = useState(false)
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  
  // Booking modal state
  const [showBookingConfirm, setShowBookingConfirm] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online')

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const handleDayClick = (day: number) => {
    const clicked = new Date(calYear, calMonth, day)
    
    // Check if clicked date is booked
    const isDateBooked = (date: Date) => productRentals.some((r: any) => {
      const d = new Date(date); d.setHours(0,0,0,0)
      const s = new Date(r.startDate); s.setHours(0,0,0,0)
      const e = new Date(r.endDate); e.setHours(0,0,0,0)
      return d >= s && d <= e
    })

    if (isDateBooked(clicked)) return

    if (!startDate || (startDate && endDate)) {
      setStartDate(clicked)
      setEndDate(null)
    } else {
      // If selecting a range, check if any date in between is booked
      let hasBookedInRange = false
      const start = clicked < startDate ? clicked : startDate
      const end = clicked < startDate ? startDate : clicked
      
      const temp = new Date(start)
      while (temp <= end) {
        if (isDateBooked(temp)) {
          hasBookedInRange = true
          break
        }
        temp.setDate(temp.getDate() + 1)
      }

      if (hasBookedInRange) {
        alert("This range includes dates that are already booked.")
        setStartDate(clicked)
        setEndDate(null)
        return
      }

      if (clicked < startDate) {
        setEndDate(startDate)
        setStartDate(clicked)
      } else {
        setEndDate(clicked)
      }
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) { setReviewError('Please write a comment'); return }
    setReviewError('')
    try {
      await createReview.mutateAsync({ rating: reviewRating, comment: reviewComment })
      setReviewComment('')
      setReviewRating(5)
    } catch {
      setReviewError('Failed to submit. Please log in first.')
    }
  }

  const handleRentNow = async () => {
    if (!startDate || !endDate) { alert('Please select start and end dates on the calendar.'); return }
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1
    const rentalFee = days * (product?.price || 0)
    const depositAmount = product?.securityDeposit || 0
    const total = rentalFee + depositAmount

    try {
      setIsPaying(true)
      // 1. Create Rental Record
      const rental = await createRental.mutateAsync({
        productId: id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        rentalFee,
        depositAmount,
        totalPrice: total,
        paymentMethod: paymentMethod
      })

      // If COD, we are done
      if (paymentMethod === 'cash') {
        setShowBookingConfirm(true)
        setIsPaying(false)
        return
      }

      // 2. Create Razorpay Order (Only for online)
      const { data: { order } } = await apiClient.post('/payments/create-order', { rentalId: rental.id })

      // 3. Open Razorpay Checkout
      const options = {
        key: 'rzp_test_placeholder', // Should be in env
        amount: order.amount,
        currency: order.currency,
        name: 'Vastu Rent',
        description: `Rental for ${product.title}`,
        order_id: order.id,
        handler: async (response: any) => {
          // 4. Verify Payment
          try {
            await apiClient.post('/payments/verify-payment', {
              ...response,
              rentalId: rental.id
            })
            setShowBookingConfirm(true)
          } catch (err) {
            alert('Payment verification failed. Please contact support.')
          } finally {
            setIsPaying(false)
          }
        },
        prefill: {
          name: '', // Can fill from session
          email: '',
        },
        theme: {
          color: '#166534',
        },
        modal: {
          ondismiss: () => setIsPaying(false)
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()

    } catch (err: any) {
      setIsPaying(false)
      alert(err.response?.data?.message || 'Booking failed. Please make sure you are logged in.')
    }
  }

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">The product you are looking for might have been removed or the link is incorrect.</p>
        <Button onClick={() => window.history.back()} variant="outline" className="rounded-xl font-bold">
          Go Back
        </Button>
      </div>
    )
  }

  const images = product.images?.length > 0 ? product.images : ["https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=800&q=80"]
  const liked = isLiked(product.id)

  const productInfo = [
    { label: 'Category', value: product.category?.name || 'Uncategorized' },
    { label: 'Condition', value: product.condition || 'Good' },
    { label: 'Min. Rental', value: `${product.minDuration || 1} day(s)` },
    { label: 'Max. Rental', value: product.maxDuration ? `${product.maxDuration} days` : 'Unlimited' },
    { label: 'Location', value: product.location || 'Ahmedabad, Gujarat' },
    { label: 'Listed On', value: new Date(product.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) },
  ]

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'details', label: 'Details' },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
    { id: 'faqs', label: 'FAQs' },
  ]

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const monthName = new Date(calYear, calMonth).toLocaleString('default', { month: 'long' })
  const rentalDays = startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1 : 0
  const totalPrice = rentalDays * product.price

  return (
    <div className="min-h-screen bg-bg-base pt-20 pb-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} className="opacity-50" />
          <Link to="/products" className="hover:text-primary transition-colors">Marketplace</Link>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-gray-900 truncate">{product.title || product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Images and Tabs (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm group">
                <img 
                  src={images[selectedImage]} 
                  alt={product.title || product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                
                {/* Image Navigation Arrows */}
                <button 
                  onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-900 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-90"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-900 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-90"
                >
                  <ChevronRight size={20} />
                </button>

                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => toggleLike(product.id)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90",
                      liked ? "bg-red-50 text-red-500" : "bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500"
                    )}
                  >
                    <Heart size={18} className={liked ? "fill-current" : ""} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-gray-600 hover:text-primary shadow-lg flex items-center justify-center transition-all active:scale-90"
                    title="Copy link"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
                  </button>
                </div>
              </div>
              
              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                      selectedImage === idx 
                        ? 'border-brand shadow-md' 
                        : 'border-transparent hover:border-gray-200'
                    )}
                  >
                    <img src={img} alt={`${product.title || product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    {selectedImage !== idx && <div className="absolute inset-0 bg-white/20" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs Section */}
            <div className="border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-6 px-6 pt-2 border-b border-gray-100 bg-white">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "py-4 text-sm font-bold transition-all relative whitespace-nowrap",
                                activeTab === tab.id ? "text-primary" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6 bg-white min-h-[250px]">
                    {activeTab === 'description' && (
                        <div className="space-y-6">
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {product.description || "No description provided."}
                            </p>
                            {product.features && product.features.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Features & Specs</h4>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {product.features.map((item: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
                                            <CheckCircle2 size={16} className="text-primary shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                              </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'details' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                                      <Calendar size={16} className="text-primary" /> Rental Terms
                                    </h4>
                                    <div className="space-y-2">
                                      <p className="text-sm text-gray-500 flex justify-between">
                                        <span>Min duration:</span>
                                        <span className="font-bold text-gray-700">{product.minDuration || 1} day(s)</span>
                                      </p>
                                      <p className="text-sm text-gray-500 flex justify-between">
                                        <span>Max duration:</span>
                                        <span className="font-bold text-gray-700">{product.maxDuration ? `${product.maxDuration} days` : 'Flexible'}</span>
                                      </p>
                                      <p className="text-sm text-gray-500 flex justify-between">
                                        <span>Security Deposit:</span>
                                        <span className="font-bold text-brand">₹{(product.securityDeposit || 0).toLocaleString()}</span>
                                      </p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                                      <ShieldCheck size={16} className="text-primary" /> Delivery & Pickup
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {product.deliveryOptions?.map((opt: string) => (
                                        <Badge key={opt} variant="secondary" className="bg-gray-100 text-gray-700 rounded-md">
                                          {opt}
                                        </Badge>
                                      )) || <span className="text-sm text-gray-500 italic">Self-pickup only</span>}
                                    </div>
                                </div>
                            </div>
                            
                            {product.pickupReturnDetails && (
                              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-widest">Handover Instructions</h4>
                                <p className="text-sm text-gray-600 italic">"{product.pickupReturnDetails}"</p>
                              </div>
                            )}

                            {product.tags && product.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {product.tags.map((tag: string) => (
                                  <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div className="space-y-6">
                          {reviews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <Star size={32} className="text-gray-200 mb-3" />
                              <h4 className="text-lg font-bold text-gray-900">No reviews yet</h4>
                              <p className="text-sm text-gray-500 mt-1">Be the first to review after renting!</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {reviews.map((r: any) => (
                                <div key={r.id} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0">
                                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                                    {r.user?.name?.[0] || 'U'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-bold text-gray-900">{r.user?.name || 'Anonymous'}</p>
                                      <div className="flex">{Array.from({length:5}).map((_,i)=><Star key={i} size={12} className={i<r.rating?'text-yellow-400 fill-yellow-400':'text-gray-200'} />)}</div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{r.comment}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="border-t border-gray-100 pt-5 space-y-3">
                            <p className="text-sm font-bold text-gray-900">Write a Review</p>
                            <div className="flex gap-1">
                              {[1,2,3,4,5].map(s => (
                                <button key={s} onClick={() => setReviewRating(s)}>
                                  <Star size={20} className={s<=reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                                </button>
                              ))}
                            </div>
                            <Textarea
                              placeholder="Share your experience..."
                              value={reviewComment}
                              onChange={e => setReviewComment(e.target.value)}
                              className="text-sm rounded-xl border-gray-200 resize-none"
                              rows={3}
                            />
                            {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
                            <Button
                              onClick={handleSubmitReview}
                              disabled={createReview.isPending}
                              className="w-full h-10 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold gap-2"
                            >
                              {createReview.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                              Submit Review
                            </Button>
                          </div>
                        </div>
                    )}
                    {activeTab === 'faqs' && (
                        <div className="space-y-5">
                            {[
                                { q: "How do I return the item?", a: "We will arrange a pickup on the last day of your rental." },
                                { q: "Is there a security deposit?", a: "Yes, a refundable deposit of ₹2000 is required." }
                            ].map((faq, i) => (
                                <div key={i} className="space-y-1.5">
                                    <p className="text-sm font-bold text-gray-900">Q: {faq.q}</p>
                                    <p className="text-sm text-gray-500">A: {faq.a}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Right Side (7 cols) */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Middle Column (Product Info - 7 cols of 12) */}
              <div className="xl:col-span-7 space-y-6">
                
                {/* Header Info */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{product.title || product.name}</h1>
                        <Badge className="bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold text-[10px] uppercase shrink-0">
                            <CheckCircle2 size={10} /> Verified
                        </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-gray-900 text-sm">{product.rating || "4.6"}</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        </div>
                        <span className="text-gray-500 text-sm font-medium cursor-pointer">({product.reviewsCount || "0"} Reviews)</span>
                    </div>
                    
                    <div className="flex items-baseline gap-1.5 pt-1">
                        <span className="text-3xl font-black text-primary">₹{product.price.toLocaleString()}</span>
                        <span className="text-sm font-bold text-gray-500">/day</span>
                        {product.securityDeposit > 0 && (
                          <span className="ml-3 text-xs font-medium text-gray-400">
                            + ₹{product.securityDeposit.toLocaleString()} deposit
                          </span>
                        )}
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {product.description}
                    </p>
                </div>

                <hr className="border-gray-100" />

                {/* Product Information Table */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900">Product Information</h3>
                    <div className="grid grid-cols-1 gap-y-3">
                        {productInfo.map((info) => (
                            <div key={info.label} className="grid grid-cols-3">
                                <span className="col-span-1 text-sm text-gray-500">{info.label}</span>
                                <span className="col-span-2 text-sm font-medium text-gray-900">{info.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Trust Features */}
                <div className="flex flex-wrap items-center gap-y-4 gap-x-6">
                    {[
                        { icon: <CheckCircle2 size={16} />, title: "Free Delivery", desc: "Within 10 km" },
                        { icon: <MessageCircle size={16} />, title: "Quick Support", desc: "24/7 Assistance" },
                        { icon: <ShieldCheck size={16} />, title: "Secure Payment", desc: "100% Safe" }
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-primary shrink-0">
                                {feature.icon}
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-900 leading-tight">{feature.title}</p>
                                <p className="text-[10px] text-gray-500">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Save More Banner */}
                <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shrink-0 shadow-sm">
                        <AlertCircle size={16} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">Save more with longer rentals!</p>
                        <p className="text-xs text-gray-600 mt-0.5">Rent for a week or more and get up to 20% off.</p>
                    </div>
                </div>

                {/* Action Buttons */}
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <div className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
                    <IndianRupee size={14} className="text-primary" />
                    Payment Method
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('online')}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1",
                        paymentMethod === 'online' 
                          ? "border-brand bg-primary/5 text-primary" 
                          : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                      )}
                    >
                      <ShieldCheck size={18} />
                      <span className="text-[11px] font-black uppercase tracking-wider">Online Pay</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1",
                        paymentMethod === 'cash' 
                          ? "border-brand bg-primary/5 text-primary" 
                          : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                      )}
                    >
                      <MessageCircle size={18} />
                      <span className="text-[11px] font-black uppercase tracking-wider">Cash on Pickup</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleRentNow}
                      disabled={createRental.isPending || isPaying}
                      className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-md shadow-brand/20 active:scale-[0.98] transition-all group"
                    >
                      {createRental.isPending || isPaying ? <Loader2 size={16} className="animate-spin mr-2" /> : <ArrowRight size={16} className="mr-2 transition-transform group-hover:translate-x-1" />}
                      {isPaying ? "Processing..." : "Rent Now"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all gap-2"
                      onClick={() => window.open(`mailto:${product.owner?.email || ''}?subject=Inquiry about ${product.title || product.name}`)}
                    >
                      <MessageCircle size={18} /> Chat with Owner
                    </Button>
                </div>
                {startDate && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-brand/10 space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-700">
                      <span className="font-bold">Dates:</span>
                      <span>{startDate.toLocaleDateString('en-IN')} {endDate ? `→ ${endDate.toLocaleDateString('en-IN')}` : '→ Pick end date'}</span>
                    </div>
                    {endDate && (
                      <>
                        <div className="flex items-center justify-between text-xs text-gray-700">
                          <span className="font-bold">Rental Fee ({rentalDays} days):</span>
                          <span>₹{totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-700">
                          <span className="font-bold">Security Deposit (Refundable):</span>
                          <span>₹{(product.securityDeposit || 0).toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t border-brand/10 flex items-center justify-between text-sm text-gray-900 font-black">
                          <span>Total Payable:</span>
                          <span className="text-primary">₹{(totalPrice + (product.securityDeposit || 0)).toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Rightmost Column (Sidebar - 5 cols of 12) */}
              <div className="xl:col-span-5 space-y-6">
                
                {/* Listed By Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                    <h3 className="text-base font-bold text-gray-900">Listed by</h3>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0">
                            {product.owner?.image ? (
                                <img src={product.owner.image} alt={product.owner.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-lg">
                                    {product.owner?.name?.[0] || "U"}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">{product.owner?.name || "Verified Owner"}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Star size={12} className="text-primary fill-brand" />
                                <span className="text-xs font-bold text-gray-900">{product.owner?.rating || "0.0"}</span>
                                <span className="text-xs text-gray-500">({product.owner?.listingsCount || 0} Listings)</span>
                                <Badge className="bg-green-50 text-green-700 border-none px-1 py-0 rounded flex items-center gap-0.5 font-bold text-[8px] uppercase ml-1">
                                    <CheckCircle2 size={8} /> Verified
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <Calendar size={14} className="shrink-0" /> 
                            Member since {product.owner?.createdAt ? new Date(product.owner.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'May 2022'}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <MessageCircle size={14} className="shrink-0" /> Usually responds in a few hours
                        </div>
                    </div>
                    <Link to={`/users/${product.owner?.id}` as any}>
                        <Button variant="outline" className="w-full h-10 rounded-xl border-gray-200 font-bold text-primary hover:bg-primary/5 hover:border-brand transition-colors">
                            View Profile
                        </Button>
                    </Link>
                </div>

                {/* Real Interactive Calendar */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-gray-900">Check Availability</h3>
                    <div className="flex items-center justify-between">
                        <button onClick={() => { if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1)}else setCalMonth(m=>m-1) }} className="p-1 rounded-lg hover:bg-gray-100"><ChevronLeft size={16}/></button>
                        <p className="text-sm font-bold text-gray-900">{monthName} {calYear}</p>
                        <button onClick={() => { if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1)}else setCalMonth(m=>m+1) }} className="p-1 rounded-lg hover:bg-gray-100"><ChevronRight size={16}/></button>
                    </div>
                    <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center">
                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><div key={d} className="text-[10px] font-bold text-gray-400 py-1">{d}</div>)}
                        {Array.from({length: firstDay}).map((_,i)=><div key={`e${i}`}/>)}
                        {Array.from({length: daysInMonth}).map((_,i)=>{
                            const day=i+1
                            const date=new Date(calYear,calMonth,day)
                            const isPast=date<new Date(today.getFullYear(),today.getMonth(),today.getDate())
                            
                            // Check if this date is within any existing rental range
                            const isBooked = productRentals.some((r: any) => {
                              const start = new Date(r.startDate)
                              const end = new Date(r.endDate)
                              // Set time to midnight for accurate comparison
                              const d = new Date(date)
                              d.setHours(0,0,0,0)
                              const s = new Date(start)
                              s.setHours(0,0,0,0)
                              const e = new Date(end)
                              e.setHours(0,0,0,0)
                              return d >= s && d <= e
                            })

                            const isStart=startDate&&date.toDateString()===startDate.toDateString()
                            const isEnd=endDate&&date.toDateString()===endDate.toDateString()
                            const inRange=startDate&&endDate&&date>startDate&&date<endDate
                            
                            const isDisabled = isPast || isBooked

                            return(
                                <button 
                                    key={day} 
                                    onClick={()=>!isDisabled&&handleDayClick(day)}
                                    disabled={isDisabled}
                                    className={cn('h-7 flex items-center justify-center text-xs rounded-md transition-all relative',
                                        isDisabled ? 'text-gray-300 cursor-not-allowed bg-gray-50/50' :
                                        isStart||isEnd ? 'bg-primary text-white font-bold' :
                                        inRange ? 'bg-primary/10 text-primary' :
                                        'text-gray-700 hover:bg-gray-100 cursor-pointer'
                                    )}>
                                      {day}
                                      {isBooked && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />}
                                </button>
                            )
                        })}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary"/>Selected</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary/10"/>Range</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-gray-100"/>Unavailable</div>
                    </div>
                </div>

              </div>
            </div>

            {/* Similar Items Section */}
            {similarProducts && similarProducts.length > 0 && (
                <div className="mt-10">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-gray-900">Similar Items</h3>
                        <Link to="/products" className="text-sm font-bold text-primary hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {similarProducts.filter((p: any) => p.id !== id).slice(0, 3).map((item: any) => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Booking Confirmed!</h3>
              <p className="text-sm text-gray-500 mt-2">
                {product.title || product.name} booked from {startDate?.toLocaleDateString('en-IN')} to {endDate?.toLocaleDateString('en-IN')}.
              </p>
              <p className="text-lg font-black text-primary mt-3">₹{totalPrice.toLocaleString()} total</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl font-bold" onClick={() => setShowBookingConfirm(false)}>Close</Button>
              <Link to="/profile/bookings" className="flex-1">
                <Button className="w-full rounded-xl bg-primary text-white font-bold">My Bookings</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
