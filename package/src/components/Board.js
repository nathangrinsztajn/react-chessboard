import React, { Fragment, useState, useRef, useEffect } from 'react';

import { getRelativeCoords } from '../functions';
import { Notation } from './Notation';
import { Piece } from './Piece';
import { Square } from './Square';
import { Squares } from './Squares';
import { useChessboard } from '../context/chessboard-context';
import { WhiteKing } from './ErrorBoundary';

export function Board() {
  const boardRef = useRef();
  const [squares, setSquares] = useState({});

  const {
    arrows,
    boardOrientation,
    boardWidth,
    clearCurrentRightClickDown,
    customArrowColor,
    customArrowWidth,
    showBoardNotation,
    currentPosition,
    premoves
  } = useChessboard();

  useEffect(() => {
    function handleClickOutside(event) {
      if (boardRef.current && !boardRef.current.contains(event.target)) {
        clearCurrentRightClickDown();
      }
    }

    document.addEventListener('mouseup', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, []);

  return boardWidth ? (
    <div ref={boardRef} style={{ position: 'relative' }}>
      <Squares>
        {({ square, squareColor, col, row }) => {
          const squareHasPremove = premoves.find((p) => p.sourceSq === square || p.targetSq === square);
          const squareHasPremoveTarget = premoves.find((p) => p.targetSq === square);
          return (
            <Square
              key={`${col}${row}`}
              square={square}
              squareColor={squareColor}
              setSquares={setSquares}
              squareHasPremove={squareHasPremove}
            >
              {currentPosition[square] && <Piece piece={currentPosition[square]} square={square} squares={squares} />}
              {squareHasPremoveTarget && (
                <Piece isPremovedPiece={true} piece={squareHasPremoveTarget.piece} square={square} squares={squares} />
              )}
              {showBoardNotation && <Notation row={row} col={col} />}
            </Square>
          );
        }}
      </Squares>
      <svg
        width={boardWidth}
        height={boardWidth}
        style={{ position: 'absolute', top: '0', left: '0', pointerEvents: 'none', zIndex: '10' }}
      >
        {arrows.map((arrow, i) => {
          const from = getRelativeCoords(boardOrientation, boardWidth, arrow[0]);
          const to = getRelativeCoords(boardOrientation, boardWidth, arrow[1]);
          const v = {
            x: (to.x - from.x) / Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2),
            y: (to.y - from.y) / Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2)
          };
          const color = typeof customArrowColor === 'object' ? customArrowColor[i] : customArrowColor;
          const width = boardWidth * (typeof customArrowWidth === 'object' ? customArrowWidth[i] : customArrowWidth);
          return (
            <Fragment key={`${arrow[0]}-${arrow[1]}`}>
              <defs>
                <marker id={'arrowhead' + i} markerWidth="2" markerHeight="2.5" refX="0" refY="1.25" orient="auto">
                  <polygon points="0 0, 2 1.25, 0 2.5" style={{ fill: color }} />
                </marker>
              </defs>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x - boardWidth / 8 * v.x * 0.4}
                y2={to.y - boardWidth / 8 * v.y * 0.4}
                style={{ stroke: color, strokeWidth: width }}
                markerEnd={'url(#arrowhead' + i + ')'}
              />
            </Fragment>
          );
        })}
      </svg>
    </div>
  ) : (
    <WhiteKing />
  );
}
