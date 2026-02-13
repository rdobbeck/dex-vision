"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  ColorType,
  type CandlestickData,
  type HistogramData,
  type Time,
} from "lightweight-charts";
import type { OhlcvBar, TimeFrame } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PriceChartProps {
  data: OhlcvBar[];
  isLoading?: boolean;
  timeframe: TimeFrame;
  onTimeframeChange: (tf: TimeFrame) => void;
}

const TIMEFRAMES: { label: string; value: TimeFrame }[] = [
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
];

export function PriceChart({
  data,
  isLoading,
  timeframe,
  onTimeframeChange,
}: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Create chart once, destroy on unmount
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9ca3af",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.04)" },
        horzLines: { color: "rgba(255, 255, 255, 0.04)" },
      },
      crosshair: {
        vertLine: { color: "rgba(255, 255, 255, 0.2)" },
        horzLine: { color: "rgba(255, 255, 255, 0.2)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
      },
      handleScroll: true,
      handleScale: true,
    });

    chartRef.current = chart;

    const ro = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        chart.applyOptions({ width, height });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chartRef.current = null;
      chart.remove();
    };
  }, []);

  // Update data when it changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !data || data.length === 0) return;

    // Remove all existing series and re-add
    // This is simpler than tracking series refs across renders
    try {
      // Clear previous series by removing them
      const series = chart.getSeries();
      for (const s of series) {
        chart.removeSeries(s);
      }
    } catch {
      // ignore if no series exist
    }

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const candleData: CandlestickData<Time>[] = data.map((bar) => ({
      time: bar.time as Time,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }));

    const volumeData: HistogramData<Time>[] = data.map((bar) => ({
      time: bar.time as Time,
      value: bar.volume,
      color:
        bar.close >= bar.open
          ? "rgba(34, 197, 94, 0.3)"
          : "rgba(239, 68, 68, 0.3)",
    }));

    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();
  }, [data]);

  if (isLoading) {
    return <Skeleton className="w-full h-[400px] rounded-lg" />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-1 mb-2">
        {TIMEFRAMES.map((tf) => (
          <Button
            key={tf.value}
            variant={timeframe === tf.value ? "secondary" : "ghost"}
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => onTimeframeChange(tf.value)}
          >
            {tf.label}
          </Button>
        ))}
      </div>
      <div ref={containerRef} className="w-full h-[400px]" />
    </div>
  );
}
