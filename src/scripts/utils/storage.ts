import ext from './ext'

export default ext.storage.sync ? ext.storage.sync : ext.storage.local
