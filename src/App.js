import React from "react";
import { Map } from "immutable";
import { add, buy, inTheBlack, addItem, pouchEffectsLedger } from "merchant.js";

// Currencies
const content_pieces = "content_pieces";
const views = "views";
const writers = "writers";
const dollars = "dollars";


// Items
const pouch = {
    content_writer: {
        type: "Content Writer",
        cost: () => {
            return Map({ [dollars]: -1 });
        },
        effect: () => {
            return Map({ [content_pieces]: 1, [dollars]: -0.05 });
        }
    }
};

class Metric extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.button) {
            return (
                <div className={this.props.hidden}>
                    <h1> {this.props.name} {this.props.wallet.get(this.props.metric).toFixed(this.props.decimalRound) || 0} </h1>
                    <button onClick={this.props.onClick}>Write Some Content Yourself</button>
                </div>
            )
        }
        return (
            <div className={this.props.hidden}>
                <h1> {this.props.name} {this.props.wallet.get(this.props.metric).toFixed(this.props.decimalRound) || 0} </h1>
            </div>
        )
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wallet: Map({
                [views]: 0,
                [dollars]: 0,
                [content_pieces]: 0
            }),
            ledger: Map(),
            visible: {
                content_writers: false
            }
        };

        this.writeContent = this.writeContent.bind(this);
        this.hireWriter = this.hireWriter.bind(this);
        this.update = this.update.bind(this);

        setInterval(this.update, 1000);
    }

    update() {
        if (document.hasFocus()) {
            this.state.ledger = add(this.state.ledger, Map(
                {
                    [dollars]: 0.0001 * this.state.wallet.get('views'),
                    [views]: 0.01 * this.state.wallet.get('content_pieces')
                }));

            this.setState({
                wallet: add(this.state.wallet, this.state.ledger)
            });
        }
    }

    writeContent() {
        const wallet = add(this.state.wallet, Map({ [content_pieces]: 1 }));
        this.setState({
            wallet
        });
        if (!this.state.visible.content_writers && this.state.wallet.get('views') > 50) {
            this.setState({
                visible: {
                    content_writers: true
                }
                }
            )
        }
    }

    hireWriter() {
        const walletWithCostsApplied = buy(pouch.content_writer, this.state.wallet);
        if (!inTheBlack(walletWithCostsApplied)) {
            return;
        }

        const wallet = addItem(pouch.content_writer, walletWithCostsApplied);
        const ledger = pouchEffectsLedger(Object.values(pouch), wallet);

        this.setState({
            wallet,
            ledger
        });
    }

    render() {
        return (
            <div>
                <h1>Content Startup Simulator</h1>
                <h3>hate clickbait? so do we. Click here to find out more.</h3>
                <Metric name={"Dollars"} wallet={this.state.wallet} metric={"dollars"} decimalRound={2}/>
                <Metric name={"Views"} wallet={this.state.wallet} metric={"views"} decimalRound={0}/>
                <h1> Content pieces {this.state.wallet.get(content_pieces) || 0} </h1>
                <button onClick={this.writeContent}>Write Some Content Yourself</button>


                <h1 className={this.state.visible.content_writers ? '' : 'hidden'}>  Content Writers: {this.state.wallet.get(pouch.content_writer.type) || 0} </h1>
                <button className={this.state.visible.content_writers ? '' : 'hidden'} onClick={this.hireWriter}>Hire a content writer</button>


                <p>{((this.state.ledger.get(dollars) || 0)).toFixed(2)} dollars made per second</p>
            </div>
        );
    }
}

export default () => <App />;
