import { isValidElement } from 'react';
import {PriorityQueue} from './PriorityQueue'
import {compareNodes, getIndex} from './Utility'

function calcHeurestic(start, goal)
{
    var [x1,y1] = getIndex(start)
    var [x2,y2] = getIndex(goal)
    var dx = Math.abs(x1-x2)
    var dy = Math.abs(y1-y2)
    return (10 * (dx + dy) + (14 - 2 * 10) * Math.min(dx, dy))
}

export function Astar(Adj, start, goal)
{
    var openSet = new PriorityQueue();
    var gScore = {}        //g score value for every node in graph
    var parent = {}        //Predecessor of any given node in graph
    var visitedNodes = []  //Closed set
    var nodesInOrder = []  //For visualizer
    var shortestPath = []  //The shortest path

    //Initialize start node
    openSet.queue_item(start, 0);
    visitedNodes.push(start)
    gScore[start] = 0;
    parent[start] = undefined


    while(!openSet.isEmpty())
    {
        let qElem = openSet.dequeue();
        let minNode = qElem.gridIndex
        nodesInOrder[qElem.gridIndex] = gScore[qElem.gridIndex]
        //Check if the minNode was goal
        if(compareNodes(minNode, goal))
        {
            console.log("Goal reached")
            //Backtrack and return the shortest path
            while(minNode != undefined && !compareNodes(minNode, start))
            {
                shortestPath.push(minNode)
                minNode = parent[minNode]
            }
            shortestPath.push(start)
            return [nodesInOrder, shortestPath]
        }
        
        for(let neighbour in Adj[minNode])
        {   
            let next = getIndex(neighbour)
            if(visitedNodes.includes(neighbour))
                continue;
            let newCost = gScore[minNode] + Adj[minNode][next]
            if(!gScore[next] || newCost < gScore[next])
            {                
                parent[next] = minNode
                //Calc the new fScore for the neighbour
                gScore[next] = newCost
                //Calculate f(n) (priority) for this new node
                let weight = newCost + calcHeurestic(next, goal)
                openSet.queue_item(next, weight)
            }
        }
        visitedNodes.push(minNode.toString())
    }

    return;
}