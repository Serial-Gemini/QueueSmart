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
    const loadSample = () => {
      setOffices(sampleOffices);
      setSource("sample");
      setLoading(false);
    };

    if (!isFirebaseConfigured) {
      loadSample();
      return;
    }

    const q = query(collection(db, "offices"), orderBy("name"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (list.length === 0) {
          loadSample();
        } else {
          setOffices(list);
          setSource("firebase");
          setError(null);
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        loadSample();
      }
    );
    return unsubscribe;
  }, []);

  return { offices, loading, source, error };
}