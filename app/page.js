"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Checkbox, Typography, Button } from "@mui/material";

export default function Home() {
  const [datasets, setDatasets] = useState({
    dataset1: { training: false, testing: false },
    dataset2: { training: false, testing: false },
    dataset3: { training: false, testing: false },
    dataset4: { training: false, testing: false },
  });

  const router = useRouter();

  const handleChange = (dataset, type) => {
    setDatasets((prev) => ({
      ...prev,
      [dataset]: {
        ...prev[dataset],
        [type]: !prev[dataset][type],
      },
    }));
  };

  const handleRunModel = () => {
    const queryString = new URLSearchParams({
      data: JSON.stringify(datasets),
    }).toString();
    router.push(`/result?${queryString}`);
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
    <Box sx={{ p: 4, textAlign: "center", mt: 12 }}>
      <Typography className="centeredTitle">
        Select subsets of the data to be used for training and testing the model
      </Typography>


      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 2,
          mt: 4,
        }}
      >
        {/* Training Section */}
        <Box className="training-container" sx={{ textAlign: "center" }}>
          <Typography mb={1} variant="h6" sx={{ textWrap: "balance" }}>
            Training
          </Typography>
          <Box className="tube">
            <Box
              className="tube-fill training-fill"
              sx={{ height: calculateFill("training") }}
            />
          </Box>
        </Box>

        {/* Dataset Section */}
        <Box className="dataset-section" sx={{ textAlign: "center" }}>
          <Typography variant="h6" mb={2} sx={{ textWrap: "balance" }}>
            Data Subsets
          </Typography>
          {Object.keys(datasets).map((dataset, index) => (
            <Box
              key={dataset}
              className="subset-container"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Checkbox
                checked={datasets[dataset].training}
                onChange={() => handleChange(dataset, "training")}
              />
              <Box className="subset-box">{index + 1}</Box>
              <Checkbox
                checked={datasets[dataset].testing}
                onChange={() => handleChange(dataset, "testing")}
              />
            </Box>
          ))}
          <Button
            variant="contained"
            className="run-model-button"
            onClick={handleRunModel}
            disabled={isButtonDisabled()}
            sx={{ mt: 4 }}
          >
            Run Model
          </Button>
        </Box>

        {/* Testing Section */}
        <Box className="testing-container" sx={{ textAlign: "center" }}>
          <Typography mb={1} variant="h6" sx={{ textWrap: "balance" }}>
            Testing
          </Typography>
          <Box className="tube">
            <Box
              className="tube-fill testing-fill"
              sx={{ height: calculateFill("testing") }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
