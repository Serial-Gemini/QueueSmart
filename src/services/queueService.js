import {
  doc, collection, runTransaction, writeBatch, updateDoc, serverTimestamp,
} from "firebase/firestore";
import * as Crypto from "expo-crypto";
import { db } from "../firebase";

export const formatNumber = (prefix, n) => `${prefix}-${String(n).padStart(3, "0")}`;

// QR payload: queuesmart://join?o=<officeId>&t=<token>  (never contains a queue number)
export const buildQr = (officeId, token) =>
  `queuesmart://join?o=${encodeURIComponent(officeId)}&t=${token}`;

export function parseQr(data) {
  const m = /^queuesmart:\/\/join\?o=([^&]+)&t=([A-Za-z0-9_-]+)$/.exec(String(data).trim());
  if (!m) return null;
  try { return { officeId: decodeURIComponent(m[1]), token: m[2] }; } catch { return null; }
}

export function newToken() {
  const bytes = Crypto.getRandomBytes(16);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const officeRef = (id) => doc(db, "offices", id);
const ticketRef = (officeId, id) => doc(db, "offices", officeId, "tickets", id);
const lockRef = (officeId, uid) => doc(db, "activeTickets", `${officeId}_${uid}`);

/* ---------- STUDENT (used by Phase 3) ---------- */
export async function joinQueue({ officeId, token, uid, profile }) {
  const newTicket = doc(collection(db, "offices", officeId, "tickets"));
  return runTransaction(db, async (tx) => {
    const officeSnap = await tx.get(officeRef(officeId));
    if (!officeSnap.exists()) throw new Error("This office does not exist.");
    const office = officeSnap.data();
    if (!office.qrActive || office.qrToken !== token) throw new Error("This QR code is expired or inactive.");
    if (office.paused) throw new Error("This office has paused its queue. Try again later.");
    if (office.status === "Closed") throw new Error("This office is currently closed.");
    if ((await tx.get(lockRef(officeId, uid))).exists()) throw new Error("You already have an active queue number here.");

    const n = (office.lastNumber || 0) + 1;
    const number = formatNumber(office.prefix, n);
    tx.update(officeRef(officeId), { lastNumber: n });
    tx.set(newTicket, {
      uid, officeId, officeName: office.name, number, n, session: office.session || 0,
      studentName: profile.fullName, studentNumber: profile.studentNumber,
      status: "waiting", createdAt: serverTimestamp(),
    });
    tx.set(lockRef(officeId, uid), { uid, officeId, ticketId: newTicket.id });
    return { ticketId: newTicket.id, number };
  });
}

export async function cancelOwnTicket({ officeId, ticketId, uid }) {
  const b = writeBatch(db);
  b.update(ticketRef(officeId, ticketId), { status: "cancelled", endedAt: serverTimestamp() });
  b.delete(lockRef(officeId, uid));
  await b.commit();
}

/* ---------- ADMIN ---------- */
export function callNext(officeId, ticket) {
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ticketRef(officeId, ticket.id));
    if (!snap.exists() || snap.data().status !== "waiting") throw new Error("That student is no longer waiting.");
    tx.update(snap.ref, { status: "serving", calledAt: serverTimestamp() });
    tx.update(officeRef(officeId), { servingN: ticket.n, servingNumber: ticket.number });
  });
}

// action: "completed" | "cancelled" | "skipped". All of them release the student's lock.
export function closeTicket({ officeId, ticket, action }) {
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ticketRef(officeId, ticket.id));
    const st = snap.exists() ? snap.data().status : null;
    if (st !== "waiting" && st !== "serving") throw new Error("This entry was already closed.");
    tx.update(snap.ref, { status: action, endedAt: serverTimestamp() });
    tx.delete(lockRef(officeId, ticket.uid));
  });
}

export const setPaused = (officeId, paused) => updateDoc(officeRef(officeId), { paused });
export const setOfficeStatus = (officeId, status) => updateDoc(officeRef(officeId), { status });
export const setQrActive = (officeId, active) => updateDoc(officeRef(officeId), { qrActive: active });
export const regenerateQr = (officeId) =>
  updateDoc(officeRef(officeId), { qrToken: newToken(), qrActive: true });

// Cancels everyone still in line, then starts a fresh numbering session (REG-001 again).
export async function resetQueue(officeId, activeTickets, session) {
  const CHUNK = 200; // 2 writes each, stays under the 500-write batch limit
  for (let i = 0; i < activeTickets.length; i += CHUNK) {
    const b = writeBatch(db);
    activeTickets.slice(i, i + CHUNK).forEach((t) => {
      b.update(ticketRef(officeId, t.id), { status: "cancelled", endedAt: serverTimestamp() });
      b.delete(lockRef(officeId, t.uid));
    });
    await b.commit();
  }
  await updateDoc(officeRef(officeId), {
    session: session + 1, lastNumber: 0, servingN: 0, servingNumber: null,
  });
}