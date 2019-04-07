const crowler = require('./crowler')
const importer = require('./importer')

async function main(){
    await crowler.imdb_crowler()
    await importer.insert_json_to_db()
}
main()
