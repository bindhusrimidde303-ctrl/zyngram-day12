"use client";

import { useEffect, useState } from "react";

type MonitoringData = {
  conversations: number;
  questions: number;
  successfulAnswers: number;
  noAnswers: number;
  averageResponseTimeMs: number;
  evaluations: number;
  categories: {
    category: string;
    count: number;
  }[];
};

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonitoring();
  }, []);

  async function loadMonitoring() {
    try {
      const response = await fetch("/api/monitoring/summary");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load monitoring data."
        );
      }

      setData(result.monitoring);
    } catch (err) {
      console.error(err);
      setError("Unable to load monitoring data.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: "40px", color: "#111827" }}>
        <h1>Monitoring Dashboard</h1>
        <p>Loading monitoring data...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: "40px", color: "#111827" }}>
        <h1>Monitoring Dashboard</h1>
        <p style={{ color: "#b91c1c" }}>{error}</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        padding: "40px 20px",
        color: "#111827",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            marginBottom: "8px",
          }}
        >
          Monitoring Dashboard
        </h1>

        <p
          style={{
            color: "#4b5563",
            marginBottom: "30px",
          }}
        >
          Zynora production monitoring summary
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <MetricCard
            title="Conversations"
            value={data?.conversations ?? 0}
          />

          <MetricCard
            title="Questions"
            value={data?.questions ?? 0}
          />

          <MetricCard
            title="Successful Answers"
            value={data?.successfulAnswers ?? 0}
          />

          <MetricCard
            title="No-Answer Responses"
            value={data?.noAnswers ?? 0}
          />

          <MetricCard
            title="Avg Response Time"
            value={`${data?.averageResponseTimeMs ?? 0} ms`}
          />

          <MetricCard
            title="AI Evaluations"
            value={data?.evaluations ?? 0}
          />
        </div>

        <section
          style={{
            marginTop: "30px",
            background: "white",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              marginBottom: "18px",
            }}
          >
            Approved Knowledge Categories
          </h2>

          {data?.categories.length === 0 ? (
            <p>No approved knowledge categories found.</p>
          ) : (
            <div>
              {data?.categories.map((item) => (
                <div
                  key={item.category}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <span>{item.category}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <button
          onClick={loadMonitoring}
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            borderRadius: "8px",
            border: "1px solid #9ca3af",
            background: "white",
            color: "#111827",
            cursor: "pointer",
          }}
        >
          Refresh Monitoring
        </button>
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        padding: "22px",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <p
        style={{
          margin: "10px 0 0",
          fontSize: "30px",
          fontWeight: "700",
        }}
      >
        {value}
      </p>
    </div>
  );
}