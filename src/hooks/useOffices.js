import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { sampleOffices } from "../data/sampleOffices";

export default function useOffices() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("sample"); // "firebase" or "sample"
  const [error, setError] = useState(null);

  useEffect(() => {
    const useSample = () => {
      setOffices(sampleOffices);
      setSource("sample");
      setLoading(false);
    };

    if (!isFirebaseConfigured) {
      useSample();
      return;
    }

    const q = query(collection(db, "offices"), orderBy("name"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        if (list.length === 0) {
          useSample();
        } else {
          setOffices(list);
          setSource("firebase");
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        useSample();
      }
    );

    return unsubscribe;
  }, []);

  return { offices, loading, source, error };
}
