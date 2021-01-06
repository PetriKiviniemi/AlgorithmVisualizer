import {Node} from './Node'
import {getIndex} from './Utility'

export class PriorityQueue{
    
    constructor(props)
    {
        this.queue = []
    }

    queue_item(nodeIdx, priorityValue)
    {
        var [x,y] = getIndex(nodeIdx)
        var qElem = new Node(x, y, priorityValue);
        var doesContain = false;
        
        for(var i = 0; i < this.queue.length; i++)
        {
            if(this.queue[i].weight > qElem.weight)
            {
                this.queue.splice(i, 0, qElem)
                doesContain = true;
                break;
            }
        }

        if(!doesContain)
            this.queue.push(qElem)
    }

    //We could hash the elements to get O(1) but we would still probably waste a lot of memory since the count of elements is high
    //Consider using min heap ?
    dequeue()
    {
        if(!this.isEmpty())
        {
            var node = this.queue.shift()
            return node
        }
    }

    isEmpty()
    {
        return this.queue.length > 0 ? false : true;
    }
}

export default PriorityQueue;