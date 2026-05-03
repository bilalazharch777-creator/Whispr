import { LoaderIcon } from "lucide-react"

const ChatLoader = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <LoaderIcon className="animate-spin size-10 text-primary"></LoaderIcon>
      <p className="mt-4 text-center text-lg font-mono">Connecting To Chat....</p>
    </div>
  )
}

export default ChatLoader
