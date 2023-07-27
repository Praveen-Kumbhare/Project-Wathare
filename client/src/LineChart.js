import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import { io } from "socket.io-client";
import "./lineChart.css";
import zoomPlugin from "chartjs-plugin-zoom";

const LineChart = () => {
  const chartRef = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("line");

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

    const config = {
      type: chartType,
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
            borderWidth: 1,
            fill: chartType === "line",
            backgroundColor:
              chartType === "bar"
                ? "rgba(75, 192, 192, 0.2)"
                : "rgba(0, 0, 0, 0)",
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
    };

    const myChart = new Chart(ctx, config);
    chartInstance.current = myChart;

    return () => {
      myChart.destroy();
    };
  }, [data, loading, chartType]);

  const handleResetZoom = () => {
    if (chartInstance.current) {
      chartInstance.current.resetZoom();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <canvas ref={chartRef} style={{ width: "100%", height: "100px" }} />;
      <div className="btns">
        <button onClick={handleResetZoom} className="resetButton">
          Reset Zoom
        </button>
        <div className="swCntr">
          <label className="swLbl">
            <input
              type="radio"
              value="line"
              checked={chartType === "line"}
              onChange={() => setChartType("line")}
            />
            Line Chart
          </label>
          <label className="swlbl">
            <input
              type="radio"
              value="bar"
              checked={chartType === "bar"}
              onChange={() => setChartType("bar")}
            />
            Bar Chart
          </label>
        </div>
      </div>
    </div>
  );
};

export default LineChart;
