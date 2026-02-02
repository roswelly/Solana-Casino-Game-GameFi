import * as crypto from 'crypto';

import scoreData from '../scores.json';

const gameData: any = {
    easy: [16, 5, 2, 1.3, 1.2, 0.2, 1.1, 1.1, 1, 1.1, 1.1, 0.2, 1.2, 1.3, 2, 5, 16],
    medium: [110, 41, 10, 5, 2.8, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 2.8, 5, 10, 41, 110],
    diff: [1000, 130, 23, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 23, 130, 1000]
};

export const getNumber = ({
    difficulty,
    current = false
}: {
    difficulty: string;
    current?: boolean | undefined;
}) => {
    const scores = scoreData as any;
    const scoreIndex = Math.floor(Math.random() * 200) as number;

    if (current) {
        const odd = Math.min.apply(null, gameData[difficulty]);
        const target = gameData[difficulty].indexOf(odd);
        return {
            odds: odd,
            target: scores[target][scoreIndex],
        };
    } else {
        const odds = gameData[difficulty];
        const oddslist: any = [];
        for (const i in odds) {
            oddslist.push({
                target: scores[i][scoreIndex],
                pct: Math.floor((1 / (0.1 + odds[i])) * 100),
                odds: odds[i],
            });
        }
        // console.log(JSON.stringify(oddslist))
        const expanded = oddslist.flatMap((item: any) => Array(item.pct).fill(item));
        const seed = crypto.createHash('sha256').update(`${Date.now()}`).digest('hex');
        const timestamp = Date.now();
        const nonce = (Math.random() * 100000).toFixed(0);
        let resultHash = crypto
            .createHash('sha256')
            .update(seed + '_' + timestamp + '_' + nonce)
            .digest('hex');
        resultHash = resultHash.substring(0, 10);
        let result = parseInt(resultHash, 16);
        const winner = expanded[result % expanded.length];
        
        return winner;
    }
};