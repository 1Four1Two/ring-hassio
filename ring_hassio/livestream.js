+

require("dotenv/config");
var RingApi = require("ring-client-api");
var util = require("util");
const fs = require('fs'), 
    path = require('path'),
    express = require('express')

/**
 * This example creates an hls stream which is viewable in a browser
 * It also starts web app to view the stream at http://localhost:PORT
 **/
var PORT = 3000;
if ('RING_PORT' in process.env) {
  PORT = process.env.RING_PORT;
}

async function startStream(){
    const ringApi = new RingApi.RingApi({
        // Refresh token is used when 2fa is on
        refreshToken: process.env.RING_REFRESH_TOKEN,
        debug: true
    }),
    [camera] = await ringApi.getCameras()

    if (!camera) {
      console.log('No cameras found')
      return
    }

    const app = express(),
    publicOutputDirectory = path.join('public', 'output')
    console.log('output directory: ' + publicOutputDirectory);
    app.use('/', express.static('public'))
    app.listen(PORT, () => {
        console.log(
            'Listening on port ' + PORT +  '. Go to http://localhost:' + PORT + ' in your browser'
        )
    })

    if (!(await util.promisify(fs.access)(publicOutputDirectory))) {
        console.log('Folder not found')
        await util.promisify(fs.mkdir)(publicOutputDirectory)
        console.log('Folder created')
      }
    
      const sipSession = await camera.streamVideo({
        output: [
          '-preset',
          'veryfast',
          '-g',
          '25',
          '-sc_threshold',
          '0',
          '-f',
          'hls',
          '-hls_time',
          '2',
          '-hls_list_size',
          '6',
          '-hls_flags',
          'delete_segments',
          path.join(publicOutputDirectory, 'stream.m3u8'),
        ],
      })
    
      sipSession.onCallEnded.subscribe(() => {
        console.log('Call has ended')
        process.exit()
      })
    
      setTimeout(function () {
        console.log('Stopping call...')
        sipSession.stop()
      }, 5 * 60 * 1000) // Stop after 5 minutes.
}


if (!('RING_REFRESH_TOKEN' in process.env)) {
  console.log('Missing environment variables. Check RING_REFRESH_TOKEN');
  process.exit();
}
else {
  startStream();
}
