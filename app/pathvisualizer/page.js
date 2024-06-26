"use client";

import {
  FINISH_NODE_COL,
  FINISH_NODE_ROW,
  START_NODE_COL,
  START_NODE_ROW,
  animationVisitedNodeSpeedTime,
  animationShortestPathSpeedTime,
  createGrid,
  resetGridByCond,
} from "@/utils/helper";
import { useEffect, useState } from "react";
import styles from "./index.module.css";
import Cell from "./Cell";
import Navbar from "./Navbar";
import SecondNavbar from "./secondNavbar";
import { findThePathFromStartToFinish } from "@/utils/algoritms";
import { mazeGeneratorAlgo } from "@/utils/algoritms/mazeGenerator";
import { cloneDeep } from "lodash";
import Speedometer from "../customComponent/speedometer";
import PreLoader from "../customComponent/preLoader";

export default function PathVisualizer() {
  const startEndInitialState = {
    start: { row: START_NODE_ROW, col: START_NODE_COL },
    end: { row: FINISH_NODE_ROW, col: FINISH_NODE_COL },
  };
  const visitedStyle = `${styles.insideCell} ${styles.visited}`;
  const animateVisited = styles.animateVisited;
  const animateShortestPathStyle = styles.animateShortestPath;
  const shortestPathStyle = `${styles.insideCell} ${styles.shortestPath}`;

  let [grid, setGrid] = useState([]);
  const [startEnd, setStartEnd] = useState(startEndInitialState);
  const [dragStart, setDragStart] = useState(false);
  const [loader, setLoader] = useState(true)
  const [speed, setSpeed] = useState(5)
  const [dragState, setDragState] = useState(null);
  const [weight, setWeight] = useState({ flag: false, weight: 2 });
  const [algorithmInitialized, setAlgorithmInitialized] = useState(false);
  const [algorithm, setAlgorithm] = useState("dijkstra");
  const [showFullBlocker, setShowFullScreenBlocker] = useState(false);
  const [arrowDirection, setArrowDirection] = useState("right");

  const initializeGrid = () => {
    
    const tempGrid = createGrid(algorithm);
    setGrid(tempGrid);
    setLoader(false)

  };

  const resetGrid = (state, onlyCss) => {
    for (let row of grid) {
      for (let cell of row) {
        const condObj = {
          all: true,
          withoutWall: !cell.isWall,
          keepWallAndWeight: !(cell.isWall || cell.weight > 1),
        };
        const node = document.getElementById(`${cell.row}-${cell.col}-cell`);
        if (condObj[state] && node) {
          node.className = styles.insideCell;
        }
      }
    }
    if (!onlyCss) {
      const newGrid = resetGridByCond(grid, state, algorithm);
      setGrid([...newGrid]);
      setAlgorithmInitialized(false);
    }
  };

  const setArrowDirectionFn = (row, col) => {
    const { start } = startEnd;
    const colLess = start.col > col;
    const rowLess = start.row > row;
    if (start.row !== row && rowLess) setArrowDirection("up");
    else if (start.row !== row && !rowLess) setArrowDirection("down");
    else if (colLess) setArrowDirection("left");
    else setArrowDirection("right");
  };

  const animateShortestPath = (nodesInShortestPathOrder, animate) => {
    if (nodesInShortestPathOrder.length === 0) {
      setShowFullScreenBlocker(false);
      return;
    }
    if (nodesInShortestPathOrder[1]) {
      setArrowDirectionFn(
        nodesInShortestPathOrder[1].row,
        nodesInShortestPathOrder[1].col
      );
    }
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      const node = nodesInShortestPathOrder[i];
      const cell = document.getElementById(`${node.row}-${node.col}-cell`);
      if (cell) {
        if (animate) {
          setTimeout(() => {
            if (i === nodesInShortestPathOrder.length - 2) {
              setShowFullScreenBlocker(false);
            }
            cell.className = `${shortestPathStyle} ${animateShortestPathStyle}`;
          }, i * animationShortestPathSpeedTime + 500);
        } else {
          cell.className = shortestPathStyle;
        }
      }
    }
  };

  const animateNodes = (
    visitedNodesInOrder,
    nodesInShortestPathOrder,
    animate
  ) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        if (animate) {
          setTimeout(() => {
            animateShortestPath(nodesInShortestPathOrder, animate);
          }, i * speed);
        } else {
          animateShortestPath(nodesInShortestPathOrder, animate);
        }
      } else {
        const node = visitedNodesInOrder[i];
        const cell = document.getElementById(`${node.row}-${node.col}-cell`);
        if (cell) {
          if (animate) {
            setTimeout(() => {
              if (i === 1) setShowFullScreenBlocker(true);
              cell.className = `${visitedStyle} ${
                animate ? animateVisited : ""
              }`;
            }, i * speed);
          } else {
            cell.className = `${visitedStyle} ${animate ? animateVisited : ""}`;
          }
        }
      }
    }
  };

  const runAlgo = (algo, animate) => {
    grid = resetGridByCond(grid, "keepWallAndWeight", algo);
    resetGrid("keepWallAndWeight", true);
    const { start, end } = startEnd;
    const startNode = grid[start.row][start.col];
    const finishNode = grid[end.row][end.col];
    const { visitedNodesInOrder, nodesInShortestPathOrder } = findThePathFromStartToFinish(grid, startNode, finishNode, algo);
    animateNodes(visitedNodesInOrder, nodesInShortestPathOrder, animate);
    if (!algorithmInitialized) setAlgorithmInitialized(true);
  };

  const updateWall = (row, col) => {
    setGrid((prev) => {
      prev[row][col].isWall = !prev[row][col].isWall;
      prev[row][col].weight = 1;
      return [...prev];
    });
  };

  const addWeight = (row, col, _weight) => {
    setGrid((prev) => {
      prev[row][col].weight = prev[row][col].weight > 1 ? 1 : Number(_weight);
      prev[row][col].isWall = false;
      return [...prev];
    });
  };

  const generateMaze = () => {
    grid = resetGridByCond(grid, "all", algorithm);
    resetGrid("all");
    const tempGrid = cloneDeep(grid);
    mazeGeneratorAlgo(tempGrid, startEnd);
    setGrid(tempGrid);
  };

  useEffect(() => {
    initializeGrid();
  }, []);

  useEffect(() => {
    if (algorithmInitialized) {
      runAlgo(algorithm, false);
    }
  }, [startEnd]);

  return (
    <div className="position-relative custom-cursor">
      <Navbar
        runAlgo={(val) => runAlgo(val, true)}
        generateMaze={() => generateMaze()}
        weight={weight}
        speed={speed}
        setSpeed={setSpeed}
        setWeight={setWeight}
        setAlgorithm={setAlgorithm}
        algorithm={algorithm}
        reset={(val) => resetGrid(val)}
      />
      {loader ? <PreLoader /> : <div className={`${styles.mainDiv} my-4`}>
        <div className={styles.gridContainer}>
          {grid.map((cols, colIndex) => {
            return (
              <div key={`${colIndex}row`} className={styles.row}>
                {cols.map((node) => {
                  return (
                    <Cell
                      key={`${node.row}-${node.col}-col`}
                      node={node}
                      startEnd={startEnd}
                      setStartEnd={setStartEnd}
                      setDragStart={setDragStart}
                      setDragState={setDragState}
                      dragState={dragState}
                      dragStart={dragStart}
                      weight={weight}
                      arrowDirection={arrowDirection}
                      addWeight={addWeight}
                      updateWall={updateWall}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>}
      {showFullBlocker ? <div className="fullScreenBlocker"></div> : ""}
      
    </div>
  );
}
