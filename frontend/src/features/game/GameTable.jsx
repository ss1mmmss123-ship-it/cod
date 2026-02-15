const cards = ['6♣', 'J♦', 'A♥', '10♠', 'K♠', '9♥'];

export function GameTable() {
  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 min-h-[480px]">
      <h2 className="font-semibold mb-4">Real-time Durak Table</h2>
      <div className="h-56 rounded-2xl border border-slate-700 bg-[radial-gradient(circle_at_center,_#1e293b,_#020617)] flex items-center justify-center mb-4">
        <div className="grid grid-cols-3 gap-3">
          {cards.map((card) => (
            <div key={card} className="card-anim bg-slate-100 text-slate-900 px-4 py-6 rounded-xl font-bold shadow-lg">{card}</div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button className="bg-emerald-500 px-4 py-2 rounded-xl">Attack</button>
        <button className="bg-amber-500 px-4 py-2 rounded-xl">Defend</button>
        <button className="bg-rose-500 px-4 py-2 rounded-xl">Take Cards</button>
      </div>
    </div>
  );
}
