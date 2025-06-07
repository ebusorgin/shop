import { Database } from './db.pool';
import { AuthController } from './auth.controller';
import { SocketServer } from './socket';

async function main() {
  const db = new Database();
  await db.init();

  const controller = new AuthController(db);
  new SocketServer(controller);
}

main();
