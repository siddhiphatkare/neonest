// Enhanced version with clearer WHO labeling and validation
"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export default function GrowthChart({ defaultMonths = 68 }) {
  const [months, setMonths] = useState(defaultMonths);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [whoDataVersion, setWhoDataVersion] = useState("WHO Child Growth Standards 2006");

  // Helper function to calculate months from DOB
  const getMonthsSinceDOB = (dateStr, dobStr) => {
    if (!dobStr || !dateStr) return 0;
    const birthDate = new Date(dobStr);
    const entryDate = new Date(dateStr);
    
    let months = (entryDate.getFullYear() - birthDate.getFullYear()) * 12;
    months += entryDate.getMonth() - birthDate.getMonth();
    
    if (entryDate.getDate() < birthDate.getDate()) {
      months--;
    }
    
    return Math.max(0, Math.round(months));
  };

  // WHO Child Growth Standards - Height/Length for age (median values)
  const getPredictedHeight = (ageMonths, gender) => {
    // WHO 2006 Length/Height-for-age median values (50th percentile)
    const whoHeightDataMale = {
      0: 49.9, 1: 54.7, 2: 58.4, 3: 61.4, 4: 63.9, 5: 65.9, 6: 67.6,
      7: 69.2, 8: 70.6, 9: 72.0, 10: 73.3, 11: 74.5, 12: 75.7,
      15: 79.1, 18: 82.3, 21: 85.1, 24: 87.8, 30: 92.3, 36: 96.1,
      42: 99.6, 48: 102.9, 54: 106.0, 60: 109.0
    };
    
    const whoHeightDataFemale = {
      0: 49.1, 1: 53.7, 2: 57.1, 3: 59.8, 4: 62.1, 5: 64.0, 6: 65.7,
      7: 67.3, 8: 68.7, 9: 70.1, 10: 71.5, 11: 72.8, 12: 74.0,
      15: 77.5, 18: 80.7, 21: 83.4, 24: 86.4, 30: 90.3, 36: 94.1,
      42: 97.4, 48: 100.6, 54: 103.7, 60: 106.6
    };

    const whoHeightData = gender === "male" ? whoHeightDataMale : whoHeightDataFemale;

    if (whoHeightData[ageMonths]) {
      return whoHeightData[ageMonths];
    }

    // Linear interpolation between known WHO values
    const months = Object.keys(whoHeightData).map(Number).sort((a, b) => a - b);
    
    let lowerMonth = 0;
    let upperMonth = 60;
    
    for (let i = 0; i < months.length - 1; i++) {
      if (ageMonths >= months[i] && ageMonths <= months[i + 1]) {
        lowerMonth = months[i];
        upperMonth = months[i + 1];
        break;
      }
    }
    
    if (ageMonths < 0) return whoHeightData[0];
    if (ageMonths > 60) {
      // WHO-based extrapolation beyond 60 months
      const growthRate = gender === "male" ? 0.55 : 0.5;
      return whoHeightData[60] + ((ageMonths - 60) * growthRate);
    }
    
    // Linear interpolation
    const lowerHeight = whoHeightData[lowerMonth];
    const upperHeight = whoHeightData[upperMonth];
    const ratio = (ageMonths - lowerMonth) / (upperMonth - lowerMonth);
    
    return lowerHeight + (ratio * (upperHeight - lowerHeight));
  };

  // WHO Child Growth Standards - Weight for age (median values)
  const getPredictedWeight = (ageMonths, gender) => {
    // WHO 2006 Weight-for-age median values (50th percentile)
    const whoWeightDataMale = {
      0: 3.3, 1: 4.5, 2: 5.6, 3: 6.4, 4: 7.0, 5: 7.5, 6: 7.9,
      7: 8.3, 8: 8.6, 9: 8.9, 10: 9.2, 11: 9.4, 12: 9.6,
      15: 10.3, 18: 11.0, 21: 11.7, 24: 12.2, 30: 13.3, 36: 14.2,
      42: 15.2, 48: 16.2, 54: 17.3, 60: 18.3
    };
    
    const whoWeightDataFemale = {
      0: 3.2, 1: 4.2, 2: 5.1, 3: 5.8, 4: 6.4, 5: 6.9, 6: 7.3,
      7: 7.6, 8: 7.9, 9: 8.2, 10: 8.5, 11: 8.7, 12: 8.9,
      15: 9.6, 18: 10.2, 21: 10.9, 24: 11.5, 30: 12.7, 36: 13.9,
      42: 15.0, 48: 16.1, 54: 17.1, 60: 18.0
    };

    const whoWeightData = gender === "male" ? whoWeightDataMale : whoWeightDataFemale;

    if (whoWeightData[ageMonths]) {
      return whoWeightData[ageMonths];
    }

    // Linear interpolation between known WHO values
    const months = Object.keys(whoWeightData).map(Number).sort((a, b) => a - b);
    
    let lowerMonth = 0;
    let upperMonth = 60;
    
    for (let i = 0; i < months.length - 1; i++) {
      if (ageMonths >= months[i] && ageMonths <= months[i + 1]) {
        lowerMonth = months[i];
        upperMonth = months[i + 1];
        break;
      }
    }
    
    if (ageMonths < 0) return whoWeightData[0];
    if (ageMonths > 60) {
      // WHO-based extrapolation beyond 60 months
      const weightGain = gender === "male" ? 0.22 : 0.20;
      return whoWeightData[60] + ((ageMonths - 60) * weightGain);
    }
    
    // Linear interpolation
    const lowerWeight = whoWeightData[lowerMonth];
    const upperWeight = whoWeightData[upperMonth];
    const ratio = (ageMonths - lowerMonth) / (upperMonth - lowerMonth);
    
    return lowerWeight + (ratio * (upperWeight - lowerWeight));
  };

  // Validation function to check if values are within WHO normal ranges
  const validateAgainstWHO = (actualHeight, actualWeight, predictedHeight, predictedWeight) => {
    const heightDifference = Math.abs(actualHeight - predictedHeight);
    const weightDifference = Math.abs(actualWeight - predictedWeight);
    
    // WHO considers ±2 SD as normal range (roughly ±15% for height, ±20% for weight)
    const heightPercentDiff = (heightDifference / predictedHeight) * 100;
    const weightPercentDiff = (weightDifference / predictedWeight) * 100;
    
    return {
      heightNormal: heightPercentDiff <= 15,
      weightNormal: weightPercentDiff <= 20,
      heightPercentDiff,
      weightPercentDiff
    };
  };

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      setError(null);

      try {
        const growthLogs = JSON.parse(localStorage.getItem("growthLogs") || "[]");
        const babyDOB = localStorage.getItem("babyDOB") || "";
        const babyGender = localStorage.getItem("babyGender") || "male";

        // Create WHO standard predictions for all months
        const dataMap = new Map();
        for (let m = 0; m <= months; m++) {
          dataMap.set(m, {
            month: m,
            whoHeight: getPredictedHeight(m, babyGender),
            whoWeight: getPredictedWeight(m, babyGender),
            actualHeight: null,
            actualWeight: null,
            validation: null
          });
        }

        // Add actual measurements
        if (babyDOB && growthLogs.length > 0) {
          growthLogs.forEach((log) => {
            const ageInMonths = getMonthsSinceDOB(log.date, babyDOB);
            
            if (ageInMonths >= 0 && ageInMonths <= months && dataMap.has(ageInMonths)) {
              const data = dataMap.get(ageInMonths);
              const actualHeight = parseFloat(log.height) || null;
              const actualWeight = parseFloat(log.weight) || null;
              
              data.actualHeight = actualHeight;
              data.actualWeight = actualWeight;
              
              // Add WHO validation
              if (actualHeight && actualWeight) {
                data.validation = validateAgainstWHO(
                  actualHeight, actualWeight, 
                  data.whoHeight, data.whoWeight
                );
              }
              
              dataMap.set(ageInMonths, data);
            }
          });
        }

        const arr = Array.from(dataMap.values()).sort((a, b) => a.month - b.month);
        setChartData(arr);
      } catch (err) {
        console.error("WHO GrowthChart error:", err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('growthDataUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('growthDataUpdated', handleStorageChange);
    };
  }, [months]);

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = chartData.find((d) => d.month === label);
      if (data) {
        return (
          <div className="bg-white p-3 border border-gray-400 rounded shadow-lg text-sm">
            <p className="font-medium text-gray-800 mb-2">{`Age: ${label} months`}</p>
            <p style={{ color: "#FFA500" }}>
              {`WHO Expected Height: ${Number(data.whoHeight).toFixed(1)} cm`}
            </p>
            <p style={{ color: "#20B2AA" }}>
              {`WHO Expected Weight: ${Number(data.whoWeight).toFixed(1)} kg`}
            </p>
            {data.actualHeight !== null && (
              <p style={{ color: "#FF1493" }}>
                {`Your Baby's Height: ${Number(data.actualHeight).toFixed(1)} cm`}
              </p>
            )}
            {data.actualWeight !== null && (
              <p style={{ color: "#4169E1" }}>
                {`Your Baby's Weight: ${Number(data.actualWeight).toFixed(1)} kg`}
              </p>
            )}
            {data.validation && (
              <div className="mt-2 pt-2 border-t">
                <p className={`text-xs ${data.validation.heightNormal ? 'text-green-600' : 'text-orange-600'}`}>
                  Height: {data.validation.heightNormal ? '✓ Normal' : `⚠ ${data.validation.heightPercentDiff.toFixed(1)}% diff`}
                </p>
                <p className={`text-xs ${data.validation.weightNormal ? 'text-green-600' : 'text-orange-600'}`}>
                  Weight: {data.validation.weightNormal ? '✓ Normal' : `⚠ ${data.validation.weightPercentDiff.toFixed(1)}% diff`}
                </p>
              </div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  if (loading) return <div className="p-4">Loading WHO growth standards…</div>;
  if (error) return <div className="text-red-600 p-4">Error: {String(error)}</div>;
  if (!chartData.length) return <div className="p-4">No growth data available.</div>;

  const actualDataPoints = chartData.filter(d => d.actualHeight !== null || d.actualWeight !== null);
  const latestActual = actualDataPoints.length > 0 ? actualDataPoints[actualDataPoints.length - 1] : null;

  // Calculate dynamic domains
  const allHeights = chartData.map(d => [d.whoHeight, d.actualHeight]).flat().filter(h => h !== null);
  const allWeights = chartData.map(d => [d.whoWeight, d.actualWeight]).flat().filter(w => w !== null);

  const heightDomain = allHeights.length > 0 
    ? [Math.min(...allHeights) - 5, Math.max(...allHeights) + 5]
    : [40, 170];
  
  const weightDomain = allWeights.length > 0
    ? [Math.min(...allWeights) - 1, Math.max(...allWeights) + 1]
    : [0, 22];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            WHO Growth Standards Comparison
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Based on {whoDataVersion} (50th percentile)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Months:</label>
          <input
            type="number"
            min={1}
            max={68}
            value={months}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 1 && value <= 68) {
                setMonths(value);
              }
            }}
            className="border px-2 py-1 rounded w-20"
          />
        </div>
      </div>

      {/* WHO Information Panel */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">About WHO Growth Standards</h3>
        <p className="text-xs text-blue-700">
          The WHO Child Growth Standards describe how children should grow under optimal conditions. 
          These charts show the 50th percentile (median) values. Values within ±2 standard deviations 
          (roughly ±15% for height, ±20% for weight) are considered normal.
        </p>
      </div>

      <div className="mb-6">
        <div style={{ width: "100%", height: 450 }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 60, left: 60, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="month"
                label={{
                  value: "Age (months)",
                  position: "insideBottom",
                  offset: -10,
                }}
                tick={{ fontSize: 11 }}
                domain={['dataMin', 'dataMax']}
                type="number"
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                label={{
                  value: "Height (cm)",
                  angle: -90,
                  position: "insideLeft",
                }}
                tick={{ fontSize: 11 }}
                domain={heightDomain}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "Weight (kg)",
                  angle: 90,
                  position: "insideRight",
                }}
                tick={{ fontSize: 11 }}
                domain={weightDomain}
              />
              <Tooltip content={customTooltip} />
              <Legend
                wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
                iconType="line"
              />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="whoHeight"
                stroke="#FFA500"
                strokeDasharray="5 5"
                name="WHO Expected Height"
                dot={false}
                strokeWidth={2}
                connectNulls={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="whoWeight"
                stroke="#20B2AA"
                strokeDasharray="5 5"
                name="WHO Expected Weight"
                dot={false}
                strokeWidth={2}
                connectNulls={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="actualHeight"
                stroke="#FF1493"
                name="Your Baby's Height"
                connectNulls={false}
                dot={{ fill: "#FF1493", strokeWidth: 2, r: 4 }}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="actualWeight"
                stroke="#4169E1"
                name="Your Baby's Weight"
                connectNulls={false}
                dot={{ fill: "#4169E1", strokeWidth: 2, r: 4 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Latest Measurement:
          </h3>
          {latestActual ? (
            <div>
              <p className="text-gray-600">
                Age: {latestActual.month} months
              </p>
              {latestActual.actualHeight && (
                <p className="text-gray-600">Height: {latestActual.actualHeight} cm</p>
              )}
              {latestActual.actualWeight && (
                <p className="text-gray-600">Weight: {latestActual.actualWeight} kg</p>
              )}
              {latestActual.validation && (
                <div className="mt-2">
                  <p className={`text-sm ${latestActual.validation.heightNormal ? 'text-green-600' : 'text-orange-600'}`}>
                    Height: {latestActual.validation.heightNormal ? '✓ Within WHO normal range' : '⚠ Outside typical range'}
                  </p>
                  <p className={`text-sm ${latestActual.validation.weightNormal ? 'text-green-600' : 'text-orange-600'}`}>
                    Weight: {latestActual.validation.weightNormal ? '✓ Within WHO normal range' : '⚠ Outside typical range'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No measurements recorded yet</p>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Data Source:
          </h3>
          <p className="text-sm text-gray-600">
            WHO Child Growth Standards (2006)<br/>
            Gender-specific median values (50th percentile)<br/>
            Linear interpolation for intermediate months
          </p>
        </div>
      </div>
    </div>
  );
}