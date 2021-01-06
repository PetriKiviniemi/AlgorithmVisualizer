import {Node} from './Node'
import {getIndex} from './Utility'

export class Graph{
    
    constructor(graph)
    {
        this.graph = graph;
        this.adjacencyList = {}
        this.start = undefined;
        this.goal = undefined;
        //this.adjacencyList is adjacency list (key value paired dict type object) of nodes
        /** For example
        graph = {
                node1: {node2 : 10, node3 : 14},
                node2: ...,
                }
         */
        this.initAdjList();
    }

    //Function for updating nodes after the graph is initialized
    //E.g a node in graph changes to an obstacle, we remove edges between this node and it's neighbours, and delete the node after
    updateNode(newNode)
    {
        //First update the node
        this.graph[newNode.gridIndex[1]][newNode.gridIndex[0]][1] = newNode
        //Check if the newly changed node was obstacle, if it was
        //Remove the edges from this node to anywhere else
        //We could also check if the node used to be an obstacle, then we would have no operations to perform
        if(newNode.nodeType == 3)
        {
            for(var node in this.adjacencyList[newNode.gridIndex])
            {
                //Remove edges node->neighbour and neighbour->node
                this.removeEdge(newNode.gridIndex, node)
            }
            
            //Check diagonials if they're obstacles, if they're, remove edges between the non-obstacle nodes from x & y axis
            var [x,y] = newNode.gridIndex
            //x max = this.graph.length, x == row
            //Check if col and row is out of bounds aswell
            //Top right
            if(x+1 < this.graph[0].length && y-1 > 0 && this.graph[y-1][x+1][1].nodeType == 3)
            {
                this.removeEdge([x,y-1], [x+1, y])
            }
            //Bottom right
            if(x+1 < this.graph[0].length && y+1 < this.graph.length && this.graph[y+1][x+1][1].nodeType == 3)
            {
                this.removeEdge([x+1,y], [x, y+1])
            }
            //Bottom left
            if(x-1 > 0 && y+1 < this.graph.length && this.graph[y+1][x-1][1].nodeType == 3)
            {
                this.removeEdge([x-1,y], [x, y+1])
            }
            //Top left
            if(x-1 > 0 && y-1 > 0 && this.graph[y-1][x-1][1].nodeType == 3)
            {
                this.removeEdge([x,y-1], [x-1, y])
            }


            //Remove the node from graph
            //delete this.adjacencyList[newNode.gridIndex]
            
            //TODO:: WE COULD DO THIS TO SAVE MEMORY, BUT WE WOULD NEED TO CHANGE generateEdges() METHOD.
            //E.g currently we check if this.graph[y+1][x+1].nodeType != 3, but when graph changes,
            //that index won't be the the diagonial neighbour on the grid anymore, since the node is deleted
            
        }
        //Check the other way around, if node used to be obstacle, add new neighbours to the node
        else if(newNode.nodeType != 3)
        {
            //Add the node to the graph
            //Check if the node used to be an obstacle
            if(Object.entries(this.adjacencyList[newNode.gridIndex]).length == 0)
            {
                this.adjacencyList[newNode.gridIndex] = {}
                this.generateNodeNeighbours(newNode.gridIndex.toString())
            }
        }
    }

    calcMovementCost(node1, node2)
    {
        if(getIndex(node1)[0] == getIndex(node2)[0] || getIndex(node1)[1] == getIndex(node2)[1])
            return 10
        else
            return 14
    }

    getWeight(node1, node2)
    {
        return this.adjacencyList[node1][node2];
    }
    
    removeEdge(node1, node2)
    {
        node1 = node1.toString();
        node2 = node2.toString();
        delete this.adjacencyList[node1][node2]
        delete this.adjacencyList[node2][node1]
    }

    //Function to add edges between two nodes
    addEdge(nodeTuple){

        let node1 = nodeTuple[0].toString()
        let node2 = nodeTuple[1].toString()

        //Check if there's already edge between nodes
        for(var node in this.adjacencyList[node1])
        {
            if(node == node2)
                return
        }
        let oldNeighbours;
        
        if(this.adjacencyList[node1] != undefined)
        {
            //Get a dict of neighbours the node currently has
            oldNeighbours = this.adjacencyList[node1]
            //Add the new neighbour and calculate the weight
            oldNeighbours[node2] = this.calcMovementCost(node1, node2)
            //Push the new list of neighbours to the dictionary
            this.adjacencyList[node1] = oldNeighbours
        }


        if(this.adjacencyList[node2] != undefined)
        {
            //Push node1 to node2's neighbours aswell
            oldNeighbours = this.adjacencyList[node2]
            //Add the new neighbour and calculate the weight
            oldNeighbours[node1] = this.calcMovementCost(node1, node2)
            //Push the new list of neighbours to the dictionary
            this.adjacencyList[node2] = oldNeighbours
        }

        return
    }

    //For creating the initial adjacency list from graph
    initAdjList(){
        //Iterate through graph node object array
        for(var row = 0; row < this.graph.length; row++)
        {
            for(var col = 0; col < this.graph[row].length; col++)
            {
                //Node object's are stored in gridObject[1]
                this.adjacencyList[this.graph[row][col][1].gridIndex] = {}
            }
        }
        this.generateEdges();
    }

    generateNodeNeighbours(node)
    {
        let x = getIndex(node)[0]          //X max == this.graph[0]length 71
        let y = getIndex(node)[1]          //Y max == this.graph.length 34

        let node1 = [x,y]
        var node2 = [0,0]
        //If node is an obstacle, skip it
        //TODO:: Consider just removing these from the graph ?
        if(this.graph[y][x][1].nodeType == 3)
            return
        //this.graph has reversed x && y
        //Origin of the graph is also in top left corner instead of bottom left corner which is the usual (TODO:: Change the point of origin?)
        //Check edge cases and if the node is not obstacle for x && y axis
        if(x-1 >= 0 && this.graph[y][x-1][1].nodeType != 3)
        {
            node2 = [x-1, y];
            this.addEdge([node1, node2])
        }            
        if(x+1 < this.graph[0].length && this.graph[y][x+1][1].nodeType != 3)
        {
            node2 = [x+1, y]
            this.addEdge([node1, node2])
        }
        if(y-1 >= 0 && this.graph[y-1][x][1].nodeType != 3)
        {
            node2 = [x, y-1]
            this.addEdge([node1, node2])
        }
        if(y+1 < this.graph.length && this.graph[y+1][x][1].nodeType != 3)
        {
            node2 = [x, y+1]
            this.addEdge([node1, node2])
        }
        //Diagonials
        if(x-1 >= 0 && y+1 < this.graph.length && this.graph[y+1][x-1][1].nodeType != 3)
        {
            node2 = [x-1, y+1]
            this.addEdge([node1, node2])
        }
        if(x-1 >= 0 && y-1 >= 0 && this.graph[y-1][x-1][1].nodeType != 3)
        {
            node2 = [x-1, y-1]
            this.addEdge([node1, node2])
        }
        if(x+1 < this.graph[0].length && y-1 >= 0 && this.graph[y-1][x+1][1].nodeType != 3)
        {
            node2 = [x+1, y-1]
            this.addEdge([node1, node2])
        }
        if(x+1 < this.graph[0].length && y+1 < this.graph.length && this.graph[y+1][x+1][1].nodeType != 3)
        {
            node2 = [x+1, y+1]
            this.addEdge([node1, node2])
        }
    }

    generateEdges(){
        //Since we're using a grid what will always have neighbours in x-y and diagonial axis, we can just check whether those nodes are obstacles or not
        //And add edges between those nodes
        for(var node in this.adjacencyList)
        {
            this.generateNodeNeighbours(node)
        }
    }

}

export default Graph;