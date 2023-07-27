import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import { io } from "socket.io-client";

const LineChart = () => {
  const chartRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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

    const myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((entry) => {
          const timestamp = new Date(entry?.timestamp);
          const options = {
            weekday: "short",
            hour: "numeric",
            minute: "numeric",
            month: "short",
          };
          return timestamp.toLocaleString([], options);
        }),
        datasets: [
          {
            label: `Sales ${new Date().getFullYear()}`,
            data: data.map((entry) => entry?.value),
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      myChart.destroy();
    };
  }, [data, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <canvas ref={chartRef} style={{ width: "100%", height: "100px" }} />;
};

export default LineChart;
