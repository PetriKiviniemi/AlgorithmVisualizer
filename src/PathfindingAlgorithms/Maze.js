import {getIndex} from './Utility'

export default class Maze
{
    constructor(AdjList)
    {
        this.adj = AdjList
        this.visitedNodes = []
        this.init();
    }

    init()
    {
        //Initialize visited nodes 2d matrix
        let nodes = Object.keys(this.adj)
        var [maxRow,maxCol] = getIndex(nodes[nodes.length-1])
        for(let i = 0; i <= maxCol; i++)
        {
            let tmpRow = []
            for(let j = 0; j <= maxRow; j++)
            {
                tmpRow.push(false)
            }
            this.visitedNodes.push(tmpRow)
        }
        //Pick a node from the visited nodes, preferably from the top
        this.generateMaze(nodes[0]);
    }

    generateMaze(nodeStr)
    {
        let node = getIndex(nodeStr);
        //Mark the chosen node as visited
        console.log(node)
        this.visitedNodes[node[1]][node[0]] = true;
        //Get the node's neighbours
        let wallList = Object.keys(this.adj[nodeStr])
        //Remove already visited neighbours, iterate in reverse since the indexes change when element is removed
        for(let i = wallList.length-1; i >= 0; i--)
        {
            let nodeIdx = getIndex(wallList[i])
            if(this.visitedNodes[nodeIdx[1]][nodeIdx[0]])
            {
                wallList.splice(i, 1);
            }
            //Delete diagonial neighbours for the sake of cleaner maze
            if(node[0] !== nodeIdx[0] && node[1] !== nodeIdx[1])
            {
                wallList.splice(i, 1);
            }
        }
        //Now the neighbours list only contains 'obstacle' nodes, that are neighbours with the chosen cell in x or y axis
        //Iterate through the list
        while(wallList.length > 0)
        {
            //Pick a random neighbour from the list
            let wall = wallList[Math.floor(Math.random() * Math.floor(wallList.length))] 
            wall = getIndex(wall)
            let visitedCounter = 0;
            //Check if the chosen nodes doesn't have 2 explored neighbour nodes
            let wallNeighbours = Object.keys(this.adj[wall.toString()])
            for(let i = wallNeighbours.length-1; i >= 0; i--)
            {
                let nodeIdx = getIndex(wallNeighbours[i])
                if(this.visitedNodes[nodeIdx[1]][nodeIdx[0]])
                {
                    wallNeighbours.splice(i, 1);
                    visitedCounter += 1;
                }
                //Delete diagonial neighbours for the sake of cleaner maze
                if(wall[0] !== nodeIdx[0] && wall[1] !== nodeIdx[1])
                {
                    wallNeighbours.splice(i, 1);
                }
            }

            //Now wallNeighbours only contains the neighbours that are obstacles, aka walls 
            //Check for count of visited neighbours
            if(visitedCounter <= 2)
            {
                this.visitedNodes[wall[1]][wall[0]] = true
                for(let i = 0; i < wallNeighbours.length; i++)
                {
                    wallList.push(wallNeighbours[i])
                }
            }
            wallList.splice(wallList.indexOf(wall.toString()), 1);
        }
    }
}
