'use client';

import React from 'react';
import { Group } from '@visx/group';
import { ViolinPlot, BoxPlot } from '@visx/stats';
import { LinearGradient } from '@visx/gradient';
import { scaleBand, scaleLinear } from '@visx/scale';
import { withTooltip, Tooltip, defaultStyles } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { PatternLines } from '@visx/pattern';

interface BoxPlotData {
  x: string;
  min: number;
  max: number;
  median: number;
  firstQuartile: number;
  thirdQuartile: number;
  outliers: number[];
  binData: { value: number; count: number }[];
}

interface TooltipData {
  name?: string;
  min?: number;
  median?: number;
  max?: number;
  firstQuartile?: number;
  thirdQuartile?: number;
}

interface BoxPlotChartProps {
  width: number;
  height: number;
  data: BoxPlotData[];
  color?: string;
}

export const BoxPlotChart = withTooltip<BoxPlotChartProps, TooltipData>(
  ({
    width,
    height,
    data,
    color = '#3b82f6',
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    showTooltip,
    hideTooltip,
  }: BoxPlotChartProps & WithTooltipProvidedProps<TooltipData>) => {
    const xMax = width;
    const yMax = height - 120;

    const xScale = scaleBand<string>({
      range: [0, xMax],
      round: true,
      domain: data.map(d => d.x),
      padding: 0.4,
    });

    const values = data.reduce((allValues, d) => {
      allValues.push(d.min, d.max);
      return allValues;
    }, [] as number[]);
    
    const minYValue = Math.min(...values);
    const maxYValue = Math.max(...values);

    const yScale = scaleLinear<number>({
      range: [yMax, 0],
      round: true,
      domain: [minYValue, maxYValue],
    });

    const boxWidth = xScale.bandwidth();
    const constrainedWidth = Math.min(40, boxWidth);

    return width < 10 ? null : (
      <div style={{ position: 'relative' }}>
        <svg width={width} height={height}>
          <PatternLines
            id="boxPlotLines"
            height={3}
            width={3}
            stroke={color}
            strokeWidth={1}
            orientation={['horizontal']}
          />
          <Group top={40}>
            {data.map((d, i) => (
              <g key={i}>
                <ViolinPlot
                  data={d.binData}
                  stroke={color}
                  left={xScale(d.x)!}
                  width={constrainedWidth}
                  valueScale={yScale}
                  fill="url(#boxPlotLines)"
                />
                <BoxPlot
                  min={d.min}
                  max={d.max}
                  left={xScale(d.x)! + 0.3 * constrainedWidth}
                  firstQuartile={d.firstQuartile}
                  thirdQuartile={d.thirdQuartile}
                  median={d.median}
                  boxWidth={constrainedWidth * 0.4}
                  fill={color}
                  fillOpacity={0.3}
                  stroke={color}
                  strokeWidth={2}
                  valueScale={yScale}
                  outliers={d.outliers}
                  boxProps={{
                    onMouseOver: () => {
                      showTooltip({
                        tooltipTop: yScale(d.median) ?? 0 + 40,
                        tooltipLeft: xScale(d.x)! + constrainedWidth + 5,
                        tooltipData: {
                          name: d.x,
                          min: d.min,
                          max: d.max,
                          median: d.median,
                          firstQuartile: d.firstQuartile,
                          thirdQuartile: d.thirdQuartile,
                        },
                      });
                    },
                    onMouseLeave: hideTooltip,
                  }}
                />
              </g>
            ))}
          </Group>
        </svg>

        {tooltipOpen && tooltipData && (
          <Tooltip
            top={tooltipTop}
            left={tooltipLeft}
            style={{ ...defaultStyles, backgroundColor: '#283238', color: 'white' }}
          >
            <div>
              <strong>{tooltipData.name}</strong>
            </div>
            <div style={{ marginTop: '5px', fontSize: '12px' }}>
              {tooltipData.max && <div>max: {tooltipData.max}</div>}
              {tooltipData.thirdQuartile && <div>third quartile: {tooltipData.thirdQuartile}</div>}
              {tooltipData.median && <div>median: {tooltipData.median}</div>}
              {tooltipData.firstQuartile && <div>first quartile: {tooltipData.firstQuartile}</div>}
              {tooltipData.min && <div>min: {tooltipData.min}</div>}
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
);
