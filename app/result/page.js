"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Box, Typography, CircularProgress, Slider, Button } from "@mui/material";

function ResultContent() {
  const searchParams = useSearchParams();
  const dataString = searchParams.get("data");
  const router = useRouter();

  const [testPerformance, setTestPerformance] = useState(null);
  const [predictedPerformance, setPredictedPerformance] = useState(null); // Start as null
  const [outOfSamplePerformance, setOutOfSamplePerformance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!dataString) return;

      try {
        const response = await fetch("/datahold.json");
        const jsonData = await response.json();
        const selectedData = JSON.parse(dataString);

        const filterCriteria = {
          training_1: selectedData.dataset1.training ? 1 : 0,
          training_2: selectedData.dataset2.training ? 1 : 0,
          training_3: selectedData.dataset3.training ? 1 : 0,
          training_4: selectedData.dataset4.training ? 1 : 0,
          testing_1: selectedData.dataset1.testing ? 1 : 0,
          testing_2: selectedData.dataset2.testing ? 1 : 0,
          testing_3: selectedData.dataset3.testing ? 1 : 0,
          testing_4: selectedData.dataset4.testing ? 1 : 0,
        };

        const matchedObject = jsonData.find((entry) =>
          Object.keys(filterCriteria).every((key) => entry[key] === filterCriteria[key])
        );

        if (matchedObject?.test_performance !== undefined) {
          const testPerf = (matchedObject.test_performance * 100).toFixed(2);
          setTestPerformance(`${testPerf}%`);
          setOutOfSamplePerformance((matchedObject.out_of_sample_performance * 100).toFixed(2));
          setPredictedPerformance(parseFloat(testPerf)); // Set slider default to test_performance
        } else {
          setTestPerformance("No results found");
          setOutOfSamplePerformance(null);
          setPredictedPerformance(50); // Fallback default if no data is found
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dataString]);

  const handleRunModel = () => {
    if (outOfSamplePerformance !== null) {
      router.push(
        `/actualPerformance?predicted=${predictedPerformance}&actual=${outOfSamplePerformance}&data=${encodeURIComponent(dataString)}`
      );
    }
  };

  return (
    <Box sx={{ p: 4, textAlign: "center", mt: 12 }}>
      <Typography variant="h4" gutterBottom>
        Here are the testing results
      </Typography>
      <Box
        sx={{
          display: "inline-block",
          padding: "20px",
          background: "#f4f4f4",
          borderRadius: "10px",
          fontSize: "24px",
          fontWeight: "bold",
          minWidth: "150px",
        }}
      >
        {testPerformance !== null ? testPerformance : <CircularProgress />}
      </Box>

      <Box sx={{ mt: 6, width: "80%", maxWidth: "500px", mx: "auto" }}>
        <Typography variant="h6" gutterBottom>
          Predict how well the model will perform on new data
        </Typography>
        <Slider
          value={predictedPerformance !== null ? predictedPerformance : 50} // Use test_performance if available
          onChange={(event, newValue) => setPredictedPerformance(newValue)}
          min={0}
          max={100}
          step={1}
          marks={[
            { value: 0, label: "0" },
            { value: 100, label: "100" },
          ]}
          sx={{ color: "#9932cc" }}
        />
        <Typography sx={{ mt: 2, fontSize: "18px" }}>
          Your Prediction: <b>{predictedPerformance !== null ? predictedPerformance : 50}%</b>
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#9932cc",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            textTransform: "none",
            padding: "10px 20px",
            "&:hover": { backgroundColor: "#800080" },
          }}
          onClick={handleRunModel}
          disabled={outOfSamplePerformance === null}
        >
          Run Model
        </Button>
      </Box>
    </Box>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<Box sx={{ textAlign: "center", mt: 12 }}><CircularProgress /></Box>}>
      <ResultContent />
    </Suspense>
  );
}
