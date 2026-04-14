import * as React from 'react'
import { ICommitGraphRow } from './commit-graph-layout'

// Grid constants — must match ROW_HEIGHT in commit-list.tsx
const GRID_X = 14 // px per column
const OFFSET_X = GRID_X / 2 // center of column 0
const ROW_HEIGHT = 50 // matches RowHeight in commit-list.tsx
const NODE_RADIUS = 4
const BEZIER_FACTOR = 0.8

/** Default maximum columns when none is specified by the caller. */
export const DEFAULT_MAX_COLUMNS = 8

/**
 * Colours for graph lanes. Chosen to be legible on both the light
 * and dark GitHub Desktop themes.
 */
const GRAPH_COLOURS = [
  '#4a90d9', // blue
  '#e07a5f', // orange-red
  '#3aa76d', // green
  '#9b59b6', // purple
  '#e67e22', // orange
  '#1abc9c', // teal
  '#e74c3c', // red
  '#f1c40f', // yellow
]

const colX = (col: number) => col * GRID_X + OFFSET_X

interface ICommitGraphCellProps {
  readonly graphRow: ICommitGraphRow
  /** Total number of graph lanes (determines SVG width). */
  readonly numColumns: number
  /** Branch names whose tip is this commit. Rendered as pill labels. */
  readonly branchLabels?: ReadonlyArray<string>
  /** Tag names on this commit. Rendered as gold pill labels. */
  readonly tagLabels?: ReadonlyArray<string>
  /** When true, renders a merge-base diamond marker on the node. */
  readonly isMergeBase?: boolean
  /** Maximum lane columns to render. Defaults to DEFAULT_MAX_COLUMNS. */
  readonly maxColumns?: number
  /** Maps graph colour index → branch/tag label string for SVG lane tooltips. */
  readonly laneLabelsByColour?: ReadonlyMap<number, string>
}

/**
 * Renders a single row's worth of the commit graph as an SVG element.
 * Intended to be placed to the left of each CommitListItem.
 */
export class CommitGraphCell extends React.PureComponent<ICommitGraphCellProps> {
  public render() {
    const {
      graphRow,
      numColumns,
      branchLabels,
      tagLabels,
      isMergeBase,
      maxColumns,
      laneLabelsByColour,
    } = this.props
    const effectiveMax = maxColumns ?? DEFAULT_MAX_COLUMNS
    const clampedCols = Math.max(1, Math.min(numColumns, effectiveMax))
    const svgWidth = clampedCols * GRID_X

    const midY = ROW_HEIGHT / 2
    const d = ROW_HEIGHT * BEZIER_FACTOR

    const edgePaths = graphRow.edges.map((edge, i) => {
      // Skip edges that are entirely outside the visible column range
      if (edge.x1 >= effectiveMax && edge.x2 >= effectiveMax) {
        return null
      }

      const x1 = colX(Math.min(edge.x1, effectiveMax - 1))
      const x2 = colX(Math.min(edge.x2, effectiveMax - 1))
      const colour = GRAPH_COLOURS[Math.abs(edge.colour) % GRAPH_COLOURS.length]

      const pathD =
        x1 === x2
          ? `M ${x1} 0 L ${x2} ${ROW_HEIGHT}`
          : `M ${x1} 0 C ${x1} ${d} ${x2} ${ROW_HEIGHT - d} ${x2} ${ROW_HEIGHT}`

      const laneTitle = laneLabelsByColour?.get(edge.colour)

      return (
        <g key={i}>
          <path
            d={pathD}
            stroke={colour}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          {/* Invisible wide stroke for a larger hover hit target */}
          <path d={pathD} stroke="transparent" strokeWidth={8} fill="none">
            {laneTitle !== undefined && <title>{laneTitle}</title>}
          </path>
        </g>
      )
    })

    const nodeVisible = graphRow.nodeColumn < effectiveMax
    const nodeColour =
      GRAPH_COLOURS[Math.abs(graphRow.nodeColour) % GRAPH_COLOURS.length]
    const nodeCx = nodeVisible ? colX(graphRow.nodeColumn) : -999

    /** Diamond shape for merge-base marker, drawn as a rotated square. */
    const mergeBaseNode =
      isMergeBase && nodeVisible ? (
        <polygon
          points={`${nodeCx},${midY - NODE_RADIUS - 2} ${
            nodeCx + NODE_RADIUS + 2
          },${midY} ${nodeCx},${midY + NODE_RADIUS + 2} ${
            nodeCx - NODE_RADIUS - 2
          },${midY}`}
          fill="none"
          stroke={nodeColour}
          strokeWidth={2}
        />
      ) : null

    const branchPills =
      branchLabels !== undefined && branchLabels.length > 0 && nodeVisible
        ? branchLabels.slice(0, 2).map((label, i) => (
            <span
              key={i}
              className="commit-graph-branch-label"
              title={label}
              style={{ borderColor: nodeColour }}
            >
              {label}
            </span>
          ))
        : null

    const tagPills =
      tagLabels !== undefined && tagLabels.length > 0 && nodeVisible
        ? tagLabels.slice(0, 2).map((label, i) => (
            <span key={i} className="commit-graph-tag-label" title={label}>
              {label}
            </span>
          ))
        : null

    const hasLabels =
      (branchPills !== null && branchPills.length > 0) ||
      (tagPills !== null && tagPills.length > 0)

    return (
      <div className="commit-graph-cell-wrapper">
        <svg
          className="commit-graph-cell"
          width={svgWidth}
          height={ROW_HEIGHT}
          aria-hidden={true}
        >
          {edgePaths}
          {nodeVisible && !isMergeBase && (
            <circle
              cx={nodeCx}
              cy={midY}
              r={NODE_RADIUS}
              fill={nodeColour}
              stroke="var(--background-color)"
              strokeWidth={1.5}
            />
          )}
          {mergeBaseNode}
        </svg>
        {hasLabels && (
          <div className="commit-graph-branch-labels">
            {branchPills}
            {tagPills}
          </div>
        )}
      </div>
    )
  }
}
