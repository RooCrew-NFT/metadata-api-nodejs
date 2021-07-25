const express = require('express')
const path = require('path')
const moment = require('moment')
const { HOST } = require('./src/constants')
const db = require('./src/database')
const db_fake = require('./src/database-fake')
const Web3 = require('web3')
const RooCrew = require('./src/RooCrewABI.json')

const PORT = process.env.PORT || 5000

const address = "0xCAff43B36f011bCf6dc6234Dd56B786fc9a72377";

const web3 = new Web3("https://eth-rinkeby.alchemyapi.io/v2/su5-8Reiyu3oQS6590yr3o-oy6FWNnha");

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
	  if (parseInt(req.params.token_id) <= supply) {
		  const tokenId = parseInt(req.params.token_id).toString()
		  const person = db[tokenId]
		  const bdayParts = person.birthday.split(' ')
		  const day = parseInt(bdayParts[1])
		  const month = parseInt(bdayParts[0])
		  const data = {
			'name': person.name,
			'attributes': {
			  'birthday': person.birthday,
			  'birth month': monthName(month),
			  'zodiac sign': zodiac(day, month),
			  // 'age': moment().diff(person.birthday, 'years')
			},
			'image': `${HOST}/images/${tokenId}.png`
		  }
		res.send(data)
	  } else {
		const tokenId = parseInt(req.params.token_id).toString()
		const person = db_fake[1]
		const bdayParts = person.birthday.split(' ')
		const day = parseInt(bdayParts[1])
		const month = parseInt(bdayParts[0])
		const data = {
			'name': person.name,
			'attributes': {
			  'birthday': person.birthday,
			  'birth month': monthName(month),
			  'zodiac sign': zodiac(day, month),
			  // 'age': moment().diff(person.birthday, 'years')
			},
			'image': `https://ipfs.io/ipfs/QmdbkLGih7EzRUnnMBFUgjoUWFibCKcJrj4ZAbJ8vjrfDR/image.png`
		}
		res.send(data)
	  }
  }
  doIt();
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
})

// returns the zodiac sign according to day and month ( https://coursesweb.net/javascript/zodiac-signs_cs )
function zodiac(day, month) {
  var zodiac =['', 'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn'];
  var last_day =['', 19, 18, 20, 20, 21, 21, 22, 22, 21, 22, 21, 20, 19];
  return (day > last_day[month]) ? zodiac[month*1 + 1] : zodiac[month];
}

function monthName(month) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ]
  return monthNames[month - 1]
}

