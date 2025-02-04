"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";
import { Box, Typography, CircularProgress, Switch, FormControlLabel, Tooltip as MuiTooltip } from "@mui/material";
import { Chart as ChartJS, CategoryScale, LinearScale, BarController, BarElement, LineController, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarController, BarElement, LineController, LineElement, PointElement, Title, Tooltip, Legend);

function ActualPerformanceContent() {
  const searchParams = useSearchParams();
  const predictedPerformance = searchParams.get("predicted");
  const actualPerformance = searchParams.get("actual");
  const dataString = searchParams.get("data");

  const [showAllResults, setShowAllResults] = useState(false);
  const [originalUserErrors, setOriginalUserErrors] = useState([]);
  const [filteredUserErrors, setFilteredUserErrors] = useState([]);
  const [allTrueFilteredErrors, setAllTrueFilteredErrors] = useState([]);
  const dataSaved = useRef(false);

  const predictedValue = predictedPerformance ? parseFloat(predictedPerformance) : 0;
  const actualValue = actualPerformance ? parseFloat(actualPerformance) : 0;
  const errorValue = (predictedValue - actualValue) || 0;
  const formattedErrorValue = errorValue.toFixed(2);


  let datasets = {};
  try {
    datasets = dataString ? JSON.parse(decodeURIComponent(dataString)) : {};
  } catch (error) {
    console.error("Error parsing datasets:", error);
  }

  useEffect(() => {
    if (!dataSaved.current) {
      const userData = {
        predicted_performance: predictedValue,
        actual_performance: actualValue,
        error_in_accuracy: errorValue,
        timestamp: new Date().toISOString(),
        selected_subsets: datasets,
      };

      fetch("/api/saveUserData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
        .then((res) => res.json())
        .then((data) => console.log("Data saved to MongoDB:", data))
        .catch((error) => console.error("Error saving data:", error));

      dataSaved.current = true;
    }
  }, []);

  useEffect(() => {
    fetch("/api/getAllUserErrors")
      .then((res) => res.json())
      .then((data) => {
        if (data.errors) {
          setOriginalUserErrors(data.errors);

          const allTrueData = data.errors.filter((doc) => {
            const subsets = doc.selected_subsets;
            return Object.values(subsets).some((d) => d.training === true && d.testing === true);
          });

          setAllTrueFilteredErrors(allTrueData);

          const filteredErrors = data.errors.filter((doc) => {
            const subsets = doc.selected_subsets;
            return Object.values(subsets).some((d) => d.training === false || d.testing === false);
          });

          setFilteredUserErrors(filteredErrors);
        }
      })
      .catch((error) => console.error("Error fetching user data:", error));
  }, []);

  const binWidth = 3;
  const histogramBins = new Array(27).fill(0);
  const allTrueHistogramBins = new Array(27).fill(0);

  filteredUserErrors.forEach((err) => {
    const binIndex = Math.floor((err.error_in_accuracy + 35) / binWidth);
    if (binIndex >= 0 && binIndex < histogramBins.length) {
      histogramBins[binIndex]++;
    }
  });

  allTrueFilteredErrors.forEach((err) => {
    const binIndex = Math.floor((err.error_in_accuracy + 35) / binWidth);
    if (binIndex >= 0 && binIndex < allTrueHistogramBins.length) {
      allTrueHistogramBins[binIndex]++;
    }
  });

  const histogramLabels = Array.from({ length: histogramBins.length }, (_, i) => -35 + i * binWidth);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: { size: 14 },
          color: "#333",
        },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        type: "linear",
        position: "bottom",
        min: -35,
        max: 35,
        beginAtZero: false,
        ticks: { stepSize: 5 },
        title: { display: true, text: "Difference between Your Guess and Actual Model Performance" },
      },
      y: {
        display: true,
        beginAtZero: true,
        min: 0,
        max: Math.max(...histogramBins, ...allTrueHistogramBins, 10) * 0.67,  // Reduce max height by 33%
        ticks: { display: false }, // Show Y-axis values
      },
    },
  };

  const chartData = {
    labels: histogramLabels,
    datasets: [
      ...(showAllResults
        ? [
          { type: "bar", label: "Non-overlapping Data", data: histogramBins, backgroundColor: "rgba(50, 205, 50, 0.6)" }, // GREEN (was red)
          { type: "bar", label: "Overlapping Data", data: allTrueHistogramBins, backgroundColor: "rgba(255, 76, 76, 0.6)" }, // RED (was green)
        ]
        : []),
      { type: "line", label: "Actual Model Performance", data: [{ x: 0, y: 0 }, { x: 0, y: Math.max(...histogramBins, 1) }], borderColor: "#007FFF", borderWidth: 3 },
      // { type: "line", label: "Difference", data: [{ x: errorValue, y: 0 }, { x: errorValue, y: Math.max(...histogramBins, 1) }], borderColor: "#8A2BE2", borderWidth: 3 },
      { type: "line", label: "Difference", data: [{ x: errorValue, y: 0 }, { x: errorValue, y: Math.max(...histogramBins, ...allTrueHistogramBins, 10) }], borderColor: "#8A2BE2", borderWidth: 3 },

    ],
  };

  return (
    <Box sx={{ p: 4, textAlign: "center", mt: 12 }}>
      <Typography variant="h4" gutterBottom sx={{ display: "none" }}>
        Performance Comparison
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 6, mb: 3 }}>
        <MuiTooltip title={`Your Guess: ${predictedPerformance}% minus Actual Model Performance: ${actualPerformance}%`}>
          <Box sx={{ padding: "20px", background: "#8A2BE2", borderRadius: "10px", fontSize: "24px", minWidth: "250px", cursor: "pointer" }}>
            <Typography variant="h6" sx={{ mb: 1, color: "white" }}>Difference</Typography>
            <Typography variant="h5" sx={{ color: "white" }}>{errorValue ? `${formattedErrorValue}%` : "N/A"}</Typography>
          </Box>
        </MuiTooltip>

        {/* <Box sx={{ padding: "20px", background: "#007FFF", borderRadius: "10px", fontSize: "24px", minWidth: "250px" }}>
          <Typography variant="h6" sx={{ mb: 1, color: "white" }}>Actual Model Performance</Typography>
          <Typography variant="h5" sx={{ color: "white" }}>{actualPerformance ? `${actualPerformance}%` : "N/A"}</Typography>
        </Box> */}

        <Box sx={{ display: "none" }}>
          <Typography variant="h6" sx={{ mb: 1, color: "white" }}>Actual Model Performance</Typography>
          <Typography variant="h5" sx={{ color: "white" }}>{actualPerformance ? `${actualPerformance}%` : "N/A"}</Typography>
        </Box>


      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={<Switch checked={showAllResults} onChange={() => setShowAllResults((prev) => !prev)} />}
          label={<Typography variant="h6">Show Results From All Users</Typography>}
        />
      </Box>

      {/* <Box sx={{ width: "100%", maxWidth: "900px", height: "500px", mx: "auto", mt: 4 }}> */}
      <Box sx={{ width: "100%", maxWidth: "900px", height: "335px", mx: "auto", mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Performance Error Distribution
        </Typography>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Box>
  );
}

export default function ActualPerformance() {
  return <Suspense fallback={<CircularProgress />}><ActualPerformanceContent /></Suspense>;
}
