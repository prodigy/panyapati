import path from 'path';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import r from 'rethinkdb';
import { Subject } from 'rxjs';
import { setTimeout } from 'timers/promises';

const app = express();
const httpServer = createServer(app);

const port = 80;
const app_path = process.env.APP_DIR;

const tickSubject = new Subject();

await setTimeout(2000, '');

app.use(express.static(path.join(app_path, 'public')));

const past_data = [];

var io = new Server(httpServer);
io.on('connection', function (s) {
  past_data.slice().reverse().forEach(e => s.emit('candle', e));
  tickSubject.subscribe({
    next: (data) => {
      s.emit('candle', data);
    }
  });
});

function applyChange(change) {
  // see https://github.com/rethinkdb/horizon/blob/next/client/src/ast.js applyChange()
  switch (change.type) {
    case 'initial':
    case 'add':
      past_data.splice(change.new_offset, 0, change)
      break;
    case 'change':
      if (change.old_offset != null) {
        past_data.splice(change.old_offset, 1)
      }
      if (change.new_offset != null) {
        past_data.splice(change.new_offset, 0, change)
      }
      break;
  }
  if (past_data.length > 60) {
    past_data = past_data.splice(past_data.length - 60, pas)
  }
}

r.connect('db').then(conn => {
  const queryStart = new Date();
  queryStart.setHours(queryStart.getHours() - 1);
  r.db('ingestion_klines').table('BTCBUSD-1m').orderBy({ index: r.desc('t') }).limit(60).changes({ includeInitial: true, includeOffsets: true, includeTypes: true }).run(conn).then(data => {
    data.each((err, change) => {
      tickSubject.next(change);
      applyChange(change);
    });
  })
})

httpServer.listen(port);
