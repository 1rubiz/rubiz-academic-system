import image from '@/assets/images.jpeg'

export default function Home() {
  return (
    <div className="h-full flex items-center justify-center bg-background text-foreground transition-colors">
      <img src={image} alt="logo" className="rounded-lg" />
    </div>
  )
}
