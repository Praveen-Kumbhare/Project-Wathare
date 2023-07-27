import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import { io } from "socket.io-client";
import zoomPlugin from "chartjs-plugin-zoom";

const LineChart = () => {
  const chartRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartInstance = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/data");
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();

    const socket = io("http://localhost:5000");
    socket.on("dataUpdate", (updatedData) => {
      setData((prevData) => {
        if (JSON.stringify(prevData) === JSON.stringify(updatedData)) {
          return prevData;
        }
        return updatedData;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (data.length === 0 || loading) return;

    const ctx = chartRef.current.getContext("2d");

    const currentYear = new Date().getFullYear();

    const myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((entry) => {
          const timestamp = new Date(entry?.timestamp);
          const options = {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          };
          return timestamp.toLocaleString([], options);
        }),
        datasets: [
          {
            label: currentYear.toString(),
            data: data.map((entry) => entry?.value),
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
            fill: false,
            tension: 0.2,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              mode: "xy",
            },
            pan: {
              enabled: true,
              mode: "xy",
            },
          },
        },
      },
      plugins: [zoomPlugin],
    });
    chartInstance.current = myChart;

    return () => {
      myChart.destroy();
    };
  }, [data, loading]);

  const handleResetZoom = () => {
    if (chartInstance.current) {
      chartInstance.current.resetZoom();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <canvas ref={chartRef} style={{ width: "100%", height: "100px" }} />
      <button onClick={handleResetZoom}>Reset Zoom</button>
    </div>
  );
};

export default LineChart;
