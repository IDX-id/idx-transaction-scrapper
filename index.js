const 
HtmlTableToJson = require('html-table-to-json'),
jsdom = require("jsdom"),
fs = require('fs'),
{ JSDOM } = jsdom,
axios = require('axios'),
qs = require('qs'),
myArgs = process.argv.slice(2),
InputBroker = myArgs[0].replace(".", ""),
Inputdate = myArgs[1];

if (InputBroker == null || Inputdate == "null" ) {
    console.log('broker requied!!!')
    console.log('using command node index.js "broker_code" "date" ')
    process.exit()
}

function GetQuery(query) {
const 
  dom = new JSDOM(query),
  ResGetQuery = dom.window.document.querySelector("#broker_table > table").innerHTML,
  date = dom.window.document.querySelector("#market_date option:checked").value,
  jsonTables = HtmlTableToJson.parse(`<table>${ResGetQuery}</table>`),
  ResStrings = JSON.stringify(jsonTables.results),
  obj = JSON.parse(ResStrings),
  arr = obj[0];
  
  return JSON.stringify([{"data":arr,"date" : date}]);
}

var 
  data = qs.stringify({
    'brkInput': InputBroker,
    'codefld': InputBroker,
    'hidden_period': '',
    'hidden_period_ic': '',
    'hidden_scrollTo': 'header_ic2',
    'img_id': 'svol_img',
    //'market_date': Inputdate,
    'market_sel': '0',
    'pointer': 'desc',
    'sort': '8' 
  }),
  config = {
    method: 'post',
    url: 'https://analytics2.rti.co.id/?m_id=1&sub_m=s15&sub_sub_m=2',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded', 
      'Cookie': 'JSESSIONID=36A036189823A0A657D7ACB9D27F9079.worker1'
    },
    data : data
  };

axios(config)
.then(function (response) {

  const hasill= GetQuery(response.data),
  obj = JSON.parse(hasill),
  arr = obj[0].data,
  date = obj[0].date,
  results = arr.map(d => {
                    return {
                      Code: d.Code,
                      Name: d.Name,
                      BFreq: d.BFreq,
                      BVol: d.BVol,
                      BVal: d.BVal,
                      BAvg: d.BAvg,
                      SFreq: d.SFreq,
                      SVol: d.SVol,
                      SVal: d.SVal,
                      SAvg: d.SAvg,
                      NVol: d.NVol,
                      NVal: d.NVal,
                      CVol: d.CVol,
                      CVal: d.CVal,
                      TFreq: d.TFreq,
                      TVol: d.TVol,
                      TVal: d.TVal,
                      TAvg: d.TAvg,
                      broker_code: InputBroker,
                      date: date,
                    }
                  })

   console.log("SUCCESS Broker: "+InputBroker+" date: "+Inputdate);
  
    try {
      //Create Folder Storage
      if (!fs.existsSync("broker")) {
        fs.mkdirSync("broker");
        }

      //Create Folder Broker
      if (!fs.existsSync("broker/"+InputBroker)) {
        fs.mkdirSync("broker/"+InputBroker);
        }
      //Create File
      results.splice(-1);
      fs.writeFileSync("broker/"+InputBroker+"/"+date.replace(/ /g, "_")+'.json', JSON.stringify(results))
      //file written successfully
    } catch (err) {
      console.error(err)
    }
})
.catch(function (error) {
  console.log(error);
});
