var async = require('async')
var request = require('request')
var cheerio = require('cheerio')
var util = require('./util')

const CONCURRENT_REQ = 5

var allLinks = []

const crawlLink = ( url, callback ) => {
	console.log("----->>", url)
	request(url, (error, response, html) => {
		var links = []
		if(error) {
			return callback && callback(links)
		}
		$ = cheerio.load(html)
		hyperlinks = $('a')
	  	$(hyperlinks).each((index, link) => {
	  		links.push($(link).attr('href'))
	  	})
	  	callback && callback(links)
	})
}

if(!process.argv[2]){
	console.log("Please pass the url to be crawled as an argument")
	process.exit()
	return
}

url = process.argv[2]

crawlLink( url, links => {
	links.forEach(function(link, index){
		if(util.isValidUrl(link) && allLinks.indexOf(link) === -1){
    		allLinks.push(link)
		}
	})
	async.parallelLimit(
		allLinks.map( link => callback => crawlLink(link, links => {
			links.forEach( newlink => {
				if(util.isValidUrl(newlink) && allLinks.indexOf(newlink) < 0){
    				allLinks.push(newlink)
				}
			})
			callback()
		})), 
		CONCURRENT_REQ,
		(err, results) => {
			console.log("# of links :", allLinks.length)
			util.saveAsCSV( allLinks, saved => {
				process.exit()
			})
		}
	)
})

