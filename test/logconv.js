const assert  = require('assert');

const logconv = require('../');

function init_paipu(qijia = 0) {
    return {
        title:  '',
        player: ['','','',''],
        qijia:  qijia,
        log:    [],
        defen:  [25000,25000,25000,25000],
        rank:   [],
        point:  []
    };
}
function qipai(param = {}) {
    let rv = {
        zhuangfeng: 0,
        jushu:      0,
        changbang:  0,
        lizhibang:  0,
        defen:      [0,0,0,0],
        baopai:     '',
        shoupai:    ['','','','']
    };
    return { qipai: Object.assign(rv, param) };
}
function add_log(paipu, log_idx, ...log) {
    paipu.log[log_idx] = [];
    if (! log[0].qipai) paipu.log[log_idx].push(qipai());
    for (let data of log) {
        paipu.log[log_idx].push(data);
    }
    return paipu;
}

suite('logconv()', ()=>{
    test('モジュールが存在すること', ()=>assert.ok(logconv));

    suite('title:', ()=>{
        test('空文字列', ()=>{
            assert.deepEqual(logconv(init_paipu()).title, ['','']);
        });
        test('1行', ()=>{
            let paipu = init_paipu();
            paipu.title = '対局名';
            assert.deepEqual(logconv(paipu).title, ['対局名','']);
        });
        test('2行', ()=>{
            let paipu = init_paipu();
            paipu.title = '対局名\nサブタイトル';
            assert.deepEqual(logconv(paipu).title, ['対局名','サブタイトル']);
        });
        test('3行(3行目は捨てる)', ()=>{
            let paipu = init_paipu();
            paipu.title = '対局名\nサブタイトル\n3行目';
            assert.deepEqual(logconv(paipu).title, ['対局名','サブタイトル']);
        });
    });

    suite('name:', ()=>{
        test('空文字列', ()=>{
            assert.deepEqual(logconv(init_paipu()).name, ['','','','']);
        });
        test('改行なし', ()=>{
            let paipu = init_paipu();
            paipu.player = ['東家','南家','西家','北家']
            assert.deepEqual(logconv(paipu).name, ['東家','南家','西家','北家']);
        });
        test('改行あり(2行目は捨てる)', ()=>{
            let paipu = init_paipu();
            paipu.player
                = ['東家\n(天鳳位)','南家\n(十段)','西家\n(九段)','北家\n(八段)']
            assert.deepEqual(logconv(paipu).name, ['東家','南家','西家','北家']);
        });
        test('起家は仮南', ()=>{
            let paipu = init_paipu(1);
            paipu.player = ['東家','南家','西家','北家']
            assert.deepEqual(logconv(paipu).name, ['南家','西家','北家','東家']);
        });
    });

    suite('rule:', ()=>{
        test('指定なし', ()=>{
            assert.deepEqual(logconv(init_paipu()).rule,
                                            { disp:'電脳麻将', aka: 1 });
        });
        test('指定あり', ()=>{
            let rule = { disp:'東風戦', aka: 0 };
            assert.deepEqual(logconv(init_paipu(), 0, rule).rule, rule);
        });
    });

    suite('配牌', ()=>{
        test('東一局0本場(供託: 0)', ()=>{
            let paipu = add_log(init_paipu(), 0, qipai());
            assert.deepEqual(logconv(paipu).log[0][0], [0,0,0]);
        });
        test('南四局1本場(供託: 2)', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                qipai({ zhuangfeng: 1, jushu: 3,
                                        changbang: 1, lizhibang: 2 }));
            assert.deepEqual(logconv(paipu).log[0][0], [7,1,2]);
        });
        test('東一局: 持ち点', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                qipai({ defen: [10000, 20000, 30000, 40000] }));
            assert.deepEqual(logconv(paipu).log[0][1],
                                                [10000, 20000, 30000, 40000]);
        });
        test('南二局: 持ち点', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                qipai({ zhuangfeng: 1, jushu: 1,
                                        defen: [10000, 20000, 30000, 40000] }));
            assert.deepEqual(logconv(paipu).log[0][1],
                                                [40000, 10000, 20000, 30000]);
        });
        test('ドラ: 一萬', ()=>{
            let paipu = add_log(init_paipu(), 0, qipai({ baopai: 'm1' }));
            assert.deepEqual(logconv(paipu).log[0][2], [ 11 ]);
        });
        test('ドラ: 赤五筒', ()=>{
            let paipu = add_log(init_paipu(), 0, qipai({ baopai: 'p0' }));
            assert.deepEqual(logconv(paipu).log[0][2], [ 52 ]);
        });
        test('東一局: 配牌', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    qipai({ shoupai: ['z1234m123p406s789',
                                                      '','',''] }));
            assert.deepEqual(logconv(paipu).log[0][4],
                        [ 41, 42, 43, 44, 11, 12, 13, 24, 52, 26, 37, 38, 39]);
        });
        test('南二局: 配牌', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    qipai({ zhuangfeng: 1, jushu: 1,
                                            shoupai: ['z1234m123p406s789',
                                                      '','',''] }));
            assert.deepEqual(logconv(paipu).log[0][7],
                        [ 41, 42, 43, 44, 11, 12, 13, 24, 52, 26, 37, 38, 39]);
        });
    });

    suite('ツモ', ()=>{
        test('東家: 一萬', ()=>{
            let paipu = add_log(init_paipu(), 0, { zimo: { l: 0, p: 'm1' } });
            assert.deepEqual(logconv(paipu).log[0][5], [ 11 ]);
        });
        test('南家: 九筒', ()=>{
            let paipu = add_log(init_paipu(), 0, { zimo: { l: 1, p: 'p9' } });
            assert.deepEqual(logconv(paipu).log[0][8], [ 29 ]);
        });
        test('西家: 赤五索', ()=>{
            let paipu = add_log(init_paipu(), 0, { zimo: { l: 2, p: 's0' } });
            assert.deepEqual(logconv(paipu).log[0][11], [ 53 ]);
        });
        test('北家: 白', ()=>{
            let paipu = add_log(init_paipu(), 0, { zimo: { l: 3, p: 'z5' } });
            assert.deepEqual(logconv(paipu).log[0][14], [ 45 ]);
        });
        test('南二局', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    qipai({zhuangfeng: 1, jushu: 1 }),
                                    { zimo: { l: 0, p: 'm1' } });
            assert.deepEqual(logconv(paipu).log[0][8], [ 11 ]);
        });
    });

    suite('打牌', ()=>{
        test('東家: 赤五萬', ()=>{
            let paipu = add_log(init_paipu(), 0, { dapai: { l: 0, p: 'm0' } });
            assert.deepEqual(logconv(paipu).log[0][6], [ 51 ]);
        });
        test('南家: 八筒ツモ切り', ()=>{
            let paipu = add_log(init_paipu(), 0, { dapai: { l: 1, p: 'p8_' } });
            assert.deepEqual(logconv(paipu).log[0][9], [ 60 ]);
        });
        test('西家: 二索切りリーチ', ()=>{
            let paipu = add_log(init_paipu(), 0, { dapai: { l: 2, p: 's2*' } });
            assert.deepEqual(logconv(paipu).log[0][12], [ 'r32' ]);
        });
        test('北家: 中ツモ切りリーチ', ()=>{
            let paipu = add_log(init_paipu(), 0, { dapai: { l: 3, p: 'z7_*' } });
            assert.deepEqual(logconv(paipu).log[0][15], [ 'r60' ]);
        });
        test('南二局', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    qipai({zhuangfeng: 1, jushu: 1 }),
                                    { dapai: { l: 0, p: 'm0' } });
            assert.deepEqual(logconv(paipu).log[0][9], [ 51 ]);
        });
    });

    suite('副露', ()=>{
        test('東家: 三萬を辺張でチー', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { fulou: { l: 0, m: 'm123-' } });
            assert.deepEqual(logconv(paipu).log[0][5], [ 'c131112' ]);
        });
        test('南家: 赤五筒を上家からポン', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { fulou: { l: 1, m: 'p550-' } });
            assert.deepEqual(logconv(paipu).log[0][8], [ 'p522525' ]);
        });
        test('西家: 五索を対面からポン', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { fulou: { l: 2, m: 's505=' } });
            assert.deepEqual(logconv(paipu).log[0][11], [ '35p3553' ]);
        });
        test('北家: 北を下家からポン', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { fulou: { l: 3, m: 'z444+' } });
            assert.deepEqual(logconv(paipu).log[0][14], [ '4444p44' ]);
        });
        test('東家: 赤後索を上家から大明槓', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { fulou: { l: 0, m: 's5550-' } });
            assert.deepEqual(logconv(paipu).log[0][5], [ 'm53353535' ]);
            assert.deepEqual(logconv(paipu).log[0][6], [ 0 ]);
        });
        test('南家: 赤五索を対面から大明槓', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { fulou: { l: 1, m: 's5550=' } });
            assert.deepEqual(logconv(paipu).log[0][8], [ '35m533535' ]);
            assert.deepEqual(logconv(paipu).log[0][9], [ 0 ]);
        });
        test('西家: 赤五索を下家から大明槓', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { fulou: { l: 2, m: 's5550+' } });
            assert.deepEqual(logconv(paipu).log[0][11], [ '353535m53' ]);
            assert.deepEqual(logconv(paipu).log[0][12], [ 0 ]);
        });
        test('北家: 五索を対面から大明槓', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { fulou: { l: 3, m: 's5505=' } });
            assert.deepEqual(logconv(paipu).log[0][14], [ '35m353553' ]);
            assert.deepEqual(logconv(paipu).log[0][15], [ 0 ]);
        });
        test('南二局', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    qipai({zhuangfeng: 1, jushu: 1 }),
                                    { fulou: { l: 0, m: 's5550-' } });
            assert.deepEqual(logconv(paipu).log[0][8], [ 'm53353535' ]);
            assert.deepEqual(logconv(paipu).log[0][9], [ 0 ]);
        });
    });

    suite('カン', ()=>{
        test('東家: 五萬を暗槓', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { gang: { l: 0, m: 'm5550' } });
            assert.deepEqual(logconv(paipu).log[0][6], [ '151515a51' ]);
        });
        test('南家: 上家からポンした五萬に赤五萬を加槓', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { gang: { l: 1, m: 'm555-0' } });
            assert.deepEqual(logconv(paipu).log[0][9], [ 'k51151515' ]);
        });
        test('西家: 対面からポンした五萬に赤五萬を加槓', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { gang: { l: 2, m: 'm555=0' } });
            assert.deepEqual(logconv(paipu).log[0][12], [ '15k511515' ]);
        });
        test('北家: 下家からポンした五萬に赤五萬を加槓', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { gang: { l: 3, m: 'm555+0' } });
            assert.deepEqual(logconv(paipu).log[0][15], [ '1515k5115' ]);
        });
        test('南二局', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    qipai({zhuangfeng: 1, jushu: 1 }),
                                    { gang: { l: 0, m: 'm5550' } });
            assert.deepEqual(logconv(paipu).log[0][9], [ '151515a51' ]);
        });
    });

    suite('カンヅモ', ()=>{
        test('東家: 三萬をカンヅモ', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { gangzimo: { l: 0, p: 'm3' } });
            assert.deepEqual(logconv(paipu).log[0][5], [ 13 ]);
        });
        test('南家: 三筒をカンヅモ', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { gangzimo: { l: 1, p: 'p3' } });
            assert.deepEqual(logconv(paipu).log[0][8], [ 23 ]);
        });
        test('西家: 三索をカンヅモ', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { gangzimo: { l: 2, p: 's3' } });
            assert.deepEqual(logconv(paipu).log[0][11], [ 33 ]);
        });
        test('北家: 西をカンヅモ', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    { gangzimo: { l: 3, p: 'z3' } });
            assert.deepEqual(logconv(paipu).log[0][14], [ 43 ]);
        });
        test('南二局', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                    qipai({zhuangfeng: 1, jushu: 1 }),
                                    { gangzimo: { l: 0, p: 'm3' } });
            assert.deepEqual(logconv(paipu).log[0][8], [ 13 ]);
        });
    });

    suite('開槓', ()=>{
        test('カンドラは四筒', ()=>{
            let paipu = add_log(init_paipu(), 0, qipai({ baopai: 's1' }),
                                            { kaigang: { baopai: 'p4' } });
            assert.deepEqual(logconv(paipu).log[0][2], [ 31, 24 ]);
        });
    });

    suite('和了', ()=>{
        test('ロン(子): 30符1翻 1000点', ()=>{
            let paipu = add_log(init_paipu(), 0, { hule: {
                                    l: 1, shoupai: '', baojia: 2,
                                    fu: 30, fanshu: 1, defen: 1000,
                                    hupai: [ { name: '平和', fanshu: 1 } ],
                                    fenpei: [ 0, 1000, -1000, 0 ]
                                } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '和了', [ 0, 1000, -1000, 0 ],
                                      [ 1, 2, 0, '30符1飜1000点',
                                        '平和(1飜)' ] ]);
        });
        test('ロン(親): 役満 48000点', ()=>{
            let paipu = add_log(init_paipu(), 0, { hule: {
                                    l: 0, shoupai: '', baojia: 3,
                                    damanguan: 1, defen: 48000,
                                    hupai: [ { name: '大三元', fanshu: '*' } ],
                                    fenpei: [ 48000, 0, 0, -48000 ]
                                } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '和了', [ 48000, 0, 0, -48000 ],
                                      [ 0, 3, 0, '役満48000点',
                                        '大三元(役満)' ] ]);
        });
        test('ツモ(子): 30符4翻 2000/3900点', ()=>{
            let paipu = add_log(init_paipu(), 0, { hule: {
                                    l: 1, shoupai: '', baojia: null,
                                    fu: 30, fanshu: 4, defen: 7900,
                                    hupai: [ { name: '立直', fanshu: 1 },
                                             { name: '門前清自摸和', fanshu: 1},
                                             { name: '一気通貫', fanshu: 2 } ],
                                    fenpei: [ -3900, 7900, -2000, -2000 ]
                                } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '和了', [ -3900, 7900, -2000, -2000 ],
                                      [ 1, 1, 0, '30符4飜2000-3900点',
                                        '立直(1飜)','門前清自摸和(1飜)',
                                        '一気通貫(2飜)' ] ]);
        });
        test('ツモ(親): 30符4翻 3900点オール', ()=>{
            let paipu = add_log(init_paipu(), 0, { hule: {
                                    l: 0, shoupai: '', baojia: null,
                                    fu: 30, fanshu: 4, defen: 11700,
                                    hupai: [ { name: '立直', fanshu: 1 },
                                             { name: '門前清自摸和', fanshu: 1},
                                             { name: '一気通貫', fanshu: 2 } ],
                                    fenpei: [ 11700, -3900, -3900, -3900 ]
                                } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '和了', [ 11700, -3900, -3900, -3900 ],
                                      [ 0, 0, 0, '30符4飜3900点∀',
                                        '立直(1飜)','門前清自摸和(1飜)',
                                        '一気通貫(2飜)' ] ]);
        });
        test('和了役: ダブル立直', ()=>{
            let paipu = add_log(init_paipu(), 0, { hule: {
                                    l: 1, shoupai: '', baojia: 2,
                                    fu: 40, fanshu: 2, defen: 2600,
                                    hupai: [ { name: 'ダブル立直', fanshu: 2 } ],
                                    fenpei: [ 0, 2600, -2600, 0 ]
                                } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '和了', [ 0, 2600, -2600, 0 ],
                                      [ 1, 2, 0, '40符2飜2600点',
                                        '両立直(2飜)' ] ]);
        });
        test('和了役: 翻牌', ()=>{
            let paipu = add_log(init_paipu(), 0, { hule: {
                                    l: 2, shoupai: '', baojia: 3,
                                    fu: 30, fanshu: 1, defen: 1000,
                                    hupai: [ { name: '翻牌 發', fanshu: 1 } ],
                                    fenpei: [ 0, 0, 1000, -1000 ]
                                } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '和了', [ 0, 0, 1000, -1000 ],
                                      [ 2, 3, 0, '30符1飜1000点',
                                        '役牌 發(1飜)' ] ]);
        });
        test('和了役: 国士無双十三面', ()=>{
            let paipu = add_log(init_paipu(), 0, { hule: {
                                    l: 3, shoupai: '', baojia: 0,
                                    damanguan: 1, defen: 36000,
                                    hupai: [ { name: '国士無双十三面',
                                               fanshu: '*' } ],
                                    fenpei: [ -36000, 0, 0, 36000 ]
                                } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '和了', [ -36000, 0, 0, 36000 ],
                                      [ 3, 0, 0, '役満36000点',
                                        '国士無双１３面(役満)' ] ]);
        });
        test('満貫(子ロン)', ()=>{
            let paipu = add_log(init_paipu(), 0, { hule: {
                                    l: 1, shoupai: '', baojia: 2,
                                    fu: 40, fanshu: 4, defen: 8000,
                                    hupai: [ { name: '立直', fanshu: 1 },
                                             { name: 'ドラ', fanshu: 3 } ],
                                    fenpei: [ 0, 8000, -8000, 0 ]
                                } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '和了', [ 0, 8000, -8000, 0 ],
                                      [ 1, 2, 0, '満貫8000点',
                                        '立直(1飜)','ドラ(3飜)' ] ]);
        });
        test('跳満(子ツモ)', ()=>{
            let paipu = add_log(init_paipu(), 0, { hule: {
                                    l: 2, shoupai: '', baojia: null,
                                    fu: 25, fanshu: 6, defen: 12000,
                                    hupai: [ { name: '立直', fanshu: 1 },
                                             { name: '門前清自摸和', fanshu: 1 },
                                             { name: '七対子', fanshu: 2 },
                                             { name: 'ドラ', fanshu: 2 } ],
                                    fenpei: [ -6000, -3000, 12000, -3000 ]
                                } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '和了', [ -6000, -3000, 12000, -3000 ],
                                      [ 2, 2, 0, '跳満3000-6000点',
                                        '立直(1飜)','門前清自摸和(1飜)',
                                        '七対子(2飜)','ドラ(2飜)' ] ]);
        });
        test('倍満(親ロン)', ()=>{
            let paipu = add_log(init_paipu(), 0, { hule: {
                                    l: 0, shoupai: '', baojia: 3,
                                    fu: 40, fanshu: 8, defen: 24000,
                                    hupai: [ { name: '立直', fanshu: 1 },
                                             { name: '清一色', fanshu: 6 },
                                             { name: 'ドラ', fanshu: 1 } ],
                                    fenpei: [ 24000, 0, 0, -24000 ]
                                } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '和了', [ 24000, 0, 0, -24000 ],
                                      [ 0, 3, 0, '倍満24000点',
                                        '立直(1飜)','清一色(6飜)','ドラ(1飜)' ] ]);
        });
        test('三倍満(親ツモ)', ()=>{
            let paipu = add_log(init_paipu(), 0, { hule: {
                                    l: 0, shoupai: '', baojia: null,
                                    fu: 30, fanshu: 11, defen: 36000,
                                    hupai: [ { name: '門前清自摸和', fanshu: 1 },
                                             { name: '平和', fanshu: 1 },
                                             { name: '二盃口', fanshu: 3 },
                                             { name: '清一色', fanshu: 6 } ],
                                    fenpei: [ 36000, -12000, -12000, -12000 ]
                                } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '和了', [ 36000, -12000, -12000, -12000 ],
                                      [ 0, 0, 0, '三倍満12000点∀',
                                        '門前清自摸和(1飜)','平和(1飜)',
                                        '二盃口(3飜)','清一色(6飜)' ] ]);
        });
        test('裏ドラ', ()=>{
            let paipu = add_log(init_paipu(), 0, { hule: {
                                    l: 0, shoupai: '', baojia: 3,
                                    fubaopai: [ 's7' ],
                                    fu: 40, fanshu: 2, defen: 29000,
                                    hupai: [ { name: '立直', fanshu: 1 },
                                             { name: '裏ドラ', fanshu: 1 } ],
                                    fenpei: [ 2900, 0, 0, -2900 ]
                                } });
            assert.deepEqual(logconv(paipu).log[0][3], [ 37 ]);
        });
        test('南二局', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                qipai({zhuangfeng: 1, jushu: 1 }),
                                { hule: {
                                    l: 1, shoupai: '', baojia: 2,
                                    fu: 30, fanshu: 1, defen: 1000,
                                    hupai: [ { name: '平和', fanshu: 1 } ],
                                    fenpei: [ 0, 1000, -1000, 0 ]
                                } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '和了', [ 0, 0, 1000, -1000 ],
                                      [ 2, 3, 0, '30符1飜1000点',
                                        '平和(1飜)' ] ]);
        });
    });
    suite('流局', ()=>{
        test('流局', ()=>{
            let paipu = add_log(init_paipu(), 0, { pingju: {
                                    name: '流局',
                                    fenpei: [ 3000, -1000, -1000, -1000 ] } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '流局', [ 3000, -1000, -1000, -1000 ] ]);
        });
        test('荒牌平局', ()=>{
            let paipu = add_log(init_paipu(), 0, { pingju: {
                                    name: '荒牌平局',
                                    fenpei: [ 3000, -1000, -1000, -1000 ] } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '流局', [ 3000, -1000, -1000, -1000 ] ]);
        });
        test('流し満貫', ()=>{
            let paipu = add_log(init_paipu(), 0, { pingju: {
                                    name: '流し満貫',
                                    fenpei: [ -4000, 8000, -2000, -2000 ] } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '流し満貫',
                                      [ -4000, 8000, -2000, -2000 ] ]);
        });
        test('九種九牌', ()=>{
            let paipu = add_log(init_paipu(), 0, { pingju: {
                                    name: '九種九牌', fenpei: [0, 0, 0, 0] } });
            assert.deepEqual(logconv(paipu).log[0][16], [ '九種九牌' ]);
        });
        test('四風連打', ()=>{
            let paipu = add_log(init_paipu(), 0, { pingju: {
                                    name: '四風連打', fenpei: [0, 0, 0, 0] } });
            assert.deepEqual(logconv(paipu).log[0][16], [ '四風連打' ]);
        });
        test('四家立直', ()=>{
            let paipu = add_log(init_paipu(), 0, { pingju: {
                                    name: '四家立直', fenpei: [0, 0, 0, 0] } });
            assert.deepEqual(logconv(paipu).log[0][16], [ '四家立直' ]);
        });
        test('四開槓', ()=>{
            let paipu = add_log(init_paipu(), 0, { pingju: {
                                    name: '四開槓', fenpei: [0, 0, 0, 0] } });
            assert.deepEqual(logconv(paipu).log[0][16], [ '四槓散了' ]);
        });
        test('三家和', ()=>{
            let paipu = add_log(init_paipu(), 0, { pingju: {
                                    name: '三家和', fenpei: [0, 0, 0, 0] } });
            assert.deepEqual(logconv(paipu).log[0][16], [ '三家和了' ]);
        });
        test('南二局', ()=>{
            let paipu = add_log(init_paipu(), 0,
                                qipai({zhuangfeng: 1, jushu: 1 }),
                                { pingju: {
                                    name: '流局',
                                    fenpei: [ 3000, -1000, -1000, -1000 ] } });
            assert.deepEqual(logconv(paipu).log[0][16],
                                    [ '流局', [ -1000, 3000, -1000, -1000 ] ]);
        });
    });

    suite('異常系', ()=>{
        test('不正な摸打情報', ()=>{
            let paipu = add_log(init_paipu(), 0, { error: {} });
            assert.ok(logconv(paipu));
        })
    });

    suite('対象局を指定', ()=>{
        test('2局目', ()=>{
            let paipu = init_paipu();
            paipu = add_log(paipu, 0, qipai({ zhuangfeng: 0, jushu: 0 }));
            paipu = add_log(paipu, 1, qipai({ zhuangfeng: 0, jushu: 1 }));
            assert.deepEqual(logconv(paipu).log[0][0], [0,0,0]);
            assert.deepEqual(logconv(paipu, 1).log[0][0], [1,0,0]);
        });
    });
});
