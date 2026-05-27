import {
  Search,
  Mail,
  MessageCircle,
  Phone,
  ChevronDown,
  HelpCircle,
  FileText,
  Settings,
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is Vastu-Rent?',
        a: 'Vastu-Rent is a community-based rental platform where you can rent almost anything from people in your neighborhood or earn money by listing your own items for rent.',
      },
      {
        q: 'How do I start renting?',
        a: "Simply browse the categories, find an item you need, select your dates, and proceed to book. You'll need to verify your identity before your first rental.",
      },
    ],
  },
  {
    category: 'Payments',
    questions: [
      {
        q: 'How does payment work?',
        a: 'All payments are processed securely through our platform. We hold the funds until the rental is successfully completed to protect both the renter and the owner.',
      },
      {
        q: 'Is there a security deposit?',
        a: "Depending on the item and the owner's preference, some rentals may require a security deposit which is fully refunded once the item is returned in good condition.",
      },
    ],
  },
]

export function HelpPage() {
  const [openIndex, setOpenIndex] = useState<string | null>('General-0')

  const toggleFaq = (id: string) => {
    setOpenIndex(openIndex === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Search Header */}
      <section className="bg-primary py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-8">
            How can we help you today?
          </h1>
          <div className="relative max-w-2xl mx-auto group">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:bg-primary transition-colors"
              size={24}
            />
            <input
              type="text"
              placeholder="Search for answers..."
              className="w-full h-16 pl-16 pr-8 bg-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/20 text-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 -mt-10 mb-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <HelpCircle className="text-blue-500" />,
              title: 'Getting Started',
              count: '12 articles',
            },
            {
              icon: <FileText className="text-green-500" />,
              title: 'Account & Billing',
              count: '8 articles',
            },
            {
              icon: <Settings className="text-purple-500" />,
              title: 'Using the App',
              count: '15 articles',
            },
            {
              icon: <Shield className="text-red-500" />,
              title: 'Safety & Security',
              count: '10 articles',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 mb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 px-2">
          Frequently Asked Questions
        </h2>
        <div className="space-y-12">
          {faqs.map((cat, catIdx) => (
            <div key={catIdx}>
              <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-6 px-2">
                {cat.category}
              </h3>
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                {cat.questions.map((faq, faqIdx) => {
                  const id = `${cat.category}-${faqIdx}`
                  const isOpen = openIndex === id
                  return (
                    <div
                      key={faqIdx}
                      className={cn(
                        'border-b border-gray-50 last:border-0',
                        isOpen && 'bg-gray-50/50',
                      )}
                    >
                      <Button
                        variant="ghost"
                        onClick={() => toggleFaq(id)}
                        className="h-auto w-full flex items-center justify-between p-6 sm:p-8 text-left hover:bg-gray-50 transition-colors rounded-none font-normal justify-between [&_svg]:size-6"
                      >
                        <span className="text-lg font-bold text-gray-900 pr-8 text-left whitespace-normal">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={cn(
                            'w-6 h-6 text-gray-400 transition-transform duration-300 shrink-0',
                            isOpen && 'rotate-180',
                          )}
                        />
                      </Button>
                      <div
                        className={cn(
                          'overflow-hidden transition-all duration-300 ease-in-out',
                          isOpen ? 'max-h-96' : 'max-h-0',
                        )}
                      >
                        <div className="px-6 sm:px-8 pb-8 text-gray-600 leading-relaxed">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="bg-primary/5 border border-brand/10 rounded-[40px] p-10 sm:p-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 mb-12 max-w-xl mx-auto">
            Our support team is available 24/7 to help you with any questions or
            issues you might have.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Mail className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                  Email us
                </p>
                <p className="font-bold text-gray-900">
                  support@vastu-rent.com
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <MessageCircle className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                  Live Chat
                </p>
                <p className="font-bold text-gray-900">Start a conversation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Phone className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                  Call us
                </p>
                <p className="font-bold text-gray-900">+91 79 4000 0000</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
