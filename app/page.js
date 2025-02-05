"use client";

import React, { useState } from "react";
import { Box, Checkbox, Typography, Button, CircularProgress, Slider } from "@mui/material";

export default function Home() {
  const [datasets, setDatasets] = useState({
    dataset1: { training: false, testing: false },
    dataset2: { training: false, testing: false },
    dataset3: { training: false, testing: false },
    dataset4: { training: false, testing: false },
  });

  const [loading, setLoading] = useState(false);
  const [testPerformance, setTestPerformance] = useState(null);
  const [predictedPerformance, setPredictedPerformance] = useState(50);
  const [runCount, setRunCount] = useState(0);
  const [showPredictModel, setShowPredictModel] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  const [hideButtons, setHideButtons] = useState(false);
  const [outOfSamplePerformance, setOutOfSamplePerformance] = useState(null);

  const handleChange = (dataset, type) => {
    setDatasets((prev) => ({
      ...prev,
      [dataset]: {
        ...prev[dataset],
        [type]: !prev[dataset][type],
      },
    }));
  };

  const handleRunModel = async () => {
    setLoading(true);
    setRunCount((prev) => prev + 1);

    if (runCount + 1 >= 2) {
      setShowPredictModel(true);
    }

    try {
      const response = await fetch("/datahold.json");
      const jsonData = await response.json();

      const filterCriteria = {
        training_1: datasets.dataset1.training ? 1 : 0,
        training_2: datasets.dataset2.training ? 1 : 0,
        training_3: datasets.dataset3.training ? 1 : 0,
        training_4: datasets.dataset4.training ? 1 : 0,
        testing_1: datasets.dataset1.testing ? 1 : 0,
        testing_2: datasets.dataset2.testing ? 1 : 0,
        testing_3: datasets.dataset3.testing ? 1 : 0,
        testing_4: datasets.dataset4.testing ? 1 : 0,
      };

      const matchedObject = jsonData.find((entry) =>
        Object.keys(filterCriteria).every((key) => entry[key] === filterCriteria[key])
      );

      if (matchedObject?.test_performance !== undefined) {
        const testPerf = (matchedObject.test_performance * 100).toFixed(2);
        const out_of_sample_performance = (matchedObject.out_of_sample_performance * 100).toFixed(2); // New line to get out_of_sample_performance  
        setTestPerformance(`${testPerf}%`);
        setPredictedPerformance(parseFloat(testPerf));
        setOutOfSamplePerformance(out_of_sample_performance); // Store the out_of_sample_performance
      } else {
        setTestPerformance(50);
        setPredictedPerformance(50);
        setOutOfSamplePerformance(80)
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setTestPerformance(50);
      setPredictedPerformance(50);
      setOutOfSamplePerformance(80)
    }

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handlePredictModel = () => {
    setShowSlider(true);
    setHideButtons(true);
  };

  const handleRunModelWithNewData = () => {

    setShowSlider(false); // Hide the slider when this button is clicked

    const errorValue = predictedPerformance - outOfSamplePerformance;
    const formattedErrorValue = errorValue.toFixed(2);

    const userData = {
      predicted_performance: predictedPerformance,
      actual_performance: outOfSamplePerformance,
      error_in_accuracy: formattedErrorValue,
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
  };

  const isButtonDisabled = () => {
    const hasTraining = Object.values(datasets).some((d) => d.training);
    const hasTesting = Object.values(datasets).some((d) => d.testing);
    return !(hasTraining && hasTesting);
  };

  const calculateFill = (type) => {
    const selectedCount = Object.values(datasets).filter((d) => d[type]).length;
    return `${(selectedCount / 4) * 100}%`;
  };

  return (
    <Box sx={{ p: 4, textAlign: "center", mt: 6 }}>
      <Typography sx={{ fontSize: "18px", fontWeight: "bold", whiteSpace: "normal", maxWidth: "800px", mx: "auto", mb: 4 }}>
        To Train and Test the Model, select checkboxes to add Data Subsets to Training and Testing.
        This ensures the model learns patterns from training data and evaluates its accuracy on unseen testing data.
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8, mt: 3 }}>
        <Box className="training-container" sx={{ textAlign: "center" }}>
          <Typography mb={1} variant="h6">Training</Typography>
          <Box className="tube">
            <Box className="tube-fill training-fill" sx={{ height: calculateFill("training") }} />
          </Box>
        </Box>

        <Box className="dataset-section" sx={{ textAlign: "center" }}>
          <Typography variant="h6" mb={2}>Data Subsets</Typography>
          {Object.keys(datasets).map((dataset, index) => (
            <Box key={dataset} className="subset-container" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox checked={datasets[dataset].training} onChange={() => handleChange(dataset, "training")} />
              <Box className="subset-box">{index + 1}</Box>
              <Checkbox checked={datasets[dataset].testing} onChange={() => handleChange(dataset, "testing")} />
            </Box>
          ))}
        </Box>

        <Box className="testing-container" sx={{ textAlign: "center" }}>
          <Typography mb={1} variant="h6">Testing</Typography>
          <Box className="tube">
            <Box className="tube-fill testing-fill" sx={{ height: calculateFill("testing") }} />
          </Box>
        </Box>
      </Box>

      {!hideButtons && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            className={`run-model-button ${showPredictModel ? "light-purple" : ""}`}
            onClick={handleRunModel}
            disabled={isButtonDisabled() || loading}
          >
            Run Model
          </Button>
          {showPredictModel && (
            <Button
              variant="contained"
              className="predict-model-button"
              onClick={handlePredictModel}
            >
              Predict Model
            </Button>
          )}
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
        <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>Here are the testing results:</Typography>
        <Typography sx={{ fontSize: "18px", fontWeight: "bold", ml: 1 }}>
          {loading ? <CircularProgress size={24} /> : testPerformance || "No results yet"}
        </Typography>
      </Box>

      {showSlider && (
        <Box sx={{ mt: 2, width: "80%", maxWidth: "500px", mx: "auto" }}>
          <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
            Predict how well the model will perform on new data
          </Typography>
          <Slider
            value={predictedPerformance}
            onChange={(event, newValue) => setPredictedPerformance(newValue)}
            min={0}
            max={100}
            step={1}
            marks={[{ value: 0, label: "0" }, { value: 100, label: "100" }]}
            sx={{ color: "#9932cc" }}
          />
          <Typography sx={{ mt: 0, fontSize: "18px", fontWeight: "bold" }}>
            Your Prediction: {predictedPerformance}%
          </Typography>
          <Button
            variant="contained"
            className="run-model-button"
            sx={{ mt: 2 }}
            onClick={handleRunModelWithNewData}
          >
            Run Model with New Data
          </Button>
        </Box>
      )}
    </Box>
  );
}
