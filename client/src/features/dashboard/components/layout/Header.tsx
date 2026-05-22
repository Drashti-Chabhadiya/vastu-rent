import { useState } from 'react'
import { Bell, Calendar, ChevronDown, Menu } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface HeaderProps {
  onMenuClick?: () => void
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const [rangeType, setRangeType] = useState<'7days' | '30days' | 'thisMonth'>(
    '7days',
  )
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const getFormattedRange = () => {
    const endDate = new Date()
    const startDate = new Date()

    if (rangeType === '7days') {
      startDate.setDate(endDate.getDate() - 6)
    } else if (rangeType === '30days') {
      startDate.setDate(endDate.getDate() - 29)
    } else {
      // This Month
      startDate.setDate(1)
    }

    const formatMonthDay = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }

    return `${formatMonthDay(startDate)} - ${formatMonthDay(endDate)}, ${endDate.getFullYear()}`
  }

  const getLabel = () => {
    switch (rangeType) {
      case '7days':
        return 'Last 7 Days'
      case '30days':
        return 'Last 30 Days'
      case 'thisMonth':
        return 'This Month'
    }
  }

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-2 md:gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-10 w-10 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors lg:hidden active:scale-[0.98]"
        >
          <Menu size={22} />
        </Button>
        <div className="hidden sm:block">
          <h2 className="text-lg md:text-xl font-bold text-dash-text">
            Dashboard
          </h2>
          <p className="hidden md:block text-sm text-dash-text-muted">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Date Range Picker */}
        <div className="relative">
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Calendar size={18} className="text-dash-brand" />
            <div className="flex flex-col items-start leading-none gap-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {getLabel()}
              </span>
              <span className="text-xs font-bold text-[#1e293b]">
                {getFormattedRange()}
              </span>
            </div>
            <ChevronDown size={14} className="text-gray-400 ml-1" />
          </div>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRangeType('7days')
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between rounded-none hover:bg-gray-50 ${
                    rangeType === '7days'
                      ? 'text-primary bg-primary/5 hover:text-primary hover:bg-primary/5'
                      : 'text-gray-600 hover:text-gray-700'
                  }`}
                >
                  Last 7 Days
                  {rangeType === '7days' && (
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRangeType('30days')
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between rounded-none hover:bg-gray-50 ${
                    rangeType === '30days'
                      ? 'text-primary bg-primary/5 hover:text-primary hover:bg-primary/5'
                      : 'text-gray-600 hover:text-gray-700'
                  }`}
                >
                  Last 30 Days
                  {rangeType === '30days' && (
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRangeType('thisMonth')
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between rounded-none hover:bg-gray-50 ${
                    rangeType === 'thisMonth'
                      ? 'text-primary bg-primary/5 hover:text-primary hover:bg-primary/5'
                      : 'text-gray-600 hover:text-gray-700'
                  }`}
                >
                  This Month
                  {rangeType === 'thisMonth' && (
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 hover:bg-gray-50 rounded-xl text-gray-500 transition-all active:scale-[0.98]"
        >
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </Button>
      </div>
    </header>
  )
}
