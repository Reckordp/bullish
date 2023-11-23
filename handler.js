const chalk = require('chalk')
const wamaker = require("./wamaker")
const { DisconnectReason } = require('baileys')
const WebSocket = require('ws')
// const { Low, JSONFile } = require()

let mula = true
let badan = {}

async function connectionUpdate(update) {
    // console.log(update)
    const { receivedPendingNotifications, connection, lastDisconnect, isOnline, isNewLogin } = update
    if (isNewLogin) conn.isInit = true
    if (connection == 'connecting') console.log(chalk.redBright('⚡ Activate the Bot, please wait a moment...'))
    if (connection == 'open') console.log(chalk.green('✅ Connected'))
    if (isOnline == true) console.log(chalk.green('Status Online'))
    if (isOnline == false) console.log(chalk.red('Status Offline'))
    if (receivedPendingNotifications) console.log(chalk.yellow('Waiting New Messages'))
    if (connection == 'close') console.log(chalk.red('⏱️ Connection stopped and tried to reconnect...'))
    global.set.timestamp.connect = new Date
    if (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut && conn.ws.readyState !== WebSocket.CONNECTING) {
        console.log(lastDisconnect.error.output.statusCode)
        badan.restart(true)
    } 
}

async function participantsUpdate(update) {
    let { id, participants, action } = update
    if (mula) return
    // code
}

async function groupsUpdate(update) {
    if (mula) return
    // code
}

async function onDelete(update) {
    let { remoteJid, fromMe, id, participant } = update
    if (mula) return 
    // code
}

async function onCall(json){
    if (mula) return 
    let [data] = json
    let { from, isGroup, isVideo, date, status } = data
}

async function pesanDatang(chatUpdate) {
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    console.log(m)
}

badan.restart = async (reload=false) => {
    if (reload) {
        try { conn.ws.close() } catch { }
        global.conn = {
            ...global.conn, ...(await wamaker())
        }
    }
    if (!mula) {
        conn.ev.off('messages.upsert', pesanDatang)
        conn.ev.off('group-participants.update', participantsUpdate)
        conn.ev.off('groups.update', groupsUpdate)
        conn.ev.off('message.delete', onDelete)
        conn.ev.off('CB:call', onCall)
        conn.ev.off('connection.update', connectionUpdate)
        conn.ev.off('creds.update', conn.creds)
    }
    pesanDatang.bind(conn)
    // conn.ev.on('messages.upsert', pesanDatang)
    conn.ev.on('messages.upsert', pesanDatang)
    conn.ev.on('group-participants.update', participantsUpdate)
    conn.ev.on('groups.update', groupsUpdate)
    conn.ev.on('message.delete', onDelete)
    conn.ev.on('CB:call', onCall)
    conn.ev.on('connection.update', connectionUpdate)
    conn.ev.on('creds.update', conn.creds)
    mula = false
}
badan.start = async function start() {
    // global.db = new JSONFile()
    global.conn = await wamaker()
    // conn.sendMessage("")
    badan.restart()
    console.log(conn.user)
}

module.exports = badan