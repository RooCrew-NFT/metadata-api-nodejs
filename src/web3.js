const getWeb3 = require('./getWeb3.js');
const Antimasks = require('./Antimasks/Antimasks.json');

state = { address: "0x72bb198bAAb62e1f1f6B60d2bB37C63a303a58Ad", accounts: null, contract: null, web3: null };

const getLevel = (price) => {
    if (price == 0.03) {
        return "th1";
    } else if (price == 0.06) {
        return "th2";
    } else if (price == 0.10) {
        return "th3";
    } else if (price == 0.15) {
        return "th4";
    } else if (price == 0.20) {
        return "th5";
    } else {
        return "th6";
    }
}

const component = async () => {
    try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();

        const address = state.address;
        const instance = new web3.eth.Contract(
            Antimasks.abi,
            address
        );

        state.accounts = accounts;
        state.contract = instance;
        state.web3 = web3;

        networkId = await web3.eth.net.getId();
        if (networkId != 1) {
            alert("Warning: You are not on mainnet! Switch before minting Antimasks!");
        } else {
            document.getElementById("address").innerHTML = "Wallet: " + accounts[0];
        }

        price = await state.contract.methods.calculatePrice().call();
        price = price / 1000000000000000000;
        document.getElementById("price-level").innerHTML = "Current Price Level: " + price;

        let th = getLevel(price);
        let elems = document.getElementsByClassName(th);
        for (let i = 0; i < elems.length; i++) {
            elems[i].classList.remove("u-white");
            elems[i].classList.add("u-palette-3-base");
        }

        supply = await state.contract.methods.totalSupply().call();
        let pct = (supply / 2500 * 100).toFixed(1);
        let pct_str = pct + "%";

        document.getElementById("progress").style.width = pct_str;
        document.getElementById("progress").innerHTML = pct_str;

    } catch (error) {
        console.log(error);
    }
};

component();

const mintMasks = async () => {
    try {

        let nonce_count = await state.web3.eth.getTransactionCount(state.accounts[0]);        

        //user input - # of masks to mint
        let num_masks = document.getElementById("num-masks").value;

        const transaction = state.contract.methods.mintAntimask(num_masks);

        //get ether value to mint selected # of masks
        let eth_val = 0;
        let curr_id = await state.contract.methods.totalSupply().call(); //latest token id
        console.log('curr_id: ' + curr_id);
        //using latest token id for edge case between price intervals
        for (let i = 0; i < num_masks; i++) {
            let curr_price = parseInt(await state.contract.methods.calculatePriceForToken(curr_id).call());
            console.log(curr_price);
            eth_val += curr_price;
            curr_id++;
        }

        console.log(eth_val);
        
        //build the transaction            
        const txObject = {
            from: state.accounts[0],
            nonce: nonce_count, 
            to: state.address,
            value: eth_val,
            gas: await transaction.estimateGas({from: state.accounts[0], value: eth_val}),
            data: transaction.encodeABI()
        };

        console.log('address: ' + txObject.to);
        console.log('value: ' + txObject.value);
        console.log('gas: ' + txObject.gas);
        console.log('data: ' + txObject.data);

        const return_from_send = await state.web3.eth.sendTransaction(txObject); 
        console.log(return_from_send);
    } catch (error) {
        alert(error);
    }
};

//document.getElementById("mint-btn").addEventListener("click", mintMasks);
