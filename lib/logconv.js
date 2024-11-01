/*!
 *  @kobalab/tenhou-url-log v0.9.0
 *
 *  Copyright(C) 2024 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/tenhou-url-log/blob/master/LICENSE
 */
"use strict";

function pai(p) {
    let rv = p[2] == '_' ? 60
           : p[1] == '0' ? + ('5' + { m:'1', p:'2', s:'3' }[p[0]])
           : + ({ m:'1', p:'2', s:'3', z:'4' }[p[0]] + p[1]);
    if (p.slice(-1) == '*') rv = 'r' + rv;
    return rv;
}

function qipai(paistr) {
    let rv = [];
    for (let suitstr of paistr.match(/[mpsz]\d+/g) || []) {
        let s = suitstr[0];
        for (let n of suitstr.match(/\d/g)) {
            rv.push(pai(s+n));
        }
    }
    return rv;
}

function mianzi(m) {
    let h = m.replace(/0/,'5');
    let s = m[0];
    let d = m.match(/[\+\=\-]/);
    if (h.match(/^[mpsz](\d)\1\1\1$/)) {
        let nn = m.match(/\d/g);
        return '' + pai(s+nn[0]) + pai(s+nn[1]) + pai(s+nn[2])
                  + 'a' + pai(s+nn[3]);
    }
    else if (h.match(/^[mpsz](\d)\1\1\1[\+\=\-]$/)) {
        let nn = m.match(/\d/g);
        return d == '-' ?      'm' + pai(s+nn[3]) + pai(s+nn[0]) + pai(s+nn[1])
                             + pai(s+nn[2])
             : d == '=' ? '' + pai(s+nn[0]) + 'm' + pai(s+nn[3]) + pai(s+nn[1])
                             + pai(s+nn[2])
             :            '' + pai(s+nn[0]) + pai(s+nn[1]) + pai(s+nn[2])
                             + 'm' + pai(s+nn[3]);
    }
    else if (h.match(/^[mpsz](\d)\1\1[\+\=\-]\1$/)) {
        let nn = m.match(/\d/g);
        return d == '-' ?      'k' + pai(s+nn[3]) + pai(s+nn[2]) + pai(s+nn[0])
                             + pai(s+nn[1])
             : d == '=' ? '' + pai(s+nn[0]) + 'k' + pai(s+nn[3]) + pai(s+nn[2])
                             + pai(s+nn[1])
             :            '' + pai(s+nn[0]) + pai(s+nn[1]) + 'k' + pai(s+nn[3])
                             + pai(s+nn[2]);
    }
    else if (h.match(/^[mpsz](\d)\1\1[\+\=\-]$/)) {
        let nn = m.match(/\d/g);
        return d == '-' ?      'p' + pai(s+nn[2]) + pai(s+nn[0]) + pai(s+nn[1])
             : d == '=' ? '' + pai(s+nn[0]) + 'p' + pai(s+nn[2]) + pai(s+nn[1])
             :            '' + pai(s+nn[0]) + pai(s+nn[1]) + 'p' + pai(s+nn[2]);
    }
    else {
        let nn = m.match(/\d(?=[\+\=\-])/g).concat(m.match(/\d(?![\+\=\-])/g));
        return 'c' + pai(s+nn[0]) + pai(s+nn[1]) + pai(s+nn[2]);
    }
}

function defen(hule) {
    let manguan = hule.defen / (hule.l == 0 ? 6 : 4) / 2000;
    let rv = manguan >= 4   ? '役満'
           : manguan >= 3   ? '三倍満'
           : manguan >= 2   ? '倍満'
           : manguan >= 1.5 ? '跳満'
           : manguan >= 1   ? '満貫'
           : `${hule.fu}符${hule.fanshu}飜`;
    rv += hule.baojia != null ? hule.defen + '点'
        : hule.l == 0 ? ((hule.defen / 3)|0) + '点∀'
        : (Math.ceil(hule.defen / 200) * 100 / 2) + '-'
            + (Math.floor(hule.defen / 200) * 100) + '点';
    return rv;
}

function hule(hule, player_id) {
    let rv = ['和了', [], []];
    for (let l = 0; l < 4; l++) {
        rv[1][player_id[l]] = hule.fenpei[l];
    }
    rv[2]= [ player_id[hule.l],
             player_id[hule.baojia == null ? hule.l : hule.baojia],
             0,
             defen(hule) ];
    for (let hupai of hule.hupai) {
        let name = hupai.name.replace(/^ダブル立直$/,'両立直')
                             .replace(/^翻牌 /,'役牌 ')
                             .replace(/^国士無双十三面$/,'国士無双１３面')
                 + (hule.damanguan ? '(役満)' : `(${hupai.fanshu}飜)`);
        rv[2].push(name);
    }
    return rv;
}

function pingju(pingju, player_id) {
    if (pingju.name.match(/^流局|荒牌平局|流し満貫$/)) {
        let rv = [ pingju.name.replace(/^荒牌平局$/,'流局'), [] ];
        for (let l = 0; l < 4; l++) {
            rv[1][player_id[l]] = pingju.fenpei[l];
        }
        return rv;
    }
    else {
        let name = pingju.name.replace(/^三家和$/,'三家和了')
                              .replace(/^四開槓$/,'四槓散了');
        return [ name ];
    }
}

function gamelog(log, qijia = 0) {
    let player_id = [];
    let rv = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
    for (let data of log) {
        if (data.qipai) {
            rv[0] = [ data.qipai.zhuangfeng * 4 + data.qipai.jushu,
                      data.qipai.changbang, data.qipai.lizhibang ];
            for (let l = 0; l < 4; l++) {
                player_id[l] = (qijia + data.qipai.jushu + l) % 4;
                rv[1][player_id[l]] = data.qipai.defen[l];
                rv[4 + player_id[l]*3] = qipai(data.qipai.shoupai[l]);
            }
            rv[2] = [ pai(data.qipai.baopai) ];
        }
        else if (data.zimo) {
            rv[4 + player_id[data.zimo.l]*3 + 1].push(pai(data.zimo.p));
        }
        else if (data.dapai) {
            rv[4 + player_id[data.dapai.l]* 3 + 2].push(pai(data.dapai.p));
        }
        else if (data.fulou) {
            rv[4 + player_id[data.fulou.l]*3 + 1].push(mianzi(data.fulou.m));
            if (data.fulou.m.match(/\d{4}/)) {
                rv[4 + player_id[data.fulou.l]*3 + 2].push(0);
            }
        }
        else if (data.gang) {
            rv[4 + player_id[data.gang.l]* 3 + 2].push(mianzi(data.gang.m));
        }
        else if (data.gangzimo) {
            rv[4 + player_id[data.gangzimo.l]*3 + 1].push(pai(data.gangzimo.p));
        }
        else if (data.kaigang) {
            rv[2].push(pai(data.kaigang.baopai));
        }
        else if (data.hule) {
            rv[3]  = (data.hule.fubaopai||[]).map(p => pai(p));
            rv[16] = hule(data.hule, player_id);
        }
        else if (data.pingju) {
            rv[16] = pingju(data.pingju, player_id);
        }
    }
    return rv;
}

function logconv(paipu, n, rule = {disp:'電脳麻将', aka:1}) {
    let title = paipu.title.split(/\n/).concat(['','']).slice(0,2);
    let name  = paipu.player.map(n => n.replace(/\n.*$/,''));
    name = name.splice(paipu.qijia).concat(name);
    let log = [];
    for (let i = 0; i < paipu.log.length; i++) {
        if (n != null && n != i) continue;
        log.push(gamelog(paipu.log[i]));
    }
    return { title: title, name: name, rule: rule, log: log };
}

module.exports = logconv;
