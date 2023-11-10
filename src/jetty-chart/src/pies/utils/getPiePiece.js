// 파이 조각을 구성하는 데이터를 계산하여 반환하는 함수
import {
  getCoordinateVertexGroup,
  getCoordinateCalcVertexGroup,
  getCoordinateTangentLineGroup,
  getCoordinateReference,
  getCoordinateCornerCircleCandidateGroup,
  getCoordinateCornerCircleGroup,
} from "./getCoordinate";
import { getIsLargeArcGroup } from "./getIsLargeArc";
import { getCornerRadius } from "./getCornerRadius";

const getPiePiece = ({ data, pieRadius, innerRadius, cornerRadius, startAngle }) => {
  const pieceData = data.map(({ value, ratio, label, accumulatedAngle }) => {
    const vertexGroup = getCoordinateVertexGroup({
      ratio,
      startAngle: accumulatedAngle,
      pieRadius,
      innerRadius,
    });
    const { cornerInnerRadius, cornerOuterRadius } = getCornerRadius({
      pieRadius,
      innerRadius,
      cornerRadius,
      vertexGroup,
      ratio,
      startAngle,
      accumulatedAngle: accumulatedAngle,
    });
    console.log("TEST cornerInnerRadius, cornerOuterRadius", cornerInnerRadius, cornerOuterRadius);
    const tangentLineGroup = getCoordinateTangentLineGroup({
      pieRadius,
      innerRadius,
      cornerInnerRadius: cornerInnerRadius,
      cornerOuterRadius: cornerOuterRadius,
      ratio,
      accumulatedAngle: accumulatedAngle,
    });
    const candidatesGroup = getCoordinateCornerCircleCandidateGroup({
      pieRadius,
      innerRadius,
      cornerInnerRadius,
      cornerOuterRadius,
      accumulatedAngle: accumulatedAngle,
      tangentLineGroup,
      ratio,
    });
    const referenceCoordinate = getCoordinateReference({
      startAngle: accumulatedAngle,
      percent: ratio,
      pieRadius,
    });
    const cornerCircleGroup = getCoordinateCornerCircleGroup({
      candidatesGroup,
      referenceCoordinate,
    });

    const calcVertexGroup = getCoordinateCalcVertexGroup({
      pieRadius,
      innerRadius,
      cornerInnerRadius,
      cornerOuterRadius,
      cornerCircleGroup,
    });

    const isLargeArcGroup = getIsLargeArcGroup({ ratio, vertexGroup, calcVertexGroup });

    // accumulatedAngle += ratio * 360 + padAngle;
    // accumulatedAngle %= 360;

    return {
      pieRadius,
      cornerInnerRadius,
      cornerOuterRadius,
      innerRadius,
      vertexGroup,
      tangentLineGroup,
      calcVertexGroup,
      cornerCircleGroup,
      accumulatedAngle: accumulatedAngle,
      isLargeArcGroup,
      referenceCoordinate,
      value,
      ratio,
      label,
    };
  });

  return pieceData;
};

export default getPiePiece;
