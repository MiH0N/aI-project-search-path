import classNames from 'classnames';
import React from 'react';
import '../styles/Node.css';

const Node = ({
	col,
	isFinish,
	isStart,
	isWall,
	onMouseDown,
	onMouseEnter,
	onMouseUp,
	onClick,
	row,
	statusButton,
}) => {
	const extraClassName = isFinish
		? 'node-finish'
		: isStart
			? 'node-start'
			: isWall
				? 'node-wall'
				: '';
	const statusActive = (status) => {
		for (const [key, value] of Object.entries(status)) {
			if (value === true) {
				return key
			}
		}
	}

	return (
		<td
			id={`node-${row}-${col}`}
			className={classNames(
				'node',
				`hover-class-${statusActive(statusButton)}`,
				extraClassName
			)}
			// onMouseDown={() => onMouseDown(row, col)}
			// onMouseEnter={() => onMouseEnter(row, col)}
			onClick={() => onClick(row, col)}
			// onMouseUp={() => onMouseUp()}
		></td>
	);
}

export default Node