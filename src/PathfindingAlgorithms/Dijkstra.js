import {PriorityQueue} from './PriorityQueue'
import {compareNodes} from './Utility'

export function Dijkstra(Adj, start, goal)
{
    if(!start)
        console.log("start was not defined")
    if(!goal)
        console.log("end was not defined")
    
    var prioQ = new PriorityQueue();
    var shortestPath = [] //Shortest path to goal node
    var toBeVisited = {} //Closed set
    var dist = []
    var parent = []

    for(var node in Adj)
    {
        dist[node] = Infinity
        parent[node] = undefined
    }

    dist[start] = 0;
    
    for(var node in Adj)
    {
        prioQ.queue_item(node, dist[node])
    }

    while(!prioQ.isEmpty())
    {
        let qElem = prioQ.dequeue();
        let minNode = qElem.gridIndex
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
            return [toBeVisited, shortestPath]
        }
        
        //Iterate the neighbours and calculate their weights
        for(var neighbour in Adj[minNode])
        {
            if(dist[neighbour] > dist[minNode] + Adj[minNode][neighbour])
            {
                dist[neighbour] = dist[minNode] + Adj[minNode][neighbour]
                parent[neighbour] = minNode
                //Update the priority of the node in priority queue
                if(!toBeVisited[neighbour])
                {
                    prioQ.queue_item(neighbour, dist[neighbour])
                    toBeVisited[neighbour] = dist[neighbour]
                }
            }
        }
            
    }
    
    return toBeVisited, shortestPath
}