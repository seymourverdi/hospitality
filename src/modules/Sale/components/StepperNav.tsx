'use client'

import * as React from 'react'
import { cn } from '@/core/lib/utils'
import { authFetch } from '@/lib/pos/auth-client'

interface StepperNavProps {
  currentStep: number
  skipSeating: boolean
  itemCount: number
  total: number
  tax: number
  onPrevStep: () => void
  onNextStep: () => void
  canProceed: boolean
  userName?: string
  className?: string
}

type MeResponse = {
  auth?: {
    userId?: number
  }
  user?: {
    id: number
    firstName: string
    lastName: string
    roleId: number
    locationId: number
  }
}

function buildUserName(user?: MeResponse['user']) {
  if (!user) return 'User'
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  return fullName || 'User'
}

export function StepperNav({
  currentStep,
  skipSeating,
  itemCount: _itemCount,
  total: _total,
  tax: _tax,
  onPrevStep: _onPrevStep,
  onNextStep,
  canProceed,
  userName,
  className,
}: StepperNavProps) {
  void _itemCount
  void _total
  void _tax
  void _onPrevStep

  const [resolvedUserName, setResolvedUserName] = React.useState(userName || 'User')

  React.useEffect(() => {
    if (userName && userName.trim()) {
      setResolvedUserName(userName)
      return
    }

    let cancelled = false

    async function loadMe() {
      try {
        const res = await authFetch('/api/me', {
          method: 'GET',
        })

        if (!res.ok) {
          return
        }

        const data = (await res.json()) as MeResponse

        if (cancelled) return

        setResolvedUserName(buildUserName(data.user))
      } catch {
        if (cancelled) return
      }
    }

    void loadMe()

    return () => {
      cancelled = true
    }
  }, [userName])

  const steps = skipSeating
    ? [
        { num: 1, label: 'Select Items' },
        { num: 2, label: 'Select Person' },
      ]
    : [
        { num: 1, label: 'Select Items' },
        { num: 2, label: 'Select Person' },
        { num: 3, label: 'Select Table' },
      ]

  const DottedLine = ({ active }: { active: boolean }) => {
    const dotColor = active ? 'bg-[#66C580]' : 'bg-[#8B8B8B]'

    return (
      <div className="flex items-center mx-2">
        <span className={cn('w-[5px] h-[5px] rounded-full', dotColor)} />

        <div className="flex items-center">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className={cn('w-[3px] h-[3px] rounded-full mx-[2px]', dotColor)}
            />
          ))}
        </div>

        <span className={cn('w-[5px] h-[5px] rounded-full', dotColor)} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'h-[70px] px-6',
        'bg-[#292929]/[0.95] backdrop-blur-xl',
        'flex items-center',
        className
      )}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center flex-shrink-0">
          <div className="flex items-center gap-2.5 bg-[#E8E4DC] rounded-full pl-1.5 pr-5 py-1.5">
            <div className="w-9 h-9 rounded-full bg-[#5BB5B0] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>

            <span className="text-[#3D3D3D] text-[15px] font-medium">
              {resolvedUserName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.num}>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-[41px] h-[41px] rounded-full text-[16px] font-bold flex items-center justify-center',
                      currentStep >= step.num
                        ? 'bg-[#66C580] text-white'
                        : 'bg-[#6B6B6B] text-[#9B9B9B]'
                    )}
                  >
                    {step.num}
                  </span>

                  <span
                    className={cn(
                      'text-[14px] font-bold whitespace-nowrap',
                      currentStep >= step.num ? 'text-white' : 'text-[#8B8B8B]'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <DottedLine active={currentStep > step.num} />
                )}
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={onNextStep}
            disabled={!canProceed}
            className={cn(
              'min-w-[150px] h-[41px] px-5 rounded-full text-[13px] font-bold transition-colors flex-shrink-0',
              canProceed
                ? 'bg-[#5A5A5A] text-[#E0E0E0] hover:bg-[#6A6A6A] active:bg-[#4A4A4A]'
                : 'bg-[#5A5A5A]/50 text-[#8E8E8E]/50 cursor-not-allowed'
            )}
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  )
}