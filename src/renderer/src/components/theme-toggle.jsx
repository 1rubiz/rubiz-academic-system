import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import useDarkMode from "@/hooks/useDarkMode"

export default function Home() {
  const [theme, toggleTheme] = useDarkMode()
  return (
    <div className="h-screen flex items-center justify-center bg-background text-foreground transition-colors">
      <Card className="w-[350px] shadow-lg">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className=''>Electron + shadcn/ui</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm">{theme === 'dark' ? '🌙' : '☀️'}</span>
            <Switch className='' checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </CardHeader>
        <CardContent className=''>
          <p className="text-sm text-muted-foreground">
            This is a live Electron app with Vite hot reload, Tailwind, and shadcn/ui components.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}