import React from 'react';
import GridItem from './GridItem'
import Graph from '../PathfindingAlgorithms/Graph'
import Dijkstra from '../PathfindingAlgorithms/Dijkstra'
import Astar from '../PathfindingAlgorithms/Astar'
import Maze from '../PathfindingAlgorithms/Maze'
import Node from '../PathfindingAlgorithms/Node'
import {compareNodes, getIndex, sleep} from '../PathfindingAlgorithms/Utility'
import './Grid.scss';


//Current react layout is bad, we should've stored all this functionality in to a single component instead of two, Grid.jsx and PathfindingLayout.jsx
//Now we need hacky methods to access child components states and call their functionality from parent component
class PathfindingLayout extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            gridRowCount: 35,                   
            gridColCount: 72,

            algorithm: undefined,
            drawMode: undefined,
            gridState: [],                   //Grid representation of node objects as 2d array
            Graph: undefined,               //Graph representation of the grid (Adjacency list of the nodes and movement cost matrix)   

            gridStartPos: undefined,
            gridEndPos: undefined,
            curGrid: undefined,             //Key of the current grid, for resetting the grid

            isVisualized: false,
            isAnimating: false,
            animationSpeed: 50,                 //Animation speed in ms

            showWeights: false,
        }
        this.handleAlgorithmModeChange = this.handleAlgorithmModeChange.bind(this);
        this.handleDrawModeChange = this.handleDrawModeChange.bind(this);
        this.handleResetClick = this.handleResetClick.bind(this);
        this.handleSimulateClick = this.handleSimulateClick.bind(this);
        this.generateMaze = this.generateMaze.bind(this);
        this.animate = this.animate.bind(this);
        this.AlgorithmTypes = Object.freeze({
            Dijkstra,
            Astar,
        })
    }

    componentDidMount(){
        this.setState({algorithm: this.AlgorithmTypes.Dijkstra, drawMode: 1});
        this.initGrid();
    }

    //Resets the whole grid
    //TODO:: Instead of iterating through the whole grid, we could just store the nodes that need to be cleared into a state as an array, would increase performance by a quite a bit.
    async handleResetClick(){
        //Creating a new key for our grid component recreates the component from scratch. Since we only have one component using math.random should be fine
        let newId = Math.random()
        //this.cancelAnimation();
        this.setState({isAnimating: false, isVisualized: false})
        var oldGrid = [...this.state.gridState]
        for(var i = 0; i < oldGrid.length; i++)
        {
            for(var j = 0; j < oldGrid[i].length; j++)
            {
                var oldNode = oldGrid[i][j][1]
                oldNode.nodeType = 0;
                oldNode.weight = 0;
                var oldGridItem = React.cloneElement(oldGrid[i][j][0], {visited: false, styleName: 'grid-item', itemNode: oldNode})
                oldGrid[i][j][0] = oldGridItem
            }
        }
        var newGraph = new Graph(this.state.gridState)
        this.setState({curGrid: newId, gridState: oldGrid, Graph: newGraph, gridStartPos: undefined, gridEndPos: undefined})
    }

    handleSpeedSlider = (e) =>
    {
        this.setState({animationSpeed: e.target.value})
    }

    handleCheckboxChange = (e) => 
    {
        this.setState({showWeights: e.target.value})
    }

    cancelAnimation()
    {
        this.setState({isAnimating: false, isVisualized: false})
        let oldGrid = [...this.state.gridState]
        let oldGraph = this.state.Graph
        //This is atleast o(n^2) and is very costly way of cancelling the animation, maybe store the animated nodes to a heap instead of iterating through whole matrix
        for(var i = 0; i < oldGrid.length; i++)
        {
            for(var j = 0; j < oldGrid[i].length; j++)
            {
                if(oldGrid[i][j][0].props.visited)
                {
                    var oldNode = oldGrid[i][j][1]
                    oldNode.nodeType = 0;
                    var oldGridItem = React.cloneElement(oldGrid[i][j][0], {visited: false, styleName: 'grid-item', itemNode: oldNode})
                    oldGrid[i][j][0] = oldGridItem
                    oldGraph.updateNode(oldNode)
                }
            }
        }
        this.setState({gridState: oldGrid, Graph: oldGraph})
        console.log("animation cancelled!")
    }

    async handleSimulateClick(){
        //Check if the grid in in animated state
        if(this.state.isVisualized || this.state.isAnimating)
        {
            this.cancelAnimation();
            await sleep(1);
        }

        if(this.state.gridState && this.state.gridStartPos && this.state.gridEndPos)
        {
            const start = this.state.gridStartPos.state.node.gridIndex
            const goal = this.state.gridEndPos.state.node.gridIndex
            //Call selected algorithm
            //Create instance of the selected algorithm object
            switch(this.state.algorithm)
            {
                case this.AlgorithmTypes.Dijkstra:
                    var dijkstra = Dijkstra(this.state.Graph.adjacencyList, start, goal);
                    //If path was not found
                    if(dijkstra == 0)
                        break;
                    this.animate(dijkstra[0], dijkstra[1])
                    break;
                case this.AlgorithmTypes.Astar:
                    var astar = Astar(this.state.Graph.adjacencyList, start, goal)
                    //If path was not found
                    if(astar == 0)
                        break;
                    this.animate(astar[0], astar[1])
                    break;
                default:
                    break;
            }
        }
        else
        {
            console.log("Grid was undefined")
        }
    }

    //Takes nodes to animate in array that's ordered
    //nodesInOrder[0] is the node index and [1] is the weight of the node
    async animate(nodesInOrder, shortestPath)
    {
        console.log("Animation started");

        await this.setState({isAnimating: true})

        //Animate visitedNodes
        let oldGrid = [...this.state.gridState];
        for(const [nodeIdx, weight] of Object.entries(nodesInOrder))
        {
            await sleep(100 - this.state.animationSpeed);
            if(!this.state.isAnimating)
                return

            //Get the index of the node, nodesInOrder is an array of strings instead of numbers (Because we're using js and not ts...)
            var [x,y] = getIndex(nodeIdx)

            //No need to animate the goal node
            if(compareNodes([x,y], this.state.gridEndPos.state.node.gridIndex) || compareNodes([x,y], this.state.gridStartPos.state.node.gridIndex))
                continue
            var gridItem = oldGrid[y][x][0]

            //Create inline style object depending on the weight value 
            let c = [0,191,255]     //rgb
            c[0] += weight/3;
            c[1] -= weight/3*2;
            c[2] -= weight/3*2;

            const _styleObj = {
                'backgroundColor': 'rgb('+c[0]+','+c[1]+','+c[2]+')'
            };

            //Clone/Duplicate the gridItem component with new properties and overwrite the old one
            let newGridItem = React.cloneElement(gridItem, {visited: true, styleName: 'grid-item-visited', styleObj: _styleObj, weight: weight, showWeight: this.state.showWeights});
            oldGrid[y][x][0] = newGridItem
            this.setState({gridState: oldGrid})
        }
        
        //Animate shortest path in the end, no need to animate start or goal
        for(let i = 1; i < shortestPath.length-1; i++)
        {
            await sleep(100 - this.state.animationSpeed)
            if(!this.state.isAnimating)
                return
            let [x,y] = getIndex(shortestPath[i])
            let gridItem = oldGrid[y][x][0]

            gridItem = React.cloneElement(gridItem, {visited: true, styleName: 'grid-item-shortestPath', styleObj: undefined});
            oldGrid[y][x][0] = gridItem
            this.setState({gridState: oldGrid})
        }
        this.setState({gridState: oldGrid, isVisualized: true, isAnimated: false})
    }

    //Recursive maze generation
    async generateMaze()
    {
        //Check if the grid in in animated state
        if(this.state.isAnimating || this.state.isVisualized)
        {
            //Since we don't need to clear the "Visited nodes" here, we can simply just reset the whole grid
            this.handleResetClick();
            await sleep(10);
        }
        //Generate maze from the current grid state
        var maze = new Maze(this.state.Graph.adjacencyList);
        await this.setState({isAnimating: true})
        for(var x = 0; x < maze.visitedNodes.length; x++)
        {
            for(var y = 0; y < maze.visitedNodes[x].length; y++)
            {
                if(!this.state.isAnimating)
                {
                    this.setState({isVisualized: true})
                    console.log(this.state.isVisualized)
                    console.log("Cancelled")
                    await sleep(10);
                    return
                }
                //If node is false, it's an obstacle
                if(maze.visitedNodes[x][y] === false)
                {
                    let newGrid = this.state.gridState
                    //Update the gridItem and the node in gridState
                    await this.updateGridItem([y,x], newGrid[x][y][1], 3);
                    //Sleep for a bit before next iteration
                    await sleep(100 - this.state.animationSpeed);
                }
            }
        }
        this.setState({isAnimating: false, isVisualized: true})
    }

    handleAlgorithmModeChange(e)
    {
        switch(e.target.value)
        {
            case "Dijkstra":
                this.setState({algorithm: this.AlgorithmTypes.Dijkstra})
                break;
            case "Astar":
                this.setState({algorithm: this.AlgorithmTypes.Astar})
                break;
            default:
                this.setState({algorithm: this.AlgorithmTypes.Dijkstra})
                break;
        }
    }

    handleDrawModeChange(e)
    {
        switch(e.target.value)
        {
            case "start":
                this.setState({drawMode: 1})
                break;
            case "end":
                this.setState({drawMode: 2})
                break;
            case "obstacle":
                this.setState({drawMode: 3})
                break;
            default:
                this.setState({drawMode: 1})
                break;
        }
        //TODO:: Handle diff types as enums
        console.log("this changed to " + e.target.value);
    }

    gridWasClicked = (gridItem) => {
        //Check if the grid in in animated state
        if(this.state.isAnimating)
        {
            this.cancelAnimation();
        }
        //Check if the clicked node was already the selected type
        if(gridItem.state.node.nodeType === this.state.drawMode)
        {
            return;
        }
        
        let newNode = gridItem.state.node;
        switch(this.state.drawMode)
        {
            //Draw mode is start
            case 1:
                if(this.state.gridStartPos)
                {
                    //Create temporary copy of the current start position node (Found by index from gridState array), so we don't mutate the active node directly
                    let oldX = this.state.gridStartPos.state.node.gridIndex[0]
                    let oldY = this.state.gridStartPos.state.node.gridIndex[1]
                    let oldStartNode = this.state.gridState[oldY][oldX][1];
                    //Change the node type to 0
                    oldStartNode.nodeType = 0;
                    
                    //Update the old starting node's information in the grid state array
                    this.updateGridItem([oldX, oldY], oldStartNode, 0);

                }
                //Change the new clicked item to be the new starting point
                newNode.nodeType = 1
                this.updateGridItem(newNode.gridIndex, newNode, 1);
                //Update the grid starting position
                this.setState({gridStartPos: gridItem})
                break;
            //Draw mode is end
            case 2:
                if(this.state.gridEndPos)
                {
                    //Create temporary copy of the current node
                    let oldX = this.state.gridEndPos.state.node.gridIndex[0]
                    let oldY = this.state.gridEndPos.state.node.gridIndex[1]
                    let oldEndNode = this.state.gridState[oldY][oldX][1];
                    //Change the node type to 0
                    oldEndNode.nodeType = 0;
                    //Update the old starting node's information in the grid state array
                    this.updateGridItem([oldX, oldY], oldEndNode, 0);

                }
                //Change the new clicked item to be the new ending point
                newNode.nodeType = 2
                this.updateGridItem(newNode.gridIndex, newNode, 2);
                //Update the grid starting position
                this.setState({gridEndPos: gridItem})
                break;
            //Draw mode is obstacle
            case 3:
                newNode.nodeType = this.state.drawMode;
                this.updateGridItem(newNode.gridIndex, newNode, 3);
                break;
            default:
                return;
        }
    }

    updateGridItem(idx, node, nodeType)
    {
        let oldGridState = [...this.state.gridState]
        let _styleName = "" 
        switch(nodeType)
        {
            case 1:
                _styleName = 'grid-item-start';
                break;
            case 2:
                _styleName = 'grid-item-end';
                break;
            case 3:
                _styleName = 'grid-item-obstacle';
                break;
            default:
                _styleName = 'grid-item'
                break;
        }

        let oldGridItem = React.cloneElement(oldGridState[idx[1]][idx[0]][0], {itemNode: node, styleName: _styleName});
        oldGridState[idx[1]][idx[0]][0] = oldGridItem
        node.nodeType = nodeType;       //For some reason the node's type isn't always the same as the parameter
        oldGridState[idx[1]][idx[0]][1] = node

        //Update the node in adjacency list aswell
        let tmpGraph = this.state.Graph
        tmpGraph.updateNode(node)
        this.setState({gridState: oldGridState, Graph: tmpGraph})
    }

    pushElemsToGrid(elem){
        let tmpArr = this.state.gridState;
        tmpArr.push(elem);
        this.setState({gridState: tmpArr});
    }

    async initGrid()
    {
        //By calculating window.innerWidth/Heigth we could divide it by width/heigth of a GridItem and get the count to fill out the container
        //Get the window dimensions
        let width = window.innerWidth;
        let height = window.innerHeight;
        //14 px is the width and height of a GridItem component's rendered div
        let colCount = Math.floor((width - 16) / 26);
        let rowCount = Math.floor((height - 16) / 26);
        //Store these just in a state just in case we'd want to resize the grid dynamically in the future
        this.setState({gridColCount: colCount, gridRowCount: rowCount});

        let counter = 0;
        for(let row = 0; row < rowCount; row++)
        {
            let tmpRow = [];
            for(let col = 0; col < colCount; col++)
            {
                //Create node object array which represents the grid's state (Used for data processing) and GridItem array which is used to render the grid
                let node = new Node(col, row, 0);
                var bool = false;
                tmpRow.push([<GridItem key={counter} gridWasClicked={this.gridWasClicked} itemNode={node} styleName='grid-item' visited={bool}/>, node]);
                
                counter++;
            }
            //Add the nodes in batches to 2d array for rendering purposes (Chrome dev tools crashes if you render too many objects at once)
            this.pushElemsToGrid(tmpRow);
            await sleep(1);
        }
        this.setState({Graph: new Graph(this.state.gridState)})
    }

    render(){
        const grid = this.state.gridState ? this.state.gridState : [[1]]
        return(
            <div className="layout-container">
                <nav className="layout-nav-bar">
                    <button className="layout-nav-button" onClick={this.handleSimulateClick}>
                        Simulate
                    </button>
                    <button className="layout-nav-button" onClick={this.generateMaze}>
                        Generate maze
                    </button>
                    <button className="layout-nav-button" onClick={this.handleResetClick}>
                        Reset
                    </button>
                    <div className="dropdown-container">
                        <label className="dropdown-description">Algorithm mode</label>
                        <select className="selector-dropdown" onChange={this.handleAlgorithmModeChange}>
                            <option value="Dijkstra">Dijkstra</option>
                            <option value="Astar">A*</option>
                        </select>
                    </div>
                    {/* Checkbox container for displaying weights, not ready for use yet */}
                    {/* <div className="checkbox-container">
                        <label className="slider-description">Show weights: </label>
                        <input type="checkbox" onChange={this.handleCheckboxChange}/>
                    </div> */}
                    <div className="slider-container">
                        <label className="slider-description">Animation speed: {this.state.animationSpeed}</label>
                        <input onChange={this.handleSpeedSlider} type="range" className="animation-speed-slider" min="1" max="100" value={this.state.animationSpeed}/>
                    </div>
                    <div className="dropdown-container">
                        <label className="dropdown-description">Drawing mode</label>
                        <select className="selector-dropdown" onChange={this.handleDrawModeChange}>
                            <option value="start">Start location</option>
                            <option value="end">End location</option>
                            <option value="obstacle">Obstacle</option>
                        </select>
                    </div>
                </nav>
            <div>
                <div key={this.state.curGrid} className="grid-container">
                    {grid.map((row, id) => <div key={id} className="grid-row">{(row.map((item, id) => item[0]))}</div>)}
                </div>
            </div>
            </div>
        );
    }
}

export default PathfindingLayout;