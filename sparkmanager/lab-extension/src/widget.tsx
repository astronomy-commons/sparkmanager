import { ReactWidget, UseSignal } from '@jupyterlab/apputils';
import React from 'react';
import StartSpark from './startSpark';
import { KernelModel } from './model';

export class KernelView extends ReactWidget {
  constructor(model: KernelModel) {
    super();
    this._model = model;
  }

  executeCode = (code: any) => {
    console.log("Code in parent ", code)
    this._model.execute(code)
  }

  protected render(): React.ReactElement<any> {

    return (
      <React.Fragment>
        <StartSpark executeFunction={this.executeCode} />
        <div>
          Output from kernel is here: <br/>
          <UseSignal signal={this._model.stateChanged}>
            {(): JSX.Element => (
              <span key="output field">{JSON.stringify(this._model.output)}</span>
            )}
          </UseSignal>
        </div>
      </React.Fragment>
    );
  }

  private _model: KernelModel;
}

















{/* <button
          key="header-thread"
          className="jp-example-button"
          onClick={(): void => {
            console.log("Button is clicked")
            // this._model.execute(`
            // import pyspark
            // spark = (
            //   pyspark
            //   .sql
            //   .SparkSession
            //   .builder
            //   .config('spark.driver.memory', '12g')
            //   .config("spark.driver.cores", "4")
            //   .config("spark.executor.instances", "24")
            //   .config("spark.executor.cores", "4")
            //   .config("spark.executor.memory", "57500m")
            //   .getOrCreate()
            // )
            // # Spark Context
            // sc = spark.sparkContext
            // `);
            this._model.execute("4*4")
          }}
        >
          Start!!!!
        </button> */}
