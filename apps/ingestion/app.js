import r from 'rethinkdb';
import b from 'binance';

const API_KEY = process.env.BINANCE_API_KEY;
const API_SECRET = process.env.BINANCE_API_SECRET;

const DB_NAME = 'ingestion_klines';

const SYMBOLS = ['BTCBUSD-1m']

const ws = new b.WebsocketClient({
    api_key: API_KEY,
    api_secret: API_SECRET,
    beautify: true
});

let symbol_tables = [];

function logi() {
    console.info(...arguments);
}

function logl(level, ...args) {
    switch(level) {
        case 'err':
            console.error(...args);
            break;
        case 'info':
        default:
            console.info(...args);
            break;
    }
}

function logj(res) {
    var args = Array.prototype.slice.call(arguments, 1);
    console.info(JSON.stringify(res), ...args);
}

let conn;
logi('trying to connect...')

const rdb = r.db(DB_NAME);

await r.connect({host: 'db'}).then(async conn => {
    try {
        logi('checking database...');
        await r.dbList().run(conn).then(async dbs => {
            logi('dbs: ', dbs);
            if (!dbs.includes(DB_NAME)) {
                logi(`database ${DB_NAME} does not exist. Creating.`)
                await r.dbCreate(DB_NAME).run(conn).then(() => {logi('database created')});
            }
        });

        logi('checking tables...');    
        await r.db(DB_NAME).tableList().run(conn).then(existing_tables => {
            SYMBOLS.forEach(s => {
                if (!existing_tables.includes(s)) {
                    logi(`creating table ${s}`);
                    r.db(DB_NAME).tableCreate(s, {
                        primary_key: 't'
                    })
                    .run(conn);
                }
            });
        });
    }
    catch(err) {
        console.error('error setting up database', err);
    }
    logi('connected!')

    function save_kline_data(symbol, interval, kline) {
        const entry = {
            t: new Date(kline.t),
            T: new Date(kline.T),
            o: Number(kline.o),
            h: Number(kline.h),
            l: Number(kline.l),
            c: Number(kline.c),
            v: Number(kline.v),
            V: Number(kline.V),
            q: Number(kline.q),
            Q: Number(kline.Q)
        }
        rdb.table(`${symbol}-${interval}`).get(entry.t).replace(entry).run(conn).error(err => {
            logl('err', err);
        });
    }

    function handle_kline_data(symbol, kline) {
        save_kline_data(symbol, kline.i, kline);
    }

    ws.on('message', function(data) {
        try {
            if (data.e === 'kline') {
                handle_kline_data(data.s, data.k);
            }
        } catch(err) {
            console.error(err);
        }
    });

    SYMBOLS.forEach(s => {
        s = s.split('-');
        logi('subscribing to ', s);
        ws.subscribeSpotKline(s[0], s[1]);
    });
});
