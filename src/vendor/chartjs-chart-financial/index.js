"use strict";

import {
  Chart,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
} from "chart.js";
import "@/vendor/chartjs-adapters-luxon";


Chart.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip
);

import OhlcController from "./controller.ohlc.js";
import OhlcElement from "./element.ohlc.js";

import CandlestickController from "./controller.candlestick.js";
import CandlestickElement from "./element.candlestick.js";

Chart.register(
  CandlestickController,
  OhlcController,
  CandlestickElement,
  OhlcElement
);
