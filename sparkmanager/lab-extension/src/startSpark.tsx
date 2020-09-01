import React, { Component } from 'react';
interface StartSparkProps {
    executeFunction: any;
}
class StartSpark extends Component<StartSparkProps, any>{
    constructor(props: any) {
        super(props)
        this.state = {
            coreValue: null,
            memoryValue: null,
        }
    }
    handleChangeInValue = (event: any) => {
        switch (event.target.name) {
            case "memory":
                this.setState({
                    memoryValue: event.target.value
                })
                break;
            case "cores":
                this.setState({
                    coreValue: event.target.value
                })
                break;
            default:
                console.log("Error in event.target")
        }

    }
    render() {
        return (
            <React.Fragment>
                <input placeholder="Spark Driver Memory" name="memory" onChange={(event) => this.handleChangeInValue(event)} value={this.state.memoryValue} type="number" />
                <input placeholder="Spark Driver Core" name="cores" onChange={(event) => this.handleChangeInValue(event)} value={this.state.coreValue} type="number" />
                <button onClick={() => this.props.executeFunction(`spark = ${this.state.coreValue} * ${this.state.memoryValue}`)}>Start Spark</button>
            </React.Fragment>
        );
    }
}

export default StartSpark;