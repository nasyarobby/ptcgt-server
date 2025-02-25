import WebSocket from 'ws';



(async () => {
  console.log('Waiting 3 seconds.')

  await new Promise(res => setTimeout(res,3000))

  const ws = new WebSocket('ws://localhost:8080');

  ws.on('error', console.error);

  ws.on('open', function open() {
    console.log('connected')
    ws.send(JSON.stringify({cmd: 'auth'}))
  });

  ws.on('message', (data) => {
    console.log(data.toString())
  })
})()