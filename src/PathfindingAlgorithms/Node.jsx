export class Node{
    constructor(x,y, weight){
        this.gridIndex = [x,y];
        this.nodeType= 0;
        this.weight = weight;
    }

    addNeighbour(node){
        this.neighbours.push(node);
    }

    setGridIndex(idx)
    {
        this.gridIndex = idx;
    }

    getGridIndex()
    {
        return this.gridIndex;
    }

    setType(type)
    {
        this.nodeType = type;
    }

    getType()
    {
        return this.nodeType;
    }

    removeNeighbour(node){
        const index = this.neighbours.indexOf(node);
        if(index > -1)
        {
            this.neighbours.splice(index, 1);
            return node;
        }
    }

    getNeighbours()
    {
        return this.neighbours;
    }
}

export default Node;