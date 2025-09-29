import { Chat } from "./components/Chat";
import FileUpload from "./components/FileUpload";

export default function Home() {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] flex gap-6">

        {/* Left Section  */}
        <div className="w-[30%] h-full bg-black/20 backdrop-blur-xl border border-gold/20 rounded-2xl shadow-lg shadow-gold/10 flex flex-col">
          <div className="p-6 border-b border-gold/20">
            <h2 className="text-xl font-semibold text-gold">Offer a Document</h2>
            <p className="text-sm text-slate-300 mt-1">
              The Bot will absorb its knowledge.
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <FileUpload />
          </div>
        </div>

        {/* Right Section  */}
        <div className="w-[70%] h-full bg-black/20 backdrop-blur-xl border border-gold/20 rounded-2xl shadow-lg shadow-gold/10 overflow-hidden">
          <Chat />
        </div>

      </div>
    </div>
  );
}