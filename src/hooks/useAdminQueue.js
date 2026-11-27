import { useEffect, useMemo, useState } from "react";
import { doc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function useAdminQueue(officeId) {
  const [office, setOffice] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const session = office?.session || 0;
  const exists = !!office;

  useEffect(() => {
  setOffice(null);
  setTickets([]);
  setError(null);
  if (!officeId) { setLoading(false); return; }
  setLoading(true);
  return onSnapshot(
    doc(db, "offices", officeId),
    (snap) => { setOffice(snap.exists() ? { id: snap.id, ...snap.data() } : null); setLoading(false); },
    (e) => { setError(e.message); setLoading(false); }
  );
}, [officeId]);

  useEffect(() => {
    if (!officeId || !exists) return;
    const q = query(collection(db, "offices", officeId, "tickets"), where("session", "==", session));
    return onSnapshot(
      q,
      (snap) => setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.n - b.n)),
      (e) => setError(e.message)
    );
  }, [officeId, session, exists]);

  const derived = useMemo(() => {
    const count = (s) => tickets.filter((t) => t.status === s).length;
    return {
      waiting: tickets.filter((t) => t.status === "waiting"),
      serving: tickets.find((t) => t.status === "serving") || null,
      stats: {
        total: tickets.length, waiting: count("waiting"), serving: count("serving"),
        completed: count("completed"), cancelled: count("cancelled"), skipped: count("skipped"),
      },
    };
  }, [tickets]);

  return { office, tickets, ...derived, session, loading, error };
}