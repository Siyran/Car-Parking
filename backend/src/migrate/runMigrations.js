import fs from 'fs';
import path from 'path';
import db from '../db.js';

(async function run(){
  try{
    const migrationsDir = path.join(process.cwd(), 'src', 'migrate');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    for(const f of files){
      const sql = fs.readFileSync(path.join(migrationsDir, f), 'utf8');
      console.log('Running', f);
      await db.query(sql);
    }
    console.log('Migrations complete');
    process.exit(0);
  } catch(err){
    console.error('Migration error', err);
    process.exit(1);
  }
})();
