'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Sun, Moon, Cloud } from 'lucide-react'

export default function WelcomeBanner() {
  const [greeting, setGreeting] = useState('')
  const [icon, setIcon] = useState<typeof Sun>(Sun)

  useEffect(() => {
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 12) {
      setGreeting('おはようございます')
      setIcon(Sun)
    } else if (hour >= 12 && hour < 18) {
      setGreeting('こんにちは')
      setIcon(Sun)
    } else if (hour >= 18 && hour < 22) {
      setGreeting('こんばんは')
      setIcon(Moon)
    } else {
      setGreeting('おやすみなさい')
      setIcon(Moon)
    }
  }, [])

  const Icon = icon

  return (
    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white mb-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{greeting}</h2>
          <p className="text-primary-100">
            {format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: ja })}
          </p>
        </div>
      </div>
    </div>
  )
}


