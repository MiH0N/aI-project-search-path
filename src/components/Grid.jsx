import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { COL, ROW } from '../constant/grid.js';
import { AStar } from '../utils/A*.js';
import { bfs } from '../utils/bfs.js';
import { dfs } from '../utils/dfs.js';
import Node from './Node';

const Grid = () => {
	const [grid, setGrid] = useState([]);
	const [startNode, setStartNode] = useState({ row: null, col: null });
	const [finishNode, setFinishNode] = useState({ row: null, col: null });
	const [statusButton, setStatusButton] = useState({
		clickWall: false,
		setStartNode: false,
		setFinishNode: false,
		startPathing: false,
	})
	useEffect(() => {
		let _grid = getInitialGrid(ROW, COL)
		setGrid(_grid)
	}, [])


	const getInitialGrid = (
		rowCount = ROW,
		colCount = COL,
	) => {
		const initialGrid = [];
		for (let row = 0; row < rowCount; row++) {
			const currentRow = [];
			for (let col = 0; col < colCount; col++) {
				currentRow.push(createNode(row, col));
			}
			initialGrid.push(currentRow);
		}
		return initialGrid;
	};

	const createNode = (row, col) => {
		return {
			row,
			col,
			isStart: false,
			isFinish: false,
			distance: Infinity,
			distanceToFinishNode:
				Math.abs(ROW - row) +
				Math.abs(COL - col),
			isVisited: false,
			isWall: row === 0 || col === COL - 1 || row === ROW - 1 || col === 0,
			previousNode: null,
			isNode: true,
		};
	};

	const getNewGridWithWallToggled = (grid, row, col) => {
		const newGrid = grid.slice();
		const node = newGrid[row][col];
		if (!node.isStart && !node.isFinish && node.isNode) {
			const newNode = {
				...node,
				isWall: !node.isWall,
			};
			newGrid[row][col] = newNode;
		}
		return newGrid;
	};
	const getNewGridStartToggled = (grid, row, col) => {
		const newGrid = grid.slice();
		const node = newGrid[row][col];
		if (!node.isWall && node.isNode && !node.isFinish) {
			if (startNode?.row && startNode?.col) {
				const prvNode = newGrid[startNode.row][startNode.col]
				const newNode = {
					...node,
					isStart: !node.isStart,
				};
				const _prvNode = {
					...prvNode,
					isStart: !prvNode.isStart,
				}
				newGrid[row][col] = newNode;
				newGrid[startNode.row][startNode.col] = _prvNode;
				setStartNode({ row, col })
			}
			else {
				const newNode = {
					...node,
					isStart: !node.isStart,
				};
				newGrid[row][col] = newNode;
				setStartNode({ row, col })
			}
		}

		return newGrid;
	};
	const getNewGridFinishToggled = (grid, row, col) => {
		const newGrid = grid.slice();
		const node = newGrid[row][col];
		if (!node.isWall && node.isNode && !node.isStart) {
			if (finishNode?.row && finishNode?.col) {
				const prvNode = newGrid[finishNode.row][finishNode.col]
				const newNode = {
					...node,
					isFinish: !node.isFinish,
				};
				const _prvNode = {
					...prvNode,
					isFinish: !prvNode.isFinish,
				}
				newGrid[row][col] = newNode;
				newGrid[finishNode.row][finishNode.col] = _prvNode;
				setFinishNode({ row, col })
			}
			else {
				const newNode = {
					...node,
					isFinish: !node.isFinish,
				};
				newGrid[row][col] = newNode;
				setFinishNode({ row, col })
			}
		}

		return newGrid;
	};

	const clickButtons = (payload) => {
		let prvStatus = statusButton;
		switch (payload) {
			case 'wall':
				setStatusButton({
					setStartNode: false,
					setFinishNode: false,
					startPathing: false,
					clickWall: !prvStatus.clickWall
				})
				break;
			case 'start_node':
				setStatusButton({
					clickWall: false,
					setFinishNode: false,
					startPathing: false,
					setStartNode: !prvStatus.setStartNode
				})
				break;
			case 'end_node':
				setStatusButton({
					clickWall: false,
					setStartNode: false,
					startPathing: false,
					setFinishNode: !prvStatus.setFinishNode
				})
				break;
			case 'search':
				setStatusButton({
					clickWall: false,
					setStartNode: false,
					setFinishNode: false,
					startPathing: !prvStatus.startPathing
				})
				break;

			default:
				break;
		}
	}
	const getNodesInShortestPathOrder = (finishNode) => {
		const nodesInShortestPathOrder = [];
		let currentNode = finishNode;
		while (currentNode !== null) {
			nodesInShortestPathOrder.unshift(currentNode);
			currentNode = currentNode.previousNode;
		}
		return nodesInShortestPathOrder;
	}
	const handleClick = (row, col) => {
		if (!(row === 0 || col === COL - 1 || row === ROW - 1 || col === 0)) {
			if (statusButton.clickWall) {
				const newGrid = getNewGridWithWallToggled(grid, row, col);
				setGrid(newGrid);
			}
			if (statusButton.setStartNode) {
				const newGrid = getNewGridStartToggled(grid, row, col);
				setGrid(newGrid);
			}
			if (statusButton.setFinishNode) {
				const newGrid = getNewGridFinishToggled(grid, row, col);
				setGrid(newGrid);
			}
		}
	}

	const handlePathAlgorithm = (algorithm) => {
		clickButtons('search')
		const startNodeData =
			grid[startNode.row][startNode.col];
		const finishNodeData =
			grid[finishNode.row][finishNode.col];
		let visitedNodesInOrder;
		switch (algorithm) {
			case 'dfs':
				visitedNodesInOrder = dfs(grid, startNodeData, finishNodeData);
				break;
			case 'bfs':
				visitedNodesInOrder = bfs(grid, startNodeData, finishNodeData);
				break;
			case 'a*':
				visitedNodesInOrder = AStar(grid, startNodeData, finishNodeData);
				break;

			default:
				break;
		}
		const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNodeData);
		nodesInShortestPathOrder.push('end');
		animate(visitedNodesInOrder, nodesInShortestPathOrder);
	}
	const animate = (visitedNodesInOrder, nodesInShortestPathOrder) => {
		for (let i = 0; i <= visitedNodesInOrder.length; i++) {
			if (i === visitedNodesInOrder.length) {
				setTimeout(() => {
					animateShortestPath(nodesInShortestPathOrder);
				}, 10 * i);
				return;
			}
			setTimeout(() => {
				const node = visitedNodesInOrder[i];
				const nodeClassName = document.getElementById(
					`node-${node.row}-${node.col}`,
				).className;
				if (
					!nodeClassName.split(' ').filter(item => item === 'node-start').length &&
					!nodeClassName.split(' ').filter(item => item === 'node-finish').length
				) {
					document.getElementById(`node-${node.row}-${node.col}`).className =
						'node node-visited';
				}
			}, 10 * i);
		}
	}

	const animateShortestPath = (nodesInShortestPathOrder) => {
		for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
			if (nodesInShortestPathOrder[i] === 'end') {
				setTimeout(() => {
					this.toggleIsRunning();
				}, i * 50);
			} else {
				setTimeout(() => {
					const node = nodesInShortestPathOrder[i];
					const nodeClassName = document.getElementById(
						`node-${node.row}-${node.col}`,
					).className;
					if (
						nodeClassName !== 'node node-start' &&
						nodeClassName !== 'node node-finish'
					) {
						document.getElementById(`node-${node.row}-${node.col}`).className =
							'node node-shortest-path';
					}
				}, i * 40);
			}
		}
	}
	return (
		<div className=''>
			<div style={{ margin: '14px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<div
					className={classNames(
						'button',
						statusButton.clickWall ? 'button-active' : ''
					)}
					onClick={() => clickButtons('wall')}>
					set wall
				</div>
				<div
					className={classNames(
						'button',
						statusButton.setStartNode ? 'button-active' : ''
					)}
					onClick={() => clickButtons('start_node')}>
					set start node
				</div>
				<div
					className={classNames(
						'button',
						statusButton.setFinishNode ? 'button-active' : ''
					)}
					onClick={() => clickButtons('end_node')}>
					set end node
				</div>
				<div
					className={classNames(
						'button',
						statusButton.startPathing ? 'button-active' : ''
					)}
					onClick={() => clickButtons('search')}>
					start search
				</div>
			</div>
			<div
				className={classNames(
					'button',
					statusButton.clickWall ? 'button-active' : ''
				)}
				style={{ margin: '14px auto', width: '29rem' }}
				onClick={() => clickButtons('wall')}>
				clear
			</div>
			{statusButton.startPathing && startNode?.row && finishNode?.row &&
				<div>
					<h3 style={{ color: '#EBEBEB', display: 'inline-block', marign: '10px auto' }}>Algorithm <hr style={{ width: '100%' }} /></h3>
					<div style={{ display: 'flex', justifyContent: 'center' }}>
						<div
							className={classNames(
								'button',
							)}
							onClick={() => handlePathAlgorithm('dfs')}>
							DFS
						</div>
						<div
							className={classNames(
								'button',
							)}
							onClick={() => handlePathAlgorithm('bfs')}>
							bfs
						</div>
						<div
							className={classNames(
								'button',
							)}
							onClick={() => handlePathAlgorithm('a*')}>
							a*
						</div>
					</div>
				</div>
			}
			<table
				className="grid-container"
			>
				<tbody className="grid">
					{grid.map((row, rowIdx) => {
						return (
							<tr key={rowIdx}>
								{row.map((node, nodeIdx) => {
									const { row, col, isFinish, isStart, isWall } = node;
									return (
										<Node
											key={nodeIdx}
											col={col}
											isFinish={isFinish}
											isStart={isStart}
											isWall={isWall}
											onClick={(row, col) =>
												handleClick(row, col)
											}
											row={row}
											statusButton={statusButton}
										/>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>

		</div>
	)
}

export default Grid;
