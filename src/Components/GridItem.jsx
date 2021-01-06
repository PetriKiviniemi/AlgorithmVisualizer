import React from 'react';
import './Grid.scss'
import Node from '../PathfindingAlgorithms/Node'

//Just an object thats state is controlled by the grid
//Used for animation and visualization only
class GridItem extends React.Component
{
    constructor(props)
    {
        super(props);
        this.itemDiv = React.createRef();
        this.state = {
            node: this.props.node,                  //Node object that's stored in this gridItem component. TODO:: Store all node objects in parent and then just pass their needed values as props to this component
            styleName: this.props.styleName,        //Css style name what is changed with selecte drawing mode
            styleObj: this.props.styleObj,          //Inline style object that's passed as a prop from parent, used to calculate the RGB color of the node from the weight value
            showWeight: this.props.showWeight,      //This is a boolean for showing weights, has currently no use
            weight: this.props.weight               //The actual weight value of the node after running desired algorithm
        };
        this.updateNode = this.updateNode.bind(this)
    }

    componentDidMount()
    {
        let nodeObj = this.props.itemNode
        this.setState({node: nodeObj, styleName: this.props.styleName, styleObj: this.props.styleObj, showWeight: this.props.showWeight, weight: this.props.weight});
    }

    componentDidUpdate(prevProps)
    {
        if(this.props.showWeight != prevProps.showWeight)
            this.setState({showWeight: this.props.showWeight})
        if(this.props.styleName != prevProps.styleName)
            this.setState({styleName: this.props.styleName})
    }

    componentWillUnmount()
    {
        //this.updateNode causing a memory leak since the notification method is still being ran ? 
        //TODO:: How to change style of each grid-item component from parent without lifting state up?
        //Cannot lift state up to parent since there are so many grid-item components that need changing
    }


    updateNode(node)
    {
        this.setState({node: node});
        switch(node.nodeType)
        {
            case 1:
                this.setState({styleName: 'grid-item-start'});
                break;
            case 2:
                this.setState({styleName: 'grid-item-end'});
                break;
            case 3:
                this.setState({styleName: 'grid-item-obstacle'});
                break;
            default:
                this.setState({styleName: this.props.styleName});
                break;
        }
    }

    //Handle cell hover over if mouse buttons are being pressed down, send notification of clicked cell to parent, where the input is being handled
    cellWasHovered = (e) => {
        e.preventDefault();
        var unFocus = function () {
            if (document.selection) {
              document.selection.empty()
            } else {
              window.getSelection().removeAllRanges()
            }
        } 
        //If the mouse buttons are being held down
        if(e.buttons == 1 || e.buttons == 3)
        {
            
            this.props.gridWasClicked(this);
            unFocus();
        }
    }

    //Handle cell click, send notification of clicked cell to parent, where the input is being handled
    cellWasClicked = (e) => {
        e.preventDefault();
        this.props.gridWasClicked(this);
    }

    render(){
        //Variables that change depending on the passed props
        let isConstructed = this.state.node ? true : false;
        let styleName = this.props.visited ? this.props.styleName : this.state.styleName
        let styleColor = this.props.visited ? this.props.styleObj : undefined
        //let weightValue = this.props.showWeight ? this.state.weight : ""      //This can be used to display weights of the nodes
        if(isConstructed)
        {
            return(
                <div className={styleName} style={styleColor} onClick={this.cellWasClicked} onMouseOver={this.cellWasHovered}>    
                </div> 
            ); 
        }
        else{
            return(<div/>)
        }
    }
}

export default GridItem;