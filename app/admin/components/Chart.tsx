"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ChartProps {
  data: any;
  options: any;
}

const Chart: React.FC<ChartProps> = ({ data, options }) => {
  return <Bar data={data} options={options} />;
};

export default Chart;
