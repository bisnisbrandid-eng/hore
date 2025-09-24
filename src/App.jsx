// FinTrack - Kredit with due date and payment logic (App.jsx)

import React, { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
  return [state, setState];
}

function formatCurrency(num) {
  return num.toLocaleString("id-ID");
}

export default function App() {
  const [entries, setEntries] = useLocalStorage("fin_entries", []);
  const [form, setForm] = useState({ type: "Pemasukan", amount: "", note: "", due: "", date: new Date().toISOString().slice(0, 10) });

  const [showTransactions, setShowTransactions] = useState(false);

  const totals = useMemo(() => {
    let saldo = 0, pemasukan = 0, pengeluaran = 0, tabungan = 0, investasi = 0, kredit = 0, hutang = 0, piutang = 0;
    entries.forEach((e) => {
      if (e.kind === "Pemasukan") { pemasukan += e.amount; saldo += e.amount; }
      else if (e.kind === "Pengeluaran") { pengeluaran += e.amount; saldo -= e.amount; }
      else if (e.kind === "Tabungan") { tabungan += e.amount; saldo -= e.amount; }
      else if (e.kind === "Investasi") { investasi += e.amount; saldo -= e.amount; }
      else if (e.kind === "Kredit") { kredit += e.amount; /* tidak mempengaruhi saldo */ }
      else if (e.kind === "Bayar Kredit") { kredit -= e.amount; pengeluaran += e.amount; saldo -= e.amount; }
      else if (e.kind === "Hutang") { hutang += e.amount; saldo += e.amount; }
      else if (e.kind === "Piutang") { piutang += e.amount; /* tidak mempengaruhi saldo */ }
      else if (e.kind === "Bayar Hutang") { hutang -= e.amount; pengeluaran += e.amount; saldo -= e.amount; }
      else if (e.kind === "Bayar Piutang") { piutang -= e.amount; pemasukan += e.amount; saldo += e.amount; }
    });
    return { saldo, pemasukan, pengeluaran, tabungan, investasi, kredit, hutang, piutang };
  }, [entries]);

  function handleAdd(e) {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!amt || amt <= 0) return;

    const newEntry = { id: uuidv4(), kind: form.type, note: form.note, amount: amt, date: form.date, due: form.due };
    setEntries([newEntry, ...entries]);
    setForm({ ...form, amount: "", note: "", due: "" });
  }

  function removeEntry(id) { setEntries(entries.filter(e => e.id !== id)); }

  return (
    <div className="min-h-screen bg-white p-4 text-slate-800">
      <h1 className="text-2xl font-bold text-center text-sky-700 mb-6">Financial Statement</h1>

      {/* Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Saldo" value={totals.saldo} />
        <Stat label="Pemasukan" value={totals.pemasukan} />
        <Stat label="Pengeluaran" value={totals.pengeluaran} />
        <Stat label="Tabungan" value={totals.tabungan} />
        <Stat label="Investasi" value={totals.investasi} />
        <Stat label="Kredit" value={totals.kredit} />
        <Stat label="Hutang" value={totals.hutang} />
        <Stat label="Piutang" value={totals.piutang} />
      </div>

      {/* Input */}
      <form onSubmit={handleAdd} className="bg-white border rounded-lg p-3 mb-6 grid grid-cols-1 gap-2">
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="p-2 border rounded">
          <option>Pemasukan</option>
          <option>Pengeluaran</option>
          <option>Hutang</option>
          <option>Piutang</option>
          <option>Bayar Hutang</option>
          <option>Bayar Piutang</option>
          <option>Tabungan</option>
          <option>Investasi</option>
          <option>Kredit</option>
          <option>Bayar Kredit</option>
        </select>

        <input type="number" placeholder="Nominal" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="p-2 border rounded" />
        <input type="text" placeholder="Catatan" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="p-2 border rounded" />
        {(form.type === "Hutang" || form.type === "Piutang" || form.type === "Kredit") && (
          <input type="date" value={form.due} onChange={e => setForm({ ...form, due: e.target.value })} className="p-2 border rounded" />
        )}
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="p-2 border rounded" />
        <div className="flex gap-2">
          <button type="submit" className="bg-sky-600 text-white py-2 px-4 rounded">Tambah</button>
        </div>
      </form>

      {/* Transactions (collapsible) */}
      <div className="bg-white border rounded-lg p-3 mb-6">
        <button onClick={() => setShowTransactions(!showTransactions)} className="font-medium text-sky-600">
          {showTransactions ? "Sembunyikan Transaksi" : "Lihat Transaksi"}
        </button>
        {showTransactions && (
          <div className="mt-3 overflow-x-auto">
            {entries.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada data.</p>
            ) : (
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-sky-50">
                    <th className="border p-1">Tanggal</th>
                    <th className="border p-1">Jenis</th>
                    <th className="border p-1">Nominal</th>
                    <th className="border p-1">Catatan</th>
                    <th className="border p-1">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(e => (
                    <tr key={e.id}>
                      <td className="border p-1 whitespace-nowrap">{e.date}</td>
                      <td className="border p-1">{e.kind}</td>
                      <td className="border p-1">Rp {formatCurrency(e.amount)}</td>
                      <td className="border p-1">{e.note}{e.due && ` (Jatuh tempo: ${e.due})`}</td>
                      <td className="border p-1 text-center">
                        <button onClick={() => removeEntry(e.id)} className="text-red-600">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-sky-50 border rounded-lg p-3 text-center">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="font-semibold">Rp {formatCurrency(value)}</div>
    </div>
  );
}
