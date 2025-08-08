import BubbleWrapPopper from "@/components/bubble-wrap-popper"

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#e6f2ff] to-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-[#007acc] to-[#004080] bg-clip-text text-transparent drop-shadow">
              Bubble Wrap Popper
            </span>
          </h1>
        </header>

        <div className="mt-8">
          <BubbleWrapPopper />
        </div>
      </div>
    </main>
  )
}
