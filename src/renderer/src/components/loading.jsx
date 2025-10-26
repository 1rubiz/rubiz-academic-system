import { useLoadingStore } from '@/store/loadingStore'

const Loading = () => {
  const { isLoading } = useLoadingStore()
  return (
    isLoading && (
      <div className="fixed top-0 left-0 flex items-center justify-center w-screen h-screen z-200 bg-linear-to-b from-[#3C4B57]/80 to-[#1C262B]/60">
        <div className="loading-dots">
          <span className="dot bg-white w-12 h-12" style={{ animationDelay: '0s' }}></span>
          <span className="dot" style={{ animationDelay: '0.2s' }}></span>
          <span className="dot" style={{ animationDelay: '0.4s' }}></span>
        </div>
      </div>
    )
  )
}

export default Loading
