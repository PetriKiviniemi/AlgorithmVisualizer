export function getIndex(node)
{
    //Since the grid index is stored a string in the node
    //This quick hack function will always return the node's index value as integer
    //check if nodeIdx is string or int array
    if(typeof node != "string")
        return node
    let x = parseInt(node.split(',')[0])
    let y = parseInt(node.split(',')[1])
    return [x,y]
}

export function compareNodes(node1, node2)
{
    if(node1[0] == node2[0] && node1[1] == node2[1])
        return true
    else
        return false
}

export function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms))
}