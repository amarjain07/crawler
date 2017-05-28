'strict'

var request = require('request')
var cheerio = require('cheerio')
var util = require('./util')

const CONCURRENT_REQ = 5
const UPPER_LIMIT = 5

var url = ''
var allLinks = []
var sent = 0
var received = 0

const crawlLink = ( url, callback ) => {
	console.log("----->>", sent, ": " , url)
	sent++
	request(url, (error, response, html) => {
		var links = []
		if(error) {
			return callback(links)
		}
		$ = cheerio.load(html)
		hyperlinks = $('a')
	  	$(hyperlinks).each((index, link) => {
	  		links.push($(link).attr('href'))
	  	})
	  	callback(links)
	})
}

const callback = links => {
	console.log("<<-----", received)
	received++
	links.forEach((link, index) => {
		if(util.isValidUrl(link) && allLinks.indexOf(link) < 0){
    		allLinks.push(link)
		}
	})
	if( received == sent || received == UPPER_LIMIT ){
		if(received == UPPER_LIMIT){
			console.log("Crawling stopped at ", UPPER_LIMIT, "links")
		}
		console.log("# of links :", allLinks.length)
		util.saveAsCSV( allLinks, saved => {
			process.exit()
		})
	} else if( sent < allLinks.length ){
		crawlLink(allLinks[sent], callback)
	}
}


allLinks.push(url)
if(!process.argv[2]){
	console.log("Please pass the url to be crawled as an argument")
	process.exit()
	return
}
url = process.argv[2]

crawlLink(url, links => {
	console.log("<<-----", received)
	received++
	links.forEach(function(link, index){
		if(util.isValidUrl(link) && allLinks.indexOf(link) === -1){
    		allLinks.push(link)
		}
	})
	var initialReqCount = (allLinks.length - sent) < CONCURRENT_REQ ? (allLinks.length - sent) : CONCURRENT_REQ
	for(var i = sent; i <= initialReqCount; i++){
		crawlLink(allLinks[i], callback)
	}
})
