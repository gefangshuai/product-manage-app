import Datastore from 'nedb'
import path from 'path'
import {remote} from 'electron'

const dbFile = process.env.NODE_ENV !== 'production' ? '/Users/gefangshuai/Documents/Dev/myspace/projects/ProductManageApp/data.json' : path.join(remote.app.getPath('userData'), '/data.db')
console.log('dbFile', dbFile)
export default new Datastore({
    autoload: true,
    filename: dbFile
})