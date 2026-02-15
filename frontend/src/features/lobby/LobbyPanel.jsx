export function LobbyPanel() {
  const sampleTables = [
    { id: 'T-1001', bet: '$5', players: '3/6', status: 'Waiting' },
    { id: 'T-1022', bet: '$50', players: '6/6', status: 'In game' }
  ];

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
      <h2 className="font-semibold mb-3">Lobby & Matchmaking</h2>
      <button className="w-full mb-4 bg-indigo-500 hover:bg-indigo-400 py-2 rounded-xl">Create Table ($1 - $1000)</button>
      <ul className="space-y-2">
        {sampleTables.map((table) => (
          <li key={table.id} className="bg-slate-800 p-3 rounded-xl text-sm">
            <div className="flex justify-between"><span>{table.id}</span><span>{table.bet}</span></div>
            <div className="flex justify-between text-slate-400"><span>{table.players}</span><span>{table.status}</span></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
