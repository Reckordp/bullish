const handler = require("./handler")

global.set = {}
global.set.timestamp = { start: new Date }
handler.start()