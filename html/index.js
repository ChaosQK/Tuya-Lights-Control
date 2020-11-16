const TuyaAPI = new require('tuyapi');
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res, next){
  res.render('./public/index.html');
});

const server = app.listen(8333)

const socketServer = require('socket.io').listen(server);

const device = new TuyaAPI({
  ip: '192.168.5.78',
  id: '0006852398f4abd2624e',
  key: '079c4c07d178f1eb',
  productKey: 'oer8r2g6rpehj6h4',
  version: 3.3});

const device1 = new TuyaAPI({
  ip: '192.168.5.95',
  id: '0006852398f4abd262fe',
  key: '9158ea614e3d9840',
  productKey: 'oer8r2g6rpehj6h4',
  version: 3.3});

const device2 = new TuyaAPI({
  ip: '192.168.5.56',
  id: '0006852398f4abd26180',
  key: 'd24f30b221defd59',
  productKey: 'oer8r2g6rpehj6h4',
  version: 3.3});

device.find().then(() => {
  device.connect();
});

device1.find().then(() => {
  device1.connect();
});

device2.find().then(() => {
  device2.connect();
});

// Add event listeners
device.on('connected', () => {
    console.log('Connected to device!');
});
device1.on('connected', () => {
  console.log('Connected to device1!');
});
device2.on('connected', () => {
  console.log('Connected to device2!');
});

/*device.on('disconnected', () => {
  console.log('Disconnected from device.');
});

device.on('error', error => {
  console.log('Error!', error);
});
*/

device.on('data', data => {
    console.log(data);
    socketServer.sockets.emit('broadcast', data.dps);
});

var connectSocket = null;

socketServer.on("connection", socket => {
    //device.set({dps: 21, set: 'colour'});
    connectSocket = socket;
    device.get({schema: true}).then(data => socket.emit('broadcast', data.dps));


    socket.on("message", data => {
		//io.sockets.emit('message-to-all', data);
        console.log(data);
		//socket.emit('broadcast', data);
		if(data.data === 'color')
        {
            changeColor(data);
        }
		else if(data.data === 'onoff')
        {
            device.set({dps: 20, set: data['20']});
            device1.set({dps: 20, set: data['20']});
		    device2.set({dps: 20, set: data['20']});
            device.get({schema: true}).then(data => socket.emit('broadcast', data.dps));
        }
		else if(data.data === 'colortype')
        {
            changeColorType(data);
            device.get({dps: 24}).then(data => socket.emit('broadcast', {'24': data}));
        }
		//device.set({multiple: true, data: data});
        //device1.set({multiple: true, data: data});
		//device2.set({multiple: true, data: data});

		/*device.set({dps: 20, set: data['onoff']});
		device1.set({dps: 20, set: data['onoff']})
		device2.set({dps: 20, set: data['onoff']})*/
		//console.log(data)
	});


});

function changeColor(data)
{
  setTimeout(function () {
    //device.set({dps: 21, set: 'colour'});
    device.set({dps: 28, set: data['28']});

    //device1.set({dps: 21, set: 'colour'});
    device1.set({dps: 28, set: data['28']});

    //device2.set({dps: 21, set: 'colour'});
    device2.set({dps: 28, set: data['28']});
    setTimeout(function () {
      device.set({dps: 24, set: data['24']});
      device1.set({dps: 24, set: data['24']});
      device2.set({dps: 24, set: data['24']});
    }, 3000);
  }, 1000);
}

function changeColorType(data)
{
    device.set({multiple: true, data:{'21': data['21'], '23': 400}});
    device1.set({multiple: true, data:{'21': data['21'], '23': 400}});
    device2.set({multiple: true, data:{'21': data['21'], '23': 400}});
}

// Disconnect after 10 seconds
//setTimeout(() => { device.disconnect(); }, 10000);
