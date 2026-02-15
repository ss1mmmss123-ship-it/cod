export function WalletPanel() {
  return (
    <div className="flex items-center gap-2">
      <div className="text-right text-sm">
        <p className="text-slate-400">USDC Balance</p>
        <p className="font-semibold">412.55</p>
      </div>
      <button className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">Connect Wallet</button>
    </div>
  );
}
