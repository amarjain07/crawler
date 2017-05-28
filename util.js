var fs = require('fs');

module.exports.isValidUrl = url => {
  if(!url){ 
    return false
  }
  if(url.startsWith('http://') || url.startsWith('https://')){
    return true
  }
  return false
}

const convertToCSV = data => {
  var result = ''
  data.forEach((link, index) => {
    result += link + ","
  })
  return result
}

module.exports.saveAsCSV = (data, callback) => {
  var csv = convertToCSV(data)
  csv = 'data:text/csv;charset=utf-8,' + csv
  var encodedCSV = encodeURI(csv)

  fs.writeFile("./crawler.csv", encodedCSV, (err) => {
      if(err) {
          return callback(false);
      }
      console.log("The file was saved as crawler.csv");
      callback(true)
  })
}
