const express = require('express')
const path = require('path')
const moment = require('moment')
const { HOST } = require('./src/constants')
const db = require('./src/database')
const db_fake = require('./src/database-fake')
const Web3 = require('web3')
const RooCrew = require('./src/RooCrewABI.json')

const PORT = process.env.PORT || 5000

const address = "0x10e3Ea99a188a0EC73093127b5FBFeD852dCd657";

const web3 = new Web3("https://eth-mainnet.alchemyapi.io/v2/JfPp8Y_Yi8zvS1fVLWSe6wUW2LMn9sqG");

const instance = new web3.eth.Contract(
	RooCrew.abi,
	address
);

async function getSupply() {
	x = await instance.methods.totalSupply().call();
	return x;
}

const app = express()
  .set('port', PORT)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

// Static public files
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
  res.send('RooCrew Metadata API');
})

app.get('/api/token/:token_id', function(req, res) {
  async function doIt() {
	  supply = await getSupply();
	  const token_id = parseInt(req.params.token_id);
	  const db_len = Object.keys(db).length;
	  if ((token_id <= supply) && (token_id <= db_len)) {
		  const token_str = token_id.toString()
		  const roo = db[token_str]
		  const data = {
			'name': roo.name,
			'attributes': roo.attributes,
			'description': roo.description,
			'image': roo.image
		  }
		res.send(data)
	  } else {
		  const token_str = "1";
		  const roo = db_fake[token_str]
		  const data = {
			'name': '#' + token_id.toString() + ' ' + roo.name,
			'description': roo.description,
			'image': roo.image
		  }
		res.send(data)
	  }
  }
  doIt();
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
})

