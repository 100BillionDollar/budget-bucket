

import React from 'react'
import Header from '@/components/pageComponents/Header'
import { Providers } from './Providers'
interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>
        <Header />
        <main>  
          {children}
        </main>
    </>
  )
}