import { BarCommon } from "../bar-common/bar-common";

import { checkNormalBar } from "../../common/utils/exception/check-normal-bar-exception";
import { getAutoScope, getCalculatedScope } from "../../common/utils/scope/calculate-scope";
import { checkBarBorderRadius } from "../../common/utils/exception/check-common-exception";

/* eslint-disable complexity */
const NormalBar = ({
  data,
  keys,
  xLegend,
  yLegend,
  normalSettings,
  scopeSettings,
  axisXGridLineSettings,
  axisYGridLineSettings,
  leftLabelSettings,
  rightLabelSettings,
  bottomLabelSettings,
  topLabelSettings,
  leftLegendSettings,
  rightLegendSettings,
  legendSettings,
  barSettings
}) => {
  const result = checkNormalBar({
    normalSettings,
    scopeSettings,
    axisXGridLineSettings,
    axisYGridLineSettings,
    leftLabelSettings,
    rightLabelSettings,
    bottomLabelSettings,
    topLabelSettings,
    leftLegendSettings,
    rightLegendSettings,
    legendSettings,
    barSettings
  });

  const { width, height, margin, padding, reverse, horizontal, colorPalette } = result.normalSettings;
  const { autoScope, maxScope, minScope, showTopScope } = result.scopeSettings;
  const {
    barOpacity,
    barGap,
    barOnlyUpperRadius,
    useBarBorderRadius,
    barBorderRadius,
    useBarBorder,
    barBorderWidth,
    barBorderColor,
    barBorderOpacity,
    useMinHeight,
    minHeight,
    useLabel,
    labelPosition,
    labelMargin,
    labelSize,
    labelWeight,
    labelOpacity,
    labelColor,
    labelInvisibleSize
  } = result.barSettings;

  const scopeResult = autoScope ? getAutoScope({ data }) : getCalculatedScope({ maxScope, minScope });

  if (reverse) {
    scopeResult.scope.reverse();
  }

  const totalWidth = horizontal ? height - margin.bottom - margin.top : width - margin.left - margin.right;
  const totalHeight = horizontal ? width - margin.left - margin.right : height - margin.bottom - margin.top;

  const drawWidth = totalWidth - padding - padding;
  const lineHeight = totalHeight / (scopeResult.scope.length - 1);

  const barWidth = drawWidth / data.length;
  const halfBarWidth = barWidth / 2;
  const halfBarRealWidth = halfBarWidth - barGap * halfBarWidth;

  const zeroHeight =
    scopeResult.scope.reduce((acc, cur) => {
      if (cur !== 0) {
        acc += 1;
      }

      if (cur === 0) {
        acc = 0;
      }

      return acc;
    }, 0) * lineHeight;

  return (
    <BarCommon
      data={data}
      keys={keys}
      xLegend={xLegend}
      yLegend={yLegend}
      normalSettings={{
        ...result.normalSettings,
        scope: scopeResult.scope,
        totalWidth,
        totalHeight,
        drawWidth,
        xAxisInitialPosition: halfBarWidth,
        xAxisWidth: barWidth,
        yAxisHeight: lineHeight,
        showTopScope
      }}
      axisXGridLineSettings={result.axisXGridLineSettings}
      axisYGridLineSettings={result.axisYGridLineSettings}
      leftLabelSettings={result.leftLabelSettings}
      rightLabelSettings={result.rightLabelSettings}
      bottomLabelSettings={result.bottomLabelSettings}
      topLabelSettings={result.topLabelSettings}
      leftLegendSettings={result.leftLegendSettings}
      rightLegendSettings={result.rightLegendSettings}
      bottomLegendSettings={result.bottomLegendSettings}
      topLegendSettings={result.topLegendSettings}
      legendSettings={result.legendSettings}
    >
      <g transform={horizontal ? `translate(0,${padding})` : `translate(${padding})`}>
        {data.map((d, idx) => {
          const nowData = { ...d };

          if (reverse) {
            nowData.value = -nowData.value;
          }

          const center = (drawWidth / data.length) * idx + drawWidth / data.length / 2;
          let barHeight = (Math.abs(nowData.value) / (scopeResult.maxScope - scopeResult.minScope)) * totalHeight;

          if (useMinHeight && barHeight < minHeight) {
            barHeight = minHeight;
          }

          let barHeightWithoutRadius = barHeight > barBorderRadius ? barHeight - barBorderRadius : barHeight;

          if (useMinHeight && barHeightWithoutRadius < minHeight) {
            barHeightWithoutRadius = minHeight;
          }

          const borderRadius = useBarBorderRadius
            ? checkBarBorderRadius({ halfWidth: halfBarRealWidth, height: barHeightWithoutRadius, borderRadius: barBorderRadius })
            : 0;

          const barTotalWidth = halfBarRealWidth + halfBarRealWidth;
          const barWidthWithoutRadius = barTotalWidth - borderRadius - borderRadius;
          const realHeight = barHeightWithoutRadius + borderRadius;

          return (
            <g
              key={"data-" + nowData.label + "-" + idx}
              transform={
                horizontal
                  ? `translate(${zeroHeight},${center - halfBarRealWidth})`
                  : `translate(${center - halfBarRealWidth},${totalHeight - barHeight - zeroHeight})`
              }
            >
              {barOnlyUpperRadius && useBarBorderRadius ? (
                <path
                  d={
                    horizontal
                      ? nowData.value >= 0
                        ? `
                          M 0,0
                          h ${barHeightWithoutRadius}
                          q ${borderRadius},0 ${borderRadius},${borderRadius}
                          v ${barWidthWithoutRadius}
                          q 0,${borderRadius} -${borderRadius},${borderRadius}
                          h -${barHeightWithoutRadius}
                          v -${barTotalWidth}
                          z`
                        : `
                          M 0,0
                          h -${barHeightWithoutRadius}
                          q -${borderRadius},0 -${borderRadius},${borderRadius}
                          v ${barWidthWithoutRadius}
                          q 0,${borderRadius} ${borderRadius},${borderRadius}
                          h ${barHeightWithoutRadius}
                          v -${barTotalWidth}
                          z`
                      : nowData.value >= 0
                      ? `
                          M 0,${barHeight}
                          v -${barHeightWithoutRadius}
                          q 0,-${borderRadius} ${borderRadius},-${borderRadius}
                          h ${barWidthWithoutRadius}
                          q ${borderRadius},0 ${borderRadius},${borderRadius}
                          v ${barHeightWithoutRadius}
                          h -${barTotalWidth}
                          z`
                      : `
                          M 0,${barHeight}
                          v ${barHeightWithoutRadius}
                          q 0,${borderRadius} ${borderRadius},${borderRadius}
                          h ${barWidthWithoutRadius}
                          q ${borderRadius},0 ${borderRadius},-${borderRadius}
                          v -${barHeightWithoutRadius}
                          h -${barTotalWidth}
                          z`
                  }
                  fill={colorPalette[0]}
                  opacity={barOpacity}
                  stroke={useBarBorder ? barBorderColor : ""}
                  strokeOpacity={barBorderOpacity}
                  strokeWidth={useBarBorder ? barBorderWidth : "0"}
                />
              ) : (
                <rect
                  width={
                    horizontal ? (useMinHeight ? (barHeight < minHeight ? minHeight : barHeight) : barHeight) : halfBarRealWidth + halfBarRealWidth
                  }
                  height={
                    horizontal ? halfBarRealWidth + halfBarRealWidth : useMinHeight ? (barHeight < minHeight ? minHeight : barHeight) : barHeight
                  }
                  transform={
                    horizontal
                      ? `translate(${nowData.value >= 0 ? 0 : -(useMinHeight ? (barHeight < minHeight ? minHeight : barHeight) : barHeight)})`
                      : `translate(0,${nowData.value >= 0 ? 0 : useMinHeight ? (barHeight < minHeight ? minHeight : barHeight) : barHeight})`
                  }
                  fill={colorPalette[0]}
                  opacity={barOpacity}
                  rx={borderRadius}
                  ry={borderRadius}
                  stroke={useBarBorder ? barBorderColor : ""}
                  strokeOpacity={barBorderOpacity}
                  strokeWidth={useBarBorder ? barBorderWidth : "0"}
                ></rect>
              )}
              {useLabel && realHeight > labelInvisibleSize && (
                <g transform={horizontal ? `translate(${labelMargin})` : `translate(0,${-labelMargin})`}>
                  <text
                    fontSize={labelSize}
                    fontWeight={labelWeight}
                    fill={labelColor}
                    opacity={labelOpacity}
                    dominantBaseline={
                      horizontal ? "middle" : labelPosition === "over" ? "ideographic" : labelPosition === "under" ? "hanging" : "middle"
                    }
                    textAnchor={horizontal ? (labelPosition === "over" ? "start" : labelPosition === "under" ? "end" : "middle") : "middle"}
                    transform={
                      horizontal
                        ? `translate(${
                            labelPosition === "over"
                              ? nowData.value < 0
                                ? 0
                                : realHeight
                              : labelPosition === "under"
                              ? nowData.value >= 0
                                ? 0
                                : -realHeight
                              : nowData.value >= 0
                              ? realHeight / 2
                              : -realHeight / 2
                          },${halfBarRealWidth})`
                        : `translate(${halfBarRealWidth},${
                            labelPosition === "over"
                              ? barHeight - (nowData.value < 0 ? 0 : realHeight)
                              : labelPosition === "under"
                              ? barHeight + (nowData.value >= 0 ? 0 : realHeight)
                              : barHeight + (nowData.value >= 0 ? -realHeight / 2 : realHeight / 2)
                          })`
                    }
                  >
                    {reverse ? -nowData.value : nowData.value}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    </BarCommon>
  );
};
/* eslint-enable complexity */

export { NormalBar };
