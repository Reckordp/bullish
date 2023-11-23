const { makeWASocket, useMultiFileAuthState } = require("baileys")
const pino = require('pino')

let maker = async () => {
    library = {}
    library.mfas = async function useMultiFileAuthState(folder) {

        const writeData = (data, file) => {
            return promises.writeFile(join(folder, fixFileName(file)), JSON.stringify(data, JSONreplacer))
        }

        const readData = async (file) => {
            try {
                const data = await promises.readFile(join(folder, fixFileName(file)), { encoding: 'utf-8' })
                return JSON.parse(data, BufferJSON.reviver)
            } catch (error) {
                return null
            }
        }

        const removeData = async (file) => {
            try {
                await promises.unlink(fixFileName(file))
            } catch {

            }
        }

        const folderInfo = await promises.stat(folder).catch(() => { })
        if (folderInfo) {
            if (!folderInfo.isDirectory()) {
                throw new Error(`found something that is not a directory at ${folder}, either delete it or specify a different location`)
            }
        } else {
            await promises.mkdir(folder, { recursive: true })
        }

        const creds = await readData('creds.json') || initAuthCreds()

        return {
            state: {
                creds,
                keys: {
                    // @ts-ignore
                    get: async (type, ids) => {
                        const data = {}
                        await Promise.all(
                            ids.map(
                                async id => {
                                    let value = await readData(`${type}-${id}.json`)
                                    if (type === 'app-state-sync-key') {
                                        value = proto.AppStateSyncKeyData.fromObject(value)
                                    }

                                    data[id] = value
                                }
                            )
                        )

                        return data
                    },
                    set: async (data) => {
                        const tasks = []
                        for (const category in data) {
                            for (const id in data[category]) {
                                const value = data[category][id]
                                const file = `${category}-${id}.json`
                                tasks.push(value ? writeData(value, file) : removeData(file))
                            }
                        }

                        await Promise.all(tasks)
                    }
                }
            },
            saveCreds: () => {
                return writeData(creds, 'creds.json')
            }
        }
    }

    if (useMultiFileAuthState) {
        library.mfas = useMultiFileAuthState
    }

    const { state, saveState, saveCreds } = await library.mfas("sessions")
    const connectionOptions = {
        printQRInTerminal: true,
        auth: state, 
        logger: pino({level: 'silent'}),
        getMessage: async (key) => (console.log(key)), 
        patchMessageBeforeSending: (message) => {
            console.log(message)
            return message
        }
    }

    let conn = makeWASocket(connectionOptions)
    conn.creds = saveCreds
    return conn
}

module.exports = maker