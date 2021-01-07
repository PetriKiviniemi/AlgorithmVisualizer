import React from 'react';
import PathfindingLayout from "./PathfindingLayout";
import './Layout.scss';

class Layout extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            currentLayout: <PathfindingLayout/>,
        };
    }

    render(){
        return(
            <div className="layout-wrapper">
                <PathfindingLayout/>
            </div>
        );
    }

}

export default Layout;