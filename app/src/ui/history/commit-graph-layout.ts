/**
 * Commit graph layout engine.
 *
 * Graph layout algorithm adapted from vscode-git-graph by mhutchie:
 * https://github.com/mhutchie/vscode-git-graph/blob/develop/web/graph.ts
 * Used for personal, non-distributed purposes per the project's licence.
 */

/** Input shape for each commit. Commits must be in reverse-chronological order (newest first). */
export interface ICommitGraphInput {
  readonly sha: string
  readonly parentSHAs: ReadonlyArray<string>
}

/** An edge drawn in a single commit row: from column x1 (top of row) to column x2 (bottom). */
export interface ICommitGraphEdge {
  readonly x1: number
  readonly x2: number
  readonly colour: number
}

/** Layout data for one commit row. */
export interface ICommitGraphRow {
  readonly nodeColumn: number
  readonly nodeColour: number
  readonly edges: ReadonlyArray<ICommitGraphEdge>
}

export interface ICommitGraphLayout {
  readonly rows: ReadonlyArray<ICommitGraphRow>
  /** Total number of columns needed to render the full graph. */
  readonly numColumns: number
}

// ---- Internal layout types (adapted from vscode-git-graph) ----

const NULL_VERTEX_ID = -1

interface IPoint {
  readonly x: number
  readonly y: number
}

interface ILine {
  readonly p1: IPoint
  readonly p2: IPoint
  readonly colour: number
}

interface IUnavailablePoint {
  readonly connectsTo: LayoutVertex | null
  readonly onBranch: LayoutBranch
}

class LayoutBranch {
  private readonly colourIndex: number
  private end: number = 0
  private readonly lines: ILine[] = []

  public constructor(colour: number) {
    this.colourIndex = colour
  }

  public addLine(p1: IPoint, p2: IPoint): void {
    this.lines.push({ p1, p2, colour: this.colourIndex })
  }

  public getColour(): number {
    return this.colourIndex
  }

  public getEnd(): number {
    return this.end
  }

  public setEnd(end: number): void {
    this.end = end
  }

  public getLines(): ReadonlyArray<ILine> {
    return this.lines
  }
}

class LayoutVertex {
  public readonly id: number
  private x: number = 0
  private readonly children: LayoutVertex[] = []
  private readonly parents: LayoutVertex[] = []
  private nextParentIndex: number = 0
  private onBranch: LayoutBranch | null = null
  private nextX: number = 0
  private readonly connections: IUnavailablePoint[] = []

  public constructor(id: number) {
    this.id = id
  }

  public addChild(v: LayoutVertex): void {
    this.children.push(v)
  }

  public addParent(v: LayoutVertex): void {
    this.parents.push(v)
  }

  public getChildren(): ReadonlyArray<LayoutVertex> {
    return this.children
  }

  public getParents(): ReadonlyArray<LayoutVertex> {
    return this.parents
  }

  public hasParents(): boolean {
    return this.parents.length > 0
  }

  public getNextParent(): LayoutVertex | null {
    return this.nextParentIndex < this.parents.length
      ? this.parents[this.nextParentIndex]
      : null
  }

  public registerParentProcessed(): void {
    this.nextParentIndex++
  }

  public isMerge(): boolean {
    return this.parents.length > 1
  }

  public addToBranch(branch: LayoutBranch, x: number): void {
    if (this.onBranch === null) {
      this.onBranch = branch
      this.x = x
    }
  }

  public isNotOnBranch(): boolean {
    return this.onBranch === null
  }

  public isOnThisBranch(branch: LayoutBranch): boolean {
    return this.onBranch === branch
  }

  public getBranch(): LayoutBranch | null {
    return this.onBranch
  }

  public getPoint(): IPoint {
    return { x: this.x, y: this.id }
  }

  public getNextPoint(): IPoint {
    return { x: this.nextX, y: this.id }
  }

  public getPointConnectingTo(
    vertex: LayoutVertex | null,
    onBranch: LayoutBranch
  ): IPoint | null {
    for (let i = 0; i < this.connections.length; i++) {
      if (
        this.connections[i].connectsTo === vertex &&
        this.connections[i].onBranch === onBranch
      ) {
        return { x: i, y: this.id }
      }
    }
    return null
  }

  public registerUnavailablePoint(
    x: number,
    connectsToVertex: LayoutVertex | null,
    onBranch: LayoutBranch
  ): void {
    if (x === this.nextX) {
      this.nextX = x + 1
      this.connections[x] = { connectsTo: connectsToVertex, onBranch }
    }
  }

  public getColour(): number {
    return this.onBranch !== null ? this.onBranch.getColour() : 0
  }
}

function getAvailableColour(
  startAt: number,
  availableColours: number[]
): number {
  for (let i = 0; i < availableColours.length; i++) {
    if (startAt > availableColours[i]) {
      return i
    }
  }
  availableColours.push(0)
  return availableColours.length - 1
}

function determinePath(
  startAt: number,
  vertices: LayoutVertex[],
  nullVertex: LayoutVertex,
  branches: LayoutBranch[],
  availableColours: number[]
): void {
  let i = startAt
  let vertex = vertices[i]
  let parentVertex = vertices[i].getNextParent()
  let curVertex: LayoutVertex

  let lastPoint = vertex.isNotOnBranch()
    ? vertex.getNextPoint()
    : vertex.getPoint()
  let curPoint: IPoint

  if (
    parentVertex !== null &&
    parentVertex.id !== NULL_VERTEX_ID &&
    vertex.isMerge() &&
    !vertex.isNotOnBranch() &&
    !parentVertex.isNotOnBranch()
  ) {
    // Branch is a merge between two vertices already on branches
    let foundPointToParent = false
    const parentBranch = parentVertex.getBranch()!
    for (i = startAt + 1; i < vertices.length; i++) {
      curVertex = vertices[i]
      const candidate = curVertex.getPointConnectingTo(
        parentVertex,
        parentBranch
      )
      if (candidate !== null) {
        curPoint = candidate
        foundPointToParent = true
      } else {
        curPoint = curVertex.getNextPoint()
      }
      parentBranch.addLine(lastPoint, curPoint)
      curVertex.registerUnavailablePoint(curPoint.x, parentVertex, parentBranch)
      lastPoint = curPoint
      if (foundPointToParent) {
        vertex.registerParentProcessed()
        break
      }
    }
  } else {
    // Normal branch
    const branch = new LayoutBranch(
      getAvailableColour(startAt, availableColours)
    )
    vertex.addToBranch(branch, lastPoint.x)
    vertex.registerUnavailablePoint(lastPoint.x, vertex, branch)
    for (i = startAt + 1; i < vertices.length; i++) {
      curVertex = vertices[i]
      curPoint =
        parentVertex === curVertex && !parentVertex.isNotOnBranch()
          ? curVertex.getPoint()
          : curVertex.getNextPoint()
      branch.addLine(lastPoint, curPoint)
      curVertex.registerUnavailablePoint(curPoint.x, parentVertex, branch)
      lastPoint = curPoint
      if (parentVertex === curVertex) {
        vertex.registerParentProcessed()
        const parentVertexOnBranch = !parentVertex.isNotOnBranch()
        parentVertex.addToBranch(branch, curPoint.x)
        vertex = parentVertex
        parentVertex = vertex.getNextParent()
        if (parentVertex === null || parentVertexOnBranch) {
          break
        }
      }
    }
    if (
      i === vertices.length &&
      parentVertex !== null &&
      parentVertex.id === NULL_VERTEX_ID
    ) {
      vertex.registerParentProcessed()
    }
    branch.setEnd(i)
    branches.push(branch)
    availableColours[branch.getColour()] = i
  }
}

/**
 * Compute graph layout rows from a list of commits.
 * Commits must be in reverse-chronological order (newest first).
 */
export function computeGraphLayout(
  commits: ReadonlyArray<ICommitGraphInput>
): ICommitGraphLayout {
  if (commits.length === 0) {
    return { rows: [], numColumns: 0 }
  }

  const vertices = commits.map((_, idx) => new LayoutVertex(idx))
  const nullVertex = new LayoutVertex(NULL_VERTEX_ID)
  const commitLookup = new Map(commits.map((c, idx) => [c.sha, idx]))
  const branches: LayoutBranch[] = []
  const availableColours: number[] = []

  // Wire up parent/child relationships
  for (let i = 0; i < commits.length; i++) {
    for (const parentSha of commits[i].parentSHAs) {
      const parentIndex = commitLookup.get(parentSha)
      if (parentIndex !== undefined) {
        vertices[i].addParent(vertices[parentIndex])
        vertices[parentIndex].addChild(vertices[i])
      } else {
        // Parent not in the loaded window — treat as a terminal
        vertices[i].addParent(nullVertex)
      }
    }
  }

  // Run the layout algorithm
  let i = 0
  while (i < vertices.length) {
    if (vertices[i].getNextParent() !== null || vertices[i].isNotOnBranch()) {
      determinePath(i, vertices, nullVertex, branches, availableColours)
    } else {
      i++
    }
  }

  // Compute the maximum column used
  let maxColumn = 0
  for (const vertex of vertices) {
    const col = vertex.getNextPoint().x - 1
    if (col > maxColumn) {
      maxColumn = col
    }
  }
  const numColumns = maxColumn + 1

  // Index lines by their starting row so we can do O(1) row lookups
  const linesByRow: ILine[][] = commits.map(() => [])
  for (const branch of branches) {
    for (const line of branch.getLines()) {
      const r = line.p1.y
      if (r >= 0 && r < commits.length) {
        linesByRow[r].push(line)
      }
    }
  }

  // Build the per-row output
  const rows: ICommitGraphRow[] = vertices.map((vertex, r) => ({
    nodeColumn: vertex.getPoint().x,
    nodeColour: vertex.getColour(),
    edges: linesByRow[r].map(line => ({
      x1: line.p1.x,
      x2: line.p2.x,
      colour: line.colour,
    })),
  }))

  return { rows, numColumns }
}
