// src/hooks/useFetch.js
import { useEffect, useState } from "react";
import api from "../utils/api";

export default function useFetch(path, fallback = []) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get(path)
      .then((res) => {
        if (!mounted) return;
        setData(res.data || []);
        setError("");
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to load data."
        );
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [path]);

  return { data, loading, error };
}