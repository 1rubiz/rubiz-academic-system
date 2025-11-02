'use client'
import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, AlertTriangle, DownloadCloud } from 'lucide-react'
import { toast } from 'react-toastify'

export default function UpdateManager() {
  const [version, setVersion] = useState('')
  const [checking, setChecking] = useState(false)
  const [status, setStatus] = useState('idle')
  const [updateInfo, setUpdateInfo] = useState(null)

  useEffect(() => {
    ;(async () => {
      const v = await window.api.updates.getAppVersion()
      setVersion(v)
    })()
  }, [])

  const handleCheckUpdate = async () => {
    setChecking(true)
    setStatus('idle')
    try {
      const result = await window.api.updates.checkForUpdate()
      if (result.updateAvailable) {
        setStatus('available')
        toast.success('Updates available!')
        setUpdateInfo(result.info)
      } else {
        setStatus('upToDate')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error getting updates')
      setStatus('error')
    } finally {
      setChecking(false)
    }
  }

  const handleDownload = async () => {
    const res = await window.api.updates.downloadUpdate()
    if (!res.success) {
      toast.error('Error downloading update')
      alert('Download failed: ' + res.error)
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm p-6 max-w-sm mx-auto shadow-lg transition">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            App Version
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
            v{version || 'loading...'}
          </p>
        </div>

        <button
          onClick={handleCheckUpdate}
          disabled={checking}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {checking ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              Checking...
            </>
          ) : (
            <>
              <DownloadCloud className="w-4 h-4" />
              Check for Updates
            </>
          )}
        </button>

        {status === 'upToDate' && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mt-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>You&apos;re up to date!</span>
          </div>
        )}

        {status === 'available' && (
          <div className="flex flex-col items-center gap-2 text-amber-600 dark:text-amber-400 mt-2">
            <AlertTriangle className="w-5 h-5" />
            <p>
              Update <strong>v{updateInfo?.version}</strong> available
            </p>
            <button
              onClick={handleDownload}
              className="mt-2 px-4 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition"
            >
              Download & Install
            </button>
          </div>
        )}

        {status === 'error' && (
          <p className="text-red-500 dark:text-red-400 mt-2">Failed to check for updates.</p>
        )}
      </div>
    </div>
  )
}
