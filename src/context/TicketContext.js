import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import { notify } from "../utils/notify";

const TicketContext = createContext(null);
export const useTicket = () => useContext(TicketContext);

const ALMOST_AT = 2; // "Almost Your Turn" when this many students (or fewer) are ahead
const FINAL = ["completed", "cancelled", "skipped"];
const LABELS = { serving: "Now Serving", completed: "Completed", cancelled: "Cancelled", skipped: "Skipped" };

function describe(t, office) {
  const servingN = office?.servingN || 0;
  const waiting = t.status === "waiting";
  const ahead = waiting ? Math.max(0, t.n - servingN - 1) : 0; // approximate, see notes
  const label = waiting ? (ahead <= ALMOST_AT ? "Almost Your Turn" : "Waiting") : LABELS[t.status] || t.status;
  return { ...t, ahead, label, isFinal: FINAL.includes(t.status), nowServing: office?.servingNumber || null };
}

export function TicketProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [refs, setRefs] = useState([]);      // [{ officeId, ticketId }]
  const [tickets, setTickets] = useState({}); // ticketId -> ticket
  const [offices, setOffices] = useState({}); // officeId -> office
  const [error, setError] = useState(null);
  const prev = useRef({});

  // 1) Find my active tickets (the lock documents), and keep them until dismissed
  useEffect(() => {
    setRefs([]); setTickets({}); prev.current = {};
    if (!uid) return;
    const q = query(collection(db, "activeTickets"), where("uid", "==", uid));
    return onSnapshot(
      q,
      (snap) => {
        const found = snap.docs.map((d) => ({ officeId: d.data().officeId, ticketId: d.data().ticketId }));
        setRefs((p) => {
          const add = found.filter((f) => !p.some((x) => x.ticketId === f.ticketId));
          return add.length ? [...p, ...add] : p;
        });
      },
      (e) => setError(e.message)
    );
  }, [uid]);

  // 2) Listen live to each ticket and its office
  const key = refs.map((r) => r.ticketId).join(",");
  useEffect(() => {
    const unsubs = [];
    refs.forEach((r) => {
      unsubs.push(onSnapshot(
        doc(db, "offices", r.officeId, "tickets", r.ticketId),
        (s) => { if (s.exists()) setTickets((t) => ({ ...t, [r.ticketId]: { id: s.id, ...s.data() } })); },
        (e) => setError(e.message)
      ));
    });
    [...new Set(refs.map((r) => r.officeId))].forEach((id) => {
      unsubs.push(onSnapshot(
        doc(db, "offices", id),
        (s) => { if (s.exists()) setOffices((o) => ({ ...o, [id]: { id: s.id, ...s.data() } })); },
        (e) => setError(e.message)
      ));
    });
    return () => unsubs.forEach((u) => u());
  }, [key]);

  const items = useMemo(
    () => refs.map((r) => (tickets[r.ticketId] ? describe(tickets[r.ticketId], offices[r.officeId]) : null)).filter(Boolean),
    [refs, tickets, offices]
  );

  // 3) Notifications on real changes only
  useEffect(() => {
    items.forEach((it) => {
      const p = prev.current[it.id];
      const almost = it.label === "Almost Your Turn";
      if (p) {
        if (p.status !== it.status) {
          if (it.status === "serving") notify("It's your turn!", `${it.number} is now being served at ${it.officeName}. Please proceed to the counter.`);
          else if (it.status === "completed") notify("Transaction completed", `Your ${it.officeName} transaction (${it.number}) is done.`);
          else if (it.status === "cancelled") notify("Queue cancelled", `Your queue number ${it.number} at ${it.officeName} was cancelled.`);
          else if (it.status === "skipped") notify("You were skipped", `${it.number} at ${it.officeName} was skipped. You can scan again for a new number.`);
        } else if (it.status === "waiting" && !p.almost && almost) {
          notify("Your turn is approaching", `${it.number} at ${it.officeName}: ${it.ahead} ahead of you. Please head to the office.`);
        }
      }
      prev.current[it.id] = { status: it.status, almost };
    });
  }, [items]);

  const track = useCallback((ref) => {
    setRefs((p) => (p.some((x) => x.ticketId === ref.ticketId) ? p : [...p, ref]));
  }, []);

  const dismiss = useCallback((ticketId) => {
    setRefs((p) => p.filter((x) => x.ticketId !== ticketId));
    setTickets((t) => { const n = { ...t }; delete n[ticketId]; return n; });
    delete prev.current[ticketId];
  }, []);

  return <TicketContext.Provider value={{ items, track, dismiss, error }}>{children}</TicketContext.Provider>;
}